from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from chatbot import chat_with_mongo_history
from typing import Dict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    userId: str
    chat_id: str

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    print("CHAT called with:", req.dict())  # ✅ See userId in logs
    reply = chat_with_mongo_history(req.message, req.userId, req.chat_id)  # ✅ userId
    return {"reply": reply}

@app.get("/api/test")
async def test():
    return {"status": "FastAPI + MaatruCare WORKING!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
