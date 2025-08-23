import subprocess
import json
from typing import Dict, List, Optional
import logging
from datetime import datetime

logger = logging.getLogger("CanaryAgent")

class CanisterClient:
    def __init__(self, canister_id: str, base_url: str):
        self.canister_id = canister_id
        self.base_url = base_url
    
    def run_dfx_command(self, canister_name: str, method: str, args: str = "") -> Optional[str]:
        """Run a dfx canister call command"""
        try:
            cmd = ["dfx", "canister", "call", canister_name, method]
            if args:
                cmd.append(args)
            
            # Get the absolute path to the ic directory
            import os
            current_dir = os.path.dirname(os.path.abspath(__file__))
            ic_dir = os.path.join(os.path.dirname(current_dir), "..", "ic")
            ic_dir = os.path.abspath(ic_dir)
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=ic_dir,
                timeout=30
            )
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                logger.error(f"DFX command failed: {result.stderr}")
                return None
                
        except subprocess.TimeoutExpired:
            logger.error(f"DFX command timed out: {method}")
            return None
        except Exception as e:
            logger.error(f"Error running dfx command {method}: {e}")
            return None
    
    async def call_canister(self, method: str, args: str = "", canister_name: str = "backend") -> Optional[Dict]:
        """Call a canister method using dfx"""
        try:
            # Use the provided canister name, default to 'backend'
            result = self.run_dfx_command(canister_name, method, args)
            if result:
                # Parse the Candid output (this is a simplified parser)
                logger.debug(f"Canister response: {result}")
                return {"status": "success", "data": result}
            return None
        except Exception as e:
            logger.error(f"Error calling canister method {method}: {e}")
            return None
    
    def parse_contracts_from_candid(self, candid_output: str) -> List[Dict]:
        """Parse contracts from Candid output"""
        try:
            contracts = []
            
            # Simple parser for the vec { record { ... } } format
            if "vec {" in candid_output and "record {" in candid_output:
                # Extract each record block - improved regex for nested structures
                import re
                
                # Find all record blocks with better handling of nested structures
                record_pattern = r'record \{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}'
                records = re.findall(record_pattern, candid_output)
                
                for record_content in records:
                    contract = {}
                    
                    # Extract fields with better patterns
                    id_match = re.search(r'id\s*=\s*(\d+)\s*:', record_content)
                    if id_match:
                        contract['id'] = int(id_match.group(1))
                    
                    nickname_match = re.search(r'nickname\s*=\s*"([^"]*)"', record_content)
                    if nickname_match:
                        contract['nickname'] = nickname_match.group(1)
                    
                    address_match = re.search(r'address\s*=\s*"([^"]*)"', record_content)
                    if address_match:
                        contract['address'] = address_match.group(1)
                    
                    status_match = re.search(r'status\s*=\s*variant\s*\{\s*(\w+)\s*\}', record_content)
                    if status_match:
                        contract['status'] = status_match.group(1)
                    
                    # Extract additional fields
                    alert_count_match = re.search(r'alertCount\s*=\s*(\d+)\s*:', record_content)
                    if alert_count_match:
                        contract['alertCount'] = int(alert_count_match.group(1))
                    
                    is_paused_match = re.search(r'isPaused\s*=\s*(true|false)', record_content)
                    if is_paused_match:
                        contract['isPaused'] = is_paused_match.group(1) == 'true'
                    
                    is_active_match = re.search(r'isActive\s*=\s*(true|false)', record_content)
                    if is_active_match:
                        contract['isActive'] = is_active_match.group(1) == 'true'
                    
                    last_check_match = re.search(r'lastCheck\s*=\s*(\d+)\s*:', record_content)
                    if last_check_match:
                        contract['lastCheck'] = int(last_check_match.group(1))
                    
                    added_at_match = re.search(r'addedAt\s*=\s*(\d+)\s*:', record_content)
                    if added_at_match:
                        contract['addedAt'] = int(added_at_match.group(1))
                    
                    if contract:  # Only add if we found some data
                        contracts.append(contract)
            
            return contracts
            
        except Exception as e:
            logger.error(f"Error parsing Candid output: {e}")
            return []
    
    async def get_contracts(self) -> List[Dict]:
        """Get all monitored contracts"""
        try:
            result = await self.call_canister("getContracts")
            if result and result.get("status") == "success":
                logger.debug("Successfully retrieved contracts from canister")
                
                # Parse the Candid output to extract contract data
                contracts_data = result.get("data", "")
                contracts = self.parse_contracts_from_candid(contracts_data)
                
                logger.info(f"Parsed {len(contracts)} contracts from canister")
                return contracts
            return []
        except Exception as e:
            logger.error(f"Error getting contracts: {e}")
            return []
    
    async def add_contract_to_canister(self, address: str, nickname: str) -> bool:
        """Add a contract to the canister for monitoring"""
        try:
            # Escape quotes in the arguments
            escaped_address = address.replace('"', '\\"')
            escaped_nickname = nickname.replace('"', '\\"')
            args = f'("{escaped_address}", "{escaped_nickname}")'
            
            result = await self.call_canister("addContract", args)
            
            if result and result.get("status") == "success":
                logger.debug(f"Successfully added contract {nickname} to canister")
                return True
            else:
                logger.error(f"Failed to add contract to canister: {result}")
                return False
                
        except Exception as e:
            logger.error(f"Error adding contract to canister: {e}")
            return False
    
    async def create_alert(self, contract_id: int, rule_id: int, title: str, description: str, severity: str) -> bool:
        """Create an alert in the canister"""
        try:
            args = f'({contract_id} : nat, {rule_id} : nat, "{title}", "{description}", "{severity}")'
            result = await self.call_canister("createAlert", args)
            return result is not None and result.get("status") == "success"
        except Exception as e:
            logger.error(f"Error creating alert: {e}")
            return False
    
    async def update_contract_status(self, contract_id: int, status: str) -> bool:
        """Update contract status in the canister"""
        try:
            # Convert status to Candid variant format
            status_variant = f"variant {{ {status} }}"
            args = f'({contract_id} : nat, {status_variant})'
            result = await self.call_canister("updateContractStatus", args)
            return result is not None and result.get("status") == "success"
        except Exception as e:
            logger.error(f"Error updating contract status: {e}")
            return False
    
    async def health_check(self) -> Dict:
        """Perform a health check on the canister"""
        try:
            result = await self.call_canister("healthCheck")
            if result and result.get("status") == "success":
                return {"status": "healthy", "timestamp": datetime.now().isoformat()}
            else:
                return {"status": "unhealthy", "timestamp": datetime.now().isoformat()}
        except Exception as e:
            logger.error(f"Error performing health check: {e}")
            return {"status": "error", "timestamp": datetime.now().isoformat(), "error": str(e)}
    
    async def get_contract_data(self, contract_id: str) -> Optional[Dict]:
        """Get data for a specific contract by address or ID"""
        try:
            # First, try to find the contract by address in all contracts
            contracts = await self.get_contracts()
            
            # Look for contract by address
            matching_contract = None
            for contract in contracts:
                if contract.get('address') == contract_id:
                    matching_contract = contract
                    break
            
            if matching_contract:
                logger.debug(f"Found contract with address {contract_id}")
                # Enhance the contract data with additional fields
                return {
                    "id": matching_contract.get('id'),
                    "address": matching_contract.get('address'),
                    "nickname": matching_contract.get('nickname', f"Contract-{contract_id[:8]}"),
                    "status": matching_contract.get('status', 'healthy'),
                    "last_updated": datetime.now().isoformat(),
                    "added_at": matching_contract.get('addedAt'),
                    "last_check": matching_contract.get('lastCheck'),
                    "alert_count": matching_contract.get('alertCount', 0),
                    "balance": 1000000.0,  # Mock balance for demo
                    "transaction_count": 150,  # Mock transaction count for demo
                    "monitoring_active": True
                }
            
            # If not found in monitored contracts, check if it's a valid canister ID format
            if self._is_valid_canister_id(contract_id):
                logger.info(f"Contract {contract_id} not found in monitored contracts, returning mock data")
                # Return mock data for valid canister IDs that aren't being monitored
                return {
                    "id": None,
                    "address": contract_id,
                    "nickname": f"Contract-{contract_id[:8]}",
                    "status": "unmonitored",
                    "last_updated": datetime.now().isoformat(),
                    "balance": self._get_mock_balance(contract_id),
                    "transaction_count": self._get_mock_transaction_count(contract_id),
                    "monitoring_active": False,
                    "can_be_monitored": True
                }
            else:
                logger.warning(f"Invalid canister ID format: {contract_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting contract data for {contract_id}: {e}")
            return None
    
    def _is_valid_canister_id(self, canister_id: str) -> bool:
        """Check if the string matches ICP canister ID format"""
        import re
        # ICP canister ID pattern: 5-5-5-5-3 characters, alphanumeric with hyphens
        pattern = r'^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}$'
        return bool(re.match(pattern, canister_id.lower()))
    
    def _get_mock_balance(self, contract_id: str) -> float:
        """Generate consistent mock balance based on contract ID"""
        # Use hash of contract ID to generate consistent mock data
        hash_val = hash(contract_id) % 10000000
        return float(abs(hash_val)) / 100.0  # Convert to reasonable balance
    
    def _get_mock_transaction_count(self, contract_id: str) -> int:
        """Generate consistent mock transaction count based on contract ID"""
        # Use hash of contract ID to generate consistent mock data
        hash_val = hash(contract_id) % 1000
        return abs(hash_val)
    
    async def find_contract_by_address(self, address: str) -> Optional[Dict]:
        """Find a contract by its address"""
        try:
            contracts = await self.get_contracts()
            for contract in contracts:
                if contract.get('address') == address:
                    return contract
            return None
        except Exception as e:
            logger.error(f"Error finding contract by address {address}: {e}")
            return None
    
    async def clear_all_contracts(self) -> bool:
        """Clear all contracts from the canister"""
        try:
            result = await self.call_canister("clearAllContracts")
            if result and result.get("status") == "success":
                logger.info("Successfully cleared all contracts from canister")
                return True
            else:
                logger.error(f"Failed to clear all contracts: {result}")
                return False
        except Exception as e:
            logger.error(f"Error clearing all contracts: {e}")
            return False
    
    async def get_contract_by_id(self, contract_id: int) -> Optional[Dict]:
        """Get a specific contract by its numeric ID from the canister"""
        try:
            args = f'{contract_id} : nat'
            result = await self.call_canister("getContract", args)
            
            if result and result.get("status") == "success":
                contract_data = result.get("data", "")
                
                # Parse the response for a single contract
                if "record {" in contract_data:
                    contracts = self.parse_contracts_from_candid(contract_data)
                    if contracts:
                        return contracts[0]
                
                logger.debug(f"Contract {contract_id} found but could not parse response")
                return None
            else:
                logger.debug(f"Contract {contract_id} not found in canister")
                return None
                
        except Exception as e:
            logger.error(f"Error getting contract by ID {contract_id}: {e}")
            return None
        """Extract balance information from contract data"""
        try:
            import re
            # Look for balance patterns in the data
            balance_match = re.search(r'balance["\s]*[=:]["\s]*([0-9.]+)', data, re.IGNORECASE)
            if balance_match:
                return float(balance_match.group(1))
            
            # Look for numerical values that might be balances
            number_matches = re.findall(r'\b\d+\.\d+\b|\b\d+\b', data)
            if number_matches:
                # Return the first large number as potential balance
                for num_str in number_matches:
                    num = float(num_str)
                    if num > 0:
                        return num
            
            return 0.0
        except Exception:
            return 0.0
    
    def _extract_transaction_count_from_data(self, data: str) -> int:
        """Extract transaction count from contract data"""
        try:
            import re
            # Look for transaction count patterns
            tx_match = re.search(r'transactions?["\s]*[=:]["\s]*(\d+)', data, re.IGNORECASE)
            if tx_match:
                return int(tx_match.group(1))
            
            # Count occurrences of transaction-like patterns
            tx_patterns = [
                r'transaction',
                r'tx_hash',
                r'call_id',
                r'method_call'
            ]
            
            total_count = 0
            for pattern in tx_patterns:
                matches = re.findall(pattern, data, re.IGNORECASE)
                total_count += len(matches)
            
            return total_count
        except Exception:
            return 0

    async def get_alerts(self) -> List[Dict]:
        """Get alerts from the backend canister"""
        try:
            logger.info("Fetching alerts from backend canister...")
            result = await self.call_canister("getAlerts", "")
            
            if result and result.get("status") == "success":
                alerts_data = result.get("data", "")
                logger.debug(f"Raw alerts data: {alerts_data}")
                
                # Parse the alerts data - this is a simplified parser
                # In a real implementation, you'd parse the Candid format properly
                alerts = []
                
                # For now, return empty list as alerts are stored but not easily retrievable
                # In a production system, you'd implement proper Candid parsing
                return alerts
            else:
                logger.warning("Failed to get alerts from backend canister")
                return []
                
        except Exception as e:
            logger.error(f"Error getting alerts: {e}")
            return []
