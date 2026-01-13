import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
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
    <aside className="w-72 bg-white shadow-2xl p-6 flex flex-col border-r border-blue-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text mb-2">SkillTracker</h1>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
      </div>
      
      <nav className="flex flex-col gap-2 flex-1">
        <Link to="/dashboard" className={navLinkClass("/dashboard")}>
          <span className="text-xl">📊</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/tasks" className={navLinkClass("/tasks")}>
          <span className="text-xl">📝</span>
          <span>Мои задачи</span>
        </Link>
        {isManager() && (
          <Link to="/task-management" className={navLinkClass("/task-management")}>
            <span className="text-xl">⚙️</span>
            <span>Управление задачами</span>
          </Link>
        )}
        {(user?.role === "admin" || user?.role === "manager") && (
          <Link to="/users" className={navLinkClass("/users")}>
            <span className="text-xl">👥</span>
            <span>Пользователи</span>
          </Link>
        )}
        <Link to="/ai-assistant" className={navLinkClass("/ai-assistant")}>
          <span className="text-xl">🤖</span>
          <span>AI Помощник</span>
        </Link>
        <Link to="/settings" className={navLinkClass("/settings")}>
          <span className="text-xl">⚙️</span>
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
          className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
        >
          🚪 Выйти из системы
        </button>
      </div>
    </aside>
  );
}