import asyncio
import logging
from datetime import datetime
from uagents import Agent, Context
from uagents.protocols.chat import ChatProtocol, chat_message
from uagents.setup import fund_agent_if_low

# Import separated classes
from agent.contract_data import ContractData
from agent.canister_client import CanisterClient
from agent.discord_notifier import DiscordNotifier
from agent.monitoring_rules import MonitoringRules
from agent.contract_monitor import ContractMonitor

# ============================================================================
# CONFIGURATION
# ============================================================================

# ICP Canister Configuration
CANISTER_ID = "rdmx6-jaaaa-aaaah-qcaiq-cai"
BASE_URL = "http://127.0.0.1:4943"

# Discord Configuration
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"

# Monitoring Configuration
MONITORING_INTERVAL = 300  # 5 minutes in seconds

# ============================================================================
# LOGGING SETUP
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
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
    name="canary-contract-guardian",
    seed="canary-monitoring-seed-12345",
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"]
)

# ============================================================================
# INITIALIZE COMPONENTS
# ============================================================================

# Initialize all components
contract_data = ContractData()
canister_client = CanisterClient(CANISTER_ID, BASE_URL)
discord_notifier = DiscordNotifier(DISCORD_WEBHOOK_URL)
monitoring_rules = MonitoringRules()
contract_monitor = ContractMonitor(
    canister_client, discord_notifier, monitoring_rules, 
    contract_data, MONITORING_INTERVAL
)

# ============================================================================
# CHAT PROTOCOL IMPLEMENTATION
# ============================================================================

chat_protocol = ChatProtocol()

@chat_protocol.on_message
async def handle_chat_message(ctx: Context, sender: str, message: chat_message):
    """Handle incoming chat messages about contract monitoring"""
    try:
        logger.info(f"Received chat message from {sender}: {message.text}")
        
        response_text = ""
        message_lower = message.text.lower()
        
        if "status" in message_lower or "contract" in message_lower:
            response_text = await contract_monitor.get_status_summary()
        
        elif "alert" in message_lower:
            response_text = "🚨 Alerts are sent automatically when rules are violated. Check Discord for recent alerts or ask for 'status' to see current contract states."
        
        elif "help" in message_lower:
            response_text = """🐦 Canary Contract Guardian Commands:
• 'status' - Get monitored contracts status
• 'alert' - Information about alerts
• 'info' - Agent information
• 'rules' - View monitoring rules
• 'help' - Show this help"""
        
        elif "info" in message_lower:
            response_text = f"""🐦 Canary Contract Guardian
Digital security guard for smart contracts 24/7
📊 Monitoring interval: {MONITORING_INTERVAL}s
🔍 Rules: Balance drops, transaction volume, suspicious functions
🚨 Alerts: Auto-sent to Discord when rules violated"""
        
        elif "rule" in message_lower:
            response_text = """🔍 Active Monitoring Rules:
1. Balance Drop Alert: >50% balance decrease
2. High Transaction Volume: >10 transactions/hour  
3. Suspicious Function Calls: admin/upgrade functions"""
        
        else:
            response_text = "Hello! I'm your smart contract guardian 🐦\nAsk me about contract 'status', 'alerts', or type 'help' for commands."
        
        # Send response back to sender
        await ctx.send(sender, chat_message(text=response_text))
        
    except Exception as e:
        logger.error(f"Error handling chat message: {e}")
        await ctx.send(sender, chat_message(text="Sorry, I encountered an error processing your request."))

# Register chat protocol with agent
agent.include(chat_protocol)

# Fund agent if balance is low
fund_agent_if_low(agent.wallet.address())

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

if __name__ == "__main__":
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
