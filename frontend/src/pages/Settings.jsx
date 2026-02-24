import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { settingsAPI } from "../api/settings";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [lang, setLang] = useState("russian");
  const [theme, setTheme] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const texts = {
    russian: {
      title: "Настройки",
      subtitle: "Персонализация приложения",
      langLabel: "Язык приложения",
      themeLabel: "Тема интерфейса",
      themeLight: "Светлая",
      themeDark: "Тёмная",
      save: "Сохранить настройки",
      saving: "Сохранение...",
      profileTitle: "Информация о профиле",
      login: "Логин",
      email: "Email",
      name: "Имя",
      role: "Роль",
      notSpecified: "Не указан",
      loadingSettings: "Загрузка настроек...",
      errorPrefix: "Ошибка",
      successSave: "Настройки успешно сохранены!",
      errorSave: "Ошибка сохранения настроек: ",
    },
    english: {
      title: "Settings",
      subtitle: "Application personalization",
      langLabel: "Application language",
      themeLabel: "Interface theme",
      themeLight: "Light",
      themeDark: "Dark",
      save: "Save settings",
      saving: "Saving...",
      profileTitle: "Profile information",
      login: "Login",
      email: "Email",
      name: "Name",
      role: "Role",
      notSpecified: "Not specified",
      loadingSettings: "Loading settings...",
      errorPrefix: "Error",
      successSave: "Settings saved successfully!",
      errorSave: "Error saving settings: ",
    },
    Belarusian: {
      title: "Наладкі",
      subtitle: "Персаналізацыя прыкладання",
      langLabel: "Мова прыкладання",
      themeLabel: "Тэма інтэрфейсу",
      themeLight: "Светлая",
      themeDark: "Цёмная",
      save: "Захаваць наладкі",
      saving: "Захаванне...",
      profileTitle: "Інфармацыя пра профіль",
      login: "Лагін",
      email: "Email",
      name: "Імя",
      role: "Роля",
      notSpecified: "Не ўказаны",
      loadingSettings: "Загрузка налад...",
      errorPrefix: "Памылка",
      successSave: "Наладкі паспяхова захаваны!",
      errorSave: "Памылка захавання налад: ",
    },
  };

  const t = texts[lang] || texts.russian;

  const applyThemeAndLang = (themeValue, langValue) => {
    // тема
    if (typeof document !== "undefined") {
      document.body.classList.toggle("theme-dark", Number(themeValue) === 1);
    }
    // язык (атрибут html)
    if (typeof document !== "undefined") {
      const langCode =
        langValue === "english" ? "en" : langValue === "Belarusian" ? "be" : "ru";
      document.documentElement.lang = langCode;
    }
    // сохраняем в localStorage
    if (typeof window !== "undefined") {
      window.localStorage.setItem("appTheme", String(themeValue));
      window.localStorage.setItem("appLang", langValue);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsAPI.getSettings();
        const serverTheme = typeof data.theme_style === "number" ? data.theme_style : 0;
        const serverLang = data.language_app || "russian";
        setTheme(serverTheme);
        setLang(serverLang);
        applyThemeAndLang(serverTheme, serverLang);
      } catch (error) {
        // если не удалось загрузить — пробуем использовать localStorage
        if (typeof window !== "undefined") {
          const storedTheme = window.localStorage.getItem("appTheme");
          const storedLang = window.localStorage.getItem("appLang");
          const themeValue = storedTheme !== null ? Number(storedTheme) : 0;
          const langValue = storedLang || "russian";
          setTheme(themeValue);
          setLang(langValue);
          applyThemeAndLang(themeValue, langValue);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    setMessage("");
    try {
      await settingsAPI.updateSettings(
        lang !== "russian" ? lang : null,
        theme !== 0 ? theme : null
      );
      applyThemeAndLang(theme, lang);
      setMessage(t.successSave);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(
        t.errorSave + (error.response?.data?.detail || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t.loadingSettings}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">{t.title}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="card p-8 max-w-2xl">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border-2 shadow-sm ${
                message.includes(t.errorPrefix)
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-green-50 text-green-600 border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.langLabel}
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="input-field"
              >
                <option value="russian">Русский</option>
                <option value="english">English</option>
                <option value="Belarusian">Беларуская</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.themeLabel}
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={0}
                    checked={theme === 0}
                    onChange={() => setTheme(0)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{t.themeLight}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={1}
                    checked={theme === 1}
                    onChange={() => setTheme(1)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{t.themeDark}</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>

        <div className="card p-8 max-w-2xl">
          <h3 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            <span>👤</span>
            <span>{t.profileTitle}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">{t.login}</span>
              <p className="font-semibold text-gray-800 text-lg">{user?.username}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">{t.email}</span>
              <p className="font-semibold text-gray-800 text-lg">{user?.email_user || t.notSpecified}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">{t.name}</span>
              <p className="font-semibold text-gray-800 text-lg">
                {user?.name} {user?.surname}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">{t.role}</span>
              <p className="font-semibold text-gray-800 text-lg">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}