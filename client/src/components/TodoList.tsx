import { TodoItem } from "../types";
import TodoItemComponent from "./TodoItem"; // Corrected import name

interface TodoListProps {
  todos: TodoItem[];
  onDeleteTodo: (id: string) => void; // Changed Promise<void> to void for simplicity
}

function TodoList({ todos, onDeleteTodo }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="text-center text-gray-500 my-4">
        No todos yet. Add one above!
      </p>
    );
  }

  return (
    <div className="mt-4">
      {todos.map((todo) => (
        <TodoItemComponent
          key={todo.id}
          todo={todo}
          onDelete={onDeleteTodo} // Pass onDeleteTodo as onDelete prop
        />
      ))}
    </div>
  );
}

export default TodoList;
