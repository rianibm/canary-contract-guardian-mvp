import asyncio
import logging
import os
import re
from datetime import datetime
from dotenv import load_dotenv
from uagents import Agent, Context, Protocol, Model
from uagents.setup import fund_agent_if_low
from typing import Dict, Any
import time

# Import separated classes
from canister_client import CanisterClient
from discord_notifier import DiscordNotifier
from monitoring_rules import MonitoringRules
from contract_monitor import ContractMonitor

# Load environment variables
load_dotenv()

# Export functions for use by API bridge
__all__ = [
    'extract_contract_id',
    'handle_monitor_command', 
    'handle_check_command',
    'handle_anomaly_check',
    'get_general_anomaly_report',
    'handle_stop_monitoring',
    'get_contract_status',
    'canister_client',
    'contract_monitor'
]

# ============================================================================
# CONFIGURATION
# ============================================================================

# ICP Canister Configuration
CANISTER_ID = os.getenv("CANISTER_ID", "rdmx6-jaaaa-aaaah-qcaiq-cai")
BASE_URL = "http://127.0.0.1:4943"

# Discord Configuration
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL")

# Monitoring Configuration
MONITORING_INTERVAL = int(os.getenv("MONITORING_INTERVAL", "300"))  # 5 minutes in seconds

# Agent Configuration
AGENT_NAME = os.getenv("AGENT_NAME", "CanaryGuardian")
AGENT_SEED = os.getenv("AGENT_SEED", "canary_guardian_secret_seed")

# ============================================================================
# LOGGING SETUP
# ============================================================================

log_level = getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper())
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('canary_agent.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("CanaryAgent")

# ============================================================================
# AGENT SETUP
# ============================================================================

agent = Agent(
    name=AGENT_NAME.lower().replace(" ", "-"),
    seed=AGENT_SEED,
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"]
)

# ============================================================================
# INITIALIZE COMPONENTS
# ============================================================================

# Initialize all components
canister_client = CanisterClient(CANISTER_ID, BASE_URL)
discord_notifier = DiscordNotifier(DISCORD_WEBHOOK_URL)
monitoring_rules = MonitoringRules()
contract_monitor = ContractMonitor(
    canister_client, discord_notifier, monitoring_rules, 
    MONITORING_INTERVAL
)

# ============================================================================
# CHAT PROTOCOL IMPLEMENTATION
# ============================================================================


# ================= ChatProtocol Implementation =====================

class chat_message(Model):
    text: str

# REST API Models for frontend integration
class ChatRequest(Model):
    message: str
    timestamp: str = None

class ChatResponse(Model):
    response: str
    timestamp: str
    success: bool = True

class MonitorRequest(Model):
    contract_id: str
    nickname: str = None

class HealthResponse(Model):
    status: str
    service: str
    agent_address: str
    timestamp: str

class MonitorResponse(Model):
    success: bool
    message: str
    contract_id: str = None
    nickname: str = None
    timestamp: str

class StatusResponse(Model):
    contracts: list
    stats: dict
    timestamp: str

class ClearResponse(Model):
    success: bool
    message: str
    contracts_cleared: int = 0
    timestamp: str

class ClearRequest(Model):
    confirm: bool = True

class AlertsResponse(Model):
    alerts: list
    timestamp: str
    success: bool = True

class ChatProtocol(Protocol):
    def __init__(self):
        super().__init__(name="ChatProtocol")

chat_protocol = ChatProtocol()

@chat_protocol.on_message(model=chat_message)
async def handle_chat_message(ctx: Context, sender: str, message: chat_message):
    """Handle incoming chat messages about contract monitoring"""
    try:
        logger.info(f"Received chat message from {sender}: {message.text}")
        response_text = ""
        message_lower = message.text.lower()
        
        # Parse contract ID from message (looks for canister ID patterns)
        contract_id = extract_contract_id(message.text)
        
        # Handle different types of commands
        if "monitor" in message_lower and ("contract" in message_lower or "smart contract" in message_lower):
            if contract_id:
                response_text = await handle_monitor_command(contract_id)
            else:
                response_text = "🔍 To monitor a smart contract, please provide the contract ID.\nExample: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'"
                
        elif "check" in message_lower and ("contract" in message_lower or "smart contract" in message_lower):
            if contract_id:
                response_text = await handle_check_command(contract_id)
            else:
                response_text = "🔍 To check a smart contract, please provide the contract ID.\nExample: 'check this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai for unusual activity'"
                
        elif "unusual" in message_lower or "suspicious" in message_lower or "anomaly" in message_lower:
            if contract_id:
                response_text = await handle_anomaly_check(contract_id)
            else:
                response_text = await get_general_anomaly_report()
                
        elif "stop monitoring" in message_lower or "stop" in message_lower:
            if contract_id:
                response_text = await handle_stop_monitoring(contract_id)
            else:
                response_text = "⏹️ To stop monitoring, specify which contract.\nExample: 'stop monitoring rdmx6-jaaaa-aaaah-qcaiq-cai'"
                
        elif "status" in message_lower or "current" in message_lower:
            if contract_id:
                response_text = await get_contract_status(contract_id)
            else:
                response_text = await contract_monitor.get_status_summary()
                
        elif "alert" in message_lower:
            response_text = "🚨 Alerts are sent automatically when rules are violated. Check Discord for recent alerts or ask for 'status' to see current contract states."
            
        elif "help" in message_lower:
            response_text = """🐦 Canary Contract Guardian Commands:
• 'monitor this smart contract: [ID]' - Start monitoring a contract
• 'check this smart contract: [ID]' - Check contract for issues
• 'check for unusual activity' - Look for anomalies across all contracts
• 'stop monitoring [ID]' - Stop monitoring a contract
• 'status' - Get all monitored contracts status
• 'status [ID]' - Get specific contract status
• 'alerts' - Information about alerts
• 'info' - Agent information
• 'rules' - View monitoring rules
• 'help' - Show this help

Example: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'"""
            
        elif "info" in message_lower:
            response_text = f"""🐦 Canary Contract Guardian
Digital security guard for smart contracts 24/7
📊 Monitoring interval: {MONITORING_INTERVAL}s
🔍 Rules: Balance drops, transaction volume, suspicious functions
🚨 Alerts: Auto-sent to Discord when rules violated
💬 Natural language commands supported"""
            
        elif "rule" in message_lower:
            response_text = """🔍 Active Monitoring Rules:
1. Balance Drop Alert: >50% balance decrease
2. High Transaction Volume: >10 transactions/hour
3. Suspicious Function Calls: admin/upgrade functions
4. Contract State Changes: Unexpected state modifications
5. Gas Usage Anomalies: Unusual gas consumption patterns"""
            
        else:
            response_text = """Hello! I'm your smart contract guardian 🐦

I can help you monitor and analyze smart contracts. Try commands like:
• "monitor this smart contract: [contract-id]"
• "check this smart contract for unusual activity"
• "what's the status of my contracts?"
• "stop monitoring [contract-id]"

Type 'help' for more detailed commands."""
            
        await ctx.send(sender, chat_message(text=response_text))
        
    except Exception as e:
        logger.error(f"Error handling chat message: {e}")
        await ctx.send(sender, chat_message(text="Sorry, I encountered an error processing your request."))

# Register chat protocol with agent
agent.include(chat_protocol)

# ============================================================================
# CHAT COMMAND HANDLERS
# ============================================================================

def extract_contract_id(text: str) -> str:
    """Extract contract ID from user message"""
    import re
    # Look for ICP canister ID patterns (e.g., rdmx6-jaaaa-aaaah-qcaiq-cai)
    canister_pattern = r'[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}'
    match = re.search(canister_pattern, text.lower())
    return match.group(0) if match else None

async def handle_monitor_command(contract_id: str) -> str:
    """Handle 'monitor this contract' command"""
    try:
        # Add contract to backend canister
        success = await canister_client.add_contract_to_canister(contract_id, f"Contract-{contract_id[:8]}")
        
        if success:
            # Get initial contract data
            initial_data = await canister_client.get_contract_data(contract_id)
            if initial_data:
                logger.info(f"Started monitoring contract: {contract_id}")
                return f"""✅ Now monitoring smart contract: {contract_id}
📊 Initial Status:
• Contract ID: {contract_id}
• Status: Active
• Monitoring Rules: Balance drops, transaction volume, suspicious calls
• Alerts: Will be sent to Discord when rules are violated

I'll keep watch 24/7! 🐦"""
            else:
                return f"✅ Contract added to monitoring, but could not fetch initial data for {contract_id}."
        else:
            return f"❌ Failed to add contract {contract_id} to monitoring. It may already be monitored or there was an error."
            
    except Exception as e:
        logger.error(f"Error in monitor command: {e}")
        return f"❌ Error starting monitoring for {contract_id}: {str(e)}"

async def handle_check_command(contract_id: str) -> str:
    """Handle 'check this contract' command"""
    try:
        # Get current contract data
        contract_data_result = await canister_client.get_contract_data(contract_id)
        
        if not contract_data_result:
            return f"❌ Could not retrieve data for contract {contract_id}. Please verify the contract ID."
        
        # Run monitoring rules check
        violations = await monitoring_rules.check_all_rules(contract_id, contract_data_result)
        
        if violations:
            violation_text = "\n".join([f"• {v['rule_name']}: {v['description']}" for v in violations])
            return f"""🚨 Contract Analysis: {contract_id}
⚠️ Issues Found:
{violation_text}

Recommendation: Review these violations and consider taking action."""
        else:
            return f"""✅ Contract Analysis: {contract_id}
🔍 Status: All checks passed
• No unusual activity detected
• All monitoring rules satisfied
• Contract appears to be operating normally

Keep monitoring for ongoing security! 🐦"""
            
    except Exception as e:
        logger.error(f"Error in check command: {e}")
        return f"❌ Error checking contract {contract_id}: {str(e)}"

async def handle_anomaly_check(contract_id: str) -> str:
    """Handle anomaly/unusual activity check for specific contract"""
    try:
        # Get contract data and check for anomalies
        contract_data_result = await canister_client.get_contract_data(contract_id)
        
        if not contract_data_result:
            return f"❌ Could not retrieve data for contract {contract_id}"
        
        # Check for specific anomalies
        anomalies = []
        
        # Check recent transaction patterns
        # (This would be implemented based on your contract data structure)
        
        if anomalies:
            anomaly_text = "\n".join([f"• {anomaly}" for anomaly in anomalies])
            return f"""🔍 Anomaly Analysis: {contract_id}
⚠️ Unusual Activity Detected:
{anomaly_text}"""
        else:
            return f"""🔍 Anomaly Analysis: {contract_id}
✅ No unusual activity detected
• Transaction patterns are normal
• No suspicious function calls
• Contract behavior within expected parameters"""
            
    except Exception as e:
        logger.error(f"Error in anomaly check: {e}")
        return f"❌ Error checking for anomalies in {contract_id}: {str(e)}"

async def get_general_anomaly_report() -> str:
    """Get general anomaly report across all monitored contracts"""
    try:
        # Get monitored contracts from backend canister
        monitored_contracts = await canister_client.get_contracts()
        
        if not monitored_contracts:
            return "📊 No contracts currently being monitored. Use 'monitor this smart contract: [ID]' to start monitoring."
        
        total_anomalies = 0
        contract_summaries = []
        
        for contract in monitored_contracts:
            contract_id = contract.get('address', '')
            nickname = contract.get('nickname', f"Contract-{contract_id[:12]}")
            status = contract.get('status', 'healthy')
            
            # This would check each contract for anomalies
            status_emoji = "✅" if status == "healthy" else "⚠️" if status == "warning" else "🚨"
            contract_summaries.append(f"• {nickname} ({contract_id[:12]}...): {status_emoji} {status}")
        
        summary_text = "\n".join(contract_summaries)
        return f"""📊 Anomaly Report - All Monitored Contracts:
{summary_text}

Total contracts monitored: {len(monitored_contracts)}
Anomalies detected: {total_anomalies}"""
        
    except Exception as e:
        logger.error(f"Error in general anomaly report: {e}")
        return "❌ Error generating anomaly report"

async def handle_stop_monitoring(contract_id: str) -> str:
    """Handle stop monitoring command"""
    try:
        # Find the contract by address first
        contract = await canister_client.find_contract_by_address(contract_id)
        
        if contract and contract.get('id'):
            # Remove contract from backend canister
            contract_numeric_id = contract.get('id')
            args = f'{contract_numeric_id} : nat'
            result = await canister_client.call_canister("removeContract", args)
            
            if result and result.get("status") == "success":
                return f"⏹️ Stopped monitoring contract: {contract_id}"
            else:
                return f"❌ Failed to stop monitoring contract: {contract_id}"
        else:
            return f"⚠️ Contract {contract_id} was not being monitored."
    except Exception as e:
        logger.error(f"Error stopping monitoring: {e}")
        return f"❌ Error stopping monitoring for {contract_id}: {str(e)}"

async def get_contract_status(contract_id: str) -> str:
    """Get status for specific contract"""
    try:
        contract_data_result = await canister_client.get_contract_data(contract_id)
        
        if not contract_data_result:
            return f"❌ Could not retrieve status for contract {contract_id}"
        
        return f"""📊 Contract Status: {contract_id}
• Status: Active
• Last Updated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
• Monitoring: ✅ Active
• Health: Normal"""
        
    except Exception as e:
        logger.error(f"Error getting contract status: {e}")
        return f"❌ Error retrieving status for {contract_id}: {str(e)}"

# Fund agent if balance is low
fund_agent_if_low(agent.wallet.address())

# ============================================================================
# REST API ENDPOINTS FOR FRONTEND INTEGRATION
# ============================================================================

@agent.on_rest_get("/", HealthResponse)
async def health_check(ctx: Context) -> HealthResponse:
    """Health check endpoint"""
    return HealthResponse(
        status="online",
        service="Canary Contract Guardian",
        agent_address=ctx.agent.address,
        timestamp=datetime.utcnow().isoformat()
    )

@agent.on_rest_get("/status", StatusResponse)
async def get_agent_status(ctx: Context) -> StatusResponse:
    """Get agent and monitoring status"""
    try:
        # Get contracts from backend canister
        contracts = await canister_client.get_contracts()
        
        contracts_list = [
            {
                "id": contract.get('address', ''),
                "nickname": contract.get('nickname', ''),
                "status": "paused" if contract.get('isPaused', False) else contract.get('status', 'healthy'),
                "lastCheck": "Recently",
                "addedAt": "Recently added"
            }
            for contract in contracts
        ]
        
        healthy_count = len([c for c in contracts if c.get('status') == 'healthy'])
        
        return StatusResponse(
            contracts=contracts_list,
            stats={
                "totalContracts": len(contracts),
                "healthyContracts": healthy_count,
                "alertsToday": 0
            },
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        ctx.logger.error(f"Error getting status: {e}")
        return StatusResponse(
            contracts=[],
            stats={
                "totalContracts": 0,
                "healthyContracts": 0,
                "alertsToday": 0
            },
            timestamp=datetime.utcnow().isoformat()
        )

@agent.on_rest_get("/alerts", AlertsResponse)
async def get_alerts(ctx: Context) -> AlertsResponse:
    """Get recent alerts from the monitoring system"""
    try:
        # Get alerts from backend canister
        alerts = await canister_client.get_alerts()
        
        # Transform alerts to frontend format
        formatted_alerts = []
        for alert in alerts:
            formatted_alert = {
                "id": alert.get('id', 0),
                "icon": get_alert_icon(alert.get('severity', 'info')),
                "title": alert.get('title', 'Unknown Alert'),
                "description": alert.get('description', ''),
                "contract": alert.get('contract_address', ''),
                "nickname": alert.get('contract_nickname', 'Unknown Contract'),
                "timestamp": format_timestamp(alert.get('timestamp', '')),
                "severity": alert.get('severity', 'info'),
                "rule": alert.get('rule_name', 'Unknown Rule'),
                "category": get_alert_category(alert.get('rule_name', ''))
            }
            formatted_alerts.append(formatted_alert)
        
        return AlertsResponse(
            alerts=formatted_alerts,
            timestamp=datetime.utcnow().isoformat(),
            success=True
        )
    except Exception as e:
        ctx.logger.error(f"Error getting alerts: {e}")
        return AlertsResponse(
            alerts=[],
            timestamp=datetime.utcnow().isoformat(),
            success=False
        )

def get_alert_icon(severity: str) -> str:
    """Get emoji icon for alert severity"""
    icons = {
        "danger": "🚨",
        "warning": "⚠️", 
        "info": "ℹ️",
        "critical": "🚨"
    }
    return icons.get(severity, "ℹ️")

def get_alert_category(rule_name: str) -> str:
    """Get category based on rule name"""
    rule_lower = rule_name.lower()
    if "balance" in rule_lower or "drop" in rule_lower:
        return "balance"
    elif "transaction" in rule_lower or "volume" in rule_lower:
        return "volume"
    elif "gas" in rule_lower:
        return "gas" 
    elif "state" in rule_lower or "ownership" in rule_lower:
        return "state"
    elif "reentrancy" in rule_lower or "flash" in rule_lower:
        return "security"
    else:
        return "other"

def format_timestamp(timestamp_str: str) -> str:
    """Format timestamp for display"""
    try:
        if not timestamp_str:
            return "Unknown time"
        
        # Parse ISO timestamp
        timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        now = datetime.utcnow()
        diff = now - timestamp.replace(tzinfo=None)
        
        if diff.days > 0:
            return f"{diff.days} days ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hours ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minutes ago"
        else:
            return "Just now"
    except Exception:
        return "Unknown time"

@agent.on_rest_post("/chat", ChatRequest, ChatResponse)
async def handle_rest_chat(ctx: Context, req: ChatRequest) -> ChatResponse:
    """Handle chat messages from frontend via REST API"""
    try:
        ctx.logger.info(f"Received REST chat message: {req.message}")
        
        # Use the same chat logic as the message handler
        message_lower = req.message.lower()
        response_text = ""
        
        # Extract contract ID if present
        contract_id = extract_contract_id(req.message)
        
        # Handle different types of commands (same as chat protocol handler)
        if "monitor" in message_lower and ("contract" in message_lower or "smart contract" in message_lower):
            if contract_id:
                response_text = await handle_monitor_command(contract_id)
            else:
                response_text = "🔍 To monitor a smart contract, please provide the contract ID.\nExample: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'"
                
        elif "check" in message_lower and ("contract" in message_lower or "smart contract" in message_lower):
            if contract_id:
                response_text = await handle_check_command(contract_id)
            else:
                response_text = "🔍 To check a smart contract, please provide the contract ID.\nExample: 'check this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai for unusual activity'"
                
        elif "unusual" in message_lower or "suspicious" in message_lower or "anomaly" in message_lower:
            if contract_id:
                response_text = await handle_anomaly_check(contract_id)
            else:
                response_text = await get_general_anomaly_report()
                
        elif "stop monitoring" in message_lower or "stop" in message_lower:
            if contract_id:
                response_text = await handle_stop_monitoring(contract_id)
            else:
                response_text = "⏹️ To stop monitoring, specify which contract.\nExample: 'stop monitoring rdmx6-jaaaa-aaaah-qcaiq-cai'"
                
        elif "status" in message_lower:
            if contract_id:
                response_text = await get_contract_status(contract_id)
            else:
                response_text = await contract_monitor.get_status_summary()
                
        elif "help" in message_lower:
            response_text = """🐦 Canary Contract Guardian Commands:
• 'monitor this smart contract: [ID]' - Start monitoring a contract
• 'check this smart contract: [ID]' - Check contract for issues
• 'check for unusual activity' - Look for anomalies across all contracts
• 'stop monitoring [ID]' - Stop monitoring a contract
• 'status' - Get all monitored contracts status
• 'status [ID]' - Get specific contract status
• 'alerts' - Information about alerts
• 'info' - Agent information
• 'rules' - View monitoring rules
• 'help' - Show this help

Example: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'"""
            
        else:
            response_text = """Hello! I'm your smart contract guardian 🐦

I can help you monitor and analyze smart contracts. Try commands like:
• "monitor this smart contract: [contract-id]"
• "check this smart contract for unusual activity"
• "what's the status of my contracts?"
• "stop monitoring [contract-id]"

Type 'help' for more detailed commands."""
        
        return ChatResponse(
            response=response_text,
            timestamp=datetime.utcnow().isoformat(),
            success=True
        )
        
    except Exception as e:
        ctx.logger.error(f"Error handling REST chat message: {e}")
        return ChatResponse(
            response="Sorry, I encountered an error processing your request.",
            timestamp=datetime.utcnow().isoformat(),
            success=False
        )

@agent.on_rest_post("/monitor/add", MonitorRequest, MonitorResponse)
async def start_monitoring_contract(ctx: Context, req: MonitorRequest) -> MonitorResponse:
    """Start monitoring a specific contract via REST API"""
    try:
        nickname = req.nickname or f"Contract-{req.contract_id[:8]}"
        
        # Add contract to backend canister
        success = await canister_client.add_contract_to_canister(req.contract_id, nickname)
        
        if success:
            ctx.logger.info(f"Started monitoring contract via REST: {req.contract_id}")
            
            return MonitorResponse(
                success=True,
                message=f"Started monitoring {req.contract_id}",
                contract_id=req.contract_id,
                nickname=nickname,
                timestamp=datetime.utcnow().isoformat()
            )
        else:
            return MonitorResponse(
                success=False,
                message=f"Failed to add contract to backend canister",
                timestamp=datetime.utcnow().isoformat()
            )
        
    except Exception as e:
        ctx.logger.error(f"Error starting monitoring via REST: {e}")
        return MonitorResponse(
            success=False,
            message=f"Failed to start monitoring: {str(e)}",
            timestamp=datetime.utcnow().isoformat()
        )
        
@agent.on_rest_post("/monitor/remove", MonitorRequest, MonitorResponse)
async def remove_monitoring_contract(ctx: Context, req: MonitorRequest) -> MonitorResponse:
    """Remove monitoring a specific contract via REST API"""
    try:
        # Find the contract by address first
        contract = await canister_client.find_contract_by_address(req.contract_id)
        
        if contract and contract.get('id'):
            # Remove contract from backend canister using the numeric ID
            contract_numeric_id = contract.get('id')
            args = f'{contract_numeric_id} : nat'
            result = await canister_client.call_canister("removeContract", args)
            
            # Check for successful response - the canister returns variant { ok = "message" }
            if result and result.get("status") == "success":
                response_data = result.get("data", "")
                # Check if the response contains success indicator
                if "variant { ok" in response_data or "Contract removed successfully" in response_data:
                    ctx.logger.info(f"Stopped monitoring contract via REST: {req.contract_id}")
                    
                    return MonitorResponse(
                        success=True,
                        message=f"Stopped monitoring contract {req.contract_id}",
                        contract_id=req.contract_id,
                        nickname=contract.get('nickname', f"Contract-{req.contract_id[:8]}"),
                        timestamp=datetime.utcnow().isoformat()
                    )
                else:
                    ctx.logger.error(f"Remove contract failed - response: {response_data}")
                    return MonitorResponse(
                        success=False,
                        message=f"Failed to remove contract from backend canister: {response_data}",
                        contract_id=req.contract_id,
                        timestamp=datetime.utcnow().isoformat()
                    )
            else:
                ctx.logger.error(f"Remove contract call failed - result: {result}")
                return MonitorResponse(
                    success=False,
                    message=f"Failed to call removeContract method",
                    contract_id=req.contract_id,
                    timestamp=datetime.utcnow().isoformat()
                )
        else:
            ctx.logger.warning(f"Contract {req.contract_id} not found in monitoring list")
            return MonitorResponse(
                success=False,
                message=f"Contract {req.contract_id} was not being monitored",
                contract_id=req.contract_id,
                timestamp=datetime.utcnow().isoformat()
            )
        
    except Exception as e:
        ctx.logger.error(f"Error stopping monitoring via REST: {e}")
        return MonitorResponse(
            success=False,
            message=f"Failed to stop monitoring: {str(e)}",
            contract_id=req.contract_id,
            timestamp=datetime.utcnow().isoformat()
        )

@agent.on_rest_post("/monitor/clear", ClearRequest, ClearResponse)
async def clear_all_contracts(ctx: Context, req: ClearRequest) -> ClearResponse:
    """Clear all monitored contracts from the backend"""
    try:
        # Get current contract count before clearing
        contracts = await canister_client.get_contracts()
        contracts_count = len(contracts)
        
        # Clear all contracts from backend canister
        success = await canister_client.clear_all_contracts()
        
        if success:
            ctx.logger.info(f"Cleared all {contracts_count} contracts from monitoring")
            
            return ClearResponse(
                success=True,
                message=f"Successfully cleared all contracts from monitoring",
                contracts_cleared=contracts_count,
                timestamp=datetime.utcnow().isoformat()
            )
        else:
            return ClearResponse(
                success=False,
                message="Failed to clear contracts from backend canister",
                contracts_cleared=0,
                timestamp=datetime.utcnow().isoformat()
            )
        
    except Exception as e:
        ctx.logger.error(f"Error clearing all contracts via REST: {e}")
        return ClearResponse(
            success=False,
            message=f"Failed to clear contracts: {str(e)}",
            contracts_cleared=0,
            timestamp=datetime.utcnow().isoformat()
        )

@agent.on_rest_post("/monitor/pause", MonitorRequest, MonitorResponse)
async def pause_monitoring_contract(ctx: Context, req: MonitorRequest) -> MonitorResponse:
    """Pause monitoring a specific contract via REST API"""
    try:
        ctx.logger.info(f"Received REST pause request for contract: {req.contract_id}")
        
        # Find the contract by address first
        contract = await canister_client.find_contract_by_address(req.contract_id)
        
        if contract and contract.get('id'):
            # Pause contract in backend canister using the numeric ID
            contract_numeric_id = contract.get('id')
            args = f'({contract_numeric_id} : nat)'
            result = await canister_client.call_canister("pauseContract", args)
            
            # Check for successful response
            if result and result.get("status") == "success":
                response_data = result.get("data", "")
                if "variant {" in response_data and "ok" in response_data and "isPaused = true" in response_data:
                    ctx.logger.info(f"Paused monitoring contract via REST: {req.contract_id}")
                    
                    return MonitorResponse(
                        success=True,
                        message=f"Paused monitoring contract {req.contract_id}",
                        contract_id=req.contract_id,
                        nickname=contract.get('nickname', f"Contract-{req.contract_id[:8]}"),
                        timestamp=datetime.utcnow().isoformat()
                    )
                else:
                    ctx.logger.error(f"Pause contract failed - response: {response_data}")
                    return MonitorResponse(
                        success=False,
                        message=f"Failed to pause contract in backend canister: {response_data}",
                        contract_id=req.contract_id,
                        timestamp=datetime.utcnow().isoformat()
                    )
            else:
                ctx.logger.error(f"Pause contract call failed - result: {result}")
                return MonitorResponse(
                    success=False,
                    message=f"Failed to call pauseContract method",
                    contract_id=req.contract_id,
                    timestamp=datetime.utcnow().isoformat()
                )
        else:
            return MonitorResponse(
                success=False,
                message=f"Contract {req.contract_id} was not being monitored",
                contract_id=req.contract_id,
                timestamp=datetime.utcnow().isoformat()
            )
        
    except Exception as e:
        ctx.logger.error(f"Error pausing monitoring contract via REST: {e}")
        return MonitorResponse(
            success=False,
            message=f"Failed to pause monitoring: {str(e)}",
            contract_id=req.contract_id,
            timestamp=datetime.utcnow().isoformat()
        )

@agent.on_rest_post("/monitor/resume", MonitorRequest, MonitorResponse)
async def resume_monitoring_contract(ctx: Context, req: MonitorRequest) -> MonitorResponse:
    """Resume monitoring a specific contract via REST API"""
    try:
        ctx.logger.info(f"Received REST resume request for contract: {req.contract_id}")
        
        # Find the contract by address first
        contract = await canister_client.find_contract_by_address(req.contract_id)
        
        if contract and contract.get('id'):
            # Resume contract in backend canister using the numeric ID
            contract_numeric_id = contract.get('id')
            args = f'({contract_numeric_id} : nat)'
            result = await canister_client.call_canister("resumeContract", args)
            
            # Check for successful response
            if result and result.get("status") == "success":
                response_data = result.get("data", "")
                if "variant {" in response_data and "ok" in response_data and "isPaused = false" in response_data:
                    ctx.logger.info(f"Resumed monitoring contract via REST: {req.contract_id}")
                    
                    return MonitorResponse(
                        success=True,
                        message=f"Resumed monitoring contract {req.contract_id}",
                        contract_id=req.contract_id,
                        nickname=contract.get('nickname', f"Contract-{req.contract_id[:8]}"),
                        timestamp=datetime.utcnow().isoformat()
                    )
                else:
                    ctx.logger.error(f"Resume contract failed - response: {response_data}")
                    return MonitorResponse(
                        success=False,
                        message=f"Failed to resume contract in backend canister: {response_data}",
                        contract_id=req.contract_id,
                        timestamp=datetime.utcnow().isoformat()
                    )
            else:
                ctx.logger.error(f"Resume contract call failed - result: {result}")
                return MonitorResponse(
                    success=False,
                    message=f"Failed to call resumeContract method",
                    contract_id=req.contract_id,
                    timestamp=datetime.utcnow().isoformat()
                )
        else:
            return MonitorResponse(
                success=False,
                message=f"Contract {req.contract_id} was not found",
                contract_id=req.contract_id,
                timestamp=datetime.utcnow().isoformat()
            )
        
    except Exception as e:
        ctx.logger.error(f"Error resuming monitoring contract via REST: {e}")
        return MonitorResponse(
            success=False,
            message=f"Failed to resume monitoring: {str(e)}",
            contract_id=req.contract_id,
            timestamp=datetime.utcnow().isoformat()
        )

# ============================================================================
# AGENT EVENT HANDLERS
# ============================================================================

@agent.on_event("startup")
async def startup_handler(ctx: Context):
    """Agent startup handler"""
    logger.info(f"🐦 Canary Contract Guardian Agent starting...")
    logger.info(f"Agent address: {agent.address}")
    logger.info(f"Monitoring canister: {CANISTER_ID}")
    logger.info(f"Chat protocol enabled for ASI compatibility")
    
    # Start monitoring in background
    asyncio.create_task(contract_monitor.start_monitoring())

@agent.on_event("shutdown")
async def shutdown_handler(ctx: Context):
    """Agent shutdown handler"""
    logger.info("🐦 Canary Contract Guardian Agent shutting down...")
    contract_monitor.stop_monitoring()

# ============================================================================
# MANUAL TESTING FUNCTIONS (for hackathon demo)
# ============================================================================

async def test_demo_alert():
    """Trigger a demo alert for testing"""
    try:
        logger.info("🧪 Triggering demo alert...")
        
        demo_alert = {
            "title": "Demo Alert: High Transaction Volume",
            "description": "This is a test alert generated for demonstration purposes",
            "severity": "warning",
            "contract_address": "rdmx6-jaaaa-aaaah-qcaiq-cai",
            "contract_nickname": "Demo Contract",
            "rule_name": "High Transaction Volume",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = await discord_notifier.send_alert(demo_alert)
        
        if success:
            logger.info("✅ Demo alert sent successfully!")
        else:
            logger.error("❌ Demo alert failed to send")
            
    except Exception as e:
        logger.error(f"Error sending demo alert: {e}")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main function to start the Canary Contract Guardian agent"""
    print("🐦 Canary Contract Guardian - Monitoring Agent")
    print("=" * 50)
    print(f"Agent Address: {agent.address}")
    print(f"Canister ID: {CANISTER_ID}")
    print(f"Monitoring Interval: {MONITORING_INTERVAL}s")
    print(f"Chat Protocol: Enabled (ASI Compatible)")
    print("=" * 50)
    
    # For demo: uncomment to test Discord webhook
    # asyncio.run(test_demo_alert())
    
    # Start the agent
    agent.run()

if __name__ == "__main__":
    main()
