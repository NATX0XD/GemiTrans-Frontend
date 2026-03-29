import React, { useState, useEffect } from 'react';
import { fetchNotes, removeNote } from '../../services/notesService';
import { auth } from '../../configuration/firebase';
import { BookOpen, Loader2, Trash2, Pencil, Search, Info, Calendar } from 'lucide-react';
import ConfirmModal from '../Main/Modal/ConfirmModal';
import { SkeletonGrid } from '../Main/Loader/SkeletonCard';
import { Pagination, Button, User } from '@heroui/react';
import ContentFilter from '../Common/ContentFilter';
import DataTable from '../Common/DataTable';

const NotebookContainer = ({ onEditNote, title, description }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // Filtering & View State
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Strip HTML tags for preview and filtering
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Processing: Combined Sorting & Search (Services use unshift, so index 0 is latest @ creation)
  const processedNotes = notes
    .filter(note => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        note.title?.toLowerCase().includes(query) ||
        note.content?.toLowerCase().includes(query)
      );
    });

  // Since services unshift new items to the front, the array is already "Latest First"
  const finalNotes = sortBy === 'latest' ? [...processedNotes] : [...processedNotes].reverse();

  // Pagination Logic
  const totalPages = Math.ceil(processedNotes.length / itemsPerPage);

  // Table Config
  const columns = [
    { key: "title", label: "Note Title", align: "start" },
    { key: "preview", label: "Content Preview", align: "start" },
    { key: "date", label: "Last Updated", align: "start" },
    { key: "actions", label: "Actions", align: "end" }
  ];

  const renderCell = (note, columnKey) => {
    switch (columnKey) {
      case "title":
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-500">
               <BookOpen size={14} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{note.title || 'Untitled Note'}</span>
          </div>
        );
      case "preview":
        return <p className="text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[300px] text-xs font-medium">{stripHtml(note.content)}</p>;
      case "date":
        const dateObj = note.updatedAt || note.createdAt;
        const dateStr = dateObj ? new Date(dateObj.seconds * 1000).toLocaleDateString() : 'Unknown';
        return (
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">
             <Calendar size={12} /> {dateStr}
          </div>
        );
      case "actions":
        return (
          <div className="flex items-center justify-end gap-2">
            <Button isIconOnly size="sm" variant="flat" onPress={() => onEditNote && onEditNote(note)} className="bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
               <Pencil size={16} />
            </Button>
            <Button isIconOnly size="sm" variant="flat" onPress={() => setConfirmDeleteId(note.id)} className="bg-red-50 dark:bg-red-950/30 text-red-400 hover:text-red-500 transition-colors">
               <Trash2 size={16} />
            </Button>
          </div>
        );
      default:
        return note[columnKey];
    }
  };

  if (notes.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-teal-100 dark:border-slate-800 shadow-sm transition-colors duration-500">
        <BookOpen className="text-teal-200 dark:text-teal-950/30 mb-5 animate-pulse" size={64} />
        <h3 className="text-xl font-bold text-teal-900/70 dark:text-teal-500/40">No notes yet</h3>
        <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Create a note from the translation page using the floating button.</p>
      </div>
    );
  }

  return (
    <>
      <ContentFilter 
        title={title}
        description={description}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSearch={true}
        totalItems={finalNotes.length}
        label="Notes"
        color="emerald"
      />

      {finalNotes.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center opacity-40">
           <Search size={48} className="mb-4" />
           <p className="text-lg font-bold italic">No notes match your search</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6 items-start">
          {finalNotes.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map((note) => (
            <div 
              key={note.id} 
              className="bg-white dark:bg-slate-900/60 p-6 pt-7 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 dark:hover:shadow-black/20 transition-all duration-300 group relative overflow-hidden flex flex-col cursor-pointer"
              onClick={() => onEditNote && onEditNote(note)}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(note.id); }}
                disabled={isDeletingId === note.id}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-teal-50/50 dark:bg-slate-800/50 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 text-teal-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer border-none"
              >
                {isDeletingId === note.id ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} />}
              </button>

              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-2 flex-1 leading-snug">
                  {note.title || 'Untitled Note'}
                </h3>
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-900 flex items-center justify-center text-teal-400 dark:text-teal-500/50 group-hover:bg-teal-500 group-hover:text-white transition-all shrink-0">
                  <BookOpen size={18} />
                </div>
              </div>
              
              <div className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-4 flex-1 font-medium">
                {stripHtml(note.content)}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Notebook</span>
                <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold text-[10px] uppercase tracking-wider">
                  Details <Pencil size={10} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable 
          columns={columns}
          data={finalNotes.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage)}
          renderCell={renderCell}
          ariaLabel="Notebook table"
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
            color="success"
            variant="flat"
            size="lg"
            classNames={{
              wrapper: "gap-2",
              item: "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl border border-slate-100 dark:border-slate-700",
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
