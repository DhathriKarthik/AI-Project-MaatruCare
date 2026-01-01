from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pymongo import MongoClient
from datetime import datetime, timezone
import warnings
from dotenv import load_dotenv
from ragsearch import get_rag_context
import os

warnings.filterwarnings("ignore", category=DeprecationWarning)
load_dotenv()


# ---------- CONFIG ----------

MONGO_URI = os.getenv("MONGO_URI") 
DB_NAME = "MaatruCare"
MESSAGES_COLLECTION_NAME = "maatrucare_chat_messages"
SUMMARIES_COLLECTION_NAME = "maatrucare_chat_summaries"


BASE_SYSTEM_PROMPT = (
    """You are a warm emotional companion for perinatal women. Respond in 2-3 sentences with empathy and validation.

CRITICAL: Use ONLY {summary} and {recent_history}. NEVER assume pregnancy stage, age, postpartum status, baby details, or symptoms.

If a user with no previous conversational history expresses any medical symptom or physical discomfort, respond with warmth by asking what is their pregnancy/postpartum stage and then answer accordingly. DO NOT HALLUCINATE.

{summary}
{recent_history}

For medical symptoms: validate + "Please consult a medical professional."""
)


# ---------- SETUP LLM + MONGO ----------

client_llm = ChatOllama(model="llama3.1:8b-instruct-q4_K_S", temperature=0.0)

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]
messages_col = db[MESSAGES_COLLECTION_NAME]
summaries_col = db[SUMMARIES_COLLECTION_NAME]


# ---------- DB HELPERS ----------

def save_message(chat_id: str, user_id: str, role: str, content: str):
    """Store a single message in MongoDB."""
    messages_col.insert_one(
        {
            "chat_id": chat_id,
            "user_id": user_id,
            "role": role,
            "content": content,
            "timestamp": datetime.now(timezone.utc),
        }
    )


def load_history(chat_id: str, user_id: str, limit: int = 50):
    """Load last N messages for this chat+user."""
    cursor = (
        messages_col.find({"chat_id": chat_id, "user_id": user_id})
        .sort("timestamp", 1)  # oldest -> newest
        .limit(limit)
    )
    return list(cursor)


def get_summary(chat_id: str, user_id: str) -> str:
    """Get existing rolling summary for this chat+user."""
    doc = summaries_col.find_one({"chat_id": chat_id, "user_id": user_id})
    return doc["summary"] if doc and "summary" in doc else ""


def save_summary(chat_id: str, user_id: str, summary: str):
    """Upsert rolling summary for this chat+user."""
    summaries_col.update_one(
        {"chat_id": chat_id, "user_id": user_id},
        {
            "$set": {
                "summary": summary,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )


# ---------- SUMMARY LOGIC ----------

def update_summary(chat_id: str, user_id: str, history_docs):
    """Update rolling summary using existing summary + recent messages."""
    old_summary = get_summary(chat_id, user_id)

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
        "Update the summary to include all important details: moods, pregnancy week,  medical symptoms and moods,physical pain, mental health, personal details of user such as name, age etc,"
        "key concerns, and any preferences. Keep it under 6-8 sentences.\n\n"
        "ONLY summarize the content in conversation. NEVER EVER make assumptions."
        f"Existing summary (may be empty):\n{old_summary}\n\n"
        f"New conversation:\n{convo_text}\n\n"
        "Updated summary:"
    )

    resp = client_llm.invoke([HumanMessage(content=prompt)])
    new_summary = resp.content.strip()
    save_summary(chat_id, user_id, new_summary)
    return new_summary


# ---------- CHAT LOGIC ----------

def chat_with_mongo_history(message: str, user_id: str, chat_id: str) -> str:
    # 1) Load recent history
    history_docs = load_history(chat_id, user_id, limit=40)
    
    # 2) Update/get summary
    summary = update_summary(chat_id, user_id, history_docs)
    
    # 3) Get recent docs FIRST (before formatting)
    recent_docs = history_docs[-8:]  # last 8 messages
    
    # 4) Build ONE clean system prompt with .format()
    recent_history = "\n".join([f"{d['role'].title()}: {d['content']}" for d in recent_docs[-6:]])
    
    # 5) Get RAG context
    rag_context = get_rag_context(message, namespace="")
    
    # 6) Build system prompt with RAG
    system_prompt = BASE_SYSTEM_PROMPT.format(
        summary=summary , 
        recent_history=recent_history
    )
    if rag_context:
        system_prompt += f"""WHO GUIDELINES EVIDENCE\n{rag_context}.
        Use this evidence to inform your response (INFORMATION ONLY. NO DIAGNOSIS)."""
    
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
    save_message(chat_id, user_id, "user", message)
    save_message(chat_id, user_id, "assistant", assistant_response)
    
    return assistant_response



