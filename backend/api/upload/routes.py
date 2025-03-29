from fastapi import APIRouter, UploadFile, HTTPException, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from uuid import uuid4
import asyncio
from concurrent.futures import ThreadPoolExecutor
from models.Email import Email
from datetime import datetime


from config.celery import app

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    try:
        # Read file content
        contents = await file.read()

        # Check file size
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")

        # Parse JSON content
        try:
            email_data = json.loads(contents)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format")

        # Validate required fields
        if "email" not in email_data:
            raise HTTPException(status_code=400, detail="Email content missing")

        # Create Email document
        email_doc = Email(
            subject=email_data.get("name", "No Subject"),
            sender=email_data.get("sender", "unknown@example.com"),
            recipient="underwriting@insurance.com",  # Default recipient
            received_date=datetime.now(),
            body_content=email_data["email"],
            status="pending",
            processing_start_time=datetime.now()
        ).save()

        # Send task to process the email
        app.send_task("modules.processor.process_document", args=[str(email_doc.id)])

        return JSONResponse({
            "message": "Email uploaded successfully",
            "email_id": str(email_doc.id),
            "status": "processing"
        })

    except Exception as e:
        print(f"Error processing upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def root():
    return {"message": "Email Upload API"}

