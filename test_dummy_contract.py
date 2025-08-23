#!/usr/bin/env python3
"""
Dummy Contract Testing Script

This script helps test the monitoring system by interacting with the dummy contract
and triggering various scenarios that should generate alerts.

Features:
- Basic contract operations (transfer, deposit, balance checks)
- Traditional monitoring alerts (balance drops, high activity, emergency withdraws)
- Advanced security monitoring tests:
  * Reentrancy attack simulation
  * Flash loan attack pattern detection
  * Price manipulation scenarios
  * Ownership/admin change monitoring
- Complete test scenarios for comprehensive system testing
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
    
    def simulate_reentrancy_attack(self):
        """Simulate reentrancy attack pattern (should trigger alert)"""
        print("🚨 Simulating Reentrancy Attack Pattern...")
        print("   Performing rapid successive function calls...")
        # Make multiple rapid calls to simulate reentrancy
        for i in range(4):
            result = self.run_dfx_command([self.dummy_id, "simulateReentrancyAttack"])
            print(f"   Call {i+1}: {result}")
            time.sleep(0.1)  # Very short delay to simulate rapid calls
        return "Reentrancy pattern simulation completed"
    
    def simulate_flash_loan_attack(self):
        """Simulate flash loan attack pattern (should trigger alert)"""
        print("🚨 Simulating Flash Loan Attack Pattern...")
        
        # Start the flash loan
        print("   Step 1: Initiating flash loan...")
        result = self.run_dfx_command([self.dummy_id, "simulateFlashLoanAttack"])
        print(f"   Flash loan start: {result}")
        
        print("   Step 2: Rapid exploitation transactions...")
        for i in range(4):
            result = self.run_dfx_command([self.dummy_id, "simulateFlashLoanAttack"])
            print(f"   Exploit tx {i+1}: {result}")
            time.sleep(0.2)
        
        return "Flash loan attack pattern simulation completed"
    
    def simulate_price_manipulation(self):
        """Simulate price manipulation scenario"""
        print("🚨 Simulating Price Manipulation Scenario...")
        print("   Creating artificial price volatility...")
        
        # Get initial state
        self.get_contract_info()
        
        # Use the new dedicated price manipulation method
        print("   Triggering price spike...")
        result = self.run_dfx_command([self.dummy_id, "simulatePriceManipulation"])
        print(f"   Price spike: {result}")
        time.sleep(1)
        
        print("   Triggering price crash...")
        result = self.run_dfx_command([self.dummy_id, "simulatePriceManipulation"])
        print(f"   Price crash: {result}")
        
        print("   Price manipulation pattern completed")
        return "Price manipulation simulation completed"
    
    def simulate_ownership_change(self):
        """Simulate ownership/admin changes"""
        print("🚨 Simulating Ownership/Admin Changes...")
        print("   Triggering ownership change events...")
        
        # Use the new dedicated ownership change method
        for i in range(3):
            result = self.run_dfx_command([self.dummy_id, "simulateOwnershipChange"])
            print(f"   Ownership change {i+1}: {result}")
            time.sleep(1)
        
        return "Ownership change simulation completed"
    
    def test_security_rules(self):
        """Test all new security monitoring rules"""
        print("🛡️ Testing All Security Monitoring Rules")
        print("=" * 50)
        
        # Reset contract first
        print("\n🔄 Resetting contract for clean test...")
        self.reset_contract()
        
        print("\n🔐 Testing Security Rules:")
        
        print("\n   1️⃣ Reentrancy Attack Detection:")
        self.simulate_reentrancy_attack()
        time.sleep(2)
        
        print("\n   2️⃣ Flash Loan Attack Pattern:")
        self.simulate_flash_loan_attack()
        time.sleep(2)
        
        print("\n   3️⃣ Price Manipulation Detection:")
        self.simulate_price_manipulation()
        time.sleep(2)
        
        print("\n   4️⃣ Ownership Change Monitoring:")
        self.simulate_ownership_change()
        time.sleep(2)
        
        print("\n✅ Security rules testing completed!")
        print("Check the monitoring system for security alerts!")
        
        return "Security rules test completed"
    
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
        time.sleep(3)
        
        # New security alert tests
        print("\n   🔥 Reentrancy Attack Test:")
        self.simulate_reentrancy_attack()
        self.get_contract_info()
        time.sleep(3)
        
        print("\n   🔥 Flash Loan Attack Test:")
        self.simulate_flash_loan_attack()
        self.get_contract_info()
        time.sleep(3)
        
        print("\n   🔥 Price Manipulation Test:")
        self.simulate_price_manipulation()
        self.get_contract_info()
        time.sleep(3)
        
        print("\n   🔥 Ownership Change Test:")
        self.simulate_ownership_change()
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
        elif command == "reentrancy":
            tester.simulate_reentrancy_attack()
        elif command == "flashloan":
            tester.simulate_flash_loan_attack()
        elif command == "price":
            tester.simulate_price_manipulation()
        elif command == "ownership":
            tester.simulate_ownership_change()
        elif command == "security":
            tester.test_security_rules()
        elif command == "add":
            tester.add_contract_to_monitoring()
        elif command == "list":
            tester.get_monitored_contracts()
        elif command == "test":
            tester.run_test_scenario()
        else:
            print(f"❌ Unknown command: {command}")
            print("Available commands: info, reset, balance, activity, emergency, upgrade, reentrancy, flashloan, price, ownership, security, add, list, test")
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
    print("7. reentrancy - Simulate reentrancy attack")
    print("8. flashloan - Simulate flash loan attack")
    print("9. price - Simulate price manipulation")
    print("10. ownership - Simulate ownership changes")
    print("11. security - Test all security rules")
    print("12. add - Add contract to monitoring")
    print("13. list - List monitored contracts")
    print("14. test - Run complete test scenario")
    print("0. quit - Exit")
    print("=" * 40)
    print("💡 Tip: You can also run: python3 test_dummy_contract.py <command>")
    print("   Example: python3 test_dummy_contract.py reentrancy")
    print("=" * 40)
    
    while True:
        try:
            choice = input("\nEnter command (1-14, 0 to quit): ").strip()
            
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
            elif choice == "7" or choice.lower() == "reentrancy":
                tester.simulate_reentrancy_attack()
            elif choice == "8" or choice.lower() == "flashloan":
                tester.simulate_flash_loan_attack()
            elif choice == "9" or choice.lower() == "price":
                tester.simulate_price_manipulation()
            elif choice == "10" or choice.lower() == "ownership":
                tester.simulate_ownership_change()
            elif choice == "11" or choice.lower() == "security":
                tester.test_security_rules()
            elif choice == "12" or choice.lower() == "add":
                tester.add_contract_to_monitoring()
            elif choice == "13" or choice.lower() == "list":
                tester.get_monitored_contracts()
            elif choice == "14" or choice.lower() == "test":
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
