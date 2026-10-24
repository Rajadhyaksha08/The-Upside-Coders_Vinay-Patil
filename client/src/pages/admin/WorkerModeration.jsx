import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Search,
  Filter,
  UserCheck,
  Ban,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { WORKERS } from '../../data/mockData';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function WorkerModeration() {
  const [workersList, setWorkersList] = useState(
    WORKERS.map((w) => ({
      ...w,
      status: w.verified ? 'approved' : 'pending',
    }))
  );

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const handleAction = (workerId, newStatus, message) => {
    setWorkersList((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, status: newStatus, verified: newStatus === 'approved' } : w))
    );
    toast.success(message);
  };

  const filtered = workersList.filter((w) => {
    const matchesFilter = filter === 'all' || w.status === filter;
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      w.city.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Worker Verification & Moderation</h1>
          <p className="text-xs text-slate-500">
            Audit Aadhaar credentials, background checks, and community compliance
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by worker name, skill, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 text-xs py-2.5"
            />
          </div>

          <div className="flex gap-2 text-xs">
            {['all', 'pending', 'approved', 'suspended'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Workers List Table / Cards */}
        <div className="space-y-3">
          {filtered.map((worker) => (
            <div
              key={worker.id}
              className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-full ${worker.avatarColor} text-white font-bold text-base flex items-center justify-center flex-shrink-0`}
                >
                  {worker.initials || 'W'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">{worker.name}</h3>
                    <span
                      className={`badge text-[10px] ${
                        worker.status === 'approved'
                          ? 'badge-green'
                          : worker.status === 'pending'
                          ? 'badge-amber'
                          : 'badge-red'
                      }`}
                    >
                      {worker.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {worker.skills.slice(0, 2).join(', ')} • {worker.city} • PIN {worker.pincode}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>Exp: {worker.experience}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-teal-700 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      {worker.aadhaarVerified ? 'Aadhaar Verified' : 'Aadhaar Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {worker.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(worker.id, 'approved', `${worker.name} Approved & Activated!`)}
                      className="btn-primary py-2 px-3 text-xs flex items-center gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(worker.id, 'suspended', `${worker.name} Application Rejected`)}
                      className="btn-ghost text-red-600 hover:bg-red-50 py-2 px-3 text-xs flex items-center gap-1 border border-red-200"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}

                {worker.status === 'approved' && (
                  <button
                    onClick={() => handleAction(worker.id, 'suspended', `${worker.name} Temporarily Suspended`)}
                    className="btn-ghost text-amber-700 hover:bg-amber-50 py-2 px-3 text-xs flex items-center gap-1 border border-amber-200"
                  >
                    <Ban className="w-3.5 h-3.5" /> Suspend
                  </button>
                )}

                {worker.status === 'suspended' && (
                  <button
                    onClick={() => handleAction(worker.id, 'approved', `${worker.name} Reinstated!`)}
                    className="btn-primary py-2 px-3 text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reinstate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
