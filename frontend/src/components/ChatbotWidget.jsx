import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

const ChatbotWidget = () => {
  const { API_BASE } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you navigate the marketplace? I can help search items, suggest pricing, or details campus exchange guidelines.", sender: 'bot', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "Calculus textbook",
    "H.C. Verma physics",
    "DSA notes",
    "safest meeting spots"
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setTyping(true);

    try {
      // Create history array formatted for Express API
      const historyPayload = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      // Call root Express Chat API
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { text: data.reply, sender: 'bot', timestamp: new Date() }]);
      } else {
        throw new Error('API failed');
      }
    } catch (error) {
      console.warn('API error, falling back to simulated bot replies:', error);
      // Simulated response fallback
      setTimeout(() => {
        const reply = getSimulatedBotResponse(text);
        setMessages(prev => [...prev, { text: reply, sender: 'bot', timestamp: new Date() }]);
      }, 1200);
    } finally {
      setTyping(false);
    }
  };

  const getSimulatedBotResponse = (userMsg) => {
    const msg = userMsg.toLowerCase();
    
    if (msg.includes('calculus') || msg.includes('thomas')) {
      return `Yes! Arjun M. (Senior) is selling <strong>Thomas' Calculus (14th Edition)</strong> for <strong>₹950</strong>. It is one of our best deals under <strong>Textbooks</strong> right now (rated Excellent Condition with no highlights).<br><br>Would you like me to draft a message to Arjun asking if he's willing to meet at the library for a deal?`;
    }
    
    if (msg.includes('physics') || msg.includes('verma') || msg.includes('hc') || msg.includes('h.c.')) {
      return `Yes! Ishaan P. (Sophomore) is selling <strong>Concepts of Physics (Vol 1) - H.C. Verma</strong> for <strong>₹320</strong>. It's in mint condition with clean pages.<br><br>Would you like me to connect you with Ishaan to meet up at the Students Center?`;
    }

    if (msg.includes('dsa') || msg.includes('data structures') || msg.includes('cheat sheet') || msg.includes('kunal')) {
      return `Kunal G. (Junior) listed a set of <strong>Data Structures & Algorithms - Cheat Sheets</strong> for <strong>₹150</strong>. It's perfect for final exams and covers trees, graphs, and sorting.<br><br>Would you like me to draft a message asking Kunal if the cheat sheet is available in PDF format?`;
    }

    if (msg.includes('database') || msg.includes('dbms') || msg.includes('sql') || msg.includes('neha') || msg.includes('concepts')) {
      return `Neha R. (Senior) is selling the <strong>Database System Concepts - 7th Edition</strong> textbook for <strong>₹750</strong>. It's a key resource for CS courses. Slightly highlighted but very clean.<br><br>Would you like to draft an offer to Neha?`;
    }

    if (msg.includes('economics') || msg.includes('micro') || msg.includes('ananya')) {
      return `Ananya D. (Freshman) has high-quality <strong>Intro to Microeconomics - Lecture Notes</strong> in PDF scan format for <strong>₹200</strong>.<br><br>Would you like me to ask Ananya if she can send the link after payment?`;
    }
    
    if (msg.includes('chem') || msg.includes('organic chemistry') || msg.includes('price') || msg.includes('charge')) {
      return `For A+ grade study notes, the typical selling price ranges from <strong>₹250 to ₹450</strong> on our campus. Since organic chemistry notes are highly visual and complex, pricing them at <strong>₹350</strong> (like Rahul's listing) is optimal.<br><br>💡 <strong>Tip:</strong> If you upload your notes in the "Post Listing" wizard, our AI vision estimator can scan your notes' structure and suggest an exact fair market value automatically!`;
    }
    
    if (msg.includes('safest') || msg.includes('safety') || msg.includes('meet') || msg.includes('transaction')) {
      return `🛡️ <strong>CampusSwap Safety Guidelines:</strong><br>
      1. <strong>Meeting Spot:</strong> Always meet in public, well-lit spaces. We recommend the <strong>Central Library Lobby</strong> or the <strong>Student Center Food Court</strong>.<br>
      2. <strong>Timing:</strong> Do exchanges during daylight hours.<br>
      3. <strong>Payment:</strong> Inspect the item thoroughly <em>before</em> sending money. Use campus-secure options or cash. Never pay beforehand.<br>
      4. <strong>Scam Warning:</strong> Flag any seller who asks to ship the item or requests deposit payments.`;
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return `Hello! How can I help you navigate the marketplace? I can help search items, suggest pricing, or details campus exchange guidelines.`;
    }

    return `I can help you buy or sell items on CampusSwap! Try asking about <em>"Calculus textbook"</em>, <em>"H.C. Verma physics"</em>, <em>"DSA notes"</em>, or where the <em>"safest meeting spots"</em> are.`;
  };

  return (
    <div className="chatbot-fab-container">
      {/* Floating Toggle Button */}
      <button 
        className={`chatbot-fab ${isOpen ? 'active' : ''}`} 
        onClick={handleToggle}
        id="chatbot-toggle"
      >
        {isOpen ? (
          <X size={24} id="chatbot-icon" />
        ) : (
          <div style={{ position: 'relative' }}>
            <MessageSquare size={24} id="chatbot-icon" />
            {hasNewMessage && <span className="chatbot-badge" id="chatbot-badge"></span>}
          </div>
        )}
      </button>

      {/* Chat Window Widget */}
      <div className={`chat-window ${isOpen ? 'active' : ''}`} id="chat-drawer">
        
        {/* Drawer Header */}
        <div className="chat-header">
          <div className="chat-bot-info">
            <div className="chat-avatar-mini" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>🤖</div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>UniBot assistant</h4>
              <span className="bot-status" style={{ fontSize: '0.7rem', opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                <Sparkles size={10} style={{ color: 'var(--primary)', marginRight: '2px' }} /> Powered by Claude AI
              </span>
            </div>
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)} id="btn-close-chat" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Messages Content Panel */}
        <div className="chat-messages" id="chat-messages-box" style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, idx) => {
            const timeStr = m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={idx} className={`message-wrapper ${m.sender}`} style={{ display: 'flex', gap: '0.5rem', alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className="chat-avatar-mini">{m.sender === 'bot' ? '🤖' : '👤'}</div>
                <div className="message-content" style={{ maxWidth: '80%' }}>
                  <div 
                    className="message-bubble" 
                    dangerouslySetInnerHTML={{ __html: m.text }}
                  ></div>
                  <span className="message-time" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block', textAlign: m.sender === 'user' ? 'right' : 'left' }}>{timeStr}</span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typing && (
            <div className="message-wrapper bot" id="chat-typing-indicator" style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
              <div className="chat-avatar-mini">🤖</div>
              <div className="message-content">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="suggestions-container" id="chat-suggestions">
          {suggestions.map((sug, idx) => (
            <button 
              key={idx}
              className="suggestion-chip"
              onClick={() => handleSend(sug)}
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Chat input form */}
        <div className="chat-input-container">
          <form 
            className="chat-input-form" 
            id="chat-input-form" 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
          >
            <input 
              type="text" 
              className="chat-msg-input" 
              placeholder="Ask UniBot something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              id="chat-msg-input"
              autoComplete="off"
            />
            <button type="submit" className="chat-send-btn">
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChatbotWidget;
