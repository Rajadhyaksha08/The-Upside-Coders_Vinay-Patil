import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Star } from 'lucide-react';

export default function WorkerCard({ worker, onClick }) {
  const navigate = useNavigate();

  if (!worker) return null;

  const {
    id,
    name = 'Unknown',
    avatarColor = 'bg-teal-600',
    aadhaarVerified = false,
    rating = 0,
    reviewCount = 0,
    skills = [],
    distanceKm,
    hourlyRate,
    fixedRate,
    available = false,
  } = worker;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleClick = () => {
    if (onClick) {
      onClick(worker);
    } else {
      navigate(`/customer/worker/${id}`);
    }
  };

  const displayedSkills = skills.slice(0, 3);

  return (
    <div
      className="card card-hover relative flex flex-col gap-3 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Distance badge */}
      {distanceKm !== undefined && (
        <span className="badge badge-slate absolute top-3 right-3 text-xs">
          {distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} m` : `${distanceKm.toFixed(1)} km`}
        </span>
      )}

      {/* Avatar + Name */}
      <div className="flex items-center gap-3">
        <div
          className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full ${avatarColor} text-white font-bold text-lg select-none shadow-sm`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-900 text-base leading-tight truncate">
              {name}
            </span>
            {aadhaarVerified && (
              <ShieldCheck size={16} className="text-blue-500 flex-shrink-0" aria-label="Aadhaar Verified" />
            )}
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-slate-800">{rating.toFixed(1)}</span>
            <span className="text-xs text-slate-500">({reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Skills */}
      {displayedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {displayedSkills.map((skill) => (
            <span key={skill} className="badge badge-teal text-xs">
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="badge badge-slate text-xs">+{skills.length - 3}</span>
          )}
        </div>
      )}

      {/* Rate + Availability */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <span className="font-semibold text-slate-900 text-sm">
          {hourlyRate ? `${String.fromCharCode(8377)}${hourlyRate}/hr` : fixedRate ? `${String.fromCharCode(8377)}${fixedRate}/visit` : 'Rate on request'}
        </span>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              available ? 'bg-green-500' : 'bg-slate-400'
            }`}
          />
          <span
            className={`text-xs font-medium ${
              available ? 'text-green-600' : 'text-slate-500'
            }`}
          >
            {available ? 'Available' : 'Busy'}
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        className="btn-primary w-full text-sm"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        View Profile
      </button>
    </div>
  );
}
