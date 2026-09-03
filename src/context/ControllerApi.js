import { TRANSLATE_URL } from './apiBase';

export const translateTextAPI = async (payload) => {
  try {
    const response = await fetch(TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Read as text first: Vercel answers platform failures with an HTML page, and
    // parsing that before the ok check threw a SyntaxError carrying no .status, so
    // the `err.status === 429` quota branch never fired.
    const raw = await response.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = new Error((data && data.message) || `API error: ${response.status}`);
      error.status = response.status;
      error.data = data || { message: raw.slice(0, 200) };
      throw error;
    }

    // A 200 whose body is empty or unparseable used to throw a SyntaxError, which the
    // UI showed as a failure. Quietly returning {} instead would render an empty
    // translation card with no error, so keep it a failure — just a legible one.
    if (data === null) {
      const error = new Error('The translation service returned an unreadable response.');
      error.status = response.status;
      error.data = { message: raw.slice(0, 200) };
      throw error;
    }

    return data;
  } catch (error) {
    console.error('ControllerApi Error:', error);
    throw error;
  }
};