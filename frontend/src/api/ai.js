import api from "./api";

export const aiAPI = {
  sendRequest: async (question) => {
    const response = await api.post("/ai_request", { question });
    return response.data;
  },

  suggestTaskDescription: async ({ username, title, draft_description }) => {
    const response = await api.post("/ai_task_autocomplete", {
      username,
      title,
      draft_description,
    });
    return response.data;
  },
};
