import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';

export default function ToastContainer() {
  const { toasts } = useWorkshop();

  return (
    <div className="toast-container" id="toastContainer">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
