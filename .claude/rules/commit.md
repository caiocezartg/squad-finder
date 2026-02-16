## Overview

This document establishes the strict workflow for finalizing tasks and managing version control in the **SquadFinder** project.

## 1. Mandatory Workflow

Whenever a task (feature, fix, refactor) is completed, you **MUST** follow these steps in order:

1.  **Ask for Permission:**
    - **Never** commit automatically.
    - Upon finishing code edits, ask: _"Task completed. Should I run checks and commit the changes?"_

2.  **Pre-commit Verification:**
    - If the user approves, execute the following quality checks using **Bun**:
      1.  `bun run lint` (Ensure code style compliance).
      2.  `bun run tsc --noEmit` (Ensure strict type safety).
    - **FAILURE PROTOCOL:** If any command fails (exit code ≠ 0), **STOP**. Report the specific errors to the user and ask to fix them before attempting to commit again.

3.  **Execute Commit:**
    - Only if all checks pass, generate a commit message following the **Conventional Commits** standard and execute the commit.

---

## 2. Commit Message Standard

All commit messages must adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:**
`type(scope): description`

### Allowed Types

- `feat`: A new feature (e.g., new route, component, use-case).
- `fix`: A bug fix.
- `docs`: Documentation only changes.
- `style`: Formatting, missing semi-colons, etc. (no code change).
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Changes to the build process, auxiliary tools, or deps (e.g., config files).

### Scope (Optional but Recommended)

Indicate the specific part of the codebase affected.

- _Examples:_ `auth`, `room`, `infra`, `ui`, `api`, `db`.

### Description Rules

- Use the imperative mood ("add" not "added", "fix" not "fixed").
- Do not capitalize the first letter.
- Do not end with a period.
