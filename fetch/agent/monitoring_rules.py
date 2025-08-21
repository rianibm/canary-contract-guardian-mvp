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
