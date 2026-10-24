import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Wrench, LogOut, User, Menu, X, Home, Search, ClipboardList, LayoutDashboard, Briefcase, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = {
  customer: [
    { label: 'Home', to: '/customer', icon: <Home size={16} /> },
    { label: 'Find Service', to: '/customer/search', icon: <Search size={16} /> },
    { label: 'My Bookings', to: '/customer/bookings', icon: <ClipboardList size={16} /> },
    { label: 'Profile', to: '/customer/profile', icon: <User size={16} /> },
  ],
  worker: [
    { label: 'Dashboard', to: '/worker', icon: <LayoutDashboard size={16} /> },
    { label: 'Job Offers', to: '/worker/jobs', icon: <Briefcase size={16} /> },
    { label: 'Earnings', to: '/worker/earnings', icon: null },
    { label: 'Referral', to: '/worker/referral', icon: null },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard size={16} /> },
    { label: 'Workers', to: '/admin/workers', icon: <Users size={16} /> },
    { label: 'Disputes', to: '/admin/disputes', icon: <AlertTriangle size={16} /> },
  ],
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role;
  const links = role ? NAV_LINKS[role] || [] : [];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const avatarBg =
    role === 'admin'
      ? 'bg-red-500'
      : role === 'worker'
      ? 'bg-amber-500'
      : 'bg-teal-600';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => navigate(role ? `/${role}` : '/')}
            className="flex items-center gap-2 focus:outline-none group"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-600 text-white shadow-sm group-hover:bg-teal-700 transition-colors">
              <Wrench size={20} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-bold text-slate-900 text-lg tracking-tight">SevaSaathi</span>
              <span className="text-teal-600 text-xs font-medium">Har Kaam Ke Liye</span>
            </span>
          </button>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === `/${role}`}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/ivr')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              📞 1800 IVR Call
            </button>
            {!user ? (
              <>
                <button
                  onClick={() => navigate('/worker-onboard')}
                  className="hidden sm:block text-sm text-slate-600 hover:text-teal-600 font-medium transition-colors"
                >
                  For Workers
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                <div className="relative hidden md:flex items-center gap-2">
                  <div className={`relative flex items-center justify-center w-9 h-9 rounded-full ${avatarBg} text-white font-semibold text-sm select-none`}>
                    {getInitials(user.name)}
                    {role === 'admin' && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold px-1 py-0.5 rounded-full leading-none">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden lg:block">
                    {user.name?.split(' ')[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden lg:block">Logout</span>
                </button>

                <button
                  className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                  onClick={() => setMobileOpen((o) => !o)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </>
            )}

            {!user && (
              <button
                className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg px-4 py-3 flex flex-col gap-1">
          {user && links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === `/${role}`}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}

          {!user && (
            <>
              <button
                onClick={() => { navigate('/worker-onboard'); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 text-left"
              >
                For Workers
              </button>
              <button
                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                className="btn-primary text-sm w-full mt-1"
              >
                Login
              </button>
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 mt-1"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
