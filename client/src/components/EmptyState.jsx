import React from 'react';

export default function EmptyState({
  icon = '🔍',
  title = 'Nothing found',
  description = 'Try adjusting your filters or search terms.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="card text-center py-12 px-6 flex flex-col items-center justify-center">
      <div className="text-4xl mb-4 p-3 bg-slate-50 rounded-2xl inline-block shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-primary text-sm py-2 px-5">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
