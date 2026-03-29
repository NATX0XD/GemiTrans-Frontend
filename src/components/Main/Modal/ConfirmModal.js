import React from 'react';
import ReactDOM from 'react-dom';
import { Trash2, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to delete this? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger", // 'danger' (red) or 'warning' (amber)
  customIcon: CustomIcon
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const Icon = CustomIcon || (isDanger ? Trash2 : AlertTriangle);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const themeClasses = {
    danger: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-500 dark:text-red-400',
      border: 'border-red-100/50 dark:border-red-800/50',
      glow: 'bg-red-400/10 dark:bg-red-600/5',
      btn: 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-500 shadow-red-500/30 dark:shadow-red-900/40 focus:ring-red-500'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'text-amber-500 dark:text-amber-400',
      border: 'border-amber-100/50 dark:border-amber-800/50',
      glow: 'bg-amber-400/10 dark:bg-amber-600/5',
      btn: 'bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-500 shadow-amber-500/30 dark:shadow-amber-900/40 focus:ring-amber-500'
    }
  }[variant] || {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-500 dark:text-red-400',
    border: 'border-red-100/50 dark:border-red-800/50',
    glow: 'bg-red-400/10 dark:bg-red-600/5',
    btn: 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-500 shadow-red-500/30 dark:shadow-red-900/40 focus:ring-red-500'
  };

  const modalContent = (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm transition-all"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[340px] mx-4 bg-white/95 dark:bg-slate-900 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-slate-100 dark:ring-slate-800/50 flex flex-col items-center text-center p-8 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Decorative background blur */}
        <div className={`absolute -top-24 -right-24 w-56 h-56 ${themeClasses.glow} blur-[50px] rounded-full pointer-events-none z-0`}></div>

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Friendly Icon */}
          <div className={`w-16 h-16 rounded-[1.25rem] ${themeClasses.bg} flex items-center justify-center mb-5 rotate-3 shadow-sm border ${themeClasses.border} transition-colors`}>
            <Icon className={themeClasses.icon} size={28} strokeWidth={2.5} />
          </div>
          
          {/* Text Content */}
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-2.5">
            {title}
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px] mb-8">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 w-full">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm tracking-wide transition-colors border-0 cursor-pointer outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 focus:ring-offset-white"
            >
              {cancelText}
            </button>
            <button 
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 h-12 rounded-2xl ${themeClasses.btn} text-white font-bold text-sm tracking-wide transition-all border-0 cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white active:scale-95`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ConfirmModal;