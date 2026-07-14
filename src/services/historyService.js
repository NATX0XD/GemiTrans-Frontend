import { db } from '../configuration/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MAX_HISTORY_ITEMS = 100;

/**
 * 
 * 
 * @param {string} uid 
 * @param {Array<object>} historyItemsArray 
 *   
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


    const newItems = historyItemsArray.map(item => ({
      ...item,
      date: Date.now(),
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
    }));


    historyList = [...newItems, ...historyList];


    if (historyList.length > MAX_HISTORY_ITEMS) {
      historyList = historyList.slice(0, MAX_HISTORY_ITEMS);
    }


    await setDoc(historyRef, { historyList }, { merge: true });

    return historyList;
  } catch (error) {
    console.error("Error saving history: ", error);
    throw error;
  }
};

/**
 *
 * 
 * @param {string} uid 
 * @returns {Array} 
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
 * 
 * 
 * @param {string} uid 
 * @param {string} historyItemId 
 * @returns {Array} 
 */
export const removeTranslationHistory = async (uid, historyItemId) => {
  if (!uid || !historyItemId) return;

  const historyRef = doc(db, 'users', uid, 'data', 'history');

  try {
    const docSnap = await getDoc(historyRef);
    if (!docSnap.exists()) return [];

    let historyList = docSnap.data().historyList || [];


    historyList = historyList.filter(item => item.id !== historyItemId);


    await setDoc(historyRef, { historyList }, { merge: true });

    return historyList;
  } catch (error) {
    console.error("Error removing history item: ", error);
    throw error;
  }
};

