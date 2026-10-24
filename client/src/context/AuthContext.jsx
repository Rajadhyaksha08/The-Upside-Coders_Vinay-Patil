import React, { createContext, useContext, useState, useEffect } from 'react';
import { CUSTOMERS, WORKERS } from '../data/mockData';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  { role: 'customer', id: 'c1', name: 'Priya Sharma', phone: '9811234567', pin: '1234' },
  { role: 'customer', id: 'c2', name: 'Ajay Mehta',  phone: '9822334455', pin: '1234' },
  { role: 'worker',   id: 'w1', name: 'Ramesh Kumar', phone: '9876543210', pin: '1234' },
  { role: 'worker',   id: 'w3', name: 'Geeta Devi',   phone: '9765432109', pin: '1234' },
  { role: 'admin',    id: 'a1', name: 'Admin User',   phone: '9000000000', pin: '0000' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sevasaathi_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('sevasaathi_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('sevasaathi_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const login = async (phone, pin, role) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // short realistic delay

    const cleanPhone = String(phone).replace(/\D/g, '');

    // 1. Check exact match in DEMO_ACCOUNTS
    let account = DEMO_ACCOUNTS.find(
      (a) => a.phone === cleanPhone && a.role === role
    );

    // 2. If not found by phone, check if any demo account matches this role
    if (!account) {
      if (role === 'admin') {
        account = DEMO_ACCOUNTS.find((a) => a.role === 'admin');
      } else if (role === 'worker') {
        account = {
          role: 'worker',
          id: 'w1',
          name: 'Ramesh Kumar',
          phone: cleanPhone || '9876543210',
          pin: pin || '1234',
        };
      } else {
        account = {
          role: 'customer',
          id: 'c1',
          name: 'Priya Sharma',
          phone: cleanPhone || '9811234567',
          pin: pin || '1234',
        };
      }
    }

    const profileData =
      role === 'customer'
        ? CUSTOMERS.find((c) => c.id === account.id) || CUSTOMERS[0]
        : role === 'worker'
        ? WORKERS.find((w) => w.id === account.id) || WORKERS[0]
        : { id: 'a1', name: 'Admin User', initials: 'AU', avatarColor: 'bg-slate-600', role: 'admin' };

    const fullUser = { ...account, ...profileData, role };
    setUser(fullUser);
    setLoading(false);
    return { success: true, user: fullUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sevasaathi_user');
  };

  const demoLogin = (account) => {
    const profileData =
      account.role === 'customer'
        ? CUSTOMERS.find((c) => c.id === account.id) || CUSTOMERS[0]
        : account.role === 'worker'
        ? WORKERS.find((w) => w.id === account.id) || WORKERS[0]
        : { id: 'a1', name: 'Admin User', initials: 'AU', avatarColor: 'bg-slate-600', role: 'admin' };

    const fullUser = { ...account, ...profileData };
    setUser(fullUser);
    return fullUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
