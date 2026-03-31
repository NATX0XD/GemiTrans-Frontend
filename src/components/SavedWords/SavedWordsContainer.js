import React, { useState, useEffect } from 'react';
import { fetchSavedWords, removeSavedWord } from '../../services/savedWordsService';
import { auth } from '../../configuration/firebase';
import { Bookmark, Languages, Loader2, Copy, Check, Trash2, Info } from 'lucide-react';
import ConfirmModal from '../Main/Modal/ConfirmModal';
import { SkeletonGrid } from '../Main/Loader/SkeletonCard';
import { Pagination, Button } from '@heroui/react';
import TranslationDetailModal from '../Main/Modal/TranslationDetailModal';
import ContentFilter from '../Common/ContentFilter';
import DataTable from '../Common/DataTable';

const SavedWordsContainer = ({ title, description }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Filtering & View State
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');

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
      <div className="w-full py-24 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-amber-100 dark:border-slate-800 shadow-sm transition-colors duration-500">
        <Bookmark className="text-amber-200 dark:text-amber-950/30 mb-5 animate-pulse" size={64} />
        <h3 className="text-xl font-bold text-amber-900/70 dark:text-amber-500/40">No saved words yet</h3>
        <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Tap the bookmark icon on any translation card to save words here.</p>
      </div>
    );
  }

  // Processing: Sorting (Services use unshift, so index 0 is latest)
  const sortedWords = sortBy === 'latest' ? [...words] : [...words].reverse();

  // Pagination Logic
  const totalPages = Math.ceil(sortedWords.length / itemsPerPage);
  const paginatedWords = sortedWords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Table Config
  const columns = [
    { key: "original", label: "Source Text", align: "start" },
    { key: "translated", label: "Saved Translation", align: "start" },
    { key: "languages", label: "Target", align: "start" },
    { key: "actions", label: "Actions", align: "end" }
  ];

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case "original":
        return (
          <div className="flex flex-col max-w-[200px]">
            <span className="text-[10px] font-bold text-amber-500/70 dark:text-amber-400/60 uppercase tracking-tighter mb-1">{item.sourceLang || 'Auto'}</span>
            <p className="line-clamp-1 text-slate-600 dark:text-slate-400">{item.sourceText}</p>
          </div>
        );
      case "translated":
        return (
          <div className="flex flex-col max-w-[250px]">
             <p className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.translatedText}</p>
          </div>
        );
      case "languages":
        return (
          <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-2 border border-amber-100 dark:border-amber-800/30">
            <Languages size={12} /> {item.targetLang}
          </div>
        );
      case "actions":
        return (
          <div className="flex items-center justify-end gap-2">
            <Button isIconOnly size="sm" variant="flat" onPress={() => setSelectedItem(item)} className="bg-slate-100 dark:bg-slate-800 text-slate-500">
               <Info size={16} />
            </Button>
            <Button isIconOnly size="sm" variant="flat" onPress={() => handleCopy(item.translatedText, item.id)} className="bg-slate-100 dark:bg-slate-800 text-slate-500">
               {copiedId === item.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </Button>
            <Button isIconOnly size="sm" variant="flat" onPress={() => setConfirmDeleteId(item.id)} className="bg-red-50 dark:bg-red-950/30 text-red-400 hover:text-red-500 transition-colors">
               <Trash2 size={16} />
            </Button>
          </div>
        );
      default:
        return item[columnKey];
    }
  };

  return (
    <>
      <ContentFilter 
        title={title}
        description={description}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalItems={words.length}
        label="Words"
        color="amber"
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6 items-start">
          {paginatedWords.map((item) => (
          <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white dark:bg-slate-900/60 p-6 pt-7 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-black/20 transition-all duration-300 group relative overflow-hidden flex flex-col cursor-pointer active:scale-[0.98]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
              disabled={isDeletingId === item.id}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-orange-50/50 dark:bg-slate-800/50 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 text-orange-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer border-none"
            >
              {isDeletingId === item.id ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} />}
            </button>

            <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <span className="text-[10px] font-bold text-amber-500/60 dark:text-amber-400/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                {item.sourceLang && item.sourceLang !== 'Auto' ? `${item.sourceLang} (Original)` : "Original Text"}
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed line-clamp-2 select-all">
                {item.sourceText}
              </p>
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/40 dark:to-slate-900/40 text-amber-700 dark:text-amber-400 px-3.5 py-1.5 rounded-xl flex items-center gap-2 w-max border border-amber-100/80 dark:border-amber-800/20 shadow-sm">
                  <Languages size={15} className="text-amber-500 dark:text-amber-500/50" />
                  <span className="text-xs font-black uppercase tracking-widest">{item.targetLang}</span>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleCopy(item.translatedText, item.id); }}
                  className="w-8 h-8 rounded-full border border-amber-100 dark:border-slate-800 flex items-center justify-center text-amber-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 hover:border-amber-200 transition-colors cursor-pointer outline-none shrink-0"
                >
                  {copiedId === item.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
              
              <p className="text-slate-800 dark:text-slate-100 font-bold text-base leading-relaxed line-clamp-2">
                {item.translatedText}
              </p>
            </div>
          </div>
          ))}
        </div>
      ) : (
        <DataTable 
          columns={columns}
          data={paginatedWords}
          renderCell={renderCell}
          ariaLabel="Saved words history table"
        />
      )}

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
