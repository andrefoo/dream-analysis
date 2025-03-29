import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FIREWORKS_API_KEY = os.getenv("FIREWORKS_API_KEY")

