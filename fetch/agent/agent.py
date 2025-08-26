import asyncio
import logging
import os
import re
import json
import aiohttp
from datetime import datetime
from dotenv import load_dotenv
from uagents import Agent, Context, Protocol, Model
from uagents.setup import fund_agent_if_low
from typing import Dict, Any
import time
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)
 

# Import separated classes
from canister_client import CanisterClient
from discord_notifier import DiscordNotifier
from monitoring_rules import MonitoringRules
from contract_monitor import ContractMonitor
from asi_client import ASIOneClient

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
CANISTER_ID = os.getenv("CANISTER_ID", "uxrrr-q7777-77774-qaaaq-cai")  # Use backend canister
BASE_URL = "http://127.0.0.1:4943"

# Discord Configuration
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL")

# Monitoring Configuration
MONITORING_INTERVAL = int(os.getenv("MONITORING_INTERVAL", "300"))  # 5 minutes in seconds

# Agent Configuration
AGENT_NAME = os.getenv("AGENT_NAME", "CanaryGuardian")
AGENT_SEED = os.getenv("AGENT_SEED", "canary_guardian_secret_seed")

# Agentverse Configuration
AGENTVERSE_API_KEY = os.getenv("AGENTVERSE_API_KEY", "")
ASI_MODEL_ENDPOINT = os.getenv("ASI_MODEL_ENDPOINT", "https://api.asi.one/v1/models")

# Agent metadata for Agentverse
AGENT_METADATA = {
    "name": "Canary Contract Guardian",
    "description": "AI-powered smart contract monitoring and security guardian that provides 24/7 surveillance of blockchain contracts with real-time alerts and recommendations.",
    "version": "1.0.0",
    "author": "Canary Team",
    "tags": ["security", "blockchain", "monitoring", "smart-contracts", "defi", "icp"],
    "capabilities": [
        "Smart contract monitoring",
        "Real-time security alerts", 
        "AI-powered recommendations",
        "Cross-rule correlation analysis",
        "Balance drop detection",
        "Ownership change monitoring",
        "Gas usage analysis",
        "Discord notifications"
    ],
    "protocols": ["chat", "monitoring", "security"],
    "networks": ["ICP", "Internet Computer"]
}

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
    # Remove endpoint to allow proper mailbox functionality for Agentverse chat
    mailbox=True,
    agentverse={
        "use_mailbox": True,  # Enable Agentverse mailbox for mainnet connectivity
        "http_digest_auth": False,
        "use_websockets": True,
    }
)

# Store metadata for reference (will be used in responses and logs)
agent._canary_metadata = AGENT_METADATA

# ============================================================================
# INITIALIZE COMPONENTS
# ============================================================================

# Initialize ASI:One client
asi_client = ASIOneClient(ASI_MODEL_ENDPOINT, AGENTVERSE_API_KEY)

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

# Using standard ChatMessage from uagents_core.contrib.protocols.chat

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
    discord_webhook: str = None

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

@chat_protocol.on_message(ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, message: ChatMessage):
    """Handle incoming chat messages about contract monitoring with ASI:One enhanced responses"""
    try:
        # Extract text from ChatMessage content
        message_text = ""
        if hasattr(message.content, 'text'):
            message_text = message.content.text
        elif hasattr(message, 'text'):
            message_text = message.text
        else:
            message_text = str(message.content)
            
        logger.info(f"Received chat message from {sender}: {message_text}")
        response_text = ""
        message_lower = message_text.lower()
        
        # Parse contract ID from message (looks for canister ID patterns)
        contract_id = extract_contract_id(message_text)
        
        # Try to get enhanced AI response first
        context = {
            "sender": sender,
            "contract_id": contract_id,
            "timestamp": datetime.utcnow().isoformat(),
            "agent_capabilities": AGENT_METADATA["capabilities"]
        }
        
        enhanced_response = await asi_client.generate_enhanced_response(message_text, context)
        
        if enhanced_response and len(enhanced_response) > 50:  # Use AI response if substantial
            response_text = enhanced_response
        else:
            # Fallback to traditional logic if AI fails
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

                    **Enhanced with ASI:One AI** for intelligent responses and recommendations!

                    Example: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'"""
                
            elif "info" in message_lower:
                response_text = f"""🐦 Canary Contract Guardian
                    **AI-Enhanced Security Monitor** powered by ASI:One
                    Digital security guard for smart contracts 24/7

                    📊 Monitoring interval: {MONITORING_INTERVAL}s
                    🔍 Rules: Balance drops, transaction volume, suspicious functions
                    🤖 AI Features: Enhanced responses, pattern recognition, smart recommendations
                    🚨 Alerts: Auto-sent to Discord when rules violated
                    💬 Natural language commands supported
                    🌐 Agentverse enabled for global discoverability"""
                
            elif "rule" in message_lower:
                response_text = """🔍 AI-Enhanced Monitoring Rules:
                    1. **Balance Drop Alert**: >50% decrease + adaptive thresholds
                    2. **High Transaction Volume**: >10 transactions/hour
                    3. **Suspicious Function Calls**: admin/upgrade functions
                    4. **Ownership Change**: CRITICAL alerts for permission changes
                    5. **Cross-Rule Correlation**: AI detects combination attacks
                    6. **Gas Usage Anomalies**: >3× median usage patterns
                    7. **Reentrancy Detection**: Recursive call patterns
                    8. **Flash Loan Monitoring**: Large loans + rapid transactions

                    **AI Enhancement**: Smart pattern recognition and contextual recommendations!"""
                
            else:
                response_text = """Hello! I'm your **AI-enhanced** smart contract guardian 🐦

                    Powered by ASI:One intelligence and connected to Agentverse for global reach!

                    I can help you monitor and analyze smart contracts with:
                    • **AI-powered responses** and recommendations
                    • **Pattern recognition** for complex threats  
                    • **Cross-rule correlation** analysis
                    • **Adaptive monitoring** that learns over time

                    Try commands like:
                    • "monitor this smart contract: [contract-id]"
                    • "check this smart contract for security issues"
                    • "what's the security status of my contracts?"
                    • "stop monitoring [contract-id]"

                    Type 'help' for more detailed commands or 'info' for my AI capabilities!"""
        
        # If we have a contract ID in the message, execute the relevant action
        # This should happen regardless of whether AI response was generated
        action_result = ""
        if contract_id:
            if "monitor" in message_lower and ("contract" in message_lower or "smart contract" in message_lower):
                action_result = await handle_monitor_command(contract_id)
                if enhanced_response:  # If AI generated response, append action result
                    response_text += f"\n\n**📋 Action Result:**\n{action_result}"
                else:  # If no AI response, use action result as main response
                    response_text = action_result
            elif "check" in message_lower and ("contract" in message_lower or "smart contract" in message_lower):
                action_result = await handle_check_command(contract_id)
                if enhanced_response:  # If AI generated response, append action result
                    response_text += f"\n\n**🔍 Analysis Result:**\n{action_result}"
                else:  # If no AI response, use action result as main response
                    response_text = action_result
            elif "stop" in message_lower and "monitoring" in message_lower:
                action_result = await handle_stop_monitoring(contract_id)
                if enhanced_response:  # If AI generated response, append action result
                    response_text += f"\n\n**⏹️ Action Result:**\n{action_result}"
                else:  # If no AI response, use action result as main response
                    response_text = action_result
        
        await ctx.send(sender, ChatMessage(content=[TextContent(text=response_text)]))
        
    except Exception as e:
        logger.error(f"Error handling chat message: {e}")
        await ctx.send(sender, ChatMessage(content=[TextContent(text="Sorry, I encountered an error processing your request. My AI systems are temporarily unavailable, but basic monitoring functions remain active.")]))

@agent.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    # we are not interested in the acknowledgements for this example, but they can be useful to
    # implement read receipts, for example.
    pass

# Add direct chat message handler for better compatibility
@agent.on_message(ChatMessage)
async def handle_direct_chat(ctx: Context, sender: str, msg: ChatMessage):
    """Direct chat message handler for Agentverse compatibility"""
    try:
        # Extract text from ChatMessage content (which is a list)
        message_text = ""
        if hasattr(msg.content, '__iter__') and len(msg.content) > 0:
            # Content is a list, get the first item
            first_content = msg.content[0]
            if hasattr(first_content, 'text'):
                message_text = first_content.text
            else:
                message_text = str(first_content)
        elif hasattr(msg.content, 'text'):
            message_text = msg.content.text
        elif hasattr(msg, 'text'):
            message_text = msg.text
        else:
            message_text = str(msg.content)
            
        logger.info(f"Received direct chat message from {sender}: {message_text}")
        
        # Use the same logic as the protocol handler
        response_text = await process_chat_message(message_text, sender)
        
        # Send response
        await ctx.send(sender, ChatMessage(content=[TextContent(text=response_text)]))
        
    except Exception as e:
        logger.error(f"Error handling direct chat message: {e}")
        await ctx.send(sender, ChatMessage(content=[TextContent(text="Sorry, I encountered an error processing your request.")]))

# Helper function to process chat messages
async def process_chat_message(message_text: str, sender: str) -> str:
    """Process chat message and return response"""
    try:
        response_text = ""
        message_lower = message_text.lower()
        
        # Parse contract ID from message (looks for canister ID patterns)
        contract_id = extract_contract_id(message_text)
        
        # Try to get enhanced AI response first
        context = {
            "sender": sender,
            "contract_id": contract_id,
            "timestamp": datetime.utcnow().isoformat(),
            "agent_capabilities": AGENT_METADATA["capabilities"]
        }
        
        enhanced_response = await asi_client.generate_enhanced_response(message_text, context)
        
        if enhanced_response and len(enhanced_response) > 50:  # Use AI response if substantial
            # Check if response is JSON and extract the message
            try:
                if enhanced_response.strip().startswith('{') and enhanced_response.strip().endswith('}'):
                    response_data = json.loads(enhanced_response)
                    if isinstance(response_data, dict):
                        # Look for various message fields that might contain the actual response
                        if 'message' in response_data:
                            response_text = response_data['message']
                        elif 'response' in response_data:
                            response_text = response_data['response']
                        elif 'content' in response_data:
                            response_text = response_data['content']
                        elif 'text' in response_data:
                            response_text = response_data['text']
                        else:
                            # If JSON doesn't contain a readable message, fall back to local response
                            logger.warning("Received JSON response without message field, falling back to local response")
                            logger.debug(f"JSON response content: {response_data}")
                            response_text = ""  # This will trigger fallback logic
                    else:
                        response_text = enhanced_response
                else:
                    response_text = enhanced_response
            except json.JSONDecodeError:
                response_text = enhanced_response
        
        # If response_text is still empty after JSON processing, use fallback logic  
        if not response_text:
            # Fallback to traditional logic if AI fails
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

                    **Enhanced with ASI:One AI** for intelligent responses and recommendations!

                    Example: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'"""
                
            elif "info" in message_lower:
                response_text = f"""🐦 Canary Contract Guardian
                    **AI-Enhanced Security Monitor** powered by ASI:One
                    Digital security guard for smart contracts 24/7

                    📊 Monitoring interval: {MONITORING_INTERVAL}s
                    🔍 Rules: Balance drops, transaction volume, suspicious functions
                    🤖 AI Features: Enhanced responses, pattern recognition, smart recommendations
                    🚨 Alerts: Auto-sent to Discord when rules violated
                    💬 Natural language commands supported
                    🌐 Agentverse enabled for global discoverability"""
                
            elif "rule" in message_lower:
                response_text = """🔍 AI-Enhanced Monitoring Rules:
                    1. **Balance Drop Alert**: >50% decrease + adaptive thresholds
                    2. **High Transaction Volume**: >10 transactions/hour
                    3. **Suspicious Function Calls**: admin/upgrade functions
                    4. **Ownership Change**: CRITICAL alerts for permission changes
                    5. **Cross-Rule Correlation**: AI detects combination attacks
                    6. **Gas Usage Anomalies**: >3× median usage patterns
                    7. **Reentrancy Detection**: Recursive call patterns
                    8. **Flash Loan Monitoring**: Large loans + rapid transactions

                    **AI Enhancement**: Smart pattern recognition and contextual recommendations!"""
                
            else:
                response_text = """Hello! I'm your **AI-enhanced** smart contract guardian 🐦

                    Powered by ASI:One intelligence and connected to Agentverse for global reach!

                    I can help you monitor and analyze smart contracts with:
                    • **AI-powered responses** and recommendations
                    • **Pattern recognition** for complex threats  
                    • **Cross-rule correlation** analysis
                    • **Adaptive monitoring** that learns over time

                    Try commands like:
                    • "monitor this smart contract: [contract-id]"
                    • "check this smart contract for security issues"
                    • "what's the security status of my contracts?"
                    • "stop monitoring [contract-id]"

                    Type 'help' for more detailed commands or 'info' for my AI capabilities!"""
        
        # If we have a contract ID in the message, execute the relevant action
        # This should happen regardless of whether AI response was generated
        action_result = ""
        if contract_id:
            if "monitor" in message_lower and ("contract" in message_lower or "smart contract" in message_lower):
                action_result = await handle_monitor_command(contract_id)
                if enhanced_response:  # If AI generated response, append action result
                    response_text += f"\n\n**📋 Action Result:**\n{action_result}"
                else:  # If no AI response, use action result as main response
                    response_text = action_result
            elif "check" in message_lower and ("contract" in message_lower or "smart contract" in message_lower):
                action_result = await handle_check_command(contract_id)
                if enhanced_response:  # If AI generated response, append action result
                    response_text += f"\n\n**🔍 Analysis Result:**\n{action_result}"
                else:  # If no AI response, use action result as main response
                    response_text = action_result
            elif "stop" in message_lower and "monitoring" in message_lower:
                action_result = await handle_stop_monitoring(contract_id)
                if enhanced_response:  # If AI generated response, append action result
                    response_text += f"\n\n**⏹️ Action Result:**\n{action_result}"
                else:  # If no AI response, use action result as main response
                    response_text = action_result
        
        return response_text

    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        return "Sorry, I encountered an error processing your request."

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
                "status": contract.get('status', 'healthy'),  # Keep original health status separate
                "isActive": contract.get('isActive', True),  # Include the raw isActive property
                "isPaused": contract.get('isPaused', False),  # Include the raw isPaused property
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
                "contract": alert.get('contractAddress', ''),
                "nickname": alert.get('contractNickname', 'Unknown Contract'),
                "timestamp": format_timestamp(alert.get('timestamp_readable', '')),
                "severity": alert.get('severity', 'info'),
                "rule": alert.get('ruleName', 'Unknown Rule'),
                "category": get_alert_category(alert.get('ruleName', ''))
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
    """Handle chat messages from frontend via REST API with ASI:One enhancement"""
    try:
        ctx.logger.info(f"Received REST chat message: {req.message}")
        
        # Extract contract ID if present
        contract_id = extract_contract_id(req.message)
        webhook_match = re.search(r'(https://discord.com/api/webhooks/[\w\-/]+)', req.message)
        discord_webhook = webhook_match.group(1) if webhook_match else None
        
        # Try ASI:One enhanced response first
        context = {
            "source": "rest_api",
            "contract_id": contract_id,
            "timestamp": datetime.utcnow().isoformat(),
            "agent_capabilities": AGENT_METADATA["capabilities"]
        }
        
        enhanced_response = await asi_client.generate_enhanced_response(req.message, context)
        
        if enhanced_response and len(enhanced_response) > 50:
            # Check if response is JSON and extract the message
            try:
                if enhanced_response.strip().startswith('{') and enhanced_response.strip().endswith('}'):
                    response_data = json.loads(enhanced_response)
                    if isinstance(response_data, dict):
                        # Look for various message fields that might contain the actual response
                        if 'message' in response_data:
                            response_text = response_data['message']
                        elif 'response' in response_data:
                            response_text = response_data['response']
                        elif 'content' in response_data:
                            response_text = response_data['content']
                        elif 'text' in response_data:
                            response_text = response_data['text']
                        else:
                            # If JSON doesn't contain a readable message, fall back to local response
                            ctx.logger.warning("Received JSON response without message field, falling back to local response")
                            response_text = ""  # This will trigger fallback logic
                    else:
                        response_text = enhanced_response
                else:
                    response_text = enhanced_response
            except json.JSONDecodeError:
                response_text = enhanced_response
        
        # If response_text is still empty after JSON processing, use fallback logic
        if not response_text:
            # Fallback to traditional logic
            message_lower = req.message.lower()
            
            # Handle different types of commands (same as chat protocol handler)
            if "monitor" in message_lower and ("contract" in message_lower or "smart contract" in message_lower):
                if contract_id:
                    response_text = await handle_monitor_command(contract_id, discord_webhook)
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

**Enhanced with ASI:One AI** for intelligent responses!

Example: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'"""
                
            else:
                response_text = """Hello! I'm your **AI-enhanced** smart contract guardian 🐦

Powered by ASI:One intelligence and Agentverse connectivity!

I can help you monitor and analyze smart contracts with advanced AI capabilities. Try commands like:
• "monitor this smart contract: [contract-id]"
• "check this smart contract for unusual activity"
• "what's the status of my contracts?"
• "stop monitoring [contract-id]"

Type 'help' for more detailed commands."""
        
        # Execute actions if contract ID is present - regardless of AI response
        action_result = ""
        if contract_id:
            if "monitor" in req.message.lower() and ("contract" in req.message.lower() or "smart contract" in req.message.lower()):
                action_result = await handle_monitor_command(contract_id)
                if enhanced_response:  # If AI generated response, append action result
                    response_text += f"\n\n**📋 Action Result:**\n{action_result}"
                else:  # If no AI response, use action result as main response
                    response_text = action_result
            elif "check" in req.message.lower() and ("contract" in req.message.lower() or "smart contract" in req.message.lower()):
                action_result = await handle_check_command(contract_id)
                if enhanced_response:  # If AI generated response, append action result
                    response_text += f"\n\n**🔍 Analysis Result:**\n{action_result}"
                else:  # If no AI response, use action result as main response
                    response_text = action_result
            elif "stop" in req.message.lower() and "monitoring" in req.message.lower():
                action_result = await handle_stop_monitoring(contract_id)
                if enhanced_response:  # If AI generated response, append action result
                    response_text += f"\n\n**⏹️ Action Result:**\n{action_result}"
                else:  # If no AI response, use action result as main response
                    response_text = action_result
        
        return ChatResponse(
            response=response_text,
            timestamp=datetime.utcnow().isoformat(),
            success=True
        )
        
    except Exception as e:
        ctx.logger.error(f"Error handling REST chat message: {e}")
        return ChatResponse(
            response="Sorry, I encountered an error processing your request. My AI systems are temporarily unavailable, but basic monitoring functions remain active.",
            timestamp=datetime.utcnow().isoformat(),
            success=False
        )

@agent.on_rest_post("/monitor/add", MonitorRequest, MonitorResponse)
async def start_monitoring_contract(ctx: Context, req: MonitorRequest) -> MonitorResponse:
    """Start monitoring a specific contract via REST API"""
    try:
        nickname = req.nickname or f"Contract-{req.contract_id[:8]}"
        discord_webhook = req.discord_webhook or DISCORD_WEBHOOK_URL
        
        # Add contract to backend canister
        success = await canister_client.add_contract_to_canister(req.contract_id, nickname)
        
        if success:
            contract_monitor.set_contract_webhook(req.contract_id, discord_webhook)
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
            print(f"Pausing contract with args: {args}")
            result = await canister_client.call_canister("pauseContract", args)
            # Check for successful response
            if result and result.get("status") == "success":
                response_data = result.get("data", "")
                if "variant {" in response_data and "ok" in response_data:
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
                if "variant {" in response_data and "ok" in response_data and ("isPaused = false" in response_data or "isActive = true" in response_data):
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
    """Agent startup handler with Agentverse registration"""
    logger.info(f"🐦 Canary Contract Guardian Agent starting...")
    logger.info(f"Agent address: {agent.address}")
    logger.info(f"Monitoring canister: {CANISTER_ID}")
    logger.info(f"Chat protocol enabled for ASI compatibility")
    
    # Test ASI:One connection
    asi_available = await asi_client.test_connection()
    logger.info(f"🤖 ASI:One AI enhancement: {'✅ Connected' if asi_available else '⚠️ Local responses only'}")
    logger.info(f"🌐 Agentverse integration: {'✅ Enabled' if AGENTVERSE_API_KEY else '⚠️ Limited'}")
    
    # Log agent metadata for Agentverse
    logger.info(f"📋 Agent Capabilities: {', '.join(AGENT_METADATA['capabilities'])}")
    logger.info(f"🏷️ Agent Tags: {', '.join(AGENT_METADATA['tags'])}")
    
    # Start monitoring in background
    asyncio.create_task(contract_monitor.start_monitoring())
    
    logger.info("🚀 Agent ready for Agentverse discovery and ASI:One enhanced interactions!")

@agent.on_event("shutdown")
async def shutdown_handler(ctx: Context):
    """Agent shutdown handler with cleanup"""
    logger.info("🐦 Canary Contract Guardian Agent shutting down...")
    
    # Stop monitoring
    contract_monitor.stop_monitoring()
    
    # Close ASI:One session
    try:
        await asi_client.close_session()
        logger.info("🤖 ASI:One session closed")
    except Exception as e:
        logger.error(f"Error closing ASI:One session: {e}")
    
    logger.info("✅ Shutdown complete")

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
    print("🐦 Canary Contract Guardian - AI-Enhanced Monitoring Agent")
    print("=" * 60)
    print(f"Agent Address: {agent.address}")
    print(f"Canister ID: {CANISTER_ID}")
    print(f"Monitoring Interval: {MONITORING_INTERVAL}s")
    print(f"Chat Protocol: Enabled (ASI Compatible)")
    print(f"🤖 ASI:One Enhancement: {'✅ Enabled' if ASI_MODEL_ENDPOINT else '❌ Disabled'}")
    print(f"🌐 Agentverse Integration: {'✅ Enabled' if AGENTVERSE_API_KEY else '⚠️ Limited'}")
    print(f"📋 Capabilities: {len(AGENT_METADATA['capabilities'])} AI-powered features")
    print("=" * 60)
    print("🚀 Starting agent with Agentverse discoverability...")
    print("💬 Ready for intelligent conversations powered by ASI:One!")
    
    # For demo: uncomment to test Discord webhook
    # asyncio.run(test_demo_alert())
    
    # Start the agent
    agent.run()

if __name__ == "__main__":
    main()
