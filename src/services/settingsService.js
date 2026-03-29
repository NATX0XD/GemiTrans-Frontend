import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../configuration/firebase';

/**
 * Gets the user's settings from Firestore.
 * @param {string} userId - The current user's UID
 * @returns {Promise<Object>} The user's settings or default values
 */
export const getUserSettings = async (userId) => {
  if (!userId) return null;
  try {
    // The path: users/{userId}/settings/preferences
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Return default settings if no document exists yet
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
 * Saves or updates the user's settings in Firestore.
 * @param {string} userId - The current user's UID
 * @param {Object} settingsData - The settings object to save
 * @returns {Promise<void>}
 */
export const saveUserSettings = async (userId, settingsData) => {
  if (!userId) throw new Error('No user ID provided');
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
    // using { merge: true } to merge with existing settings
    await setDoc(settingsRef, settingsData, { merge: true });
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};
