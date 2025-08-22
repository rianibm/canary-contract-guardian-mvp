#!/usr/bin/env python3
"""
Dummy Contract Testing Script

This script helps test the monitoring system by interacting with the dummy contract
and triggering various scenarios that should generate alerts.
"""

import subprocess
import time
import json

class DummyContractTester:
    def __init__(self, dummy_canister_id="u6s2n-gx777-77774-qaaba-cai", backend_canister_id="uxrrr-q7777-77774-qaaaq-cai"):
        self.dummy_id = dummy_canister_id
        self.backend_id = backend_canister_id
    
    def run_dfx_command(self, command_args):
        """Run a dfx command and return the result"""
        try:
            result = subprocess.run(
                ["dfx", "canister", "call"] + command_args, 
                capture_output=True, 
                text=True,
                cwd="./ic"  # Run from ic directory relative to project root
            )
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                print(f"Error: {result.stderr}")
                return None
        except Exception as e:
            print(f"Command failed: {e}")
            return None
    
    def get_contract_info(self):
        """Get current contract information"""
        result = self.run_dfx_command([self.dummy_id, "getContractInfo"])
        print(f"📊 Contract Info: {result}")
        return result
    
    def reset_contract(self):
        """Reset contract to initial state"""
        result = self.run_dfx_command([self.dummy_id, "resetContract"])
        print(f"🔄 Reset: {result}")
        return result
    
    def simulate_balance_drop(self):
        """Simulate a large balance drop (should trigger alert)"""
        print("🚨 Simulating Balance Drop (60% decrease)...")
        result = self.run_dfx_command([self.dummy_id, "simulateBalanceDrop"])
        print(f"📉 Result: {result}")
        return result
    
    def simulate_high_activity(self):
        """Simulate high transaction activity (should trigger alert)"""
        print("🚨 Simulating High Activity (15 transactions)...")
        result = self.run_dfx_command([self.dummy_id, "simulateHighActivity"])
        print(f"📈 Result: {result}")
        return result
    
    def simulate_emergency_withdraw(self):
        """Simulate emergency withdraw (should trigger alert)"""
        print("🚨 Simulating Emergency Withdraw...")
        result = self.run_dfx_command([self.dummy_id, "emergencyWithdraw"])
        print(f"💸 Result: {result}")
        return result
    
    def simulate_upgrade_mode(self):
        """Simulate contract upgrade (should trigger alert)"""
        print("🚨 Simulating Upgrade Mode...")
        result = self.run_dfx_command([self.dummy_id, "startUpgrade"])
        print(f"🔧 Result: {result}")
        time.sleep(2)
        result = self.run_dfx_command([self.dummy_id, "finishUpgrade"])
        print(f"✅ Upgrade finished: {result}")
        return result
    
    def add_contract_to_monitoring(self):
        """Add the dummy contract to the monitoring system"""
        print("📝 Adding dummy contract to monitoring...")
        result = self.run_dfx_command([
            self.backend_id, 
            "addContract", 
            f'("{self.dummy_id}", "Dummy Test Contract")'
        ])
        print(f"✅ Added to monitoring: {result}")
        return result
    
    def get_monitored_contracts(self):
        """Get list of contracts being monitored"""
        result = self.run_dfx_command([self.backend_id, "getContracts"])
        print(f"📋 Monitored Contracts: {result}")
        return result
    
    def run_test_scenario(self):
        """Run a complete test scenario"""
        print("🧪 Running Complete Test Scenario")
        print("=" * 50)
        
        # Step 1: Reset and check initial state
        print("\n1️⃣ Resetting contract...")
        self.reset_contract()
        self.get_contract_info()
        
        # Step 2: Add to monitoring
        print("\n2️⃣ Adding to monitoring system...")
        self.add_contract_to_monitoring()
        self.get_monitored_contracts()
        
        # Step 3: Normal operation
        print("\n3️⃣ Normal operations...")
        self.run_dfx_command([self.dummy_id, "transfer", "(50000)"])
        self.run_dfx_command([self.dummy_id, "deposit", "(25000)"])
        self.get_contract_info()
        
        # Step 4: Test alert scenarios
        print("\n4️⃣ Testing alert scenarios...")
        
        print("\n   🔥 Balance Drop Test:")
        self.simulate_balance_drop()
        self.get_contract_info()
        time.sleep(3)
        
        print("\n   🔥 High Activity Test:")
        self.simulate_high_activity()
        self.get_contract_info()
        time.sleep(3)
        
        print("\n   🔥 Emergency Withdraw Test:")
        self.simulate_emergency_withdraw()
        self.get_contract_info()
        time.sleep(3)
        
        print("\n   🔥 Upgrade Mode Test:")
        self.simulate_upgrade_mode()
        self.get_contract_info()
        
        print("\n✅ Test scenario completed!")
        print("Check your Discord channel for alerts!")

def main():
    import sys
    
    tester = DummyContractTester()
    
    # Check if we have command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        print(f"🐦 Running command: {command}")
        
        if command == "info":
            tester.get_contract_info()
        elif command == "reset":
            tester.reset_contract()
        elif command == "balance":
            tester.simulate_balance_drop()
        elif command == "activity":
            tester.simulate_high_activity()
        elif command == "emergency":
            tester.simulate_emergency_withdraw()
        elif command == "upgrade":
            tester.simulate_upgrade_mode()
        elif command == "add":
            tester.add_contract_to_monitoring()
        elif command == "list":
            tester.get_monitored_contracts()
        elif command == "test":
            tester.run_test_scenario()
        else:
            print(f"❌ Unknown command: {command}")
            print("Available commands: info, reset, balance, activity, emergency, upgrade, add, list, test")
        return
    
    print("🐦 Dummy Contract Testing Tool")
    print("=" * 40)
    print("Available commands:")
    print("1. info - Get contract information")
    print("2. reset - Reset contract to initial state")
    print("3. balance - Simulate balance drop")
    print("4. activity - Simulate high activity")
    print("5. emergency - Simulate emergency withdraw")
    print("6. upgrade - Simulate upgrade mode")
    print("7. add - Add contract to monitoring")
    print("8. list - List monitored contracts")
    print("9. test - Run complete test scenario")
    print("0. quit - Exit")
    print("=" * 40)
    print("💡 Tip: You can also run: python3 test_dummy_contract.py <command>")
    print("   Example: python3 test_dummy_contract.py info")
    print("=" * 40)
    
    while True:
        try:
            choice = input("\nEnter command (1-9, 0 to quit): ").strip()
            
            if choice == "0" or choice.lower() == "quit":
                print("👋 Goodbye!")
                break
            elif choice == "1" or choice.lower() == "info":
                tester.get_contract_info()
            elif choice == "2" or choice.lower() == "reset":
                tester.reset_contract()
            elif choice == "3" or choice.lower() == "balance":
                tester.simulate_balance_drop()
            elif choice == "4" or choice.lower() == "activity":
                tester.simulate_high_activity()
            elif choice == "5" or choice.lower() == "emergency":
                tester.simulate_emergency_withdraw()
            elif choice == "6" or choice.lower() == "upgrade":
                tester.simulate_upgrade_mode()
            elif choice == "7" or choice.lower() == "add":
                tester.add_contract_to_monitoring()
            elif choice == "8" or choice.lower() == "list":
                tester.get_monitored_contracts()
            elif choice == "9" or choice.lower() == "test":
                tester.run_test_scenario()
            else:
                print("❌ Invalid choice. Please try again.")
                
        except (KeyboardInterrupt, EOFError):
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            # If we get repeated errors, break the loop
            import sys
            if not sys.stdin.isatty():
                print("❌ Non-interactive environment detected. Exiting...")
                break

if __name__ == "__main__":
    main()
