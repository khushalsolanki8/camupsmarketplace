import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, User, ChevronRight } from 'lucide-react';

const MessagesPanel = ({ activeChatId, setActiveChatId }) => {
  const { currentUser, API_BASE } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Load chat conversations lists
  const loadChats = async (silent = false) => {
    const token = localStorage.getItem('cs_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data);
        
        // Update active chat object if activeChatId is set
        if (activeChatId) {
          const current = data.find(c => c.id === activeChatId);
          if (current) {
            setActiveChat(current);
          }
        }
      }
    } catch (error) {
      console.error('Error loading chats list:', error);
    }
  };

  // Poll chats list and active chat details
  useEffect(() => {
    loadChats();

    const interval = setInterval(() => {
      loadChats(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChatId]);

  // Scroll active chat messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChatId) return;

    const token = localStorage.getItem('cs_token');
    if (!token) return;

    const textToSend = inputValue;
    setInputValue('');

    // Optimistically render message locally
    const tempMessage = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setActiveChat(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, tempMessage]
      };
    });

    try {
      const response = await fetch(`${API_BASE}/api/chats/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chatId: activeChatId, text: textToSend })
      });

      if (response.ok) {
        loadChats(true);
      }
    } catch (error) {
      console.error('Error sending peer message:', error);
    }
  };

  const handleChatSelect = (chatId) => {
    setActiveChatId(chatId);
    const selected = chats.find(c => c.id === chatId);
    if (selected) {
      setActiveChat(selected);
    }
  };

  // Sort chats by last modified date (newest first)
  const sortedChats = [...chats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <section className="messages-panel" id="messages-panel" style={{ display: 'flex' }}>
      <div className="messages-container" style={{ width: '100%' }}>
        
        {/* Chats list sidebar */}
        <div className="chats-sidebar">
          <div className="sidebar-header">
            <h3>My Conversations</h3>
          </div>
          <div className="chats-list" id="chats-list">
            {sortedChats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No active conversations.
              </div>
            ) : (
              sortedChats.map(chat => {
                const isBuyer = chat.buyerId === currentUser?.id;
                const partnerName = isBuyer ? chat.sellerName : chat.buyerName;
                const partnerAvatarColor = isBuyer ? chat.sellerAvatarColor : chat.buyerAvatarColor;
                const initials = partnerName ? partnerName.charAt(0).toUpperCase() : 'U';

                const lastMsg = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
                const lastMsgText = lastMsg ? lastMsg.text : 'No messages yet';
                const lastMsgTime = lastMsg 
                  ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div 
                    key={chat.id}
                    className={`chat-list-item ${chat.id === activeChatId ? 'active' : ''}`}
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <div className="chat-item-avatar" style={{ backgroundColor: partnerAvatarColor || '#8b5cf6' }}>
                      {initials}
                    </div>
                    <div className="chat-item-details">
                      <div className="chat-item-header">
                        <span className="chat-item-name">{partnerName}</span>
                        <span className="chat-item-time">{lastMsgTime}</span>
                      </div>
                      <div className="chat-item-listing">{chat.listingTitle}</div>
                      <div className="chat-item-snippet">{lastMsgText}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Active chat view area */}
        <div className="chat-area" id="chat-area">
          {activeChat ? (
            <>
              {/* Active Chat Header */}
              {(() => {
                const isBuyer = activeChat.buyerId === currentUser?.id;
                const partnerName = isBuyer ? activeChat.sellerName : activeChat.buyerName;
                const partnerAvatarColor = isBuyer ? activeChat.sellerAvatarColor : activeChat.buyerAvatarColor;
                const initials = partnerName ? partnerName.charAt(0).toUpperCase() : 'U';

                return (
                  <div className="chat-area-header">
                    <div className="chat-header-user">
                      <div className="chat-item-avatar" style={{ width: '34px', height: '34px', fontSize: '0.8rem', backgroundColor: partnerAvatarColor || '#8b5cf6' }}>
                        {initials}
                      </div>
                      <div>
                        <span className="chat-header-user-name">{partnerName}</span>
                        <span className="chat-header-user-status">Online</span>
                      </div>
                    </div>
                    <div className="chat-header-listing">
                      <div className="chat-header-listing-title">{activeChat.listingTitle}</div>
                      <div className="chat-header-listing-price">₹{activeChat.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Chat Messages Log */}
              <div className="chat-messages-p2p" id="chat-messages-p2p">
                {activeChat.messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser?.id;
                  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={idx} className={`message-wrapper ${isMe ? 'user' : 'bot'}`}>
                      <div className="chat-avatar-mini">{isMe ? '👤' : '💬'}</div>
                      <div className="message-content">
                        <div className="message-bubble">{msg.text}</div>
                        <span className="message-time">{time}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Active Chat Input form */}
              <div className="chat-input-p2p">
                <form className="chat-input-p2p-form" id="chat-p2p-form" onSubmit={handleSend}>
                  <input 
                    type="text" 
                    className="chat-p2p-msg-input" 
                    id="chat-p2p-msg-input" 
                    placeholder="Type a message to coordinate..." 
                    autoComplete="off"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <button type="submit" className="chat-p2p-send-btn">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="chat-placeholder">
              <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>Your Inbox</h3>
              <p>Select a conversation from the sidebar or click "Message Seller" on any marketplace listing to start chatting.</p>
            </div>
          )}
        </div>
        
      </div>
    </section>
  );
};

export default MessagesPanel;
