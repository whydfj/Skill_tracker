import { useEffect, useState } from "react";
import api from "../api/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/get_current_user")
      .then(res => setUser(res.data))
      .catch(() => window.location.href = "/");
  }, []);

  if (!user) return null;

  return (
    <div>
      <h2>Привет, {user.name}</h2>
      <p>Роль: {user.role}</p>
    </div>
  );
}
