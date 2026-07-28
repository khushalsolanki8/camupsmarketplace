import React, { useState } from 'react';
import Header from './components/Header';
import Marketplace from './components/Marketplace';
import MessagesPanel from './components/MessagesPanel';
import AuthView from './components/AuthView';
import ChatbotWidget from './components/ChatbotWidget';
import ListingDetailsModal from './components/ListingDetailsModal';
import PostListingModal from './components/PostListingModal';
import ProfileModal from './components/ProfileModal';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent = () => {
  const { currentUser, triggerToast, API_BASE } = useAuth();
  const [activeView, setActiveView] = useState('marketplace'); // 'marketplace', 'mylistings', 'messages', 'auth'
  const [activeChatId, setActiveChatId] = useState(null);
  
  // Modals state
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);

  // Initialize mock listings in state
  const [listings, setListings] = useState([
    {
      id: 1,
      title: "Thomas' Calculus (14th Edition) - Pearson",
      category: "textbooks",
      price: 950,
      description: "Slightly used calculus textbook. No highlighted pages, cover has minor wear. Essential for Math 101/102.",
      seller: "Arjun M. (Senior)",
      avatarColor: "#8b5cf6",
      isAiPriced: true,
      imgSrc: null,
      imgSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="listing-img-svg"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1h13.5v16H6.5a2.5 2.5 0 0 0-2.5 2.5z"/></svg>`
    },
    {
      id: 2,
      title: "Intro to Algorithms (CLRS) - 3rd Edition",
      category: "textbooks",
      price: 1200,
      description: "Classic CS algorithms book. Fairly clean pages. Selling because I finished the course.",
      seller: "Preeti K. (Junior)",
      avatarColor: "#ec4899",
      isAiPriced: false,
      imgSrc: null,
      imgSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="listing-img-svg"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1h13.5v16H6.5a2.5 2.5 0 0 0-2.5 2.5z"/></svg>`
    },
    {
      id: 3,
      title: "Organic Chemistry Lecture Notes (A+ Grade)",
      category: "notes",
      price: 350,
      description: "Highly detailed, color-coded notes covering full semester topics with reactions, mechanism diagrams, and exam tricks.",
      seller: "Rahul S. (Senior)",
      avatarColor: "#10b981",
      isAiPriced: true,
      imgSrc: null,
      imgSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="listing-img-svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    },
    {
      id: 4,
      title: "Concepts of Physics (Vol 1) - H.C. Verma",
      category: "textbooks",
      price: 320,
      description: "A classic physics textbook for mechanics and wave optics. Mint condition, clean pages with no pencil marks.",
      seller: "Ishaan P. (Sophomore)",
      avatarColor: "#3b82f6",
      isAiPriced: true,
      imgSrc: null,
      imgSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="listing-img-svg"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1h13.5v16H6.5a2.5 2.5 0 0 0-2.5 2.5z"/></svg>`
    },
    {
      id: 5,
      title: "Data Structures & Algorithms - Cheat Sheets",
      category: "notes",
      price: 150,
      description: "Quick-reference sheets for trees, graphs, sorting algorithms, and complexity analysis. Perfect for final revisions!",
      seller: "Kunal G. (Junior)",
      avatarColor: "#f59e0b",
      isAiPriced: true,
      imgSrc: null,
      imgSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="listing-img-svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    },
    {
      id: 6,
      title: "Database System Concepts - 7th Edition",
      category: "textbooks",
      price: 750,
      description: "Essential guide to SQL, database engines, and database design. Softcover version, minimal highlighter marks.",
      seller: "Neha R. (Senior)",
      avatarColor: "#10b981",
      isAiPriced: false,
      imgSrc: null,
      imgSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="listing-img-svg"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1h13.5v16H6.5a2.5 2.5 0 0 0-2.5 2.5z"/></svg>`
    },
    {
      id: 7,
      title: "Intro to Microeconomics - Lecture Notes",
      category: "notes",
      price: 200,
      description: "Comprehensive notes with graphs for supply/demand curves and elasticity. Clean, highly legible, scanned PDF format.",
      seller: "Ananya D. (Freshman)",
      avatarColor: "#8b5cf6",
      isAiPriced: false,
      imgSrc: null,
      imgSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="listing-img-svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    },
    {
      id: 8,
      title: "Sony WH-1000XM4 Noise Canceling Headphones",
      category: "electronics",
      price: 11000,
      description: "Excellent sound, noise cancelation works flawlessly. 1.5 years old, includes original case and AUX cable.",
      seller: "Kabir V. (Sophomore)",
      avatarColor: "#f59e0b",
      isAiPriced: false,
      imgSrc: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60",
      imgSvg: null
    },
    {
      id: 9,
      title: "Cozy Study Desk with Drawer",
      category: "housing",
      price: 1800,
      description: "Compact wooden desk, perfect for dorm rooms. In good condition, minor coffee stains on top. Drawer slides fine.",
      seller: "Simran A. (Alumni)",
      avatarColor: "#3b82f6",
      isAiPriced: true,
      imgSrc: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=60",
      imgSvg: null
    },
    {
      id: 10,
      title: "Apple iPad Air (5th Gen, 64GB) - Blue",
      category: "electronics",
      price: 32000,
      description: "M1 chip model in pristine condition. Used with screen protector since day one. Comes with apple smart folio case and original charger.",
      seller: "Rohan V. (Senior)",
      avatarColor: "#8b5cf6",
      isAiPriced: true,
      imgSrc: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60",
      imgSvg: null
    },
    {
      id: 11,
      title: "Kindle Paperwhite (11th Gen) - 16GB",
      category: "electronics",
      price: 7500,
      description: "6.8-inch display with adjustable warm light. Waterproof, battery health is great. Includes dark green fabric cover.",
      seller: "Meera J. (Junior)",
      avatarColor: "#ec4899",
      isAiPriced: false,
      imgSrc: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop&q=60",
      imgSvg: null
    },
    {
      id: 12,
      title: "Ergonomic Mesh Study Chair",
      category: "housing",
      price: 3200,
      description: "High-back study chair with lumbar support, adjustable armrests and seat height. Clean mesh fabric, rolling wheels work smoothly.",
      seller: "Amit S. (Senior)",
      avatarColor: "#10b981",
      isAiPriced: true,
      imgSrc: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60",
      imgSvg: null
    },
    {
      id: 13,
      title: "Compact Dorm Mini Fridge (45L)",
      category: "housing",
      price: 4200,
      description: "Silent single-door mini refrigerator with tiny chiller box. Extremely clean, runs fine. Perfect size for hostel/dorm rooms.",
      seller: "Pooja D. (Sophomore)",
      avatarColor: "#f59e0b",
      isAiPriced: false,
      imgSrc: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60",
      imgSvg: null
    }
  ]);

  const handleMessageSeller = async (listing) => {
    if (!currentUser) {
      triggerToast('Please sign in to message sellers.', 'warning');
      setActiveView('auth');
      return;
    }

    const token = localStorage.getItem('cs_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/chats/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: listing.id,
          listingTitle: listing.title,
          sellerName: listing.seller,
          sellerId: listing.sellerId || null,
          price: listing.price,
          avatarColor: listing.avatarColor
        })
      });

      if (response.ok) {
        const chat = await response.json();
        setActiveChatId(chat.id);
        setActiveView('messages');

        // If new chat, automatically push an intro message
        if (chat.messages.length === 0) {
          const introMsg = `Hi, is "${listing.title}" still available?`;
          await fetch(`${API_BASE}/api/chats/message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ chatId: chat.id, text: introMsg })
          });
        }
      } else {
        triggerToast('Failed to start chat with seller.', 'warning');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      triggerToast('Error connecting to server.', 'warning');
    }
  };

  const handleRemoveListing = (id) => {
    if (confirm('Are you sure you want to remove this listing?')) {
      setListings(prev => prev.filter(item => item.id !== id));
      triggerToast('Listing removed successfully.', 'success');
    }
  };

  const handleAddListing = (newListing) => {
    setListings(prev => [newListing, ...prev]);
    triggerToast('Listing added successfully!', 'success');
  };

  const handleOpenPostModal = () => {
    if (!currentUser) {
      triggerToast('Please sign in to post a listing.', 'warning');
      setActiveView('auth');
      return;
    }
    setPostModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Header 
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenPostModal={handleOpenPostModal}
        onOpenProfileModal={() => setProfileModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="main-wrapper">
        {activeView === 'marketplace' || activeView === 'mylistings' ? (
          <Marketplace 
            listings={listings}
            activeView={activeView}
            onMessageSeller={handleMessageSeller}
            onRemoveListing={handleRemoveListing}
            onOpenDetails={setDetailsItem}
          />
        ) : activeView === 'messages' ? (
          <MessagesPanel 
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
          />
        ) : activeView === 'auth' ? (
          <AuthView 
            setActiveView={setActiveView}
          />
        ) : null}
      </main>

      {/* Floating Chatbot Assistant */}
      <ChatbotWidget />

      {/* MODALS WINDOWS */}
      {detailsItem && (
        <ListingDetailsModal 
          item={detailsItem}
          onClose={() => setDetailsItem(null)}
          onMessageSeller={handleMessageSeller}
          onRemoveListing={handleRemoveListing}
        />
      )}

      {postModalOpen && (
        <PostListingModal 
          onClose={() => setPostModalOpen(false)}
          onAddListing={handleAddListing}
        />
      )}

      {profileModalOpen && (
        <ProfileModal 
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
