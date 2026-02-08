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

### Lesson 3: Use Project's Task Management Files
**Context:** Used system plan folder instead of project's `.claude/tasks/todo.md`.
**Mistake:** CLAUDE.md specifies that plans should go to `.claude/tasks/todo.md`, not the system's plan folder.

**Rule:**
1. Always use `.claude/tasks/todo.md` for task planning and progress tracking
2. Use `.claude/tasks/lessons.md` for capturing lessons after corrections
3. Follow the project's Task Management guidelines in CLAUDE.md

### Lesson 4: No Co-Authored-By in Commits
**Context:** Added "Co-Authored-By: Claude" to commit messages.
**Mistake:** User does not want co-author attribution on commits.

**Rule:**
1. Never add "Co-Authored-By" lines to commit messages
2. Keep commit messages focused on the changes only

## Session: 2026-02-06

### Lesson 5: Always Use DTOs with Zod for Runtime Validation
**Context:** Created controllers that use raw `request.body as Type` casting without Zod validation.
**Mistake:** Skipped DTOs and Zod validation, violating CLAUDE.md requirement: "Use Zod for runtime validation (DTOs/Env vars)".

**Rule:**
1. Every controller input MUST have a corresponding DTO with Zod schema
2. DTOs belong in Interface Adapters layer (e.g., `@interface/dtos/`)
3. Validate all inputs before passing to use cases
4. Never trust raw request data - always validate

### Lesson 6: Follow Clean Architecture Layers Strictly
**Context:** Rushed to create routes with inline logic and schemas.
**Mistake:** Mixed concerns - put logic in routes, skipped proper layer separation.

**Rule:**
1. **Routes:** Only define endpoints and wire to controllers (no business logic)
2. **Controllers:** Handle HTTP layer, use DTOs for validation, call use cases
3. **Use Cases:** Pure business logic orchestration
4. **Repositories:** Data access only
5. Create proper error handlers for consistent error responses

### Lesson 7: Document Business Rules Explicitly
**Context:** Created features without documenting the business rules.
**Mistake:** Business rules were implicit, leading to confusion and inconsistency.

**Rule:**
1. Create `.claude/rules/business-rules.md` for domain-specific rules
2. Document all business rules before implementation
3. Reference business rules in use case implementations
4. Update rules as requirements change

### Lesson 8: Always Consult CLAUDE.md Before Implementation
**Context:** Started coding without reviewing CLAUDE.md guidelines.
**Mistake:** Missed critical requirements (DTOs, error handlers, lessons.md updates).

**Rule:**
1. Re-read CLAUDE.md at the start of every session
2. Check lessons.md for patterns to avoid
3. Verify Clean Architecture layers before creating files
4. Ask: "What does CLAUDE.md say about this?"
