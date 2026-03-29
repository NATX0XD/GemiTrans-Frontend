import { db } from '../configuration/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MAX_HISTORY_ITEMS = 100;

/**
 * Saves translation records to the user's history array.
 * Limits the total array size to MAX_HISTORY_ITEMS.
 * 
 * @param {string} uid - Firebase Auth User ID
 * @param {Array<object>} historyItemsArray - Array of items to save 
 *   [{ sourceText, translatedText, targetLang, objective, formality }]
 */
export const appendTranslationHistory = async (uid, historyItemsArray) => {
  if (!uid || !historyItemsArray || historyItemsArray.length === 0) return;
  
  const historyRef = doc(db, 'users', uid, 'data', 'history');
  
  try {
    const docSnap = await getDoc(historyRef);
    let historyList = [];
    
    if (docSnap.exists()) {
      historyList = docSnap.data().historyList || [];
    }
    
    // Map the new items and give them IDs
    const newItems = historyItemsArray.map(item => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5) // Unique ID
    }));

    // Unshift to add to the beginning of the array (newest first)
    historyList = [...newItems, ...historyList];
    
    // Trim to MAX
    if (historyList.length > MAX_HISTORY_ITEMS) {
      historyList = historyList.slice(0, MAX_HISTORY_ITEMS);
    }
    
    // Save back to Firestore
    await setDoc(historyRef, { historyList }, { merge: true });
    
    return historyList;
  } catch (error) {
    console.error("Error saving history: ", error);
    throw error;
  }
};

/**
 * Fetches the user's translation history array.
 * 
 * @param {string} uid - Firebase Auth User ID
 * @returns {Array} List of history items
 */
export const fetchTranslationHistory = async (uid) => {
  if (!uid) return [];
  
  const historyRef = doc(db, 'users', uid, 'data', 'history');
  
  try {
    const docSnap = await getDoc(historyRef);
    if (docSnap.exists() && docSnap.data().historyList) {
      return docSnap.data().historyList;
    }
    return [];
  } catch (error) {
    console.error("Error fetching history: ", error);
    return [];
  }
};

/**
 * Removes a specific translation record from the user's history array.
 * 
 * @param {string} uid - Firebase Auth User ID
 * @param {string} historyItemId - The unique ID of the item to remove
 * @returns {Array} Updated list of history items
 */
export const removeTranslationHistory = async (uid, historyItemId) => {
  if (!uid || !historyItemId) return;
  
  const historyRef = doc(db, 'users', uid, 'data', 'history');
  
  try {
    const docSnap = await getDoc(historyRef);
    if (!docSnap.exists()) return [];
    
    let historyList = docSnap.data().historyList || [];
    
    // Filter out the item to delete
    historyList = historyList.filter(item => item.id !== historyItemId);
    
    // Save the updated array back to Firestore
    await setDoc(historyRef, { historyList }, { merge: true });
    
    return historyList;
  } catch (error) {
    console.error("Error removing history item: ", error);
    throw error;
  }
};

