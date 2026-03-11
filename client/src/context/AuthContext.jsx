import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          setRole(res.data.role || null);
        } catch (err) {
          console.error("Auth Error:", err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data);
    setRole(res.data.role || null);
    return res.data;
  };

  const signup = async (userData) => {
    const res = await api.post('/auth/signup', userData);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data);
    setRole(res.data.role || null);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
