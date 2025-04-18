import { TodoItem } from "../types";

const API_BASE_URL = "http://localhost:8000/api"; // Assuming backend runs on port 8000
const WS_URL = "ws://localhost:8000/ws"; // WebSocket URL

export const fetchTodos = async (): Promise<TodoItem[]> => {
  const response = await fetch(`${API_BASE_URL}/todos`);
  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }
  return response.json();
};

export const addTodo = async (title: string): Promise<TodoItem> => {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }), // Backend expects title, id/created_at are generated
  });
  if (!response.ok) {
    throw new Error("Failed to add todo");
  }
  return response.json();
};

export const deleteTodo = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete todo");
  }
  // No content expected on successful delete usually
};

// WebSocket connection
let socket: WebSocket | null = null;
let reconnectTimeout: number | null = null;
let isConnecting = false;

export const connectWebSocket = (onMessage: (data: any) => void): WebSocket => {
  // If already connecting or connected, return existing socket
  if (isConnecting) return socket!;
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  // Clear any existing reconnect attempts
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  isConnecting = true;
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WebSocket connected");
    isConnecting = false;
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("Error parsing WebSocket message:", err);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    isConnecting = false;
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    isConnecting = false;

    // Attempt to reconnect after a delay if not manually disconnected
    reconnectTimeout = setTimeout(() => {
      console.log("Attempting to reconnect WebSocket...");
      connectWebSocket(onMessage);
    }, 5000);
  };

  return socket;
};

// Close WebSocket connection
export const disconnectWebSocket = (): void => {
  // Clear any reconnection attempts
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (socket) {
    // Remove event listeners to prevent reconnection attempts
    socket.onclose = null;

    // Close the connection if it's open
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close();
    }

    socket = null;
  }

  isConnecting = false;
};

// Optional: Add updateTodo if needed later based on design doc PUT endpoint
// export const updateTodo = async (id: string, updatedData: Partial<TodoItem>): Promise<TodoItem> => {
//   const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(updatedData),
//   });
//   if (!response.ok) {
//     throw new Error('Failed to update todo');
//   }
//   return response.json();
// };
