from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from pathlib import Path

router = APIRouter()

# Define document paths
document_paths = {
    "industry-uw-guidelines.pdf": "./modules/mock-docs/industry-uw-guidelines.pdf",
    "rating-manual.pdf": "./modules/mock-docs/rating-manual.pdf",
    "rating-factors.pdf": "./modules/mock-docs/rating-factors.pdf",
    "authority-levels.pdf": "./modules/mock-docs/authority-levels.pdf",
    "coverage-limitations.pdf": "./modules/mock-docs/coverage-limitations.pdf",
    "coverage-options.pdf": "./modules/mock-docs/coverage-options.pdf",
    "commercial-lines-app-templates.pdf": "./modules/mock-docs/commercial-lines-app-templates.pdf",
    "policy-form-library.pdf": "./modules/mock-docs/policy-form-library.pdf"
}

@router.get("/{document_name}")
async def get_document(document_name: str):
    if document_name not in document_paths:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_path = document_paths[document_name]
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Document file not found")
    
    return FileResponse(file_path) 