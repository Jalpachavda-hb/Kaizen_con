import React, { useState, useRef, useEffect } from 'react';
import './FloatingChatbot.css';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am the KaizenCon 2027 AI Assistant. How can I help you today with the scientific programme, speakers, or registration?',
      time: '10:00 AM'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages((prev) => [...prev, { sender: 'user', text: userText, time: timeStr }]);
    setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Thank you for asking! KaizenCon 2027 takes place 1–3 January 2027 at the Hyatt Regency in Ahmedabad, India. You can explore the Scientific Programme, Faculty list, and registration on this website.";
      const lower = userText.toLowerCase();

      if (lower.includes('date') || lower.includes('when')) {
        reply = "KaizenCon 2027 is scheduled from 1–3 January 2027 at the Hyatt Regency, Ahmedabad, India.";
      } else if (lower.includes('venue') || lower.includes('where') || lower.includes('location')) {
        reply = "The conference venue is the Hyatt Regency, Ashram Road, Ahmedabad, Gujarat, India.";
      } else if (lower.includes('register') || lower.includes('fee') || lower.includes('cost') || lower.includes('ticket')) {
        reply = "Registrations are open! Early-bird rates are available for surgeons, trainees, and healthcare professionals.";
      } else if (lower.includes('speaker') || lower.includes('faculty') || lower.includes('who')) {
        reply = "We have 150+ international and national faculty leading discussions on surgical robotics, AI precision models, and clinical trials.";
      } else if (lower.includes('programme') || lower.includes('schedule') || lower.includes('agenda')) {
        reply = "The 3-day programme includes Live Robotic GI Surgeries, HPB Masterclasses, Computer Vision workshops, and Hands-on Simulator labs.";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickQuestion = (question) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: question, time: timeStr }]);
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";
      if (question.includes('Programme')) {
        reply = "The programme covers Robotic GI Surgery, HPB Masterclasses, AI Surgical Models, and Hands-on Simulation labs.";
      } else if (question.includes('Venue')) {
        reply = "Hosted at the Hyatt Regency, Ashram Road, Ahmedabad, India — conveniently connected to Sardar Vallabhbhai Patel International Airport.";
      } else {
        reply = "Online delegate registration includes access to all scientific tracks, surgical video sessions, simulator hubs, and delegate kits.";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="kz-floating-chatbot-root">
      {/* Floating Circular Launcher Button */}
      <button
        type="button"
        className={`kz-floating-chatbot-btn ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI Chatbot' : 'Open KaizenCon AI Chatbot'}
        title="KaizenCon AI Assistant"
      >
        {/* Glowing aura */}
        <span className="kz-floating-btn-glow" aria-hidden="true" />

        {/* Online Status Pulse Badge */}
        <span className="kz-floating-online-badge" aria-label="Online">
          <span className="kz-floating-online-dot" />
        </span>

        {/* Icon (Swaps between AI Chatbot and Close X) */}
        <div className="kz-floating-btn-icon-wrap">
          {isOpen ? (
            <svg
              className="kz-floating-icon kz-icon-close"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              className="kz-floating-icon kz-icon-bot"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Antenna with digital beacon */}
              <line x1="12" y1="2" x2="12" y2="5" />
              <circle cx="12" cy="2" r="1.2" fill="currentColor" />
              {/* Modern robot rounded head */}
              <rect x="4" y="5" width="16" height="13" rx="5" />
              {/* Digital eyes */}
              <circle cx="9" cy="11.5" r="1.5" fill="currentColor" />
              <circle cx="15" cy="11.5" r="1.5" fill="currentColor" />
              {/* Friendly smile */}
              <path d="M9.5 15c1 .8 4 .8 5 0" strokeWidth="1.6" />
              {/* Side audio receptors */}
              <path d="M2 10.5v2" strokeWidth="2" />
              <path d="M22 10.5v2" strokeWidth="2" />
            </svg>
          )}
        </div>
      </button>

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="kz-floating-chat-modal" role="dialog" aria-label="KaizenCon AI Assistant Window">
          {/* Header in Dark Theme Gradient */}
          <div className="kz-floating-modal-header">
            <div className="kz-floating-header-info">
              <div className="kz-floating-header-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="5" />
                  <circle cx="12" cy="2" r="1.2" fill="currentColor" />
                  <rect x="4" y="5" width="16" height="13" rx="4" />
                  <circle cx="9" cy="11" r="1.5" fill="currentColor" />
                  <circle cx="15" cy="11" r="1.5" fill="currentColor" />
                  <path d="M10 15h4" />
                </svg>
              </div>
              <div className="kz-floating-header-text">
                <h4 className="kz-floating-header-title">KaizenCon AI</h4>
                <span className="kz-floating-header-sub">
                  <span className="kz-online-mini-dot" /> Conference Assistant · Online
                </span>
              </div>
            </div>

            <button
              type="button"
              className="kz-floating-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat window"
            >
              ✕
            </button>
          </div>

          {/* Conversation Feed */}
          <div className="kz-floating-modal-body">
            {messages.map((m, i) => (
              <div key={i} className={`kz-floating-msg-row kz-msg-${m.sender}`}>
                {m.sender === 'bot' && (
                  <span className="kz-bot-mini-avatar" aria-hidden="true">
                    ✦
                  </span>
                )}
                <div className="kz-floating-bubble">
                  <p className="kz-bubble-text">{m.text}</p>
                  {m.time && <span className="kz-bubble-time">{m.time}</span>}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="kz-floating-msg-row kz-msg-bot">
                <span className="kz-bot-mini-avatar">✦</span>
                <div className="kz-floating-bubble kz-typing-bubble">
                  <span className="kz-typing-dot" />
                  <span className="kz-typing-dot" />
                  <span className="kz-typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="kz-floating-quick-chips">
            <button type="button" onClick={() => handleQuickQuestion('Tell me about the Scientific Programme')}>
              📅 Programme
            </button>
            <button type="button" onClick={() => handleQuickQuestion('Where is the Venue located?')}>
              📍 Venue
            </button>
            <button type="button" onClick={() => handleQuickQuestion('How do I Register?')}>
              🎟️ Registration
            </button>
          </div>

          {/* Chat Input Bar */}
          <form className="kz-floating-modal-footer" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask about sessions, speakers, venue..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="kz-floating-input"
              autoFocus
            />
            <button
              type="submit"
              className="kz-floating-send-btn"
              disabled={!inputMsg.trim()}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
