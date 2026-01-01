import React, { useState, useEffect } from 'react';
import './ChatSidebar.css'; 
import { TbMessageChatbot } from "react-icons/tb";


const ChatSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('maatrucare_chat');
    const initial = saved ? JSON.parse(saved) : 
      [{ text: "Hello! I am here to support you. How are you feeling right now?", sender: "bot" }];
    return initial;
  });
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);  // ✅ TOP LEVEL STATE!


  // ✅ FIX #1: Clear + Load chat when token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // No login = Demo chat
      sessionStorage.removeItem('maatrucare_chat');
      setMessages([{ text: "Hello! I am here to support you.", sender: "bot" }]);
      setChatId(null);  // Reset chatId for demo
      return;
    }
    
    // New login = Fresh chat (don't load old sessionStorage)
    sessionStorage.removeItem('maatrucare_chat');
    setMessages([{ text: "Hello! I am here to support you.", sender: "bot" }]);
    setChatId(null);  // Reset for new login - will recreate permanent chatId
    console.log("New login detected - fresh chat");
  }, []);

  // ✅ FIX #2: Save to sessionStorage (session only)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && messages.length > 1) {
      sessionStorage.setItem('maatrucare_chat', JSON.stringify(messages));
    }
  }, [messages]);


  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };


  const handleSend = async () => {
    if (input.trim() === "") return;

    // Add user message
    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    const tempInput = input;
    setInput("");

    const token = localStorage.getItem('token');
    if (!token) {
      setMessages(prev => [...prev, { text: "Please login first.", sender: "bot" }]);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      if (!userId) throw new Error('No email in token');
      
      // ✅ PERMANENT MEMORY ACROSS LOGINS!
      const sessionChatId = chatId || `${userId}_session_001`;  // Static suffix!
      if (!chatId) setChatId(sessionChatId);  // Set ONCE per session

      console.log("Sending:", { message: tempInput, userId, chatId: sessionChatId });

      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: tempInput,
          userId: userId,
          chat_id: sessionChatId  // ✅ SAME chat_id FOREVER!
        })
      });
      
      if (!res.ok) {
        console.error("API Error:", res.status, await res.text());
        throw new Error('API error');
      }
      
      const { reply } = await res.json();
      setMessages(prev => [...prev, { text: reply, sender: "bot" }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting.", sender: "bot" }]);
    }
  };


  return (
    <>
      {/* 1. The Launcher Button (Stays on page) */}
      {!isOpen && (
        <button className="chat-launcher-btn" onClick={toggleSidebar}>
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