import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  ArrowLeft,
  Shield,
  Smartphone,
  Radio,
  Grid,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function IVRSimulator() {
  const navigate = useNavigate();

  // Call States: 'idle', 'ringing', 'in_call', 'ended'
  const [callState, setCallState] = useState('idle');
  const [deviceMode, setDeviceMode] = useState('smartphone'); // 'smartphone' or 'featurephone'
  const [language, setLanguage] = useState('hi'); // 'hi' or 'en'
  const [callDuration, setCallDuration] = useState(0);
  const [showKeypad, setShowKeypad] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [workerStatus, setWorkerStatus] = useState('Available 🟢');
  const [lastInput, setLastInput] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [activeSpeech, setActiveSpeech] = useState('');

  const timerRef = useRef(null);

  // Play realistic DTMF telephone beep frequencies
  const playDTMFTone = (key) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const dtmfFreqs = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
      };

      const freqs = dtmfFreqs[key] || [440, 440];
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.16);
      osc2.stop(ctx.currentTime + 0.16);
    } catch (e) {
      // AudioContext policy catch
    }
  };

  // Text to Speech voice prompts
  const speakText = (text) => {
    if (!voiceEnabled) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(
          (v) =>
            v.lang.includes('hi') ||
            v.lang.includes('en-IN') ||
            v.name.includes('India') ||
            v.name.includes('Hindi')
        );
        if (indianVoice) utterance.voice = indianVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Speech synthesis unavailable');
    }
  };

  // Start Call flow
  const handleStartCall = () => {
    setCallState('ringing');
    setCallDuration(0);
    setTranscript([]);

    setTimeout(() => {
      setCallState('in_call');
      const welcome =
        language === 'hi'
          ? 'नमस्ते! सेवा-साथी वर्कर पोर्टल में आपका स्वागत है। अपनी उपलब्धता जानने के लिए 1 दबाएं। ऑनलाइन या ऑफलाइन बदलने के लिए 2 दबाएं। नए काम के ऑफर्स सुनने के लिए 3 दबाएं। अपनी कमाई सुनने के लिए 4 दबाएं।'
          : 'Welcome to SevaSaathi Worker Toll-Free Portal. Press 1 to check Availability. Press 2 to update status. Press 3 to hear pending jobs. Press 4 for earnings balance.';

      setActiveSpeech(welcome);
      setTranscript([{ sender: 'ivr', text: welcome }]);
      speakText(welcome);
    }, 1800);
  };

  // Handle Call Timer
  useEffect(() => {
    if (callState === 'in_call') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Keypad Press
  const handleKeyPress = (key) => {
    if (callState !== 'in_call') return;

    playDTMFTone(key);
    setLastInput(key);

    let reply = '';
    const updatedHistory = [...transcript, { sender: 'user', text: `Key: [ ${key} ]` }];

    switch (key) {
      case '1':
        reply =
          language === 'hi'
            ? `आपका वर्तमान स्टेटस है: ${workerStatus}। आप अपने 10 किलोमीटर के दायरे में सभी ग्राहकों को दिखाई दे रहे हैं। स्टेटस बदलने के लिए 2 दबाएं, या मेन मेनू के लिए 9 दबाएं।`
            : `Your current status is: ${workerStatus}. Visible to customers within 10 km. Press 2 to toggle status, or 9 for main menu.`;
        break;

      case '2':
        const next = workerStatus.includes('Available') ? 'Busy / Offline 🔴' : 'Available 🟢';
        setWorkerStatus(next);
        reply =
          language === 'hi'
            ? `सफलतापूर्वक अपडेट! अब आप ${next} सेट हो चुके हैं। जॉब अलर्ट्स के लिए 3 दबाएं या मेनू के लिए 9 दबाएं।`
            : `Status updated! You are now marked as ${next}. Press 3 for job offers or 9 for menu.`;
        toast.success(`IVR: Status changed to ${next}`);
        break;

      case '3':
        reply =
          language === 'hi'
            ? 'आपके पास 1 नया जॉब ऑफर है: इलेक्ट्रीशियन, सेक्टर 14 गुरुग्राम। अनुमानित भुगतान ₹550। इसे तुरंत स्वीकार करने के लिए 1 दबाएं, या छोड़ने के लिए 2 दबाएं।'
            : 'You have 1 pending job offer: Electrician in Sector 14, Gurugram. Estimated pay ₹550. Press 1 to Accept, 2 to Skip.';
        break;

      case '4':
        reply =
          language === 'hi'
            ? 'आपका उपलब्ध वॉलेट बैलेंस ₹4,850 है। यह राशि आज रात 11 बजे आपके रजिस्टर्ड बैंक खाते में ट्रांसफर हो जाएगी। मेन मेनू के लिए 9 दबाएं।'
            : 'Your available wallet balance is ₹4,850. Auto-transfer to your registered bank account will process tonight at 11 PM. Press 9 for menu.';
        break;

      case '9':
        reply =
          language === 'hi'
            ? 'मुख्य मेनू: 1: स्टेटस चेक, 2: ऑनलाइन/ऑफलाइन टॉगल, 3: नए काम के ऑफर्स, 4: वॉलेट बैलेंस, 0: कस्टमर केयर।'
            : 'Main Menu: 1: Status Check, 2: Toggle Availability, 3: Job Offers, 4: Wallet Balance, 0: Support Officer.';
        break;

      case '0':
        reply =
          language === 'hi'
            ? 'कृपया लाइन पर बने रहें, हम आपकी कॉल हमारे फील्ड सपोर्ट ऑफिसर को ट्रांसफर कर रहे हैं...'
            : 'Please hold while we transfer your call to our field support officer...';
        break;

      default:
        reply =
          language === 'hi'
            ? `की ${key} दर्ज हुई। मुख्य मेनू सुनने के लिए 9 दबाएं।`
            : `Input ${key} received. Press 9 for main menu.`;
    }

    updatedHistory.push({ sender: 'ivr', text: reply });
    setTranscript(updatedHistory);
    setActiveSpeech(reply);
    speakText(reply);
  };

  const handleEndCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('ended');
    setActiveSpeech('Call Ended. Dhanyavaad!');
    toast('Call Disconnected');
    setTimeout(() => {
      setCallState('idle');
    }, 2000);
  };

  const keypadButtons = [
    { num: '1', letters: '' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
    { num: '*', letters: '' },
    { num: '0', letters: '+' },
    { num: '#', letters: '' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center">
        {/* Top Title & Subtitle */}
        <div className="text-center space-y-1.5 mb-6 max-w-md">
          <div className="inline-flex items-center gap-1.5 bg-teal-950 border border-teal-500/40 px-3 py-1 rounded-full text-xs text-teal-400 font-semibold shadow-inner">
            <Radio className="w-3.5 h-3.5 animate-pulse text-teal-400" />
            <span>Interactive Voice Response (IVR) Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Toll-Free Calling Interface
          </h1>
          <p className="text-xs text-slate-400">
            For workers who don't use smartphones — dial <span className="text-teal-400 font-bold font-mono">1800-SEVA-SA</span> to manage availability & accept orders.
          </p>
        </div>

        {/* Mode Switcher: Smartphone Call Screen vs. Feature Phone Nokia */}
        <div className="flex items-center gap-2 mb-6 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDeviceMode('smartphone')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              deviceMode === 'smartphone'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Smartphone Dialer
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('featurephone')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              deviceMode === 'featurephone'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" /> 2G Basic Phone (Keypad)
          </button>
        </div>

        {/* DEVICE CONTAINER */}
        {deviceMode === 'smartphone' ? (
          /* ============================================================ */
          /* SMARTPHONE CALL SCREEN (iOS / Android in-call glassmorphism) */
          /* ============================================================ */
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-[42px] border-4 border-slate-700 shadow-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[620px]">
            {/* Dynamic Island / Earpiece */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-between px-3 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500/70" />
            </div>

            {/* Carrier Status */}
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-3 px-2">
              <span className="font-semibold tracking-wider">Jio 5G</span>
              <span>🔋 92%</span>
            </div>

            {/* Caller Profile Information */}
            <div className="text-center space-y-3 pt-6">
              <div className="relative inline-block">
                {callState === 'in_call' && (
                  <div className="absolute -inset-2 rounded-full border border-teal-500/40 animate-ping" />
                )}
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-700 to-slate-800 text-white font-black text-2xl flex items-center justify-center border-2 border-teal-400/50 shadow-xl mx-auto">
                  🔧
                </div>
              </div>

              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  SevaSaathi Toll-Free
                </h2>
                <p className="text-xs text-teal-400 font-mono tracking-widest mt-0.5">
                  1800-7382-72
                </p>
                <div className="mt-1">
                  {callState === 'idle' && (
                    <span className="text-xs text-slate-400">Ready to Connect</span>
                  )}
                  {callState === 'ringing' && (
                    <span className="text-xs text-teal-300 font-semibold animate-pulse">
                      Calling IVR Gateway...
                    </span>
                  )}
                  {callState === 'in_call' && (
                    <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/80 px-3 py-1 rounded-full border border-teal-800">
                      {formatTimer(callDuration)}
                    </span>
                  )}
                  {callState === 'ended' && (
                    <span className="text-xs text-red-400">Call Disconnected</span>
                  )}
                </div>
              </div>

              {/* Live Automated Speech Subtitles Banner */}
              {callState === 'in_call' && activeSpeech && (
                <div className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-3 text-left shadow-inner max-h-32 overflow-y-auto space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3 animate-pulse" /> IVR Operator Speaking:
                    </span>
                    <button
                      onClick={() => speakText(activeSpeech)}
                      className="text-[10px] text-teal-300 hover:underline"
                    >
                      Replay Voice 🔊
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    "{activeSpeech}"
                  </p>
                </div>
              )}
            </div>

            {/* CALL CONTROLS */}
            <div className="space-y-4 pt-4">
              {callState === 'in_call' ? (
                <>
                  {/* Sliding Keypad Overlay */}
                  {showKeypad && (
                    <div className="grid grid-cols-3 gap-2.5 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-sm animate-in fade-in">
                      {keypadButtons.map((k) => (
                        <button
                          key={k.num}
                          type="button"
                          onClick={() => handleKeyPress(k.num)}
                          className="h-11 bg-slate-800 hover:bg-teal-700 active:bg-teal-600 text-white rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 shadow"
                        >
                          <span className="text-sm font-black leading-none">{k.num}</span>
                          {k.letters && (
                            <span className="text-[8px] text-slate-400 tracking-wider">
                              {k.letters}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Toolbar */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${
                        isMuted
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      <span className="text-[10px]">{isMuted ? 'Muted' : 'Mute'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowKeypad(!showKeypad)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${
                        showKeypad
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                      <span className="text-[10px]">Keypad</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const nextVoice = !voiceEnabled;
                        setVoiceEnabled(nextVoice);
                        if (!nextVoice && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                      }}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${
                        voiceEnabled
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {voiceEnabled ? (
                        <Volume2 className="w-5 h-5" />
                      ) : (
                        <VolumeX className="w-5 h-5" />
                      )}
                      <span className="text-[10px]">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                    </button>
                  </div>

                  {/* Big Red End Call Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleEndCall}
                      className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform"
                    >
                      <PhoneOff className="w-8 h-8" />
                    </button>
                  </div>
                </>
              ) : (
                /* Dial Green Button */
                <div className="flex flex-col items-center gap-3 py-6">
                  <button
                    type="button"
                    onClick={handleStartCall}
                    disabled={callState === 'ringing'}
                    className="w-18 h-18 rounded-full bg-green-600 hover:bg-green-700 active:scale-95 text-white flex items-center justify-center shadow-2xl transition-transform"
                  >
                    <Phone className="w-8 h-8" />
                  </button>
                  <p className="text-xs text-slate-400 font-semibold tracking-wide">
                    Tap Green Button to Dial
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* FEATURE PHONE 2G NOKIA / JIOPHONE KEYPAD INTERFACE           */
          /* ============================================================ */
          <div className="w-full max-w-xs bg-slate-800 rounded-[38px] p-5 border-4 border-slate-700 shadow-2xl space-y-4">
            <div className="w-14 h-1.5 bg-slate-600 rounded-full mx-auto" />

            {/* Retro Backlit Screen */}
            <div className="bg-emerald-950/90 border-2 border-emerald-600/70 rounded-2xl p-3.5 font-mono text-emerald-400 h-56 flex flex-col justify-between overflow-y-auto shadow-inner text-xs">
              <div className="flex justify-between items-center text-[10px] text-emerald-500/80 border-b border-emerald-800 pb-1">
                <span>📶 2G GSM</span>
                <span>1800-SEVA</span>
                <span>{callState === 'in_call' ? formatTimer(callDuration) : 'IDLE'}</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 text-[11px] leading-relaxed">
                {callState === 'idle' && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-emerald-400/80">
                    <PhoneCall className="w-7 h-7 mb-1.5 animate-pulse" />
                    <p className="font-bold">SEVASAATHI IVR</p>
                    <p className="text-[10px]">Press Call to Dial</p>
                  </div>
                )}

                {callState === 'ringing' && (
                  <div className="h-full flex flex-col items-center justify-center text-center animate-pulse">
                    <p className="font-bold">DIALING...</p>
                    <p className="text-[10px]">1800-7382-72</p>
                  </div>
                )}

                {transcript.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`${
                      msg.sender === 'user'
                        ? 'text-amber-400 font-bold'
                        : 'text-emerald-300'
                    }`}
                  >
                    {msg.sender === 'ivr' && '▶ '}
                    {msg.text}
                  </div>
                ))}
              </div>

              {callState === 'in_call' && (
                <div className="text-[10px] text-emerald-500 text-center pt-1 border-t border-emerald-800 flex justify-between">
                  <span>Status: {workerStatus}</span>
                  <span className="animate-pulse">● LIVE</span>
                </div>
              )}
            </div>

            {/* Hardware Call / End Keys */}
            <div className="grid grid-cols-2 gap-3 px-1">
              {callState === 'in_call' ? (
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
                >
                  <PhoneOff className="w-4 h-4" /> End Call
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartCall}
                  disabled={callState === 'ringing'}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
                >
                  <Phone className="w-4 h-4" /> Call 1800
                </button>
              )}

              <button
                type="button"
                onClick={() => handleKeyPress('9')}
                disabled={callState !== 'in_call'}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl text-xs shadow"
              >
                Menu (9)
              </button>
            </div>

            {/* Hardware Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {keypadButtons.map((k) => (
                <button
                  key={k.num}
                  type="button"
                  disabled={callState !== 'in_call'}
                  onClick={() => handleKeyPress(k.num)}
                  className="h-11 bg-slate-700 hover:bg-slate-600 active:bg-teal-600 disabled:opacity-40 text-white rounded-xl flex flex-col items-center justify-center transition-all shadow"
                >
                  <span className="text-sm font-bold leading-none">{k.num}</span>
                  {k.letters && (
                    <span className="text-[8px] text-slate-400 tracking-wider">
                      {k.letters}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions / Cheat Sheet Card */}
        <div className="w-full max-w-md mt-6 card p-4 bg-slate-900 border border-slate-800 text-xs space-y-2 text-slate-300">
          <div className="flex items-center justify-between text-teal-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Keypad Cheat Sheet:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
                className="text-[10px] bg-slate-800 text-teal-300 px-2.5 py-1 rounded-md border border-slate-700"
              >
                Lang: {language === 'hi' ? 'हिंदी 🇮🇳' : 'English 🇬🇧'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div>
              <span className="text-amber-400 font-bold">Press 1:</span> Check Online Status
            </div>
            <div>
              <span className="text-amber-400 font-bold">Press 2:</span> Turn Availability ON/OFF
            </div>
            <div>
              <span className="text-amber-400 font-bold">Press 3:</span> Hear Pending Jobs
            </div>
            <div>
              <span className="text-amber-400 font-bold">Press 4:</span> Listen to Wallet Balance
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
