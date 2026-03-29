import React, { useState, useEffect } from 'react';
import { fetchNotes, removeNote } from '../../services/notesService';
import { auth } from '../../configuration/firebase';
import { BookOpen, Loader2, Trash2, Pencil } from 'lucide-react';
import ConfirmModal from '../Main/Modal/ConfirmModal';
import { SkeletonGrid } from '../Main/Loader/SkeletonCard';
import { Pagination } from '@heroui/react';

const NotebookContainer = ({ onEditNote }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const handleDelete = async (noteId) => {
    if (!auth.currentUser) return;
    setConfirmDeleteId(null);
    setIsDeletingId(noteId);
    try {
      const updated = await removeNote(auth.currentUser.uid, noteId);
      setNotes(updated);
      
      // Adjust page if current page becomes empty
      const newTotalPages = Math.ceil(updated.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error("Failed to delete note", error);
    }
    setIsDeletingId(null);
  };

  useEffect(() => {
    const load = async () => {
      if (auth.currentUser) {
        try {
          const data = await fetchNotes(auth.currentUser.uid);
          setNotes(data);
        } catch (error) {
          console.error("Failed to load notes", error);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <SkeletonGrid count={6} />;
  }

  if (notes.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl border border-teal-100 shadow-sm">
        <BookOpen className="text-teal-200 mb-5 animate-pulse" size={64} />
        <h3 className="text-xl font-bold text-teal-900/70">No notes yet</h3>
        <p className="text-slate-500 text-sm mt-2">Create a note from the translation page using the floating button.</p>
      </div>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil(notes.length / itemsPerPage);
  const paginatedNotes = notes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Strip HTML tags for preview
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6 mt-3 items-start">
        {paginatedNotes.map((note) => (
          <div 
            key={note.id} 
            className="bg-white p-6 pt-7 rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all group relative overflow-hidden flex flex-col cursor-pointer"
            onClick={() => onEditNote && onEditNote(note)}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Delete Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(note.id); }}
              disabled={isDeletingId === note.id}
              title="Delete note"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-teal-50/50 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-teal-300 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer border-none"
            >
              {isDeletingId === note.id ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} />}
            </button>

            {/* Title */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-lg font-bold text-slate-800 line-clamp-2 flex-1 leading-snug">
                {note.title || 'Untitled Note'}
              </h3>
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all shrink-0">
                <BookOpen size={18} />
              </div>
            </div>
            
            {/* Preview */}
            <div className="text-slate-500 text-sm leading-relaxed line-clamp-4 flex-1 font-medium">
              {stripHtml(note.content)}
            </div>

            {/* Footer indicator */}
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notebook</span>
              <div className="flex items-center gap-1.5 text-teal-600 font-bold text-[10px] uppercase tracking-wider">
                Details <Pencil size={10} />
              </div>
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
            color="success"
            variant="flat"
            size="lg"
            classNames={{
              wrapper: "gap-2",
              item: "bg-white text-slate-500 font-bold hover:bg-teal-50 hover:text-teal-600 rounded-xl border border-slate-100",
              cursor: "bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20",
            }}
          />
        </div>
      )}

      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId)}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
      />
    </>
  );
};

export default NotebookContainer;
