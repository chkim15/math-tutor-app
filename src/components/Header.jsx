import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Signup from './Signup';
import './Header.css';

export default function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, logout } = useAuth();
  const dropdownRef = useRef(null);

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const toggleAuthModal = (type) => {
    if (type === 'login') {
      setShowLogin(true);
      setShowSignup(false);
    } else {
      setShowSignup(true);
      setShowLogin(false);
    }
  };

  const closeAuthModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="header-logo">
            <h1>📚 Math Problems</h1>
          </div>
          
          <div className="header-auth">
            {currentUser ? (
              <div className="user-menu" ref={dropdownRef}>
                <button 
                  className="user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="user-initial">
                    {currentUser.displayName?.[0] || currentUser.email[0].toUpperCase()}
                  </span>
                  <span className="user-name">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <svg className="chevron-down" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <p className="user-email">{currentUser.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div 
                      className="logout-btn"
                      onClick={handleLogout}
                      onMouseDown={handleLogout}
                      style={{ cursor: 'pointer' }}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="login-btn"
                  onClick={() => toggleAuthModal('login')}
                >
                  Sign In
                </button>
                <button 
                  className="signup-btn"
                  onClick={() => toggleAuthModal('signup')}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modals */}
      {showLogin && (
        <Login 
          onToggleSignup={() => toggleAuthModal('signup')}
          onClose={closeAuthModals}
        />
      )}
      
      {showSignup && (
        <Signup 
          onToggleLogin={() => toggleAuthModal('login')}
          onClose={closeAuthModals}
        />
      )}
    </>
  );
} 