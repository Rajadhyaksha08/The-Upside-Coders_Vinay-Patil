import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import OTPInput from '../../components/OTPInput';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function ArrivalOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Expected OTP in demo is 4821 or 7842
  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the full 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      // For demo, accept 4821 or 7842, or any 4 digit if user tries
      if (otp === '4821' || otp === '7842' || otp === '1234' || otp.length === 4) {
        toast.success('Arrival Confirmed! Work time tracking started.');
        navigate('/worker/complete-otp');
      } else {
        setError('Invalid OTP. Please check the code on customer screen.');
        toast.error('Invalid OTP');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="text-center space-y-2 pt-4">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 border-2 border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
            <MapPin className="w-8 h-8 animate-bounce" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Arrival Verification
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Ask the customer for the 4-digit code shown on their SevaSaathi app before entering.
          </p>
        </div>

        {/* Current Job Brief */}
        <div className="card p-4 border border-teal-100 bg-white space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Assigned Customer</span>
            <span className="font-bold text-slate-800">Priya Sharma</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Location</span>
            <span className="font-medium text-slate-700">45, Rose Garden, Gurugram</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-400">Agreed Price</span>
            <span className="font-bold text-teal-700">₹550</span>
          </div>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="card p-6 space-y-5 text-center shadow-md">
          <div>
            <label className="label text-center mb-4">Enter 4-Digit Arrival Code</label>
            <OTPInput length={4} value={otp} onChange={setOtp} />
            {error && (
              <p className="text-xs text-red-500 mt-3 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-4">
              Demo hint: Customer arrival code is <span className="font-mono font-bold text-teal-700">4821</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 4}
            className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Confirm Arrival & Start Work'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3.5 bg-slate-100/70 rounded-xl flex items-start gap-2.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <span>
            Verifying the code ensures guaranteed payment release and insurance coverage under the SevaSaathi Partner Charter.
          </span>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
