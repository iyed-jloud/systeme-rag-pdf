import axios from 'axios';

// C'est l'adresse où tournera le Python de ton collègue
const API_BASE_URL = 'http://127.0.0.1:8000'; 

export const api = {
  // Fonction pour envoyer le PDF
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/upload`, formData);
    return response.data; // Renvoie l'ID du document
  },

  // Fonction pour poser une question
  askQuestion: async (docId, question) => {
    const response = await axios.post(`${API_BASE_URL}/ask`, {
      document_id: docId,
      query: question
    });
    return response.data; // Renvoie la réponse de l'IA
  }
};