import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Loader2, Upload, AlertCircle } from 'lucide-react';

const PostListingModal = ({ onClose, onAddListing }) => {
  const { currentUser, triggerToast, API_BASE } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('textbooks');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAiAutofill = async () => {
    setProcessing(true);
    triggerToast('Analyzing listing with Claude AI...', 'success');

    if (imageFile) {
      // 1. If user uploaded a real image, use FileReader to get Base64 and query Claude Vision
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const mediaType = imageFile.type;

          const response = await fetch(`${API_BASE}/api/autofill`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageBase64: base64Data,
              mediaType: mediaType,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setTitle(data.title || '');
            setCategory(data.category || 'textbooks');
            setDescription(data.description || '');
            setPrice(data.suggested_price_inr?.toString() || '');
            triggerToast('AI Autofill complete!', 'success');
          } else {
            console.warn('API Vision response failed, running simulation fallback');
            runSimulationFallback();
          }
        } catch (err) {
          console.error('Claude Vision API error:', err);
          runSimulationFallback();
        } finally {
          setProcessing(false);
        }
      };
      reader.readAsDataURL(imageFile);
    } else {
      // 2. Fallback simulation (same as legacy app.js)
      setTimeout(() => {
        runSimulationFallback();
        setProcessing(false);
      }, 1800);
    }
  };

  const runSimulationFallback = () => {
    if (imageFile) {
      const fileName = imageFile.name.toLowerCase();
      if (fileName.includes('book') || fileName.includes('physics') || fileName.includes('math')) {
        setTitle("University Physics - Volume 1 (15th Edition)");
        setCategory("textbooks");
        setDescription("Recommended physics textbook. Great condition, softcover edition. Minimal highlighting on structural pages, covers mechanics and thermodynamics.");
        setPrice("850");
      } else if (fileName.includes('note') || fileName.includes('pdf') || fileName.includes('chem')) {
        setTitle("Discrete Mathematics Study Guide");
        setCategory("notes");
        setDescription("A+ level hand-drawn and digital study guide for CS midterm prep. Contains visual tables, proofs, and sequence definitions.");
        setPrice("250");
      } else {
        setTitle("Ergonomic Office Swivel Chair");
        setCategory("housing");
        setDescription("Extremely comfortable study chair. Adjustable height and armrests. Mesh back supports airflow.");
        setPrice("2400");
      }
    } else {
      setTitle("iPad Pro 11-inch (M1, 128GB) Wi-Fi");
      setCategory("electronics");
      setDescription("Space Gray iPad Pro in pristine condition. Used solely for note-taking in college. Comes with pre-applied tempered glass protector and original box/charger. Battery health is 92%.");
      setPrice("38500");
    }
    triggerToast('AI Autofill loaded (Simulation fallback)', 'success');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !price || !description) {
      triggerToast('Please fill out all required fields.', 'warning');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      triggerToast('Please enter a valid price.', 'warning');
      return;
    }

    // Construct SVG mock or use image preview
    const svgMock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="listing-img-svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;

    const newListing = {
      id: Date.now(), // Generate semi-unique ID
      title,
      category,
      price: parsedPrice,
      description,
      seller: currentUser ? `${currentUser.name} (You)` : 'You (Me)',
      avatarColor: currentUser ? currentUser.avatarColor : '#ec4899',
      isAiPriced: true,
      imgSrc: imagePreview || null,
      imgSvg: imagePreview ? null : svgMock,
    };

    onAddListing(newListing);
    onClose();
  };

  return (
    <div className="modal-overlay active" id="post-modal-overlay">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="header-icon-circle">
              <Sparkles size={16} color="var(--primary)" />
            </div>
            <h3>Post a New Listing</h3>
          </div>
          <button className="btn-close-modal-icon" onClick={onClose} id="btn-close-modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form id="post-listing-form" onSubmit={handleSubmit} style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 150px)', padding: '1.5rem' }}>
          
          {/* AI Autofill Prompt Tooltip */}
          <div className="ai-suggestion-box">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Claude Listing Assistant</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.2rem 0 0.5rem 0' }}>
                  Upload a photo of your item (notes, books, electronics), then click autofill to have Claude write your title, tags, description, and estimate a fair price automatically.
                </p>
              </div>
            </div>
            
            <button 
              type="button" 
              className="btn-ai-generate" 
              onClick={handleAiAutofill} 
              disabled={processing}
              id="btn-ai-generate"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Processing with Claude...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Autofill with AI
                </>
              )}
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Upload Item Photo</label>
            <div className="image-upload-zone" style={{ position: 'relative' }}>
              <input 
                type="file" 
                id="item-image-input" 
                accept="image/*" 
                onChange={handleImageChange}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }}
              />
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Item Preview" 
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Drag & drop or click to browse files</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-title">Item Title</label>
            <input 
              type="text" 
              className="form-input text-input" 
              id="item-title" 
              placeholder="e.g. Thomas' Calculus 14th Edition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>

          <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="item-category">Category</label>
              <select 
                className="form-select text-input" 
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="textbooks">Textbooks</option>
                <option value="notes">Study Notes</option>
                <option value="electronics">Electronics</option>
                <option value="housing">Housing / Dorm Items</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="item-price">Asking Price (INR)</label>
              <input 
                type="number" 
                className="form-input text-input" 
                id="item-price" 
                placeholder="₹"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-description">Description & Details</label>
            <textarea 
              className="form-textarea text-input" 
              id="item-description" 
              rows="4" 
              placeholder="Mention details like condition, highlighting, inclusions, or meetup preferences..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Form CTAs */}
          <div className="modal-footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} id="btn-cancel-modal">Cancel</button>
            <button type="submit" className="btn-primary">Post Listing</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PostListingModal;
