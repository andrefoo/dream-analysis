import os
from modules.llm_client import LLMClient
from config.config import Config  # If you have this, otherwise use environment variables

def main():
    # Initialize the LLM client with your credentials
    # Use your actual MongoDB URI here
    mongo_uri = os.environ.get("MONGODB_URI")
    
    client = LLMClient(
        api_key=os.environ.get("FIREWORKS_API_KEY"),
        model="accounts/fireworks/models/llama-v3p3-70b-instruct",
        mongo_uri=mongo_uri,
        embedding_model="nomic-ai/nomic-embed-text-v1.5"
    )
    
    # Test different queries
    print("\n--- Testing basic insurance query ---")
    client.test_vector_search("insurance policy guidelines")
    
    print("\n--- Testing more specific query ---")
    client.test_vector_search("underwriting criteria for commercial property")
    
    print("\n--- Testing simple query ---")
    client.test_vector_search("rating factors")
    
    # If you want to try a query related to a specific document
    print("\n--- Testing document-specific query ---")
    sample_doc = client.collection.find_one()
    if sample_doc:
        doc_name = sample_doc.get('name', '')
        print(f"Testing query related to document: {doc_name}")
        # Extract first 5 words from document content to use as query
        content = sample_doc.get('content', '')
        query_words = ' '.join(content.split()[:5]) if content else "insurance"
        client.test_vector_search(query_words)

if __name__ == "__main__":
    main() 