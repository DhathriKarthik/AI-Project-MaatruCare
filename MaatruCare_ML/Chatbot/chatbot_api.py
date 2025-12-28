from fastapi import FastAPI
from pydantic import BaseModel
from chatbot import chat_with_mongo_history  # Your file
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],  # ✅ Vite + CRA
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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