import time
from typing import Dict, List, Optional

class ContractData:
    def __init__(self):
        self.contracts: Dict[str, Dict] = {}
        self.last_balances: Dict[str, float] = {}
        self.transaction_history: Dict[str, List] = {}
        self.last_check_time = time.time()
    
    def add_contract(self, contract_id: str, nickname: str):
        """Add a new contract to monitor"""
        self.contracts[contract_id] = {
            'id': contract_id,
            'nickname': nickname,
            'added_at': time.time(),
            'status': 'healthy',
            'last_check': time.time()
        }
        if contract_id not in self.transaction_history:
            self.transaction_history[contract_id] = []
        if contract_id not in self.last_balances:
            self.last_balances[contract_id] = 0
    
    def get_all_contracts(self) -> Dict[str, str]:
        """Get all monitored contracts as {contract_id: nickname} mapping"""
        return {contract_id: data['nickname'] for contract_id, data in self.contracts.items()}
    
    def remove_contract(self, contract_id: str) -> bool:
        """Remove a contract from monitoring"""
        if contract_id in self.contracts:
            del self.contracts[contract_id]
            if contract_id in self.last_balances:
                del self.last_balances[contract_id]
            if contract_id in self.transaction_history:
                del self.transaction_history[contract_id]
            return True
        return False
    
    def update_contract(self, contract_id: str, data: Dict):
        self.contracts[contract_id] = data
    
    def get_contract(self, contract_id: str) -> Optional[Dict]:
        return self.contracts.get(contract_id)
    
    def add_transaction(self, contract_id: str, transaction: Dict):
        if contract_id not in self.transaction_history:
            self.transaction_history[contract_id] = []
        self.transaction_history[contract_id].append(transaction)
        cutoff_time = time.time() - 86400
        self.transaction_history[contract_id] = [
            tx for tx in self.transaction_history[contract_id]
            if tx.get('timestamp', 0) > cutoff_time
        ]
