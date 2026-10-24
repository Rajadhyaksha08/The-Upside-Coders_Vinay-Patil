import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [currentBooking, setCurrentBooking] = useState({
    service: null,
    worker: null,
    pincode: '',
    radius: 10,
    budget: 500,
    date: '',
    time: '',
    address: '',
    notes: '',
    step: 1,
  });

  const updateBooking = (fields) =>
    setCurrentBooking(prev => ({ ...prev, ...fields }));

  const resetBooking = () =>
    setCurrentBooking({
      service: null, worker: null, pincode: '', radius: 10,
      budget: 500, date: '', time: '', address: '', notes: '', step: 1,
    });

  return (
    <BookingContext.Provider value={{ currentBooking, updateBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be inside BookingProvider');
  return ctx;
};
