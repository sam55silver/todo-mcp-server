# app/main.py
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Dict, Set
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
import json

app = FastAPI(title="Simple Todo API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial todos when client connects
        todo_list = list(todos.values())
        # Convert TodoItem to dict for JSON serialization
        todos_json = [
            {
                "id": str(todo.id),
                "title": todo.title,
                "created_at": todo.created_at.isoformat()
            } for todo in todo_list
        ]
        await websocket.send_json({"type": "init", "todos": todos_json})
        
        # Listen for messages (potential future implementation for direct WebSocket commands)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/todos", response_model=List[TodoItem])
async def get_todos():
    return list(todos.values())

@app.post("/api/todos", response_model=TodoItem)
async def create_todo(todo: TodoItem):
    # Ensure a new UUID is generated if not provided client-side
    # Although default_factory handles this, explicitly checking ensures clarity
    if todo.id in todos: # Avoid collision, unlikely with UUID but good practice
      todo.id = uuid4()
      
    todos[todo.id] = todo
    
    # Broadcast the new todo to all connected clients
    await manager.broadcast({
        "type": "create", 
        "todo": {
            "id": str(todo.id),
            "title": todo.title,
            "created_at": todo.created_at.isoformat()
        }
    })
    
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
    # Preserve the created_at timestamp and original ID
    updated_todo.created_at = todos[todo_id].created_at
    updated_todo.id = todo_id 
    todos[todo_id] = updated_todo
    
    # Broadcast the update to all connected clients
    await manager.broadcast({
        "type": "update", 
        "todo": {
            "id": str(updated_todo.id),
            "title": updated_todo.title,
            "created_at": updated_todo.created_at.isoformat()
        }
    })
    
    return updated_todo

@app.delete("/api/todos/{todo_id}")
async def delete_todo(todo_id: UUID):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    del todos[todo_id]
    
    # Broadcast the deletion to all connected clients
    await manager.broadcast({
        "type": "delete", 
        "id": str(todo_id)
    })
    
    return {"message": "Todo deleted successfully"} 