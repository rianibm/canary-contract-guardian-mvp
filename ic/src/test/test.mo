import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";

import Types "../backend/Types";

// Since we can't directly import the main canister in tests,
// we'll create test functions that can be called with a canister reference

module TestFramework {
  public func assertEqual<T>(expected: T, actual: T, message: Text, equals: (T, T) -> Bool) : Bool {
    if (equals(expected, actual)) {
      Debug.print("✅ PASS: " # message);
      true
    } else {
      Debug.print("❌ FAIL: " # message);
      false
    }
  };

  public func assertTrue(condition: Bool, message: Text) : Bool {
    if (condition) {
      Debug.print("✅ PASS: " # message);
      true
    } else {
      Debug.print("❌ FAIL: " # message);
      false
    }
  };

  public func assertFalse(condition: Bool, message: Text) : Bool {
    if (not condition) {
      Debug.print("✅ PASS: " # message);
      true
    } else {
      Debug.print("❌ FAIL: " # message);
      false
    }
  };
}

// Test functions that can be called from a test canister
module Tests {
  
  public func testContractOperations(canister: actor {
    addContract: (Text, Text) -> async Types.ApiResponse<Types.Contract>;
    getContracts: () -> async [Types.Contract];
    getContract: (Nat) -> async Types.ApiResponse<Types.Contract>;
    updateContractStatus: (Nat, Types.ContractStatus) -> async Types.ApiResponse<Types.Contract>;
    removeContract: (Nat) -> async Types.ApiResponse<Text>;
  }) : async Bool {
    Debug.print("\n=== Testing Contract Operations ===");
    
    // Test 1: Add a valid contract
    let result1 = await canister.addContract("0x1234567890abcdef", "Test Contract 1");
    let test1 = switch (result1) {
      case (#ok(contract)) {
        TestFramework.assertEqual<Text>("0x1234567890abcdef", contract.address, "Contract address should match", Text.equal) and
        TestFramework.assertEqual<Text>("Test Contract 1", contract.nickname, "Contract nickname should match", Text.equal) and
        TestFramework.assertTrue(contract.isActive, "New contract should be active") and
        TestFramework.assertFalse(contract.isPaused, "New contract should not be paused")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Adding valid contract should succeed");
        false
      };
    };

    // Test 2: Add contract with empty address (should fail)
    let result2 = await canister.addContract("", "Invalid Contract");
    let test2 = switch (result2) {
      case (#ok(_)) {
        TestFramework.assertTrue(false, "Adding contract with empty address should fail");
        false
      };
      case (#err(msg)) {
        TestFramework.assertEqual<Text>("Contract address cannot be empty", msg, "Error message should match", Text.equal)
      };
    };

    // Test 3: Get all contracts
    let contracts = await canister.getContracts();
    let test3 = TestFramework.assertTrue(Array.size(contracts) >= 1, "Should have at least 1 contract");

    // Test 4: Get specific contract
    let result4 = await canister.getContract(1);
    let test4 = switch (result4) {
      case (#ok(contract)) {
        TestFramework.assertEqual<Nat>(1, contract.id, "Contract ID should be 1", Nat.equal)
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Getting existing contract should succeed");
        false
      };
    };

    // Test 5: Update contract status
    let result5 = await canister.updateContractStatus(1, #warning);
    let test5 = switch (result5) {
      case (#ok(contract)) {
        switch (contract.status) {
          case (#warning) TestFramework.assertTrue(true, "Contract status should be warning");
          case (_) TestFramework.assertTrue(false, "Contract status not updated correctly");
        }
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Updating contract status should succeed");
        false
      };
    };

    test1 and test2 and test3 and test4 and test5
  };

  public func testAlertOperations(canister: actor {
    createAlert: (Nat, Nat, Text, Text, Text) -> async Types.ApiResponse<Types.Alert>;
    getAlerts: () -> async [Types.Alert];
    getContractAlerts: (Nat) -> async [Types.Alert];
    acknowledgeAlert: (Nat) -> async Types.ApiResponse<Types.Alert>;
  }) : async Bool {
    Debug.print("\n=== Testing Alert Operations ===");

    // Test 1: Create a valid alert
    let result1 = await canister.createAlert(1, 1, "Test Alert", "This is a test alert", "warning");
    let test1 = switch (result1) {
      case (#ok(alert)) {
        TestFramework.assertEqual<Nat>(1, alert.contractId, "Alert contract ID should be 1", Nat.equal) and
        TestFramework.assertEqual<Text>("Test Alert", alert.title, "Alert title should match", Text.equal) and
        TestFramework.assertFalse(alert.acknowledged, "New alert should not be acknowledged")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Creating valid alert should succeed");
        false
      };
    };

    // Test 2: Create alert for non-existing contract
    let result2 = await canister.createAlert(999, 1, "Invalid Alert", "This should fail", "info");
    let test2 = switch (result2) {
      case (#ok(_)) {
        TestFramework.assertTrue(false, "Creating alert for non-existing contract should fail");
        false
      };
      case (#err(msg)) {
        TestFramework.assertEqual<Text>("Contract not found", msg, "Error message should match", Text.equal)
      };
    };

    // Test 3: Get all alerts
    let alerts = await canister.getAlerts();
    let test3 = TestFramework.assertTrue(Array.size(alerts) >= 1, "Should have at least 1 alert");

    // Test 4: Get contract-specific alerts
    let contractAlerts = await canister.getContractAlerts(1);
    let test4 = TestFramework.assertTrue(Array.size(contractAlerts) >= 1, "Contract 1 should have alerts");

    // Test 5: Acknowledge alert
    let result5 = await canister.acknowledgeAlert(1);
    let test5 = switch (result5) {
      case (#ok(alert)) {
        TestFramework.assertTrue(alert.acknowledged, "Alert should be acknowledged")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Acknowledging alert should succeed");
        false
      };
    };

    test1 and test2 and test3 and test4 and test5
  };

  public func testMonitoringFeatures(canister: actor {
    pauseContract: (Nat) -> async Types.ApiResponse<Types.Contract>;
    resumeContract: (Nat) -> async Types.ApiResponse<Types.Contract>;
    isPaused: (Nat) -> async Bool;
    quarantineAddress: (Nat, Text) -> async Types.ApiResponse<Types.Contract>;
    unquarantineAddress: (Nat, Text) -> async Types.ApiResponse<Types.Contract>;
    isQuarantined: (Nat, Text) -> async Bool;
    activateContract: (Nat) -> async Types.ApiResponse<Types.Contract>;
    deactivateContract: (Nat) -> async Types.ApiResponse<Types.Contract>;
    isMonitored: (Nat) -> async Bool;
  }) : async Bool {
    Debug.print("\n=== Testing Monitoring Features ===");

    // Test 1: Pause contract
    let result1 = await canister.pauseContract(1);
    let test1 = switch (result1) {
      case (#ok(contract)) {
        TestFramework.assertTrue(contract.isPaused, "Contract should be paused")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Pausing contract should succeed");
        false
      };
    };

    // Test 2: Check if paused
    let isPaused = await canister.isPaused(1);
    let test2 = TestFramework.assertTrue(isPaused, "Contract should be reported as paused");

    // Test 3: Resume contract
    let result3 = await canister.resumeContract(1);
    let test3 = switch (result3) {
      case (#ok(contract)) {
        TestFramework.assertFalse(contract.isPaused, "Contract should not be paused after resume")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Resuming contract should succeed");
        false
      };
    };

    // Test 4: Quarantine address
    let testAddress = "0xmaliciousaddress";
    let result4 = await canister.quarantineAddress(1, testAddress);
    let test4 = switch (result4) {
      case (#ok(contract)) {
        TestFramework.assertTrue(Array.size(contract.quarantinedAddresses) >= 1, "Should have quarantined addresses")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Quarantining address should succeed");
        false
      };
    };

    // Test 5: Check if quarantined
    let isQuarantined = await canister.isQuarantined(1, testAddress);
    let test5 = TestFramework.assertTrue(isQuarantined, "Address should be quarantined");

    // Test 6: Unquarantine address
    let result6 = await canister.unquarantineAddress(1, testAddress);
    let test6 = switch (result6) {
      case (#ok(_)) {
        TestFramework.assertTrue(true, "Unquarantining should succeed")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Unquarantining should succeed");
        false
      };
    };

    // Test 7: Deactivate contract
    let result7 = await canister.deactivateContract(1);
    let test7 = switch (result7) {
      case (#ok(contract)) {
        TestFramework.assertFalse(contract.isActive, "Contract should be deactivated")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Deactivating contract should succeed");
        false
      };
    };

    // Test 8: Check if monitored
    let isMonitored = await canister.isMonitored(1);
    let test8 = TestFramework.assertFalse(isMonitored, "Inactive contract should not be monitored");

    // Test 9: Reactivate contract
    let result9 = await canister.activateContract(1);
    let test9 = switch (result9) {
      case (#ok(contract)) {
        TestFramework.assertTrue(contract.isActive, "Contract should be reactivated")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Reactivating contract should succeed");
        false
      };
    };

    test1 and test2 and test3 and test4 and test5 and test6 and test7 and test8 and test9
  };

  public func testRulesAndCleanup(canister: actor {
    getMonitoringRules: () -> async [Types.MonitoringRule];
    clearAllAlerts: () -> async Types.ApiResponse<Text>;
    clearAllContracts: () -> async Types.ApiResponse<Text>;
    clearContractAlerts: (Nat) -> async Types.ApiResponse<Text>;
  }) : async Bool {
    Debug.print("\n=== Testing Rules and Cleanup ===");

    // Test 1: Get monitoring rules
    let rules = await canister.getMonitoringRules();
    let test1 = TestFramework.assertEqual<Nat>(3, Array.size(rules), "Should have 3 hardcoded rules", Nat.equal);

    // Test 2: Clear contract alerts
    let result2 = await canister.clearContractAlerts(1);
    let test2 = switch (result2) {
      case (#ok(msg)) {
        TestFramework.assertTrue(Text.contains(msg, #text "Cleared"), "Should confirm alerts cleared")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Clearing contract alerts should succeed");
        false
      };
    };

    // Test 3: Clear all alerts
    let result3 = await canister.clearAllAlerts();
    let test3 = switch (result3) {
      case (#ok(msg)) {
        TestFramework.assertTrue(Text.contains(msg, #text "Cleared"), "Should confirm all alerts cleared")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Clearing all alerts should succeed");
        false
      };
    };

    // Test 4: Clear all contracts
    let result4 = await canister.clearAllContracts();
    let test4 = switch (result4) {
      case (#ok(msg)) {
        TestFramework.assertTrue(Text.contains(msg, #text "Cleared"), "Should confirm all contracts cleared")
      };
      case (#err(_)) {
        TestFramework.assertTrue(false, "Clearing all contracts should succeed");
        false
      };
    };

    test1 and test2 and test3 and test4
  };
}
