from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pymongo import MongoClient
from datetime import datetime, timezone
import warnings
from dotenv import load_dotenv
import os

warnings.filterwarnings("ignore", category=DeprecationWarning)
load_dotenv()


# ---------- CONFIG ----------

MONGO_URI = os.getenv("MONGO_URI")  # from .env
DB_NAME = "maatrucare_chat"
MESSAGES_COLLECTION_NAME = "messages"
SUMMARIES_COLLECTION_NAME = "summaries"

# For now: one fixed chat + user; later replace with real IDs from auth / frontend
CHAT_ID = "demo_session_1"
USER_EMAIL = "demo@maatrucare.local"

BASE_SYSTEM_PROMPT = (
    """You are an emotional companion for perinatal women. Respond warmly - with empathy in 2-4 sentences with validation and support.

CRITICAL: Your ONLY knowledge comes from the conversation summary and recent messages below. 
- If summary/recent messages mention name, pregnancy week, baby name, symptoms, feelings, family, or past topics, use those facts directly.
- If user asks about prior details and NO information exists in summary/recent messages, say 'I don't recall that detail from our talks yet.'
- NEVER assume, guess, or hallucinate facts like pregnancy stage, baby names,mental health or personal details.
- NEVER say 'this is our first conversation' if summary/recent messages exist.

In case of any medical symptoms from user, DO NOT Diagnose, ask them to contact medical professional  

Conversation summary: {summary}
Recent messages: {recent_history}

For the questions asked by assistant in history, if the User has responded affirmatively, then answer the question asked by the assistant.



Respond using ONLY these facts naturally and with warmth."""
)


# ---------- SETUP LLM + MONGO ----------

client_llm = ChatOllama(model="llama3.2:1b", temperature=0)

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]
messages_col = db[MESSAGES_COLLECTION_NAME]
summaries_col = db[SUMMARIES_COLLECTION_NAME]


# ---------- DB HELPERS ----------

def save_message(chat_id: str, user_email: str, role: str, content: str):
    """Store a single message in MongoDB."""
    messages_col.insert_one(
        {
            "chat_id": chat_id,
            "user_email": user_email,
            "role": role,
            "content": content,
            "timestamp": datetime.now(timezone.utc),
        }
    )


def load_history(chat_id: str, user_email: str, limit: int = 50):
    """Load last N messages for this chat+user."""
    cursor = (
        messages_col.find({"chat_id": chat_id, "user_email": user_email})
        .sort("timestamp", 1)  # oldest -> newest
        .limit(limit)
    )
    return list(cursor)


def get_summary(chat_id: str, user_email: str) -> str:
    """Get existing rolling summary for this chat+user."""
    doc = summaries_col.find_one({"chat_id": chat_id, "user_email": user_email})
    return doc["summary"] if doc and "summary" in doc else ""


def save_summary(chat_id: str, user_email: str, summary: str):
    """Upsert rolling summary for this chat+user."""
    summaries_col.update_one(
        {"chat_id": chat_id, "user_email": user_email},
        {
            "$set": {
                "summary": summary,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )


# ---------- SUMMARY LOGIC ----------

def update_summary(chat_id: str, user_email: str, history_docs):
    """Update rolling summary using existing summary + recent messages."""
    old_summary = get_summary(chat_id, user_email)

    # Convert recent messages to a simple text transcript
    convo_text_lines = []
    for doc in history_docs:
        role = "User" if doc["role"] == "user" else "Companion"
        convo_text_lines.append(f"{role}: {doc['content']}")
    convo_text = "\n".join(convo_text_lines)

    prompt = (
        "You are a summarization assistant.\n"
        "You are given an existing summary of a conversation between "
        "a perinatal woman and an emotional support companion, plus some new dialogue.\n"
        "Update the summary to include all important details: moods, pregnancy week, medical symptoms and moods,physical pain, mental health or personal details of user such as name, age etc,"
        "key concerns, and any preferences. Keep it under 6-8 sentences.\n\n"
        f"Existing summary (may be empty):\n{old_summary}\n\n"
        f"New conversation:\n{convo_text}\n\n"
        "Updated summary:"
    )

    resp = client_llm.invoke([HumanMessage(content=prompt)])
    new_summary = resp.content.strip()
    save_summary(chat_id, user_email, new_summary)
    return new_summary


# ---------- CHAT LOGIC ----------

def chat_with_mongo_history(message: str) -> str:
    # 1) Load recent history
    history_docs = load_history(CHAT_ID, USER_EMAIL, limit=40)
    
    # 2) Update/get summary
    summary = update_summary(CHAT_ID, USER_EMAIL, history_docs)
    
    # 3) Get recent docs FIRST (before formatting)
    recent_docs = history_docs[-8:]  # last 8 messages
    
    # 4) Build ONE clean system prompt with .format()
    recent_history = "\n".join([f"{d['role'].title()}: {d['content']}" for d in recent_docs[-6:]])
    system_prompt = BASE_SYSTEM_PROMPT.format(
        summary=summary or "None", 
        recent_history=recent_history
    )
    lc_messages = [SystemMessage(content=system_prompt)]
    
    # 5) Add recent history as LangChain messages (no duplicates)
    for doc in recent_docs:
        if doc["role"] == "user":
            lc_messages.append(HumanMessage(content=doc["content"]))
        elif doc["role"] == "assistant":
            lc_messages.append(AIMessage(content=doc["content"]))
    
    # 6) Current message
    lc_messages.append(HumanMessage(content=message))
    
    # 7) Call + save
    response = client_llm.invoke(lc_messages)
    assistant_response = response.content
    save_message(CHAT_ID, USER_EMAIL, "user", message)
    save_message(CHAT_ID, USER_EMAIL, "assistant", assistant_response)
    
    return assistant_response



# ---------- CLI LOOP ----------

def main():
    print("Hey! How are you feeling today?")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() == "bye":
            print("Goodbye! Take care..")
            break

        reply = chat_with_mongo_history(user_input)
        print("AI:", reply)


if __name__ == "__main__":
    main()
