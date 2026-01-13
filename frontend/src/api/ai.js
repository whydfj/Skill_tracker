import api from "./api";

export const aiAPI = {
  sendRequest: async (question) => {
    const response = await api.post("/ai_request", { question });
    return response.data;
  },
};
