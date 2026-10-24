import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Star, Shield } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import WorkerCard from '../../components/WorkerCard';
import { WORKERS, SERVICES } from '../../data/mockData';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'distance', label: 'Distance' },
  { value: 'price', label: 'Price' },
];

function ShimmerCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="shimmer w-14 h-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="shimmer h-4 w-32 rounded" />
          <div className="shimmer h-3 w-20 rounded" />
        </div>
      </div>
      <div className="shimmer h-3 w-full rounded mb-2" />
      <div className="shimmer h-3 w-3/4 rounded mb-3" />
      <div className="shimmer h-9 w-full rounded-lg" />
    </div>
  );
}

export default function WorkerList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const serviceId = searchParams.get('serviceId');
  const pincode = searchParams.get('pincode') || '';
  const budget = Number(searchParams.get('budget')) || 5000;

  const [sortBy, setSortBy] = useState('rating');
  const [aadhaarOnly, setAadhaarOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const service = (SERVICES || []).find((s) => s.id === serviceId);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const workers = useMemo(() => {
    let list = (WORKERS || []).filter((w) => {
      const matchesService = !serviceId || (w.services || []).includes(serviceId);
      const matchesAadhaar = !aadhaarOnly || w.aadhaarVerified;
      return matchesService && matchesAadhaar;
    });

    if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === 'price') list = [...list].sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
    if (sortBy === 'distance') list = [...list].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    return list;
  }, [serviceId, aadhaarOnly, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="page-header flex items-center gap-3 sticky top-0 z-30">
        <button
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1">Available Workers</h1>
        {!loading && (
          <span className="badge bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {workers.length}
          </span>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Context info */}
        {(service || pincode) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {service && (
              <span className="badge-teal flex items-center gap-1 text-xs">
                {service.icon} {service.name}
              </span>
            )}
            {pincode && (
              <span className="badge-slate text-xs">📍 {pincode}</span>
            )}
          </div>
        )}

        {/* Sort & filter bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-semibold text-teal-600 bg-transparent border-none outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Aadhaar toggle */}
          <button
            onClick={() => setAadhaarOnly((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              aadhaarOnly
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Aadhaar Only
          </button>
        </div>

        {/* Worker list */}
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map((i) => <ShimmerCard key={i} />)
          ) : workers.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">😔</span>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No workers found</h3>
              <p className="text-slate-500 text-sm mb-5">
                Try a wider radius or remove the Aadhaar filter
              </p>
              <button
                className="btn-secondary"
                onClick={() => navigate('/customer/search')}
              >
                Adjust Search
              </button>
            </div>
          ) : (
            workers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                showDistance
                onClick={() => navigate(`/customer/worker/${worker.id}`)}
              />
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
