import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, SlidersHorizontal, ChevronRight, AlertCircle } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import ServiceCard from '../../components/ServiceCard';
import { SERVICES } from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';

const RADIUS_OPTIONS = [5, 10, 15];
const BUDGET_MIN = 100;
const BUDGET_MAX = 5000;

export default function ServiceSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSearchParams } = useBooking ? useBooking() : { setSearchParams: () => {} };

  const preselectedService = location.state?.serviceId || null;

  const [query, setQuery] = useState('');
  const [pincode, setPincode] = useState('');
  const [radius, setRadius] = useState(10);
  const [budget, setBudget] = useState(1500);
  const [selectedCategory, setSelectedCategory] = useState(preselectedService);
  const [pincodeError, setPincodeError] = useState('');

  const categories = useMemo(() => SERVICES || [], []);

  const filteredServices = useMemo(() => {
    return categories.filter((s) => {
      const matchesQuery = query.trim() === '' ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !selectedCategory || s.id === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, selectedCategory, categories]);

  const handleFindWorkers = () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeError('Please enter a valid 6-digit PIN code.');
      return;
    }
    setPincodeError('');

    if (typeof setSearchParams === 'function') {
      setSearchParams({ pincode, radius, budget, serviceId: selectedCategory });
    }

    const params = new URLSearchParams({
      pincode,
      radius: radius.toString(),
      budget: budget.toString(),
      ...(selectedCategory ? { serviceId: selectedCategory } : {}),
    });
    navigate(`/customer/workers?${params.toString()}`);
  };

  const budgetPercent = ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      {/* Header */}
      <div className="page-header flex items-center gap-3 sticky top-0 z-30">
        <button
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1">Find a Service</h1>
        <SlidersHorizontal className="w-5 h-5 opacity-70" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Search input */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for electrician, plumber…"
            className="input-field pl-11"
          />
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-semibold text-slate-700">Your Location</span>
          </div>
          <input
            type="tel"
            maxLength={6}
            value={pincode}
            onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setPincodeError(''); }}
            placeholder="Enter PIN code (e.g. 400001)"
            className={`input-field mb-2 ${pincodeError ? 'border-red-400 focus:ring-red-300' : ''}`}
          />
          {pincodeError && (
            <div className="flex items-center gap-1.5 text-red-500 text-xs mb-2">
              <AlertCircle className="w-3.5 h-3.5" /> {pincodeError}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 mr-1">Radius:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  radius === r
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Budget slider */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Budget</span>
            <span className="text-base font-bold text-teal-600">
              ₹{budget.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="relative">
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
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>₹{BUDGET_MIN}</span>
            <span>₹{BUDGET_MAX.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Category chips */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-slate-700 mb-2">Category</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`snap-start shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                !selectedCategory
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              All
            </button>
            {categories.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedCategory(s.id === selectedCategory ? null : s.id)}
                className={`snap-start shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === s.id
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                <span>{s.icon}</span> {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results grid */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
          </p>
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-sm font-medium">No services match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  compact
                  selected={selectedCategory === service.id}
                  onClick={() => setSelectedCategory(service.id === selectedCategory ? null : service.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 safe-bottom">
        <div className="max-w-2xl mx-auto">
          <button
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-lg"
            onClick={handleFindWorkers}
          >
            Find Workers <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
