import { useState, useEffect } from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import { TodoItem } from "./types";
import {
  fetchTodos,
  addTodo,
  deleteTodo,
  connectWebSocket,
  disconnectWebSocket,
} from "./services/api";

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Fetch todos initially using REST API as a fallback
    loadTodos();

    // Set up WebSocket connection
    const handleWebSocketMessage = (data: any) => {
      console.log("WebSocket message received:", data);

      switch (data.type) {
        case "init":
          // Initial data from server
          setTodos(data.todos);
          setWsConnected(true);
          break;
        case "create":
          // New todo created
          setTodos((currentTodos) => [...currentTodos, data.todo]);
          break;
        case "update":
          // Todo updated
          setTodos((currentTodos) =>
            currentTodos.map((todo) =>
              todo.id === data.todo.id ? data.todo : todo
            )
          );
          break;
        case "delete":
          // Todo deleted
          setTodos((currentTodos) =>
            currentTodos.filter((todo) => todo.id !== data.id)
          );
          break;
        default:
          console.warn("Unknown WebSocket message type:", data.type);
      }
    };

    const socket = connectWebSocket(handleWebSocketMessage);

    // Clean up WebSocket connection on component unmount
    return () => {
      disconnectWebSocket();
    };
  }, []);

  const loadTodos = async () => {
    try {
      setError(null); // Clear previous errors
      const data = await fetchTodos();
      // Only set todos from REST API if WebSocket hasn't already provided them
      if (!wsConnected) {
        setTodos(data);
      }
    } catch (err) {
      console.error("Error fetching todos:", err);
      setError("Failed to load todos. Please try again later.");
    }
  };

  const handleAddTodo = async (title: string) => {
    try {
      setError(null);
      // Still use REST API to add a todo
      // The WebSocket will notify us when the server state changes
      await addTodo(title);
      // Note: We don't update state here anymore, the WebSocket will handle it
    } catch (err) {
      console.error("Error adding todo:", err);
      setError("Failed to add todo. Please check your connection.");
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setError(null);
      // Still use REST API to delete a todo
      // The WebSocket will notify us when the server state changes
      await deleteTodo(id);
      // Note: We don't update state here anymore, the WebSocket will handle it
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Failed to delete todo.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-4 font-sans">
      <h1 className="text-2xl font-bold text-center mb-6">Simple Todo App</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="flex justify-center mb-4">
        <span
          className={`inline-block w-3 h-3 rounded-full mr-2 ${
            wsConnected ? "bg-green-500" : "bg-red-500"
          }`}
        ></span>
        <span className="text-sm">
          {wsConnected ? "Live updates connected" : "Offline mode"}
        </span>
      </div>
      <TodoInput onAddTodo={handleAddTodo} />
      <TodoList todos={todos} onDeleteTodo={handleDeleteTodo} />
    </div>
  );
}

export default App;
