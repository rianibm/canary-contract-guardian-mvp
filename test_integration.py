#!/usr/bin/env python3
"""
Test script for the frontend-agent integration
"""

import requests
import json

API_BASE = "http://127.0.0.1:8000"

def test_api_bridge():
    """Test the API bridge endpoints"""
    
    print("🧪 Testing Canary Guardian API Bridge Integration")
    print("=" * 50)
    
    # Test 1: Health check
    print("1. Testing health check...")
    try:
        response = requests.get(f"{API_BASE}/")
        if response.status_code == 200:
            print("✅ API Bridge is running")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Cannot connect to API bridge: {e}")
        print("   Make sure to run: python3 fetch/api_bridge.py")
        return
    
    print()
    
    # Test 2: Agent status
    print("2. Testing agent status...")
    try:
        response = requests.get(f"{API_BASE}/status")
        if response.status_code == 200:
            print("✅ Agent status endpoint working")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Status check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Status check error: {e}")
    
    print()
    
    # Test 3: Chat functionality
    test_messages = [
        "help",
        "monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai",
        "status",
        "check this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai for unusual activity"
    ]
    
    print("3. Testing chat functionality...")
    for i, message in enumerate(test_messages, 1):
        print(f"   3.{i} Testing: '{message}'")
        try:
            response = requests.post(
                f"{API_BASE}/chat",
                json={"message": message},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Success")
                print(f"   📝 Response preview: {result['response'][:100]}...")
            else:
                print(f"   ❌ Failed: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        print()
    
    # Test 4: Monitoring status
    print("4. Testing monitoring status...")
    try:
        response = requests.get(f"{API_BASE}/monitoring-status")
        if response.status_code == 200:
            result = response.json()
            print("✅ Monitoring status endpoint working")
            print(f"   Contracts: {len(result.get('contracts', []))}")
            print(f"   Stats: {result.get('stats', {})}")
        else:
            print(f"❌ Monitoring status failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Monitoring status error: {e}")
    
    print()
    print("🎉 Integration test complete!")
    print()
    print("Next steps:")
    print("1. Start the frontend: cd ic/src/frontend && npm start")
    print("2. Open http://localhost:3000")
    print("3. Click 'Chat with AI Agent' button")
    print("4. Try natural language commands!")

if __name__ == "__main__":
    test_api_bridge()
