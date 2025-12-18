from typing import List

def chunk_pages(pages: List[str], chunk_size: int = 900, chunk_overlap: int = 150) -> List[str]:
    chunks: List[str] = []
    
    full_text = " ".join(pages)
    text_length = len(full_text)
    
    if text_length == 0:
        return chunks
    start = 0
    while start < text_length:
        # Calculating end pos 
        end = min(start+chunk_size,text_length)
        
        # Extract chunk
        chunk = full_text[start:end].strip()
        
        # Append chunks
        if chunk:
            chunks.append(chunk)
        
        # If end is already reached, break
        if end >=text_length:
            break
        
        # Calculate next starting point with overlap
        start = end - chunk_overlap
    return chunks