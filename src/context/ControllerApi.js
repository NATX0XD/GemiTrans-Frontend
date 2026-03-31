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

    const data = await response.json();

    if (!response.ok) {
      // Create a rich error object for the caller
      const error = new Error(data.message || `API error: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('ControllerApi Error:', error);
    throw error;
  }
};