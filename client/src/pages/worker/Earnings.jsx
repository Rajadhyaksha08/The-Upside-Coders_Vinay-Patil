import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Download, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function Earnings() {
  const [activeTab, setActiveTab] = useState('week');
  const [withdrawing, setWithdrawing] = useState(false);
  const [balance, setBalance] = useState(4850);

  const transactions = [
    { id: 't1', service: 'Electrician - Inverter Repair', customer: 'Priya S.', date: 'Today, 2:30 PM', amount: 550, status: 'Completed' },
    { id: 't2', service: 'Electrician - Switchboard Fix', customer: 'Ajay M.', date: 'Yesterday', amount: 400, status: 'Completed' },
    { id: 't3', service: 'Electrician - Ceiling Fan Wiring', customer: 'Rohan K.', date: '22 Oct', amount: 650, status: 'Completed' },
    { id: 't4', service: 'Bank Withdrawal to UPI', customer: 'HDFC Bank ••3821', date: '21 Oct', amount: -2500, status: 'Withdrawn' },
    { id: 't5', service: 'Electrician - Geyser Connection', customer: 'Sanjay G.', date: '20 Oct', amount: 750, status: 'Completed' },
    { id: 't6', service: 'Electrician - MCB Trip Fix', customer: 'Sunita R.', date: '19 Oct', amount: 500, status: 'Completed' },
  ];

  const handleWithdraw = () => {
    if (balance <= 0) {
      toast.error('No balance to withdraw');
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setBalance(0);
      toast.success('₹4,850 transferred to UPI ID: 9876543210@upi 🚀');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Partner Earnings</h1>
            <p className="text-xs text-slate-500">Real-time ledger and instant UPI settlement</p>
          </div>
          <span className="badge badge-teal text-xs py-1 px-3">UPI Instant</span>
        </div>

        {/* Balance Card */}
        <div className="card p-6 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider">
                Available Wallet Balance
              </p>
              <h2 className="text-3xl sm:text-4xl font-black mt-1 text-white tracking-tight">
                ₹{balance.toLocaleString('en-IN')}
              </h2>
              <p className="text-teal-300 text-xs mt-2 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> 0% Platform commission active
              </p>
            </div>
            <div className="p-3 bg-teal-700/50 rounded-2xl border border-teal-500/30">
              <Wallet className="w-7 h-7 text-teal-200" />
            </div>
          </div>

          <div className="pt-6 relative z-10 flex gap-2">
            <button
              onClick={handleWithdraw}
              disabled={withdrawing || balance <= 0}
              className="flex-1 bg-white hover:bg-slate-100 text-teal-900 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow"
            >
              <ArrowUpRight className="w-4 h-4" />
              {withdrawing ? 'Processing UPI Transfer...' : 'Withdraw to Bank / UPI'}
            </button>
          </div>
        </div>

        {/* Time Tabs */}
        <div className="flex gap-2 text-xs">
          {[
            { id: 'week', label: 'This Week (₹4,850)' },
            { id: 'month', label: 'This Month (₹18,400)' },
            { id: 'all', label: 'All Time (₹64,200)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions Ledger */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Passbook History</h3>
            <span className="text-xs text-slate-400">Recent 6 transactions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{tx.service}</h4>
                    <p className="text-[11px] text-slate-400">{tx.customer} • {tx.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-black ${
                      tx.amount > 0 ? 'text-teal-700' : 'text-slate-600'
                    }`}
                  >
                    {tx.amount > 0 ? `+₹${tx.amount}` : `₹${Math.abs(tx.amount)}`}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
