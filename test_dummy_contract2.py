#!/usr/bin/env python3
"""
Dummy Contract 2 Testing Script

This script helps test the monitoring system by interacting with the second dummy contract
and triggering various scenarios that should generate alerts.

Contract Address: umunu-kh777-77774-qaaca-cai

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

class DummyContract2Tester:
    def __init__(self, dummy_canister_id="umunu-kh777-77774-qaaca-cai", backend_canister_id="uxrrr-q7777-77774-qaaaq-cai"):
        self.dummy_id = dummy_canister_id
        self.backend_id = backend_canister_id
        self.contract_name = "Dummy Test Contract 2"
    
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
        print(f"📊 Contract 2 Info: {result}")
        return result
    
    def reset_contract(self):
        """Reset contract to initial state"""
        result = self.run_dfx_command([self.dummy_id, "resetContract"])
        print(f"🔄 Contract 2 Reset: {result}")
        return result
    
    def simulate_balance_drop(self):
        """Simulate a large balance drop (should trigger alert)"""
        print("🚨 Contract 2: Simulating Balance Drop (60% decrease)...")
        result = self.run_dfx_command([self.dummy_id, "simulateBalanceDrop"])
        print(f"📉 Contract 2 Result: {result}")
        return result
    
    def simulate_high_activity(self):
        """Simulate high transaction activity (should trigger alert)"""
        print("🚨 Contract 2: Simulating High Activity (15 transactions)...")
        result = self.run_dfx_command([self.dummy_id, "simulateHighActivity"])
        print(f"📈 Contract 2 Result: {result}")
        return result
    
    def simulate_emergency_withdraw(self):
        """Simulate emergency withdraw (should trigger alert)"""
        print("🚨 Contract 2: Simulating Emergency Withdraw...")
        result = self.run_dfx_command([self.dummy_id, "emergencyWithdraw"])
        print(f"💸 Contract 2 Result: {result}")
        return result
    
    def simulate_upgrade_mode(self):
        """Simulate contract upgrade (should trigger alert)"""
        print("🚨 Contract 2: Simulating Upgrade Mode...")
        result = self.run_dfx_command([self.dummy_id, "startUpgrade"])
        print(f"🔧 Contract 2 Upgrade Start: {result}")
        time.sleep(2)
        result = self.run_dfx_command([self.dummy_id, "finishUpgrade"])
        print(f"✅ Contract 2 Upgrade Finished: {result}")
        return result
    
    def simulate_reentrancy_attack(self):
        """Simulate reentrancy attack pattern (should trigger alert)"""
        print("🚨 Contract 2: Simulating Reentrancy Attack Pattern...")
        print("   Performing rapid successive function calls...")
        # Make multiple rapid calls to simulate reentrancy
        for i in range(5):
            result = self.run_dfx_command([self.dummy_id, "simulateReentrancyAttack"])
            print(f"   Contract 2 Call {i+1}: {result}")
            time.sleep(0.1)  # Very short delay to simulate rapid calls
        return "Contract 2: Reentrancy pattern simulation completed"
    
    def simulate_flash_loan_attack(self):
        """Simulate flash loan attack pattern (should trigger alert)"""
        print("🚨 Contract 2: Simulating Flash Loan Attack Pattern...")
        
        # Start the flash loan
        print("   Step 1: Initiating flash loan...")
        result = self.run_dfx_command([self.dummy_id, "simulateFlashLoanAttack"])
        print(f"   Contract 2 Flash loan start: {result}")
        
        print("   Step 2: Rapid exploitation transactions...")
        for i in range(6):
            result = self.run_dfx_command([self.dummy_id, "simulateFlashLoanAttack"])
            print(f"   Contract 2 Exploit tx {i+1}: {result}")
            time.sleep(0.15)
        
        return "Contract 2: Flash loan attack pattern simulation completed"
    
    def simulate_price_manipulation(self):
        """Simulate price manipulation scenario"""
        print("🚨 Contract 2: Simulating Price Manipulation Scenario...")
        print("   Creating artificial price volatility...")
        
        # Get initial state
        self.get_contract_info()
        
        # Use the new dedicated price manipulation method
        print("   Triggering extreme price spike...")
        result = self.run_dfx_command([self.dummy_id, "simulatePriceManipulation"])
        print(f"   Contract 2 Price spike: {result}")
        time.sleep(1)
        
        print("   Triggering dramatic price crash...")
        result = self.run_dfx_command([self.dummy_id, "simulatePriceManipulation"])
        print(f"   Contract 2 Price crash: {result}")
        time.sleep(1)
        
        print("   Triggering another price spike...")
        result = self.run_dfx_command([self.dummy_id, "simulatePriceManipulation"])
        print(f"   Contract 2 Second spike: {result}")
        
        print("   Contract 2: Price manipulation pattern completed")
        return "Contract 2: Price manipulation simulation completed"
    
    def simulate_ownership_change(self):
        """Simulate ownership/admin changes"""
        print("🚨 Contract 2: Simulating Ownership/Admin Changes...")
        print("   Triggering ownership change events...")
        
        # Use the new dedicated ownership change method
        for i in range(4):
            result = self.run_dfx_command([self.dummy_id, "simulateOwnershipChange"])
            print(f"   Contract 2 Ownership change {i+1}: {result}")
            time.sleep(1.5)
        
        return "Contract 2: Ownership change simulation completed"
    
    def simulate_custom_security_scenario(self):
        """Simulate a custom security scenario unique to this contract"""
        print("🚨 Contract 2: Custom Security Scenario...")
        print("   Simulating multi-vector attack...")
        
        # Combine multiple attack types in sequence
        print("   Phase 1: Ownership manipulation...")
        self.run_dfx_command([self.dummy_id, "simulateOwnershipChange"])
        time.sleep(1)
        
        print("   Phase 2: Price manipulation during ownership change...")
        self.run_dfx_command([self.dummy_id, "simulatePriceManipulation"])
        time.sleep(1)
        
        print("   Phase 3: Reentrancy attempt...")
        for i in range(3):
            self.run_dfx_command([self.dummy_id, "simulateReentrancyAttack"])
            time.sleep(0.2)
        
        print("   Phase 4: Emergency withdraw during chaos...")
        self.simulate_emergency_withdraw()
        
        print("   Contract 2: Multi-vector attack simulation completed")
        return "Contract 2: Custom security scenario completed"
    
    def test_security_rules(self):
        """Test all new security monitoring rules"""
        print("🛡️ Contract 2: Testing All Security Monitoring Rules")
        print("=" * 50)
        
        # Reset contract first
        print("\n🔄 Resetting Contract 2 for clean test...")
        self.reset_contract()
        
        print("\n🔐 Testing Contract 2 Security Rules:")
        
        print("\n   1️⃣ Enhanced Reentrancy Attack Detection:")
        self.simulate_reentrancy_attack()
        time.sleep(3)
        
        print("\n   2️⃣ Advanced Flash Loan Attack Pattern:")
        self.simulate_flash_loan_attack()
        time.sleep(3)
        
        print("\n   3️⃣ Extreme Price Manipulation Detection:")
        self.simulate_price_manipulation()
        time.sleep(3)
        
        print("\n   4️⃣ Extended Ownership Change Monitoring:")
        self.simulate_ownership_change()
        time.sleep(3)
        
        print("\n   5️⃣ Custom Multi-Vector Attack:")
        self.simulate_custom_security_scenario()
        time.sleep(3)
        
        print("\n✅ Contract 2: Security rules testing completed!")
        print("Check the monitoring system for security alerts from Contract 2!")
        
        return "Contract 2: Security rules test completed"
    
    def add_contract_to_monitoring(self):
        """Add the dummy contract to the monitoring system"""
        print(f"📝 Adding Contract 2 ({self.dummy_id}) to monitoring...")
        result = self.run_dfx_command([
            self.backend_id, 
            "addContract", 
            f'("{self.dummy_id}", "{self.contract_name}")'
        ])
        print(f"✅ Contract 2 Added to monitoring: {result}")
        return result
    
    def get_monitored_contracts(self):
        """Get list of contracts being monitored"""
        result = self.run_dfx_command([self.backend_id, "getContracts"])
        print(f"📋 All Monitored Contracts: {result}")
        return result
    
    def simulate_stress_test(self):
        """Run a stress test with rapid operations"""
        print("⚡ Contract 2: Running Stress Test...")
        print("   Performing rapid operations to test system limits...")
        
        for i in range(10):
            # Alternate between different operations rapidly
            if i % 4 == 0:
                self.run_dfx_command([self.dummy_id, "transfer", "(10000)"])
            elif i % 4 == 1:
                self.run_dfx_command([self.dummy_id, "deposit", "(5000)"])
            elif i % 4 == 2:
                self.run_dfx_command([self.dummy_id, "simulateReentrancyAttack"])
            else:
                self.run_dfx_command([self.dummy_id, "simulatePriceManipulation"])
            
            print(f"   Stress operation {i+1}/10 completed")
            time.sleep(0.3)
        
        print("   Contract 2: Stress test completed!")
        return "Contract 2: Stress test completed"
    
    def run_comparative_test(self):
        """Run tests to compare with Contract 1"""
        print("🆚 Contract 2: Running Comparative Test Scenario")
        print("=" * 50)
        
        # Step 1: Reset and check initial state
        print("\n1️⃣ Resetting Contract 2...")
        self.reset_contract()
        self.get_contract_info()
        
        # Step 2: Add to monitoring
        print("\n2️⃣ Adding Contract 2 to monitoring system...")
        self.add_contract_to_monitoring()
        self.get_monitored_contracts()
        
        # Step 3: Different normal operations than Contract 1
        print("\n3️⃣ Contract 2 normal operations (different pattern)...")
        self.run_dfx_command([self.dummy_id, "transfer", "(75000)"])
        self.run_dfx_command([self.dummy_id, "deposit", "(35000)"])
        self.run_dfx_command([self.dummy_id, "transfer", "(20000)"])
        self.get_contract_info()
        
        # Step 4: Test alert scenarios with different timing
        print("\n4️⃣ Testing Contract 2 alert scenarios...")
        
        print("\n   🔥 Contract 2: Balance Drop Test:")
        self.simulate_balance_drop()
        self.get_contract_info()
        time.sleep(2)
        
        print("\n   🔥 Contract 2: High Activity Test:")
        self.simulate_high_activity()
        self.get_contract_info()
        time.sleep(2)
        
        print("\n   🔥 Contract 2: Emergency Withdraw Test:")
        self.simulate_emergency_withdraw()
        self.get_contract_info()
        time.sleep(2)
        
        print("\n   🔥 Contract 2: Upgrade Mode Test:")
        self.simulate_upgrade_mode()
        self.get_contract_info()
        time.sleep(2)
        
        # Enhanced security tests
        print("\n   🔥 Contract 2: Enhanced Reentrancy Attack Test:")
        self.simulate_reentrancy_attack()
        self.get_contract_info()
        time.sleep(2)
        
        print("\n   🔥 Contract 2: Advanced Flash Loan Attack Test:")
        self.simulate_flash_loan_attack()
        self.get_contract_info()
        time.sleep(2)
        
        print("\n   🔥 Contract 2: Extreme Price Manipulation Test:")
        self.simulate_price_manipulation()
        self.get_contract_info()
        time.sleep(2)
        
        print("\n   🔥 Contract 2: Extended Ownership Change Test:")
        self.simulate_ownership_change()
        self.get_contract_info()
        time.sleep(2)
        
        print("\n   🔥 Contract 2: Multi-Vector Attack Test:")
        self.simulate_custom_security_scenario()
        self.get_contract_info()
        time.sleep(2)
        
        print("\n   ⚡ Contract 2: Stress Test:")
        self.simulate_stress_test()
        self.get_contract_info()
        
        print("\n✅ Contract 2: Comparative test scenario completed!")
        print("Check your Discord channel for alerts from Contract 2!")
        print("Compare alert patterns between Contract 1 and Contract 2!")

def main():
    import sys
    
    tester = DummyContract2Tester()
    
    # Check if we have command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        print(f"🐦 Running Contract 2 command: {command}")
        
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
        elif command == "custom":
            tester.simulate_custom_security_scenario()
        elif command == "security":
            tester.test_security_rules()
        elif command == "stress":
            tester.simulate_stress_test()
        elif command == "add":
            tester.add_contract_to_monitoring()
        elif command == "list":
            tester.get_monitored_contracts()
        elif command == "test":
            tester.run_comparative_test()
        else:
            print(f"❌ Unknown command: {command}")
            print("Available commands: info, reset, balance, activity, emergency, upgrade, reentrancy, flashloan, price, ownership, custom, security, stress, add, list, test")
        return
    
    print("🐦 Dummy Contract 2 Testing Tool")
    print(f"📍 Contract Address: {tester.dummy_id}")
    print("=" * 50)
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
    print("11. custom - Custom multi-vector attack")
    print("12. security - Test all security rules")
    print("13. stress - Run stress test")
    print("14. add - Add contract to monitoring")
    print("15. list - List monitored contracts")
    print("16. test - Run comparative test scenario")
    print("0. quit - Exit")
    print("=" * 50)
    print("💡 Tip: You can also run: python3 test_dummy_contract2.py <command>")
    print("   Example: python3 test_dummy_contract2.py custom")
    print("=" * 50)
    
    while True:
        try:
            choice = input("\nEnter command (1-16, 0 to quit): ").strip()
            
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
            elif choice == "11" or choice.lower() == "custom":
                tester.simulate_custom_security_scenario()
            elif choice == "12" or choice.lower() == "security":
                tester.test_security_rules()
            elif choice == "13" or choice.lower() == "stress":
                tester.simulate_stress_test()
            elif choice == "14" or choice.lower() == "add":
                tester.add_contract_to_monitoring()
            elif choice == "15" or choice.lower() == "list":
                tester.get_monitored_contracts()
            elif choice == "16" or choice.lower() == "test":
                tester.run_comparative_test()
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
