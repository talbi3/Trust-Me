const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const sendMessageToMars = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Chat Service Error:', error);
    throw error;
  }
};