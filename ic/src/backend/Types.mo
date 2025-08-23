// Canary Contract Guardian - Type Definitions

module Types {
  
  // ============================================================================
  // CORE DATA TYPES
  // ============================================================================
  
  public type ContractStatus = {
    #healthy;
    #warning; 
    #critical;
    #offline;
  };

  public type AlertSeverity = {
    #info;
    #warning;
    #danger;
    #critical;
  };

  public type RuleType = {
    #balanceCheck;
    #transactionVolume;
    #functionCall;
    #custom;
  };

  // ============================================================================
  // CONTRACT TYPES
  // ============================================================================

  public type ContractId = Nat;
  
  public type Contract = {
    id: ContractId;
    address: Text;
    nickname: Text;
    status: ContractStatus;
    addedAt: Int;
    lastCheck: Int;
    alertCount: Nat;
    isActive: Bool;
    isPaused: Bool;                     
    quarantinedAddresses: [Text];
  };

  public type ContractInput = {
    address: Text;
    nickname: Text;
  };

  public type ContractUpdate = {
    id: ContractId;
    status: ContractStatus;
    lastCheck: Int;
  };

  // ============================================================================
  // MONITORING RULE TYPES (HARDCODED - NOT FROM AI)
  // ============================================================================

  public type RuleId = Nat;

  public type MonitoringRule = {
    id: RuleId;
    name: Text;
    description: Text;
    ruleType: RuleType;
    enabled: Bool;
    threshold: ?Float; // For numeric rules (e.g., 50% balance drop)
    timeWindow: ?Nat;  // Time window in minutes (e.g., 60 for 1 hour)
  };

  // Hardcoded rule configurations (MVP spec: 3 simple rules)
  public type RuleConfig = {
    balanceDropThreshold: Float;    // 50% = 0.5
    transactionVolumeLimit: Nat;    // 10 transactions
    transactionTimeWindow: Nat;     // 60 minutes (1 hour)
  };

  // ============================================================================
  // ALERT TYPES
  // ============================================================================

  public type AlertId = Nat;

  public type Alert = {
    id: AlertId;
    contractId: ContractId;
    contractAddress: Text;
    contractNickname: Text;
    ruleId: RuleId;
    ruleName: Text;
    title: Text;
    description: Text;
    severity: Text; // "info", "warning", "danger", "critical"
    timestamp: Int;
    acknowledged: Bool;
    data: ?AlertData; // Additional alert-specific data
  };

  public type AlertData = {
    #balanceChange: {
      previousBalance: Float;
      currentBalance: Float;
      percentageChange: Float;
    };
    #transactionSpike: {
      transactionCount: Nat;
      timeWindow: Nat;
      normalVolume: Nat;
    };
    #functionCall: {
      functionName: Text;
      caller: Text;
      gasUsed: ?Nat;
    };
    #custom: {
      details: Text;
    };
  };

  public type AlertInput = {
    contractId: ContractId;
    ruleId: RuleId;
    title: Text;
    description: Text;
    severity: Text;
    data: ?AlertData;
  };

  // ============================================================================
  // API RESPONSE TYPES
  // ============================================================================

  public type ApiResponse<T> = {
    #ok: T;
    #err: Text;
  };

  public type ApiError = {
    code: Nat;
    message: Text;
    details: ?Text;
  };

  // ============================================================================
  // SYSTEM TYPES
  // ============================================================================

  public type SystemStats = {
    totalContracts: Nat;
    activeContracts: Nat;
    totalAlerts: Nat;
    activeAlerts: Nat;
    acknowledgedAlerts: Nat;
    systemStatus: Text;
    lastUpdate: Int;
  };

  public type HealthStatus = {
    status: Text;
    timestamp: Int;
    canisterPrincipal: Text;
    memoryUsage: ?Nat;
    uptime: ?Int;
  };

  public type CanisterInfo = {
    name: Text;
    version: Text;
    description: Text;
    features: [Text];
    supportedRules: [Text];
  };

  // ============================================================================
  // MONITORING AGENT TYPES (for Python agent communication)
  // ============================================================================

  public type AgentStatus = {
    #online;
    #offline;
    #error;
  };

  public type MonitoringJob = {
    contractId: ContractId;
    contractAddress: Text;
    lastRun: Int;
    nextRun: Int;
    status: AgentStatus;
    rulesEnabled: [RuleId];
  };

  public type RuleCheckResult = {
    ruleId: RuleId;
    contractId: ContractId;
    passed: Bool;
    alertGenerated: Bool;
    data: ?AlertData;
    timestamp: Int;
  };

  // ============================================================================
  // DEMO & TESTING TYPES
  // ============================================================================

  public type DemoAlertType = {
    #balance;
    #transaction;
    #function;
    #custom: Text;
  };

  public type DemoData = {
    contracts: [Contract];
    alerts: [Alert];
    rules: [MonitoringRule];
  };

  // ============================================================================
  // CONFIGURATION TYPES
  // ============================================================================

  public type CanisterConfig = {
    maxContracts: Nat;
    maxAlerts: Nat;
    alertRetentionDays: Nat;
    monitoringInterval: Nat; // seconds
    discordWebhookEnabled: Bool;
  };

  public type NotificationConfig = {
    discordWebhook: ?Text;
    emailEnabled: Bool;
    slackEnabled: Bool;
  };

  // ============================================================================
  // UTILITY TYPES
  // ============================================================================

  public type TimeRange = {
    start: Int;
    end: Int;
  };

  public type Pagination = {
    page: Nat;
    limit: Nat;
    total: ?Nat;
  };

  public type SortOrder = {
    #asc;
    #desc;
  };

  public type FilterOptions = {
    contractId: ?ContractId;
    severity: ?Text;
    acknowledged: ?Bool;
    timeRange: ?TimeRange;
  };

}