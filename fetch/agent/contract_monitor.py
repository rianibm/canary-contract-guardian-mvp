import asyncio
import logging
import time
import random
import re
import traceback
import os
from typing import Dict, List, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL")

logger = logging.getLogger("CanaryAgent")

class ContractMonitor:
    """Main contract monitoring logic"""
    
    def __init__(self, canister_client, discord_notifier, monitoring_rules, monitoring_interval=300):
        self.canister_client = canister_client
        self.discord_notifier = discord_notifier
        self.monitoring_rules = monitoring_rules
        self.monitoring_interval = monitoring_interval
        self.monitoring_active = False
        self.last_balances: Dict[str, float] = {}
        # Track consecutive 'sus' alerts per contract
        self.sus_event_counters: Dict[str, int] = {}
        self.contract_webhooks = {}
    
    def set_contract_webhook(self, contract_id, webhook_url):
        if webhook_url:
            self.contract_webhooks[contract_id] = webhook_url

    def get_contract_webhook(self, contract_id):
        return self.contract_webhooks.get(contract_id, DISCORD_WEBHOOK_URL)
    
    async def start_monitoring(self):
        """Start the monitoring loop"""
        self.monitoring_active = True
        logger.info("🐦 Canary Contract Guardian monitoring started")
        
        while self.monitoring_active:
            try:
                await self.monitor_contracts()
                await asyncio.sleep(self.monitoring_interval)
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retry
    
    async def monitor_contracts(self):
        """Monitor all contracts for rule violations"""
        try:
            contracts = await self.canister_client.get_contracts()
            
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
            contract_address = contract.get('address', '')
            
            logger.info(f"Checking rules for contract: {contract_address}")
            
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
            
            # Check New Security Rules
            # Rule 4: Reentrancy Attack Detection
            await self.check_rule_4_reentrancy(contract, contract_data_result)
            
            # Rule 5: Flash Loan Attack Pattern
            await self.check_rule_5_flash_loan(contract, contract_data_result)
            
            # Rule 6: Ownership Change Alert
            await self.check_rule_6_ownership(contract, contract_data_result)
            
            # Rule 7: Price Manipulation Alert
            await self.check_rule_7_price_manipulation(contract, contract_data_result)
            
        except Exception as e:
            logger.error(f"Error checking rules for contract {contract.get('address', '')}: {e}")
    
    async def fetch_contract_data(self, contract_address: str) -> Optional[Dict]:
        """Fetch contract data from the actual contract canister"""
        try:
            logger.info(f"Fetching real data for contract: {contract_address}")
            
            # Try to get real contract info from the dummy contract
            result = await self.canister_client.call_canister("getContractInfo", "", canister_name=contract_address)
            
            if result and result.get("status") == "success":
                # Parse the Candid response to extract contract data
                candid_data = result.get("data", "")
                logger.debug(f"Raw contract data: {candid_data}")
                
                # Parse balance, transactions, etc. from Candid format
                contract_data = self.parse_contract_info_from_candid(candid_data)
                
                if contract_data:
                    logger.info(f"✅ Real contract data fetched - Balance: {contract_data.get('balance', 'N/A')}, Transactions: {contract_data.get('transaction_count', 'N/A')}")
                    return contract_data
                else:
                    logger.warning("Could not parse contract data from Candid response")
            
            # Fallback to mock data if real data fetch fails
            logger.warning(f"Failed to fetch real data for {contract_address}, using mock data")
            return self.generate_mock_contract_data()
            
        except Exception as e:
            logger.error(f"Error fetching contract data: {e}")
            # Fallback to mock data
            return self.generate_mock_contract_data()
    
    def parse_contract_info_from_candid(self, candid_output: str) -> Optional[Dict]:
        """Parse contract info from Candid output"""
        try:
            logger.debug(f"Parsing Candid output: {candid_output}")
            
            # Look for the record pattern in Candid output
            if "record {" in candid_output:
                # Extract balance - handle both with and without underscores and type annotations
                balance_match = re.search(r'balance\s*=\s*([0-9_]+)(?:\s*:\s*\w+)?', candid_output)
                if balance_match:
                    balance_str = balance_match.group(1).replace('_', '')  # Remove underscores
                    balance = int(balance_str)
                    logger.info(f"✅ Parsed balance: {balance}")
                else:
                    balance = 1000000
                    logger.warning("Could not parse balance, using default")
                
                # Extract transaction count - handle type annotations
                transactions_match = re.search(r'transactions\s*=\s*([0-9_]+)(?:\s*:\s*\w+)?', candid_output)
                if transactions_match:
                    transaction_str = transactions_match.group(1).replace('_', '')
                    transaction_count = int(transaction_str)
                    logger.info(f"✅ Parsed transaction count: {transaction_count}")
                else:
                    transaction_count = 0
                    logger.warning("Could not parse transaction count, using default")
                
                # Extract last activity - handle type annotations
                last_activity_match = re.search(r'lastActivity\s*=\s*([+-]?[0-9_]+)(?:\s*:\s*\w+)?', candid_output)
                if last_activity_match:
                    activity_str = last_activity_match.group(1).replace('_', '')
                    last_activity = int(activity_str)
                else:
                    last_activity = int(time.time())
                
                # Extract upgrade status
                upgrading_match = re.search(r'isUpgrading\s*=\s*(true|false)', candid_output)
                is_upgrading = upgrading_match.group(1) == 'true' if upgrading_match else False
                
                # Extract NEW security state indicators - handle type annotations
                reentrancy_match = re.search(r'reentrancyCallCount\s*=\s*([0-9_]+)(?:\s*:\s*\w+)?', candid_output)
                reentrancy_count = int(reentrancy_match.group(1).replace('_', '')) if reentrancy_match else 0
                
                flashloan_match = re.search(r'flashLoanActive\s*=\s*(true|false)', candid_output)
                flashloan_active = flashloan_match.group(1) == 'true' if flashloan_match else False
                
                ownership_match = re.search(r'ownershipChangeCount\s*=\s*([0-9_]+)(?:\s*:\s*\w+)?', candid_output)
                ownership_changes = int(ownership_match.group(1).replace('_', '')) if ownership_match else 0
                
                price_match = re.search(r'priceManipulationActive\s*=\s*(true|false)', candid_output)
                price_manipulation = price_match.group(1) == 'true' if price_match else False
                
                current_time = time.time()
                
                # Generate enhanced contract data with attack patterns
                contract_data = {
                    "balance": float(balance),
                    "transaction_count": transaction_count,
                    "last_activity": last_activity,
                    "is_upgrading": is_upgrading,
                    "reentrancy_call_count": reentrancy_count,
                    "flashloan_active": flashloan_active,
                    "ownership_change_count": ownership_changes,
                    "price_manipulation_active": price_manipulation,
                    "recent_transactions": self.generate_enhanced_transactions(transaction_count, flashloan_active, current_time),
                    "function_calls": self.generate_enhanced_function_calls(reentrancy_count, is_upgrading, current_time),
                    "admin_events": self.generate_enhanced_admin_events(ownership_changes, is_upgrading, current_time),
                    "price_data": self.generate_enhanced_price_data(price_manipulation, current_time),
                    "last_updated": current_time
                }
                
                logger.info(f"✅ Enhanced contract data parsed successfully: Balance={contract_data['balance']}, Transactions={contract_data['transaction_count']}, Reentrancy={reentrancy_count}, FlashLoan={flashloan_active}, Ownership={ownership_changes}, Price={price_manipulation}")
                return contract_data
            
            logger.warning("No record pattern found in Candid output")
            return None
            
        except Exception as e:
            logger.error(f"Error parsing contract info from Candid: {e}")
            return None
    
    def generate_enhanced_transactions(self, transaction_count: int, flashloan_active: bool, current_time: float) -> List[Dict]:
        """Generate enhanced transaction data based on contract state"""
        transactions = []
        
        if flashloan_active:
            # Generate flash loan attack pattern
            transactions.append({
                "timestamp": current_time - 300,  # 5 minutes ago
                "amount": 1500000,  # Large flash loan
                "type": "borrow",
                "from": "flash_loan_pool",
                "to": "attacker_contract"
            })
            
            # Add rapid subsequent transactions
            for i in range(4):
                transactions.append({
                    "timestamp": current_time - 240 + (i * 15),  # 15 seconds apart
                    "amount": 50000 + (i * 10000),
                    "type": "transfer",
                    "from": "attacker_contract",
                    "to": f"exploit_target_{i}"
                })
        
        # Add normal transactions
        for i in range(min(transaction_count, 15)):
            transactions.append({
                "timestamp": current_time - (i * 300),  # Every 5 minutes
                "amount": random.uniform(1, 100),
                "type": "transfer",
                "from": "user_wallet",
                "to": "contract"
            })
        
        return transactions
    
    def generate_enhanced_function_calls(self, reentrancy_count: int, is_upgrading: bool, current_time: float) -> List[Dict]:
        """Generate enhanced function call data based on contract state"""
        function_calls = []
        
        if reentrancy_count > 0:
            # Generate reentrancy attack pattern
            for i in range(reentrancy_count):
                function_calls.append({
                    "timestamp": current_time - 60 + (i * 5),  # 5 seconds apart within 1 minute
                    "function_name": "withdraw",
                    "caller": "attacker_contract",
                    "type": "function_call",
                    "recursion_depth": i + 1
                })
        
        if is_upgrading:
            function_calls.append({
                "timestamp": current_time - 1800,  # 30 minutes ago
                "function_name": "admin_upgrade",
                "caller": "admin_user",
                "type": "function_call"
            })
        
        return function_calls
    
    def generate_enhanced_admin_events(self, ownership_changes: int, is_upgrading: bool, current_time: float) -> List[Dict]:
        """Generate enhanced admin event data based on contract state"""
        admin_events = []
        
        if ownership_changes > 0:
            event_types = ["ownership_transferred", "admin_upgrade_initiated", "permissions_modified"]
            for i in range(ownership_changes):
                event_type = event_types[i % len(event_types)]
                admin_events.append({
                    "timestamp": current_time - (900 + i * 300),  # 15 minutes ago, then every 5 minutes
                    "event_type": event_type,
                    "function_name": f"admin_{event_type.split('_')[0]}",
                    "caller": "admin_user",
                    "details": {
                        "old_value": f"old_admin_{i}",
                        "new_value": f"new_admin_{i}"
                    }
                })
        
        if is_upgrading:
            admin_events.append({
                "timestamp": current_time - 900,
                "event_type": "upgrade_started",
                "function_name": "startUpgrade", 
                "caller": "admin_user"
            })
        
        return admin_events
    
    def generate_enhanced_price_data(self, price_manipulation: bool, current_time: float) -> List[Dict]:
        """Generate enhanced price data based on contract state"""
        price_data = []
        base_price = 100.0
        
        for i in range(5):
            timestamp = current_time - (i * 600)  # Every 10 minutes
            
            if price_manipulation and i == 1:
                # Create dramatic price spike
                price = base_price * 1.4  # 40% increase
            elif price_manipulation and i == 2:
                # Create dramatic price crash
                price = base_price * 0.7  # 30% decrease
            else:
                # Normal gradual change
                price = base_price * (1 + (i * 0.02))
            
            price_data.append({
                "timestamp": timestamp,
                "price": price,
                "volume": random.randint(1000, 5000) * (2 if price_manipulation else 1)
            })
        
        return price_data
    
    def generate_mock_contract_data(self) -> Dict:
        """Generate mock contract data as fallback"""
        current_time = time.time()
        
        # Generate some variance for demo purposes
        current_balance = random.uniform(800000, 1200000)  # ±20% variance from 1M
        transaction_count = random.randint(0, 11)  # Sometimes exceed limit for demo
        
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
            "admin_events": [],
            "price_data": [
                {
                    "timestamp": current_time - (i * 600),  # Every 10 minutes
                    "price": 100.0 + (i * 2),  # Gradual price increase
                    "volume": random.randint(1000, 5000)
                }
                for i in range(5)
            ],
            "last_updated": current_time
        }

    def generate_recommendation(self, alert: Dict, contract: Dict, contract_data: Dict) -> str:
        """Generate a recommendation for the alert"""
        try:
            severity = alert.get('severity', '').lower()
            rule_name = alert.get('rule_name', '')
            rule_id = alert.get('rule_id', '')
            contract_nickname = contract.get('nickname', 'Unknown Contract')
            contract_address = contract.get('address', '')
            
            # Get current contract data for context
            balance = contract_data.get('balance', 0)
            transaction_count = contract_data.get('transaction_count', 0)
            reentrancy_count = contract_data.get('reentrancy_call_count', 0)
            flashloan_active = contract_data.get('flashloan_active', False)
            ownership_changes = contract_data.get('ownership_change_count', 0)
            price_manipulation = contract_data.get('price_manipulation_active', False)
            
            # Rule-specific recommendations
            if rule_id == "RULE_001":  # Balance Drop
                if severity == "danger":
                    return f"🚨 CRITICAL: {contract_nickname} balance dropped significantly to {balance:,.0f}. Immediately pause contract, investigate potential drain attack, and verify all recent transactions. Consider emergency withdrawal procedures for remaining funds."
                else:
                    return f"⚠️ WARNING: {contract_nickname} balance declined to {balance:,.0f}. Monitor closely for continued drops, review recent large transactions, and verify contract functionality."
            
            elif rule_id == "RULE_002":  # Transaction Volume
                if severity == "danger":
                    return f"🚨 CRITICAL: {contract_nickname} experiencing abnormal transaction volume ({transaction_count} recent transactions). Immediately review transaction patterns, check for bot activity or coordinated attacks, and consider rate limiting."
                else:
                    return f"⚠️ WARNING: {contract_nickname} has elevated transaction activity ({transaction_count} transactions). Monitor for spam attacks and verify all transactions are legitimate."
            
            elif rule_id == "RULE_003":  # Function Calls
                return f"🔍 ALERT: Suspicious function call pattern detected in {contract_nickname}. Review recent function calls, verify caller authenticity, and check for unauthorized access attempts."
            
            elif rule_id == "RULE_004":  # Reentrancy Attack
                if reentrancy_count > 0:
                    return f"🚨 CRITICAL SECURITY THREAT: Reentrancy attack detected in {contract_nickname} ({reentrancy_count} recursive calls). IMMEDIATELY pause contract, block the attacking address, and conduct full security audit before resuming operations."
                else:
                    return f"🔍 SECURITY ALERT: Potential reentrancy pattern detected in {contract_nickname}. Review function call stack and implement reentrancy guards."
            
            elif rule_id == "RULE_005":  # Flash Loan Attack
                if flashloan_active:
                    return f"🚨 CRITICAL: Flash loan attack in progress on {contract_nickname}. IMMEDIATELY pause contract, freeze affected liquidity pools, and coordinate with DEX partners to prevent further exploitation."
                else:
                    return f"🔍 SECURITY ALERT: Suspicious flash loan pattern detected in {contract_nickname}. Monitor for price manipulation and verify loan repayment."
            
            elif rule_id == "RULE_006":  # Ownership Changes
                if ownership_changes > 0:
                    return f"🚨 CRITICAL: Unauthorized ownership changes detected in {contract_nickname} ({ownership_changes} changes). Verify admin key security, check for compromised accounts, and consider emergency governance procedures."
                else:
                    return f"🔍 GOVERNANCE ALERT: Admin activity detected in {contract_nickname}. Verify all administrative actions are authorized and documented."
            
            elif rule_id == "RULE_007":  # Price Manipulation
                if price_manipulation:
                    return f"🚨 CRITICAL: Price manipulation attack detected in {contract_nickname}. Immediately pause trading, investigate oracle feeds, and coordinate with market makers to restore fair pricing."
                else:
                    return f"⚠️ MARKET ALERT: Unusual price movements in {contract_nickname}. Monitor market conditions and verify oracle accuracy."
            
            # Generic recommendations based on severity
            if severity == "danger":
                return f"🚨 CRITICAL: Immediate action required for {contract_nickname}. Pause contract operations, investigate {rule_name} incident thoroughly, and implement emergency protocols."
            elif severity == "warning":
                return f"⚠️ WARNING: Monitor {contract_nickname} closely for further anomalies related to {rule_name}. Consider increasing monitoring frequency and preparing contingency measures."
            else:
                return f"🔍 INFO: Continue monitoring {contract_nickname} for {rule_name} patterns. No immediate action required but maintain vigilance."
                
        except Exception as e:
            logger.error(f"Error generating AI recommendation: {e}")
            return f"🤖 AI Recommendation: Unable to generate specific recommendation. Please review alert manually and take appropriate action based on severity: {severity}"
    
    async def check_rule_1_balance(self, contract: Dict, data: Dict):
        """Check balance drop rule"""
        try:
            contract_address = contract.get('address', '')
            current_balance = data.get('balance', 0)
            previous_balance = self.last_balances.get(contract_address, current_balance)
            
            alert = await self.monitoring_rules.check_balance_drop(
                contract_address, current_balance, previous_balance
            )
            
            if alert:
                await self.handle_alert(contract, alert)
            
            # Update stored balance
            self.last_balances[contract_address] = current_balance
            
        except Exception as e:
            logger.error(f"Error checking balance rule: {e}")
    
    async def check_rule_2_transactions(self, contract: Dict, data: Dict):
        """Check transaction volume rule"""
        try:
            contract_address = contract.get('address', '')
            transactions = data.get('recent_transactions', [])
            
            alert = await self.monitoring_rules.check_transaction_volume(contract_address, transactions)
            
            if alert:
                await self.handle_alert(contract, alert)
                
        except Exception as e:
            logger.error(f"Error checking transaction rule: {e}")
    
    async def check_rule_3_functions(self, contract: Dict, data: Dict):
        """Check function call rule"""
        try:
            contract_address = contract.get('address', '')
            function_calls = data.get('function_calls', [])
            
            alert = await self.monitoring_rules.check_function_calls(contract_address, function_calls)
            
            if alert:
                await self.handle_alert(contract, alert)
                
        except Exception as e:
            logger.error(f"Error checking function rule: {e}")
    
    async def check_rule_4_reentrancy(self, contract: Dict, data: Dict):
        """Check reentrancy attack detection rule"""
        try:
            contract_address = contract.get('address', '')
            function_calls = data.get('function_calls', [])
            
            alert = await self.monitoring_rules.check_reentrancy_attack(contract_address, function_calls)
            
            if alert:
                await self.handle_alert(contract, alert)
                
        except Exception as e:
            logger.error(f"Error checking reentrancy rule: {e}")
    
    async def check_rule_5_flash_loan(self, contract: Dict, data: Dict):
        """Check flash loan attack pattern rule"""
        try:
            contract_address = contract.get('address', '')
            transactions = data.get('recent_transactions', [])
            
            alert = await self.monitoring_rules.check_flash_loan_attack(contract_address, transactions)
            
            if alert:
                await self.handle_alert(contract, alert)
                
        except Exception as e:
            logger.error(f"Error checking flash loan rule: {e}")
    
    async def check_rule_6_ownership(self, contract: Dict, data: Dict):
        """Check ownership change alert rule"""
        try:
            contract_address = contract.get('address', '')
            admin_events = data.get('admin_events', [])
            
            alert = await self.monitoring_rules.check_ownership_change(contract_address, admin_events)
            
            if alert:
                await self.handle_alert(contract, alert)
                
        except Exception as e:
            logger.error(f"Error checking ownership rule: {e}")
    
    async def check_rule_7_price_manipulation(self, contract: Dict, data: Dict):
        """Check price manipulation alert rule"""
        try:
            contract_address = contract.get('address', '')
            price_data = data.get('price_data', [])
            
            alert = await self.monitoring_rules.check_price_manipulation(contract_address, price_data)
            
            if alert:
                await self.handle_alert(contract, alert)
                
        except Exception as e:
            logger.error(f"Error checking price manipulation rule: {e}")
    
    async def handle_alert(self, contract: Dict, alert: Dict):
        """Handle triggered alert and pause contract after 5 consecutive 'sus' events"""
        try:
            contract_id = contract.get('id', 0)
            contract_address = contract.get('address', '')
            contract_nickname = contract.get('nickname', 'Unknown Contract')

            logger.warning(f"🚨 ALERT TRIGGERED: {alert['title']} for contract {contract_address}")
            logger.info(f"   Rule ID: {alert['rule_id']}")
            logger.info(f"   Rule Name: {alert['rule_name']}")
            logger.info(f"   Severity: {alert['severity']}")
            logger.info(f"   Description: {alert['description']}")

            # Fetch latest contract data for AI recommendation
            contract_data = await self.fetch_contract_data(contract_address)
            if not contract_data:
                contract_data = {}

            # Generate AI recommendation
            recommendation = self.generate_recommendation(alert, contract, contract_data)
            logger.info(f"   🤖 Recommendation: {recommendation}")

            # Track consecutive 'danger' events and freeze contract after 5
            if alert.get('severity', '').lower() == 'danger':
                self.sus_event_counters[contract_address] = self.sus_event_counters.get(contract_address, 0) + 1
                logger.info(f"Consecutive 'sus' events for {contract_address}: {self.sus_event_counters[contract_address]}")
                if self.sus_event_counters[contract_address] >= 5:
                    logger.warning(f"5 consecutive 'sus' events detected for {contract_address}. Triggering pauseContract (freeze).")
                    # This will freeze the contract in the backend canister
                    try:
                        pause_result = await self.canister_client.pause_contract(contract_id)
                        if pause_result:
                            logger.info(f"✅ pauseContract called successfully for contract {contract_address} (contract is now frozen)")
                        else:
                            logger.error(f"❌ pauseContract failed for contract {contract_address}")
                    except Exception as e:
                        logger.error(f"❌ Error calling pauseContract: {e}")
                    self.sus_event_counters[contract_address] = 0  # Reset counter after pausing
            else:
                self.sus_event_counters[contract_address] = 0  # Reset if not 'sus'

            # Create alert in canister
            try:
                success = await self.canister_client.create_alert(
                    contract_id=contract_id,
                    rule_id=alert['rule_id'],
                    title=alert['title'],
                    description=alert['description'],
                    severity=alert['severity']
                )
                if success:
                    logger.info("✅ Alert stored in canister successfully")
                else:
                    logger.error("❌ Failed to store alert in canister")
            except Exception as e:
                logger.error(f"❌ Error storing alert in canister: {e}")

            # Send Discord notification
            try:
                discord_alert = {
                    "title": alert['title'],
                    "description": alert['description'],
                    "severity": alert['severity'],
                    "contract_address": contract_address,
                    "contract_nickname": contract_nickname,
                    "rule_name": alert['rule_name'],
                    "recommendation": recommendation,
                    "timestamp": datetime.utcnow().isoformat()
                }
                logger.info("📢 Sending Discord alert...")
                webhook_url = self.get_contract_webhook(str(contract.get('address', '')))
                discord_notifier = self.discord_notifier

                if webhook_url != DISCORD_WEBHOOK_URL:
                    from agent.discord_notifier import DiscordNotifier
                    discord_notifier = DiscordNotifier(webhook_url)
                discord_success = await discord_notifier.send_alert(discord_alert)
                 
                if discord_success:
                    logger.info("✅ Discord alert sent successfully")
                else:
                    logger.error("❌ Discord alert failed to send")
            except Exception as e:
                logger.error(f"❌ Error sending Discord alert: {e}")

            # Update contract status in canister
            try:
                new_status = "critical" if alert['severity'] == "danger" else "warning"
                await self.canister_client.update_contract_status(contract_id, new_status)
                logger.info(f"✅ Contract status updated to: {new_status}")
            except Exception as e:
                logger.error(f"❌ Error updating contract status: {e}")

        except Exception as e:
            logger.error(f"❌ Error handling alert: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.monitoring_active = False
        logger.info("Monitoring stopped")

    async def get_status_summary(self) -> str:
        """Get status summary for chat responses"""
        try:
            contracts = await self.canister_client.get_contracts()
            if not contracts:
                return "No contracts are currently being monitored."
            
            status_lines = []
            for contract in contracts:
                nickname = contract.get('nickname', 'Unknown')
                address = contract.get('address', 'N/A')
                status = contract.get('status', 'N/A')
                status_lines.append(f"• {nickname} ({address[:10]}...): {status}")
            
            return f"🐦 Monitoring {len(contracts)} contracts:\n" + "\n".join(status_lines)
        except Exception as e:
            logger.error(f"Error getting status summary: {e}")
            return "Error retrieving contract status."
