import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  Edit2,
  Check,
  Bookmark,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { WORKERS } from '../../data/mockData';
import WorkerCard from '../../components/WorkerCard';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Priya Sharma',
    phone: user?.phone || '9811234567',
    city: user?.city || 'Gurugram',
    pincode: user?.pincode || '122001',
  });

  const savedWorkers = WORKERS.filter((w) => ['w1', 'w3'].includes(w.id));

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success('Profile details updated!');
  };

  const handleLogout = () => {
    logout();
    toast('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Profile Card Header */}
        <div className="card p-6 bg-gradient-to-br from-teal-900 to-slate-900 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-teal-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-teal-300">
            {formData.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold">{formData.name}</h2>
                <p className="text-teal-300 text-xs flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Customer Account
                </p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="self-center sm:self-start bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-white/20"
              >
                <Edit2 className="w-3 h-3" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>{formData.city} ({formData.pincode})</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>+91 {formData.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="card p-5 space-y-4 border border-teal-200">
            <h3 className="font-bold text-slate-800 text-sm">Update Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4 text-center">
            <p className="text-2xl font-black text-teal-700">12</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Services Completed</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-black text-amber-600">2</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Favorite Saathis</p>
          </div>
        </div>

        {/* Saved / Preferred Workers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-teal-600" /> Saved Workers
            </h3>
            <span className="text-xs text-slate-400">Trusted Contacts</span>
          </div>

          <div className="space-y-3">
            {savedWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full btn-ghost border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
