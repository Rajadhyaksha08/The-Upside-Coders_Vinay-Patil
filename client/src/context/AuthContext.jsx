import React, { createContext, useContext, useState, useEffect } from 'react';
import { CUSTOMERS, WORKERS } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sevasaathi_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customWorkers, setCustomWorkers] = useState(() => {
    try {
      const saved = localStorage.getItem('sevasaathi_custom_workers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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

  // Synchronize custom workers to mock data array
  useEffect(() => {
    if (customWorkers.length > 0) {
      customWorkers.forEach((cw) => {
        const exists = WORKERS.find((w) => w.id === cw.id || w.phone === cw.phone);
        if (!exists) {
          WORKERS.unshift(cw);
        }
      });
    }
  }, [customWorkers]);

  const login = async (phone, pin, role) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 450)); // realistic API auth roundtrip

    const cleanPhone = String(phone).replace(/\D/g, '');

    let matchedUser = null;

    if (role === 'worker') {
      // 1. Check custom registered workers first
      const customWorker = customWorkers.find((w) => w.phone === cleanPhone);
      if (customWorker) {
        matchedUser = { ...customWorker, role: 'worker' };
      } else {
        // 2. Check existing workers
        const existingWorker = WORKERS.find((w) => w.phone === cleanPhone);
        if (existingWorker) {
          matchedUser = { ...existingWorker, role: 'worker' };
        } else {
          // 3. Any new worker phone number works automatically!
          matchedUser = {
            id: `w_${cleanPhone.slice(-4)}`,
            name: 'Partner ' + cleanPhone.slice(-4),
            phone: cleanPhone,
            city: 'Delhi-NCR',
            pincode: '110001',
            skills: ['General Repair', 'Maintenance'],
            avatarColor: 'bg-teal-600',
            initials: 'WP',
            rating: 4.8,
            reviewCount: 14,
            hourlyRate: 350,
            available: true,
            verified: true,
            aadhaarVerified: true,
            experience: '4 years',
            role: 'worker',
          };
        }
      }
    } else if (role === 'customer') {
      const existingCustomer = CUSTOMERS.find((c) => c.phone === cleanPhone);
      if (existingCustomer) {
        matchedUser = { ...existingCustomer, role: 'customer' };
      } else {
        matchedUser = {
          id: `c_${cleanPhone.slice(-4)}`,
          name: 'Customer ' + cleanPhone.slice(-4),
          phone: cleanPhone,
          city: 'Gurugram',
          pincode: '122001',
          initials: 'CS',
          avatarColor: 'bg-teal-700',
          totalBookings: 1,
          role: 'customer',
        };
      }
    } else {
      // Admin
      matchedUser = {
        id: 'admin_1',
        name: 'Chief Moderator',
        phone: cleanPhone,
        initials: 'AD',
        avatarColor: 'bg-slate-800',
        role: 'admin',
      };
    }

    setUser(matchedUser);
    setLoading(false);
    return { success: true, user: matchedUser };
  };

  const registerWorker = (formData) => {
    const cleanPhone = String(formData.phone || '').replace(/\D/g, '');
    const newWorker = {
      id: `w_${Date.now()}`,
      name: formData.fullName || 'Skilled Partner',
      initials: (formData.fullName || 'SP')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      avatarColor: 'bg-teal-600',
      phone: cleanPhone,
      city: formData.city || 'Delhi-NCR',
      pincode: formData.pin || '110001',
      distance: '1.8 km',
      skills: formData.skills && formData.skills.length > 0 ? formData.skills : [formData.service || 'Electrician'],
      hourlyRate: formData.rateType === 'hourly' ? Number(formData.rate) || 400 : null,
      fixedRate: formData.rateType === 'fixed' ? Number(formData.rate) || 500 : null,
      available: true,
      verified: true,
      aadhaarVerified: !!formData.aadhaar,
      experience: formData.experience || '3 years',
      completedJobs: 0,
      bio: `${formData.fullName} is an experienced professional in ${formData.service || 'Home Services'}. Available for instant bookings.`,
      languages: formData.languages || ['Hindi', 'English'],
      workingHours: `${formData.startTime || '8:00 AM'} – ${formData.endTime || '8:00 PM'}`,
      reviews: [],
      role: 'worker',
    };

    const updated = [newWorker, ...customWorkers];
    setCustomWorkers(updated);
    try {
      localStorage.setItem('sevasaathi_custom_workers', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    WORKERS.unshift(newWorker);
    setUser(newWorker);
    return newWorker;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sevasaathi_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerWorker }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
