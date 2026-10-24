import React from 'react';

export default function ServiceCard({ service, onClick, selected = false }) {
  if (!service) return null;
  const { name, icon, color = 'bg-teal-50 text-teal-600', description, basePrice } = service;

  return (
    <div
      onClick={onClick}
      className={`card card-hover transition-all duration-200 p-4 flex flex-col justify-between cursor-pointer border ${
        selected ? 'border-teal-500 ring-2 ring-teal-200 bg-teal-50/30' : 'border-slate-100'
      }`}
    >
      <div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 ${color} shadow-sm`}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-800 text-base mb-1">{name}</h3>
        {description && <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{description}</p>}
      </div>
      {basePrice && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Starting</span>
          <span className="font-bold text-teal-700">₹{basePrice}</span>
        </div>
      )}
    </div>
  );
}
