const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

async function parseResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {

    const message = data?.detail || data?.message || 'API request failed.';
    throw new Error(message);
  }

  return data;
}

export const api = {
  uploadFile: async (sessionId, file) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    return parseResponse(response);
  },

  removeDocument: async (sessionId, documentId) => {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/documents/${documentId}`, {
      method: 'DELETE',
    });

    return parseResponse(response);
  },

  askQuestion: async (sessionId, userQuestion) => {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        question: userQuestion,
      }),
    });

    return parseResponse(response);
  },
};
