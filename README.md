# Todo App with MCP Server

## Project Overview

This project demonstrates how to build a Model Context Protocol (MCP) server that interacts with a simple Todo application. It consists of three main components:

1. **Client**: A React/TypeScript frontend application
2. **Server**: A FastAPI backend that manages Todo items
3. **MCP Server**: A specialized server that provides tool-based interaction with the Todo application

## What is MCP (Model Context Protocol)?

The Model Context Protocol (MCP) is an open standard developed by Anthropic that enables AI systems to dynamically connect with external tools, files, and APIs. It provides a standardized way for AI models to access real-time data and execute operations through defined tools.

MCP uses a client-server architecture:
- **MCP Server**: Provides structured access to data and functionality (like our Todo API)
- **MCP Client**: The AI application that requests context or actions from the MCP Server

Think of MCP as a "USB-C for AI connectivity" - a universal interface that allows AI systems to seamlessly integrate with external data sources and tools without requiring custom integration for each new system.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- NodeJS
- Python
- UV (Python package manager)
- Claude Desktop (for using with Anthropic's Claude AI)

### Starting the Application

1. Clone this repository
2. Run Docker Compose to start all services:

```bash
docker-compose up
```

This will start the following services:
- Frontend client on http://localhost:5173
- Backend server on http://localhost:8000

### Using with Claude Desktop

To use the MCP server with Claude Desktop:

1. Locate your Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude Desktop/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude Desktop\claude_desktop_config.json`
   - Linux: `~/.config/Claude Desktop/claude_desktop_config.json`
2. Add the `todo-mcp` server to the configuration by adding or updating the `mcpServers` section:

```json
{
  "mcpServers": {
    "todo-mcp": {
      "command": "uv",
      "args": [
        "--directory",
        "/path/to/repo/todo-mcp",
        "run",
        "main.py"
      ]
    }
  }
}
```

3. Replace `/path/to/repo/todo-mcp` with the actual path to your todo-mcp directory
4. Save the file and restart Claude Desktop
6. When using Claude, you can now access the todo-mcp server and its tools through the Claude interface