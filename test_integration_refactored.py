#!/usr/bin/env python3
"""
Test the refactored agent that uses the backend canister as single source of truth
"""

import asyncio
import sys
import os

# Add the fetch directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'fetch'))

from agent.canister_client import CanisterClient
from agent.discord_notifier import DiscordNotifier
from agent.monitoring_rules import MonitoringRules
from agent.contract_monitor import ContractMonitor

async def test_canister_integration():
    """Test the integration between agent and backend canister"""
    print("🧪 Testing Agent <-> Backend Canister Integration")
    print("=" * 60)
    
    # Initialize components
    canister_client = CanisterClient("backend", "http://127.0.0.1:4943")
    discord_notifier = DiscordNotifier("https://discord.com/api/webhooks/mock")
    monitoring_rules = MonitoringRules()
    contract_monitor = ContractMonitor(canister_client, discord_notifier, monitoring_rules, 300)
    
    try:
        # Test 1: Health Check
        print("1. Testing canister health check...")
        health = await canister_client.health_check()
        print(f"   Health status: {health.get('status', 'unknown')}")
        
        # Test 2: Add Contract
        print("\n2. Testing add contract...")
        test_contract_id = "rdmx6-jaaaa-aaaah-qcaiq-cai"
        test_nickname = "Test Contract"
        
        success = await canister_client.add_contract_to_canister(test_contract_id, test_nickname)
        print(f"   Add contract result: {'✅ Success' if success else '❌ Failed'}")
        
        # Test 3: Get Contracts
        print("\n3. Testing get contracts...")
        contracts = await canister_client.get_contracts()
        print(f"   Found {len(contracts)} contracts")
        
        for contract in contracts:
            print(f"   - {contract.get('nickname', 'Unknown')} ({contract.get('address', 'N/A')})")
        
        # Test 4: Find Contract by Address
        print("\n4. Testing find contract by address...")
        found_contract = await canister_client.find_contract_by_address(test_contract_id)
        if found_contract:
            print(f"   ✅ Found: {found_contract.get('nickname')} (ID: {found_contract.get('id')})")
        else:
            print("   ❌ Contract not found")
        
        # Test 5: Create Alert
        if found_contract and found_contract.get('id'):
            print("\n5. Testing create alert...")
            alert_success = await canister_client.create_alert(
                contract_id=found_contract.get('id'),
                rule_id=1,
                title="Test Alert",
                description="This is a test alert for integration testing",
                severity="warning"
            )
            print(f"   Create alert result: {'✅ Success' if alert_success else '❌ Failed'}")
        
        # Test 6: Get Contract Data
        print("\n6. Testing get contract data...")
        contract_data = await canister_client.get_contract_data(test_contract_id)
        if contract_data:
            print(f"   ✅ Retrieved data for {contract_data.get('nickname', 'Unknown')}")
            print(f"   Status: {contract_data.get('status', 'N/A')}")
            print(f"   Monitoring: {contract_data.get('monitoring_active', False)}")
        else:
            print("   ❌ Could not retrieve contract data")
        
        # Test 7: Monitor Contracts (single iteration)
        print("\n7. Testing contract monitoring...")
        await contract_monitor.monitor_contracts()
        print("   ✅ Monitoring check completed")
        
        print("\n" + "=" * 60)
        print("🎉 Integration test completed!")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

async def test_agent_commands():
    """Test agent command handlers"""
    print("\n🤖 Testing Agent Command Handlers")
    print("=" * 60)
    
    # Import agent functions
    from agent.agent import (
        handle_monitor_command,
        handle_check_command,
        get_general_anomaly_report,
        handle_stop_monitoring
    )
    
    test_contract = "rdmx6-jaaaa-aaaah-qcaiq-cai"
    
    try:
        # Test monitor command
        print("1. Testing monitor command...")
        monitor_result = await handle_monitor_command(test_contract)
        print(f"   Response: {monitor_result[:100]}...")
        
        # Test check command
        print("\n2. Testing check command...")
        check_result = await handle_check_command(test_contract)
        print(f"   Response: {check_result[:100]}...")
        
        # Test anomaly report
        print("\n3. Testing anomaly report...")
        anomaly_result = await get_general_anomaly_report()
        print(f"   Response: {anomaly_result[:100]}...")
        
        print("\n✅ Command handler tests completed!")
        
    except Exception as e:
        print(f"\n❌ Error testing commands: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🐦 Canary Contract Guardian - Integration Test (Refactored)")
    print("Testing Agent as Client Architecture (Option 1)")
    
    asyncio.run(test_canister_integration())
    asyncio.run(test_agent_commands())
