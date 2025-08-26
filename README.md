# Canary Contract Guardian 🐦
![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)

**AI-Enhanced Smart Contract Monitoring** powered by ASI:One and Agentverse. Monitor your Internet Computer contracts 24/7 with intelligent alerts and AI-powered recommendations.

## 🎯 Project Overview

**Canary Contract Guardian** is a production-ready MVP that monitors smart contracts on the Internet Computer Protocol (ICP) with **ASI:One AI enhancement** and **Agentverse integration**. It provides real-time alerts, intelligent recommendations, and 24/7 surveillance with advanced cross-rule correlation analysis.

### ✅ Status: **PRODUCTION READY + AI-ENHANCED + AGENTVERSE ENABLED**

- **✅ Complete Integration**: Frontend ↔ ICP Canister ↔ uAgent ↔ Discord
- **✅ ASI:One AI Enhancement**: Intelligent responses and contextual recommendations
- **✅ Agentverse Integration**: Global agent discovery and mailbox connectivity
- **✅ Advanced Monitoring**: 8 security rules with cross-rule correlation analysis
- **✅ Adaptive Intelligence**: Learning thresholds that adjust to contract behavior
- **✅ Comprehensive Testing**: Interactive test suite with dummy contracts
- **✅ Real-time Alerts**: AI-powered notifications with actionable insights
- **✅ Demo Ready**: Manual triggers and fallback systems for presentations
- **✅ Multi-Vector Detection**: Complex attack pattern recognition

## 🤖 AI & Agentverse Features

### ASI:One Integration
- **Intelligent Responses**: Enhanced chat interactions with contextual understanding
- **Smart Recommendations**: AI-generated action plans for detected threats
- **Pattern Recognition**: Advanced analysis beyond traditional rule-based monitoring
- **Contextual Awareness**: Responses tailored to specific contract situations
- **Fallback Intelligence**: Smart local responses when ASI:One API is unavailable
- **Expert Knowledge**: Deep security expertise built into response generation

### Agentverse Connectivity  
- **Global Discovery**: Agent discoverable through Agentverse ecosystem
- **Mailbox Integration**: Reliable message delivery across networks
- **Metadata Rich**: Comprehensive capability advertising for better matching
- **ASI Alliance Compatible**: Integrated with the ASI Alliance infrastructure
- **Persistent Communication**: Continuous availability through Agentverse mailbox

## 🏗️ Project Structure

```
canary-contract-guardian-mvp/
├── fetch/                          # Fetch.ai uAgent Implementation
│   ├── agent/                      # Smart monitoring agent
│   │   ├── agent.py               # Main uAgent with REST endpoints
│   │   ├── canister_client.py     # ICP canister interaction
│   │   ├── contract_monitor.py    # Contract monitoring logic
│   │   ├── discord_notifier.py    # Discord webhook integration
│   │   └── monitoring_rules.py    # Alert rule definitions
│   └── main.py                    # Agent entry point
├── ic/                            # Internet Computer Protocol
│   ├── dfx.json                   # DFX configuration
│   └── src/
│       ├── backend/               # Guardian canister (Motoko)
│       │   ├── main.mo           # Main contract monitoring logic
│       │   └── Types.mo          # Type definitions
│       ├── dummy/                 # Test contract for validation
│       │   └── main.mo           # Dummy contract with simulation
│       └── frontend/              # React dashboard
│           ├── src/
│           │   ├── components/    # React components
│           │   │   ├── ChatInterface.js
│           │   │   ├── ContractList.js
│           │   │   ├── Dashboard.js
│           │   │   └── ManualTrigger.js
│           │   └── services/
│           │       └── AgentService.js  # uAgent REST integration
│           └── package.json
├── scripts/                       # Development scripts
│   └── devcontainer-setup.sh     # Environment setup
├── test_dummy_contract.py         # Interactive testing suite
├── test_integration.py            # Integration test suite
├── test_uagent_endpoints.py       # uAgent endpoint tests
├── start_integration.sh           # Quick start script
├── requirements.txt               # Python dependencies
├── package.json                   # Root project config
├── .env.example                   # Environment template
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- **DFX SDK**: Internet Computer development environment
- **Node.js**: v16+ for frontend development
- **Python**: 3.8+ for monitoring agent
- **Discord**: Webhook URL for notifications

### 1. Environment Setup

```bash
# Clone repository
git clone https://github.com/rianibm/canary-contract-guardian-mvp.git
cd canary-contract-guardian-mvp

# Setup Python environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

```bash
# Setup environment variables
cp .env.example .env
# Edit .env with your configuration:
# - Discord webhook URL for notifications
# - ASI:One API key for AI enhancement (optional)
# - Agentverse API key for enhanced connectivity (optional)
```
```

### 2. Deploy ICP Canisters

```bash
cd ic

# Start local DFX network
dfx start --clean --background

# Deploy contracts
dfx deploy

# Note the canister IDs from deployment output
```

### 3. Start the Monitoring System

```bash
# Start the uAgent monitoring system
cd fetch/agent
python3 agent.py
# Agent runs on http://127.0.0.1:8001
```

### 4. Launch Dashboard

```bash
cd ic/src/frontend

# Install dependencies
npm install

# Start development server  
npm start
# Dashboard available at http://localhost:3000
```

### 5. Test the System

```bash
# Run comprehensive test suite
python3 test_dummy_contract.py

# Or use interactive mode
python3 test_dummy_contract.py
# Choose option 9 for complete test scenario
```

## ⚡ Features

### Core Monitoring System
- **🔍 Real-time Contract Monitoring**: Continuous surveillance of ICP smart contracts
- **🤖 Fetch.ai uAgent Integration**: Intelligent agent with natural language chat interface
- **📱 Discord Notifications**: Instant alerts sent to Discord channels
- **🎛️ React Dashboard**: Clean, responsive web interface for monitoring
- **⚠️ Smart Alert Rules**: Pre-configured detection patterns for common threats

### Advanced Capabilities  
- **💬 AI Chat Interface**: Natural language interaction with ASI:One enhancement
- **🧪 Comprehensive Testing**: Interactive test suite with dummy contracts
- **📊 Real-time Status**: Live monitoring agent status and metrics
- **🔄 Auto-recovery**: Fault-tolerant design with graceful error handling
- **🎯 Demo Mode**: Manual triggers for reliable presentations
- **🧠 Adaptive Learning**: Thresholds adjust based on contract behavior patterns
- **🔗 Cross-Rule Correlation**: Multi-vector attack detection
- **⚡ Smart Fallbacks**: Local AI responses when external APIs unavailable

### Technical Integration
- **🔗 Native uAgent REST API**: Direct frontend-to-agent communication
- **🏗️ ICP Canister Backend**: Motoko smart contracts for data persistence
- **📡 WebSocket Support**: Real-time updates (planned)
- **🔐 Secure Architecture**: Proper error handling and validation

## 🧪 Testing with Dummy Contract

We've built a comprehensive testing system with a fully functional dummy smart contract for validating all monitoring features.

### Quick Test Commands

```bash
# Interactive test menu
python3 test_dummy_contract.py

# Direct command-line testing
python3 test_dummy_contract.py info      # Check contract status
python3 test_dummy_contract.py reset     # Reset to initial state
python3 test_dummy_contract.py balance   # Simulate 60% balance drop
python3 test_dummy_contract.py activity  # Simulate high activity (15 txns)
python3 test_dummy_contract.py emergency # Trigger emergency withdraw
python3 test_dummy_contract.py test      # Run complete test scenario
```

### Test Contract Features

- **Deployed Dummy Contract**: Automatically deployed with `dfx deploy`
- **Real Simulation**: Actual balance changes, transaction counts, function calls
- **Instant Discord Alerts**: See notifications in real-time during tests
- **State Management**: Reset capability for repeated testing
- **Complete Coverage**: Tests all monitoring rules and edge cases

### Testing Scenarios

1. **Balance Drop Detection** 🔻
   - Simulates 60% balance decrease
   - Triggers immediate Discord alert
   - Tests threshold-based monitoring

2. **High Activity Monitoring** 📈
   - Simulates 15 transactions in short period
   - Tests volume-based detection
   - Validates time-window analysis

3. **Admin Function Alerts** ⚠️
   - Tests emergency withdraw function
   - Monitors upgrade mode activation
   - Detects suspicious admin activities

4. **Integration Testing** 🔄
   - End-to-end monitoring workflow
   - Agent → Canister → Discord pipeline
   - Real-time status updates

## 🛠️ Technical Stack

### Blockchain & Smart Contracts
- **Internet Computer Protocol (ICP)**: Decentralized cloud platform
- **Motoko**: Native ICP programming language for canisters
- **DFX SDK**: Development framework for ICP applications

### AI & Monitoring
- **Fetch.ai uAgents**: Intelligent monitoring agents with REST API
- **Python 3.8+**: Agent implementation and monitoring logic
- **Natural Language Processing**: Chat interface for agent interaction

### Frontend & UI
- **React 18**: Modern frontend framework
- **Tailwind CSS**: Utility-first styling framework
- **JavaScript/ES6+**: Modern web development

### Infrastructure & DevOps
- **Discord Webhooks**: Real-time notification system
- **REST API**: Direct uAgent-to-frontend communication
- **Virtual Environment**: Isolated Python dependency management
- **Git**: Version control and collaboration

### Development Tools
- **Prettier**: Code formatting for Motoko and JavaScript
- **VS Code**: Recommended development environment
- **Node.js 16+**: JavaScript runtime for frontend development

## 🎬 Demo Flow

Perfect for live demonstrations and presentations:

### 1. **System Overview** (30 seconds)
```bash
# Show running components
python3 test_dummy_contract.py info
# Displays: contract status, monitoring state, system health
```

### 2. **Add Contract to Monitoring** (15 seconds)
- Open dashboard at `http://localhost:3000`
- Paste ICP contract address: `rdmx6-jaaaa-aaaah-qcaiq-cai`
- Show real-time monitoring status

### 3. **Trigger Realistic Alert** (30 seconds)
```bash
python3 test_dummy_contract.py balance
# Simulates 60% balance drop
# Watch Discord notification appear instantly! 📱
```

### 4. **Chat with Agent** (45 seconds)
- Use dashboard chat interface
- Try: *"What's the status of my contracts?"*
- Show natural language responses from uAgent

### 5. **Multiple Alert Demo** (60 seconds)
```bash
python3 test_dummy_contract.py test
# Runs complete scenario with multiple alerts
# Shows different alert types in sequence
```

### 6. **Reset for Next Demo** (10 seconds)
```bash
python3 test_dummy_contract.py reset
# Clean state for repeated demonstrations
```

### Demo Tips 💡
- **Keep Discord open** on mobile device for visual impact
- **Use multiple alert types** to show comprehensive monitoring
- **Highlight chat interface** for AI/uAgent integration
- **Show real-time updates** in dashboard
- **Emphasize zero configuration** - just paste contract address

## How It Works

### User Experience
```
1. User pastes contract address → Dashboard
2. Agent monitors contract every 5 minutes
3. Rules check for suspicious activity
4. Alerts sent via Discord instantly
5. Dashboard shows real-time status
```

### What We Monitor
- **Balance Changes**: Sudden drops or spikes with adaptive thresholds (>50% with learning)
- **Transaction Patterns**: Unusual activity frequency (>10 per hour)
- **Function Calls**: Admin/upgrade function executions and permission changes
- **Gas Usage**: Abnormal consumption patterns (>3× median usage)
- **Ownership Changes**: Critical alerts for admin role modifications
- **Reentrancy Patterns**: Recursive call detection within 60-second windows
- **Flash Loan Activities**: Large borrows with rapid transaction chains
- **Cross-Rule Correlation**: Multi-vector attack detection with 10-minute correlation windows

## 🔧 Configuration

### Discord Webhook Setup

1. **Create Discord Server Webhook**
   - Go to Server Settings → Integrations → Webhooks
   - Click "New Webhook" and copy the URL

2. **Configure Environment**
   ```bash
   # Edit .env file with all available configurations
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
   AGENTVERSE_API_KEY=your_agentverse_api_key  # Optional: for ASI:One AI enhancement
   ASI_MODEL_ENDPOINT=https://api.asi.one/v1/models  # Optional: ASI:One endpoint
   ```

### Monitoring Rules (Built-in)

The system includes pre-configured alert rules:

```javascript
// Built-in monitoring rules (8 comprehensive rules)
{
  id: 1,
  name: "Balance Drop Alert",
  threshold: 50,  // 50% decrease triggers alert (adaptive)
  description: "Detects significant balance decreases with learning thresholds"
}

{
  id: 2,
  name: "High Transaction Volume",  
  threshold: 10,     // 10+ transactions
  timeWindow: 3600,  // within 1 hour
  description: "Detects unusual transaction volume patterns"
}

{
  id: 3,
  name: "Admin Function Alert", 
  functions: ["emergencyWithdraw", "startUpgrade"],
  description: "Monitors critical admin functions and permission changes"
}

{
  id: 4,
  name: "Ownership Change Detection",
  severity: "CRITICAL",
  description: "Alerts for any admin role or permission modifications"
}

{
  id: 5,
  name: "Cross-Rule Correlation",
  window: 600, // 10-minute correlation window
  description: "Detects complex multi-vector attacks"
}

{
  id: 6,
  name: "Gas Usage Anomaly",
  threshold: 300, // 3× median usage
  description: "Identifies potential exploitation patterns"
}

{
  id: 7,
  name: "Reentrancy Detection",
  callWindow: 60, // 60-second detection window
  description: "Monitors for recursive call patterns"
}

{
  id: 8,
  name: "Flash Loan Monitoring",
  correlation: true,
  description: "Tracks large loans with rapid transaction chains"
}
```

### Agent Configuration

The uAgent automatically configures its REST endpoints:

```python
# Built-in endpoints (no configuration needed)
GET  /          # Health check and agent status
GET  /status    # Comprehensive monitoring status with contract details
POST /chat      # AI-enhanced chat interface with ASI:One integration
POST /monitor   # Add contract to monitoring with intelligent analysis
POST /clear     # Clear monitoring data with optional filtering
GET  /alerts    # Recent alerts with correlation analysis
```

## 📚 API Documentation

### ICP Canister Functions (Motoko)

```motoko
// Contract Management
addContract(address: Text, nickname: Text) : async Contract
getContracts() : async [Contract]  
removeContract(id: Nat) : async Result.Result<Text, Text>

// Alert Management
createAlert(contractId: Nat, ruleId: Nat, title: Text, description: Text, severity: Text) : async Alert
getAlerts() : async [Alert]
getRecentAlerts() : async [Alert]
acknowledgeAlert(alertId: Nat) : async Result.Result<Text, Text>

// System Functions
getSystemStats() : async Stats
triggerDemoAlert(contractId: Nat, alertType: Text) : async Alert
initializeDemoData() : async Text
```

### uAgent REST Endpoints

```bash
# Health Check
GET http://127.0.0.1:8001/
# Response: {"status": "Agent is running", "timestamp": "2024-..."}

# Monitoring Status  
GET http://127.0.0.1:8001/status
# Response: {"monitoring": true, "contracts": [...], "alerts": [...]}

# Chat Interface with ASI:One Enhancement
POST http://127.0.0.1:8001/chat
# Body: {"message": "What's the security status?", "timestamp": "2025-08-26T..."}
# Response: Enhanced AI response with contextual recommendations

# Add Contract to Monitoring with Intelligence
POST http://127.0.0.1:8001/monitor  
# Body: {"contract_address": "rdmx6-jaaaa-aaaah-qcaiq-cai", "nickname": "My Contract"}
# Response: {"success": true, "message": "Contract added with 8-rule monitoring"}

# Get Alerts with Correlation Analysis
GET http://127.0.0.1:8001/alerts
# Response: {"alerts": [...], "correlations": [...], "recommendations": [...]}
```

### Test Script Commands

```bash
# Available commands for test_dummy_contract.py
python3 test_dummy_contract.py <command>

# Commands:
info      - Show contract information
reset     - Reset contract to initial state  
balance   - Simulate balance drop (60% decrease)
activity  - Simulate high activity (15 transactions)
emergency - Trigger emergency withdraw
upgrade   - Start upgrade mode
add       - Add contract to monitoring
list      - List monitored contracts
test      - Run complete test scenario
help      - Show available commands
```

## 💼 Business Case

### Problem Statement
- **$3.8B lost annually** to smart contract hacks and exploits
- **Manual monitoring doesn't scale** for individual developers
- **Professional audits cost $30K+** - unaffordable for most projects  
- **Existing solutions are expensive** or require technical expertise
- **No real-time monitoring** for post-deployment contract security

### Our Solution
- **🤖 Automated 24/7 monitoring** with Fetch.ai intelligent agents
- **📱 Instant Discord alerts** for immediate threat response
- **💰 Affordable pricing** targeting individual developers and small teams
- **🚀 Zero-configuration setup** - just paste contract address and go
- **🧠 AI-powered detection** using advanced pattern recognition

### Target Market
- **10,000+ ICP developers** actively deploying smart contracts
- **Growing DeFi ecosystem** with increasing security needs
- **Individual developers** priced out of traditional audit services
- **Small teams** building on Internet Computer Protocol
- **DApp developers** needing continuous security monitoring

### Market Opportunity
- **Current solutions**: Expensive audits ($30K+) or manual monitoring
- **Target pricing**: $19/month per contract for automated monitoring
- **Market size**: $500M+ addressable market in smart contract security
- **Growth potential**: Expanding to other blockchains (Ethereum, Solana, etc.)

## 🏆 Why Canary Contract Guardian?

### For Judges & Technical Evaluation

#### **🔥 Actually Works**
- **Complete end-to-end integration** between all components
- **Real Discord notifications** during live demos
- **Comprehensive test suite** with dummy contracts
- **Production-ready code quality** with proper error handling

#### **🎯 Solves Real Problems**  
- **Addresses $3.8B hack problem** with practical solution
- **Fills market gap** between expensive audits and no monitoring
- **Scalable architecture** ready for production deployment
- **Real user need** validated by developer community

#### **⚡ Technical Excellence**
- **Native uAgent integration** showcasing Fetch.ai capabilities
- **Clean Motoko canisters** demonstrating ICP expertise  
- **Professional React UI** with responsive design
- **Robust testing framework** ensuring reliability

#### **🚀 Demo-Ready Innovation**
- **Manual triggers** ensure smooth presentations
- **Fallback systems** prevent demo failures
- **Interactive chat interface** showcasing AI integration
- **Real-time monitoring** with live status updates

### Competitive Advantages

#### **🎪 Hackathon Optimized**
- **Guaranteed demos** with manual alert triggers
- **Visual impact** with Discord notifications on mobile
- **Complete user journey** from setup to alert resolution
- **Technical depth** showing mastery of both platforms

#### **💡 Innovation Factors**
- **First ICP + Fetch.ai integration** in smart contract monitoring
- **Natural language agent interaction** for non-technical users
- **Real-time threat detection** with intelligent pattern matching
- **Affordable SaaS model** disrupting expensive audit market

#### **🔧 Technical Sophistication**
- **Multi-language stack** (Motoko, Python, JavaScript)
- **Microservices architecture** with proper separation of concerns
- **REST API integration** between uAgent and frontend
- **Comprehensive testing** with automated validation

## 📈 Development Status & Roadmap

### ✅ **MVP Complete** (Current Status)
- **✅ Core monitoring system** with 8 comprehensive security rules
- **✅ ASI:One AI integration** with intelligent response generation
- **✅ Agentverse connectivity** with mailbox and global discovery
- **✅ Discord integration** with rich alert formatting and context
- **✅ React dashboard** with enhanced chat interface and real-time updates
- **✅ uAgent REST API** with comprehensive endpoint coverage
- **✅ Comprehensive testing** with interactive dummy contract validation
- **✅ Demo-ready features** with manual triggers and fallback systems
- **✅ Cross-rule correlation** for advanced threat detection
- **✅ Adaptive thresholds** with learning capabilities

### 🚧 **Phase 1: Production Enhancement** (Next 30 days)
- **🔄 Advanced portfolio management** for multiple contract monitoring
- **📧 Multi-channel notifications** (Email, Telegram, Slack integration)
- **⚙️ Custom rule builder** via dashboard with AI assistance
- **📊 Advanced analytics** with threat landscape insights
- **🔐 Enterprise authentication** and role-based access control
- **🌐 Multi-blockchain expansion** starting with Ethereum integration

### 🎯 **Phase 2: AI & Automation** (Months 2-3)
- **🔌 Real-time WebSocket** for instant dashboard updates
- **📱 Mobile applications** for iOS and Android with push notifications
- **👥 Team collaboration** features and shared monitoring workspaces
- **🤖 Enhanced AI detection** with machine learning and pattern evolution
- **🛡️ Automated response systems** with smart contract integration
- **📈 Predictive threat modeling** with historical attack analysis

### 🚀 **Phase 3: Enterprise & Ecosystem** (Months 4-6)
- **🧠 Advanced AI pattern recognition** for zero-day threat detection
- **📈 Comprehensive predictive analytics** for proactive security
- **🏢 Enterprise dashboard** with advanced team management and compliance
- **🔗 Deep tool integrations** with development environments and CI/CD
- **🎓 Security education platform** with interactive learning modules
- **🌍 Global threat intelligence** sharing and community-driven insights

### 💰 **Monetization Strategy**
- **Free Tier**: 1 contract, basic alerts, community support
- **Pro Tier**: $19/month, 10 contracts, AI-enhanced features, priority support
- **Enterprise**: Custom pricing, unlimited contracts, dedicated infrastructure, compliance features
- **API Access**: Usage-based pricing for third-party integrations

## 🤝 Team

**Built by a focused 3-person team combining blockchain, AI, and frontend expertise:**

### 👨‍💻 **Barry** - Blockchain & Backend
- **ICP Canister Development** (Motoko)
- **Smart Contract Architecture** 
- **DFX Infrastructure & Deployment**
- **Backend API Design**

### 🤖 **Richard** - AI & Monitoring Systems  
- **Fetch.ai uAgent Development**
- **Monitoring Logic & Pattern Detection**
- **Python Backend Services**
- **Discord Integration & Notifications**

### 🎨 **Riani** - Frontend & Integration
- **React Dashboard Development**
- **UI/UX Design with Tailwind CSS**
- **uAgent-Frontend Integration** 
- **Testing & Quality Assurance**

### 🏆 **Collective Expertise**
- **Combined 15+ years** in software development
- **Deep knowledge** of ICP ecosystem and Fetch.ai platform
- **Full-stack capabilities** from smart contracts to user interface
- **Hackathon experience** with focus on working demos

---

## 📞 Contact & Links

- **🐙 GitHub**: [rianibm/canary-contract-guardian-mvp](https://github.com/rianibm/canary-contract-guardian-mvp)
- **📖 Documentation**: See `TESTING_COMPLETE.md` for comprehensive testing guide
- **🔗 Frontend Integration**: See `UAGENT_FRONTEND_INTEGRATION.md` for technical details
- **💬 Discord**: Set up your webhook for instant notifications

---

**🐦 Canary Contract Guardian - Your smart contract's best friend!**

*Built with ❤️ using Fetch.ai uAgents and Internet Computer Protocol*
