import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, FileText, Search, Loader2, ChevronRight } from 'lucide-react';
import { auth } from '../../configuration/firebase';
import { fetchNotes } from '../../services/notesService';

const NoteSelectionModal = ({ isOpen, onClose, onSelectNote, onCreateNew }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen]);

  const loadNotes = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const data = await fetchNotes(auth.currentUser.uid);
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl dark:shadow-black/50 border border-transparent dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] transition-colors duration-500"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Save Note to...</h2>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search existing notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-11 pr-4 text-slate-700 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-teal-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {/* Create New Option */}
          <button 
            onClick={onCreateNew}
            className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-teal-50 dark:hover:bg-slate-800/80 text-left transition-colors group mb-1 border-none cursor-pointer bg-white dark:bg-slate-900"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Plus size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-700 dark:text-slate-200 text-base">Create New Note</div>
              <div className="text-slate-400 dark:text-slate-500 text-xs font-medium">Start a fresh notebook entry</div>
            </div>
            <ChevronRight size={18} className="text-slate-200 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
          </button>

          <div className="h-px bg-slate-50 dark:bg-slate-800 my-3 mx-4"></div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="animate-spin text-teal-500" size={32} />
              <p className="text-slate-400 dark:text-slate-500 font-bold">Loading your notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 px-8">
              <p className="text-slate-400 dark:text-slate-500 font-bold">No existing notes found.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Recent Notes</p>
              {filteredNotes.map(note => (
                <button 
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors group border-none cursor-pointer bg-white dark:bg-slate-900"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="font-bold text-slate-700 dark:text-slate-200 truncate text-base">{note.title}</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">{note.targetLang || 'Translation'}</div>
                  </div>
                  <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default NoteSelectionModal;
