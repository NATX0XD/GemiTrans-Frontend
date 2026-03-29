import React from 'react';
import { BookOpen, Languages, Clock, Sparkles, Bookmark } from 'lucide-react';

const PageBackground = ({ children, type = 'generic' }) => {
  const renderIcons = () => {
    switch (type) {
      case 'notebook':
        return (
          <>
            <BookOpen className="absolute top-[8%] left-[-40px] text-teal-300 opacity-10 rotate-[-12deg]" size={280} />
            <Sparkles className="absolute bottom-[10%] right-[-50px] text-emerald-300 opacity-10 rotate-[15deg]" size={240} />
            <BookOpen className="absolute bottom-[0%] left-[15%] text-teal-200 opacity-10 rotate-[45deg]" size={160} />
          </>
        );
      case 'history':
        return (
          <>
            <Clock className="absolute top-[8%] left-[-40px] text-indigo-300 opacity-10 rotate-[-12deg]" size={280} />
            <Languages className="absolute bottom-[10%] right-[-50px] text-blue-300 opacity-10 rotate-[15deg]" size={240} />
            <Clock className="absolute bottom-[20%] left-[15%] text-indigo-200 opacity-10 rotate-[45deg]" size={180} />
          </>
        );
      case 'saved':
        return (
          <>
            <Bookmark className="absolute top-[8%] left-[-40px] text-amber-300 opacity-10 rotate-[-12deg]" size={280} />
            <Languages className="absolute bottom-[10%] right-[-50px] text-orange-300 opacity-10 rotate-[15deg]" size={240} />
            <Bookmark className="absolute top-[40%] right-[10%] text-amber-200 opacity-10 rotate-[-30deg]" size={200} />
          </>
        );
      default:
        return (
          <>
            <Languages className="absolute top-[8%] left-[-40px] text-slate-300 opacity-10 rotate-[-12deg]" size={280} />
            <Sparkles className="absolute bottom-[10%] right-[-50px] text-slate-300 opacity-10 rotate-[15deg]" size={240} />
          </>
        );
    }
  };

  const glowColors = () => {
    switch (type) {
      case 'notebook': return ['bg-teal-200/30', 'bg-emerald-100/30'];
      case 'history': return ['bg-indigo-200/30', 'bg-blue-100/30'];
      case 'saved': return ['bg-amber-200/30', 'bg-orange-100/30'];
      default: return ['bg-slate-200/20', 'bg-slate-100/20'];
    }
  };

  const colors = glowColors();

  return (
    <div className="relative min-h-full w-full bg-slate-50/50 overflow-hidden">
      {/* Mesh Glow Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse ${colors[0]}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse delay-700 ${colors[1]}`} />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px] bg-white/40" />
      </div>

      {/* Decorative Icons */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {renderIcons()}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default PageBackground;
