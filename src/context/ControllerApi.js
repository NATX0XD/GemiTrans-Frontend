/**
 * Translation API Controller
 * Handles all external requests to the Translation Backend Service.
 */

const API_BASE_URL = process.env.REACT_APP_TRANSLATION_API_URL || 'https://translator-api-iota.vercel.app/api/translate';

export const translateTextAPI = async (payload) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('ControllerApi Error:', error);
    throw error;
  }
};