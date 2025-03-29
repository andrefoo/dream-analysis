from fastapi import APIRouter

from .upload import router as upload_router
from .websockets.documents import router as documents_router

router = APIRouter()

router.include_router(upload_router, prefix="/upload")
router.include_router(documents_router, prefix="/documents")