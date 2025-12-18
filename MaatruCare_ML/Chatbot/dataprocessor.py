from pdfreader import read_pdf
from chunker import chunk_pages
from embedder import embed_chunks
from typing import List
from vectorstore import store_in_pinecone

pdf_path = "./docs/who-mca-17-10-eng.pdf"

def run():
    # Read WHO document
    pages = read_pdf(pdf_path)
    
    #Creating chunks
    chunks = chunk_pages(pages, chunk_size=900, chunk_overlap=150)
    
    #Embedding the chunks
    embedded_chunks=embed_chunks(chunks)
    
    #Storing in pinecone
    store_in_pinecone(chunks,embedded_chunks,namespace="")
    
if __name__ == "__main__":
    run()
    
