import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, User, CheckCircle, Zap, Droplets, Home, Wrench,
  Scissors, Truck, Star, ChevronRight, Facebook, Twitter,
  Instagram, Youtube, MapPin, Shield, Phone
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ServiceCard from '../components/ServiceCard';
import { SERVICES } from '../data/mockData';

const STATS = [
  { label: 'Customers', value: '12,450+' },
  { label: 'Verified Workers', value: '847' },
  { label: 'Avg Rating', value: '4.6★' },
  { label: 'Cities', value: '10' },
];

const HOW_IT_WORKS = [
  {
    icon: <Search className="w-8 h-8 text-teal-600" />,
    title: 'Search & Filter',
    desc: 'Enter your PIN code, choose service, set budget',
    step: '01',
  },
  {
    icon: <User className="w-8 h-8 text-teal-600" />,
    title: 'Choose Worker',
    desc: 'See verified workers nearby with ratings & reviews',
    step: '02',
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-teal-600" />,
    title: 'Book & Track',
    desc: 'Get confirmation code, track in real time',
    step: '03',
  },
];

const WORKER_BENEFITS = [
  {
    icon: <Star className="w-7 h-7 text-amber-400" />,
    title: 'Earn More',
    desc: 'Set your own rates and keep 90% of earnings. No hidden deductions.',
  },
  {
    icon: <Shield className="w-7 h-7 text-amber-400" />,
    title: 'Grow Your Reputation',
    desc: 'Build a verified profile with ratings. Aadhaar verification builds customer trust.',
  },
  {
    icon: <Phone className="w-7 h-7 text-amber-400" />,
    title: 'IVR for Basic Phones',
    desc: 'No smartphone needed. Receive jobs via missed calls & SMS on any phone.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredService, setHoveredService] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 -left-10 w-56 h-56 rounded-full bg-teal-400/10 blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block bg-amber-400 text-slate-900 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                🇮🇳 Made in India
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                Seva<span className="text-amber-400">Saathi</span>
              </h1>
              <p className="text-xl sm:text-2xl text-teal-100 font-medium italic mb-3">
                Har kaam ke liye, ek saathi
              </p>
              <p className="text-base sm:text-lg text-white/80 max-w-lg mx-auto md:mx-0 mb-8">
                Book trusted electricians, plumbers, maids &amp; more in minutes.
                PIN-code matched. Aadhaar verified.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  className="btn-primary text-base px-7 py-3 flex items-center justify-center gap-2 shadow-lg"
                  onClick={() => navigate('/login', { state: { role: 'customer' } })}
                >
                  <Search className="w-5 h-5" /> Find a Service
                </button>
                <button
                  className="border-2 border-white text-white hover:bg-white hover:text-teal-700 font-semibold rounded-xl px-7 py-3 transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={() => navigate('/worker/register')}
                >
                  <User className="w-5 h-5" /> Join as Worker
                </button>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-teal-100 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup illustration */}
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="relative w-64 h-80 sm:w-80 sm:h-96">
                <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20" />
                <div className="absolute top-6 left-6 right-6 bg-white/20 rounded-2xl h-12 flex items-center px-4 gap-2">
                  <Search className="w-4 h-4 text-white" />
                  <span className="text-white/70 text-sm">Search services...</span>
                </div>
                <div className="absolute top-24 left-6 right-6 grid grid-cols-3 gap-3">
                  {[Zap, Droplets, Home, Wrench, Scissors, Truck].map((Icon, i) => (
                    <div key={i} className="bg-white/20 rounded-xl p-3 flex flex-col items-center gap-1">
                      <Icon className="w-5 h-5 text-amber-300" />
                      <div className="h-1.5 w-8 bg-white/40 rounded" />
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-teal-500/60 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 font-bold text-sm">RK</div>
                    <div>
                      <div className="h-2 w-24 bg-white/60 rounded mb-1.5" />
                      <div className="h-1.5 w-16 bg-white/40 rounded" />
                    </div>
                    <div className="ml-auto">
                      <div className="text-white text-xs font-semibold bg-green-500 rounded-full px-2 py-0.5">Live</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Grid ───────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            What can we help with?
          </h2>
          <p className="text-slate-500">Choose from 10+ home services, all verified workers</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => navigate('/login', { state: { role: 'customer', service } })}
            />
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">How it works</h2>
            <p className="text-slate-500">Book a service in under 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-14 left-1/4 right-1/4 h-0.5 bg-teal-100" />
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                <div className="relative w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-slate-900 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Worker Benefits ─────────────────────────────────── */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Are you a skilled worker?
            </h2>
            <p className="text-slate-400">Join 847+ verified workers on SevaSaathi</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {WORKER_BENEFITS.map((b, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-teal-600 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-slate-700 flex items-center justify-center mb-4">
                  {b.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2 text-base"
              onClick={() => navigate('/worker/register')}
            >
              Register as Worker <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-slate-900 border-t border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-2xl font-extrabold text-white mb-1">
                Seva<span className="text-teal-400">Saathi</span>
              </div>
              <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} SevaSaathi. All rights reserved. &nbsp; Made in India 🇮🇳
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
                  onClick={() => {}}
                >
                  <Icon className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500">
            {['Privacy Policy', 'Terms of Service', 'Help Center', 'Contact Us', 'Careers'].map((l) => (
              <a key={l} href="#" className="hover:text-teal-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
