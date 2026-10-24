import React, { useState } from 'react';
import { Gift, Copy, Check, Share2, Users, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'SAATHI-RK482';

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = `Join SevaSaathi as a skilled worker and start receiving direct customer bookings with 0% commission! Use my referral code: ${referralCode}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Refer & Earn</h1>
          <p className="text-xs text-slate-500">
            Invite fellow skilled workers to join the SevaSaathi community
          </p>
        </div>

        {/* Hero Reward Banner */}
        <div className="card p-6 bg-gradient-to-r from-teal-700 to-teal-900 text-white rounded-2xl shadow-md text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-3xl shadow-inner border border-white/20">
            🎁
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">Earn ₹100 for Every Saathi</h2>
            <p className="text-teal-200 text-xs mt-1 max-w-sm mx-auto">
              When your invited electrician, plumber, or maid completes their first job, both of you receive ₹100 directly in UPI.
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-xl max-w-xs mx-auto border border-white/20">
            <span className="text-[11px] text-teal-200 uppercase tracking-wider block">Total Referral Earned</span>
            <span className="text-2xl font-black text-white">₹350.00</span>
          </div>
        </div>

        {/* Referral Code Box */}
        <div className="card p-5 space-y-3">
          <label className="label">Your Exclusive Referral Code</label>
          <div className="flex gap-2">
            <div className="input-field font-mono font-bold text-base text-teal-800 bg-slate-50 flex items-center justify-between">
              <span>{referralCode}</span>
            </div>
            <button
              onClick={handleCopy}
              className="btn-primary flex items-center gap-1.5 px-4 text-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <button
            onClick={handleWhatsAppShare}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share with friends on WhatsApp
          </button>
        </div>

        {/* How It Works */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">3 Easy Steps to Reward</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-bold text-slate-800">Share your link or code</p>
                <p className="text-slate-500">Send your code via WhatsApp or SMS to your friends.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-bold text-slate-800">Friend signs up & verifies Aadhaar</p>
                <p className="text-slate-500">They register their skills and start receiving job offers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-bold text-slate-800">Instant ₹100 Bonus in Wallet</p>
                <p className="text-slate-500">Credited automatically upon their 1st completed order.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
