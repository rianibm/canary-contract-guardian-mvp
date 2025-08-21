import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Int64 "mo:base/Int64";
import Nat "mo:base/Nat";
import Nat16 "mo:base/Nat16";
import Nat64 "mo:base/Nat64";
import Array "mo:base/Array";
import Float "mo:base/Float";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import { JSON } "mo:serde";
import Types "./Types";

persistent actor {
  // Record keys for JSON serialization
  let WelcomeResponseKeys = ["message"];
  let BalanceResponseKeys = ["address", "balance", "unit"];
  let UtxoResponseKeys = ["txid", "vout", "value", "confirmations"];
  let AddressResponseKeys = ["address"];

  // Reference to the management canister
  let management_canister = actor ("aaaaa-aa") : actor {
    bitcoin_get_balance : shared Types.GetBalanceRequest -> async Nat64;
  };

  // ----- Public API functions (can be called directly or via HTTP) -----

  // Welcome message
  public shared query func welcome() : async Types.WelcomeResponse {
    {
      message = "Welcome to the Bitcoin Canister API";
    };
  };

  // Real implementation: queries the Bitcoin balance
  public shared func get_balance(address : Text) : async Types.BalanceResponse {
    // Set the network (choose #testnet or #mainnet as needed)
    let network = #regtest;

    // Prepare the request
    let request : Types.GetBalanceRequest = {
      address = address;
      network = network;
      min_confirmations = null;
    };

    // Call the management canister's bitcoin_get_balance endpoint with cycles
    let satoshis = await (with cycles = 100_000_000) management_canister.bitcoin_get_balance(request);

    // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
    let btcBalance = Float.fromInt64(Int64.fromNat64(satoshis)) / 100_000_000.0;

    {
      address = address;
      balance = btcBalance;
      unit = "BTC";
    };
  };

  // Dummy: Returns the UTXOs of a given Bitcoin address
  public shared query func get_utxos(_address : Text) : async [Types.UtxoResponse] {
    [
      {
        txid = "dummy-txid-1";
        vout = 0;
        value = 25000;
        confirmations = 5;
      },
      {
        txid = "dummy-txid-2";
        vout = 1;
        value = 50000;
        confirmations = 3;
      },
    ];
  };

  // Dummy: Returns the 100 fee percentiles measured in millisatoshi/byte
  public shared query func get_current_fee_percentiles() : async [Nat] {
    Array.tabulate<Nat>(100, func(i) = 100 + i);
  };

  // Dummy: Returns the P2PKH address of this canister
  public shared query func get_p2pkh_address() : async Types.AddressResponse {
    {
      address = "tb1qdummyaddressxyz1234567890";
    };
  };

  // ----- Private helper functions -----

  // Extracts address from HTTP request body
  private func extractAddress(body : Blob) : Result.Result<Text, Text> {
    // Convert Blob to Text
    let jsonText = switch (Text.decodeUtf8(body)) {
      case null { return #err("Invalid UTF-8 encoding in request body") };
      case (?txt) { txt };
    };

    // Parse JSON using serde
    let #ok(blob) = JSON.fromText(jsonText, null) else {
      return #err("Invalid JSON format in request body");
    };

    // Extract address field from JSON
    type Address = {
      address : Text;
    };
    let addressField : ?Address = from_candid (blob);

    switch (addressField) {
      case null return #err("Address field not found in JSON");
      case (?addr) #ok(addr.address);
    };
  };

  // Constructs a JSON HTTP response using serde
  private func makeJsonResponse(statusCode : Nat16, jsonText : Text) : Types.HttpResponse {
    {
      status_code = statusCode;
      headers = [("content-type", "application/json"), ("access-control-allow-origin", "*")];
      body = Text.encodeUtf8(jsonText);
      streaming_strategy = null;
      upgrade = ?true;
    };
  };

  // Constructs a standardized error response for serialization failures
  private func makeSerializationErrorResponse() : Types.HttpResponse {
    {
      status_code = 500;
      headers = [("content-type", "application/json")];
      body = Text.encodeUtf8("{\"error\": \"Failed to serialize response\"}");
      streaming_strategy = null;
      upgrade = null;
    };
  };

  // Handles simple HTTP routes (GET/OPTIONS and fallback)
  private func handleRoute(method : Text, url : Text, _body : Blob) : Types.HttpResponse {
    let normalizedUrl = Text.trimEnd(url, #text "/");

    switch (method, normalizedUrl) {
      case ("GET", "" or "/") {
        let welcomeMsg = {
          message = "Welcome to the Dummy Bitcoin Canister API";
        };
        let blob = to_candid (welcomeMsg);
        let #ok(jsonText) = JSON.toText(blob, WelcomeResponseKeys, null) else return makeSerializationErrorResponse();
        makeJsonResponse(200, jsonText);
      };
      case ("OPTIONS", _) {
        {
          status_code = 200;
          headers = [("access-control-allow-origin", "*"), ("access-control-allow-methods", "GET, POST, OPTIONS"), ("access-control-allow-headers", "Content-Type")];
          body = Text.encodeUtf8("");
          streaming_strategy = null;
          upgrade = null;
        };
      };
      case ("POST", "/get-balance" or "/get-utxos" or "/get-current-fee-percentiles" or "/get-p2pkh-address") {
        {
          status_code = 200;
          headers = [("content-type", "application/json")];
          body = Text.encodeUtf8("");
          streaming_strategy = null;
          upgrade = ?true;
        };
      };
      case _ {
        {
          status_code = 404;
          headers = [("content-type", "application/json")];
          body = Text.encodeUtf8("Not found: " # url);
          streaming_strategy = null;
          upgrade = null;
        };
      };
    };
  };

  // Handles POST routes that require async update (e.g., calling other functions)
  private func handleRouteUpdate(method : Text, url : Text, body : Blob) : async Types.HttpResponse {
    let normalizedUrl = Text.trimEnd(url, #text "/");

    switch (method, normalizedUrl) {
      case ("POST", "/get-balance") {
        Debug.print("[INFO]: Started Get Balance");
        let addressResult = extractAddress(body);
        let address = switch (addressResult) {
          case (#err(errorMessage)) {
            return makeJsonResponse(400, "{\"error\": \"" # errorMessage # "\"}");
          };
          case (#ok(addr)) { addr };
        };

        let response : Types.BalanceResponse = await get_balance(address);
        let blob = to_candid (response);
        let #ok(jsonText) = JSON.toText(blob, BalanceResponseKeys, null) else return makeSerializationErrorResponse();
        Debug.print("[INFO]: Get Balance response: " # debug_show (jsonText));
        makeJsonResponse(200, jsonText);
      };
      case ("POST", "/get-utxos") {
        let addressResult = extractAddress(body);
        switch (addressResult) {
          case (#err(errorMessage)) {
            return makeJsonResponse(400, "{\"error\": \"" # errorMessage # "\"}");
          };
          case (#ok(address)) {
            let utxos = await get_utxos(address);
            let blob = to_candid (utxos);
            let #ok(jsonText) = JSON.toText(blob, UtxoResponseKeys, null) else return makeSerializationErrorResponse();
            makeJsonResponse(200, jsonText);
          };
        };
      };
      case ("POST", "/get-current-fee-percentiles") {
        let percentiles = await get_current_fee_percentiles();
        let blob = to_candid (percentiles);
        let #ok(jsonText) = JSON.toText(blob, [], null) else return makeSerializationErrorResponse();
        makeJsonResponse(200, jsonText);
      };
      case ("POST", "/get-p2pkh-address") {
        let response = await get_p2pkh_address();
        let blob = to_candid (response);
        let #ok(jsonText) = JSON.toText(blob, AddressResponseKeys, null) else return makeSerializationErrorResponse();
        makeJsonResponse(200, jsonText);
      };
      case ("OPTIONS", _) {
        {
          status_code = 200;
          headers = [("access-control-allow-origin", "*"), ("access-control-allow-methods", "GET, POST, OPTIONS"), ("access-control-allow-headers", "Content-Type")];
          body = Text.encodeUtf8("");
          streaming_strategy = null;
          upgrade = null;
        };
      };
      case _ {
        return handleRoute(method, url, body);
      };
    };
  };

  // HTTP query interface for GET/OPTIONS and static responses
  public query func http_request(req : Types.HttpRequest) : async Types.HttpResponse {
    return handleRoute(req.method, req.url, req.body);
  };

  // HTTP update interface for POST routes requiring async calls
  public func http_request_update(req : Types.HttpRequest) : async Types.HttpResponse {
    return await handleRouteUpdate(req.method, req.url, req.body);
  };
};
