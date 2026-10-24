import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Loader2, AlertTriangle, CheckCircle, Calendar, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import BottomNav from '../../components/BottomNav';
import StepIndicator from '../../components/StepIndicator';
import { WORKERS, SERVICES } from '../../data/mockData';

const TIME_SLOTS = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
];

const BUDGET_MIN = 100;
const BUDGET_MAX = 5000;

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function genCode() {
  return Math.random().toString(36).toUpperCase().slice(2, 8);
}

const todayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export default function BookingFlow() {
  const navigate = useNavigate();
  const { id: workerId } = useParams();

  const worker = (WORKERS || []).find((w) => w.id === workerId) || (WORKERS || [])[0];
  const service = (SERVICES || []).find((s) => (worker?.services || []).includes(s.id)) || (SERVICES || [])[0];

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [code] = useState(genCode());

  // Step 2
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');

  // Step 3
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  // Step 4
  const [budget, setBudget] = useState(1500);
  const [notes, setNotes] = useState('');

  const steps = ['Confirm Service', 'Your Address', 'Date & Time', 'Budget', 'Review'];

  const validate = () => {
    const e = {};
    if (step === 2) {
      if (!address.trim()) e.address = 'Address is required.';
      if (!pincode || pincode.length !== 6) e.pincode = 'Enter a valid 6-digit PIN code.';
    }
    if (step === 3) {
      if (!date) e.date = 'Please select a date.';
      if (!timeSlot) e.timeSlot = 'Please select a time slot.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < 5) setStep((s) => s + 1);
  };
  const back = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const confirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    toast.success(`Booking confirmed! Code: ${code}`, { duration: 4000 });
    navigate('/customer/track/b_new');
  };

  const budgetPercent = ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
  const workerRate = worker?.hourlyRate || 350;
  const budgetWarn = budget < workerRate;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          onClick={step === 1 ? () => navigate(-1) : back}
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-medium">Step {step} of {steps.length}</p>
          <h1 className="text-base font-bold text-slate-900">{steps[step - 1]}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <StepIndicator currentStep={step} steps={steps} />

        {/* ── Step 1: Confirm Service ───────────────────────── */}
        {step === 1 && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="text-4xl">{service?.icon || '🔧'}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{service?.name || 'Service'}</h3>
                  <p className="text-sm text-slate-500">{service?.description || ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-base">
                  {getInitials(worker?.name)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{worker?.name}</div>
                  <div className="text-sm text-teal-600 font-semibold">₹{workerRate}/hr</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Address ───────────────────────────────── */}
        {step === 2 && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div>
                <label className="label">Full Address *</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setErrors((er) => ({ ...er, address: '' })); }}
                  placeholder="House no., Street, Area…"
                  className={`input-field resize-none ${errors.address ? 'border-red-400' : ''}`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="label">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near school, opposite temple…"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">PIN Code *</label>
                <input
                  type="tel"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setErrors((er) => ({ ...er, pincode: '' })); }}
                  placeholder="400001"
                  className={`input-field ${errors.pincode ? 'border-red-400' : ''}`}
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Date & Time ───────────────────────────── */}
        {step === 3 && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" /> Date *
                </label>
                <input
                  type="date"
                  min={todayStr()}
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setErrors((er) => ({ ...er, date: '' })); }}
                  className={`input-field ${errors.date ? 'border-red-400' : ''}`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" /> Time Slot *
                </label>
                {errors.timeSlot && <p className="text-red-500 text-xs mb-2">{errors.timeSlot}</p>}
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => { setTimeSlot(slot); setErrors((er) => ({ ...er, timeSlot: '' })); }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        timeSlot === slot
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Budget & Notes ────────────────────────── */}
        {step === 4 && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Your Budget</label>
                  <span className="text-lg font-bold text-teal-600">
                    ₹{budget.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={100}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${budgetPercent}%, #e2e8f0 ${budgetPercent}%, #e2e8f0 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>₹{BUDGET_MIN}</span>
                  <span>₹{BUDGET_MAX.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Rate comparison */}
              <div className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
                budgetWarn ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'
              }`}>
                {budgetWarn
                  ? <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  : <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                }
                <p className={budgetWarn ? 'text-amber-700' : 'text-green-700'}>
                  {budgetWarn
                    ? `Your budget (₹${budget}) is below this worker's rate (₹${workerRate}/hr). The worker may request more.`
                    : `Your budget covers this worker's rate of ₹${workerRate}/hr. ✓`
                  }
                </p>
              </div>

              <div>
                <label className="label">Additional Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the problem or any special instructions…"
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Review ────────────────────────────────── */}
        {step === 5 && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-slate-900 mb-2">Booking Summary</h3>
              {[
                { label: 'Service', value: service?.name || 'Service' },
                { label: 'Worker', value: worker?.name || 'Worker' },
                { label: 'Rate', value: `₹${workerRate}/hr` },
                { label: 'Date', value: date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                { label: 'Time', value: timeSlot || '—' },
                { label: 'Address', value: address || '—' },
                { label: 'Landmark', value: landmark || 'None' },
                { label: 'PIN Code', value: pincode || '—' },
                { label: 'Budget', value: `₹${budget.toLocaleString('en-IN')}` },
                { label: 'Notes', value: notes || 'None' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500 font-medium w-28 shrink-0">{label}</span>
                  <span className="text-sm text-slate-800 font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>

            <button
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
              onClick={confirm}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Confirming…</>
              ) : (
                <>Confirm Booking <CheckCircle className="w-5 h-5" /></>
              )}
            </button>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 5 && (
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
                onClick={back}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
              onClick={next}
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
