import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User, Phone, Calendar, MapPin, Camera, Briefcase, Clock,
  DollarSign, Shield, ChevronRight, ChevronLeft, Check
} from "lucide-react";
import OTPInput from "../../components/OTPInput";

const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune"];

const SERVICES = [
  { id: "plumber", label: "Plumber", icon: "🔧" },
  { id: "electrician", label: "Electrician", icon: "⚡" },
  { id: "carpenter", label: "Carpenter", icon: "🪚" },
  { id: "cook", label: "Cook", icon: "👨‍🍳" },
  { id: "cleaner", label: "Cleaner", icon: "🧹" },
  { id: "painter", label: "Painter", icon: "🖌️" },
  { id: "ac_repair", label: "AC Repair", icon: "❄️" },
  { id: "driver", label: "Driver", icon: "🚗" },
  { id: "security", label: "Security", icon: "🛡️" },
  { id: "gardener", label: "Gardener", icon: "🌿" },
];

const SKILLS_BY_SERVICE = {
  plumber: ["Pipe Fitting", "Leak Repair", "Bathroom Fitting", "Drainage", "Water Tank"],
  electrician: ["Wiring", "MCB Fitting", "Fan Installation", "AC Wiring", "CCTV"],
  carpenter: ["Furniture Repair", "Door Fitting", "Modular Kitchen", "Polishing", "POP"],
  cook: ["North Indian", "South Indian", "Chinese", "Continental", "Baking", "Biryani"],
  cleaner: ["Home Cleaning", "Deep Cleaning", "Sofa Cleaning", "Kitchen Cleaning", "Post-Renovation"],
  painter: ["Wall Painting", "Texture", "Waterproofing", "Wood Painting", "POP Design"],
  ac_repair: ["AC Service", "Gas Refill", "Installation", "PCB Repair", "Compressor"],
  driver: ["Car", "Truck", "Cab", "Outstation", "Night Shift"],
  security: ["CCTV", "Access Control", "Guard Duty", "Patrol", "Alarm Systems"],
  gardener: ["Lawn Mowing", "Plant Care", "Pruning", "Landscaping", "Pest Control"],
};

const LANGUAGES = ["Hindi", "English", "Marathi", "Tamil", "Telugu", "Kannada", "Bengali", "Gujarati"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
});

const StepIndicator = ({ steps, current }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    {steps.map((step, idx) => (
      <React.Fragment key={idx}>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            idx < current ? "bg-teal-600 text-white" :
            idx === current ? "bg-teal-600 text-white ring-4 ring-teal-100" :
            "bg-slate-200 text-slate-500"
          }`}>
            {idx < current ? <Check size={14} /> : idx + 1}
          </div>
          <span className={`text-xs mt-1 font-medium ${idx === current ? "text-teal-600" : "text-slate-400"}`}>
            {step}
          </span>
        </div>
        {idx < steps.length - 1 && (
          <div className={`h-0.5 w-8 mb-4 ${idx < current ? "bg-teal-600" : "bg-slate-200"}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default function WorkerRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [form, setForm] = useState({
    fullName: "", phone: "", dob: "", city: "", pin: "", photo: null,
    service: "", skills: [], experience: "", languages: [],
    rateType: "hourly", rate: "", minCharge: "", startTime: "8:00 AM", endTime: "8:00 PM",
    days: [], radius: 10,
    aadhaar: "", aadhaarOtp: "",
  });
  const [errors, setErrors] = useState({});

  const steps = ["Personal Info", "Skills", "Pricing", "Aadhaar"];

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleArr = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));
  };

  const formatAadhaar = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" ")
    );
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.fullName.trim()) e.fullName = "Name is required";
      if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter valid 10-digit mobile number";
      if (!form.dob) e.dob = "Date of birth is required";
      if (!form.city) e.city = "Select your city";
      if (!/^\d{6}$/.test(form.pin)) e.pin = "Enter valid 6-digit PIN code";
    }
    if (step === 1) {
      if (!form.service) e.service = "Select a service";
      if (!form.experience) e.experience = "Select experience";
      if (form.languages.length === 0) e.languages = "Select at least one language";
    }
    if (step === 2) {
      if (!form.rate) e.rate = "Enter your rate";
      if (form.days.length === 0) e.days = "Select at least one working day";
    }
    if (step === 3) {
      if (form.aadhaar.replace(/\s/g, "").length !== 12) e.aadhaar = "Enter valid 12-digit Aadhaar";
      if (!otpVerified) e.otp = "Please verify OTP";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSendOtp = () => {
    if (form.aadhaar.replace(/\s/g, "").length !== 12) {
      setErrors(e => ({ ...e, aadhaar: "Enter valid 12-digit Aadhaar" }));
      return;
    }
    setLoading(true);
    setTimeout(() => { setOtpSent(true); setLoading(false); toast.success("OTP sent to Aadhaar-linked mobile!"); }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) { setOtpVerified(true); toast.success("Aadhaar verified successfully!"); }
    else { toast.error("Invalid OTP. Try again."); }
  };

  const handleSubmit = () => {
    if (!validateStep()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); toast.success("Welcome to SevaSaathi! Profile under review."); navigate("/worker"); }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-teal-600 text-white px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Join as Worker</h1>
        <p className="text-teal-100 text-sm mt-1">Start earning with SevaSaathi</p>
      </div>
      <div className="max-w-lg mx-auto px-4">
        <StepIndicator steps={steps} current={step} />

        {step === 0 && (
          <div className="card mb-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User size={20} className="text-teal-600" /> Personal Info
            </h2>
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-2 border-dashed border-teal-400 hover:bg-teal-50 transition">
                <Camera size={28} className="text-teal-600" />
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={e => update("photo", e.target.files[0])} />
                <span className="text-sm text-teal-600 font-medium">Upload Profile Photo</span>
              </label>
              {form.photo && <span className="text-xs text-slate-500">{form.photo.name}</span>}
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input className={`input-field ${errors.fullName ? "border-red-400" : ""}`} placeholder="Ramesh Kumar" value={form.fullName} onChange={e => update("fullName", e.target.value)} />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="label">Mobile Number *</label>
              <div className={`flex rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 bg-white transition-all shadow-sm ${errors.phone ? "border-red-400" : "border-slate-200"}`}>
                <span className="inline-flex items-center px-4 bg-slate-50 text-slate-600 font-bold text-sm border-r border-slate-200 select-none">
                  +91
                </span>
                <input
                  className="w-full px-4 py-3 text-sm font-semibold tracking-wide text-slate-800 placeholder:text-slate-400 focus:outline-none bg-white"
                  placeholder="9876543210"
                  value={form.phone}
                  maxLength={10}
                  onChange={e => update("phone", e.target.value.replace(/\D/g, ""))}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="label">Date of Birth *</label>
              <input type="date" className={`input-field ${errors.dob ? "border-red-400" : ""}`} value={form.dob} onChange={e => update("dob", e.target.value)} />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>
            <div>
              <label className="label">City *</label>
              <select className={`input-field ${errors.city ? "border-red-400" : ""}`} value={form.city} onChange={e => update("city", e.target.value)}>
                <option value="">Select City</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="label">PIN Code *</label>
              <input className={`input-field ${errors.pin ? "border-red-400" : ""}`} placeholder="110001" value={form.pin} maxLength={6} onChange={e => update("pin", e.target.value.replace(/\D/g, ""))} />
              {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin}</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="card mb-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={20} className="text-teal-600" /> Skills & Services
            </h2>
            <div>
              <label className="label mb-2">Select Primary Service *</label>
              <div className="grid grid-cols-5 gap-2">
                {SERVICES.map(s => (
                  <button key={s.id} onClick={() => update("service", s.id)} className={`flex flex-col items-center p-2 rounded-xl border-2 transition text-xs font-medium ${form.service === s.id ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"}`}>
                    <span className="text-2xl mb-1">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
              {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
            </div>
            {form.service && (
              <div>
                <label className="label mb-2">Additional Skills</label>
                <div className="flex flex-wrap gap-2">
                  {(SKILLS_BY_SERVICE[form.service] || []).map(skill => (
                    <button key={skill} onClick={() => toggleArr("skills", skill)} className={`px-3 py-1 rounded-full text-sm border transition ${form.skills.includes(skill) ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"}`}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="label">Experience *</label>
              <select className={`input-field ${errors.experience ? "border-red-400" : ""}`} value={form.experience} onChange={e => update("experience", e.target.value)}>
                <option value="">Select Experience</option>
                {["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"].map(x => <option key={x}>{x}</option>)}
              </select>
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>
            <div>
              <label className="label mb-2">Languages Spoken *</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button key={lang} onClick={() => toggleArr("languages", lang)} className={`px-3 py-1 rounded-full text-sm border transition ${form.languages.includes(lang) ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-600 border-slate-300 hover:border-amber-400"}`}>
                    {lang}
                  </button>
                ))}
              </div>
              {errors.languages && <p className="text-red-500 text-xs mt-1">{errors.languages}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card mb-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign size={20} className="text-teal-600" /> Pricing & Availability
            </h2>
            <div>
              <label className="label mb-2">Rate Type</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                {["hourly", "fixed"].map(type => (
                  <button key={type} onClick={() => update("rateType", type)} className={`flex-1 py-2 text-sm font-medium transition capitalize ${form.rateType === type ? "bg-teal-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                    {type === "hourly" ? "⏱ Hourly" : "📋 Fixed"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Rate Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                <input className={`input-field pl-7 ${errors.rate ? "border-red-400" : ""}`} placeholder={form.rateType === "hourly" ? "250 per hour" : "500 per job"} value={form.rate} type="number" onChange={e => update("rate", e.target.value)} />
              </div>
              {errors.rate && <p className="text-red-500 text-xs mt-1">{errors.rate}</p>}
            </div>
            <div>
              <label className="label">Minimum Charge</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                <input className="input-field pl-7" placeholder="200" type="number" value={form.minCharge} onChange={e => update("minCharge", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start Time</label>
                <select className="input-field" value={form.startTime} onChange={e => update("startTime", e.target.value)}>
                  {HOURS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="label">End Time</label>
                <select className="input-field" value={form.endTime} onChange={e => update("endTime", e.target.value)}>
                  {HOURS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label mb-2">Available Days *</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button key={day} onClick={() => toggleArr("days", day)} className={`px-3 py-1 rounded-full text-sm border transition font-medium ${form.days.includes(day) ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-300"}`}>
                    {day}
                  </button>
                ))}
              </div>
              {errors.days && <p className="text-red-500 text-xs mt-1">{errors.days}</p>}
            </div>
            <div>
              <label className="label mb-2">Service Radius</label>
              <div className="flex gap-3">
                {[5, 10, 15].map(km => (
                  <button key={km} onClick={() => update("radius", km)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition ${form.radius === km ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-600"}`}>
                    {km} km
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card mb-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield size={20} className="text-teal-600" /> Aadhaar Verification
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
              🔒 Your Aadhaar details are encrypted and used only for identity verification. We do not store your full Aadhaar number.
            </div>
            <div>
              <label className="label">Aadhaar Number *</label>
              <input className={`input-field tracking-widest text-lg font-mono ${errors.aadhaar ? "border-red-400" : ""}`} placeholder="XXXX XXXX XXXX" value={form.aadhaar} onChange={e => update("aadhaar", formatAadhaar(e.target.value))} maxLength={14} />
              {errors.aadhaar && <p className="text-red-500 text-xs mt-1">{errors.aadhaar}</p>}
            </div>
            {!otpSent ? (
              <button onClick={handleSendOtp} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <span className="animate-spin">⏳</span> : <Phone size={16} />}
                Send OTP to Aadhaar-linked Phone
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center">Enter the 6-digit OTP sent to your Aadhaar-linked mobile</p>
                <div className="flex justify-center">
                  <OTPInput length={6} value={otp} onChange={setOtp} />
                </div>
                {errors.otp && <p className="text-red-500 text-xs text-center">{errors.otp}</p>}
                {otpVerified ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                    <Check size={18} /> Aadhaar Verified!
                  </div>
                ) : (
                  <button onClick={handleVerifyOtp} className="btn-primary w-full">Verify OTP</button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mb-8">
          {step > 0 && (
            <button onClick={handleBack} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <ChevronLeft size={18} /> Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading || !otpVerified} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <span className="animate-spin">⏳</span> : <Check size={18} />}
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
