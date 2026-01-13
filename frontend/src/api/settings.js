import api from "./api";

export const settingsAPI = {
  updateSettings: async (newLang, newTheme) => {
    const response = await api.patch("/reset_settings", {
      new_lang: newLang,
      new_theme: newTheme,
    });
    return response.data;
  },
};
