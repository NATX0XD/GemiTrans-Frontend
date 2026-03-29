import React, { useState, useCallback } from 'react';
import NotebookContainer from '../components/Notebook/NotebookContainer';
import NoteEditorModal from '../components/Notebook/NoteEditorModal';
import PageBackground from '../components/Main/Layout/PageBackground';

const NotebookPage = () => {
  const [editingNote, setEditingNote] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCloseEditor = useCallback(() => {
    setEditingNote(null);
    // Trigger a re-render of NotebookContainer instead of full page reload
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <PageBackground type="notebook">
      <div className="w-full flex-1 flex flex-col relative h-[calc(100vh-80px)] overflow-y-auto">
        <div className="w-full px-4 lg:px-8 py-10 lg:py-12">
          
          <div className="max-w-7xl mx-auto mb-10 text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center lg:justify-start gap-4">
              Notebook
            </h1>
            <p className="text-slate-500 mt-3 font-medium text-sm lg:text-base max-w-xl mx-auto lg:mx-0">
              Your personal learning journal. Create notes from translations and build your vocabulary with rich formatting.
            </p>
          </div>

          <div className="max-w-7xl mx-auto w-full">
            <NotebookContainer key={refreshKey} onEditNote={(note) => setEditingNote(note)} />
          </div>
          
        </div>

        {/* Edit Note Modal */}
        {editingNote && (
          <NoteEditorModal
            key={editingNote.id}
            isOpen={true}
            onClose={handleCloseEditor}
            sourceText={editingNote.sourceText}
            translations={editingNote.translations || []}
            editNote={editingNote}
          />
        )}
      </div>
    </PageBackground>
  );
};

export default NotebookPage;
