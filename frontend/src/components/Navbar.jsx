import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ isOpen, onClose }) {
  const { user, isManager, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
      isActive(path)
        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
    }`;

  const getRoleLabel = (role) => {
    const labels = {
      admin: "Администратор",
      manager: "Руководитель",
      user: "Сотрудник",
      employee: "Сотрудник",
    };
    return labels[role] || role;
  };

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Боковая панель */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-white shadow-2xl p-6 flex flex-col border-r border-blue-100 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text mb-2">SkillTracker</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <Link to="/dashboard" className={navLinkClass("/dashboard")} onClick={onClose}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Dashboard</span>
          </Link>
          {user?.role !== "admin" && (
            <Link to="/tasks" className={navLinkClass("/tasks")} onClick={onClose}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Мои задачи</span>
            </Link>
          )}
          {isManager() && (
            <Link to="/task-management" className={navLinkClass("/task-management")} onClick={onClose}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Управление задачами</span>
            </Link>
          )}
          {(user?.role === "admin" || user?.role === "manager") && (
            <Link to="/users" className={navLinkClass("/users")} onClick={onClose}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Пользователи</span>
            </Link>
          )}
          <Link to="/ai-assistant" className={navLinkClass("/ai-assistant")} onClick={onClose}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>AI Помощник</span>
          </Link>
          <Link to="/settings" className={navLinkClass("/settings")} onClick={onClose}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Настройки</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-blue-100">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  {user?.name} {user?.surname}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {getRoleLabel(user?.role)}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-medium flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Выйти из системы</span>
          </button>
        </div>
      </aside>
    </>
  );
}