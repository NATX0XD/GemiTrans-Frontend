import { db } from '../configuration/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MAX_NOTES = 50;

/**
 * Add or update a note in the user's notesList array.
 * If note with same ID exists, it updates. Otherwise, prepends.
 */
export const saveNote = async (uid, noteItem) => {
  if (!uid || !noteItem) return;
  const ref = doc(db, 'users', uid, 'data', 'notes');

  try {
    const snap = await getDoc(ref);
    let notesList = snap.exists() ? (snap.data().notesList || []) : [];

    const existingIndex = notesList.findIndex(n => n.id === noteItem.id);
    if (existingIndex >= 0) {
      // Update existing note
      notesList[existingIndex] = { ...notesList[existingIndex], ...noteItem };
    } else {
      // New note — prepend
      notesList.unshift(noteItem);
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

/**
 * Fetches all notes for a user.
 */
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

/**
 * Removes a specific note by its ID.
 */
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
