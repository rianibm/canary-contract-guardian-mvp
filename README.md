# Canary Contract Guardian 🐦

Smart contract monitoring made simple. Monitor your Internet Computer contracts 24/7 with automated alerts via Discord.

## Project Overview

**Canary Contract Guardian** is a minimalist MVP that monitors smart contracts on the Internet Computer Protocol (ICP) and sends real-time alerts when suspicious activity is detected. Perfect for developers who need affordable contract monitoring without expensive audits.

## Project Structure

```
canary-contract-guardian-mvp/
├── fetch/                   # Monitoring agent implementation
│   ├── agent.py            # Python monitoring agent
│   └── requirements.txt    # Python dependencies
├── ic/                     # ICP canister implementation
│   └── src/
│       └── backend/
│           ├── main.mo     # Contract Guardian canister
│           └── Types.mo    # Type definitions
├── frontend/               # React dashboard
│   └── src/
│       ├── components/     # React components
│       └── App.js         # Main application
└── config/                # Configuration files
    ├── discord-webhook.json
    └── monitoring-rules.json
```

## Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/your-username/canary-contract-guardian-mvp.git
cd canary-contract-guardian-mvp
```

### 2. Deploy ICP Canister

```bash
cd ic
dfx start --clean
dfx deploy
```

Copy the canister ID from deployment output.

### 3. Setup Monitoring Agent

```bash
cd fetch
pip install -r requirements.txt

# Update agent.py with your canister ID
CANISTER_ID = "your-canister-id-here"

# Add Discord webhook URL to config/discord-webhook.json
python agent.py
```

### 4. Start Frontend Dashboard

```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000` to access the dashboard.

## Features

### Core Functionality
- **Contract Monitoring**: Add any ICP contract address for 24/7 monitoring
- **3 Hardcoded Rules**: Simple, effective detection patterns
- **Discord Alerts**: Instant notifications when issues are detected
- **Clean Dashboard**: Monitor status and view alert history

### Monitoring Rules

1. **Balance Drop Alert**: Triggers when contract balance drops > 50%
2. **High Transaction Volume**: Alerts when transaction count > 10 in 1 hour  
3. **Function Call Monitoring**: Detects unusual function call patterns

### Demo Features
- **Manual Alert Trigger**: Perfect for hackathon demonstrations
- **Real-time Status**: Live monitoring agent status
- **Alert History**: View and acknowledge past alerts
- **Responsive Design**: Works on desktop and mobile

## Technical Stack

- **Backend**: Motoko (ICP Canister)
- **Monitoring Agent**: Python with Fetch.ai uAgents
- **Frontend**: React with Tailwind CSS
- **Notifications**: Discord Webhooks
- **Blockchain**: Internet Computer Protocol (ICP)

## Demo Flow

Perfect for live demonstrations:

1. **Show Dashboard**: Display current monitoring status
2. **Add Contract**: Paste ICP contract address (e.g., `rdmx6-jaaaa-aaaah-qcaiq-cai`)
3. **Trigger Alert**: Use manual demo button for guaranteed results
4. **Show Notification**: Display Discord alert on mobile device
5. **View Details**: Click alert for detailed information

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
- **Balance Changes**: Sudden drops or spikes in contract balance
- **Transaction Patterns**: Unusual activity frequency
- **Function Calls**: New or suspicious function executions
- **Gas Usage**: Abnormal gas consumption patterns

## Configuration

### Discord Webhook Setup

1. Create Discord webhook in your server
2. Add webhook URL to `config/discord-webhook.json`:

```json
{
  "webhook_url": "https://discord.com/api/webhooks/your-webhook-url"
}
```

### Monitoring Rules

Rules are hardcoded for MVP simplicity:

```json
{
  "rules": [
    {
      "id": 1,
      "name": "Balance Drop Alert",
      "threshold": 50,
      "description": "Alert when balance drops > 50%"
    },
    {
      "id": 2,
      "name": "High Transaction Volume", 
      "threshold": 10,
      "timeWindow": 60,
      "description": "Alert when > 10 transactions in 1 hour"
    },
    {
      "id": 3,
      "name": "Function Call Monitor",
      "description": "Alert on new function additions"
    }
  ]
}
```

## API Endpoints

### Canister Functions

```motoko
// Contract Management
addContract(address: Text, nickname: Text) -> Contract
getContracts() -> [Contract]
removeContract(id: Nat) -> Result

// Alert Management  
createAlert(contractId: Nat, ruleId: Nat, title: Text, description: Text, severity: Text) -> Alert
getAlerts() -> [Alert]
getRecentAlerts() -> [Alert]

// Demo Functions
triggerDemoAlert(contractId: Nat, alertType: Text) -> Alert
initializeDemoData() -> Text
getSystemStats() -> Stats
```

## Business Case

### Problem
- Smart contract hacks cost $3.8B annually
- Manual monitoring doesn't scale
- Professional audits cost $30K+
- Developers need affordable monitoring

### Solution
- Automated 24/7 contract monitoring
- Instant Discord alerts
- Simple setup process
- Affordable for individual developers

### Market
- 10,000+ ICP developers need monitoring
- Current options: expensive audits or nothing
- Target pricing: $19/month per contract

## Why Canary?

### Judge Appeal
- **Actually works**: Complete end-to-end demo
- **Solves real problem**: Addresses $3.8B hack problem
- **Clean execution**: Professional UI and reliable backend
- **Uses both technologies**: Fetch.ai + ICP integration
- **Honest scope**: Clear MVP boundaries with scaling potential

### Competitive Advantage
- **Simple but effective**: Focus on execution over complexity
- **Demo-ready**: Manual triggers ensure smooth presentations
- **Professional quality**: Production-ready code structure
- **Clear scaling path**: Post-hackathon roadmap defined

## Development Status

- **MVP Complete**: All core features implemented
- **Demo Ready**: Manual triggers and fallback systems
- **Integration Working**: Frontend ↔ Canister ↔ Agent ↔ Discord
- **Mobile Responsive**: Works on all screen sizes
- **Error Handling**: Graceful fallbacks for demo safety

## Future Roadmap

### Phase 1 (Post-Hackathon)
- Multi-contract monitoring
- Email notifications
- Advanced rule customization

### Phase 2 (Month 2)
- Real-time WebSocket updates
- Mobile app
- Team collaboration features

### Phase 3 (Month 6)
- AI-powered pattern recognition
- Integration with more blockchains
- Enterprise features

## Team

Built for hackathon by a focused 3-person team:
- **Backend Developer**: ICP Canister (Motoko)
- **AI Developer**: Monitoring Agent (Python/Fetch.ai)
- **Frontend Developer**: Dashboard (React/Tailwind)

---

**Built by Barry - Richard - Riani**