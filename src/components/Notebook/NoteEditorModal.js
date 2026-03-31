import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { X, Bold, Italic, UnderlineIcon, Highlighter, Type, Check, Loader2 } from 'lucide-react';
import { auth } from '../../configuration/firebase';
import { saveNote } from '../../services/notesService';

const COLORS = ['#000000','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899'];

const NoteEditorModal = ({ isOpen, onClose, sourceText, translations = [], editNote }) => {
  const [noteId] = useState(() => editNote?.id || (Date.now().toString() + Math.random().toString(36).substr(2, 5)));
  const [title, setTitle] = useState(editNote?.title || 'Untitled Note');
  const [saveStatus, setSaveStatus] = useState('idle');
  const debounceTimer = useRef(null);
  
  // [x] Implement `SkeletonHeader` in `SkeletonCard.js`
  // [/] Update `HistoryContainer.js` with new loading state
  // If we're editing an existing note OR creating a new note from translation data, mark as edited so it saves
  const hasUserEdited = useRef(!!editNote || !!sourceText || (translations && translations.length > 0)); 
  
  const titleRef = useRef(title);

  // Keep titleRef in sync
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: editNote?.content || buildInitialContent(sourceText, translations),
  });

  const performSave = useCallback(async () => {
    if (!auth.currentUser || !editor) return;
    setSaveStatus('saving');
    try {
      await saveNote(auth.currentUser.uid, {
        id: noteId,
        title: titleRef.current,
        content: editor.getHTML(),
        sourceText: sourceText || '',
        translations: translations || [],
        targetLang: translations[0]?.lang || '',
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Auto-save failed', err);
      setSaveStatus('idle');
    }
  }, [editor, noteId, sourceText, translations]);

  const triggerAutoSave = useCallback(() => {
    if (!hasUserEdited.current) return; // Don't save if user hasn't typed
    setSaveStatus('saving');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSave();
    }, 1500);
  }, [performSave]);

  // Handle editor updates
  useEffect(() => {
    if (!editor) return;
    
    const handleUpdate = () => {
      hasUserEdited.current = true;
      triggerAutoSave();
    };

    editor.on('update', handleUpdate);
    return () => editor.off('update', handleUpdate);
  }, [editor, triggerAutoSave]);

  useEffect(() => {
    if (!editNote && hasUserEdited.current && editor) {
      triggerAutoSave();
    }
  }, [editor, editNote, triggerAutoSave]);

  function buildInitialContent(src, trans) {
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
  }


  useEffect(() => {
    if (hasUserEdited.current && editor) {
      triggerAutoSave();
    }
  }, [title, editor, triggerAutoSave]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    // Only save on close if user actually edited something
    if (auth.currentUser && editor && hasUserEdited.current) {
      saveNote(auth.currentUser.uid, {
        id: noteId,
        title: titleRef.current,
        content: editor.getHTML(),
        sourceText: sourceText || '',
        translations: translations || [],
        targetLang: translations[0]?.lang || '',
      }).catch(e => console.error(e));
    }
    onClose();
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    hasUserEdited.current = true;
  };

  const modalContent = (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-[92%] max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl dark:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden transition-colors duration-500"
        style={{ height: '75vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 mr-4">
            <input 
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full text-xl font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
              placeholder="Note title..."
            />
          </div>
          <div className="flex items-center gap-4">
            {/* Save Status */}
            <span className="text-xs font-semibold tracking-wide h-9 flex items-center">
              {saveStatus === 'saving' && <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" /> Saving...</span>}
              {saveStatus === 'saved' && <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5"><Check size={13} /> Saved</span>}
            </span>
            
            {/* Manual Save Button */}
            <button
              onClick={() => { hasUserEdited.current = true; performSave(); }}
              disabled={saveStatus === 'saving'}
              className="px-4 h-9 rounded-xl bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-500/20 dark:shadow-teal-900/40 active:scale-95 disabled:opacity-50 border-none cursor-pointer"
            >
              Save Now
            </button>

            <button 
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border-none outline-none"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        {editor && (
          <div className="flex items-center gap-1 px-8 py-3 border-b border-slate-100 dark:border-slate-800 flex-wrap">
            <ToolbarButton 
              active={editor.isActive('bold')} 
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            ><Bold size={16} /></ToolbarButton>
            <ToolbarButton 
              active={editor.isActive('italic')} 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            ><Italic size={16} /></ToolbarButton>
            <ToolbarButton 
              active={editor.isActive('underline')} 
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            ><UnderlineIcon size={16} /></ToolbarButton>
            <ToolbarButton 
              active={editor.isActive('highlight')} 
              onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
              title="Highlight"
            ><Highlighter size={16} /></ToolbarButton>
            
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-2"></div>
            
            <ToolbarButton 
              active={editor.isActive('heading', { level: 2 })} 
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading"
            ><Type size={16} /></ToolbarButton>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-2"></div>

            {/* Color Swatches */}
            {COLORS.map(color => (
              <button 
                key={color}
                onClick={() => editor.chain().focus().setColor(color).run()}
                className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm cursor-pointer hover:scale-125 transition-transform outline-none"
                style={{ backgroundColor: color }}
                title={`Text color: ${color}`}
              />
            ))}
          </div>
        )}

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <EditorContent editor={editor} className="tiptap-editor prose prose-slate dark:prose-invert max-w-none min-h-full" />
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

const ToolbarButton = ({ children, active, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border-none cursor-pointer outline-none ${
      active 
        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' 
        : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
    }`}
  >
    {children}
  </button>
);

export default NoteEditorModal;
