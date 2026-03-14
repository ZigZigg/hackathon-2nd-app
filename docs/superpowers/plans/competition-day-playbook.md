# Competition Day Playbook
## What To Do After Brainstorming + Writing Plans

> You are here: brainstorming ✅ → writing-plans ✅ → **you are here**

---

## The Full Sequence

```
Phase 0   Infrastructure ready (done)
Phase 1   Topic revealed → scenario + RAG decision (5 min)
Phase 2   Brainstorming → lock features (8 min)             ✅ done
Phase 3   Writing plans → tasks with file paths (7 min)     ✅ done
Phase 4   Assign tasks in Linear (2 min)
Phase 5   Implement task by task — skill-driven + TDD-first (bulk of time)
Phase 6   Code review per completed slice
Phase 7   Verification before marking done
Phase 8   Bugs → systematic debugging
Phase 9   Demo prep
```

---

## How Implementation Works — The Key Principle

> **The plan doc tells you WHAT to build. The skills tell you HOW.**

The file `docs/superpowers/plans/2026-03-14-ai-task-management.md` contains:
- Task goals and scope
- Which skill to invoke
- "Tell the skill:" prompt — the exact opening message to paste
- Files to create or modify

The prompts in the plan are **your starting message to the skill** — not copy-paste into files.
The skill reads the real project state, enforces TDD, and catches issues the static plan can't anticipate.

**Never:** Copy code from the plan into files directly.
**Always:** Invoke the skill → let it read actual project files → use the "Tell the skill:" prompt as context.

---

## PHASE 4 — Assign Tasks in Linear (2 min)

**Who:** Captain

Use the Linear MCP inside Claude Code:
```
"Create a Linear issue for each task in docs/superpowers/plans/2026-03-14-ai-task-management.md.
 Use the task title as the issue title. Assign all to me. Priority: High."
```

Reference ticket IDs (e.g. `TM-1`) in commit messages. Lets the team see progress without interrupting each other.

---

## PHASE 5 — Implement Task by Task (bulk of time)

**Who:** Developer assigned to each task

### The skill-driven loop (repeat for every task)

```
1. Read the task in the plan doc              ← understand WHAT to build
2. Invoke the skill listed in the task        ← skill drives HOW
3. Paste the "Tell the skill:" prompt         ← from the plan doc task section
4. Let the skill enforce its process          ← TDD, migration checks, etc.
5. Commit when skill's Done criteria met      ← never commit a half-task
6. Mark Linear ticket Done                    ← only after verification
```

### Skill → Task mapping

| Task | Skill to invoke |
|------|----------------|
| 1 — Prisma schema | `/db-migrate` |
| 2 — Prisma singleton + NextAuth | `/tdd-feature` |
| 3 — tRPC infrastructure | `/new-feature` |
| 4 — Auth pages + register router | `/tdd-feature` then `/new-feature` |
| 5 — Workspace router | `/tdd-feature` |
| 6 — Member router | `/tdd-feature` |
| 7 — Dashboard layout + workspace UI | `/new-feature` |
| 8 — Project + task routers | `/tdd-feature` |
| 9 — Task list view UI | `/new-feature` |
| 10 — Meeting note router + AI extract | `/tdd-feature` then `/ai-feature` + `/add-api-route` |
| 11 — AI chat route + AI components | `/ai-feature` + `/add-api-route` |
| 12 — Kanban board | `/new-feature` |
| 13 — Comment router + audit log | `/tdd-feature` |
| 14 — Inngest + collaboration UI | `/new-feature` |
| 15 — Dashboard router + page | `/tdd-feature` then `/new-feature` |
| 16 — Audit log page + final wiring | `/new-feature` |
| 17 — E2E tests | `/gen-tests` |

### Running tasks in parallel (if 2+ developers)

Tasks with no shared files can run simultaneously. Use:
```
/superpowers:dispatching-parallel-agents
```

Safe to parallelize:
- Task 5 (workspace router) + Task 6 (member router) — different files
- Task 13 (comment router) + Task 14 (Inngest UI) — after Task 13's router is done
- Task 15 (dashboard router) + Task 16 (audit log page) — different files

**Never parallelize** tasks that both modify `src/server/routers/index.ts` or `prisma/schema.prisma`.

### Running in a new session (when context is large)

If the current session's context is getting full, open a fresh Claude Code session:
```
/superpowers:executing-plans
```
Point it at the plan:
```
"Execute docs/superpowers/plans/2026-03-14-ai-task-management.md using the skill listed
 in each task. Stop after each task for my review."
```

---

### TDD Rules During Phase 5 — Non-Negotiable

The `tdd-guard` hook blocks writing a router without a test file existing first.

Correct order for every router task:
```
1. Create test file → src/server/routers/__tests__/[name].test.ts
2. pnpm test [test-file]   → must be RED
3. Write router implementation
4. pnpm test [test-file]   → must be GREEN
5. git commit both files together
```

The `/tdd-feature` skill enforces this. Follow it exactly.

### Useful supporting skills

| Situation | Skill |
|-----------|-------|
| Need a new API route (streaming, webhooks) | `/add-api-route` |
| Coverage below 80% | `/gen-tests` |
| DB schema change mid-feature | `/db-migrate` |
| Adding Claude AI to a feature | `/ai-feature` |
| Something broken | `/fix-bug` |

---

## PHASE 6 — Code Review Per Slice

**Who:** Captain (after each full slice is complete — not each task)

A "slice" = vertical feature. Example: Slice 1 = Tasks 4–7 all complete.

Run 2-stage review with:
```
/superpowers:requesting-code-review
```

### Stage 1 — Spec review (@spec-reviewer)

Tell it:
```
"Run @spec-reviewer on [slice name].
 Check against docs/superpowers/specs/2026-03-14-ai-task-management-design.md."
```

Checks: every requirement present, edge cases handled, auth enforced, error messages user-friendly.

**Do NOT proceed to Stage 2 until spec-reviewer returns PASS.**

### Stage 2 — Quality review (@quality-reviewer)

Only after PASS from Stage 1:
```
"Run @quality-reviewer on [slice name]."
```

Checks: no `any` types, no N+1 queries, no unbounded `findMany`, functions < 50 lines, Zod on all inputs.

Fix all 🔴 CRITICAL before moving to next slice. Fix 🟡 WARNING if time allows.

---

## PHASE 7 — Verification Before Marking Done

**Who:** Developer who implemented the task

Before closing a Linear ticket:
```
/superpowers:verification-before-completion
```

Must prove with actual output — not just "I think it works":
```bash
pnpm test src/server/routers/__tests__/[name].test.ts
pnpm type-check
pnpm dev  # open page in browser, no console errors
```

Only mark ticket Done after all three confirm.

---

## PHASE 8 — Bug Fixing

**Who:** Whoever hits a bug

Never guess. Always:
```
/fix-bug
```
or
```
/superpowers:systematic-debugging
```

The process: reproduce reliably → write failing test → fix smallest thing → confirm GREEN → full suite passes → remove debug logs.

**Common bugs in this stack:**

| Symptom | Likely cause |
|---------|-------------|
| `UNAUTHORIZED` on tRPC call | Session not passed to test caller |
| Zod parse error on dates | Use `z.coerce.date()` not `z.date()` |
| `Cannot find module @/server/` in client component | Server code imported in client — move it |
| AI returns empty string | Check `block.type === 'text'` before returning `block.text` |
| `prisma.xxx is undefined` | Run `pnpm db:generate` after schema change |
| Types correct but tRPC returns wrong shape | Check `include` vs `select` in Prisma query |
| Drag-and-drop not firing `onDragEnd` | PointerSensor `activationConstraint distance:8` missing |
| Inngest function not triggering | Confirm `/api/inngest` route is registered and server restarted |

---

## PHASE 9 — Demo Prep (last 30 min)

### Seed realistic data

Run manually:
```bash
pnpm db:seed
```
Or ask Claude to write a seed script targeting your actual schema.

Rule: No "Test User 1". No "Example Company". No Lorem Ipsum.
Use realistic names and scenarios for a task management app (teams, projects, real-looking tasks, AI-generated examples).

### Security audit

```
"Run @security-auditor on the full codebase."
```

Fix all 🔴 CRITICAL: missing auth guard, ANTHROPIC_API_KEY exposed to client, no rate limit on `/api/ai/chat` or `/api/ai/extract`.

### Final build check
```bash
pnpm build        # broken build = broken demo
pnpm type-check   # zero errors
pnpm test         # all pass
pnpm test:coverage # >80% server coverage
```

### Deploy
```
/deploy-to-vercel
```
Or:
```bash
vercel --prod
```

Confirm production URL loads before the demo starts. Check on mobile too.

---

## Quick Reference — Full Skill List

| Phase | Skill |
|-------|-------|
| RAG decision | `/rag-decision` |
| Brainstorm | `/superpowers:brainstorming` ✅ |
| Write plan | `/superpowers:writing-plans` ✅ |
| Schema change | `/db-migrate` |
| Backend feature (TDD) | `/tdd-feature` |
| Full-stack feature | `/new-feature` |
| API route | `/add-api-route` |
| AI feature | `/ai-feature` |
| Missing tests | `/gen-tests` |
| Parallel tasks | `/superpowers:dispatching-parallel-agents` |
| Execute plan (new session) | `/superpowers:executing-plans` |
| Code review | `/superpowers:requesting-code-review` |
| Verify done | `/superpowers:verification-before-completion` |
| Fix bug | `/fix-bug` or `/superpowers:systematic-debugging` |
| Deploy | `/deploy-to-vercel` |

---

## Time Budget (4-hour competition day)

```
00:00–00:10   /rag-decision + /superpowers:brainstorming
00:10–00:20   /superpowers:writing-plans + Linear assign
00:20–02:50   PHASE 5 — implement all 17 tasks (skill-driven, TDD-first)
02:50–03:10   PHASE 6 — code review per slice (spec + quality)
03:10–03:25   PHASE 7+8 — verification + bug fixes
03:25–04:00   PHASE 9 — seed data + security + deploy + rehearse demo
```

---

## Your Next Action Right Now

Implementation plan is at:
`docs/superpowers/plans/2026-03-14-ai-task-management.md`

Start with **Task 1 — Prisma Schema**:
```
/db-migrate
```

Tell it:
> "Create the full Prisma schema for an AI task management app. Models: User (NextAuth fields + password), Account, Session, VerificationToken, Workspace (name, slug, inviteCode), WorkspaceMember (workspaceId, userId, role, joinedAt, invitedBy), Project (name, description, workspaceId, createdBy, archivedAt), Task (title, description, status, priority, projectId, assigneeId, createdBy, dueDate, aiGenerated, sourceNoteId), MeetingNote (workspaceId, projectId, uploadedBy, rawContent, status, errorMessage, processedAt), Comment (taskId, authorId, body), AuditLog (workspaceId, actorId, action, entityType, entityId, metadata). Enums: Role (ADMIN, MANAGER, MEMBER), TaskStatus (TODO, IN_PROGRESS, IN_REVIEW, DONE), TaskPriority (LOW, MEDIUM, HIGH, URGENT), MeetingNoteStatus (PENDING, PROCESSING, DONE, FAILED). Migration name: init."
