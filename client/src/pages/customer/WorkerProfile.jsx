import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Star, Shield, CheckCircle, MapPin, Clock,
  Phone, Briefcase, Languages, ChevronRight
} from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import { WORKERS } from '../../data/mockData';

const TABS = ['About', 'Reviews', 'Pricing'];

function StarRow({ rating, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
    </div>
  );
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function WorkerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('About');

  const worker = (WORKERS || []).find((w) => w.id === id) || (WORKERS || [])[0];

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Worker not found
      </div>
    );
  }

  const reviews = worker.reviews || [
    { id: 'r1', name: 'Priya Sharma', rating: 5, comment: 'Excellent work, very professional and on time!', date: '12 Oct 2026' },
    { id: 'r2', name: 'Ankit Gupta', rating: 4, comment: 'Good service, got the job done properly.', date: '5 Oct 2026' },
    { id: 'r3', name: 'Meena Iyer', rating: 5, comment: 'Highly recommend. Cleaned up after the work too.', date: '28 Sep 2026' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      {/* Back button */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <span className="text-base font-bold text-slate-900">Worker Profile</span>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mt-4 p-6 mb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-teal-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-md">
              {getInitials(worker.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 mb-1 truncate">{worker.name}</h2>
              <p className="text-sm text-slate-500 mb-2">{(worker.services || []).join(', ')}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {worker.aadhaarVerified && (
                  <span className="badge-teal flex items-center gap-1 text-xs">
                    <Shield className="w-3 h-3" /> Aadhaar Verified
                  </span>
                )}
                {worker.platformVerified && (
                  <span className="badge-green flex items-center gap-1 text-xs">
                    <CheckCircle className="w-3 h-3" /> Platform Verified
                  </span>
                )}
              </div>
              {/* Rating */}
              <div className="flex items-center gap-2">
                <StarRow rating={worker.rating || 4.5} />
                <span className="text-sm font-bold text-slate-800">{worker.rating || 4.5}</span>
                <span className="text-xs text-slate-400">
                  ({worker.reviewCount || reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Jobs completed */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Briefcase className="w-4 h-4 text-teal-600" />
              <span>{worker.jobsCompleted || 142} jobs completed</span>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              worker.isAvailable
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {worker.isAvailable ? '🟢 Available' : '🔴 Busy'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl border border-slate-100 shadow-sm mb-4 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-teal-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'About' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            {worker.bio && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">About</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{worker.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Languages className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Languages</div>
                  <div className="text-sm text-slate-800">
                    {(worker.languages || ['Hindi', 'English']).join(', ')}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Working Hours</div>
                  <div className="text-sm text-slate-800">
                    {worker.workingHours || '8 AM – 8 PM'}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Location</div>
                  <div className="text-sm text-slate-800">
                    {worker.city || 'Mumbai'}, {worker.pincode || '400001'}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Experience</div>
                  <div className="text-sm text-slate-800">
                    {worker.experience || '5+ years'}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(worker.skills || ['Wiring', 'Switchboard', 'AC Repair', 'Fan Installation']).map((skill) => (
                  <span key={skill} className="badge-teal text-xs">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Reviews' && (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {r.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{r.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">{r.date}</span>
                </div>
                <StarRow rating={r.rating} />
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Pricing' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-600">Hourly Rate</span>
              <span className="text-lg font-bold text-teal-600">
                ₹{worker.hourlyRate || 350}/hr
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-600">Minimum Charge</span>
              <span className="text-base font-semibold text-slate-800">
                ₹{worker.minimumCharge || 500}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-600">Visit Charge</span>
              <span className="text-base font-semibold text-slate-800">
                ₹{worker.visitCharge || 150} (refunded on booking)
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                💡 Prices may vary based on the scope of work. Final price is agreed before work starts.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-slate-100 shadow-lg px-4 py-3 safe-bottom">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
            onClick={() => navigate(`/customer/call/${worker.id}`)}
          >
            <Phone className="w-4 h-4" /> Call Worker
          </button>
          <button
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            onClick={() => navigate(`/customer/book/${worker.id}`)}
          >
            Book Now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
