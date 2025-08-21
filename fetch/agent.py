import asyncio
import json
import time
import logging
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import schedule
from uagents import Agent, Context, ChatProtocol
from uagents.setup import fund_agent_if_low

# ============================================================================
# CONFIGURATION
# ============================================================================

# ICP Canister Configuration
CANISTER_ID = "rdmx6-jaaaa-aaaah-qcaiq-cai"  # Replace with your deployed canister ID
BASE_URL = "http://127.0.0.1:4943"  # Local dfx network
CANISTER_URL = f"{BASE_URL}/?canisterId=rdmx6-jaaaa-aaaah-qcaiq-cai&id={CANISTER_ID}"

# Discord Configuration
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"  # Replace with your Discord webhook

# Monitoring Configuration
MONITORING_INTERVAL = 300  # 5 minutes in seconds
MAX_RETRIES = 3
TIMEOUT = 30

# Rule Thresholds (MVP: 3 hardcoded rules)
BALANCE_DROP_THRESHOLD = 0.5  # 50%
TRANSACTION_VOLUME_LIMIT = 10  # 10 transactions
TRANSACTION_TIME_WINDOW = 3600  # 1 hour in seconds

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
# CHAT PROTOCOL IMPLEMENTATION
# ============================================================================

chat_protocol = ChatProtocol(
    name="Canary Chat",
    description="Ask about contract status, recent alerts, and monitoring info."
)

@agent.on_event("startup")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {agent.name} and my address is {agent.address}.")

@chat_protocol.on_message
async def handle_chat(ctx: Context, sender: str, message: str):
    """Respond to chat queries about contract status and alerts."""
    logger.info(f"Received chat message from {sender}: {message}")
    response = ""
    message_lower = message.lower()
    if "status" in message_lower:
        # Return status of all monitored contracts
        contracts = await canister_client.get_contracts()
        if not contracts:
            response = "No contracts are currently being monitored."
        else:
            status_lines = []
            for contract in contracts:
                nickname = contract.get('nickname', 'Unknown')
                address = contract.get('address', 'N/A')
                status = contract.get('status', 'N/A')
                status_lines.append(f"{nickname} ({address}): Status = {status}")
            response = "Monitored contracts:\n" + "\n".join(status_lines)
    elif "alert" in message_lower:
        response = "Alerts are sent automatically when rules are violated. You can check Discord for recent alerts."
    elif "help" in message_lower:
        response = "You can ask about contract status (e.g., 'status'), recent alerts ('alert'), or monitoring info ('info')."
    elif "info" in message_lower:
        response = f"Canary Contract Guardian monitors smart contracts 24/7 and sends alerts to Discord if suspicious activity is detected. Monitoring interval: {MONITORING_INTERVAL}s."
    else:
        response = "Sorry, I didn't understand your request. Type 'help' for available commands."
    await ctx.send(sender, response)

# Register chat protocol with agent
agent.include(chat_protocol)

# Fund agent if balance is low
fund_agent_if_low(agent.wallet.address())

# ============================================================================
# DATA STORAGE (In-memory for MVP)
# ============================================================================

class ContractData:
    def __init__(self):
        self.contracts: Dict[str, Dict] = {}
        self.last_balances: Dict[str, float] = {}
        self.transaction_history: Dict[str, List] = {}
        self.last_check_time = time.time()
        
    def update_contract(self, contract_id: str, data: Dict):
        """Update contract data"""
        self.contracts[contract_id] = data
        
    def get_contract(self, contract_id: str) -> Optional[Dict]:
        """Get contract data"""
        return self.contracts.get(contract_id)
        
    def add_transaction(self, contract_id: str, transaction: Dict):
        """Add transaction to history"""
        if contract_id not in self.transaction_history:
            self.transaction_history[contract_id] = []
        self.transaction_history[contract_id].append(transaction)
        
        # Keep only last 24 hours of transactions
        cutoff_time = time.time() - 86400  # 24 hours
        self.transaction_history[contract_id] = [
            tx for tx in self.transaction_history[contract_id] 
            if tx.get('timestamp', 0) > cutoff_time
        ]

# Global data storage
contract_data = ContractData()

# ============================================================================
# ICP CANISTER INTERACTION
# ============================================================================

class CanisterClient:
    def __init__(self, canister_id: str, base_url: str):
        self.canister_id = canister_id
        self.base_url = base_url
        self.session = requests.Session()
        
    async def call_canister(self, method: str, args: Dict = None) -> Optional[Dict]:
        """Call canister method"""
        try:
            url = f"{self.base_url}/?canisterId={self.canister_id}"
            
            # Prepare candid call (simplified for MVP)
            payload = {
                "method": method,
                "args": args or {}
            }
            
            response = self.session.post(
                url,
                json=payload,
                timeout=TIMEOUT,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Canister call failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error calling canister method {method}: {e}")
            return None
    
    async def get_contracts(self) -> List[Dict]:
        """Get all monitored contracts"""
        try:
            result = await self.call_canister("getContracts")
            return result.get("contracts", []) if result else []
        except Exception as e:
            logger.error(f"Error getting contracts: {e}")
            return []
    
    async def create_alert(self, contract_id: int, rule_id: int, title: str, 
                          description: str, severity: str) -> bool:
        """Create alert in canister"""
        try:
            args = {
                "contractId": contract_id,
                "ruleId": rule_id,
                "title": title,
                "description": description,
                "severity": severity
            }
            
            result = await self.call_canister("createAlert", args)
            return result is not None
        except Exception as e:
            logger.error(f"Error creating alert: {e}")
            return False
    
    async def update_contract_status(self, contract_id: int, status: str) -> bool:
        """Update contract status"""
        try:
            args = {
                "id": contract_id,
                "status": status
            }
            
            result = await self.call_canister("updateContractStatus", args)
            return result is not None
        except Exception as e:
            logger.error(f"Error updating contract status: {e}")
            return False

# Initialize canister client
canister_client = CanisterClient(CANISTER_ID, BASE_URL)

# ============================================================================
# DISCORD NOTIFICATION
# ============================================================================

class DiscordNotifier:
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
        
    async def send_alert(self, alert_data: Dict) -> bool:
        """Send alert to Discord"""
        try:
            # Create Discord embed
            embed = {
                "title": f"🚨 {alert_data['title']}",
                "description": alert_data['description'],
                "color": self._get_color(alert_data['severity']),
                "timestamp": datetime.utcnow().isoformat(),
                "fields": [
                    {
                        "name": "Contract",
                        "value": f"`{alert_data['contract_address']}`",
                        "inline": True
                    },
                    {
                        "name": "Severity",
                        "value": alert_data['severity'].title(),
                        "inline": True
                    },
                    {
                        "name": "Rule",
                        "value": alert_data['rule_name'],
                        "inline": True
                    }
                ],
                "footer": {
                    "text": "Canary Contract Guardian",
                    "icon_url": "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bird/3D/bird_3d.png"
                }
            }
            
            payload = {
                "username": "Canary Guardian",
                "embeds": [embed]
            }
            
            response = requests.post(
                self.webhook_url,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 204:
                logger.info(f"Discord alert sent successfully: {alert_data['title']}")
                return True
            else:
                logger.error(f"Discord webhook failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending Discord alert: {e}")
            return False
    
    def _get_color(self, severity: str) -> int:
        """Get Discord embed color based on severity"""
        colors = {
            "danger": 0xDC2626,    # Red
            "warning": 0xF59E0B,   # Orange
            "info": 0x3B82F6       # Blue
        }
        return colors.get(severity, 0x6B7280)  # Default gray

# Initialize Discord notifier
discord_notifier = DiscordNotifier(DISCORD_WEBHOOK_URL)

# ============================================================================
# MONITORING RULES (3 HARDCODED RULES)
# ============================================================================

class MonitoringRules:
    """3 hardcoded monitoring rules as per MVP spec"""
    
    @staticmethod
    async def check_balance_drop(contract_id: str, current_balance: float, 
                               previous_balance: float) -> Optional[Dict]:
        """Rule 1: Alert when balance drops > 50%"""
        if previous_balance == 0:
            return None
            
        drop_percentage = (previous_balance - current_balance) / previous_balance
        
        if drop_percentage > BALANCE_DROP_THRESHOLD:
            return {
                "rule_id": 1,
                "rule_name": "Balance Drop Alert",
                "title": "Large Balance Drop Detected",
                "description": f"Balance decreased by {drop_percentage:.1%} in recent monitoring cycle",
                "severity": "danger",
                "data": {
                    "previous_balance": previous_balance,
                    "current_balance": current_balance,
                    "drop_percentage": drop_percentage
                }
            }
        return None
    
    @staticmethod
    async def check_transaction_volume(contract_id: str, transactions: List[Dict]) -> Optional[Dict]:
        """Rule 2: Alert when transaction count > 10 in 1 hour"""
        current_time = time.time()
        one_hour_ago = current_time - TRANSACTION_TIME_WINDOW
        
        recent_transactions = [
            tx for tx in transactions 
            if tx.get('timestamp', 0) > one_hour_ago
        ]
        
        if len(recent_transactions) > TRANSACTION_VOLUME_LIMIT:
            return {
                "rule_id": 2,
                "rule_name": "High Transaction Volume",
                "title": "Unusual Transaction Activity",
                "description": f"Detected {len(recent_transactions)} transactions in the last hour (limit: {TRANSACTION_VOLUME_LIMIT})",
                "severity": "warning",
                "data": {
                    "transaction_count": len(recent_transactions),
                    "time_window": "1 hour",
                    "threshold": TRANSACTION_VOLUME_LIMIT
                }
            }
        return None
    
    @staticmethod
    async def check_function_calls(contract_id: str, recent_calls: List[Dict]) -> Optional[Dict]:
        """Rule 3: Alert when new function is added to contract"""
        # Simplified implementation - check for unusual function calls
        current_time = time.time()
        one_hour_ago = current_time - 3600
        
        recent_function_calls = [
            call for call in recent_calls 
            if call.get('timestamp', 0) > one_hour_ago and 
               call.get('type') == 'function_call'
        ]
        
        # Check for admin functions or new function patterns
        suspicious_functions = ['upgrade', 'admin', 'owner', 'destroy', 'migrate']
        
        for call in recent_function_calls:
            function_name = call.get('function_name', '').lower()
            if any(sus_func in function_name for sus_func in suspicious_functions):
                return {
                    "rule_id": 3,
                    "rule_name": "Suspicious Function Call",
                    "title": "Potentially Dangerous Function Called",
                    "description": f"Function '{call.get('function_name')}' was called recently",
                    "severity": "warning",
                    "data": {
                        "function_name": call.get('function_name'),
                        "caller": call.get('caller', 'unknown'),
                        "timestamp": call.get('timestamp')
                    }
                }
        return None

monitoring_rules = MonitoringRules()

# ============================================================================
# CONTRACT MONITORING LOGIC
# ============================================================================

class ContractMonitor:
    """Main contract monitoring logic"""
    
    def __init__(self):
        self.monitoring_active = False
        
    async def start_monitoring(self):
        """Start the monitoring loop"""
        self.monitoring_active = True
        logger.info("🐦 Canary Contract Guardian monitoring started")
        
        while self.monitoring_active:
            try:
                await self.monitor_contracts()
                await asyncio.sleep(MONITORING_INTERVAL)
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retry
    
    async def monitor_contracts(self):
        """Monitor all contracts for rule violations"""
        try:
            # Get contracts from canister
            contracts = await canister_client.get_contracts()
            
            if not contracts:
                logger.info("No contracts to monitor")
                return
            
            logger.info(f"Monitoring {len(contracts)} contracts...")
            
            for contract in contracts:
                await self.check_contract_rules(contract)
                
        except Exception as e:
            logger.error(f"Error monitoring contracts: {e}")
    
    async def check_contract_rules(self, contract: Dict):
        """Check all rules for a specific contract"""
        try:
            contract_id = str(contract.get('id', ''))
            contract_address = contract.get('address', '')
            
            logger.info(f"Checking rules for contract: {contract_address}")
            
            # Simulate contract data fetching (MVP: use mock data)
            contract_data_result = await self.fetch_contract_data(contract_address)
            
            if not contract_data_result:
                logger.warning(f"Could not fetch data for contract {contract_address}")
                return
            
            # Check Rule 1: Balance Drop
            await self.check_rule_1_balance(contract, contract_data_result)
            
            # Check Rule 2: Transaction Volume  
            await self.check_rule_2_transactions(contract, contract_data_result)
            
            # Check Rule 3: Function Calls
            await self.check_rule_3_functions(contract, contract_data_result)
            
        except Exception as e:
            logger.error(f"Error checking rules for contract {contract.get('address', '')}: {e}")
    
    async def fetch_contract_data(self, contract_address: str) -> Optional[Dict]:
        """Fetch contract data (MVP: simulated data)"""
        try:
            # MVP: Return simulated data for demo
            import random
            
            # Simulate realistic contract data
            current_time = time.time()
            
            # Generate some variance for demo purposes
            base_balance = 1000.0
            balance_variance = random.uniform(0.8, 1.2)  # ±20% variance
            current_balance = base_balance * balance_variance
            
            # Simulate transaction count
            transaction_count = random.randint(0, 15)  # Sometimes exceed limit for demo
            
            return {
                "balance": current_balance,
                "transaction_count": transaction_count,
                "recent_transactions": [
                    {
                        "timestamp": current_time - (i * 300),  # Every 5 minutes
                        "amount": random.uniform(1, 100),
                        "type": "transfer"
                    }
                    for i in range(transaction_count)
                ],
                "function_calls": [
                    {
                        "timestamp": current_time - 1800,  # 30 minutes ago
                        "function_name": "transfer",
                        "caller": "user123",
                        "type": "function_call"
                    }
                ],
                "last_updated": current_time
            }
            
        except Exception as e:
            logger.error(f"Error fetching contract data: {e}")
            return None
    
    async def check_rule_1_balance(self, contract: Dict, data: Dict):
        """Check balance drop rule"""
        try:
            contract_id = str(contract.get('id', ''))
            current_balance = data.get('balance', 0)
            previous_balance = contract_data.last_balances.get(contract_id, current_balance)
            
            alert = await monitoring_rules.check_balance_drop(
                contract_id, current_balance, previous_balance
            )
            
            if alert:
                await self.handle_alert(contract, alert)
            
            # Update stored balance
            contract_data.last_balances[contract_id] = current_balance
            
        except Exception as e:
            logger.error(f"Error checking balance rule: {e}")
    
    async def check_rule_2_transactions(self, contract: Dict, data: Dict):
        """Check transaction volume rule"""
        try:
            contract_id = str(contract.get('id', ''))
            transactions = data.get('recent_transactions', [])
            
            alert = await monitoring_rules.check_transaction_volume(contract_id, transactions)
            
            if alert:
                await self.handle_alert(contract, alert)
                
        except Exception as e:
            logger.error(f"Error checking transaction rule: {e}")
    
    async def check_rule_3_functions(self, contract: Dict, data: Dict):
        """Check function call rule"""
        try:
            contract_id = str(contract.get('id', ''))
            function_calls = data.get('function_calls', [])
            
            alert = await monitoring_rules.check_function_calls(contract_id, function_calls)
            
            if alert:
                await self.handle_alert(contract, alert)
                
        except Exception as e:
            logger.error(f"Error checking function rule: {e}")
    
    async def handle_alert(self, contract: Dict, alert: Dict):
        """Handle triggered alert"""
        try:
            contract_id = contract.get('id', 0)
            contract_address = contract.get('address', '')
            contract_nickname = contract.get('nickname', 'Unknown Contract')
            
            logger.warning(f"🚨 ALERT: {alert['title']} for contract {contract_address}")
            
            # Create alert in canister
            success = await canister_client.create_alert(
                contract_id=contract_id,
                rule_id=alert['rule_id'],
                title=alert['title'],
                description=alert['description'],
                severity=alert['severity']
            )
            
            if success:
                logger.info("Alert stored in canister successfully")
            
            # Send Discord notification
            discord_alert = {
                "title": alert['title'],
                "description": alert['description'],
                "severity": alert['severity'],
                "contract_address": contract_address,
                "contract_nickname": contract_nickname,
                "rule_name": alert['rule_name'],
                "timestamp": datetime.utcnow().isoformat()
            }
            
            discord_success = await discord_notifier.send_alert(discord_alert)
            
            if discord_success:
                logger.info("Discord alert sent successfully")
            
            # Update contract status in canister
            new_status = "critical" if alert['severity'] == "danger" else "warning"
            await canister_client.update_contract_status(contract_id, new_status)
            
        except Exception as e:
            logger.error(f"Error handling alert: {e}")
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.monitoring_active = False
        logger.info("Monitoring stopped")

# Initialize monitor
contract_monitor = ContractMonitor()

# ============================================================================
# AGENT EVENT HANDLERS
# ============================================================================

@agent.on_event("startup")
async def startup_handler(ctx: Context):
    """Agent startup handler"""
    logger.info(f"🐦 Canary Contract Guardian Agent starting...")
    logger.info(f"Agent address: {agent.address}")
    logger.info(f"Monitoring canister: {CANISTER_ID}")
    
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
        
        # Create demo alert data
        demo_alert = {
            "title": "Demo Alert: High Transaction Volume",
            "description": "This is a test alert generated for demonstration purposes",
            "severity": "warning",
            "contract_address": "rdmx6-jaaaa-aaaah-qcaiq-cai",
            "contract_nickname": "Demo Contract",
            "rule_name": "High Transaction Volume",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Send to Discord
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
    print("=" * 50)
    
    # For demo: uncomment to test Discord webhook
    # asyncio.run(test_demo_alert())
    
    # Start the agent
    agent.run()