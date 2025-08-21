import requests
from typing import Dict, List, Optional
import logging
from datetime import datetime

TIMEOUT = 30
logger = logging.getLogger("CanaryAgent")

class CanisterClient:
    def __init__(self, canister_id: str, base_url: str):
        self.canister_id = canister_id
        self.base_url = base_url
        self.session = requests.Session()
    
    async def call_canister(self, method: str, args: Dict = None) -> Optional[Dict]:
        try:
            url = f"{self.base_url}/?canisterId={self.canister_id}"
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
        try:
            result = await self.call_canister("getContracts")
            return result.get("contracts", []) if result else []
        except Exception as e:
            logger.error(f"Error getting contracts: {e}")
            return []
    
    async def create_alert(self, contract_id: int, rule_id: int, title: str, description: str, severity: str) -> bool:
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
