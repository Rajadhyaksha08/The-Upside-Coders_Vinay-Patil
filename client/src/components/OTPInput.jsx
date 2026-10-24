import React, { useRef } from 'react';

export default function OTPInput({ length = 4, value = '', onChange, disabled = false }) {
  const inputsRef = useRef([]);

  // Ensure value is an array or string
  const digits = Array.from({ length }, (_, i) => (value && value[i]) || '');

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '');
    const char = val.slice(-1); // Take latest typed digit
    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join('');
    onChange(combined);

    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="otp-box focus:border-teal-600 focus:ring-teal-100"
          autoFocus={index === 0 && !disabled}
        />
      ))}
    </div>
  );
}
