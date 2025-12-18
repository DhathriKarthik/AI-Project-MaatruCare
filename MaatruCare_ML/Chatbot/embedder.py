from langchain_ollama import OllamaEmbeddings
from dotenv import load_dotenv
from typing import List

load_dotenv()

EMBEDDING_MODEL = OllamaEmbeddings(model="nomic-embed-text:v1.5")

def embed_chunks(chunks: List[str]) -> List[List[float]]:
    # One call for all chunks (more efficient)
    vectors = EMBEDDING_MODEL.embed_documents(chunks)
    return vectors
