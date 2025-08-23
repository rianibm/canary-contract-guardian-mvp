import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";

import Types "Types";

persistent actor ContractGuardian {

  // ==== Type Aliases (biar singkat) ====
  type Contract = Types.Contract;
  type ContractStatus = Types.ContractStatus;
  type MonitoringRule = Types.MonitoringRule;
  type Alert = Types.Alert;
  type ApiResponse<T> = Types.ApiResponse<T>;

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

  // ===== State Variables =====
  private stable var nextContractId : Nat = 1;
  private stable var nextAlertId : Nat = 1;

  private transient var contracts = HashMap.HashMap<Nat, Contract>(10, Nat.equal, natHash);
  private transient var alerts = HashMap.HashMap<Nat, Alert>(50, Nat.equal, natHash);

  // ===== Constants =====
  private transient let monitoringRules : [MonitoringRule] = [
    { id = 1; name = "Balance Drop Alert"; description = "Alert when contract balance drops > 50%"; ruleType = #balanceCheck; enabled = true; threshold = ?0.5; timeWindow = null },
    { id = 2; name = "High Transaction Volume"; description = "Alert when transaction count > 10 in 1 hour"; ruleType = #transactionVolume; enabled = true; threshold = null; timeWindow = ?60 },
    { id = 3; name = "New Function Added"; description = "Alert when new function is added to contract"; ruleType = #functionCall; enabled = true; threshold = null; timeWindow = null },
  ];

  // ============================================================================
  // CONTRACT MANAGEMENT
  // ============================================================================

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
      isActive = true;
      isPaused = false;
      quarantinedAddresses = [];
    };

    contracts.put(nextContractId, contract);
    nextContractId += 1;

    #ok(contract)
  };

  public query func getContracts() : async [Contract] {
    Iter.toArray(contracts.vals())
  };

  public query func getContract(id: Nat) : async ApiResponse<Contract> {
    switch (contracts.get(id)) {
      case (?c) #ok(c);
      case null #err("Contract not found");
    }
  };

  public func updateContractStatus(id: Nat, status: ContractStatus) : async ApiResponse<Contract> {
    switch (contracts.get(id)) {
      case (?c) {
        let updated: Contract = { c with status = status; lastCheck = Time.now() };
        contracts.put(id, updated);
        #ok(updated)
      };
      case null #err("Contract not found");
    }
  };

  public func removeContract(id: Nat) : async ApiResponse<Text> {
    switch (contracts.remove(id)) {
      case (?_) #ok("Contract removed successfully");
      case null #err("Contract not found");
    }
  };

  public func clearAllContracts() : async ApiResponse<Text> {
    let contractCount = contracts.size();
    contracts := HashMap.HashMap<Nat, Contract>(10, Nat.equal, natHash);
    nextContractId := 1;
    #ok("Cleared " # Nat.toText(contractCount) # " contracts")
  };

  // ============================================================================
  // ALERT MANAGEMENT
  // ============================================================================

  public func createAlert(contractId: Nat, ruleId: Nat, title: Text, description: Text, severity: Text) : async ApiResponse<Alert> {
    let contract = switch (contracts.get(contractId)) {
      case (?c) c;
      case null return #err("Contract not found");
    };

    let rule = switch (Array.find<MonitoringRule>(monitoringRules, func(r) = r.id == ruleId)) {
      case (?r) r;
      case null return #err("Rule not found");
    };

    let alert: Alert = {
      id = nextAlertId;
      contractId = contract.id;
      contractAddress = contract.address;
      contractNickname = contract.nickname;
      ruleId = rule.id;
      ruleName = rule.name;
      title = title;
      description = description;
      severity = severity;
      timestamp = Time.now();
      acknowledged = false;
      data = null;
    };

    alerts.put(nextAlertId, alert);
    nextAlertId += 1;

    let updatedContract = { contract with 
      status = if (severity == "critical") #critical else if (severity == "warning") #warning else contract.status;
      lastCheck = Time.now();
      alertCount = contract.alertCount + 1
    };

    contracts.put(contractId, updatedContract);

    #ok(alert)
  };

  public query func getAlerts() : async [Alert] {
    Iter.toArray(alerts.vals())
  };

  public query func getContractAlerts(contractId: Nat) : async [Alert] {
    Array.filter<Alert>(Iter.toArray(alerts.vals()), func(a) = a.contractId == contractId)
  };

  public query func getRecentAlerts() : async [Alert] {
    let oneDayAgo = Time.now() - (24 * 60 * 60 * 1_000_000_000);
    Array.filter<Alert>(Iter.toArray(alerts.vals()), func(a) = a.timestamp > oneDayAgo)
  };

  public func acknowledgeAlert(id: Nat) : async ApiResponse<Alert> {
    switch (alerts.get(id)) {
      case (?a) {
        let updated = { a with acknowledged = true };
        alerts.put(id, updated);
        #ok(updated)
      };
      case null #err("Alert not found");
    }
  };

  // ============================================================================
  // RULES
  // ============================================================================
  public query func getMonitoringRules() : async [MonitoringRule] {
    monitoringRules
  };

  // ============================================================================
  // PAUSE & QUARANTINE (Barry's Feature)
  // ============================================================================
  public func pauseContract(id: Nat) : async ApiResponse<Contract> {
    switch (contracts.get(id)) {
      case (?c) {
        let updated = { c with isPaused = true; status = #critical; lastCheck = Time.now() };
        contracts.put(id, updated);
        #ok(updated)
      };
      case null #err("Contract not found");
    }
  };

  public func resumeContract(id: Nat) : async ApiResponse<Contract> {
    switch (contracts.get(id)) {
      case (?c) {
        let updated = { c with isPaused = false; status = #healthy; lastCheck = Time.now() };
        contracts.put(id, updated);
        #ok(updated)
      };
      case null #err("Contract not found");
    }
  };

  public func quarantineAddress(id: Nat, addr: Text) : async ApiResponse<Contract> {
    switch (contracts.get(id)) {
      case (?c) {
        let updated = { c with quarantinedAddresses = Array.append(c.quarantinedAddresses, [addr]) };
        contracts.put(id, updated);
        #ok(updated)
      };
      case null #err("Contract not found");
    }
  };

  public func unquarantineAddress(id: Nat, addr: Text) : async ApiResponse<Contract> {
    switch (contracts.get(id)) {
      case (?c) {
        let updated = { c with quarantinedAddresses = Array.filter<Text>(c.quarantinedAddresses, func(x) = x != addr) };
        contracts.put(id, updated);
        #ok(updated)
      };
      case null #err("Contract not found");
    }
  };

  public query func isPaused(id: Nat) : async Bool {
    switch (contracts.get(id)) { case (?c) c.isPaused; case null false }
  };

  public query func isQuarantined(id: Nat, addr: Text) : async Bool {
    switch (contracts.get(id)) {
      case (?c) Array.find<Text>(c.quarantinedAddresses, func(x) = x == addr) != null;
      case null false;
    }
  };
}
