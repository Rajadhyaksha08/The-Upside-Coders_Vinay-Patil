import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Briefcase, Shield, ChevronDown, ChevronUp, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
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
  const { login, demoLogin } = useAuth();

  const preselect = location.state?.role || 'customer';

  const [role, setRole] = useState(preselect);
  const [phone, setPhone] = useState('9811234567');
  const [pin, setPin] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(true);

  const validatePhone = (p) => /^[6-9]\d{9}$/.test(p.replace(/\D/g, ''));

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
      setError('Please enter your 4-digit PIN.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(cleanPhone, pin, role);
      setLoading(false);
      if (result && result.success) {
        toast.success(`Welcome back, ${result.user?.name || 'User'}! 👋`);
        navigateForRole(role);
      } else {
        setError(result?.error || 'Invalid credentials. Please try a demo account.');
      }
    } catch (err) {
      setLoading(false);
      setError('Login failed. Please try again.');
    }
  };

  const handleInstantDemoLogin = (demo) => {
    setRole(demo.role);
    setPhone(demo.phone);
    setPin(demo.pin);
    setError('');
    
    // Instant login
    demoLogin(demo);
    toast.success(`Logged in as ${demo.name} (${demo.role.toUpperCase()})! 🚀`);
    navigateForRole(demo.role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-8 px-4">
      {/* Brand Logo */}
      <div className="mb-6 text-center">
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

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        {/* Role Selector Tabs */}
        <div>
          <label className="label mb-2">Select Account Type</label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRole(r.id);
                  setError('');
                  // Auto-fill default demo account for role
                  const defaultAcc = DEMO_ACCOUNTS.find((a) => a.role === r.id);
                  if (defaultAcc) {
                    setPhone(defaultAcc.phone);
                    setPin(defaultAcc.pin);
                  }
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  role === r.id
                    ? 'border-teal-600 bg-teal-50/60 text-teal-800 font-bold ring-2 ring-teal-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200'
                }`}
              >
                <span className={role === r.id ? 'text-teal-600' : 'text-slate-400'}>
                  {r.icon}
                </span>
                <span className="text-xs mt-1">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label className="label">Registered Mobile Number</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
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
              placeholder="98XXXXXXXX"
              className="input-field pl-13 text-sm font-medium"
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
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 shadow"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Logging in…
            </>
          ) : (
            <>
              Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400">
          Want to offer services?{' '}
          <button
            type="button"
            className="text-teal-600 font-semibold hover:underline"
            onClick={() => navigate('/worker/register')}
          >
            Register as Worker Partner
          </button>
        </p>
      </div>

      {/* 1-Click Demo Accounts Selector */}
      <div className="w-full max-w-md mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
          onClick={() => setShowDemo(!showDemo)}
        >
          <span className="flex items-center gap-1.5 text-teal-700">
            <Sparkles className="w-4 h-4" /> 1-Click Instant Demo Login
          </span>
          {showDemo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDemo && (
          <div className="border-t border-slate-100 p-3 space-y-2 bg-slate-50/50">
            {DEMO_ACCOUNTS.map((demo) => (
              <div
                key={demo.id}
                className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-teal-400 transition-all"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-xs">{demo.name}</span>
                    <span
                      className={`badge text-[10px] ${
                        demo.role === 'customer'
                          ? 'badge-teal'
                          : demo.role === 'worker'
                          ? 'badge-amber'
                          : 'badge-slate'
                      }`}
                    >
                      {demo.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Phone: {demo.phone} • PIN: {demo.pin}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin(demo)}
                  className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap bg-teal-600 hover:bg-teal-700 shadow-sm"
                >
                  Login ➔
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
