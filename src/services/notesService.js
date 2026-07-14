import { db } from '../configuration/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MAX_NOTES = 50;


export const saveNote = async (uid, noteItem) => {
  if (!uid || !noteItem) return;
  const ref = doc(db, 'users', uid, 'data', 'notes');

  try {
    const snap = await getDoc(ref);
    let notesList = snap.exists() ? (snap.data().notesList || []) : [];

    const now = Date.now();
    const existingIndex = notesList.findIndex(n => n.id === noteItem.id);
    if (existingIndex >= 0) {
      notesList[existingIndex] = { 
        ...notesList[existingIndex], 
        ...noteItem, 
        updatedAt: now 
      };
    } else {
      notesList.unshift({ 
        ...noteItem, 
        createdAt: now, 
        updatedAt: now 
      });
      if (notesList.length > MAX_NOTES) {
        notesList = notesList.slice(0, MAX_NOTES);
      }
    }

    await setDoc(ref, { notesList }, { merge: true });
    return notesList;
  } catch (error) {
    console.error("Error saving note: ", error);
    throw error;
  }
};


export const fetchNotes = async (uid) => {
  if (!uid) return [];
  const ref = doc(db, 'users', uid, 'data', 'notes');
  try {
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data().notesList || []) : [];
  } catch (error) {
    console.error("Error fetching notes: ", error);
    return [];
  }
};

export const removeNote = async (uid, noteId) => {
  if (!uid || !noteId) return;
  const ref = doc(db, 'users', uid, 'data', 'notes');
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    let notesList = (snap.data().notesList || []).filter(n => n.id !== noteId);
    await setDoc(ref, { notesList }, { merge: true });
    return notesList;
  } catch (error) {
    console.error("Error removing note: ", error);
    throw error;
  }
};
