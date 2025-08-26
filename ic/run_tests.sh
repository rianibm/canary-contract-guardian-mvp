#!/bin/bash

# Backend Motoko Test Runner Script
# This script runs comprehensive unit tests for the ContractGuardian backend canister

echo "🧪 ContractGuardian Backend Test Suite"
echo "======================================"

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ dfx is not running. Please start dfx with 'dfx start' first."
    exit 1
fi

echo "📦 Deploying canisters..."

# Deploy the backend canister
echo "   → Deploying backend canister..."
dfx deploy backend --mode reinstall

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy backend canister"
    exit 1
fi

# Deploy the test runner canister
echo "   → Deploying test runner canister..."
dfx deploy test_runner --mode reinstall

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy test runner canister"
    exit 1
fi

# Get the backend canister ID
BACKEND_CANISTER_ID=$(dfx canister id backend)
echo "   → Backend canister ID: $BACKEND_CANISTER_ID"

echo ""
echo "🧪 Running comprehensive test suite..."
echo "======================================"

# Run the comprehensive test suite
echo "Starting full test suite against backend canister..."
dfx canister call test_runner testBackendCanister "(principal \"$BACKEND_CANISTER_ID\")"

echo ""
echo "⚡ Running quick test suite..."
echo "=============================="

# Run the quick test suite
echo "Starting quick test for basic functionality..."
dfx canister call test_runner quickTest "(principal \"$BACKEND_CANISTER_ID\")"

echo ""
echo "✅ Test execution completed!"
echo ""
echo "📋 Test Coverage Summary:"
echo "• Contract Management (add, get, update, remove)"
echo "• Alert Management (create, acknowledge, query)"
echo "• Monitoring Rules (hardcoded rule validation)"
echo "• Pause & Resume functionality"
echo "• Quarantine address management"
echo "• Monitoring control (activate/deactivate)"
echo "• Cleanup functions (clear alerts/contracts)"
echo ""
echo "💡 Tip: Check the console output above for detailed test results"
echo "   Green ✅ indicates passed tests, Red ❌ indicates failed tests"
