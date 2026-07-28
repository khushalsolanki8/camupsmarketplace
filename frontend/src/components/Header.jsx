import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, LogIn, LogOut, User as UserIcon, List as ListIcon, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';

const Header = ({ activeView, setActiveView, onOpenPostModal, onOpenProfileModal }) => {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown
  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNavClick = (view, e) => {
    e.preventDefault();
    if ((view === 'mylistings' || view === 'messages') && !currentUser) {
      setActiveView('auth');
      return;
    }
    setActiveView(view);
  };

  const initials = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
  const isEdu = currentUser?.email.endsWith('.edu') || currentUser?.email.endsWith('.edu.in') || currentUser?.isVerified;

  return (
    <header>
      <div className="nav-content">
        <a href="#" className="logo" onClick={(e) => handleNavClick('marketplace', e)}>
          <div className="logo-icon">C</div>
          <span>CampusSwap</span>
        </a>
        <ul className="nav-links">
          <li>
            <a 
              href="#" 
              className={`nav-link ${activeView === 'marketplace' ? 'active' : ''}`} 
              onClick={(e) => handleNavClick('marketplace', e)}
            >
              Marketplace
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`nav-link ${activeView === 'mylistings' ? 'active' : ''}`} 
              onClick={(e) => handleNavClick('mylistings', e)}
            >
              My Listings
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`nav-link ${activeView === 'messages' ? 'active' : ''}`} 
              onClick={(e) => handleNavClick('messages', e)}
            >
              Messages
            </a>
          </li>
          <li>
            <button className="btn-primary" onClick={onOpenPostModal}>
              <PlusCircle size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Post Listing
            </button>
          </li>
          <li id="nav-auth-container">
            {currentUser ? (
              <div className="user-profile-dropdown" ref={dropdownRef} id="user-dropdown">
                <button 
                  className={`user-profile-btn ${dropdownOpen ? 'active' : ''}`} 
                  onClick={handleDropdownToggle}
                  aria-label="User Account Menu"
                >
                  <span 
                    className="user-avatar" 
                    style={{ backgroundColor: currentUser.avatarColor || '#8b5cf6' }}
                  >
                    {initials}
                  </span>
                  <span className="user-name">{currentUser.name}</span>
                  <ChevronDown size={14} />
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown-menu active" id="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <span className="user-dropdown-name">{currentUser.name}</span>
                      <span className="user-dropdown-email">{currentUser.email}</span>
                      {isEdu ? (
                        <span className="user-verified-badge">
                          <CheckCircle size={10} style={{ marginRight: '4px' }} /> .edu Verified
                        </span>
                      ) : (
                        <span className="user-verified-badge unverified">
                          <AlertCircle size={10} style={{ marginRight: '4px' }} /> External Account
                        </span>
                      )}
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <a 
                      href="#" 
                      className="dropdown-item" 
                      onClick={(e) => {
                        e.preventDefault();
                        setDropdownOpen(false);
                        onOpenProfileModal();
                      }}
                    >
                      <UserIcon size={16} style={{ marginRight: '8px' }} /> My Profile
                    </a>
                    <a 
                      href="#" 
                      className="dropdown-item" 
                      onClick={(e) => {
                        e.preventDefault();
                        setDropdownOpen(false);
                        setActiveView('mylistings');
                      }}
                    >
                      <ListIcon size={16} style={{ marginRight: '8px' }} /> My Listings
                    </a>
                    <a 
                      href="#" 
                      className="dropdown-item" 
                      onClick={(e) => {
                        e.preventDefault();
                        setDropdownOpen(false);
                        logout();
                        setActiveView('marketplace');
                      }}
                    >
                      <LogOut size={16} style={{ marginRight: '8px' }} /> Sign Out
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <a 
                href="#" 
                className="btn-secondary" 
                onClick={(e) => handleNavClick('auth', e)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <LogIn size={16} /> Sign In
              </a>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
