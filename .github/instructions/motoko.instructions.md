---
applyTo: "**/*.mo"
---

### Adding New Canister Functions

When implementing a new function for the Internet Computer canister:

- For query functions, use `query` keyword before the function declaration
- Use actor-level variables for state management
- Follow Motoko best practices and existing code style
- Ensure proper type annotations for all functions
- Refer to the Motoko style guide: https://dfinity.github.io/motoko-style-guide/
- Official Motoko docs: https://internetcomputer.org/docs/current/motoko/main/motoko

Example implementation:

```motoko
// Query function example
query func getUserData(userId : Text) : async ?UserData {
    return Map.get(userDataStore, keyEq, userId);
};

// Update function example
public shared func updateUserData(userId : Text, data : UserData) : async () {
    userDataStore := Map.put(userDataStore, keyEq, userId, data);
    return;
};
```
