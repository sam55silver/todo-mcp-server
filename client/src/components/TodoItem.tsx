import { TodoItem } from "../types";

interface TodoItemProps {
  todo: TodoItem;
  onDelete: (id: string) => void;
}

function TodoItemComponent({ todo, onDelete }: TodoItemProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Date not available"; // Handle potential undefined date
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };

  return (
    <div className="border border-gray-300 p-4 mb-2 flex justify-between items-center rounded">
      <div className="todo-content">
        <h3 className="m-0 mb-2 font-medium">{todo.title}</h3>
        <p className="m-0 text-xs text-gray-500">
          Created: {formatDate(todo.created_at)}
        </p>
      </div>
      <button
        className="bg-transparent border-0 text-red-500 text-2xl cursor-pointer hover:text-red-700"
        onClick={() => onDelete(todo.id)}
      >
        ×
      </button>
    </div>
  );
}

export default TodoItemComponent;
