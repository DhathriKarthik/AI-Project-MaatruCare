import React, { useState } from 'react';
import './ChatSidebar.css'; 
import { TbMessageChatbot } from "react-icons/tb";

const ChatSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am here to support you. How are you feeling right now?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
  if (input.trim() === "") return;

  // Add user message
  const userMessage = { text: input, sender: "user" };
  setMessages(prev=>[...prev, userMessage]);
  const tempInput = input;
  setInput("");

  // Call YOUR FastAPI (replace with real user email/chat_id)
  try {
    const res = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: tempInput,
        user_email: "demo@maatrucare.local",  // From auth later
        chat_id: "demo_session_1"             // From localStorage later
      })
    });
    const { reply } = await res.json();
    
    // Add real bot response
    setMessages(prev => [...prev, { text: reply, sender: "bot" }]);
  } catch (error) {
    setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting.", sender: "bot" }]);
  }
};


  return (
    <>
      {/* 1. The Launcher Button (Stays on page) */}
      {!isOpen && (
        <button className="chat-launcher-btn" onClick={toggleSidebar} >
          <TbMessageChatbot />
        </button>
      )}

      {/* 2. The Sidebar Container */}
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="sidebar-header">
          <h3>मातृCare Assistant</h3>
          <button className="close-btn" onClick={toggleSidebar}>→</button>
        </div>

        {/* Chat History */}
        <div className="sidebar-body">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="send-btn">➤</button>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default ChatSidebar;