import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Award, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import OTPInput from '../../components/OTPInput';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function CompletionOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = (e) => {
    e.preventDefault();
    if (otp.length < 4) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsCompleted(true);
      toast.success('Job marked completed! Payment transferred.');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-6 space-y-6">
        {!isCompleted ? (
          <>
            <div className="text-center space-y-2 pt-4">
              <div className="w-16 h-16 rounded-3xl bg-green-50 border-2 border-green-200 text-green-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Complete Job & Collect
              </h1>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Once customer inspects the service, ask them for their 4-digit Completion OTP to release your earnings.
              </p>
            </div>

            {/* Bill Summary */}
            <div className="card p-5 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Payout Breakdown</h3>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Agreed Service Charges</span>
                <span className="font-semibold text-slate-700">₹550.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Platform Commission (0% Promo)</span>
                <span className="text-green-600 font-semibold">₹0.00</span>
              </div>
              <div className="pt-2 border-t flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Total Receivable</span>
                <span className="text-xl font-black text-teal-700">₹550.00</span>
              </div>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleComplete} className="card p-6 space-y-5 text-center shadow-md">
              <div>
                <label className="label text-center mb-4">Enter Customer Completion OTP</label>
                <OTPInput length={4} value={otp} onChange={setOtp} />
                <p className="text-[11px] text-slate-400 mt-4">
                  Demo hint: Code is <span className="font-mono font-bold text-teal-700">9034</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full btn-primary bg-green-600 hover:bg-green-700 py-3.5 text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Verify & Close Job'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="card p-8 text-center space-y-5 border-2 border-green-500 bg-green-50/30">
            <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">Job Finished! 🎉</h2>
              <p className="text-sm text-slate-600 mt-1">
                ₹550 has been credited to your SevaSaathi wallet.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-green-200 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono text-slate-700">TXN-892401</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Rating</span>
                <span className="text-amber-500 font-bold">5.0 ★ (Pending review)</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/worker')}
              className="w-full btn-primary text-sm py-3"
            >
              Back to Worker Home
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
