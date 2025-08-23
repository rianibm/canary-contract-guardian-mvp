import time
from typing import Dict, List, Optional

BALANCE_DROP_THRESHOLD = 0.5
TRANSACTION_VOLUME_LIMIT = 10
TRANSACTION_TIME_WINDOW = 3600

# Security monitoring thresholds
REENTRANCY_CALL_LIMIT = 3  # Max recursive calls allowed
FLASH_LOAN_AMOUNT_THRESHOLD = 1000000  # Large loan amount indicator
PRICE_CHANGE_THRESHOLD = 0.3  # 30% price change alert
OWNERSHIP_CHANGE_ALERT = True  # Always alert on ownership changes

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
    async def check_reentrancy_attack(contract_id: str, function_calls: List[Dict]) -> Optional[Dict]:
        """
        Detect potential reentrancy attacks by looking for recursive function calls
        """
        current_time = time.time()
        one_hour_ago = current_time - TRANSACTION_TIME_WINDOW
        recent_calls = [call for call in function_calls if call.get('timestamp', 0) > one_hour_ago]
        
        # Group calls by function name and check for rapid succession calls
        function_call_counts = {}
        for call in recent_calls:
            func_name = call.get('function_name', '')
            if func_name:
                if func_name not in function_call_counts:
                    function_call_counts[func_name] = []
                function_call_counts[func_name].append(call.get('timestamp', 0))
        
        # Check for suspicious patterns (multiple calls to same function in short timeframe)
        for func_name, timestamps in function_call_counts.items():
            if len(timestamps) >= REENTRANCY_CALL_LIMIT:
                # Check if calls happened within a short time window (indicating recursion)
                timestamps.sort()
                time_diff = timestamps[-1] - timestamps[0]
                if time_diff < 60:  # All calls within 1 minute
                    return {
                        "rule_id": 4,
                        "rule_name": "Reentrancy Attack Detection",
                        "title": "Potential Reentrancy Attack Detected",
                        "description": f"Function '{func_name}' called {len(timestamps)} times within 1 minute - possible reentrancy attack",
                        "severity": "danger",
                        "data": {
                            "function_name": func_name,
                            "call_count": len(timestamps),
                            "time_window": f"{time_diff:.1f}s",
                            "timestamps": timestamps
                        }
                    }
        return None

    @staticmethod
    async def check_flash_loan_attack(contract_id: str, transactions: List[Dict]) -> Optional[Dict]:
        """
        Detect potential flash loan attack patterns
        """
        current_time = time.time()
        one_hour_ago = current_time - TRANSACTION_TIME_WINDOW
        recent_transactions = [tx for tx in transactions if tx.get('timestamp', 0) > one_hour_ago]
        
        # Look for patterns: large loan followed by rapid transactions and repayment
        for i, tx in enumerate(recent_transactions):
            amount = tx.get('amount', 0)
            tx_type = tx.get('type', '').lower()
            
            # Check for large transactions that could be flash loans
            if amount > FLASH_LOAN_AMOUNT_THRESHOLD and ('borrow' in tx_type or 'loan' in tx_type):
                # Look for rapid subsequent transactions (typical flash loan pattern)
                subsequent_txs = [
                    t for t in recent_transactions[i+1:] 
                    if t.get('timestamp', 0) - tx.get('timestamp', 0) < 300  # Within 5 minutes
                ]
                
                if len(subsequent_txs) >= 3:  # Multiple rapid transactions after large loan
                    return {
                        "rule_id": 5,
                        "rule_name": "Flash Loan Attack Pattern",
                        "title": "Potential Flash Loan Attack Pattern",
                        "description": f"Large loan of {amount:,.2f} followed by {len(subsequent_txs)} rapid transactions - possible flash loan attack",
                        "severity": "danger",
                        "data": {
                            "loan_amount": amount,
                            "subsequent_transactions": len(subsequent_txs),
                            "loan_timestamp": tx.get('timestamp'),
                            "pattern_detected": True
                        }
                    }
        return None

    @staticmethod
    async def check_ownership_change(contract_id: str, admin_events: List[Dict]) -> Optional[Dict]:
        """
        Monitor changes in contract ownership and permissions
        """
        current_time = time.time()
        one_hour_ago = current_time - TRANSACTION_TIME_WINDOW
        recent_events = [event for event in admin_events if event.get('timestamp', 0) > one_hour_ago]
        
        ownership_keywords = ['owner', 'admin', 'permission', 'role', 'access', 'upgrade', 'migrate']
        
        for event in recent_events:
            event_type = event.get('event_type', '').lower()
            function_name = event.get('function_name', '').lower()
            
            # Check for ownership/permission related changes
            if any(keyword in event_type for keyword in ownership_keywords) or \
               any(keyword in function_name for keyword in ownership_keywords):
                return {
                    "rule_id": 6,
                    "rule_name": "Ownership Change Alert",
                    "title": "Contract Ownership/Permission Change Detected",
                    "description": f"Ownership or permission change detected: {event.get('event_type', 'Unknown event')}",
                    "severity": "warning",
                    "data": {
                        "event_type": event.get('event_type'),
                        "function_name": event.get('function_name'),
                        "caller": event.get('caller', 'Unknown'),
                        "timestamp": event.get('timestamp'),
                        "details": event.get('details', {})
                    }
                }
        return None

    @staticmethod
    async def check_price_manipulation(contract_id: str, price_data: List[Dict]) -> Optional[Dict]:
        """
        Detect abnormal price changes that could indicate manipulation
        """
        if len(price_data) < 2:
            return None
        
        current_time = time.time()
        one_hour_ago = current_time - TRANSACTION_TIME_WINDOW
        recent_prices = [p for p in price_data if p.get('timestamp', 0) > one_hour_ago]
        
        if len(recent_prices) < 2:
            return None
        
        # Sort by timestamp
        recent_prices.sort(key=lambda x: x.get('timestamp', 0))
        
        # Check for sudden price changes
        for i in range(1, len(recent_prices)):
            prev_price = recent_prices[i-1].get('price', 0)
            curr_price = recent_prices[i].get('price', 0)
            
            if prev_price > 0:
                price_change = abs(curr_price - prev_price) / prev_price
                
                if price_change > PRICE_CHANGE_THRESHOLD:
                    direction = "increased" if curr_price > prev_price else "decreased"
                    return {
                        "rule_id": 7,
                        "rule_name": "Price Manipulation Alert",
                        "title": "Abnormal Price Change Detected",
                        "description": f"Price {direction} by {price_change:.1%} in short timeframe - possible manipulation",
                        "severity": "warning",
                        "data": {
                            "previous_price": prev_price,
                            "current_price": curr_price,
                            "change_percentage": price_change,
                            "direction": direction,
                            "time_diff": recent_prices[i].get('timestamp', 0) - recent_prices[i-1].get('timestamp', 0)
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
            
            # Check New Security Rules
            
            # Rule 4: Reentrancy Attack Detection
            reentrancy_violation = await MonitoringRules.check_reentrancy_attack(
                contract_id, mock_function_calls
            )
            if reentrancy_violation:
                violations.append(reentrancy_violation)
            
            # Rule 5: Flash Loan Attack Pattern
            # Add flash loan transaction for demo
            if hash(contract_id) % 7 == 0:  # ~14% chance for demo
                flash_loan_tx = {
                    "timestamp": time.time() - 300,  # 5 minutes ago
                    "amount": 1500000,  # Large amount
                    "type": "borrow"
                }
                mock_transactions.append(flash_loan_tx)
                # Add subsequent rapid transactions
                for j in range(4):
                    mock_transactions.append({
                        "timestamp": time.time() - 250 + (j * 30),  # Rapid succession
                        "amount": 50000 + j * 10000,
                        "type": "transfer"
                    })
            
            flash_loan_violation = await MonitoringRules.check_flash_loan_attack(
                contract_id, mock_transactions
            )
            if flash_loan_violation:
                violations.append(flash_loan_violation)
            
            # Rule 6: Ownership Change Alert
            mock_admin_events = []
            if hash(contract_id) % 8 == 0:  # ~12.5% chance for demo
                mock_admin_events.append({
                    "timestamp": time.time() - 900,  # 15 minutes ago
                    "event_type": "ownership_transferred",
                    "function_name": "transfer_ownership",
                    "caller": "new_admin",
                    "details": {"old_owner": "admin_old", "new_owner": "admin_new"}
                })
            
            ownership_violation = await MonitoringRules.check_ownership_change(
                contract_id, mock_admin_events
            )
            if ownership_violation:
                violations.append(ownership_violation)
            
            # Rule 7: Price Manipulation Alert
            mock_price_data = []
            current_time = time.time()
            base_price = 100.0
            
            # Generate price history
            for k in range(5):
                timestamp = current_time - (k * 600)  # Every 10 minutes
                # Simulate occasional price manipulation for demo
                if hash(contract_id) % 6 == 0 and k == 1:  # ~16% chance at second data point
                    price = base_price * 1.4  # 40% price spike
                else:
                    price = base_price * (1 + (k * 0.02))  # Normal 2% increments
                
                mock_price_data.append({
                    "timestamp": timestamp,
                    "price": price
                })
            
            price_violation = await MonitoringRules.check_price_manipulation(
                contract_id, mock_price_data
            )
            if price_violation:
                violations.append(price_violation)
            
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
            },
            {
                "id": 4,
                "name": "Reentrancy Attack Detection",
                "description": f"Detects potential reentrancy attacks through recursive function calls (limit: {REENTRANCY_CALL_LIMIT} calls/minute)",
                "severity": "danger",
                "enabled": True
            },
            {
                "id": 5,
                "name": "Flash Loan Attack Pattern",
                "description": f"Detects flash loan attack patterns - large loans (>{FLASH_LOAN_AMOUNT_THRESHOLD:,}) followed by rapid transactions",
                "severity": "danger",
                "enabled": True
            },
            {
                "id": 6,
                "name": "Ownership Change Alert",
                "description": "Monitors changes in contract ownership, permissions, and admin functions",
                "severity": "warning",
                "enabled": True
            },
            {
                "id": 7,
                "name": "Price Manipulation Alert",
                "description": f"Detects abnormal price changes (>{PRICE_CHANGE_THRESHOLD:.0%}) that could indicate manipulation",
                "severity": "warning",
                "enabled": True
            }
        ]
