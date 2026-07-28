import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Edit2, Loader2, CheckCircle, AlertTriangle, ShieldCheck, Mail, BookOpen, GraduationCap, Phone, Info } from 'lucide-react';

const ProfileModal = ({ onClose }) => {
  const { currentUser, updateProfile, triggerToast } = useAuth();
  const [activeTab, setActiveTab] = useState('card'); // 'card' or 'edit'
  
  // Edit Form Fields
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [college, setCollege] = useState('');
  const [major, setMajor] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('Freshman');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [avatarColor, setAvatarColor] = useState('#8b5cf6');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setStudentId(currentUser.studentId || '');
      setCollege(currentUser.college || 'Campus University');
      setMajor(currentUser.major || '');
      setYearOfStudy(currentUser.yearOfStudy || 'Freshman');
      setPhoneNumber(currentUser.phoneNumber || '');
      setBio(currentUser.bio || '');
      setAvatarColor(currentUser.avatarColor || '#8b5cf6');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const colorOptions = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Orange', value: '#f59e0b' }
  ];

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile({
        name,
        studentId,
        college,
        major,
        yearOfStudy,
        phoneNumber,
        bio,
        avatarColor
      });
      setActiveTab('card');
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Failed to update profile', 'warning');
    } finally {
      setSaving(false);
    }
  };

  const initials = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
  const isEdu = currentUser.email.endsWith('.edu') || currentUser.email.endsWith('.edu.in') || currentUser.isVerified;

  // Custom shadows and highlights based on selected color
  const themeGlowStyle = {
    boxShadow: `0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px ${avatarColor}20`,
    borderColor: `${avatarColor}40`
  };

  const glowBgStyle = {
    background: `radial-gradient(circle, ${avatarColor}33 0%, transparent 70%)`
  };

  return (
    <div className="modal-overlay active" id="profile-modal-overlay">
      <div className="modal-container profile-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="header-icon-circle">
              <User size={16} color="var(--primary)" />
            </div>
            <h3>Student Card Hub</h3>
          </div>
          <button className="btn-close-modal-icon" onClick={onClose} id="btn-close-profile">
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="profile-tabs">
          <button 
            className={`profile-tab-btn ${activeTab === 'card' ? 'active' : ''}`}
            onClick={() => setActiveTab('card')}
            id="btn-profile-tab-card"
            style={{ 
              borderBottom: activeTab === 'card' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'card' ? 'white' : 'var(--text-muted)'
            }}
          >
            <ShieldCheck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            View Student ID
          </button>
          
          <button 
            className={`profile-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
            id="btn-profile-tab-edit"
            style={{ 
              borderBottom: activeTab === 'edit' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'edit' ? 'white' : 'var(--text-muted)'
            }}
          >
            <Edit2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Edit Profile Card
          </button>
        </div>

        {/* Tab content area */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          
          {/* TAB 1: VISUAL STUDENT ID CARD */}
          {activeTab === 'card' && (
            <div id="profile-sec-card" style={{ display: 'block' }}>
              <div 
                className="student-id-card" 
                id="student-id-card" 
                style={themeGlowStyle}
              >
                {/* Glow Backdrop overlay */}
                <div className="id-card-glow" id="id-card-glow-bg" style={glowBgStyle}></div>
                
                {/* Header section with Logo & Verification Badge */}
                <div className="id-card-header">
                  <div className="id-card-logo">
                    <span className="id-card-logo-icon">C</span>
                    <span>CampusSwap ID</span>
                  </div>
                  {isEdu ? (
                    <span className="id-card-badge" id="id-card-badge-status" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      VERIFIED STUDENT
                    </span>
                  ) : (
                    <span className="id-card-badge unverified" id="id-card-badge-status" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                      EXTERNAL USER
                    </span>
                  )}
                </div>

                {/* Main Card Profile Details */}
                <div className="id-card-main">
                  <div className="id-card-avatar-section">
                    <div 
                      className="id-card-avatar-pic" 
                      id="id-card-avatar-pic"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>
                    <div className="id-card-meta-stamp">
                      <span>ISSUE DATE</span>
                      <strong>2026</strong>
                    </div>
                  </div>

                  <div className="id-card-details-section">
                    <div className="id-card-field">
                      <span className="field-lbl">STUDENT NAME</span>
                      <strong className="field-val" id="id-card-name">{currentUser.name}</strong>
                    </div>
                    
                    <div className="id-card-grid-fields">
                      <div className="id-card-field">
                        <span className="field-lbl">STUDENT ID</span>
                        <strong className="field-val" id="id-card-id">{currentUser.studentId || 'Not Provided'}</strong>
                      </div>
                      <div className="id-card-field">
                        <span className="field-lbl">LEVEL / YEAR</span>
                        <strong className="field-val" id="id-card-level">{currentUser.yearOfStudy || 'Freshman'}</strong>
                      </div>
                    </div>

                    <div className="id-card-field">
                      <span className="field-lbl">COLLEGE / UNIVERSITY</span>
                      <strong className="field-val" id="id-card-college">{currentUser.college || 'Campus University'}</strong>
                    </div>

                    <div className="id-card-field">
                      <span className="field-lbl">MAJOR / DEPARTMENT</span>
                      <strong className="field-val" id="id-card-major">{currentUser.major || 'Not Provided'}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer section with contact/bio */}
                <div className="id-card-footer">
                  <div className="id-card-field">
                    <span className="field-lbl">CONTACT</span>
                    <strong className="field-val" id="id-card-phone">{currentUser.phoneNumber || 'Not Provided'}</strong>
                  </div>
                  <div className="id-card-bio-box" style={{ borderLeftColor: avatarColor }}>
                    <span className="field-lbl">PERSONAL BIO</span>
                    <p id="id-card-bio">
                      {currentUser.bio ? `"${currentUser.bio}"` : '"No bio written yet. Click Edit Profile to add a custom bio!"'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT DETAILS FORM */}
          {activeTab === 'edit' && (
            <form id="edit-profile-form" onSubmit={handleEditSubmit} style={{ display: 'block' }}>
              
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input 
                    type="text" 
                    className="form-input text-input" 
                    id="profile-name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-studentid">Student ID / Roll No</label>
                  <input 
                    type="text" 
                    className="form-input text-input" 
                    id="profile-studentid" 
                    placeholder="e.g. CS202305"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-year">Year of Study</label>
                  <select 
                    className="form-select text-input" 
                    id="profile-year"
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Freshman">Freshman (1st Year)</option>
                    <option value="Sophomore">Sophomore (2nd Year)</option>
                    <option value="Junior">Junior (3rd Year)</option>
                    <option value="Senior">Senior (4th Year)</option>
                    <option value="Graduate">Graduate Student</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-college">College / University</label>
                <input 
                  type="text" 
                  className="form-input text-input" 
                  id="profile-college" 
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>

              <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-major">Major / Department</label>
                  <input 
                    type="text" 
                    className="form-input text-input" 
                    id="profile-major" 
                    placeholder="e.g. Computer Science"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-phone">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-input text-input" 
                    id="profile-phone" 
                    placeholder="e.g. +91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-bio">Short Bio</label>
                <textarea 
                  className="form-textarea text-input" 
                  id="profile-bio" 
                  rows="3"
                  placeholder="Tell other students about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
              </div>

              {/* Color Customizer Option */}
              <div className="form-group">
                <label className="form-label">Profile Theme Color</label>
                <div className="avatar-preview-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div 
                    className="avatar-circle-preview" 
                    style={{ backgroundColor: avatarColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem' }}
                  >
                    {name ? name.charAt(0).toUpperCase() : initials}
                  </div>
                  <div className="color-options-grid" style={{ display: 'flex', gap: '0.5rem' }}>
                    {colorOptions.map(opt => (
                      <button 
                        key={opt.value}
                        type="button" 
                        className={`color-option-btn ${avatarColor === opt.value ? 'active' : ''}`}
                        onClick={() => setAvatarColor(opt.value)}
                        style={{ 
                          backgroundColor: opt.value,
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: avatarColor === opt.value ? '3px solid white' : 'none',
                          cursor: 'pointer',
                          boxShadow: avatarColor === opt.value ? '0 0 10px rgba(255,255,255,0.8)' : 'none'
                        }}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setActiveTab('card')}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} id="btn-save-profile">
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={14} style={{ marginRight: '4px', display: 'inline' }} />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
