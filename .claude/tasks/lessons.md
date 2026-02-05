# Lessons Learned

## Session: 2026-02-05

### Lesson 1: Always Review Workflow Orchestration Before Starting Implementation
**Context:** After plan approval, I immediately started writing files without following the Subagent Strategy.
**Mistake:** Jumped straight into implementation without:
1. Re-reading the Workflow Orchestration guidelines in CLAUDE.md
2. Using subagents to keep main context window clean
3. Properly organizing the work execution

**Rule:** Before starting any implementation:
1. Review CLAUDE.md Workflow Orchestration section
2. Use subagents for implementation tasks (one task per subagent)
3. Keep main context focused on coordination, not file content

### Lesson 2: Avoid Windows-specific Shell Commands
**Context:** Used `timeout /t 3 /nobreak > nul` which created an actual `nul` file in the client directory.
**Mistake:** Windows `> nul` redirection can create a literal file named `nul` instead of redirecting to null device.

**Rule:**
1. Avoid Windows-specific commands like `timeout`, `nul` redirections
2. Use cross-platform alternatives or just avoid unnecessary commands
3. If a command doesn't need output, use `2>&1` to stderr or just ignore it
