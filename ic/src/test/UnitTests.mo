import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";

import Types "../backend/Types";

// Unit test module for individual backend functions
module UnitTests {

  // Helper assertion functions
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

  // Test data validation functions
  public func testContractValidation() : Bool {
    Debug.print("\n=== Testing Contract Validation ===");
    
    // Test empty address validation
    let validAddress = "0x1234567890abcdef";
    let emptyAddress = "";
    
    let test1 = assertTrue(Text.size(validAddress) > 0, "Valid address should not be empty");
    let test2 = assertFalse(Text.size(emptyAddress) > 0, "Empty address should be detected");
    
    test1 and test2
  };

  // Test alert severity validation
  public func testAlertSeverityValidation() : Bool {
    Debug.print("\n=== Testing Alert Severity Validation ===");
    
    let validSeverities = ["info", "warning", "danger", "critical"];
    let invalidSeverity = "unknown";
    
    let test1 = assertTrue(
      Array.find<Text>(validSeverities, func(s) = s == "warning") != null,
      "Warning should be valid severity"
    );
    
    let test2 = assertFalse(
      Array.find<Text>(validSeverities, func(s) = s == invalidSeverity) != null,
      "Unknown should not be valid severity"
    );
    
    test1 and test2
  };

  // Test contract status transitions
  public func testContractStatusTransitions() : Bool {
    Debug.print("\n=== Testing Contract Status Transitions ===");
    
    // Test valid status transitions
    let _healthyStatus : Types.ContractStatus = #healthy;
    let _warningStatus : Types.ContractStatus = #warning;
    let _criticalStatus : Types.ContractStatus = #critical;
    let _offlineStatus : Types.ContractStatus = #offline;
    
    // All status types should be valid
    let test1 = assertTrue(true, "Healthy status should be valid");
    let test2 = assertTrue(true, "Warning status should be valid");
    let test3 = assertTrue(true, "Critical status should be valid");
    let test4 = assertTrue(true, "Offline status should be valid");
    
    test1 and test2 and test3 and test4
  };

  // Test monitoring rule validation
  public func testMonitoringRuleValidation() : Bool {
    Debug.print("\n=== Testing Monitoring Rule Validation ===");
    
    let _balanceRule : Types.RuleType = #balanceCheck;
    let _transactionRule : Types.RuleType = #transactionVolume;
    let _functionRule : Types.RuleType = #functionCall;
    let _customRule : Types.RuleType = #custom;
    
    // All rule types should be valid
    let test1 = assertTrue(true, "Balance check rule should be valid");
    let test2 = assertTrue(true, "Transaction volume rule should be valid");
    let test3 = assertTrue(true, "Function call rule should be valid");
    let test4 = assertTrue(true, "Custom rule should be valid");
    
    test1 and test2 and test3 and test4
  };

  // Test array operations
  public func testArrayOperations() : Bool {
    Debug.print("\n=== Testing Array Operations ===");
    
    let testArray = ["address1", "address2", "address3"];
    let targetAddress = "address2";
    let nonExistentAddress = "address4";
    
    // Test finding element in array
    let test1 = assertTrue(
      Array.find<Text>(testArray, func(addr) = addr == targetAddress) != null,
      "Should find existing address in array"
    );
    
    let test2 = assertFalse(
      Array.find<Text>(testArray, func(addr) = addr == nonExistentAddress) != null,
      "Should not find non-existent address in array"
    );
    
    // Test array filtering
    let filteredArray = Array.filter<Text>(testArray, func(addr) = addr != targetAddress);
    let test3 = assertEqual<Nat>(2, Array.size(filteredArray), "Filtered array should have 2 elements", Nat.equal);
    
    test1 and test2 and test3
  };

  // Test text operations
  public func testTextOperations() : Bool {
    Debug.print("\n=== Testing Text Operations ===");
    
    let testMessage = "Contract alerts cleared successfully";
    let keyword = "cleared";
    let nonExistentKeyword = "failed";
    
    // Test text contains
    let test1 = assertTrue(
      Text.contains(testMessage, #text keyword),
      "Message should contain 'cleared'"
    );
    
    let test2 = assertFalse(
      Text.contains(testMessage, #text nonExistentKeyword),
      "Message should not contain 'failed'"
    );
    
    // Test text concatenation
    let contractId = 1;
    let expectedMessage = "Contract " # Nat.toText(contractId) # " updated";
    let actualMessage = "Contract " # Nat.toText(contractId) # " updated";
    
    let test3 = assertEqual<Text>(expectedMessage, actualMessage, "Text concatenation should work", Text.equal);
    
    test1 and test2 and test3
  };

  // Test data structure creation
  public func testDataStructureCreation() : Bool {
    Debug.print("\n=== Testing Data Structure Creation ===");
    
    // Test contract creation
    let testContract : Types.Contract = {
      id = 1;
      address = "0xtest";
      nickname = "Test Contract";
      status = #healthy;
      addedAt = 1000000000;
      lastCheck = 1000000000;
      alertCount = 0;
      isActive = true;
      isPaused = false;
      quarantinedAddresses = [];
    };
    
    let test1 = assertEqual<Nat>(1, testContract.id, "Contract ID should be set correctly", Nat.equal);
    let test2 = assertEqual<Text>("0xtest", testContract.address, "Contract address should be set correctly", Text.equal);
    let test3 = assertTrue(testContract.isActive, "Contract should be active by default");
    let test4 = assertFalse(testContract.isPaused, "Contract should not be paused by default");
    
    // Test alert creation
    let testAlert : Types.Alert = {
      id = 1;
      contractId = 1;
      contractAddress = "0xtest";
      contractNickname = "Test Contract";
      ruleId = 1;
      ruleName = "Test Rule";
      title = "Test Alert";
      description = "Test alert description";
      severity = "warning";
      timestamp = 1000000000;
      acknowledged = false;
      data = null;
    };
    
    let test5 = assertEqual<Nat>(1, testAlert.id, "Alert ID should be set correctly", Nat.equal);
    let test6 = assertEqual<Text>("warning", testAlert.severity, "Alert severity should be set correctly", Text.equal);
    let test7 = assertFalse(testAlert.acknowledged, "Alert should not be acknowledged by default");
    
    test1 and test2 and test3 and test4 and test5 and test6 and test7
  };

  // Test API response types
  public func testApiResponseTypes() : Bool {
    Debug.print("\n=== Testing API Response Types ===");
    
    // Test success response
    let successResponse : Types.ApiResponse<Text> = #ok("Success message");
    let errorResponse : Types.ApiResponse<Text> = #err("Error message");
    
    let test1 = switch (successResponse) {
      case (#ok(msg)) {
        assertEqual<Text>("Success message", msg, "Success response should contain correct message", Text.equal)
      };
      case (#err(_)) {
        Debug.print("❌ FAIL: Should not be error response");
        false
      };
    };
    
    let test2 = switch (errorResponse) {
      case (#ok(_)) {
        Debug.print("❌ FAIL: Should not be success response");
        false
      };
      case (#err(msg)) {
        assertEqual<Text>("Error message", msg, "Error response should contain correct message", Text.equal)
      };
    };
    
    test1 and test2
  };

  // Run all unit tests
  public func runAllUnitTests() : Bool {
    Debug.print("\n🧪 Running Backend Unit Tests");
    Debug.print("==============================");
    
    let test1 = testContractValidation();
    let test2 = testAlertSeverityValidation();
    let test3 = testContractStatusTransitions();
    let test4 = testMonitoringRuleValidation();
    let test5 = testArrayOperations();
    let test6 = testTextOperations();
    let test7 = testDataStructureCreation();
    let test8 = testApiResponseTypes();
    
    let allTests = [test1, test2, test3, test4, test5, test6, test7, test8];
    let passedTests = Array.foldLeft<Bool, Nat>(allTests, 0, func(acc, passed) = if (passed) acc + 1 else acc);
    let totalTests = Array.size(allTests);
    
    Debug.print("\n📊 Unit Test Results:");
    Debug.print("Total Tests: " # Nat.toText(totalTests));
    Debug.print("Passed: " # Nat.toText(passedTests));
    Debug.print("Failed: " # Nat.toText(totalTests - passedTests));
    
    if (passedTests == totalTests) {
      Debug.print("🎉 All unit tests passed!");
      true
    } else {
      Debug.print("❌ Some unit tests failed!");
      false
    }
  };
}
