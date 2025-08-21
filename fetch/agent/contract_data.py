import time
from typing import Dict, List, Optional

class ContractData:
    def __init__(self):
        self.contracts: Dict[str, Dict] = {}
        self.last_balances: Dict[str, float] = {}
        self.transaction_history: Dict[str, List] = {}
        self.last_check_time = time.time()
    
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
