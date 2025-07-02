# Nitro MCP Server

This project is an MCP ([Model Context Protocol](https://modelcontextprotocol.io/)) server using **streamable HTTP** transport powered by the [Nitro](https://nitro.build/). It is designed to demonstrate how to implement an MCP Server. Please note currently there is no authentication implemented, so this is not suitable for production use.

## Features
- Lightweight and fast, built on [Nitro](https://nitro.build/)
- Tools located at `/tools`
- Input and output schema validation with [Zod](https://zod.dev/)
- Example tools included:
  - `echo`: Echoes back the input, demonstrating basic tool functionality
  - `getPostsByUser`: Fetches posts by a user using an API, demonstrating output schema validation and `structuredContent`
- Example resources included:
  - `posts`: Fetches posts from an API, demonstrating resource handling
  - `users`: Fetches users from an API, demonstrating resource handling
- Easy integration with MCP clients

## Getting Started

### Prerequisites
- Node.js (v20 or higher recommended)
- pnpm (see [pnpm installation guide](https://pnpm.io/installation))

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nitro-mcp-server.git
   cd nitro-mcp-server
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running the Server
Start the server with:
```bash
pnpm dev
```

Running the MCP inspector:
```bash
pnpm inspect
```

1. Open your browser and navigate to the inspector URL like `http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=<token>` to access the MCP inspector.
2. Enter the address and port of your server at the URL field, like `http://localhost:3000/mcp`.
3. Click "Connect" to establish a connection to your MCP Server.
4. You can list the tools and invoke them.

### Building the server

To build the server for production, run:
```bash
pnpm build
```
This will create a production-ready build in the `.output` directory.

## Configuration
Configuration options can be set in the `.env` file. Options include:
- `NITRO_MCP_SERVER_HOST`: The host the server listens on (default: `localhost`)
- `NITRO_MCP_SERVER_PORT`: The port the server listens on (default: 3000)

## Todo
- Implement prompts
- Add authentication support

## Contributing
Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
