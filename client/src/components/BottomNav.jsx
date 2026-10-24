import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  House,
  Search,
  ClipboardList,
  Phone,
  User,
  Home,
  Briefcase,
  KeyRound,
  Wallet,
  LayoutDashboard,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CUSTOMER_ITEMS = [
  { label: 'Home', icon: House, to: '/customer' },
  { label: 'Search', icon: Search, to: '/customer/search' },
  { label: 'Bookings', icon: ClipboardList, to: '/customer/bookings' },
  { label: 'Call', icon: Phone, to: '/customer/call/w1' },
  { label: 'Profile', icon: User, to: '/customer/profile' },
];

const WORKER_ITEMS = [
  { label: 'Home', icon: Home, to: '/worker' },
  { label: 'Jobs', icon: Briefcase, to: '/worker/jobs' },
  { label: 'IVR Call', icon: Phone, to: '/ivr' },
  { label: 'Earnings', icon: Wallet, to: '/worker/earnings' },
  { label: 'Reviews', icon: User, to: '/worker/reviews' },
];

const ADMIN_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Workers', icon: Users, to: '/admin/workers' },
  { label: 'Disputes', icon: AlertTriangle, to: '/admin/disputes' },
  { label: 'IVR', icon: Phone, to: '/ivr' },
];

const ROLE_ITEMS = {
  customer: CUSTOMER_ITEMS,
  worker: WORKER_ITEMS,
  admin: ADMIN_ITEMS,
};

export default function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  const items = ROLE_ITEMS[user.role] || [];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 shadow-lg md:hidden safe-bottom">
      <div className="flex items-stretch">
        {items.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/${user.role}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-colors ${
                isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium leading-tight">{label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-teal-600 mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
