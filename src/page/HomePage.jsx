import React, { useState, useCallback, useRef } from 'react'
import TranslationWorkspace from '../components/Main/CardTranslator/TranslationWorkspace'
import LanguageSelectorModal from '../components/Main/CardTranslator/LanguageSelectorModal'
import NoteEditorModal from '../components/Notebook/NoteEditorModal'
import NoteSelectionModal from '../components/Notebook/NoteSelectionModal'
import { PenLine } from 'lucide-react'

const HomePage = () => {
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [langModalCardId, setLangModalCardId] = useState(null);
  const [langModalCurrentLang, setLangModalCurrentLang] = useState(null);
  const [langModalCallback, setLangModalCallback] = useState(null);
  
  const [noteSelectionOpen, setNoteSelectionOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [targetNote, setTargetNote] = useState(null); // null means new note, else existing note object
  const [pendingTranslation, setPendingTranslation] = useState(null);
  
  const workspaceRef = useRef(null);

  const handleOpenLanguageModal = useCallback((cardId, currentLang, onSelectCallback) => {
    setLangModalCardId(cardId);
    setLangModalCurrentLang(currentLang);
    setLangModalCallback(() => onSelectCallback);
    setLangModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setLangModalOpen(false);
  }, []);

  const handleSelectLanguage = useCallback((cardId, lang) => {
    if (langModalCallback) {
      langModalCallback(cardId, lang);
    }
    setLangModalOpen(false);
  }, [langModalCallback]);

  const handleNoteButtonClick = () => {
    if (workspaceRef.current) {
      const data = workspaceRef.current.getNoteData();
      setPendingTranslation(data);
      setNoteSelectionOpen(true);
    }
  };

  const generateTranslationHTML = (src, trans) => {
    if (!src && (!trans || trans.length === 0)) return '<p></p>';
    let html = '';
    if (src) html += `<p><strong>Original:</strong> ${src}</p>`;
    if (trans && trans.length > 0) {
      trans.forEach(t => {
        html += `<p><strong>${t.lang}:</strong> ${t.text}</p>`;
      });
    }
    html += '<hr><p></p>';
    return html;
  };

  const handleCreateNewNote = () => {
    setTargetNote(null);
    setNoteSelectionOpen(false);
    setNoteModalOpen(true);
  };

  const handleSelectExistingNote = (note) => {
    // Build appended content
    const newContent = generateTranslationHTML(pendingTranslation.sourceText, pendingTranslation.translations);
    const updatedNote = {
      ...note,
      content: note.content + '<hr>' + newContent
    };
    
    setTargetNote(updatedNote);
    setNoteSelectionOpen(false);
    setNoteModalOpen(true);
  };

  return (
    <div className="w-full flex-1 flex flex-col relative min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)]">
      <TranslationWorkspace ref={workspaceRef} onOpenLanguageModal={handleOpenLanguageModal} />
      
      <LanguageSelectorModal
        isOpen={langModalOpen}
        onClose={handleCloseModal}
        activeCardId={langModalCardId}
        currentLang={langModalCurrentLang}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Note Selection Modal */}
      <NoteSelectionModal
        isOpen={noteSelectionOpen}
        onClose={() => setNoteSelectionOpen(false)}
        onCreateNew={handleCreateNewNote}
        onSelectNote={handleSelectExistingNote}
      />

      {/* Floating Note Button */}
      <button
        onClick={handleNoteButtonClick}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-white border-none cursor-pointer outline-none group"
        title="Add to Notebook"
      >
        <PenLine size={22} className="group-hover:rotate-[-8deg] transition-transform" />
      </button>

      {/* Note Editor Modal */}
      {noteModalOpen && (
        <NoteEditorModal
          key={targetNote ? targetNote.id : 'new-note'}
          isOpen={true}
          onClose={() => setNoteModalOpen(false)}
          sourceText={pendingTranslation?.sourceText}
          translations={pendingTranslation?.translations || []}
          editNote={targetNote}
        />
      )}
    </div>
  )
}

export default HomePage