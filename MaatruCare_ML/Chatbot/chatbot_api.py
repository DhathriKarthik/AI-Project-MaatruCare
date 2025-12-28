from fastapi import FastAPI
from pydantic import BaseModel
from chatbot import chat_with_mongo_history  # Your file

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    user_email: str
    chat_id: str

@app.post("/api/chat")
def chat_endpoint(data: ChatRequest):
    reply = chat_with_mongo_history(data.message, data.user_email, data.chat_id)
    return {"reply": reply}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)