import { useState } from "react";
import api from "../api/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Backend ждёт JSON (User_Login_Schema)
      await api.post("/login", {
        username,
        password,
      });

      // Если логин успешен — редирект
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Вход в систему
        </h1>

        {error && (
          <div className="mb-4 text-red-600 text-center">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Логин или email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
        >
          Войти
        </button>
      </form>
    </div>
  );
}
