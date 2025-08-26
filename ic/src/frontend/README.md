# Canary Contract Guardian - Frontend Dashboard

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and enhanced with AI-powered smart contract monitoring capabilities.

## 🎯 Overview

The frontend dashboard provides a modern, responsive interface for monitoring Internet Computer smart contracts with real-time AI-enhanced analysis and alerts.

### ✨ Key Features

- **🤖 AI Chat Interface**: Direct communication with ASI:One enhanced monitoring agent
- **📊 Real-time Monitoring**: Live contract status and health indicators
- **🚨 Alert Management**: Comprehensive alert viewing with correlation analysis
- **💬 Natural Language Commands**: Intuitive contract management through chat
- **🎨 Modern UI**: Clean, responsive design with Tailwind CSS
- **⚡ Real-time Updates**: Direct integration with uAgent REST endpoints

## 🚀 Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

**Note**: Ensure the monitoring agent is running on `http://127.0.0.1:8001` for full functionality.

### `npm test`

Launches the test runner in interactive watch mode.\
Includes tests for:
- Chat interface functionality
- Contract list management
- Alert modal behavior
- Agent service integration

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## 🏗️ Project Structure

```
src/
├── components/              # React components
│   ├── ChatInterface.js    # AI-enhanced chat with agent
│   ├── ContractList.js     # Smart contract management
│   ├── Dashboard.js        # Main monitoring dashboard
│   ├── AlertModal.js       # Alert details and correlation
│   ├── FloatingAlert.js    # Real-time alert notifications
│   ├── Auth.js            # User authentication (future)
│   ├── Footer.js          # Application footer
│   └── Toast.js           # Toast notifications
├── services/
│   └── AgentService.js     # uAgent REST API integration
├── config/
│   └── canister.js        # ICP canister configuration
├── contexts/
│   └── ThemeContext.js    # Theme management
├── App.js                 # Main application component
├── App.css               # Application styles
├── index.js              # React entry point
└── index.css             # Global styles with Tailwind
```

## 🔧 Configuration

### Environment Setup

The frontend automatically connects to:
- **uAgent**: `http://127.0.0.1:8001` (monitoring agent)
- **ICP Canister**: Local dfx network or mainnet
- **Discord**: Via agent webhook integration

### Agent Integration

The dashboard communicates directly with the uAgent via REST endpoints:

```javascript
// Example: Send chat message to agent
const response = await fetch('http://127.0.0.1:8001/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'
  })
});
```

## 🎨 UI Components

### Chat Interface
- **Natural Language Processing**: AI-powered responses with ASI:One integration
- **Command Recognition**: Smart parsing of monitoring commands
- **Context Awareness**: Conversation history and context preservation
- **Fallback Responses**: Graceful handling when agent is offline

### Contract Management
- **Add Contracts**: Paste contract ID to start monitoring
- **Status Overview**: Health indicators and monitoring status
- **Alert History**: Recent alerts with correlation analysis
- **Quick Actions**: Pause, resume, or remove monitoring

### Alert System
- **Real-time Notifications**: Floating alerts for immediate attention
- **Detailed Modals**: Comprehensive alert information with AI recommendations
- **Correlation Display**: Visual representation of related security events
- **Action Guidance**: Step-by-step response instructions

## 🧪 Testing

The project includes comprehensive tests for all major components:

```bash
# Run all tests
npm test

# Run specific test file
npm test ChatInterface.test.js

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage

- ✅ Chat interface functionality and message handling
- ✅ Contract list management and status updates  
- ✅ Alert modal behavior and correlation display
- ✅ Agent service integration and error handling
- ✅ Toast notifications and user feedback
- ✅ Authentication flow (when implemented)

## 🎯 Usage Examples

### Adding a Contract for Monitoring

```javascript
// Via chat interface
"monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai"

// Via contract management
// 1. Paste contract ID in input field
// 2. Click "Add Contract" 
// 3. Agent automatically starts 8-rule monitoring
```

### Checking Security Status

```javascript
// Natural language queries
"what's the security status of my contracts?"
"check for unusual activity on rdmx6-jaaaa-aaaah-qcaiq-cai"
"explain the latest alert"
```

### Managing Alerts

```javascript
// View alert details
// 1. Click notification in floating alert
// 2. Review correlation analysis
// 3. Follow AI recommendations
// 4. Acknowledge or take action
```

## 🔧 Development

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Running DFX network (for ICP integration)
- Active monitoring agent on port 8001

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

### Production Deployment

```bash
# Build production bundle
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, AWS S3, etc.)
```

## 🔗 Integration Points

### Backend Services
- **ICP Canisters**: Direct integration with Internet Computer
- **uAgent**: REST API communication for monitoring
- **Discord**: Webhook notifications via agent

### External APIs
- **ASI:One**: AI enhancement through agent proxy
- **Agentverse**: Global agent discovery and connectivity

## 📚 Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Internet Computer Documentation](https://internetcomputer.org/docs/current/home)
- [Fetch.ai uAgents Documentation](https://docs.fetch.ai/uAgents)

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

**🐦 Part of the Canary Contract Guardian ecosystem - Your AI-powered smart contract security solution**
