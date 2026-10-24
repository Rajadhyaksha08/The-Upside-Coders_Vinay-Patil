import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { DISPUTES } from '../../data/mockData';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function DisputeManagement() {
  const [disputesList, setDisputesList] = useState(DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  const handleResolve = (disputeId, refund = false) => {
    setDisputesList((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: 'resolved',
              resolution: refund
                ? '50% Service fee refunded to customer. Worker issued warning.'
                : resolutionText || 'Issue clarified and mutually resolved.',
            }
          : d
      )
    );
    setSelectedDispute(null);
    setResolutionText('');
    toast.success(refund ? 'Dispute Resolved & Refund Initiated' : 'Dispute Marked as Resolved');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dispute & Grievance Resolution</h1>
          <p className="text-xs text-slate-500">
            Fair mediation between service partners and homeowners
          </p>
        </div>

        {/* Dispute Cards */}
        <div className="space-y-4">
          {disputesList.map((d) => (
            <div key={d.id} className="card p-5 border-l-4 border-l-amber-500 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`badge text-[10px] font-bold ${
                      d.priority === 'high'
                        ? 'badge-red'
                        : d.priority === 'medium'
                        ? 'badge-amber'
                        : 'badge-teal'
                    }`}
                  >
                    {d.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="text-xs font-mono text-slate-400">Order #{d.bookingId}</span>
                  <span className="text-xs font-semibold text-slate-800">• {d.service}</span>
                </div>

                <span
                  className={`badge self-start sm:self-auto text-xs ${
                    d.status === 'resolved'
                      ? 'badge-green'
                      : d.status === 'under_review'
                      ? 'badge-amber'
                      : 'badge-red'
                  }`}
                >
                  {d.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Complainant (Customer):</span>
                  <span className="font-bold text-slate-800">{d.customer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Respondent (Worker):</span>
                  <span className="font-bold text-slate-800">{d.worker}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">Reported Issue: </span>
                  {d.issue}
                </p>
              </div>

              {d.resolution && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-900">
                  <span className="font-bold">Mediator Resolution: </span>
                  {d.resolution}
                </div>
              )}

              {/* Action Buttons */}
              {d.status !== 'resolved' && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleResolve(d.id, true)}
                    className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Approve Partial Refund
                  </button>
                  <button
                    onClick={() => handleResolve(d.id, false)}
                    className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved Without Refund
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
