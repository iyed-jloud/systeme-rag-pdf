const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

async function fetchApi(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error('Backend is not reachable. Start it with npm run dev:backend, then try again.');
  }
}

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

    const response = await fetchApi(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    return parseResponse(response);
  },

  removeDocument: async (sessionId, documentId) => {
    const response = await fetchApi(`${API_BASE_URL}/sessions/${sessionId}/documents/${documentId}`, {
      method: 'DELETE',
    });

    return parseResponse(response);
  },

  askQuestion: async (sessionId, userQuestion, history = []) => {
    const response = await fetchApi(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        question: userQuestion,
        history,
      }),
    });

    return parseResponse(response);
  },

  streamQuestion: async ({ sessionId, question, history = [], onSources, onDelta }) => {
    const response = await fetchApi(`${API_BASE_URL}/query/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        question,
        history,
      }),
    });

    if (!response.ok) {
      await parseResponse(response);
      return;
    }

    if (!response.body) {
      throw new Error('Streaming is not supported by this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        const event = JSON.parse(line);
        if (event.type === 'sources') {
          onSources?.(event.sources || []);
        }

        if (event.type === 'delta') {
          onDelta?.(event.content || '');
        }

        if (event.type === 'error') {
          throw new Error(event.message || 'Streaming response failed.');
        }
      }
    }
  },
};
