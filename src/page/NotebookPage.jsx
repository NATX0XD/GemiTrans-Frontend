import React, { useState, useCallback } from 'react';
import NotebookContainer from '../components/Notebook/NotebookContainer';
import NoteEditorModal from '../components/Notebook/NoteEditorModal';
import PageBackground from '../components/Main/Layout/PageBackground';
import { useTranslation } from '../context/LanguageContext';

const NotebookPage = () => {
  const { t } = useTranslation();
  const [editingNote, setEditingNote] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCloseEditor = useCallback(() => {
    setEditingNote(null);
    
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <PageBackground type="notebook">
      <div className="w-full flex-1 flex flex-col relative h-[calc(100vh-80px)] overflow-y-auto">
        <div className="w-full px-4 lg:px-8 py-10 lg:py-12">
          
          <div className="max-w-7xl mx-auto w-full">
            <NotebookContainer 
              key={refreshKey} 
              onEditNote={(note) => setEditingNote(note)}
              title={t('notebook.pageTitle')}
              description={t('notebook.pageDescription')}
            />
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
