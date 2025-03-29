from pymongo import MongoClient
import certifi
import time

# Replace with your connection string
uri = "mongodb://localhost:27017"

print("Attempting to connect...")
try:
    # Use a shorter timeout for testing
    client = MongoClient(
        uri
    )
    
    # Force a connection to verify it works
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"Connection failed: {e}") 