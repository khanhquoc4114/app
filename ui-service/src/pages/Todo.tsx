import { useEffect, useState } from "react";
import api from "../services/axiosInstance";
import type { Todo } from "../types/types";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first");
      return;
    }

    api
      .get<Todo[]>("/todos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTodos(res.data))
      .catch(() => setError("Failed to fetch todos"));
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Your Todos</h2>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}
