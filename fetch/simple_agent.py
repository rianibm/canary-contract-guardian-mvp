import asyncio
import logging
import os
from datetime import datetime
from dotenv import load_dotenv
from uagents import Agent, Context
from uagents.setup import fund_agent_if_low

# Import separated classes
from agent.contract_data import ContractData
from agent.canister_client import CanisterClient
from agent.discord_notifier import DiscordNotifier
from agent.monitoring_rules import MonitoringRules
from agent.contract_monitor import ContractMonitor

# Load environment variables
load_dotenv()

# ============================================================================
# CONFIGURATION
# ============================================================================

# ICP Canister Configuration
CANISTER_ID = os.getenv("CANISTER_ID", "rdmx6-jaaaa-aaaah-qcaiq-cai")
BASE_URL = "http://127.0.0.1:4943"

# Discord Configuration
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL")

# Monitoring Configuration
MONITORING_INTERVAL = int(os.getenv("MONITORING_INTERVAL", "60"))  # Default to 1 minute for testing

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

contract_data = ContractData()
canister_client = CanisterClient(CANISTER_ID, BASE_URL)
discord_notifier = DiscordNotifier(DISCORD_WEBHOOK_URL)
monitoring_rules = MonitoringRules()
contract_monitor = ContractMonitor(
    canister_client, discord_notifier, monitoring_rules, 
    contract_data, MONITORING_INTERVAL
)

# ============================================================================
# EVENT HANDLERS
# ============================================================================

@agent.on_event("startup")
async def startup_handler(ctx: Context):
    """Initialize the agent and start monitoring"""
    logger.info("🐦 Canary Contract Guardian starting up...")
    logger.info(f"Agent Address: {agent.address}")
    logger.info(f"Canister ID: {CANISTER_ID}")
    logger.info(f"Monitoring Interval: {MONITORING_INTERVAL}s")
    logger.info(f"Discord Webhook: {'✅ Configured' if DISCORD_WEBHOOK_URL and 'YOUR_WEBHOOK_URL' not in DISCORD_WEBHOOK_URL else '❌ Not configured'}")
    
    # Add some demo contracts to monitor
    demo_contracts = [
        ("uxrrr-q7777-77774-qaaaq-cai", "Backend Canister"),
        ("u6s2n-gx777-77774-qaaba-cai", "Dummy Contract")
    ]
    
    for contract_id, nickname in demo_contracts:
        # Add to local contract data store
        contract_data.add_contract(contract_id, nickname)
        
        # Add to canister
        try:
            result = await canister_client.add_contract_to_canister(contract_id, nickname)
            if result:
                logger.info(f"✅ Added contract to canister: {nickname} ({contract_id})")
            else:
                logger.error(f"❌ Failed to add contract to canister: {nickname} ({contract_id})")
        except Exception as e:
            logger.error(f"Error adding contract to canister: {e}")
            logger.info(f"Added contract to local store: {nickname} ({contract_id})")
    
    # Start monitoring
    logger.info("🔍 Starting contract monitoring...")
    await contract_monitor.start_monitoring()

@agent.on_event("shutdown")
async def shutdown_handler(ctx: Context):
    """Clean shutdown"""
    logger.info("🐦 Canary Contract Guardian shutting down...")
    contract_monitor.stop_monitoring()  # Remove await since it's not async

# ============================================================================
# DEMO FUNCTION
# ============================================================================

async def test_demo_alert():
    """Send a demo alert to test Discord integration"""
    try:
        logger.info("🧪 Testing Discord webhook integration...")
        demo_alert = {
            "title": "🧪 Demo Alert - System Test",
            "description": "This is a test alert to verify Discord integration is working properly.",
            "contract_id": CANISTER_ID,
            "contract_nickname": "Test Contract",
            "severity": "info",
            "timestamp": datetime.now().isoformat(),
            "rule_name": "System Test"
        }
        
        success = await discord_notifier.send_alert(demo_alert)
        if success:
            logger.info("✅ Demo alert sent successfully")
        else:
            logger.error("❌ Demo alert failed to send")
            
    except Exception as e:
        logger.error(f"Error sending demo alert: {e}")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main entry point"""
    print("🐦 Canary Contract Guardian - Monitoring Agent")
    print("=" * 50)
    print(f"Agent Address: {agent.address}")
    print(f"Canister ID: {CANISTER_ID}")
    print(f"Monitoring Interval: {MONITORING_INTERVAL}s")
    print(f"Discord Webhook: {'✅ Configured' if DISCORD_WEBHOOK_URL and 'YOUR_WEBHOOK_URL' not in DISCORD_WEBHOOK_URL else '❌ Not configured'}")
    print("=" * 50)
    
    # Uncomment to test Discord webhook
    # asyncio.run(test_demo_alert())
    
    # Start the agent
    logger.info("🚀 Starting agent...")
    agent.run()

if __name__ == "__main__":
    main()
