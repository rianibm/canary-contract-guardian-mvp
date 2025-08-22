#!/usr/bin/env python3
"""
Simple Contract Monitor

A simplified monitoring script that actually calls the dummy contract
and triggers alerts when changes are detected.
"""

import subprocess
import time
import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SimpleContractMonitor:
    def __init__(self):
        self.dummy_canister_id = "uzt4z-lp777-77774-qaabq-cai"
        self.backend_canister_id = "uxrrr-q7777-77774-qaaaq-cai"
        self.last_balance = None
        self.last_transaction_count = None
        self.monitoring = True
        
    def run_dfx_command(self, command_args):
        """Run a dfx command and return the result"""
        try:
            result = subprocess.run(
                ["dfx", "canister", "call"] + command_args,
                capture_output=True,
                text=True,
                cwd="./ic"
            )
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                print(f"Error running command: {result.stderr}")
                return None
        except Exception as e:
            print(f"Command failed: {e}")
            return None
    
    def get_contract_info(self):
        """Get current contract information"""
        result = self.run_dfx_command([self.dummy_canister_id, "getContractInfo"])
        if result:
            # Parse the result (this is a simplified parser)
            try:
                # Extract balance and transaction count from the result
                lines = result.split('\n')
                balance = None
                transactions = None
                
                for line in lines:
                    if 'balance =' in line:
                        balance = int(line.split('=')[1].strip().split()[0].replace('_', '').replace(':', ''))
                    elif 'transactions =' in line:
                        transactions = int(line.split('=')[1].strip().split()[0].replace('_', '').replace(':', ''))
                
                return {'balance': balance, 'transactions': transactions}
            except Exception as e:
                print(f"Error parsing contract info: {e}")
                return None
        return None
    
    def create_alert(self, title, description, severity="medium"):
        """Create an alert in the backend system"""
        result = self.run_dfx_command([
            self.backend_canister_id,
            "createAlert",
            f'(3, 1, "{title}", "{description}", "{severity}")'
        ])
        if result:
            print(f"✅ Alert created: {title}")
            return True
        else:
            print(f"❌ Failed to create alert: {title}")
            return False
    
    def check_balance_changes(self, current_balance):
        """Check for significant balance changes"""
        if self.last_balance is not None:
            if current_balance < self.last_balance:
                percentage_drop = ((self.last_balance - current_balance) / self.last_balance) * 100
                if percentage_drop > 50:  # Alert if balance drops more than 50%
                    self.create_alert(
                        "🚨 Significant Balance Drop Detected",
                        f"Balance dropped from {self.last_balance:,} to {current_balance:,} "
                        f"({percentage_drop:.1f}% decrease)",
                        "high"
                    )
                    return True
        return False
    
    def check_high_activity(self, current_transactions):
        """Check for high transaction activity"""
        if self.last_transaction_count is not None:
            transaction_increase = current_transactions - self.last_transaction_count
            if transaction_increase >= 10:  # Alert if 10+ new transactions
                self.create_alert(
                    "🚨 High Transaction Activity Detected",
                    f"Transaction count increased by {transaction_increase} "
                    f"(from {self.last_transaction_count} to {current_transactions})",
                    "medium"
                )
                return True
        return False
    
    def monitor_loop(self):
        """Main monitoring loop"""
        print("🐦 Simple Contract Monitor Starting...")
        print("=" * 50)
        print(f"Monitoring Contract: {self.dummy_canister_id}")
        print(f"Backend System: {self.backend_canister_id}")
        print("=" * 50)
        
        while self.monitoring:
            try:
                # Get current contract information
                contract_info = self.get_contract_info()
                
                if contract_info:
                    current_balance = contract_info['balance']
                    current_transactions = contract_info['transactions']
                    
                    print(f"📊 Contract Status: Balance={current_balance:,}, Transactions={current_transactions}")
                    
                    # Check for alerts
                    alerts_triggered = 0
                    
                    if self.check_balance_changes(current_balance):
                        alerts_triggered += 1
                    
                    if self.check_high_activity(current_transactions):
                        alerts_triggered += 1
                    
                    if alerts_triggered > 0:
                        print(f"🚨 {alerts_triggered} alert(s) triggered!")
                    else:
                        print("✅ All checks passed - no alerts")
                    
                    # Update last known values
                    self.last_balance = current_balance
                    self.last_transaction_count = current_transactions
                
                else:
                    print("❌ Failed to get contract information")
                
                # Wait before next check
                print(f"😴 Waiting 30 seconds for next check...\n")
                time.sleep(30)
                
            except KeyboardInterrupt:
                print("\n🛑 Monitoring stopped by user")
                self.monitoring = False
                break
            except Exception as e:
                print(f"❌ Error in monitoring loop: {e}")
                time.sleep(10)  # Wait a bit before retrying
    
    def test_alert_system(self):
        """Test the alert system"""
        print("🧪 Testing Alert System...")
        result = self.create_alert(
            "🧪 Test Alert",
            "This is a test alert to verify the system is working",
            "info"
        )
        return result

def main():
    monitor = SimpleContractMonitor()
    
    print("🐦 Simple Contract Monitor")
    print("=" * 40)
    print("Commands:")
    print("1. monitor - Start continuous monitoring")
    print("2. test - Test alert system")
    print("3. status - Check current contract status")
    print("4. quit - Exit")
    print("=" * 40)
    
    while True:
        try:
            choice = input("\nEnter command: ").strip().lower()
            
            if choice == "quit" or choice == "q":
                print("👋 Goodbye!")
                break
            elif choice == "monitor" or choice == "1":
                monitor.monitor_loop()
            elif choice == "test" or choice == "2":
                monitor.test_alert_system()
            elif choice == "status" or choice == "3":
                info = monitor.get_contract_info()
                if info:
                    print(f"📊 Current Status: Balance={info['balance']:,}, Transactions={info['transactions']}")
                else:
                    print("❌ Failed to get contract status")
            else:
                print("❌ Invalid command. Try: monitor, test, status, or quit")
                
        except (KeyboardInterrupt, EOFError):
            print("\n👋 Goodbye!")
            break

if __name__ == "__main__":
    main()
