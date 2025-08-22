import Time "mo:base/Time";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Result "mo:base/Result";
import Debug "mo:base/Debug";

persistent actor DummyContract {
  
  // ===== State Variables =====
  private var balance : Nat = 1000000; // Start with 1M tokens
  private var transactionCount : Nat = 0;
  private var lastActivity : Int = Time.now();
  private var isUpgrading : Bool = false;
  
  // ===== Public Query Methods =====
  
  public query func getBalance() : async Nat {
    balance
  };
  
  public query func getTransactionCount() : async Nat {
    transactionCount
  };
  
  public query func getLastActivity() : async Int {
    lastActivity
  };
  
  public query func getContractInfo() : async {balance: Nat; transactions: Nat; lastActivity: Int; isUpgrading: Bool} {
    {
      balance = balance;
      transactions = transactionCount;
      lastActivity = lastActivity;
      isUpgrading = isUpgrading;
    }
  };
  
  // ===== Public Update Methods =====
  
  public func transfer(amount: Nat) : async Result.Result<Text, Text> {
    if (amount > balance) {
      #err("Insufficient balance")
    } else {
      balance -= amount;
      transactionCount += 1;
      lastActivity := Time.now();
      #ok("Transfer successful. New balance: " # Int.toText(balance))
    }
  };
  
  public func deposit(amount: Nat) : async Result.Result<Text, Text> {
    balance += amount;
    transactionCount += 1;
    lastActivity := Time.now();
    #ok("Deposit successful. New balance: " # Int.toText(balance))
  };
  
  // ===== Admin Functions (Suspicious for monitoring) =====
  
  public func emergencyWithdraw() : async Result.Result<Text, Text> {
    let oldBalance = balance;
    balance := 0;
    transactionCount += 1;
    lastActivity := Time.now();
    Debug.print("🚨 EMERGENCY WITHDRAW: " # Int.toText(oldBalance) # " tokens withdrawn!");
    #ok("Emergency withdrawal completed")
  };
  
  public func startUpgrade() : async Result.Result<Text, Text> {
    isUpgrading := true;
    lastActivity := Time.now();
    Debug.print("🔧 CONTRACT UPGRADE STARTED");
    #ok("Upgrade mode activated")
  };
  
  public func finishUpgrade() : async Result.Result<Text, Text> {
    isUpgrading := false;
    lastActivity := Time.now();
    Debug.print("✅ CONTRACT UPGRADE FINISHED");
    #ok("Upgrade mode deactivated")
  };
  
  // ===== Test Functions for Triggering Alerts =====
  
  public func simulateHighActivity() : async Text {
    // Simulate 15 quick transactions to trigger volume alert
    var i = 0;
    while (i < 15) {
      transactionCount += 1;
      i += 1;
    };
    lastActivity := Time.now();
    "Simulated 15 transactions for testing high volume alert"
  };
  
  public func simulateBalanceDrop() : async Text {
    // Drop balance by 60% to trigger balance alert
    let oldBalance = balance;
    balance := balance * 40 / 100; // Keep only 40%
    transactionCount += 1;
    lastActivity := Time.now();
    "Balance dropped from " # Int.toText(oldBalance) # " to " # Int.toText(balance) # " (60% drop)"
  };
  
  public func resetContract() : async Text {
    balance := 1000000;
    transactionCount := 0;
    isUpgrading := false;
    lastActivity := Time.now();
    "Contract reset to initial state"
  };
  
  // ===== Health Check =====
  
  public query func healthCheck() : async {status: Text; timestamp: Int} {
    {
      status = if (isUpgrading) "upgrading" else "healthy";
      timestamp = Time.now();
    }
  };
}
