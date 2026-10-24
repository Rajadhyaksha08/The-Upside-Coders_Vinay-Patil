import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '', fullScreen = false }) {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-teal-200 border-t-teal-600 animate-spin`}
      />
      {text && <p className="text-sm font-medium text-slate-600 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-xl max-w-xs w-full text-center">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}
