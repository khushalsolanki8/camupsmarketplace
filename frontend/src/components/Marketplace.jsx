import React, { useState } from 'react';
import ListingCard from './ListingCard';
import { Search, PackageOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Marketplace = ({ listings, activeView, onMessageSeller, onRemoveListing, onOpenDetails }) => {
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const filterCategories = [
    { id: 'all', name: 'All Items' },
    { id: 'textbooks', name: 'Textbooks' },
    { id: 'notes', name: 'Study Notes' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'housing', name: 'Housing' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  // Filter listings based on category, search term, and view (Marketplace vs My Listings)
  const filteredListings = listings.filter(item => {
    const isMyListing = activeView === 'mylistings';
    
    // Check ownership
    const isOwner = currentUser && item.seller && (
      item.seller.includes('You') || 
      item.seller.includes('(You)') || 
      item.seller.toLowerCase() === currentUser.name.toLowerCase()
    );

    if (isMyListing) {
      return isOwner;
    }

    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="demo-panel">
      {/* Hero Showcase (only in marketplace view) */}
      {activeView === 'marketplace' && (
        <div className="hero-section">
          <h1 className="hero-title">Buy, Sell & Trade on Campus, <span>Smarter.</span></h1>
          <p className="hero-subtitle">
            The student-to-student marketplace powered by AI helper bots, smart listings pricing, and .edu email verification.
          </p>
        </div>
      )}

      {/* Controls (Search + Filters - only in marketplace view) */}
      {activeView === 'marketplace' && (
        <div className="marketplace-controls">
          <form className="search-bar-container" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search textbooks, notes, electronics, housing..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <Search size={20} />
            </button>
          </form>
          
          <div className="filter-pills">
            {filterCategories.map(cat => (
              <button 
                key={cat.id}
                className={`filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Listings Grid */}
      <div className="listings-grid" id="listings-container" style={{ marginTop: activeView === 'mylistings' ? '2rem' : '0' }}>
        {filteredListings.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface-glass)', border: '1px solid var(--surface-glass-border)', borderRadius: 'var(--radius-md)' }}>
            <PackageOpen size={48} style={{ marginBottom: '0.5rem', opacity: '0.5' }} />
            <p>
              {activeView === 'mylistings' 
                ? 'You haven\'t posted any listings yet. Click "Post Listing" to start!' 
                : 'No listings found. Try adjusting your search term.'}
            </p>
          </div>
        ) : (
          filteredListings.map(item => (
            <ListingCard 
              key={item.id}
              item={item}
              onMessageSeller={onMessageSeller}
              onRemoveListing={onRemoveListing}
              onOpenDetails={onOpenDetails}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default Marketplace;
