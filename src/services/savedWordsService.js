import { db } from '../configuration/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MAX_SAVED_WORDS = 200;

/**
 * Saves a word/translation to the user's savedWords array.
 */
export const addSavedWord = async (uid, wordItem) => {
  if (!uid || !wordItem.translatedText) return;

  const ref = doc(db, 'users', uid, 'data', 'favorites');

  try {
    const snap = await getDoc(ref);
    let savedWords = snap.exists() ? (snap.data().savedWords || []) : [];

    // Prevent duplicates based on same source + target text
    const exists = savedWords.some(
      w => w.sourceText === wordItem.sourceText && w.translatedText === wordItem.translatedText
    );
    if (exists) return savedWords;

    savedWords.unshift({
      ...wordItem,
      date: Date.now(),
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
    });

    if (savedWords.length > MAX_SAVED_WORDS) {
      savedWords = savedWords.slice(0, MAX_SAVED_WORDS);
    }

    await setDoc(ref, { savedWords }, { merge: true });
    return savedWords;
  } catch (error) {
    console.error("Error saving word: ", error);
    throw error;
  }
};

/**
 * Fetches all saved words for a user.
 */
export const fetchSavedWords = async (uid) => {
  if (!uid) return [];
  const ref = doc(db, 'users', uid, 'data', 'favorites');
  try {
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data().savedWords || []) : [];
  } catch (error) {
    console.error("Error fetching saved words: ", error);
    return [];
  }
};

/**
 * Removes a specific saved word by its ID.
 */
export const removeSavedWord = async (uid, wordId) => {
  if (!uid || !wordId) return;
  const ref = doc(db, 'users', uid, 'data', 'favorites');
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    let savedWords = (snap.data().savedWords || []).filter(w => w.id !== wordId);
    await setDoc(ref, { savedWords }, { merge: true });
    return savedWords;
  } catch (error) {
    console.error("Error removing saved word: ", error);
    throw error;
  }
};
