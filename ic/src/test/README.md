# ContractGuardian Backend Unit Tests

This directory contains comprehensive unit tests for the ContractGuardian backend Motoko canister.

## Test Structure

### 📁 Test Files

- **`TestRunner.mo`** - Main test runner canister with integration tests
- **`UnitTests.mo`** - Pure unit tests for individual functions and data validation
- **`test.mo`** - Test framework utilities (deprecated in favor of modular approach)

### 🧪 Test Coverage

The test suite covers:

1. **Contract Management**
   - Adding contracts (valid/invalid inputs)
   - Retrieving contracts (individual/all)
   - Updating contract status
   - Removing contracts
   - Contract validation

2. **Alert Management**
   - Creating alerts (valid/invalid scenarios)
   - Retrieving alerts (all/by contract)
   - Acknowledging alerts
   - Alert severity validation
   - Contract-alert relationships

3. **Monitoring Rules**
   - Hardcoded rule validation
   - Rule type verification
   - Rule structure validation

4. **Pause & Quarantine Features**
   - Contract pause/resume functionality
   - Address quarantine management
   - Status checking functions
   - Duplicate prevention

5. **Monitoring Control**
   - Contract activation/deactivation
   - Monitoring status queries
   - State transitions

6. **Cleanup Functions**
   - Clear all alerts
   - Clear contract-specific alerts
   - Clear all contracts
   - Bulk operations

7. **Data Validation**
   - Type system validation
   - API response structures
   - Text operations
   - Array operations

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

### Individual Test Functions

You can also run specific test categories:

```bash
# Contract management tests only
dfx canister call test_runner testContractOperations "(principal \"$(dfx canister id backend)\")"

# Alert management tests only  
dfx canister call test_runner testAlertOperations "(principal \"$(dfx canister id backend)\")"

# Monitoring features tests only
dfx canister call test_runner testMonitoringFeatures "(principal \"$(dfx canister id backend)\")"
```

## Test Output

### Success Indicators
- ✅ **PASS:** - Individual test passed
- 🎉 **All tests passed!** - Complete test suite success

### Failure Indicators
- ❌ **FAIL:** - Individual test failed
- 📊 **Test Results:** - Summary with pass/fail counts

### Sample Output
```
🧪 Starting ContractGuardian Test Suite

=== Testing Contract Management ===
✅ PASS: Contract address should match
✅ PASS: Contract nickname should match
✅ PASS: New contract should be active
❌ FAIL: Adding contract with empty address should fail

📊 Test Results:
Total Tests: 18
Passed: 17
Failed: 1
Success Rate: 94%
```

## Adding New Tests

### Unit Tests
Add new test functions to `UnitTests.mo`:

```motoko
public func testNewFeature() : Bool {
  Debug.print("\n=== Testing New Feature ===");
  
  // Your test logic here
  let result = someFunction();
  assertEqual<Text>("expected", result, "Description", Text.equal)
};
```

### Integration Tests
Add new test methods to `TestRunner.mo`:

```motoko
public func testNewIntegration(canister: actor { ... }) : async Bool {
  Debug.print("\n=== Testing New Integration ===");
  
  let result = await canister.newMethod();
  // Test the result
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

1. **Test Isolation** - Each test should be independent
2. **Clear Assertions** - Use descriptive test messages
3. **Edge Cases** - Test both success and failure scenarios
4. **Data Cleanup** - Tests clean up after themselves
5. **Realistic Data** - Use realistic test data

## Continuous Integration

For CI/CD pipelines, use:

```bash
# In your CI script
cd ic/
dfx start --clean --background
./run_tests.sh
EXIT_CODE=$?
dfx stop
exit $EXIT_CODE
```

This ensures tests run in a clean environment and proper exit codes are returned.
