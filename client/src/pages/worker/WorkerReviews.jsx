import React from 'react';
import { Star, ShieldCheck, ThumbsUp } from 'lucide-react';
import { WORKERS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function WorkerReviews() {
  const { user } = useAuth();
  const worker = WORKERS.find((w) => w.id === user?.id) || WORKERS[0];

  const ratingCounts = [
    { star: 5, pct: '88%' },
    { star: 4, pct: '9%' },
    { star: 3, pct: '2%' },
    { star: 2, pct: '1%' },
    { star: 1, pct: '0%' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Ratings & Reviews</h1>
          <p className="text-xs text-slate-500">Genuine reviews verified by arrival OTP authentication</p>
        </div>

        {/* Rating Summary Card */}
        <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:border-r sm:pr-6 border-slate-100 flex-shrink-0">
            <h2 className="text-5xl font-black text-slate-900">{worker.rating}</h2>
            <div className="flex justify-center my-1.5">
              <StarRating rating={worker.rating} size="md" readonly />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Based on {worker.reviewCount} customer reviews
            </p>
          </div>

          <div className="flex-1 w-full space-y-2">
            {ratingCounts.map((rc) => (
              <div key={rc.star} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-slate-500 font-bold">{rc.star}★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: rc.pct }}
                  />
                </div>
                <span className="w-8 text-right text-slate-400 text-[11px]">{rc.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 text-sm">Customer Comments</h3>
          {worker.reviews && worker.reviews.map((r) => (
            <div key={r.id} className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {r.name.slice(0, 1)}
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs">{r.name}</h4>
                </div>
                <span className="text-[11px] text-slate-400">{r.date}</span>
              </div>
              <StarRating rating={r.rating} size="sm" readonly />
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
