import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Shield, ArrowLeft } from 'lucide-react';
import { WORKERS } from '../../data/mockData';

export default function PrivateCall() {
  const { id } = useParams();
  const navigate = useNavigate();
  const worker = WORKERS.find((w) => w.id === id) || WORKERS[0];

  const [callState, setCallState] = useState('calling'); // 'calling', 'connected', 'ended'
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    // Simulate connection after 3.5 seconds
    const connectTimer = setTimeout(() => {
      setCallState('connected');
    }, 3500);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      navigate(-1);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col justify-between p-6 z-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-full bg-slate-800/60 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 bg-teal-900/60 border border-teal-500/40 px-3 py-1 rounded-full text-xs text-teal-300">
          <Shield className="w-3.5 h-3.5" />
          <span>Number Masked & Protected</span>
        </div>
      </div>

      {/* Main Calling Profile */}
      <div className="flex flex-col items-center justify-center text-center space-y-5">
        <div className="relative">
          {callState === 'calling' && (
            <>
              <div className="absolute inset-0 -m-4 rounded-full border-2 border-teal-500/30 animate-ping" />
              <div className="absolute inset-0 -m-8 rounded-full border border-teal-500/20 ring-anim" />
            </>
          )}

          <div
            className={`w-28 h-28 rounded-full ${worker.avatarColor} text-white font-black text-3xl flex items-center justify-center shadow-2xl relative z-10 border-4 border-slate-900`}
          >
            {worker.initials || 'WK'}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">{worker.name}</h2>
          <p className="text-teal-400 text-sm mt-1">{worker.skills[0] || 'Service Partner'}</p>
          <p className="text-xs text-slate-400 mt-0.5">Connecting via SevaSaathi SafeBridge</p>
        </div>

        <div className="pt-2">
          {callState === 'calling' ? (
            <span className="text-sm font-medium text-slate-300 tracking-wider animate-pulse">
              Ringing...
            </span>
          ) : callState === 'connected' ? (
            <span className="text-sm font-mono text-teal-400 font-bold tracking-widest bg-slate-900 px-4 py-1.5 rounded-full border border-teal-900">
              {formatTime(seconds)}
            </span>
          ) : (
            <span className="text-sm text-red-400">Call Ended</span>
          )}
        </div>
      </div>

      {/* Call Controls */}
      <div className="max-w-xs mx-auto w-full space-y-6">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg active:scale-95 transition-transform"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-4 rounded-full transition-colors ${
              isSpeaker ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-500">
          Calls are monitored for safety and quality assurance.
        </p>
      </div>
    </div>
  );
}
