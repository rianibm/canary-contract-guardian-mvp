import time
from typing import Dict, List, Optional

BALANCE_DROP_THRESHOLD = 0.5
TRANSACTION_VOLUME_LIMIT = 10
TRANSACTION_TIME_WINDOW = 3600

class MonitoringRules:
    @staticmethod
    async def check_balance_drop(contract_id: str, current_balance: float, previous_balance: float) -> Optional[Dict]:
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
        current_time = time.time()
        one_hour_ago = current_time - TRANSACTION_TIME_WINDOW
        recent_transactions = [tx for tx in transactions if tx.get('timestamp', 0) > one_hour_ago]
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
        current_time = time.time()
        one_hour_ago = current_time - 3600
        recent_function_calls = [call for call in recent_calls if call.get('timestamp', 0) > one_hour_ago and call.get('type') == 'function_call']
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

    @staticmethod
    async def check_all_rules(contract_id: str, contract_data: Dict) -> List[Dict]:
        """
        Check all monitoring rules against contract data and return any violations
        """
        violations = []
        
        try:
            # Extract data from contract_data for rule checking
            current_balance = contract_data.get('balance', 0.0)
            transaction_count = contract_data.get('transaction_count', 0)
            
            # Mock previous balance for demonstration (in real implementation, this would come from historical data)
            previous_balance = current_balance * 1.1  # Simulate 10% higher previous balance
            
            # Check Balance Drop Rule
            balance_violation = await MonitoringRules.check_balance_drop(
                contract_id, current_balance, previous_balance
            )
            if balance_violation:
                violations.append(balance_violation)
            
            # Check Transaction Volume Rule
            # Mock transaction data for demonstration
            mock_transactions = [
                {"timestamp": time.time() - i * 300, "type": "transfer"} 
                for i in range(transaction_count if transaction_count < 20 else 15)
            ]
            
            volume_violation = await MonitoringRules.check_transaction_volume(
                contract_id, mock_transactions
            )
            if volume_violation:
                violations.append(volume_violation)
            
            # Check Function Calls Rule
            # Mock function call data for demonstration
            mock_function_calls = [
                {
                    "timestamp": time.time() - 1800,  # 30 minutes ago
                    "type": "function_call",
                    "function_name": "transfer",
                    "caller": "user123"
                }
            ]
            
            # Occasionally simulate suspicious function calls for demo
            if hash(contract_id) % 5 == 0:  # 20% chance based on contract ID
                mock_function_calls.append({
                    "timestamp": time.time() - 600,  # 10 minutes ago
                    "type": "function_call", 
                    "function_name": "admin_upgrade",
                    "caller": "admin_user"
                })
            
            function_violation = await MonitoringRules.check_function_calls(
                contract_id, mock_function_calls
            )
            if function_violation:
                violations.append(function_violation)
            
            return violations
            
        except Exception as e:
            # Log error but don't crash - return empty violations list
            import logging
            logger = logging.getLogger("CanaryAgent")
            logger.error(f"Error checking rules for contract {contract_id}: {e}")
            return []
    
    @staticmethod
    def get_all_rule_descriptions() -> List[Dict]:
        """
        Get descriptions of all available monitoring rules
        """
        return [
            {
                "id": 1,
                "name": "Balance Drop Alert",
                "description": f"Triggers when contract balance drops by more than {BALANCE_DROP_THRESHOLD:.0%}",
                "severity": "danger",
                "enabled": True
            },
            {
                "id": 2, 
                "name": "High Transaction Volume",
                "description": f"Triggers when more than {TRANSACTION_VOLUME_LIMIT} transactions occur in {TRANSACTION_TIME_WINDOW//3600} hour(s)",
                "severity": "warning",
                "enabled": True
            },
            {
                "id": 3,
                "name": "Suspicious Function Calls",
                "description": "Triggers when potentially dangerous functions (upgrade, admin, destroy) are called",
                "severity": "warning", 
                "enabled": True
            }
        ]
