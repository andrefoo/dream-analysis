from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import asyncio
from models.Email import Email
import pymongo
import math
from api.websockets import email_details

router = APIRouter()

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Helper function to format email data for the frontend
def format_email_data(email: Dict[str, Any]) -> Dict[str, Any]:
    # Convert MongoDB ObjectId to string and use last 8 characters
    full_id = str(email.id) if hasattr(email, 'id') else str(email.get("_id", ""))
    email_id = full_id[-8:] if len(full_id) >= 8 else full_id
    
    # Format dates
    received_date = email.received_date if hasattr(email, 'received_date') else email.get("received_date", "")
    if isinstance(received_date, datetime):
        received_date = received_date.isoformat()
    elif isinstance(received_date, dict) and "$date" in received_date:
        received_date = received_date["$date"]
    elif isinstance(received_date, list):  # Handle case where received_date is a list
        received_date = str(received_date)
    
    processing_start = email.processing_start_time if hasattr(email, 'processing_start_time') else email.get("processing_start_time", "")
    if isinstance(processing_start, datetime):
        processing_start = processing_start.isoformat()
    elif isinstance(processing_start, dict) and "$date" in processing_start:
        processing_start = processing_start["$date"]
    elif isinstance(processing_start, list):  # Handle case where processing_start is a list
        processing_start = str(processing_start)
    
    processing_end = email.processing_end_time if hasattr(email, 'processing_end_time') else email.get("processing_end_time", "")
    if isinstance(processing_end, datetime):
        processing_end = processing_end.isoformat()
    elif isinstance(processing_end, dict) and "$date" in processing_end:
        processing_end = processing_end["$date"]
    elif isinstance(processing_end, list):  # Handle case where processing_end is a list
        processing_end = str(processing_end)
    
    # Calculate processing time
    processing_time = email.processing_time_ms if hasattr(email, 'processing_time_ms') else email.get("processing_time_ms", 0)
    if processing_time:
        # Ensure processing_time is a number
        if isinstance(processing_time, (list, dict)):
            processing_time = 0
        processing_time = f"{processing_time/1000:.2f}s"
    
    # Handle both document and dictionary access
    def get_attr(obj, attr, default=""):
        if hasattr(obj, attr):
            return getattr(obj, attr, default)
        elif isinstance(obj, dict):
            return obj.get(attr, default)
        return default
    
    return {
        "id": full_id,  # Keep the full ID for database operations
        "display_id": email_id,  # Add the shortened display ID
        "client_name": get_attr(email, "client_name", "Unknown"),
        "subject": get_attr(email, "subject", "No Subject"),
        "received_date": received_date,
        "status": get_attr(email, "status", "pending"),
        "current_step": get_attr(email, "current_step", ""),
        "processing_time": processing_time,
        "industry": get_attr(email, "industry", ""),
        "bic_code": get_attr(email, "bic_code", ""),
        "estimated_revenue": get_attr(email, "estimated_annual_revenue", 0),
        "base_premium": get_attr(email, "base_premium", 0),
        "final_premium": get_attr(email, "final_premium", 0),
        "risk_level": get_attr(email, "risk_level", ""),
        "authority_check": get_attr(email, "authority_check", ""),
        "referral_required": get_attr(email, "referral_required", False),
        "seen": get_attr(email, "seen", False)
    }

@router.websocket("/ws/emails")
async def websocket_endpoint(
    websocket: WebSocket,
    page: int = Query(1),
    page_size: int = Query(10),
    live_mode: bool = Query(True)
):
    await manager.connect(websocket)
    try:
        # Initial data load
        await send_paginated_data(websocket, page, page_size, live_mode)
        
        # Start background task to periodically update data
        update_task = asyncio.create_task(periodic_updates(websocket, page, page_size, live_mode))
        
        # Listen for client messages (pagination requests, etc.)
        while True:
            data = await websocket.receive_text()
            request = json.loads(data)
            
            if request.get("type") == "pagination":
                page = request.get("page", 1)
                page_size = request.get("page_size", 10)
                await send_paginated_data(websocket, page, page_size, live_mode)
            
            elif request.get("type") == "mark_seen":
                email_id = request.get("email_id")
                if email_id:
                    # Update the email as seen in the database
                    email = Email.find_by_id(email_id)
                    if email:
                        email.seen = True
                        email.save()
                    # Send updated data
                    await send_paginated_data(websocket, page, page_size, live_mode)
            
            elif request.get("type") == "toggle_live_mode":
                live_mode = request.get("live_mode", True)
                # Reset to first page when enabling live mode
                if live_mode:
                    page = 1
                await send_paginated_data(websocket, page, page_size, live_mode)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Cancel the update task when the client disconnects
        update_task.cancel()
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def send_paginated_data(websocket: WebSocket, page: int, page_size: int, live_mode: bool = True):
    try:
        # Get total count for pagination
        total_count = Email.count()
        total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1
        
        # Get paginated emails - using synchronous methods
        # If in live mode, always sort by newest first
        if live_mode:
            # Fix: Pass a string to order_by, not a list
            emails = Email.find(page=page, per_page=page_size).order_by("-received_date")
        else:
            emails = Email.find(page=page, per_page=page_size)
        
        # Format data for frontend
        formatted_emails = []
        for email in emails:
            try:
                formatted_email = format_email_data(email)
                formatted_emails.append(formatted_email)
            except Exception as e:
                print(f"Error formatting email: {e}")
                import traceback
                traceback.print_exc()  # Print the full stack trace
        
        # Send data with pagination info
        await websocket.send_json({
            "type": "data_update",
            "data": formatted_emails,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "total_count": total_count
            },
            "live_mode": live_mode
        })
    except Exception as e:
        print(f"Error sending paginated data: {e}")
        import traceback
        traceback.print_exc()  # Print the full stack trace
        # Send empty data with error message
        await websocket.send_json({
            "type": "data_update",
            "data": [],
            "pagination": {
                "page": 1,
                "page_size": page_size,
                "total_pages": 1,
                "total_count": 0
            },
            "live_mode": live_mode,
            "error": str(e)
        })

async def periodic_updates(websocket: WebSocket, page: int, page_size: int, live_mode: bool = True):
    """Periodically send updated data to the client"""
    while True:
        await asyncio.sleep(5)  # Update every 5 seconds
        try:
            await send_paginated_data(websocket, page, page_size, live_mode)
        except Exception as e:
            print(f"Error in periodic update: {e}")
            break

# Include the email details router
router.include_router(email_details.router)
