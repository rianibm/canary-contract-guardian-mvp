import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Float "mo:base/Float";

module {
  // ----- HTTP types -----
  public type HeaderField = (Text, Text);

  public type HttpRequest = {
    method : Text;
    url : Text;
    headers : [HeaderField];
    body : Blob;
    certificate_version : ?Nat16;
  };

  public type HttpResponse = {
    status_code : Nat16;
    headers : [HeaderField];
    body : Blob;
    streaming_strategy : ?Null;
    upgrade : ?Bool;
  };

  // ----- API response types -----
  public type WelcomeResponse = {
    message : Text;
  };

  public type BalanceResponse = {
    address : Text;
    balance : Float;
    unit : Text;
  };

  public type UtxoResponse = {
    txid : Text;
    vout : Nat;
    value : Nat;
    confirmations : Nat;
  };

  public type AddressResponse = {
    address : Text;
  };

  public type SendResponse = {
    success : Bool;
    destination : Text;
    amount : Nat;
    txId : Text;
  };

  public type TestDataResponse = {
    id : Nat;
    name : Text;
    value : Float;
    isTest : Bool;
  };

  public type DummyTestResponse = {
    status : Text;
    data : {
      message : Text;
      timestamp : Text;
      testData : TestDataResponse;
    };
  };

  // ----- Bitcoin API types -----
  public type GetBalanceRequest = {
    address : Text;
    network : { #mainnet; #testnet; #regtest };
    min_confirmations : ?Nat32;
  };
};
