import React from 'react';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps = [], currentStep = 1 }) {
  return (
    <div className="w-full py-4">
      {/* Mobile view: concise */}
      <div className="sm:hidden flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-teal-700 tracking-wider uppercase">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-xs font-medium text-slate-500">
          {steps[currentStep - 1]}
        </span>
      </div>

      <div className="flex items-center w-full">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-teal-600 text-white shadow-sm'
                      : isCurrent
                      ? 'border-2 border-teal-600 bg-white text-teal-700 shadow-sm ring-4 ring-teal-100'
                      : 'border border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNumber}
                </div>
                <span
                  className={`hidden sm:block absolute top-9 text-[11px] font-medium text-center whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-teal-700 font-semibold'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                    stepNumber < currentStep ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="hidden sm:block h-6" />
    </div>
  );
}
