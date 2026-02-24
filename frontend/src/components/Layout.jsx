// frontend/src/components/Layout.jsx
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Применяем сохранённые тему и язык при монтировании layout
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const storedTheme = window.localStorage.getItem("appTheme");
    const storedLang = window.localStorage.getItem("appLang");

    const themeValue = storedTheme !== null ? Number(storedTheme) : 0;
    const langValue = storedLang || "russian";

    document.body.classList.toggle("theme-dark", themeValue === 1);

    const langCode =
      langValue === "english" ? "en" : langValue === "Belarusian" ? "be" : "ru";
    document.documentElement.lang = langCode;
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
      <Navbar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {/* Кнопка hamburger для открытия меню */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 border border-blue-100"
          aria-label="Открыть меню"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {children}
      </main>
    </div>
  );
}