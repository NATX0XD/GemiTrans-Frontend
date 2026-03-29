import React, { useState, useEffect } from 'react';
import { fetchTranslationHistory, removeTranslationHistory } from '../../services/historyService';
import { auth } from '../../configuration/firebase';
import { Clock, Languages, SlidersHorizontal, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import ConfirmModal from '../Main/Modal/ConfirmModal';
import { SkeletonGrid } from '../Main/Loader/SkeletonCard';
import { Pagination } from '@heroui/react';
import TranslationDetailModal from '../Main/Modal/TranslationDetailModal';

const HistoryContainer = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (itemId) => {
    if (!auth.currentUser) return;
    setConfirmDeleteId(null);
    setIsDeletingId(itemId);
    try {
      const updatedHistory = await removeTranslationHistory(auth.currentUser.uid, itemId);
      setHistory(updatedHistory);
      
      const newTotalPages = Math.ceil(updatedHistory.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error("Failed to delete history item", error);
    }
    setIsDeletingId(null);
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (auth.currentUser) {
        try {
          const data = await fetchTranslationHistory(auth.currentUser.uid);
          setHistory(data);
        } catch (error) {
          console.error("Failed to load history", error);
        }
      }
      setLoading(false);
    };

    loadHistory();
  }, [auth.currentUser]);

  if (loading) {
    return <SkeletonGrid count={6} />;
  }

  if (history.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl border border-indigo-100 shadow-sm">
        <Clock className="text-indigo-200 mb-5 animate-pulse" size={64} />
        <h3 className="text-xl font-bold text-indigo-900/70">No translations yet</h3>
        <p className="text-slate-500 text-sm mt-2">Any translations you make will automatically appear here.</p>
      </div>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6 mt-3 items-start">
        {paginatedHistory.map((item) => (
        <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white p-6 pt-7 rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all group relative overflow-hidden flex flex-col cursor-pointer active:scale-[0.98]">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Delete Button (Visible on Hover) */}
          <button 
            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
            disabled={isDeletingId === item.id}
            title="Delete this record"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-indigo-50/50 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-indigo-300 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer border-none"
          >
            {isDeletingId === item.id ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} />}
          </button>

          {/* Source Area */}
          <div className="flex flex-col border-b border-slate-100 pb-4 mb-4">
            <span className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-widest mb-2 flex items-center gap-2">
               {item.sourceLang && item.sourceLang !== 'Auto' ? `${item.sourceLang} (Original)` : "Original Text"}
            </span>
            <p className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-2 select-all">
              {item.sourceText}
            </p>
          </div>
          
          {/* Target Area */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col gap-2.5">
                {/* Target Language - Highly Prominent */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50/50 text-indigo-700 px-3.5 py-1.5 rounded-xl flex items-center gap-2 w-max border border-indigo-100/80 shadow-sm">
                  <Languages size={15} className="text-indigo-500" />
                  <span className="text-xs font-black uppercase tracking-widest">{item.targetLang}</span>
                </div>
                
                {/* Tone & Formality Settings - Separate Line */}
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">
                  <SlidersHorizontal size={12} className="text-indigo-400/70" />
                  <span>Tone: {item.objective}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200 mx-1"></span>
                  <span>Formality: {item.formality}%</span>
                </div>
              </div>

              {/* Copy Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleCopy(item.translatedText, item.id); }}
                title="Copy translation"
                className="w-8 h-8 rounded-full border border-indigo-100 flex items-center justify-center text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer outline-none shrink-0 mt-1"
              >
                {copiedId === item.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
            
            <p className="text-slate-800 font-bold text-base leading-relaxed line-clamp-2">
              {item.translatedText}
            </p>
          </div>
          
        </div>
      ))}
    </div>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 mb-12">
          <Pagination
            total={totalPages}
            initialPage={1}
            page={currentPage}
            onChange={setCurrentPage}
            color="primary"
            variant="flat"
            size="lg"
          />
        </div>
      )}

      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId)}
        title="Delete Translation Record"
        message="Are you sure you want to remove this translation from your history?"
      />

      <TranslationDetailModal 
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onCopy={handleCopy}
        copiedId={copiedId}
        variant="history"
      />
    </>
  );
};

export default HistoryContainer;
