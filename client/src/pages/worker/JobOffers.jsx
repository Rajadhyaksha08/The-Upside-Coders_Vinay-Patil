import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Check, X, ShieldAlert, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { BOOKINGS } from '../../data/mockData';
import EmptyState from '../../components/EmptyState';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function JobOffers() {
  const navigate = useNavigate();

  // Mock list of active job requests
  const [offers, setOffers] = useState([
    {
      id: 'offer_1',
      service: 'Electrician',
      customerName: 'Priya S.',
      location: 'Sector 14, Gurugram',
      distance: '2.1 km',
      budget: 650,
      description: 'Main fuse tripping repeatedly and ceiling fan regulator replacement.',
      timeLeftSeconds: 520, // ~8.5 mins
      scheduledFor: 'Today, within 1 hr',
    },
    {
      id: 'offer_2',
      service: 'Electrician',
      customerName: 'Kunal V.',
      location: 'DLF Phase 2, Gurugram',
      distance: '4.8 km',
      budget: 450,
      description: 'Kitchen exhaust fan wiring issue.',
      timeLeftSeconds: 380,
      scheduledFor: 'Today, 5:00 PM',
    },
    {
      id: 'offer_3',
      service: 'Electrician',
      customerName: 'Amit B.',
      location: 'Sohna Road, Gurugram',
      distance: '7.2 km',
      budget: 850,
      description: 'Inverter battery setup and earthing test.',
      timeLeftSeconds: 240,
      scheduledFor: 'Tomorrow morning',
    },
  ]);

  // Live countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setOffers((prev) =>
        prev
          .map((offer) => ({
            ...offer,
            timeLeftSeconds: Math.max(0, offer.timeLeftSeconds - 1),
          }))
          .filter((offer) => offer.timeLeftSeconds > 0)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAccept = (offer) => {
    toast.success(`Job Accepted! Customer notified. 🎉`);
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    navigate('/worker/arrival-otp');
  };

  const handleDecline = (offerId) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
    toast('Job offer skipped');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Job Requests</h1>
            <p className="text-xs text-slate-500">
              Customers in your 5–15 km area are waiting for a response
            </p>
          </div>
          <span className="badge badge-teal px-3 py-1 font-bold text-xs">
            {offers.length} Live Offers
          </span>
        </div>

        {/* Offers Feed */}
        {offers.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No new job offers right now"
            description="Keep your availability switch ON. New notifications will chime automatically as customers search."
            actionLabel="Go to Dashboard"
            onAction={() => navigate('/worker')}
          />
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="card p-5 border-2 border-teal-500/30 hover:border-teal-500 transition-all shadow-sm space-y-4 relative overflow-hidden"
              >
                {/* Timer Ribbon */}
                <div className="flex items-center justify-between bg-amber-50 -mx-5 -mt-5 p-3 px-5 border-b border-amber-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <Clock className="w-4 h-4 animate-spin-slow" />
                    <span>Auto-expires in: {formatTimer(offer.timeLeftSeconds)}</span>
                  </div>
                  <span className="text-xs font-semibold text-amber-900">
                    {offer.scheduledFor}
                  </span>
                </div>

                <div className="flex justify-between items-start pt-1">
                  <div>
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {offer.service}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg mt-1">
                      {offer.customerName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Offer Budget</span>
                    <span className="text-xl font-black text-teal-700">₹{offer.budget}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{offer.description}"
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>{offer.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">~{offer.distance} away</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleDecline(offer.id)}
                    className="flex-1 btn-ghost border border-slate-200 hover:bg-red-50 text-red-600 text-xs py-2.5 flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Decline
                  </button>
                  <button
                    onClick={() => handleAccept(offer)}
                    className="flex-1 btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Accept Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
