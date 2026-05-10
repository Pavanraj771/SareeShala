import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sareeShala_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('sareeShala_user');
      }
    }
    setLoading(false);
  }, []);

  const showMessage = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('sareeShala_user', JSON.stringify(userData));
    showMessage(`Successfully logged in as ${userData.firstName || userData.username}!`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sareeShala_user');
    showMessage('Successfully logged out!');
  };

  const updateUser = (newData) => {
    setUser(newData);
    localStorage.setItem('sareeShala_user', JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, showMessage }}>
      {children}
      {toastMessage && (
        <div className="auth-toast-overlay">
          <div className="auth-toast-message">
            <CheckCircle className="toast-icon" size={32} />
            <p className="toast-text">{toastMessage}</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
