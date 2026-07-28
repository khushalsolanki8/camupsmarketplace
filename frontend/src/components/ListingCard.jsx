import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, MessageSquare, Sparkles } from 'lucide-react';

const ListingCard = ({ item, onMessageSeller, onRemoveListing, onOpenDetails }) => {
  const { currentUser } = useAuth();
  
  // Clean seller comparison
  const isOwner = currentUser && item.seller && (
    item.seller.includes('You') || 
    item.seller.includes('(You)') || 
    item.seller.toLowerCase() === currentUser.name.toLowerCase()
  );

  const handleCardClick = (e) => {
    // Prevent trigger if clicking on actions
    if (e.target.closest('.btn-card-action')) return;
    onOpenDetails(item);
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (isOwner) {
      onRemoveListing(item.id);
    } else {
      onMessageSeller(item);
    }
  };

  // Render Category specific placeholder SVG if no image is present
  const renderImage = () => {
    if (item.imgSrc) {
      return <img src={item.imgSrc} className="listing-img-raw" alt={item.title} />;
    }

    if (item.imgSvg) {
      // Safe injection of SVGs that are stored in the listings array
      return <div dangerouslySetInnerHTML={{ __html: item.imgSvg }} />;
    }

    // Default category fallback SVGs
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="listing-img-svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    );
  };

  const initials = item.seller ? item.seller.charAt(0).toUpperCase() : 'S';

  return (
    <div className="listing-card" style={{ cursor: 'pointer' }} onClick={handleCardClick}>
      <div className="listing-img-container">
        {renderImage()}
        <span className="listing-tag">{item.category.toUpperCase()}</span>
        {item.isAiPriced && (
          <span className="listing-badge-ai">
            <Sparkles size={10} style={{ marginRight: '2px' }} /> AI Price
          </span>
        )}
      </div>
      <div className="listing-info">
        <h3 className="listing-title">{item.title}</h3>
        <p className="listing-desc">{item.description}</p>
        <div className="listing-meta">
          <span className="listing-price">₹{item.price.toLocaleString('en-IN')}</span>
          <span className="listing-seller">
            <span className="seller-avatar" style={{ backgroundColor: item.avatarColor || '#8b5cf6' }}>
              {initials}
            </span>
            {item.seller}
          </span>
        </div>
        {isOwner ? (
          <button 
            className="btn-card-action btn-danger-action" 
            onClick={handleActionClick}
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Remove Listing
          </button>
        ) : (
          <button className="btn-card-action" onClick={handleActionClick}>
            <MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Message Seller
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
