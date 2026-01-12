import api from './api';

export const analyzeYoutubeVideo = async (link) => {
  try {
    const response = await api.post('/api/insights/analyze', { link });
    return response.data; 
  } catch (error) {
    console.error("Failed to analyze video:", error);
    throw error;
  }
};