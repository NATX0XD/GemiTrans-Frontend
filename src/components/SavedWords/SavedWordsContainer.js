import React, { useState, useEffect } from 'react';
import { fetchSavedWords, removeSavedWord } from '../../services/savedWordsService';
import { auth } from '../../configuration/firebase';
import { Bookmark, Languages, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import ConfirmModal from '../Main/Modal/ConfirmModal';
import { SkeletonGrid } from '../Main/Loader/SkeletonCard';
import { Pagination } from '@heroui/react';
import TranslationDetailModal from '../Main/Modal/TranslationDetailModal';

const SavedWordsContainer = () => {
  const [words, setWords] = useState([]);
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
      const updated = await removeSavedWord(auth.currentUser.uid, itemId);
      setWords(updated);
      
      const newTotalPages = Math.ceil(updated.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error("Failed to delete saved word", error);
    }
    setIsDeletingId(null);
  };

  useEffect(() => {
    const load = async () => {
      if (auth.currentUser) {
        try {
          const data = await fetchSavedWords(auth.currentUser.uid);
          setWords(data);
        } catch (error) {
          console.error("Failed to load saved words", error);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <SkeletonGrid count={6} />;
  }

  if (words.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl border border-amber-100 shadow-sm">
        <Bookmark className="text-amber-200 mb-5 animate-pulse" size={64} />
        <h3 className="text-xl font-bold text-amber-900/70">No saved words yet</h3>
        <p className="text-slate-500 text-sm mt-2">Tap the bookmark icon on any translation card to save words here.</p>
      </div>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil(words.length / itemsPerPage);
  const paginatedWords = words.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6 mt-3 items-start">
        {paginatedWords.map((item) => (
        <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white p-6 pt-7 rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all group relative overflow-hidden flex flex-col cursor-pointer active:scale-[0.98]">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Delete Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
            disabled={isDeletingId === item.id}
            title="Remove saved word"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-orange-50/50 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-orange-300 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer border-none"
          >
            {isDeletingId === item.id ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} />}
          </button>

          {/* Source Area */}
          <div className="flex flex-col border-b border-slate-100 pb-4 mb-4">
            <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest mb-2 flex items-center gap-2">
              {item.sourceLang && item.sourceLang !== 'Auto' ? `${item.sourceLang} (Original)` : "Original Text"}
            </span>
            <p className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-2 select-all">
              {item.sourceText}
            </p>
          </div>
          
          {/* Target Area */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 text-amber-700 px-3.5 py-1.5 rounded-xl flex items-center gap-2 w-max border border-amber-100/80 shadow-sm">
                <Languages size={15} className="text-amber-500" />
                <span className="text-xs font-black uppercase tracking-widest">{item.targetLang}</span>
              </div>

              {/* Copy Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleCopy(item.translatedText, item.id); }}
                title="Copy translation"
                className="w-8 h-8 rounded-full border border-amber-100 flex items-center justify-center text-amber-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer outline-none shrink-0"
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
            color="warning"
            variant="flat"
            size="lg"
          />
        </div>
      )}

      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId)}
        title="Remove Saved Word"
        message="Are you sure you want to remove this word from your saved collection?"
      />

      <TranslationDetailModal 
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onCopy={handleCopy}
        copiedId={copiedId}
        variant="saved"
      />
    </>
  );
};

export default SavedWordsContainer;
