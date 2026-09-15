import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 180000, // 3 minutes for AI processing
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — normalise error messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail || err.response?.data?.error;

    let message = 'Something went wrong. Please try again.';
    if (detail) message = detail;
    else if (status === 404) message = 'Video not found or is private.';
    else if (status === 422) message = 'Please enter a valid YouTube URL.';
    else if (status === 429) message = 'The AI service is temporarily busy. Please try again in a moment.';
    else if (status === 500) message = "We couldn't generate notes right now. Please try again.";
    else if (!err.response) message = 'Network error. Please check your connection.';

    return Promise.reject(new Error(message));
  }
);

export const videoApi = {
  validate: (url) => api.post('/videos/validate', { url }).then((r) => r.data),
  process: (url, provider) => api.post('/videos/process', { url, ai_provider: provider }).then((r) => r.data),
  processPlaylist: (url, provider) => api.post('/videos/playlist', { url, ai_provider: provider }).then((r) => r.data),
  exportPdf: async (data) => {
    const res = await api.post('/videos/export/pdf', data, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NoteTube_${data.notes?.title?.slice(0, 50) || 'notes'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export default api;
