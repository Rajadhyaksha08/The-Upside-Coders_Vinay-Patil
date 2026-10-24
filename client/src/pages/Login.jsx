import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Briefcase, Shield, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import OTPInput from '../components/OTPInput';

const ROLES = [
  {
    id: 'customer',
    label: 'Customer',
    desc: 'Book home services near you',
    icon: <User className="w-5 h-5" />,
  },
  {
    id: 'worker',
    label: 'Worker',
    desc: 'Find jobs & earn more',
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    id: 'admin',
    label: 'Admin',
    desc: 'Platform moderation',
    icon: <Shield className="w-5 h-5" />,
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const preselect = location.state?.role || 'customer';

  const [role, setRole] = useState(preselect);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigateForRole = (userRole) => {
    if (userRole === 'customer') navigate('/customer');
    else if (userRole === 'worker') navigate('/worker');
    else navigate('/admin');
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!pin || pin.length !== 4) {
      setError('Please enter your 4-digit security PIN.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(cleanPhone, pin, role);
      setLoading(false);
      if (result && result.success) {
        toast.success(`Welcome, ${result.user?.name || 'User'}! 👋`);
        navigateForRole(role);
      } else {
        setError(result?.error || 'Authentication error. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('Login failed. Please check network connection.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-10 px-4">
      {/* Brand Logo */}
      <div className="mb-8 text-center">
        <h1
          className="text-3xl font-black text-slate-900 cursor-pointer tracking-tight"
          onClick={() => navigate('/')}
        >
          Seva<span className="text-teal-600">Saathi</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1 font-medium">
          Har kaam ke liye, ek saathi
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
        {/* Role Selector Tabs */}
        <div>
          <label className="label mb-2.5">Select Account Type</label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRole(r.id);
                  setError('');
                }}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                  role === r.id
                    ? 'border-teal-600 bg-teal-50/60 text-teal-800 font-bold ring-2 ring-teal-100 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200'
                }`}
              >
                <span className={role === r.id ? 'text-teal-600' : 'text-slate-400'}>
                  {r.icon}
                </span>
                <span className="text-xs mt-1.5 font-semibold">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Input with clean non-overlapping prefix */}
        <div>
          <label className="label">Registered Mobile Number</label>
          <div className="flex rounded-2xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent bg-white transition-all shadow-sm">
            <span className="inline-flex items-center px-4 bg-slate-50 text-slate-600 font-bold text-sm border-r border-slate-200 select-none">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-3 text-sm font-semibold tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none bg-white"
              autoFocus
            />
          </div>
        </div>

        {/* PIN Input */}
        <div>
          <label className="label">4-Digit Security PIN</label>
          <OTPInput
            length={4}
            value={pin}
            onChange={(v) => {
              setPin(v);
              setError('');
            }}
          />
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Enter your 4-digit security PIN to log in
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 shadow-sm font-bold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials…
            </>
          ) : (
            <>
              Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Want to register as a skilled partner?{' '}
            <button
              type="button"
              className="text-teal-600 font-bold hover:underline"
              onClick={() => navigate('/worker/register')}
            >
              Join as Worker
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
