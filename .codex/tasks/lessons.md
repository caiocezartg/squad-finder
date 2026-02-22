# Lessons Learned

## Session: 2026-02-16

### Lesson 1: Prefer Proactive Auth UX for Protected Actions

**Context:** Guests could click `JOIN ROOM`, triggering an unauthorized error after a request.
**Rule:**

1. For protected actions, intercept early in the UI when session is missing.
2. Explain why auth is required and provide an immediate login CTA.
3. Preserve user intent (for example, room code) so the flow resumes after login.
