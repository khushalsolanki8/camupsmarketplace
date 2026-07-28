import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, CreditCard, School, BookOpen, GraduationCap, Phone, AlignLeft, ArrowLeft, ArrowRight, Loader, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const AuthView = ({ setActiveView }) => {
  const { login, register, triggerToast } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regMajor, setRegMajor] = useState('');
  const [regYear, setRegYear] = useState('Freshman');
  const [regPhone, setRegPhone] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regColor, setRegColor] = useState('#8b5cf6');

  // Password & Email Validation states
  const [pwStrength, setPwStrength] = useState({ score: 0, label: 'Password strength', color: 'var(--text-muted)', width: '0%' });
  const [emailStatus, setEmailStatus] = useState({ valid: false, warning: false, label: 'Enter your student email (.edu)', icon: 'info' });

  // Watch password input for strength validation
  useEffect(() => {
    if (!regPassword) {
      setPwStrength({ score: 0, label: 'Password strength', color: 'var(--text-muted)', width: '0%' });
      return;
    }

    let score = 0;
    if (regPassword.length >= 8) score++;
    if (/[A-Z]/.test(regPassword)) score++;
    if (/[0-9]/.test(regPassword)) score++;
    if (/[^A-Za-z0-9]/.test(regPassword)) score++;

    if (score <= 1) {
      setPwStrength({ score, label: 'Weak password', color: '#ef4444', width: '33%' });
    } else if (score === 2 || score === 3) {
      setPwStrength({ score, label: 'Medium password', color: '#f59e0b', width: '66%' });
    } else {
      setPwStrength({ score, label: 'Strong security!', color: '#10b981', width: '100%' });
    }
  }, [regPassword]);

  // Watch email input for domain check
  useEffect(() => {
    const val = regEmail.trim().toLowerCase();
    if (!val) {
      setEmailStatus({ valid: false, warning: false, label: 'Enter your student email (.edu)', icon: 'info' });
      return;
    }

    if (val.endsWith('.edu') || val.endsWith('.edu.in') || val.match(/\.edu\.[a-z]{2}$/)) {
      setEmailStatus({ valid: true, warning: false, label: 'Eligible Campus Email (.edu Verified)', icon: 'success' });
    } else {
      setEmailStatus({ valid: false, warning: true, label: "Non-edu email. Verified status badge won't apply.", icon: 'warning' });
    }
  }, [regEmail]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      setActiveView('marketplace');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        avatarColor: regColor,
        studentId: regStudentId,
        college: regCollege || 'Campus University',
        major: regMajor,
        yearOfStudy: regYear,
        phoneNumber: regPhone,
        bio: regBio
      });
      setActiveView('marketplace');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Orange', value: '#f59e0b' }
  ];

  return (
    <div className="auth-body" style={{ minHeight: 'calc(100vh - 100px)', padding: '2rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="auth-page-container" style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* Decorative Ambient Glows */}
        <div className="glow-orb glow-1"></div>
        <div className="glow-orb glow-2"></div>

        {/* Auth Card */}
        <div className="auth-card" id="auth-card" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          
          {/* Tab Control */}
          <div className="auth-tabs" style={{ position: 'relative' }}>
            <button 
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`} 
              onClick={() => { setErrorMsg(''); setActiveTab('login'); }}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`} 
              onClick={() => { setErrorMsg(''); setActiveTab('register'); }}
            >
              Create Account
            </button>
            <div 
              className="active-tab-bar" 
              style={{ 
                transform: activeTab === 'login' ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            ></div>
          </div>

          {/* Error & Info Display */}
          {errorMsg && (
            <div 
              className="auth-alert" 
              style={{ 
                display: 'block', 
                background: 'rgba(239, 68, 68, 0.15)', 
                borderColor: 'rgba(239, 68, 68, 0.4)', 
                color: '#fca5a5',
                padding: '0.75rem',
                border: '1px solid',
                borderRadius: 'var(--radius-sm)',
                margin: '1rem' 
              }}
            >
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="auth-forms-slider-container" style={{ overflow: 'hidden', width: '100%' }}>
            <div 
              className="auth-forms-slider" 
              style={{ 
                display: 'flex',
                width: '200%',
                transform: activeTab === 'login' ? 'translateX(0)' : 'translateX(-50%)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              
              {/* Form 1: LOGIN */}
              <form className="auth-form" onSubmit={handleLoginSubmit} style={{ width: '50%', padding: '1.5rem' }}>
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Log in to buy, sell, and message on CampusSwap.</p>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">Campus Email</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input 
                      type="email" 
                      className="form-input text-input" 
                      placeholder="yourname@college.edu" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input 
                      type="password" 
                      className="form-input text-input" 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary btn-auth-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span>Signing In...</span>
                      <Loader size={16} className="spin-icon animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </>
                  )}
                </button>
                
                <p className="auth-footer-text">
                  Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('register'); }}>Create one now</a>
                </p>
              </form>

              {/* Form 2: REGISTER */}
              <form className="auth-form" onSubmit={handleRegisterSubmit} style={{ width: '50%', padding: '1.5rem' }}>
                <h2 className="auth-title">Join CampusSwap</h2>
                <p className="auth-subtitle">Verify your student email and start trading securely.</p>
                
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input 
                      type="text" 
                      className="form-input text-input" 
                      placeholder="e.g. Priyan Solanki" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Campus Email</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input 
                      type="email" 
                      className="form-input text-input" 
                      placeholder="username@college.edu" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required 
                    />
                  </div>
                  
                  {/* Email Verification Status Badge */}
                  <div className={`email-status-badge ${emailStatus.icon === 'success' ? 'valid' : emailStatus.icon === 'warning' ? 'warning' : ''}`} style={{ marginTop: '0.4rem' }}>
                    {emailStatus.icon === 'success' ? (
                      <CheckCircle size={12} style={{ marginRight: '4px' }} />
                    ) : emailStatus.icon === 'warning' ? (
                      <AlertTriangle size={12} style={{ marginRight: '4px' }} />
                    ) : (
                      <AlertCircle size={12} style={{ marginRight: '4px' }} />
                    )}
                    <span>{emailStatus.label}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input 
                      type="password" 
                      className="form-input text-input" 
                      placeholder="Min. 8 characters" 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required 
                    />
                  </div>
                  {/* Password Strength Bar */}
                  <div className="password-strength-container" style={{ marginTop: '0.4rem', height: '4px', background: 'var(--surface-light)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div 
                      className={`pw-strength-bar ${pwStrength.score <= 1 && regPassword ? 'weak' : pwStrength.score <= 3 && regPassword ? 'medium' : regPassword ? 'strong' : ''}`} 
                      style={{ 
                        width: pwStrength.width, 
                        height: '100%', 
                        background: pwStrength.color,
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                  </div>
                  <span className="pw-strength-text" style={{ fontSize: '0.75rem', color: pwStrength.color }}>
                    {pwStrength.label}
                  </span>
                </div>

                <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Student ID (Optional)</label>
                    <div className="input-wrapper">
                      <CreditCard size={16} className="input-icon" />
                      <input 
                        type="text" 
                        className="form-input text-input" 
                        placeholder="e.g. CS202305" 
                        value={regStudentId}
                        onChange={(e) => setRegStudentId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Year of Study</label>
                    <div className="input-wrapper">
                      <GraduationCap size={16} className="input-icon" />
                      <select 
                        className="form-select text-input" 
                        value={regYear}
                        onChange={(e) => setRegYear(e.target.value)}
                        style={{ paddingLeft: '2.35rem', width: '100%' }}
                      >
                        <option value="Freshman">Freshman</option>
                        <option value="Sophomore">Sophomore</option>
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Alumni">Alumni</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">College (Optional)</label>
                  <div className="input-wrapper">
                    <School size={16} className="input-icon" />
                    <input 
                      type="text" 
                      className="form-input text-input" 
                      placeholder="e.g. Campus University" 
                      value={regCollege}
                      onChange={(e) => setRegCollege(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Major (Optional)</label>
                    <div className="input-wrapper">
                      <BookOpen size={16} className="input-icon" />
                      <input 
                        type="text" 
                        className="form-input text-input" 
                        placeholder="e.g. Computer Science" 
                        value={regMajor}
                        onChange={(e) => setRegMajor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-wrapper">
                      <Phone size={16} className="input-icon" />
                      <input 
                        type="tel" 
                        className="form-input text-input" 
                        placeholder="e.g. +91 98765 4321" 
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Short Bio (Optional)</label>
                  <div className="input-wrapper">
                    <AlignLeft size={16} className="input-icon" style={{ top: '15px' }} />
                    <textarea 
                      className="form-textarea text-input" 
                      placeholder="Tell other students about yourself..." 
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      style={{ paddingLeft: '2.35rem', minHeight: '60px' }}
                    ></textarea>
                  </div>
                </div>

                {/* Profile Color picker */}
                <div className="form-group">
                  <label className="form-label">Profile Theme Color</label>
                  <div className="avatar-preview-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div 
                      className="avatar-circle-preview" 
                      style={{ backgroundColor: regColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', fontWeight: 'bold' }}
                    >
                      {regName ? regName.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="color-options-grid" style={{ display: 'flex', gap: '0.5rem' }}>
                      {colorOptions.map(opt => (
                        <button 
                          key={opt.value}
                          type="button" 
                          className={`color-option-btn ${regColor === opt.value ? 'active' : ''}`}
                          onClick={() => setRegColor(opt.value)}
                          style={{ 
                            backgroundColor: opt.value,
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: regColor === opt.value ? '2px solid white' : 'none',
                            cursor: 'pointer'
                          }}
                        ></button>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary btn-auth-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span>Registering...</span>
                      <Loader size={16} className="spin-icon animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>Register Account</span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </>
                  )}
                </button>
                
                <p className="auth-footer-text">
                  Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>Sign In</a>
                </p>
              </form>

            </div>
          </div>
        </div>

        {/* Return to Home */}
        <a 
          href="#" 
          className="btn-back-home" 
          onClick={(e) => { e.preventDefault(); setActiveView('marketplace'); }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1rem', textDecoration: 'none' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Marketplace</span>
        </a>

      </div>
    </div>
  );
};

export default AuthView;
