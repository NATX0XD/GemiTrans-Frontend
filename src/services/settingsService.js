import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../configuration/firebase';

/**
 * 
 * @param {string} userId 
 * @returns {Promise<Object>} 
 */
export const getUserSettings = async (userId) => {
  if (!userId) return null;
  try {

    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {

      return {
        defaultLanguages: ['English', 'Japanese'],
        voiceSettings: { speed: 1.0, pitch: 1.0 },
        theme: 'light',
      };
    }
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

/**
 * 
 * @param {string} userId 
 * @param {Object} settingsData 
 * @returns {Promise<void>}
 */
export const saveUserSettings = async (userId, settingsData) => {
  if (!userId) throw new Error('No user ID provided');
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');

    await setDoc(settingsRef, settingsData, { merge: true });
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};
