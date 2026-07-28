import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ArrowLeft, Trash2, MessageSquare, Sparkles } from 'lucide-react';

const ListingDetailsModal = ({ item, onClose, onMessageSeller, onRemoveListing }) => {
  const { currentUser } = useAuth();
  if (!item) return null;

  const isOwner = currentUser && item.seller && (
    item.seller.includes('You') || 
    item.seller.includes('(You)') || 
    item.seller.toLowerCase() === currentUser.name.toLowerCase()
  );

  const handleActionClick = (e) => {
    e.stopPropagation();
    onClose();
    if (isOwner) {
      onRemoveListing(item.id);
    } else {
      onMessageSeller(item);
    }
  };

  const renderImage = () => {
    if (item.imgSrc) {
      return <img src={item.imgSrc} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    }

    if (item.imgSvg) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: item.imgSvg }} />;
    }

    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="listing-img-svg" style={{ width: '64px', height: '64px' }}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    );
  };

  const initials = item.seller ? item.seller.charAt(0).toUpperCase() : 'S';

  return (
    <div className="modal-overlay active" id="details-modal-overlay" onClick={onClose}>
      <div className="modal-container details-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="btn-close-modal-icon" onClick={onClose} id="btn-close-details">
          <X size={18} />
        </button>

        {/* Back Link */}
        <button className="btn-details-back" onClick={onClose} id="btn-close-details-back">
          <ArrowLeft size={14} style={{ marginRight: '4px' }} />
          <span>Back to Marketplace</span>
        </button>

        {/* Product Details Split Grid */}
        <div className="details-grid">
          {/* Visual Showcase */}
          <div className="details-visual-showcase" id="details-image-container">
            {renderImage()}
          </div>

          {/* Core Info */}
          <div className="details-content-info">
            <div className="details-header-meta">
              <span className="details-category-tag" id="details-category">
                {item.category.toUpperCase()}
              </span>
              {item.isAiPriced && (
                <span className="listing-badge-ai details-ai-badge" id="details-ai-badge" style={{ display: 'inline-flex' }}>
                  <Sparkles size={10} style={{ marginRight: '2px' }} /> AI Price
                </span>
              )}
            </div>

            <h2 className="details-title" id="details-item-title">{item.title}</h2>
            <div className="details-price-box" id="details-price">
              ₹{item.price.toLocaleString('en-IN')}
            </div>

            <div className="details-section-divider"></div>

            <h4 className="details-section-title">Item Description</h4>
            <p className="details-description-text" id="details-description">{item.description}</p>

            <div className="details-section-divider"></div>

            {/* Seller info card */}
            <div className="details-seller-card">
              <div 
                className="details-seller-avatar" 
                id="details-seller-avatar" 
                style={{ backgroundColor: item.avatarColor || '#8b5cf6' }}
              >
                {initials}
              </div>
              <div className="details-seller-meta">
                <span className="seller-meta-label">Listed by Seller</span>
                <span className="seller-meta-name" id="details-seller-name">{item.seller}</span>
              </div>
            </div>

            {/* Main Action Button */}
            {isOwner ? (
              <button 
                className="btn-primary btn-danger-action" 
                onClick={handleActionClick} 
                style={{ background: '#ef4444', borderColor: '#ef4444', marginTop: '1.5rem', width: '100%' }}
                id="btn-details-message"
              >
                <Trash2 size={16} style={{ marginRight: '8px' }} /> Remove Listing
              </button>
            ) : (
              <button 
                className="btn-primary" 
                onClick={handleActionClick} 
                style={{ marginTop: '1.5rem', width: '100%' }}
                id="btn-details-message"
              >
                <MessageSquare size={16} style={{ marginRight: '8px' }} /> Message Seller
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsModal;
