import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";

import Types "../backend/Types";
import UnitTests "UnitTests";

persistent actor TestRunner {
  
  // Run unit tests first
  public func runUnitTests() : async Text {
    Debug.print("\n🧪 Running Unit Tests");
    let success = UnitTests.runAllUnitTests();
    if (success) {
      "SUCCESS: All unit tests passed!"
    } else {
      "FAILURE: Some unit tests failed!"
    }
  };

  // Test framework functions
  private func assertEqual<T>(expected: T, actual: T, message: Text, equals: (T, T) -> Bool) : Bool {
    if (equals(expected, actual)) {
      Debug.print("✅ PASS: " # message);
      true
    } else {
      Debug.print("❌ FAIL: " # message);
      false
    }
  };

  private func assertTrue(condition: Bool, message: Text) : Bool {
    if (condition) {
      Debug.print("✅ PASS: " # message);
      true
    } else {
      Debug.print("❌ FAIL: " # message);
      false
    }
  };

  private func assertFalse(condition: Bool, message: Text) : Bool {
    if (not condition) {
      Debug.print("✅ PASS: " # message);
      true
    } else {
      Debug.print("❌ FAIL: " # message);
      false
    }
  };

  // Test the backend canister by calling its methods
  public func testBackendCanister(backendCanister: Principal) : async Text {
    Debug.print("\n🧪 Starting ContractGuardian Test Suite");
    Debug.print("Testing Backend Canister: " # Principal.toText(backendCanister));
    
    // Create actor reference
    let backend = actor(Principal.toText(backendCanister)) : actor {
      // Contract management
      addContract: (Text, Text) -> async Types.ApiResponse<Types.Contract>;
      getContracts: () -> async [Types.Contract];
      getContract: (Nat) -> async Types.ApiResponse<Types.Contract>;
      updateContractStatus: (Nat, Types.ContractStatus) -> async Types.ApiResponse<Types.Contract>;
      removeContract: (Nat) -> async Types.ApiResponse<Text>;
      clearAllContracts: () -> async Types.ApiResponse<Text>;
      
      // Alert management
      createAlert: (Nat, Nat, Text, Text, Text) -> async Types.ApiResponse<Types.Alert>;
      getAlerts: () -> async [Types.Alert];
      getContractAlerts: (Nat) -> async [Types.Alert];
      acknowledgeAlert: (Nat) -> async Types.ApiResponse<Types.Alert>;
      clearAllAlerts: () -> async Types.ApiResponse<Text>;
      clearContractAlerts: (Nat) -> async Types.ApiResponse<Text>;
      
      // Monitoring rules
      getMonitoringRules: () -> async [Types.MonitoringRule];
      
      // Pause & quarantine
      pauseContract: (Nat) -> async Types.ApiResponse<Types.Contract>;
      resumeContract: (Nat) -> async Types.ApiResponse<Types.Contract>;
      isPaused: (Nat) -> async Bool;
      quarantineAddress: (Nat, Text) -> async Types.ApiResponse<Types.Contract>;
      unquarantineAddress: (Nat, Text) -> async Types.ApiResponse<Types.Contract>;
      isQuarantined: (Nat, Text) -> async Bool;
      
      // Monitoring control
      activateContract: (Nat) -> async Types.ApiResponse<Types.Contract>;
      deactivateContract: (Nat) -> async Types.ApiResponse<Types.Contract>;
      isMonitored: (Nat) -> async Bool;
    };

    var testsPassed = 0;
    var totalTests = 0;

    // ============================================================================
    // Test 1: Contract Management
    // ============================================================================
    Debug.print("\n=== Testing Contract Management ===");
    
    // Test adding a valid contract
    totalTests += 1;
    let result1 = await backend.addContract("0x1234567890abcdef", "Test Contract 1");
    switch (result1) {
      case (#ok(contract)) {
        if (assertEqual<Text>("0x1234567890abcdef", contract.address, "Contract address should match", Text.equal) and
            assertEqual<Text>("Test Contract 1", contract.nickname, "Contract nickname should match", Text.equal) and
            assertTrue(contract.isActive, "New contract should be active") and
            assertFalse(contract.isPaused, "New contract should not be paused")) {
          testsPassed += 1;
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Adding valid contract failed: " # msg);
      };
    };

    // Test adding contract with empty address (should fail)
    totalTests += 1;
    let result2 = await backend.addContract("", "Invalid Contract");
    switch (result2) {
      case (#ok(_)) {
        Debug.print("❌ FAIL: Adding contract with empty address should fail");
      };
      case (#err(msg)) {
        if (assertEqual<Text>("Contract address cannot be empty", msg, "Error message should match", Text.equal)) {
          testsPassed += 1;
        };
      };
    };

    // Test getting all contracts
    totalTests += 1;
    let contracts = await backend.getContracts();
    if (assertTrue(Array.size(contracts) >= 1, "Should have at least 1 contract")) {
      testsPassed += 1;
    };

    // Test getting specific contract
    totalTests += 1;
    let result3 = await backend.getContract(1);
    switch (result3) {
      case (#ok(contract)) {
        if (assertEqual<Nat>(1, contract.id, "Contract ID should be 1", Nat.equal)) {
          testsPassed += 1;
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Getting existing contract failed: " # msg);
      };
    };

    // Test updating contract status
    totalTests += 1;
    let result4 = await backend.updateContractStatus(1, #warning);
    switch (result4) {
      case (#ok(contract)) {
        switch (contract.status) {
          case (#warning) {
            if (assertTrue(true, "Contract status should be warning")) {
              testsPassed += 1;
            };
          };
          case (_) {
            Debug.print("❌ FAIL: Contract status not updated correctly");
          };
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Updating contract status failed: " # msg);
      };
    };

    // ============================================================================
    // Test 2: Alert Management
    // ============================================================================
    Debug.print("\n=== Testing Alert Management ===");

    // Test creating a valid alert
    totalTests += 1;
    let result5 = await backend.createAlert(1, 1, "Test Alert", "This is a test alert", "warning");
    switch (result5) {
      case (#ok(alert)) {
        if (assertEqual<Nat>(1, alert.contractId, "Alert contract ID should be 1", Nat.equal) and
            assertEqual<Text>("Test Alert", alert.title, "Alert title should match", Text.equal) and
            assertFalse(alert.acknowledged, "New alert should not be acknowledged")) {
          testsPassed += 1;
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Creating valid alert failed: " # msg);
      };
    };

    // Test creating alert for non-existing contract
    totalTests += 1;
    let result6 = await backend.createAlert(999, 1, "Invalid Alert", "This should fail", "info");
    switch (result6) {
      case (#ok(_)) {
        Debug.print("❌ FAIL: Creating alert for non-existing contract should fail");
      };
      case (#err(msg)) {
        if (assertEqual<Text>("Contract not found", msg, "Error message should match", Text.equal)) {
          testsPassed += 1;
        };
      };
    };

    // Test getting all alerts
    totalTests += 1;
    let alerts = await backend.getAlerts();
    if (assertTrue(Array.size(alerts) >= 1, "Should have at least 1 alert")) {
      testsPassed += 1;
    };

    // Test acknowledging alert
    totalTests += 1;
    let result7 = await backend.acknowledgeAlert(1);
    switch (result7) {
      case (#ok(alert)) {
        if (assertTrue(alert.acknowledged, "Alert should be acknowledged")) {
          testsPassed += 1;
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Acknowledging alert failed: " # msg);
      };
    };

    // ============================================================================
    // Test 3: Monitoring Rules
    // ============================================================================
    Debug.print("\n=== Testing Monitoring Rules ===");

    totalTests += 1;
    let rules = await backend.getMonitoringRules();
    if (assertEqual<Nat>(3, Array.size(rules), "Should have 3 hardcoded rules", Nat.equal)) {
      testsPassed += 1;
    };

    // ============================================================================
    // Test 4: Pause & Quarantine Features
    // ============================================================================
    Debug.print("\n=== Testing Pause & Quarantine Features ===");

    // Test pausing contract
    totalTests += 1;
    let result8 = await backend.pauseContract(1);
    switch (result8) {
      case (#ok(contract)) {
        if (assertTrue(contract.isPaused, "Contract should be paused")) {
          testsPassed += 1;
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Pausing contract failed: " # msg);
      };
    };

    // Test checking if paused
    totalTests += 1;
    let isPaused = await backend.isPaused(1);
    if (assertTrue(isPaused, "Contract should be reported as paused")) {
      testsPassed += 1;
    };

    // Test resuming contract
    totalTests += 1;
    let result9 = await backend.resumeContract(1);
    switch (result9) {
      case (#ok(contract)) {
        if (assertFalse(contract.isPaused, "Contract should not be paused after resume")) {
          testsPassed += 1;
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Resuming contract failed: " # msg);
      };
    };

    // Test quarantine features
    let testAddress = "0xmaliciousaddress";
    
    totalTests += 1;
    let result10 = await backend.quarantineAddress(1, testAddress);
    switch (result10) {
      case (#ok(contract)) {
        if (assertTrue(Array.size(contract.quarantinedAddresses) >= 1, "Should have quarantined addresses")) {
          testsPassed += 1;
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Quarantining address failed: " # msg);
      };
    };

    totalTests += 1;
    let isQuarantined = await backend.isQuarantined(1, testAddress);
    if (assertTrue(isQuarantined, "Address should be quarantined")) {
      testsPassed += 1;
    };

    // ============================================================================
    // Test 5: Monitoring Control
    // ============================================================================
    Debug.print("\n=== Testing Monitoring Control ===");

    // Test deactivating contract
    totalTests += 1;
    let result11 = await backend.deactivateContract(1);
    switch (result11) {
      case (#ok(contract)) {
        if (assertFalse(contract.isActive, "Contract should be deactivated")) {
          testsPassed += 1;
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Deactivating contract failed: " # msg);
      };
    };

    totalTests += 1;
    let isMonitored1 = await backend.isMonitored(1);
    if (assertFalse(isMonitored1, "Inactive contract should not be monitored")) {
      testsPassed += 1;
    };

    // Test reactivating contract
    totalTests += 1;
    let result12 = await backend.activateContract(1);
    switch (result12) {
      case (#ok(contract)) {
        if (assertTrue(contract.isActive, "Contract should be reactivated")) {
          testsPassed += 1;
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Reactivating contract failed: " # msg);
      };
    };

    // ============================================================================
    // Test 6: Cleanup Functions
    // ============================================================================
    Debug.print("\n=== Testing Cleanup Functions ===");

    // Test clearing contract alerts
    totalTests += 1;
    let result13 = await backend.clearContractAlerts(1);
    switch (result13) {
      case (#ok(msg)) {
        if (assertTrue(Text.contains(msg, #text "Cleared"), "Should confirm alerts cleared")) {
          testsPassed += 1;
        };
      };
      case (#err(msg)) {
        Debug.print("❌ FAIL: Clearing contract alerts failed: " # msg);
      };
    };

    // Final summary
    Debug.print("\n📊 Test Results:");
    Debug.print("Total Tests: " # Nat.toText(totalTests));
    Debug.print("Passed: " # Nat.toText(testsPassed));
    Debug.print("Failed: " # Nat.toText(totalTests - testsPassed));
    
    let successRate = (testsPassed * 100) / totalTests;
    Debug.print("Success Rate: " # Nat.toText(successRate) # "%");
    
    if (testsPassed == totalTests) {
      Debug.print("🎉 All tests passed!");
      "SUCCESS: All " # Nat.toText(totalTests) # " tests passed!"
    } else {
      Debug.print("❌ Some tests failed!");
      "PARTIAL: " # Nat.toText(testsPassed) # "/" # Nat.toText(totalTests) # " tests passed"
    }
  };

  // Quick test function for basic functionality
  public func quickTest(backendCanister: Principal) : async Text {
    Debug.print("\n🧪 Quick Test Suite");
    
    let backend = actor(Principal.toText(backendCanister)) : actor {
      addContract: (Text, Text) -> async Types.ApiResponse<Types.Contract>;
      getContracts: () -> async [Types.Contract];
      getMonitoringRules: () -> async [Types.MonitoringRule];
    };

    // Test 1: Add a contract
    let result1 = await backend.addContract("0xquicktest", "Quick Test Contract");
    let test1Success = switch (result1) {
      case (#ok(_)) true;
      case (#err(_)) false;
    };

    // Test 2: Get contracts
    let contracts = await backend.getContracts();
    let test2Success = Array.size(contracts) > 0;

    // Test 3: Get rules
    let rules = await backend.getMonitoringRules();
    let test3Success = Array.size(rules) == 3;

    let passedTests = (if (test1Success) 1 else 0) + 
                     (if (test2Success) 1 else 0) + 
                     (if (test3Success) 1 else 0);

    Debug.print("Quick Test Results: " # Nat.toText(passedTests) # "/3 passed");
    
    if (passedTests == 3) {
      "QUICK TEST SUCCESS: All basic functions working"
    } else {
      "QUICK TEST PARTIAL: " # Nat.toText(passedTests) # "/3 tests passed"
    }
  };
}
