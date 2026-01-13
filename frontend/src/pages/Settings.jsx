import { useState } from "react";
import Layout from "../components/Layout";
import { settingsAPI } from "../api/settings";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [lang, setLang] = useState("russian");
  const [theme, setTheme] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const saveSettings = async () => {
    setLoading(true);
    setMessage("");
    try {
      await settingsAPI.updateSettings(
        lang !== "russian" ? lang : null,
        theme !== 0 ? theme : null
      );
      setMessage("Настройки успешно сохранены!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Ошибка сохранения настроек: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">Настройки</h2>
          <p className="text-gray-600">Персонализация приложения</p>
        </div>

        <div className="card p-8 max-w-2xl">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border-2 shadow-sm ${
                message.includes("Ошибка")
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
                Язык приложения
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
                Тема интерфейса
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
                  <span className="text-gray-700">Светлая</span>
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
                  <span className="text-gray-700">Тёмная</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Сохранение..." : "Сохранить настройки"}
              </button>
            </div>
          </div>
        </div>

        <div className="card p-8 max-w-2xl">
          <h3 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            <span>👤</span>
            <span>Информация о профиле</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">Логин</span>
              <p className="font-semibold text-gray-800 text-lg">{user?.username}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">Email</span>
              <p className="font-semibold text-gray-800 text-lg">{user?.email_user || "Не указан"}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">Имя</span>
              <p className="font-semibold text-gray-800 text-lg">
                {user?.name} {user?.surname}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">Роль</span>
              <p className="font-semibold text-gray-800 text-lg">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}