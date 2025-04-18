# Simplified To-Do Web App Design Document

## 1. Overview

This document outlines the design for a simple to-do web application. The app will allow users to create, view, update, and delete to-do items with minimal functionality.

## 2. System Architecture

The application will follow a client-server architecture:

- **Frontend**: React application built with Vite and TypeScript
- **Backend**: FastAPI Python application with Pydantic schemas
- **Data Storage**: In-memory data structure (no database)

### 2.1 System Components Diagram

```
┌─────────────────┐      ┌─────────────────┐
│    Frontend     │      │     Backend     │
│   (React/Vite)  │◄────►│    (FastAPI)    │
└─────────────────┘      └─────────────────┘
```

## 3. Data Model

### 3.1 Pydantic Schema

The application will use Pydantic for data validation and serialization:

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from uuid import uuid4, UUID

class TodoItem(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "title": "Complete project",
                "created_at": "2025-04-17T10:00:00Z"
            }
        }
```

## 4. Backend API Design

The backend will be built using FastAPI and Pydantic with the following endpoints:

### 4.1 To-Do Item Endpoints

```
GET /api/todos - Get all todo items
GET /api/todos/{id} - Get a specific todo item
POST /api/todos - Create a new todo item
PUT /api/todos/{id} - Update a todo item
DELETE /api/todos/{id} - Delete a todo item
```

### 4.2 API Schema Example

```json
// Todo item structure
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Complete design document",
  "created_at": "2025-04-17T10:00:00Z"
}
```

## 5. Frontend Design

### 5.1 UI Mockup

The frontend will consist of a single page application with the following simple components:

```
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ ┌─────────────┐ │
│ │ Todo Input                           │ │  Add (+)   │ │
│ └─────────────────────────────────────┘ └─────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ☐ Buy groceries                                     │ │
│ │ Created: Apr 17, 2025                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ☐ Finish project report                             │ │
│ │ Created: Apr 16, 2025                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ☐ Call mom                                          │ │
│ │ Created: Apr 15, 2025                               │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Component Structure

```
App
├── TodoContainer
│   ├── TodoInput
│   └── TodoList
│       └── TodoItem
└── Notifications
```

## 6. Implementation Details

### 6.1 Backend Implementation (FastAPI)

#### 6.1.1 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── routers/
│       ├── __init__.py
│       └── todos.py
├── tests/
├── requirements.txt
└── README.md
```

#### 6.1.2 In-Memory Storage

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict
from uuid import UUID, uuid4

app = FastAPI()

# In-memory storage
todos: Dict[UUID, TodoItem] = {}

# Other implementation details...
```

### 6.2 Frontend Implementation (React/TypeScript)

#### 6.2.1 Project Structure

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── TodoInput.tsx
│   │   ├── TodoList.tsx
│   │   └── TodoItem.tsx
│   ├── services/
│   │   └── api.ts
│   └── types/
│       └── index.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

#### 6.2.2 Types Definition

```tsx
// src/types/index.ts
export interface TodoItem {
  id: string;
  title: string;
  created_at: string;
}
```

## 7. Code Examples

### 7.1 Backend Code

#### 7.1.1 FastAPI Main File

```python
# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Dict
from uuid import UUID, uuid4
from pydantic import BaseModel, Field

app = FastAPI(title="Simple Todo API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model
class TodoItem(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str
    created_at: datetime = Field(default_factory=datetime.now)

# In-memory storage
todos: Dict[UUID, TodoItem] = {}

@app.get("/api/todos", response_model=List[TodoItem])
async def get_todos():
    return list(todos.values())

@app.post("/api/todos", response_model=TodoItem)
async def create_todo(todo: TodoItem):
    todo_dict = todo.model_dump()
    if not todo.id:
        todo.id = uuid4()
    todos[todo.id] = todo
    return todo

@app.get("/api/todos/{todo_id}", response_model=TodoItem)
async def get_todo(todo_id: UUID):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todos[todo_id]

@app.put("/api/todos/{todo_id}", response_model=TodoItem)
async def update_todo(todo_id: UUID, updated_todo: TodoItem):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    # Preserve the created_at timestamp
    updated_todo.created_at = todos[todo_id].created_at
    todos[todo_id] = updated_todo
    return updated_todo

@app.delete("/api/todos/{todo_id}")
async def delete_todo(todo_id: UUID):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    del todos[todo_id]
    return {"message": "Todo deleted successfully"}
```

### 7.2 Frontend Code

#### 7.2.1 App Component

```tsx
// src/App.tsx
import { useState, useEffect } from 'react';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import { TodoItem } from './types';

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    // Fetch todos on initial load
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (title: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (response.ok) {
        const newTodo = await response.json();
        setTodos([...todos, newTodo]);
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="app">
      <h1>Simple Todo App</h1>
      <TodoInput onAddTodo={addTodo} />
      <TodoList todos={todos} onDeleteTodo={deleteTodo} />
    </div>
  );
}

export default App;
```

#### 7.2.2 TodoInput Component

```tsx
// src/components/TodoInput.tsx
import { useState } from 'react';

interface TodoInputProps {
  onAddTodo: (title: string) => void;
}

function TodoInput({ onAddTodo }: TodoInputProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTodo(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-input">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Add a new todo..."
      />
      <button type="submit">+</button>
    </form>
  );
}

export default TodoInput;
```

#### 7.2.3 TodoList Component

```tsx
// src/components/TodoList.tsx
import { TodoItem } from '../types';
import TodoItemComponent from './TodoItem';

interface TodoListProps {
  todos: TodoItem[];
  onDeleteTodo: (id: string) => void;
}

function TodoList({ todos, onDeleteTodo }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="empty-list">No todos yet. Add one above!</p>;
  }

  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoItemComponent 
          key={todo.id} 
          todo={todo} 
          onDelete={onDeleteTodo} 
        />
      ))}
    </div>
  );
}

export default TodoList;
```

#### 7.2.4 TodoItem Component

```tsx
// src/components/TodoItem.tsx
import { TodoItem } from '../types';

interface TodoItemProps {
  todo: TodoItem;
  onDelete: (id: string) => void;
}

function TodoItemComponent({ todo, onDelete }: TodoItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="todo-item">
      <div className="todo-content">
        <h3>{todo.title}</h3>
        <p className="created-at">Created: {formatDate(todo.created_at)}</p>
      </div>
      <button 
        className="delete-button" 
        onClick={() => onDelete(todo.id)}
      >
        ×
      </button>
    </div>
  );
}

export default TodoItemComponent;
```

## 8. Deployment Strategy

- Backend deployment on a simple VPS or containerized environment
- Frontend deployment on static hosting service (Netlify, Vercel, etc.)

## 9. Future Enhancements

- Task completion status
- Due dates for tasks
- Add tagging functionality
- User authentication
- Persistence with a database