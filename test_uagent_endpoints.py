#!/usr/bin/env python3
"""
Test script for the native uAgent REST endpoints
Tests the chat functionality and agent integration
"""

import asyncio
import aiohttp
import json

async def test_uagent_endpoints():
    """Test the uAgent's native REST endpoints"""
    base_url = "http://127.0.0.1:8001"  # Agent's port
    
    test_messages = [
        "Hello!",
        "help",
        "monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai",
        "check this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai",
        "status",
        "stop monitoring rdmx6-jaaaa-aaaah-qcaiq-cai"
    ]
    
    async with aiohttp.ClientSession() as session:
        print("🧪 Testing uAgent Native REST Endpoints")
        print("=" * 50)
        
        # Test health check
        try:
            async with session.get(f"{base_url}/") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Health Check: {data['status']}")
                    print(f"   Service: {data['service']}")
                    print(f"   Agent Address: {data['agent_address'][:20]}...")
                else:
                    print(f"❌ Health Check Failed: {response.status}")
        except Exception as e:
            print(f"❌ Could not connect to uAgent: {e}")
            return
        
        # Test chat messages
        for message in test_messages:
            try:
                payload = {
                    "message": message,
                    "timestamp": "2025-08-23T12:00:00Z"
                }
                
                async with session.post(f"{base_url}/chat", json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"\n📨 Message: {message}")
                        print(f"🤖 Response: {data['response'][:100]}...")
                        print(f"✅ Success: {data['success']}")
                    else:
                        print(f"❌ Chat Error for '{message}': {response.status}")
                        
            except Exception as e:
                print(f"❌ Error testing message '{message}': {e}")
        
        # Test monitoring status
        try:
            async with session.get(f"{base_url}/status") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"\n📊 Monitoring Status:")
                    print(f"   Total Contracts: {data['stats']['totalContracts']}")
                    print(f"   Healthy Contracts: {data['stats']['healthyContracts']}")
                    print(f"   Contracts: {len(data['contracts'])}")
                else:
                    print(f"❌ Monitoring Status Error: {response.status}")
        except Exception as e:
            print(f"❌ Error getting monitoring status: {e}")
        
        # Test start monitoring
        try:
            payload = {
                "contract_id": "rdmx6-jaaaa-aaaah-qcaiq-cai",
                "nickname": "Test Contract"
            }
            
            async with session.post(f"{base_url}/monitor", json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"\n🔍 Start Monitoring:")
                    print(f"   Success: {data['success']}")
                    print(f"   Message: {data['message']}")
                else:
                    print(f"❌ Start Monitoring Error: {response.status}")
        except Exception as e:
            print(f"❌ Error testing start monitoring: {e}")

def main():
    """Main test function"""
    print("🚀 Starting uAgent Native REST API Tests...")
    print("Make sure the agent is running on http://127.0.0.1:8001")
    print("Run it with: python3 fetch/agent/agent.py")
    print()
    
    asyncio.run(test_uagent_endpoints())

if __name__ == "__main__":
    main()
