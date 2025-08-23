# Frontend Integration with uAgent

This document explains how the frontend integrates directly with the uAgent using its native REST endpoints.

## Architecture

```
Frontend (React) ↔ uAgent REST Endpoints ↔ Agent Chat Protocol
```

## How It Works

### 1. Native uAgent REST Endpoints

The agent (`fetch/agent/agent.py`) now includes built-in REST endpoints using uAgents' `@agent.on_rest_get()` and `@agent.on_rest_post()` decorators:

- **GET `/`** - Health check
- **GET `/status`** - Get monitoring status  
- **POST `/chat`** - Send chat messages
- **POST `/monitor`** - Start monitoring a contract

### 2. Frontend Service (`AgentService.js`)

The frontend service connects directly to the agent's REST endpoints:

```javascript
// Connect to agent's native endpoints
this.baseUrl = 'http://127.0.0.1:8001'; // Agent's port
```

### 3. Chat Interface Integration

The chat interface sends messages directly to the agent's `/chat` endpoint:

```javascript
const response = await fetch(`${this.baseUrl}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    timestamp: new Date().toISOString()
  })
});
```

## Running the System

### 1. Start the Agent

```bash
cd fetch/agent
python3 agent.py
```

The agent will start on `http://127.0.0.1:8001` with REST endpoints enabled.

### 2. Start the Frontend

```bash
cd ic/src/frontend
npm start
```

The frontend will start on `http://localhost:3000` and connect to the agent.

### 3. Test the Integration

```bash
# Test the agent endpoints
python3 test_uagent_endpoints.py
```

## Chat Commands

Users can interact with the agent using natural language:

- `"monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai"`
- `"check this smart contract for unusual activity"`
- `"what's the status of my contracts?"`
- `"stop monitoring [contract-id]"`
- `"help"`

## Benefits of Direct Integration

1. **No Middleware**: Direct connection to uAgent eliminates the need for a separate API bridge
2. **Native Protocol**: Uses uAgents' built-in REST endpoint functionality
3. **Real-time**: Direct communication with agent's chat protocol
4. **Simplified Architecture**: Fewer components to manage
5. **Better Performance**: No additional HTTP hop through middleware

## Error Handling

The frontend includes fallback mechanisms:

- If the agent is offline, it shows simulated responses for demo purposes
- Connection status is displayed in the UI
- Graceful error messages for failed requests

## API Documentation

The agent automatically provides API documentation at:
`http://127.0.0.1:8001/docs` (if using uAgents with OpenAPI support)

## Extending the Integration

To add new endpoints:

1. Add new REST endpoint decorators in `agent.py`:
   ```python
   @agent.on_rest_post("/new-endpoint", RequestModel, ResponseModel)
   async def handle_new_endpoint(ctx: Context, req: RequestModel):
       # Handle request
       return ResponseModel(...)
   ```

2. Add corresponding methods in `AgentService.js`:
   ```javascript
   async callNewEndpoint(data) {
     const response = await fetch(`${this.baseUrl}/new-endpoint`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
     });
     return await response.json();
   }
   ```
