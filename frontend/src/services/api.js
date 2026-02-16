import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/multipart-form-data',
    },
  });
  return response.data;
};

export const generateQuiz = async (config) => {
  const response = await api.post('/generate', config);
  return response.data;
};

export const logProctorViolation = async (sessionId, violationType) => {
  const response = await api.post('/proctor/log', {
    session_id: sessionId,
    violation_type: violationType,
  });
  return response.data;
};

export const submitQuiz = async (sessionId, answers) => {
  const response = await api.post('/submit', {
    session_id: sessionId,
    answers: answers,
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const getHistoryDetail = async (sessionId) => {
  const response = await api.get(`/history/${sessionId}`);
  return response.data;
};

export const getReportDownloadUrl = (sessionId) => {
  return `/api/report/download/${sessionId}`;
};

export default api;