# ContractGuardian Backend Unit Tests

This directory contains comprehensive unit tests for the ContractGuardian backend Motoko canister with enhanced testing capabilities for the AI-enhanced monitoring system.

## Test Structure

### 📁 Test Files

- **`TestRunner.mo`** - Main test runner canister with comprehensive integration tests
- **`UnitTests.mo`** - Pure unit tests for individual functions and data validation  
- **`test.mo`** - Legacy test framework utilities (deprecated in favor of modular approach)

### 🧪 Test Coverage

The test suite provides comprehensive coverage for all system components:

1. **Contract Management**
   - Adding contracts with validation (valid/invalid inputs, duplicate detection)
   - Retrieving contracts (individual/all/filtered by status)
   - Updating contract status and monitoring configuration
   - Removing contracts with cleanup verification
   - Contract validation and metadata handling

2. **Alert Management**
   - Creating alerts with severity validation (valid/invalid scenarios)
   - Alert correlation and cross-rule relationship testing
   - Retrieving alerts (all/by contract/by severity/by timeframe)
   - Acknowledging alerts and status updates
   - Alert cleanup and archival functions
   - Multi-vector attack detection validation

3. **Advanced Monitoring Rules**
   - All 8 security rule validation and configuration
   - Adaptive threshold testing and learning validation
   - Cross-rule correlation logic verification
   - Rule type and structure validation
   - Custom rule parameter testing

4. **Pause & Quarantine Features**
   - Contract pause/resume functionality with state validation
   - Address quarantine management and enforcement
   - Status checking functions and state transitions
   - Duplicate prevention and conflict resolution

5. **Monitoring Control**
   - Contract activation/deactivation with rule management
   - Monitoring status queries and health checks
   - State transitions and persistence validation
   - Multi-contract coordination testing

6. **Cleanup Functions**
   - Clear all alerts with optional filtering
   - Clear contract-specific alerts and data
   - Clear all contracts with dependency cleanup
   - Bulk operations and transaction safety

7. **Data Validation & Security**
   - Type system validation and constraint enforcement
   - API response structures and format validation
   - Input sanitization and security checks
   - Error handling and recovery testing

8. **AI Integration Testing**
   - ASI:One integration validation (mocked responses)
   - Agentverse connectivity testing
   - Enhanced response formatting verification
   - Fallback mechanism validation

## Running Tests

### Prerequisites

1. Ensure `dfx` is installed and running:
   ```bash
   dfx start
   ```

2. Navigate to the IC directory:
   ```bash
   cd ic/
   ```

### Quick Test Run

Execute the automated test script:

```bash
./run_tests.sh
```

This script will:
- Deploy the backend canister
- Deploy the test runner canister  
- Run comprehensive integration tests
- Run quick functionality tests
- Display detailed results

### Manual Test Execution

1. **Deploy canisters:**
   ```bash
   dfx deploy backend --mode reinstall
   dfx deploy test_runner --mode reinstall
   ```

2. **Run unit tests:**
   ```bash
   dfx canister call test_runner runUnitTests
   ```

3. **Run integration tests:**
   ```bash
   BACKEND_ID=$(dfx canister id backend)
   dfx canister call test_runner testBackendCanister "(principal \"$BACKEND_ID\")"
   ```

4. **Run quick tests:**
   ```bash
   BACKEND_ID=$(dfx canister id backend)
   dfx canister call test_runner quickTest "(principal \"$BACKEND_ID\")"
   ```

### Enhanced Test Categories

You can run specific test categories for focused validation:

```bash
# Core contract management tests
dfx canister call test_runner testContractOperations "(principal \"$(dfx canister id backend)\")"

# Alert management and correlation tests  
dfx canister call test_runner testAlertOperations "(principal \"$(dfx canister id backend)\")"

# Advanced monitoring features and AI integration
dfx canister call test_runner testMonitoringFeatures "(principal \"$(dfx canister id backend)\")"

# Security rule validation and adaptive thresholds
dfx canister call test_runner testSecurityRules "(principal \"$(dfx canister id backend)\")"

# Cross-rule correlation and multi-vector detection
dfx canister call test_runner testCorrelationEngine "(principal \"$(dfx canister id backend)\")"

# Performance and stress testing
dfx canister call test_runner testPerformance "(principal \"$(dfx canister id backend)\")"
```

## Test Output

### Success Indicators
- ✅ **PASS:** - Individual test passed with validation
- 🎉 **All tests passed!** - Complete test suite success
- 🧠 **AI Enhanced:** - ASI:One integration features validated
- 🔗 **Correlation Verified:** - Cross-rule correlation working properly

### Failure Indicators  
- ❌ **FAIL:** - Individual test failed with detailed error info
- ⚠️ **WARNING:** - Test passed with minor issues or degraded performance
- 🔧 **NEEDS ATTENTION:** - Manual verification or configuration required

### Enhanced Sample Output
```
🧪 Starting ContractGuardian Enhanced Test Suite v2.0

=== Testing Core Contract Management ===
✅ PASS: Contract address validation and formatting
✅ PASS: Contract nickname assignment and retrieval
✅ PASS: New contract activation with 8-rule monitoring
✅ PASS: Duplicate contract prevention and error handling
🧠 AI Enhanced: Metadata enrichment validation

=== Testing Advanced Alert Management ===
✅ PASS: Multi-severity alert creation and categorization  
✅ PASS: Cross-rule correlation detection (10-minute windows)
✅ PASS: Alert acknowledgment and state management
✅ PASS: Bulk alert operations and cleanup
🔗 Correlation Verified: Balance drop + ownership change = CRITICAL

=== Testing AI Integration Features ===
✅ PASS: ASI:One response enhancement (mocked)
✅ PASS: Agentverse connectivity validation
✅ PASS: Fallback response system functionality
✅ PASS: Enhanced alert formatting with AI context

📊 Enhanced Test Results:
Total Tests: 45 (increased from 18)
Passed: 44
Failed: 0  
Warnings: 1 (minor performance degradation under load)
Success Rate: 97.8%
AI Features: Fully Operational
Correlation Engine: Active and Learning
```

## Adding New Tests

### Unit Tests
Add new test functions to `UnitTests.mo` for individual component testing:

```motoko
public func testAIEnhancedFeature() : Bool {
  Debug.print("\n=== Testing AI Enhancement Integration ===");
  
  // Test AI response formatting
  let aiResponse = formatAIResponse("Test input");
  let expectedFormat = "🤖 AI: Test input";
  assertEqual<Text>(expectedFormat, aiResponse, "AI response formatting", Text.equal)
};

public func testCrossRuleCorrelation() : Bool {
  Debug.print("\n=== Testing Cross-Rule Correlation Engine ===");
  
  // Test correlation detection within time windows
  let correlation = detectCorrelation(balanceDropAlert, ownershipChangeAlert);
  assert(correlation.severity == "CRITICAL");
  correlation.severity == "CRITICAL"
};
```

### Integration Tests
Add new test methods to `TestRunner.mo` for end-to-end testing:

```motoko
public func testAIIntegrationWorkflow(canister: actor { ... }) : async Bool {
  Debug.print("\n=== Testing AI Integration Workflow ===");
  
  // Test complete AI-enhanced monitoring flow
  let contractId = "test-contract-123";
  let result = await canister.addContractWithAIAnalysis(contractId, "Test Contract");
  
  // Verify AI enhancement is applied
  let status = await canister.getContractStatus(contractId);
  assert(status.aiEnhanced == true);
  
  true
};

public func testCorrelationEngineWorkflow(canister: actor { ... }) : async Bool {
  Debug.print("\n=== Testing Correlation Engine Workflow ===");
  
  // Test multi-vector attack detection
  let _ = await canister.simulateBalanceDrop(contractId, 60);
  let _ = await canister.simulateOwnershipChange(contractId);
  
  // Verify correlation detection
  let alerts = await canister.getAlerts();
  let criticalAlerts = Array.filter<Alert>(alerts, func(alert) { alert.severity == "CRITICAL" });
  assert(Array.size(criticalAlerts) > 0);
  
  true
};
```

## Debugging Tests

1. **Check canister logs:**
   ```bash
   dfx canister logs backend
   dfx canister logs test_runner
   ```

2. **Verify canister deployment:**
   ```bash
   dfx canister status backend
   dfx canister status test_runner
   ```

3. **Reset state (if needed):**
   ```bash
   dfx deploy --mode reinstall
   ```

## Best Practices

1. **Test Isolation** - Each test should be independent and not rely on previous test state
2. **Clear Assertions** - Use descriptive test messages that explain what is being validated
3. **Edge Cases** - Test both success scenarios and comprehensive failure conditions
4. **Data Cleanup** - Tests should clean up after themselves to prevent state pollution
5. **Realistic Data** - Use realistic test data that mirrors production scenarios
6. **Performance Awareness** - Monitor test execution time and resource usage
7. **AI Integration** - Mock AI responses for consistent and repeatable testing
8. **Correlation Testing** - Validate cross-rule correlation in controlled scenarios

## Advanced Testing Features

### Load Testing
```bash
# Test system under high load
dfx canister call test_runner stressTest "(principal \"$(dfx canister id backend)\", 1000)"
```

### Security Testing
```bash
# Test security measures and attack resistance
dfx canister call test_runner securityValidation "(principal \"$(dfx canister id backend)\")"
```

### AI Response Testing
```bash
# Test AI integration and fallback mechanisms
dfx canister call test_runner testAIResponses "(principal \"$(dfx canister id backend)\")"
```

## Continuous Integration

For CI/CD pipelines, use the enhanced test script:

```bash
#!/bin/bash
# Enhanced CI test script with comprehensive validation

echo "🚀 Starting Canary Contract Guardian CI Test Suite"

# Start clean DFX environment
dfx start --clean --background

# Deploy all canisters
echo "📦 Deploying canisters..."
dfx deploy backend --mode reinstall
dfx deploy test_runner --mode reinstall
dfx deploy dummy --mode reinstall

# Run comprehensive test suite
echo "🧪 Running comprehensive tests..."
./run_tests.sh

# Capture exit code
EXIT_CODE=$?

# Run additional validation
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Core tests passed, running extended validation..."
    
    # Test AI integration
    dfx canister call test_runner testAIIntegration "(principal \"$(dfx canister id backend)\")"
    AI_TEST_CODE=$?
    
    # Test correlation engine
    dfx canister call test_runner testCorrelationEngine "(principal \"$(dfx canister id backend)\")"
    CORRELATION_TEST_CODE=$?
    
    # Test performance under load
    dfx canister call test_runner performanceTest "(principal \"$(dfx canister id backend)\")"
    PERF_TEST_CODE=$?
    
    # Calculate final result
    if [ $AI_TEST_CODE -eq 0 ] && [ $CORRELATION_TEST_CODE -eq 0 ] && [ $PERF_TEST_CODE -eq 0 ]; then
        echo "🎉 All enhanced tests passed!"
        FINAL_EXIT_CODE=0
    else
        echo "⚠️ Some enhanced tests failed"
        FINAL_EXIT_CODE=1
    fi
else
    echo "❌ Core tests failed"
    FINAL_EXIT_CODE=$EXIT_CODE
fi

# Cleanup
echo "🧹 Cleaning up test environment..."
dfx stop

echo "📊 Final test result: $([ $FINAL_EXIT_CODE -eq 0 ] && echo 'SUCCESS' || echo 'FAILURE')"
exit $FINAL_EXIT_CODE
```

This ensures comprehensive validation in automated environments with proper exit codes for CI/CD integration.

---

**🧪 Comprehensive testing ensures the reliability and security of your AI-enhanced smart contract monitoring system**
