import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";

persistent actor ContractGuardian {
  
  // ===== Types =====
  public type ContractStatus = { #healthy; #warning; #critical };
  public type MonitoringRule = { id: Nat; name: Text; description: Text; enabled: Bool };
  public type Contract = {
    id: Nat; address: Text; nickname: Text; status: ContractStatus;
    addedAt: Int; lastCheck: Int; alertCount: Nat
  };
  public type Alert = {
    id: Nat; contractId: Nat; contractAddress: Text; contractNickname: Text;
    ruleId: Nat; ruleName: Text; title: Text; description: Text; severity: Text;
    timestamp: Int; acknowledged: Bool
  };
  public type ApiResponse<T> = { #ok: T; #err: Text };

  // ===== Hash function for Nat =====
  private func natHash(n: Nat) : Nat32 {
    var hash : Nat32 = 2166136261;
    var value = n;
    while (value > 0) {
      hash := hash ^ Nat32.fromNat(value % 256);
      hash := hash *% 16777619;
      value := value / 256;
    };
    hash
  };

  // ===== State Variables - Simple approach =====
  private stable var nextContractId : Nat = 1;
  private stable var nextAlertId : Nat = 1;
  
  // Use transient vars that will be reinitialized on restart
  private transient var contracts = HashMap.HashMap<Nat, Contract>(10, Nat.equal, natHash);
  private transient var alerts = HashMap.HashMap<Nat, Alert>(50, Nat.equal, natHash);

  // ===== Constants =====
  private transient let monitoringRules : [MonitoringRule] = [
    { id = 1; name = "Balance Drop Alert"; description = "Alert when contract balance drops > 50%"; enabled = true },
    { id = 2; name = "High Transaction Volume"; description = "Alert when transaction count > 10 in 1 hour"; enabled = true },
    { id = 3; name = "New Function Added"; description = "Alert when new function is added to contract"; enabled = true },
  ];

  // ============================================================================
  // CONTRACT MANAGEMENT FUNCTIONS
  // ============================================================================

  // Add new contract to monitoring
  public func addContract(address: Text, nickname: Text) : async ApiResponse<Contract> {
    if (Text.size(address) == 0) {
      return #err("Contract address cannot be empty");
    };

    let contract: Contract = {
      id = nextContractId;
      address = address;
      nickname = if (Text.size(nickname) > 0) nickname else "Contract " # Nat.toText(nextContractId);
      status = #healthy;
      addedAt = Time.now();
      lastCheck = Time.now();
      alertCount = 0;
    };

    contracts.put(nextContractId, contract);
    nextContractId += 1;

    #ok(contract)
  };

  // Get all monitored contracts
  public query func getContracts() : async [Contract] {
    Iter.toArray(contracts.vals())
  };

  // Get specific contract by ID
  public query func getContract(id: Nat) : async ApiResponse<Contract> {
    switch (contracts.get(id)) {
      case (?contract) #ok(contract);
      case null #err("Contract not found");
    }
  };

  // Update contract status (called by monitoring agent)
  public func updateContractStatus(id: Nat, status: ContractStatus) : async ApiResponse<Contract> {
    switch (contracts.get(id)) {
      case (?contract) {
        let updatedContract: Contract = {
          id = contract.id;
          address = contract.address;
          nickname = contract.nickname;
          status = status;
          addedAt = contract.addedAt;
          lastCheck = Time.now();
          alertCount = contract.alertCount;
        };
        contracts.put(id, updatedContract);
        #ok(updatedContract)
      };
      case null #err("Contract not found");
    }
  };

  // Remove contract from monitoring
  public func removeContract(id: Nat) : async ApiResponse<Text> {
    switch (contracts.get(id)) {
      case (?_) {
        contracts.delete(id);
        #ok("Contract removed successfully")
      };
      case null #err("Contract not found");
    }
  };

  // ============================================================================
  // ALERT MANAGEMENT FUNCTIONS  
  // ============================================================================

  // Create new alert (called by monitoring agent)
  public func createAlert(
    contractId: Nat,
    ruleId: Nat,
    title: Text,
    description: Text,
    severity: Text
  ) : async ApiResponse<Alert> {
    
    // Verify contract exists
    let contract = switch (contracts.get(contractId)) {
      case (?c) c;
      case null return #err("Contract not found");
    };

    // Verify rule exists
    let rule = switch (Array.find<MonitoringRule>(monitoringRules, func(r) = r.id == ruleId)) {
      case (?r) r;
      case null return #err("Monitoring rule not found");
    };

    let alert: Alert = {
      id = nextAlertId;
      contractId = contractId;
      contractAddress = contract.address;
      contractNickname = contract.nickname;
      ruleId = ruleId;
      ruleName = rule.name;
      title = title;
      description = description;
      severity = severity;
      timestamp = Time.now();
      acknowledged = false;
    };

    alerts.put(nextAlertId, alert);
    nextAlertId += 1;

    // Update contract alert count
    let updatedContract: Contract = {
      id = contract.id;
      address = contract.address;
      nickname = contract.nickname;
      status = if (severity == "danger") #critical else if (severity == "warning") #warning else contract.status;
      addedAt = contract.addedAt;
      lastCheck = Time.now();
      alertCount = contract.alertCount + 1;
    };
    contracts.put(contractId, updatedContract);

    #ok(alert)
  };

  // Get all alerts
  public query func getAlerts() : async [Alert] {
    Iter.toArray(alerts.vals())
  };

  // Get alerts for specific contract
  public query func getContractAlerts(contractId: Nat) : async [Alert] {
    let contractAlerts = Array.filter<Alert>(
      Iter.toArray(alerts.vals()),
      func(alert) = alert.contractId == contractId
    );
    contractAlerts
  };

  // Get recent alerts (last 24 hours)
  public query func getRecentAlerts() : async [Alert] {
    let oneDayAgo = Time.now() - (24 * 60 * 60 * 1000_000_000); // 24 hours in nanoseconds
    let recentAlerts = Array.filter<Alert>(
      Iter.toArray(alerts.vals()),
      func(alert) = alert.timestamp > oneDayAgo
    );
    recentAlerts
  };

  // Acknowledge alert
  public func acknowledgeAlert(id: Nat) : async ApiResponse<Alert> {
    switch (alerts.get(id)) {
      case (?alert) {
        let updatedAlert: Alert = {
          id = alert.id;
          contractId = alert.contractId;
          contractAddress = alert.contractAddress;
          contractNickname = alert.contractNickname;
          ruleId = alert.ruleId;
          ruleName = alert.ruleName;
          title = alert.title;
          description = alert.description;
          severity = alert.severity;
          timestamp = alert.timestamp;
          acknowledged = true;
        };
        alerts.put(id, updatedAlert);
        #ok(updatedAlert)
      };
      case null #err("Alert not found");
    }
  };

  // ============================================================================
  // MONITORING RULES FUNCTIONS
  // ============================================================================

  // Get all monitoring rules
  public query func getMonitoringRules() : async [MonitoringRule] {
    monitoringRules
  };

  // ============================================================================
  // DEMO & TESTING FUNCTIONS (for hackathon demo)
  // ============================================================================

  // Manual trigger alert for demo purposes
  public func triggerDemoAlert(contractId: Nat, alertType: Text) : async ApiResponse<Alert> {
    let (ruleId, title, description, severity) = switch (alertType) {
      case ("balance") {
        (1, "Demo: Large Balance Drop", "Simulated 65% balance decrease for demonstration", "danger")
      };
      case ("transaction") {
        (2, "Demo: High Transaction Volume", "Simulated high activity spike for demonstration", "warning")
      };
      case ("function") {
        (3, "Demo: New Function Detected", "Simulated new function addition for demonstration", "warning")
      };
      case (_) {
        (1, "Demo: Test Alert", "Manual test alert triggered for demonstration", "warning")
      };
    };

    await createAlert(contractId, ruleId, title, description, severity)
  };

  // Create demo data (for initial setup)
  public func initializeDemoData() : async Text {
    // Add demo contract
    let demoContract = await addContract("rdmx6-jaaaa-aaaah-qcaiq-cai", "Demo DEX Contract");
    
    switch (demoContract) {
      case (#ok(contract)) {
        // Create demo alert
        let _ = await createAlert(
          contract.id,
          2,
          "High Transaction Volume",
          "Detected 47 transactions in last hour (normal: 8/hour)",
          "warning"
        );
        "Demo data initialized successfully"
      };
      case (#err(msg)) msg;
    }
  };

  // ============================================================================
  // SYSTEM INFO FUNCTIONS
  // ============================================================================

  // Get system statistics
  public query func getSystemStats() : async {
    totalContracts: Nat;
    activeAlerts: Nat;
    totalAlerts: Nat;
    systemStatus: Text;
  } {
    let totalContracts = contracts.size();
    let allAlerts = Iter.toArray(alerts.vals());
    let activeAlerts = Array.filter<Alert>(allAlerts, func(alert) = not alert.acknowledged);
    
    {
      totalContracts = totalContracts;
      activeAlerts = activeAlerts.size();
      totalAlerts = allAlerts.size();
      systemStatus = if (activeAlerts.size() > 0) "alerts" else "healthy";
    }
  };

  // Health check endpoint
  public query func healthCheck() : async {
    status: Text;
    timestamp: Int;
    canisterPrincipal: Text;
  } {
    {
      status = "online";
      timestamp = Time.now();
      canisterPrincipal = "canary-contract-guardian";
    }
  };

  // Get canister version and info
  public query func getVersion() : async {
    name: Text;
    version: Text;
    description: Text;
    features: [Text];
  } {
    {
      name = "Canary Contract Guardian";
      version = "1.0.0-mvp";
      description = "Smart contract monitoring service";
      features = [
        "Contract monitoring",
        "Real-time alerts", 
        "Discord integration",
        "3 hardcoded monitoring rules"
      ];
    }
  };



  /**
  * 23-8-2025
  * barry
  * feat: adding method for pause whole contract and peraddress
  */

  // Pause an entire contract
  public func pauseContract(id: Nat) : async ApiResponse<Contract> {
    switch (contracts.get(id)) {
      case (?contract) {
        let updated : Contract = { 
          id = contract.id;
          address = contract.address;
          nickname = contract.nickname;
          status = #critical;
          addedAt = contract.addedAt;
          lastCheck = Time.now();
          alertCount = contract.alertCount;
          isActive = contract.isActive;
          isPaused = true;                       // set paused
          quarantinedAddresses = contract.quarantinedAddresses;
        };
        contracts.put(id, updated);
        #ok(updated)
      };
      case null #err("Contract not found");
    }
  };

  // Resume contract
  public func resumeContract(id: Nat) : async ApiResponse<Contract> {
    switch (contracts.get(id)) {
      case (?contract) {
        let updated : Contract = { 
          id = contract.id;
          address = contract.address;
          nickname = contract.nickname;
          status = #healthy;
          addedAt = contract.addedAt;
          lastCheck = Time.now();
          alertCount = contract.alertCount;
          isActive = contract.isActive;
          isPaused = false;                      // unpause
          quarantinedAddresses = contract.quarantinedAddresses;
        };
        contracts.put(id, updated);
        #ok(updated)
      };
      case null #err("Contract not found");
    }
  };

  // Quarantine a specific address
  public func quarantineAddress(contractId: Nat, addr: Text) : async ApiResponse<Contract> {
    switch (contracts.get(contractId)) {
      case (?contract) {
        let newList = Array.append<Text>(contract.quarantinedAddresses, [addr]);
        let updated = { contract with quarantinedAddresses = newList };
        contracts.put(contractId, updated);
        #ok(updated)
      };
      case null #err("Contract not found");
    }
  };

  // Remove from quarantine
  public func unquarantineAddress(contractId: Nat, addr: Text) : async ApiResponse<Contract> {
    switch (contracts.get(contractId)) {
      case (?contract) {
        let newList = Array.filter<Text>(contract.quarantinedAddresses, func(x) = x != addr);
        let updated = { contract with quarantinedAddresses = newList };
        contracts.put(contractId, updated);
        #ok(updated)
      };
      case null #err("Contract not found");
    }
  };

  /**
  * 23-8-2025
  * barry
  * feat: add get method to check state of a contract or specific address running the contract
  */

  public query func isPaused(contractId: Nat) : async Bool {
    switch (contracts.get(contractId)) {
      case (?contract) contract.isPaused;
      case null false;
    }
  };

  public query func isQuarantined(contractId: Nat, addr: Text) : async Bool {
    switch (contracts.get(contractId)) {
      case (?contract) {
        Array.find<Text>(contract.quarantinedAddresses, func(x) = x == addr) != null
      };
      case null false;
    }
  };


  /**
  * 23-8-2025
  * barry
  * notes:
  * i cannot find where are the ai part that define which transaction are sus or not, but the idea is,
  * when an address display such sus behavior need to increment count and save it in some kind of map in memory for simplicity
  * when the count are above some threshold pause the "thing" with `quarantineAddress()`
  * but honestly, this seems weird, the "thing" we should pause are the canister/smartcontract that running the actual transaction
  * not our guardian canister methods, which only monitor the "other sc" transaction, but idk.. enlighten me pls @kri, @rchd
  */

}