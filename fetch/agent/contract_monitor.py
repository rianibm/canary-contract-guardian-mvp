import asyncio
import logging
import time
import random
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger("CanaryAgent")

class ContractMonitor:
    """Main contract monitoring logic"""
    
    def __init__(self, canister_client, discord_notifier, monitoring_rules, contract_data, monitoring_interval=300):
        self.canister_client = canister_client
        self.discord_notifier = discord_notifier
        self.monitoring_rules = monitoring_rules
        self.contract_data = contract_data
        self.monitoring_interval = monitoring_interval
        self.monitoring_active = False
    
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
            contract_id = str(contract.get('id', ''))
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
            
        except Exception as e:
            logger.error(f"Error checking rules for contract {contract.get('address', '')}: {e}")
    
    async def fetch_contract_data(self, contract_address: str) -> Optional[Dict]:
        """Fetch contract data (MVP: simulated data)"""
        try:
            # MVP: Return simulated data for demo
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
            previous_balance = self.contract_data.last_balances.get(contract_id, current_balance)
            
            alert = await self.monitoring_rules.check_balance_drop(
                contract_id, current_balance, previous_balance
            )
            
            if alert:
                await self.handle_alert(contract, alert)
            
            # Update stored balance
            self.contract_data.last_balances[contract_id] = current_balance
            
        except Exception as e:
            logger.error(f"Error checking balance rule: {e}")
    
    async def check_rule_2_transactions(self, contract: Dict, data: Dict):
        """Check transaction volume rule"""
        try:
            contract_id = str(contract.get('id', ''))
            transactions = data.get('recent_transactions', [])
            
            alert = await self.monitoring_rules.check_transaction_volume(contract_id, transactions)
            
            if alert:
                await self.handle_alert(contract, alert)
                
        except Exception as e:
            logger.error(f"Error checking transaction rule: {e}")
    
    async def check_rule_3_functions(self, contract: Dict, data: Dict):
        """Check function call rule"""
        try:
            contract_id = str(contract.get('id', ''))
            function_calls = data.get('function_calls', [])
            
            alert = await self.monitoring_rules.check_function_calls(contract_id, function_calls)
            
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
            success = await self.canister_client.create_alert(
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
            
            discord_success = await self.discord_notifier.send_alert(discord_alert)
            
            if discord_success:
                logger.info("Discord alert sent successfully")
            
            # Update contract status in canister
            new_status = "critical" if alert['severity'] == "danger" else "warning"
            await self.canister_client.update_contract_status(contract_id, new_status)
            
        except Exception as e:
            logger.error(f"Error handling alert: {e}")
    
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
