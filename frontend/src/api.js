const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

async function parseResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.detail || data?.message || 'La requete API a echoue.';
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
    // CORRECTION 1 : L'adresse est maintenant /query (comme dans le main.py)
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // CORRECTION 2 : Les noms des variables correspondent exactement au backend
      body: JSON.stringify({
        doc_id: docId,
        question: userQuestion,
      }),
    });

    return parseResponse(response);
  },
};
