---
applyTo: "**"
---

# General Instructions

## Project Context

- This is an Internet Computer Protocol (ICP) project using Motoko for canister development.
- There isn't a frontend, since this is a Web API project.

## Code Quality & Formatting

- We use `prettier` for formatting and linting **Motoko** code.
- Run `npm run format` for formatting motoko.

## AI Assistance

- Before implementing new features, consider asking human a few clarification questions.
- If you would like to go beyond the scope of the prompt, please ask the human for permission first.
- When finishing a significant change, please PAUSE and ask the human for review and permission to continue.

## Development Commands

### Backend Changes

```bash
# Regenerate candid after interface changes
dfx generate
```
