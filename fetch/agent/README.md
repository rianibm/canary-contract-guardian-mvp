# Canary Contract Guardian Agent

🐦 **AI-Enhanced Smart Contract Security Monitor for Internet Computer Protocol (ICP)**

A sophisticated agent that provides 24/7 surveillance of blockchain smart contracts with real-time security alerts, AI-powered recommendations, and advanced threat detection capabilities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Security Rules](#security-rules)
- [Integration](#integration)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Overview

The Canary Contract Guardian Agent is an intelligent monitoring system designed specifically for Internet Computer Protocol (ICP) smart contracts. It combines traditional rule-based monitoring with advanced AI capabilities powered by ASI:One to provide comprehensive security surveillance.

### Key Capabilities

- **🔍 Real-time Contract Monitoring**: Continuous surveillance of smart contract activities
- **🤖 AI-Enhanced Analysis**: Powered by ASI:One for intelligent threat detection
- **🚨 Instant Alert System**: Discord webhook integration for immediate notifications
- **📊 Cross-Rule Correlation**: Advanced pattern recognition for complex attacks
- **🌐 Agentverse Integration**: Global discoverability and enhanced connectivity
- **💬 Natural Language Interface**: Chat-based contract management
- **🔄 Adaptive Thresholds**: Learning system that adjusts to contract behavior patterns

## Features

### Security Monitoring Rules

1. **Balance Drop Detection**
   - Monitors for >50% balance decreases
   - Adaptive thresholds based on historical patterns
   - Correlation with ownership changes for critical alerts

2. **High Transaction Volume**
   - Tracks unusual transaction frequency (>10 per hour)
   - Pattern analysis for coordinated attacks
   - Gas usage correlation

3. **Suspicious Function Calls**
   - Monitors admin/upgrade function executions
   - Permission escalation detection
   - Ownership transfer tracking

4. **Ownership Change Monitoring**
   - Critical alerts for admin role modifications
   - Multi-signature requirement changes
   - Governance attack detection

5. **Cross-Rule Correlation**
   - Multi-vector attack detection
   - Time-window analysis (10-minute correlation windows)
   - Complex threat pattern recognition

6. **Gas Usage Anomalies**
   - Detects >3× median gas consumption
   - Reentrancy attack signatures
   - DoS attempt identification

7. **Reentrancy Detection**
   - Recursive call pattern analysis
   - State inconsistency monitoring
   - Call depth tracking

8. **Flash Loan Monitoring**
   - Large loan detection with rapid transaction chains
   - Price manipulation correlation
   - MEV exploitation patterns

### AI Enhancement Features

- **ASI:One Integration**: Advanced natural language processing for intelligent responses
- **Smart Local Responses**: Fallback system with expert security knowledge
- **Context-Aware Analysis**: Situation-specific recommendations
- **Adaptive Learning**: Thresholds adjust based on contract behavior
- **Pattern Recognition**: Advanced threat signature detection

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Canary Agent Core                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ ASI:One     │  │ Chat        │  │ REST API    │     │
│  │ Client      │  │ Protocol    │  │ Endpoints   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Contract    │  │ Monitoring  │  │ Discord     │     │
│  │ Monitor     │  │ Rules       │  │ Notifier    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐ │
│  │            Canister Client (ICP)                    │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Component Overview

- **`agent.py`**: Main agent orchestrator with Agentverse integration
- **`asi_client.py`**: ASI:One API client for AI-enhanced responses
- **`canister_client.py`**: ICP canister communication interface
- **`contract_monitor.py`**: Core monitoring logic and alert coordination
- **`monitoring_rules.py`**: Security rule definitions and evaluations
- **`discord_notifier.py`**: Alert delivery system via Discord webhooks

## Installation

### Prerequisites

- Python 3.8+
- Internet Computer SDK (dfx)
- Active ICP canister deployment
- Discord webhook URL (for notifications)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd canary-contract-guardian-mvp
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# ICP Canister Configuration
CANISTER_ID=rdmx6-jaaaa-aaaah-qcaiq-cai
BASE_URL=http://127.0.0.1:4943

# Discord Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL

# Monitoring Configuration
MONITORING_INTERVAL=300  # 5 minutes in seconds

# Agent Configuration
AGENT_NAME=CanaryGuardian
AGENT_SEED=canary_guardian_secret_seed

# ASI:One AI Configuration
AGENTVERSE_API_KEY=your_agentverse_api_key
ASI_MODEL_ENDPOINT=https://api.asi.one/v1/models

# Logging Configuration
LOG_LEVEL=INFO
```

### Discord Webhook Setup

1. Create a Discord server or use an existing one
2. Go to Server Settings → Integrations → Webhooks
3. Create a new webhook and copy the URL
4. Add the URL to your `.env` file

### ASI:One API Setup

1. Sign up for ASI:One API access
2. Obtain your API key
3. Configure the endpoint and key in `.env`
4. The agent will fallback to smart local responses if ASI:One is unavailable

## Usage

### Starting the Agent

```bash
# Activate virtual environment
source venv/bin/activate

# Start the agent
python fetch/agent/agent.py
```

### Chat Commands

The agent supports natural language commands:

```
# Start monitoring a contract
"monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai"

# Check contract security
"check this smart contract for security issues"

# Get status
"what's the status of my contracts?"

# Stop monitoring
"stop monitoring rdmx6-jaaaa-aaaah-qcaiq-cai"

# Get help
"help" or "commands"

# Security analysis
"check for unusual activity"
"explain reentrancy attacks"
"what are flash loan risks?"
```

### REST API Usage

The agent exposes REST endpoints for frontend integration:

```bash
# Health check
curl http://localhost:8001/

# Get agent status
curl http://localhost:8001/status

# Start monitoring (POST)
curl -X POST http://localhost:8001/monitor/add \
  -H "Content-Type: application/json" \
  -d '{"contract_id": "rdmx6-jaaaa-aaaah-qcaiq-cai", "nickname": "My Contract"}'

# Chat with agent (POST)
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai"}'
```

## API Reference

### REST Endpoints

#### Health Check
- **GET** `/` - Returns agent health status

#### Monitoring
- **GET** `/status` - Get monitoring status and contract list
- **POST** `/monitor/add` - Start monitoring a contract
- **POST** `/monitor/remove` - Stop monitoring a contract
- **POST** `/monitor/pause` - Pause contract monitoring
- **POST** `/monitor/resume` - Resume contract monitoring
- **POST** `/monitor/clear` - Clear all monitored contracts

#### Communication
- **POST** `/chat` - Send chat message to agent
- **GET** `/alerts` - Get recent security alerts

### Request/Response Models

```python
# Chat Request
{
  "message": "monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai",
  "timestamp": "2025-08-26T10:00:00Z"
}

# Monitor Request
{
  "contract_id": "rdmx6-jaaaa-aaaah-qcaiq-cai",
  "nickname": "My DeFi Contract"
}

# Status Response
{
  "contracts": [
    {
      "id": "rdmx6-jaaaa-aaaah-qcaiq-cai",
      "nickname": "My Contract",
      "status": "healthy",
      "isActive": true,
      "isPaused": false,
      "lastCheck": "Recently"
    }
  ],
  "stats": {
    "totalContracts": 1,
    "healthyContracts": 1,
    "alertsToday": 0
  }
}
```

## Security Rules

### Rule Evaluation Logic

Each monitoring rule is evaluated with the following framework:

```python
class MonitoringRule:
    def evaluate(self, contract_data: Dict, historical_data: List[Dict]) -> List[Dict]:
        """
        Returns list of violations with structure:
        {
            "rule_name": str,
            "severity": "warning|danger|critical",
            "description": str,
            "recommendation": str,
            "data": Dict  # Supporting evidence
        }
        """
```

### Critical Alert Correlations

- **Balance Drop + Ownership Change** (within 10 minutes) → CRITICAL
- **High Gas Usage + Flash Loan** → DANGER
- **Admin Changes + Transaction Spikes** → WARNING
- **Reentrancy Pattern + Balance Manipulation** → CRITICAL

### Adaptive Thresholds

The system learns from contract behavior:

- **Balance monitoring**: Adjusts based on 5-point historical average
- **Gas usage**: Uses median of last 10 data points
- **Transaction volume**: Adapts to contract's normal activity level

## Integration

### Agentverse Integration

The agent is configured for Agentverse discovery:

```python
agent = Agent(
    name="canary-guardian",
    mailbox=True,
    agentverse={
        "use_mailbox": True,
        "http_digest_auth": False, 
        "use_websockets": True,
    }
)
```

### Frontend Integration

The agent provides REST APIs that can be consumed by web frontends:

```javascript
// Example frontend integration
const response = await fetch('http://localhost:8001/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'
  })
});

const result = await response.json();
console.log(result.response);
```

### Discord Integration

Alerts are automatically sent to Discord with rich formatting:

```
🚨 CRITICAL ALERT: Balance Drop Detected
Contract: My DeFi Contract (rdmx6-jaaaa-aaaah-qcaiq-cai)
Rule: Balance Drop Detection
Severity: CRITICAL
Time: 2025-08-26 10:30:00 UTC

Details: 75% balance decrease detected
Combined with ownership change - possible exploit!

Immediate Actions Required:
1. Verify legitimacy of ownership change
2. Pause contract operations if possible
3. Review recent admin transactions
```

## Development

### Project Structure

```
fetch/agent/
├── agent.py              # Main agent with Agentverse integration
├── asi_client.py         # ASI:One API client
├── canister_client.py    # ICP canister communication
├── contract_monitor.py   # Core monitoring logic
├── discord_notifier.py   # Alert delivery system
├── monitoring_rules.py   # Security rule definitions
└── README.md            # This file
```

### Adding New Monitoring Rules

1. **Define the rule in `monitoring_rules.py`:**

```python
async def check_custom_rule(self, contract_id: str, contract_data: Dict) -> List[Dict]:
    """Custom security rule implementation"""
    violations = []
    
    # Your rule logic here
    if condition_met:
        violations.append({
            "rule_name": "Custom Rule Name",
            "severity": "warning",  # warning|danger|critical
            "description": "Description of the violation",
            "recommendation": "What the user should do",
            "data": {"supporting": "evidence"}
        })
    
    return violations
```

2. **Register the rule in `check_all_rules` method:**

```python
async def check_all_rules(self, contract_id: str, contract_data: Dict) -> List[Dict]:
    all_violations = []
    
    # Add your new rule
    all_violations.extend(await self.check_custom_rule(contract_id, contract_data))
    
    return all_violations
```

### Testing

```bash
# Run integration tests
python test_integration.py

# Test individual components
python test_dummy_contract.py

# Test agent endpoints
python test_uagent_endpoints.py
```

### Logging

The agent uses structured logging with multiple levels:

```python
import logging

logger = logging.getLogger("CanaryAgent")
logger.info("Info message")
logger.warning("Warning message") 
logger.error("Error message")
logger.debug("Debug message")
```

Logs are written to both console and `canary_agent.log` file.

## Troubleshooting

### Common Issues

#### 1. Agent Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Verify dependencies
pip install -r requirements.txt

# Check environment variables
cat .env
```

#### 2. Canister Connection Failed
```bash
# Verify dfx is running
dfx start

# Check canister status
dfx canister status backend

# Verify canister ID in .env
echo $CANISTER_ID
```

#### 3. Discord Notifications Not Working
```bash
# Test webhook URL manually
curl -X POST $DISCORD_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'
```

#### 4. ASI:One API Issues
```bash
# Check API key
echo $AGENTVERSE_API_KEY

# Test endpoint connectivity
curl -H "Authorization: Bearer $AGENTVERSE_API_KEY" \
  $ASI_MODEL_ENDPOINT/chat/completions
```

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
export LOG_LEVEL=DEBUG
python fetch/agent/agent.py
```

### Performance Optimization

For high-volume monitoring:

1. **Increase monitoring interval**: Set `MONITORING_INTERVAL=600` (10 minutes)
2. **Optimize rule evaluation**: Disable heavy rules for non-critical contracts
3. **Use connection pooling**: The agent automatically pools HTTP connections
4. **Monitor memory usage**: Use `htop` or similar tools

### Contact & Support

- **Repository**: [GitHub Repository]
- **Issues**: Report bugs via GitHub Issues
- **Documentation**: Additional docs in `/docs` folder
- **Community**: Join the Discord server for support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🐦 Canary Contract Guardian - Your AI-Powered Smart Contract Security Sentinel**

*Powered by ASI:One AI • Built for Internet Computer Protocol • Connected via Agentverse*
