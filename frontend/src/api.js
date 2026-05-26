const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

async function parseResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // TRADUCTION ICI : "La requete API a echoue." devient "API request failed."
    const message = data?.detail || data?.message || 'API request failed.';
    throw new Error(message);
  }

  return data;
}

export const api = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    return parseResponse(response);
  },

  askQuestion: async (docId, userQuestion) => {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doc_id: docId,
        question: userQuestion,
      }),
    });

    return parseResponse(response);
  },
};
