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
    
    async def call_canister(self, method: str, args: str = "") -> Optional[Dict]:
        """Call a canister method using dfx"""
        try:
            # For the backend canister, use 'backend' as the name
            result = self.run_dfx_command("backend", method, args)
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
                # Extract each record block
                import re
                
                # Find all record blocks
                record_pattern = r'record \{([^}]+(?:\{[^}]*\}[^}]*)*)\}'
                records = re.findall(record_pattern, candid_output)
                
                for record_content in records:
                    contract = {}
                    
                    # Extract fields
                    id_match = re.search(r'id = (\d+)', record_content)
                    if id_match:
                        contract['id'] = int(id_match.group(1))
                    
                    nickname_match = re.search(r'nickname = "([^"]*)"', record_content)
                    if nickname_match:
                        contract['nickname'] = nickname_match.group(1)
                    
                    address_match = re.search(r'address = "([^"]*)"', record_content)
                    if address_match:
                        contract['address'] = address_match.group(1)
                    
                    status_match = re.search(r'status = variant \{ (\w+) \}', record_content)
                    if status_match:
                        contract['status'] = status_match.group(1)
                    
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
