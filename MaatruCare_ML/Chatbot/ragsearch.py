# rag_search.py
from typing import List
from langchain_ollama import OllamaEmbeddings
from pinecone import Pinecone, ServerlessSpec
import os
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_api"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))
EMB = OllamaEmbeddings(model="nomic-embed-text:v1.5")

def get_rag_context(query: str, namespace: str = "") -> str:
    # Embed user query
    vec = EMB.embed_query(query)
    # Query Pinecone
    res = index.query(
        vector=vec,
        top_k=3,
        include_metadata=True,
        namespace=namespace,
    )
    matched_chunks: List[str] = []
    for match in res["matches"]:
        text = match["metadata"].get("text") or match["metadata"].get("chunk", "")
        if text:
            matched_chunks.append(text)
    return "\n\n".join(matched_chunks)
