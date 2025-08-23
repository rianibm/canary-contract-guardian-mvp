import Time "mo:base/Time";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Result "mo:base/Result";
import Debug "mo:base/Debug";

// Import the backend canister interface
import Backend "canister:backend";

persistent actor DummyContract {
  // Set this contract's ID (should match the backend's contract ID for this dummy)
  stable var contractId : Nat = 1;

  // Allow setting contractId at initialization or later
  public func setContractId(id: Nat) : async () {
    contractId := id;
  };
  
  // ===== State Variables =====
  private var balance : Nat = 1000000; // Start with 1M tokens
  private var transactionCount : Nat = 0;
  private var lastActivity : Int = Time.now();
  private var isUpgrading : Bool = false;
  
  // Enhanced state for attack simulation
  private var reentrancyCallCount : Nat = 0;
  private var lastReentrancyTime : Int = 0;
  private var flashLoanActive : Bool = false;
  private var flashLoanAmount : Nat = 0;
  private var ownershipChangeCount : Nat = 0;
  private var priceManipulationActive : Bool = false;
  
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
  
  public query func getContractInfo() : async {balance: Nat; transactions: Nat; lastActivity: Int; isUpgrading: Bool; reentrancyCallCount: Nat; flashLoanActive: Bool; ownershipChangeCount: Nat; priceManipulationActive: Bool} {
    {
      balance = balance;
      transactions = transactionCount;
      lastActivity = lastActivity;
      isUpgrading = isUpgrading;
      reentrancyCallCount = reentrancyCallCount;
      flashLoanActive = flashLoanActive;
      ownershipChangeCount = ownershipChangeCount;
      priceManipulationActive = priceManipulationActive;
    }
  };
  
  // ===== Public Update Methods =====
  
  public func transfer(amount: Nat) : async Result.Result<Text, Text> {
    let paused = await Backend.isPaused(contractId);
    if (paused) {
      #err("Contract is paused. No transactions allowed.")
    } else if (amount > balance) {
      #err("Insufficient balance")
    } else {
      balance -= amount;
      transactionCount += 1;
      lastActivity := Time.now();
      #ok("Transfer successful. New balance: " # Int.toText(balance))
    }
  };
  
  public func deposit(amount: Nat) : async Result.Result<Text, Text> {
    let paused = await Backend.isPaused(contractId);
    if (paused) {
      #err("Contract is paused. No transactions allowed.")
    } else {
      balance += amount;
      transactionCount += 1;
      lastActivity := Time.now();
      #ok("Deposit successful. New balance: " # Int.toText(balance))
    }
  };
  
  // ===== Admin Functions (Suspicious for monitoring) =====
  
  public func emergencyWithdraw() : async Result.Result<Text, Text> {
    let paused = await Backend.isPaused(contractId);
    if (paused) {
      #err("Contract is paused. No transactions allowed.")
    } else {
      let oldBalance = balance;
      balance := 0;
      transactionCount += 1;
      lastActivity := Time.now();
      Debug.print("🚨 EMERGENCY WITHDRAW: " # Int.toText(oldBalance) # " tokens withdrawn!");
      #ok("Emergency withdrawal completed")
    }
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
  
  public func simulateHighActivity() : async Result.Result<Text, Text> {
    let paused = await Backend.isPaused(contractId);
    if (paused) {
      #err("Contract is paused. No simulations allowed.")
    } else {
      // Simulate 15 quick transactions to trigger volume alert
      var i = 0;
      while (i < 15) {
        transactionCount += 1;
        i += 1;
      };
      lastActivity := Time.now();
      #ok("Simulated 15 transactions for testing high volume alert")
    }
  };
  
  public func simulateBalanceDrop() : async Result.Result<Text, Text> {
    let paused = await Backend.isPaused(contractId);
    if (paused) {
      #err("Contract is paused. No simulations allowed.")
    } else {
      // Drop balance by 60% to trigger balance alert
      let oldBalance = balance;
      balance := balance * 40 / 100; // Keep only 40%
      transactionCount += 1;
      lastActivity := Time.now();
      #ok("Balance dropped from " # Int.toText(oldBalance) # " to " # Int.toText(balance) # " (60% drop)")
    }
  };
  
  public func resetContract() : async Text {
    balance := 1000000;
    transactionCount := 0;
    isUpgrading := false;
    reentrancyCallCount := 0;
    lastReentrancyTime := 0;
    flashLoanActive := false;
    flashLoanAmount := 0;
    ownershipChangeCount := 0;
    priceManipulationActive := false;
    lastActivity := Time.now();
    "Contract reset to initial state"
  };
  
  // ===== Enhanced Attack Simulation Methods =====
  
  public func simulateReentrancyAttack() : async Result.Result<Text, Text> {
    let paused = await Backend.isPaused(contractId);
    if (paused) {
      #err("Contract is paused. No simulations allowed.")
    } else {
      let currentTime = Time.now();
      
      // Simulate rapid successive calls within 1 minute
      if (currentTime - lastReentrancyTime < 60_000_000_000) { // 60 seconds in nanoseconds
        reentrancyCallCount += 1;
      } else {
        reentrancyCallCount := 1;
        lastReentrancyTime := currentTime;
      };
      
      // Simulate the recursive call pattern
      if (reentrancyCallCount >= 1) {
        balance -= 10000; // Small amount per call
        transactionCount += 1;
      };
      
      lastActivity := currentTime;
      Debug.print("🔄 REENTRANCY SIMULATION: Call #" # Int.toText(reentrancyCallCount));
      
      #ok("Reentrancy attack simulated - Call #" # Int.toText(reentrancyCallCount) # " within " # Int.toText((currentTime - lastReentrancyTime) / 1_000_000_000) # " seconds")
    }
  };
  
  public func simulateFlashLoanAttack() : async Result.Result<Text, Text> {
    let paused = await Backend.isPaused(contractId);
    if (paused) {
      #err("Contract is paused. No simulations allowed.")
    } else {
      let currentTime = Time.now();
      
      if (not flashLoanActive) {
        // Step 1: Initiate flash loan
        flashLoanActive := true;
        flashLoanAmount := 1500000; // Large loan amount
        balance += flashLoanAmount; // Add borrowed funds
        transactionCount += 1;
        lastActivity := currentTime;
        Debug.print("💰 FLASH LOAN STARTED: " # Int.toText(flashLoanAmount) # " tokens borrowed");
        #ok("Flash loan attack started - borrowed " # Int.toText(flashLoanAmount) # " tokens")
      } else {
        // Step 2: Rapid exploitation transactions
        let exploitAmount = 50000;
        if (balance >= exploitAmount) {
          balance -= exploitAmount;
          transactionCount += 1;
          lastActivity := currentTime;
          Debug.print("⚡ FLASH LOAN EXPLOIT: " # Int.toText(exploitAmount) # " tokens transferred");
          
          // After 4 rapid transactions, repay and end
          if (transactionCount % 4 == 0) {
            balance -= flashLoanAmount; // Repay loan
            flashLoanActive := false;
            flashLoanAmount := 0;
            Debug.print("💸 FLASH LOAN REPAID: Attack completed");
            #ok("Flash loan attack completed - loan repaid")
          } else {
            #ok("Flash loan exploit transaction #" # Int.toText(transactionCount % 4) # " - " # Int.toText(exploitAmount) # " tokens moved")
          }
        } else {
          #err("Insufficient balance for exploit transaction")
        }
        
        // After 4 rapid transactions, repay and end
      }
    }
  };
  
  public func simulateOwnershipChange() : async Result.Result<Text, Text> {
    let paused = await Backend.isPaused(contractId);
    if (paused) {
      #err("Contract is paused. No simulations allowed.")
    } else {
      let currentTime = Time.now();
      ownershipChangeCount += 1;
      
      // Simulate different types of ownership changes
      let changeType = if (ownershipChangeCount % 3 == 1) {
        isUpgrading := true;
        "admin_upgrade_initiated"
      } else if (ownershipChangeCount % 3 == 2) {
        "ownership_transferred"
      } else {
        isUpgrading := false;
        "permissions_modified"
      };
      
      transactionCount += 1;
      lastActivity := currentTime;
      Debug.print("👑 OWNERSHIP CHANGE: " # changeType # " (#" # Int.toText(ownershipChangeCount) # ")");
      
      #ok("Ownership change simulated: " # changeType # " (change #" # Int.toText(ownershipChangeCount) # ")")
    }
  };
  
  public func simulatePriceManipulation() : async Result.Result<Text, Text> {
    let paused = await Backend.isPaused(contractId);
    if (paused) {
      #err("Contract is paused. No simulations allowed.")
    } else {
      let currentTime = Time.now();
      priceManipulationActive := not priceManipulationActive;
      
      if (priceManipulationActive) {
        // Simulate dramatic price spike (40% increase through balance manipulation)
        let oldBalance = balance;
        balance := balance * 140 / 100; // 40% increase
        transactionCount += 1;
        lastActivity := currentTime;
        Debug.print("📈 PRICE MANIPULATION: Artificial spike - balance " # Int.toText(oldBalance) # " -> " # Int.toText(balance));
        #ok("Price manipulation started - artificial 40% price spike detected")
      } else {
        // Simulate price crash (30% decrease)
        let oldBalance = balance;
        balance := balance * 70 / 100; // 30% decrease  
        transactionCount += 1;
        lastActivity := currentTime;
        Debug.print("📉 PRICE MANIPULATION: Artificial crash - balance " # Int.toText(oldBalance) # " -> " # Int.toText(balance));
        #ok("Price manipulation continued - artificial 30% price crash detected")
      }
    }
  };
  
  // ===== Health Check =====
  
  public query func healthCheck() : async {status: Text; timestamp: Int} {
    {
      status = if (isUpgrading) "upgrading" else "healthy";
      timestamp = Time.now();
    }
  };
}
