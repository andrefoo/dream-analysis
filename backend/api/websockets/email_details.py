from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict, Any, Optional
import json
import asyncio
from models.Email import Email
from modules.processor import (
    extract_email_info, determine_industry_code, determine_base_rate,
    estimate_revenue, calculate_base_premium, apply_premium_modifiers,
    check_authority, determine_coverage_details, assess_risk,
    generate_response_email
)

router = APIRouter()

# Store active connections for each email
class EmailDetailConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, email_id: str, websocket: WebSocket):
        await websocket.accept()
        if email_id not in self.active_connections:
            self.active_connections[email_id] = []
        self.active_connections[email_id].append(websocket)

    def disconnect(self, email_id: str, websocket: WebSocket):
        if email_id in self.active_connections:
            if websocket in self.active_connections[email_id]:
                self.active_connections[email_id].remove(websocket)
            if not self.active_connections[email_id]:
                del self.active_connections[email_id]

    async def broadcast_to_email(self, email_id: str, message: str):
        if email_id in self.active_connections:
            for connection in self.active_connections[email_id]:
                await connection.send_text(message)

email_manager = EmailDetailConnectionManager()

# Step to task mapping
step_to_task = {
    'email_extraction': extract_email_info,
    'industry_code': determine_industry_code,
    'base_rate': determine_base_rate,
    'revenue_estimation': estimate_revenue,
    'base_premium': calculate_base_premium,
    'premium_modifiers': apply_premium_modifiers,
    'authority_check': check_authority,
    'coverage_details': determine_coverage_details,
    'risk_assessment': assess_risk,
    'response_email': generate_response_email
}

# Get the next step in the processing pipeline
def get_next_step(current_step: str) -> Optional[str]:
    steps = list(step_to_task.keys())
    try:
        current_index = steps.index(current_step)
        if current_index < len(steps) - 1:
            return steps[current_index + 1]
    except ValueError:
        pass
    return None

@router.websocket("/ws/email/{email_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    email_id: str
):
    await email_manager.connect(email_id, websocket)
    try:
        # Send initial email data
        email = Email.find_by_id(email_id)
        if email:
            await websocket.send_json({
                "type": "email_detail",
                "data": email.to_dict()
            })
        
        # Start background task to periodically update data
        update_task = asyncio.create_task(periodic_updates(email_id, websocket))
        
        # Listen for client messages
        while True:
            data = await websocket.receive_text()
            request = json.loads(data)
            
            if request.get("type") == "get_email_detail":
                email = Email.find_by_id(email_id)
                if email:
                    await websocket.send_json({
                        "type": "email_detail",
                        "data": email.to_dict()
                    })
            
            elif request.get("type") == "update_step_output":
                step = request.get("step")
                output_field = request.get("output_field")
                output_value = request.get("output_value")
                
                if step and output_field and output_value is not None:
                    # Update the email document
                    email = Email.find_by_id(email_id)
                    if email:
                        setattr(email, output_field, output_value)
                        email.save()
                        
                        # Send updated data
                        await websocket.send_json({
                            "type": "email_detail",
                            "data": email.to_dict()
                        })
            
            elif request.get("type") == "rerun_from_step":
                step = request.get("step")
                if step and step in step_to_task:
                    # Set processing status
                    email = Email.find_by_id(email_id)
                    if email:
                        email.status = "processing"
                        email.current_step = step
                        email.save()
                        
                        # Send processing update
                        await websocket.send_json({
                            "type": "processing_update",
                            "processing": True
                        })
                        
                        # Start the reprocessing in a background task
                        asyncio.create_task(rerun_processing(email_id, step))
            
    except WebSocketDisconnect:
        email_manager.disconnect(email_id, websocket)
        # Cancel the update task when the client disconnects
        update_task.cancel()
    except Exception as e:
        print(f"WebSocket error: {e}")
        email_manager.disconnect(email_id, websocket)

async def periodic_updates(email_id: str, websocket: WebSocket):
    """Periodically send updated email data to the client"""
    while True:
        await asyncio.sleep(2)  # Update every 2 seconds
        try:
            email = Email.find_by_id(email_id)
            if email:
                await websocket.send_json({
                    "type": "email_detail",
                    "data": email.to_dict()
                })
        except Exception as e:
            print(f"Error in periodic update: {e}")
            break

async def rerun_processing(email_id: str, start_step: str):
    """Rerun the processing pipeline from the specified step"""
    try:
        # Get the task for the starting step
        task = step_to_task.get(start_step)
        if not task:
            raise ValueError(f"Invalid step: {start_step}")
        
        # Run the task
        task.delay(email_id)
        
        # Wait for the task to complete or move to the next step
        while True:
            await asyncio.sleep(1)
            email = Email.find_by_id(email_id)
            if not email:
                break
                
            # Check if processing has moved to the next step or completed
            if email.status != "processing" or email.current_step != start_step:
                # If there's a next step, we don't need to manually trigger it
                # as the Celery task chain will handle it
                break
        
        # Send processing complete update
        await email_manager.broadcast_to_email(email_id, json.dumps({
            "type": "processing_update",
            "processing": False
        }))
        
    except Exception as e:
        error_message = str(e)
        print(f"Error rerunning processing: {error_message}")
        
        # Send error update
        await email_manager.broadcast_to_email(email_id, json.dumps({
            "type": "processing_update",
            "processing": False,
            "error": error_message
        }))
        
        # Update email status to failed
        try:
            email = Email.find_by_id(email_id)
            if email:
                email.status = "failed"
                email.error_message = error_message
                email.save()
        except Exception as update_error:
            print(f"Error updating email status: {update_error}")
