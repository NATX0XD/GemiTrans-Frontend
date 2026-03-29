import React from 'react';
import ReactDOM from 'react-dom';
import { Trash2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = "Confirm Deletion", message = "Are you sure you want to delete this? This action cannot be undone." }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm transition-all"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[340px] mx-4 bg-white/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-slate-100 flex flex-col items-center text-center p-8 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Decorative background blur */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-red-400/10 blur-[50px] rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Friendly Icon */}
          <div className="w-16 h-16 rounded-[1.25rem] bg-red-50 flex items-center justify-center mb-5 rotate-3 shadow-sm border border-red-100/50">
            <Trash2 className="text-red-500" size={28} strokeWidth={2.5} />
          </div>
          
          {/* Text Content */}
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2.5">
            {title}
          </h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[260px] mb-8">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 w-full">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm tracking-wide transition-colors border-0 cursor-pointer outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 focus:ring-offset-white"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-red-500/30 border-0 cursor-pointer outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ConfirmModal;