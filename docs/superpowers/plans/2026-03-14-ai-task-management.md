# AI Task Management Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack AI-powered task management app with workspace/project/task CRUD, two AI features (Task Assistant + Meeting Notes extraction), Kanban + List views, RBAC, comments, polling, dashboard, and audit log.

**Architecture:** Vertical slices — each slice delivers a working, testable increment. Infrastructure (Prisma schema + tRPC + auth) is laid first; subsequent slices layer features on top. Server boundary enforced: `src/server/` never imported by client components.

**Tech Stack:** Next.js 16/App Router, tRPC v11, Prisma 7, NextAuth v5, Tailwind v4 + shadcn/ui, Vitest 4, Playwright, Inngest, Vercel AI SDK + claude-sonnet-4-6.

**Spec:** `docs/superpowers/specs/2026-03-14-ai-task-management-design.md`

---

## Competition Day Phases

```
Phase 1   Infrastructure (Tasks 1–3)          — Prisma + Auth + tRPC
Phase 2   Slice 1 — Foundation (Tasks 4–7)    — Auth pages + Workspace + Member + Dashboard layout
Phase 3   Slice 2 — Task Core (Tasks 8–9)     — Project/Task routers + List view UI
Phase 4   Slice 3 — AI Features (Tasks 10–11) — Meeting notes + AI chat
Phase 5   Slice 4 — Kanban (Task 12)          — Drag-and-drop board
Phase 6   Slice 5 — Collaboration (Tasks 13–14) — Comments + Inngest mentions
Phase 7   Slice 6 — Enterprise (Tasks 15–16)  — Dashboard metrics + Audit log
Phase 8   E2E Tests (Task 17)                 — Playwright coverage
Phase 9   Code review → verification → deploy
```

---

## How Implementation Works — The Key Principle

> **The plan tells you WHAT. The skill tells you HOW.**

Each task below lists:
- The **skill to invoke** — run it first, before touching any file
- A **"Tell the skill:"** prompt — paste this as your opening message to the skill
- The **files** it will create or modify

The skill reads the real project state, enforces TDD, catches issues the static plan can't anticipate.

**Never:** Copy-paste code directly into files.
**Always:** Invoke the skill → let it read actual project files → use the task hints as context.

---

## TDD Rules — Non-Negotiable

The `tdd-guard` hook blocks writing a router without a test file first.

Correct order for every router task:
```
1. Create test file → src/server/routers/__tests__/[name].test.ts
2. pnpm test [test-file]   → must be RED
3. Write router implementation
4. pnpm test [test-file]   → must be GREEN
5. git commit both files together
```

---

## Parallel Task Opportunities

Tasks with no shared files can run simultaneously:
```
/superpowers:dispatching-parallel-agents
```

Safe to parallelize:
- Task 5 (workspace router) + Task 6 (member router) — different files
- Task 8 (project/task routers) + Task 9 (task UI) — after Task 8 completes
- Task 13 (comment router) + Task 14 (Inngest UI) — after Task 13 completes
- Task 15 (dashboard router) + Task 16 (audit log page) — different files

**Never parallelize** tasks that both modify `src/server/routers/index.ts` or `prisma/schema.prisma`.

---

## Skill → Task Quick Reference

| Task | Skill |
|------|-------|
| 1 — Prisma schema | `/db-migrate` |
| 2 — Prisma singleton + NextAuth | `/tdd-feature` |
| 3 — tRPC infrastructure | `/new-feature` |
| 4 — Auth pages + register router | `/tdd-feature` |
| 5 — Workspace router | `/tdd-feature` |
| 6 — Member router | `/tdd-feature` |
| 7 — Dashboard layout + workspace UI | `/new-feature` |
| 8 — Project + task routers | `/tdd-feature` |
| 9 — Task list view UI | `/new-feature` |
| 10 — Meeting note router + AI extract | `/tdd-feature` + `/ai-feature` |
| 11 — AI chat route + AI components | `/ai-feature` + `/add-api-route` |
| 12 — Kanban board | `/new-feature` |
| 13 — Comment router + audit log | `/tdd-feature` |
| 14 — Inngest + collaboration UI | `/new-feature` |
| 15 — Dashboard router + page | `/tdd-feature` + `/new-feature` |
| 16 — Audit log page + final wiring | `/new-feature` |
| 17 — E2E tests | `/gen-tests` |

---

## Phase 9 — After All Tasks Complete

### Code Review (per completed slice)
```
/superpowers:requesting-code-review
```
Tell it: `"Review [slice name]. Check against docs/superpowers/specs/2026-03-14-ai-task-management-design.md"`

Stage 1 (@spec-reviewer) must PASS before Stage 2 (@quality-reviewer). Fix all 🔴 CRITICAL before moving on.

### Verification Before Marking Done
```
/superpowers:verification-before-completion
```
Must show actual command output:
```bash
pnpm test
pnpm type-check
pnpm dev  # open in browser, no console errors
```

### Bug Fixing
```
/fix-bug
```
or
```
/superpowers:systematic-debugging
```
Never guess. Reproduce first → write failing test → fix → GREEN → full suite passes.

**Common bugs in this stack:**

| Symptom | Likely cause |
|---------|-------------|
| `UNAUTHORIZED` on tRPC call | Session not passed to test caller |
| Zod parse error on dates | Use `z.coerce.date()` not `z.date()` |
| `Cannot find module @/server/` in client | Server code imported in client — move it |
| AI returns empty string | Check `block.type === 'text'` before accessing `.text` |
| `prisma.xxx is undefined` | Run `pnpm db:generate` after schema change |
| Types correct but tRPC returns wrong shape | Check `include` vs `select` in Prisma query |

### Seed Data + Security + Deploy
```bash
pnpm db:seed       # realistic workspace/project/task data — no Lorem Ipsum
```
```
"Run @security-auditor on the full codebase."
```
Fix all 🔴 CRITICAL: missing auth, API key in client, no rate limit on AI endpoints.
```bash
pnpm build && pnpm type-check && pnpm test
```
```
/deploy-to-vercel
```

---

## File Map

### Infrastructure
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | All models: User, Workspace, WorkspaceMember, Project, Task, Comment, MeetingNote, AuditLog |
| `src/server/db.ts` | Prisma client singleton |
| `src/server/trpc.ts` | tRPC init, context (session + db), RBAC middleware helpers |
| `src/server/routers/index.ts` | Root router combining all sub-routers |
| `src/app/api/trpc/[trpc]/route.ts` | tRPC HTTP handler |
| `src/lib/trpc.ts` | tRPC client + React Query setup |
| `src/app/_providers.tsx` | TRPCProvider + SessionProvider wrapper |
| `src/app/layout.tsx` | *(modify)* wrap with providers |
| `src/server/auth.ts` | NextAuth v5 config (Prisma adapter, credentials provider) |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth route handler |

### Slice 1 — Foundation
| File | Purpose |
|------|---------|
| `src/lib/validations/auth.ts` | `registerSchema`, `loginSchema` |
| `src/lib/validations/workspace.ts` | `createWorkspaceSchema`, `updateWorkspaceSchema` |
| `src/lib/validations/member.ts` | `joinWorkspaceSchema`, `updateRoleSchema` |
| `src/server/routers/auth.ts` | `register` (public procedure) |
| `src/server/routers/workspace.ts` | `create`, `getById`, `listMine`, `updateSettings`, `generateInviteCode` |
| `src/server/routers/member.ts` | `join`, `list`, `updateRole`, `remove` |
| `src/server/routers/__tests__/auth.test.ts` | Unit tests for auth router |
| `src/server/routers/__tests__/workspace.test.ts` | Unit tests for workspace router |
| `src/server/routers/__tests__/member.test.ts` | Unit tests for member router |
| `src/components/layout/DashboardLayout.tsx` | Sidebar + Topbar shell |
| `src/components/layout/Sidebar.tsx` | Workspace switcher + nav |
| `src/components/layout/Topbar.tsx` | Breadcrumb + user menu |
| `src/components/workspace/WorkspaceForm.tsx` | Create workspace form |
| `src/components/workspace/InviteCodeBox.tsx` | Show + rotate invite code |
| `src/components/workspace/MemberList.tsx` | List members + role badges |
| `src/components/workspace/RoleBadge.tsx` | ADMIN/MANAGER/MEMBER badge |
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(auth)/register/page.tsx` | Register page |
| `src/app/(dashboard)/layout.tsx` | DashboardLayout wrapper |
| `src/app/(dashboard)/page.tsx` | Redirect to first workspace |
| `src/app/(dashboard)/workspaces/new/page.tsx` | Create workspace page |
| `src/app/(dashboard)/workspaces/[workspaceId]/page.tsx` | Workspace home |
| `src/app/(dashboard)/workspaces/[workspaceId]/settings/page.tsx` | Members + invite code |

### Slice 2 — Task Core
| File | Purpose |
|------|---------|
| `src/lib/validations/project.ts` | `createProjectSchema`, `updateProjectSchema` |
| `src/lib/validations/task.ts` | `createTaskSchema`, `updateTaskSchema`, `updateTaskStatusSchema`, `TaskCreateInput` |
| `src/server/routers/project.ts` | `create`, `getById`, `list`, `update`, `archive` |
| `src/server/routers/task.ts` | `create`, `getById`, `list`, `update`, `updateStatus`, `delete`, `bulkCreate` |
| `src/server/routers/__tests__/project.test.ts` | Unit tests for project router |
| `src/server/routers/__tests__/task.test.ts` | Unit tests for task router (RBAC ownership) |
| `src/hooks/use-tasks.ts` | `useTasks`, `useUpdateTaskStatus` |
| `src/hooks/use-projects.ts` | `useProjects`, `useCreateProject` |
| `src/components/forms/ProjectForm.tsx` | Create/edit project |
| `src/components/forms/TaskForm.tsx` | Create/edit task |
| `src/components/task/TaskStatusBadge.tsx` | TODO/IN_PROGRESS/IN_REVIEW/DONE chip |
| `src/components/task/PriorityBadge.tsx` | LOW/MEDIUM/HIGH/URGENT chip |
| `src/components/task/TaskDetailDrawer.tsx` | Right-side drawer — task detail, comments, activity |
| `src/components/task/TaskRow.tsx` | Single row in list view |
| `src/components/board/ListView.tsx` | List of TaskRow components + polling |
| `src/components/board/ViewToggle.tsx` | List ↔ Kanban URL toggle |
| `src/components/project/ProjectCard.tsx` | Project card |
| `src/components/project/ProjectList.tsx` | Grid of ProjectCard |
| `src/app/(dashboard)/workspaces/[workspaceId]/projects/new/page.tsx` | Create project |
| `src/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/page.tsx` | Task board (list default) |

### Slice 3 — AI Features
| File | Purpose |
|------|---------|
| `src/lib/validations/meeting-note.ts` | `createMeetingNoteSchema`, `extractedTasksResponseSchema` |
| `src/server/services/ai.service.ts` | Anthropic client singleton, `DEFAULT_MODEL`, `generateWithTools` helper |
| `src/server/routers/meeting-note.ts` | `create`, `getById`, `list`, `delete` |
| `src/server/routers/__tests__/meeting-note.test.ts` | Unit tests |
| `src/app/api/ai/chat/route.ts` | Streaming AI Task Assistant (Vercel AI SDK `streamText`) |
| `src/app/api/ai/extract/route.ts` | Meeting notes → tasks extraction (sync) |
| `src/hooks/use-meeting-notes.ts` | `useMeetingNotes`, `useCreateMeetingNote` |
| `src/components/ai/AIInputBar.tsx` | Natural language input + task preview card |
| `src/components/ai/MeetingNoteUploader.tsx` | Paste text or upload file |
| `src/components/ai/ExtractedTasksPreview.tsx` | Checklist of extracted tasks + confirm |
| `src/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/meeting-notes/page.tsx` | Meeting notes page |

### Slice 4 — Kanban View
| File | Purpose |
|------|---------|
| `src/components/board/KanbanBoard.tsx` | Four-column drag board |
| `src/components/board/KanbanColumn.tsx` | Single status column + drop zone |
| `src/components/task/TaskCard.tsx` | Draggable Kanban card (compact) |
| `src/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/kanban/page.tsx` | Kanban page |

### Slice 5 — Collaboration
| File | Purpose |
|------|---------|
| `src/lib/validations/comment.ts` | `createCommentSchema` |
| `src/server/routers/comment.ts` | `create`, `list`, `delete` |
| `src/server/routers/__tests__/comment.test.ts` | Unit tests (RBAC delete rules) |
| `src/inngest/client.ts` | Inngest client singleton |
| `src/inngest/functions/mention-notification.ts` | `send-mention-notification` function |
| `src/app/api/inngest/route.ts` | Inngest route handler |
| `src/server/lib/audit.ts` | `writeAuditLog(ctx, action, entityType, entityId, metadata)` helper |
| `src/server/routers/audit-log.ts` | `list`, `listForTask`, `listRecentForWorkspace` |
| `src/components/comments/CommentInput.tsx` | Textarea with @mention support |
| `src/components/comments/CommentThread.tsx` | Threaded comment list |

### Slice 6 — Enterprise
| File | Purpose |
|------|---------|
| `src/server/routers/dashboard.ts` | `workspaceMetrics` (ADMIN/MANAGER only) |
| `src/server/routers/__tests__/dashboard.test.ts` | Unit tests |
| `src/hooks/use-dashboard.ts` | `useDashboardMetrics` |
| `src/app/(dashboard)/workspaces/[workspaceId]/dashboard/page.tsx` | Server Component — RBAC redirect guard |
| `src/app/(dashboard)/workspaces/[workspaceId]/dashboard/DashboardClient.tsx` | Metrics cards + activity feed |
| `src/app/(dashboard)/workspaces/[workspaceId]/settings/audit/page.tsx` | Server Component — RBAC redirect guard |
| `src/app/(dashboard)/workspaces/[workspaceId]/settings/audit/AuditLogClient.tsx` | Sortable audit table |

### E2E Tests
| File | Purpose |
|------|---------|
| `tests/e2e/auth.spec.ts` | Register + login flows |
| `tests/e2e/task-management.spec.ts` | Full workspace → project → task journey |
| `tests/e2e/ai-features.spec.ts` | AI chat + meeting notes extraction |
| `tests/e2e/kanban.spec.ts` | Drag-and-drop status update |
| `tests/e2e/rbac.spec.ts` | RBAC boundary enforcement |

---

## Chunk 1: Infrastructure

### Task 1: Prisma Schema

**Skill:** `/db-migrate`
**Files:** `prisma/schema.prisma`

**Tell the skill:**
> "Create the full Prisma schema for an AI task management app. Models: User (NextAuth fields + password), Account, Session, VerificationToken, Workspace (name, slug, inviteCode), WorkspaceMember (workspaceId, userId, role, joinedAt, invitedBy), Project (name, description, workspaceId, createdBy, archivedAt), Task (title, description, status, priority, projectId, assigneeId, createdBy, dueDate, aiGenerated, sourceNoteId), MeetingNote (workspaceId, projectId, uploadedBy, rawContent, status, errorMessage, processedAt), Comment (taskId, authorId, body), AuditLog (workspaceId, actorId, action, entityType, entityId, metadata). Enums: Role (ADMIN, MANAGER, MEMBER), TaskStatus (TODO, IN_PROGRESS, IN_REVIEW, DONE), TaskPriority (LOW, MEDIUM, HIGH, URGENT), MeetingNoteStatus (PENDING, PROCESSING, DONE, FAILED). Migration name: init."

Define the full database schema with all models and enums. Enums: `Role` (ADMIN, MANAGER, MEMBER), `TaskStatus` (TODO, IN_PROGRESS, IN_REVIEW, DONE), `TaskPriority` (LOW, MEDIUM, HIGH, URGENT), `MeetingNoteStatus` (PENDING, PROCESSING, DONE, FAILED). Models: `User`, `Account`, `Session`, `VerificationToken` (NextAuth), `Workspace`, `WorkspaceMember`, `Project`, `Task`, `Comment`, `MeetingNote`, `AuditLog`. Run `pnpm db:migrate` and verify the Prisma client generates without errors.

- [ ] Write the Prisma schema with all models and enums
- [ ] Run migration (`pnpm db:migrate`, name: "init")
- [ ] Verify generated client (`pnpm db:generate`)
- [ ] Commit

---

### Task 2: Prisma Singleton + NextAuth

**Skill:** `/tdd-feature`
**Files:** `src/server/db.ts`, `src/server/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`

**Tell the skill:**
> "Set up Prisma singleton (hot-reload safe) at src/server/db.ts. Then configure NextAuth v5 at src/server/auth.ts using PrismaAdapter, credentials provider with bcrypt password check, JWT session strategy, signIn page at /login. JWT callback must attach user.id to token; session callback must attach token.id to session.user.id. Create the route handler at src/app/api/auth/[...nextauth]/route.ts. Install bcryptjs."

Create a global Prisma client singleton (hot-reload safe for dev). Configure NextAuth v5 with Prisma adapter, credentials provider (email + bcrypt password), JWT session strategy, and `signIn: '/login'` custom page. JWT and session callbacks must attach `user.id` to the session. Install `bcryptjs`.

- [ ] Create Prisma singleton
- [ ] Install bcryptjs
- [ ] Create NextAuth config
- [ ] Create NextAuth route handler
- [ ] Commit

---

### Task 3: tRPC Infrastructure

**Skill:** `/new-feature`
**Files:** `src/server/trpc.ts`, `src/server/routers/index.ts`, `src/app/api/trpc/[trpc]/route.ts`, `src/lib/trpc.ts`, `src/app/_providers.tsx`, `src/app/layout.tsx` (modify)

**Tell the skill:**
> "Wire up tRPC v11 infrastructure. Create src/server/trpc.ts with superjson transformer, publicProcedure, protectedProcedure (throws UNAUTHORIZED if no session), workspaceProcedure (verifies WorkspaceMember record, attaches ctx.member), and requireRole helper. Create empty root router at src/server/routers/index.ts. Create tRPC fetch handler at src/app/api/trpc/[trpc]/route.ts. Create tRPC React Query client at src/lib/trpc.ts. Create Providers component at src/app/_providers.tsx wrapping SessionProvider + TRPCProvider + QueryClientProvider. Modify src/app/layout.tsx to wrap children with Providers."

Set up tRPC v11 with superjson transformer. Create: `publicProcedure`, `protectedProcedure` (throws UNAUTHORIZED if no session), and `workspaceProcedure` (verifies workspace membership, attaches `ctx.member`). Create a `requireRole` helper. Wire the tRPC HTTP fetch handler, the React Query client, and a `Providers` component wrapping `SessionProvider` + `TRPCProvider`. Wrap the root layout with `<Providers>`.

- [ ] Create tRPC server with procedures and middleware
- [ ] Create empty root router
- [ ] Create tRPC HTTP handler
- [ ] Create tRPC client
- [ ] Create Providers component and wrap layout
- [ ] Verify endpoint responds (`curl http://localhost:3000/api/trpc`)
- [ ] Commit

---

## Chunk 2: Slice 1 — Foundation (Auth + Workspace)

### Task 4: Auth Pages + Register Router

**Skill:** `/tdd-feature` (backend), `/new-feature` (pages)
**Files:** `src/lib/validations/auth.ts`, `src/server/routers/auth.ts`, `src/server/routers/__tests__/auth.test.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`

**Tell the skill:**
> "Implement auth.register tRPC public procedure. Zod schema: name (min 2), email, password (min 8). Procedure: check for existing email (throw BAD_REQUEST if found), hash password with bcrypt rounds 12, create user, return {id, email}. Write tests first: (1) creates user and returns email, (2) throws BAD_REQUEST if email exists. Then build login page (react-hook-form + NextAuth signIn credentials) and register page (calls trpc.auth.register then signIn, then redirects to /). Both pages use shadcn/ui Button and raw inputs styled with Tailwind."

Add `registerSchema` and `loginSchema` Zod schemas. Implement the `auth.register` public tRPC procedure: hashes password with bcrypt, creates user, throws `BAD_REQUEST` if email already exists. Build login page (NextAuth `signIn`) and register page (calls `trpc.auth.register` then auto-signs in). Both pages use `react-hook-form` + zod resolver.

- [ ] Write Zod schemas
- [ ] Write failing tests for register procedure
- [ ] Confirm tests FAIL, implement auth router, confirm tests PASS
- [ ] Build login and register pages
- [ ] Add authRouter to root router
- [ ] Commit

---

### Task 5: Workspace Router + Tests

**Skill:** `/tdd-feature`
**Files:** `src/lib/validations/workspace.ts`, `src/server/routers/workspace.ts`, `src/server/routers/__tests__/workspace.test.ts`

**Tell the skill:**
> "Implement workspace tRPC router. Procedures: create (protected — generates slug from name + timestamp, creates Workspace, then creates WorkspaceMember with role ADMIN for the creator), getById (workspaceProcedure, includes members+user), listMine (protected — findMany where user is a member), updateSettings (workspaceProcedure, ADMIN only, updates name), generateInviteCode (workspaceProcedure, ADMIN only, sets new randomUUID as inviteCode). Tests: create makes creator ADMIN; MEMBER cannot call generateInviteCode; MANAGER cannot call generateInviteCode."

Implement workspace CRUD: `create` (creates workspace + ADMIN WorkspaceMember for creator), `getById`, `listMine`, `updateSettings` (ADMIN only), `generateInviteCode` (ADMIN only — rotates invite code). RBAC enforced by `requireRole`.

- [ ] Write Zod schemas
- [ ] Write failing tests (creator becomes ADMIN; MEMBER/MANAGER cannot rotate invite code)
- [ ] Confirm tests FAIL, implement router, confirm tests PASS
- [ ] Add workspaceRouter to root router
- [ ] Commit

---

### Task 6: Member Router + Tests

**Skill:** `/tdd-feature`
**Files:** `src/lib/validations/member.ts`, `src/server/routers/member.ts`, `src/server/routers/__tests__/member.test.ts`

**Tell the skill:**
> "Implement member tRPC router. Procedures: join (protected — find workspace by inviteCode, throw NOT_FOUND if missing, return existing membership if already joined, else create with role MEMBER), list (workspaceProcedure — findMany with user select), updateRole (workspaceProcedure, ADMIN only — update member role), remove (workspaceProcedure — ADMIN removes anyone; MANAGER removes MEMBERs only, throws FORBIDDEN otherwise; on remove, null out assigneeId on tasks in that workspace for that user). Tests: join idempotent; join with bad code → NOT_FOUND; ADMIN can updateRole; MANAGER cannot updateRole → FORBIDDEN; ADMIN can remove MANAGER; MANAGER cannot remove MANAGER → FORBIDDEN; MEMBER cannot remove anyone → FORBIDDEN."

Implement membership management: `join` (valid invite code → MEMBER role, idempotent), `list`, `updateRole` (ADMIN only), `remove` (ADMIN removes anyone; MANAGER removes MEMBERs only; on remove, null out `assigneeId` on workspace tasks for that user).

- [ ] Write Zod schemas
- [ ] Write failing tests for join, updateRole, and remove RBAC rules
- [ ] Confirm tests FAIL, implement router, confirm tests PASS
- [ ] Add memberRouter to root router
- [ ] Commit

---

### Task 7: Dashboard Layout + Workspace UI

**Skill:** `/new-feature`, `@ui-designer` for polish
**Files:** All layout components, workspace components, and dashboard pages listed in the file map above

**Tell the skill:**
> "Build the authenticated dashboard shell. DashboardLayout wraps Sidebar + main content. Sidebar: workspace list from trpc.workspace.listMine, active workspace highlighted, '+ New workspace' link at bottom. Topbar: breadcrumb + user avatar dropdown with sign-out. Dashboard layout.tsx: Server Component that calls auth(), redirects to /login if no session, wraps children in DashboardLayout. Root page.tsx: Server Component that finds first workspace membership and redirects to /workspaces/[id], or to /workspaces/new if none. WorkspaceForm: react-hook-form create workspace, calls trpc.workspace.create, redirects after. Settings page: shows MemberList (with RoleBadge chips), InviteCodeBox (shows code + rotate button for ADMIN). Use shadcn/ui components throughout."

Build the authenticated shell: sidebar with workspace switcher, topbar with breadcrumb + user menu. Root page redirects to first workspace or `/workspaces/new`. Workspace home lists projects. Settings page shows member list with role badges and invite code (ADMIN sees rotate button). Dashboard layout uses a Server Component session guard that redirects to `/login` if unauthenticated.

- [ ] Build DashboardLayout, Sidebar, Topbar
- [ ] Build workspace UI components (RoleBadge, InviteCodeBox, MemberList, WorkspaceForm)
- [ ] Build all dashboard pages and auth layout
- [ ] Smoke test: register → create workspace → invite via code → see members
- [ ] Commit

---

## Chunk 3: Slice 2 — Task Core

### Task 8: Project + Task Routers

**Skill:** `/tdd-feature`
**Files:** `src/lib/validations/project.ts`, `src/lib/validations/task.ts`, `src/server/routers/project.ts`, `src/server/routers/task.ts`, `src/server/routers/__tests__/project.test.ts`, `src/server/routers/__tests__/task.test.ts`

**Tell the skill:**
> "Implement project and task tRPC routers. Project router: create/update/archive require ADMIN or MANAGER (requireRole); list excludes archivedAt!=null; getById returns any (including archived). Task router: create (any member, sets createdBy); list (findMany by projectId, include assignee+creator); update (assertTaskOwner — ADMIN/MANAGER unrestricted, MEMBER only if createdBy or assigneeId matches); updateStatus (any member); delete (same assertTaskOwner); bulkCreate (any member, sets aiGenerated: true + sourceNoteId, uses $transaction). Key test cases: MEMBER cannot delete task they don't own; MEMBER can delete task they created; MEMBER can delete task assigned to them; MANAGER can delete any task; bulkCreate sets aiGenerated:true on all tasks."

**Project router:** `create`/`update`/`archive` require ADMIN or MANAGER; `list` excludes archived; `getById` returns archived too (for audit links).

**Task router:** `create`, `list`, `update`, `updateStatus` (any member), `delete`, `bulkCreate` (sets `aiGenerated: true` and `sourceNoteId`). RBAC for `update`/`delete`: ADMIN/MANAGER act on any task; MEMBER only on tasks they created or are assigned to.

- [ ] Write Zod schemas for project and task
- [ ] Write failing task tests (RBAC ownership + bulkCreate aiGenerated flag)
- [ ] Confirm tests FAIL, implement both routers, confirm tests PASS
- [ ] Add both routers to root router
- [ ] Commit

---

### Task 9: Task UI — List View

**Skill:** `/new-feature`, `@ui-designer` for polish
**Files:** All hooks, task components, board components, form components, and project pages listed in the file map above

**Tell the skill:**
> "Build the task list view UI. useTasks hook: trpc.task.list.useQuery with refetchInterval 10000. TaskStatusBadge: colored chip for TODO/IN_PROGRESS/IN_REVIEW/DONE. PriorityBadge: colored chip for LOW/MEDIUM/HIGH/URGENT. TaskRow: shows title, TaskStatusBadge, PriorityBadge, assignee avatar (initials fallback), due date (red if overdue), AI badge if aiGenerated. TaskForm: inline create form with title (required), priority select, due date picker, assignee select from workspace members. ListView: maps tasks to TaskRow, polling via useTasks, empty state, loading state. ViewToggle: Link buttons switching between /projects/[id] (list) and /projects/[id]/kanban. TaskDetailDrawer: right Sheet from shadcn, shows task fields + edit form. ProjectCard: name + task count mini status bar. Project page: TaskForm at top + ListView below + ViewToggle in header."

Build the task list view. `useTasks` polls every 10 seconds. `TaskForm` creates tasks inline. `TaskRow` shows title, status badge, priority badge, assignee avatar, due date, and AI badge. `TaskDetailDrawer` opens from a row click (comments wired in Slice 5). `ViewToggle` links to `/kanban`. Project card shows mini status bar.

- [ ] Build hooks (use-tasks, use-projects)
- [ ] Build badge components (TaskStatusBadge, PriorityBadge)
- [ ] Build TaskRow, TaskForm, ListView, ViewToggle, TaskDetailDrawer
- [ ] Build ProjectCard, ProjectList, project pages
- [ ] Smoke test: create project → create task → edit task → delete task
- [ ] Commit

---

## Chunk 4: Slice 3 — AI Features

### Task 10: Meeting Note Router + AI Extract Route

**Skill:** `/tdd-feature` (router), `/ai-feature` + `/add-api-route` (API route)
**Files:** `src/lib/validations/meeting-note.ts`, `src/server/services/ai.service.ts`, `src/server/routers/meeting-note.ts`, `src/server/routers/__tests__/meeting-note.test.ts`, `src/app/api/ai/extract/route.ts`

**Tell the skill:**
> "First create ai.service.ts: Anthropic SDK client + Vercel AI SDK createAnthropic provider, DEFAULT_MODEL='claude-sonnet-4-6', generateWithTools helper (uses raw Anthropic SDK, tool_choice: {type:'any'}). Install @anthropic-ai/sdk @ai-sdk/anthropic ai. Then implement meetingNote tRPC router: create (workspaceProcedure, sets status PENDING, uploadedBy from ctx.member.userId), getById, list (by workspaceId+projectId, desc), delete (ADMIN/MANAGER only). Tests: create returns PENDING note; MEMBER cannot delete → FORBIDDEN; ADMIN can delete. Then implement /api/ai/extract POST: auth guard, accept FormData with text OR file (.txt/.md only, max 1MB), create MeetingNote with status PROCESSING, call generateWithTools with extract_tasks tool (fields: title, description?, priority?), parse tool_use response with Zod, update note status to DONE, return {tasks, noteId}. On error: return 422, do NOT update note status to DONE."

Create the AI service singleton (`DEFAULT_MODEL = 'claude-sonnet-4-6'`, `generateWithTools` helper using raw Anthropic SDK). Implement meeting note tRPC router (`create`, `getById`, `list`, `delete` — delete requires ADMIN/MANAGER). Implement `/api/ai/extract` POST route: accepts text or `.txt/.md` file (max 1MB), creates MeetingNote record, calls Claude with `extract_tasks` tool, returns extracted tasks. Install `@anthropic-ai/sdk @ai-sdk/anthropic ai`.

- [ ] Write Zod schemas
- [ ] Write failing tests (create returns PENDING; MEMBER cannot delete)
- [ ] Confirm tests FAIL, create AI service, implement meeting note router, confirm tests PASS
- [ ] Implement AI extract API route
- [ ] Add meetingNoteRouter to root router
- [ ] Commit

---

### Task 11: AI Chat Route + AI Components

**Skill:** `/ai-feature`, `/add-api-route`
**Files:** `src/app/api/ai/chat/route.ts`, `src/hooks/use-meeting-notes.ts`, `src/components/ai/AIInputBar.tsx`, `src/components/ai/MeetingNoteUploader.tsx`, `src/components/ai/ExtractedTasksPreview.tsx`, `src/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/meeting-notes/page.tsx`

**Tell the skill:**
> "Implement /api/ai/chat POST streaming route using Vercel AI SDK streamText. Auth guard first. Request body: {prompt, projectContext: {projectId, projectName, members, existingTasks?}}. System prompt includes project name and member list. Tool: create_task (title, description?, priority?, dueDate?, assigneeId?) — execute just returns args for client-side confirmation, not auto-created. maxSteps:2. Return result.toDataStreamResponse(). Then build AIInputBar component: useChat hook pointing to /api/ai/chat, body includes projectContext, onToolCall sets pendingTask state when create_task fires, shows confirmation card with Confirm/Discard buttons, Confirm calls trpc.task.create.mutate. Build MeetingNoteUploader: paste/file mode toggle, calls /api/ai/extract with FormData, calls onExtracted(tasks, noteId) on success. Build ExtractedTasksPreview: checkbox list of extracted tasks, all selected by default, Confirm button calls trpc.task.bulkCreate.mutate, Retry button. Meeting notes page orchestrates Uploader → Preview states."

Implement streaming AI chat route using Vercel AI SDK `streamText` with a `create_task` tool. The tool returns proposed task data for client-side confirmation (not auto-created). Build `AIInputBar` (natural language → AI suggestion card → Confirm/Discard). Build `MeetingNoteUploader` (paste text or upload file → calls `/api/ai/extract`). Build `ExtractedTasksPreview` (checkboxes → calls `trpc.task.bulkCreate` on confirm). Add AIInputBar to project page. Build meeting notes page.

- [ ] Implement AI chat streaming route
- [ ] Build AIInputBar, MeetingNoteUploader, ExtractedTasksPreview
- [ ] Build meeting notes page
- [ ] Smoke test: natural language → confirm task; upload notes → extract → confirm tasks
- [ ] Commit

---

## Chunk 5: Slice 4 — Kanban View

### Task 12: Kanban Board

**Skill:** `/new-feature`, `@ui-designer` for polish
**Files:** `src/components/board/KanbanBoard.tsx`, `src/components/board/KanbanColumn.tsx`, `src/components/task/TaskCard.tsx`, `src/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/kanban/page.tsx`

**Tell the skill:**
> "Build a Kanban board with drag-and-drop. Install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities. TaskCard: useSortable from @dnd-kit/sortable, shows title (line-clamp-2), PriorityBadge, AI badge if aiGenerated, click handler opens TaskDetailDrawer. KanbanColumn: useDroppable with status as id, SortableContext with verticalListSortingStrategy, column header shows status label + task count. KanbanBoard: DndContext with PointerSensor (activationConstraint distance:8), four KanbanColumns for TODO/IN_PROGRESS/IN_REVIEW/DONE, onDragEnd calls trpc.task.updateStatus.mutate with new status. Kanban page: header with ViewToggle, renders KanbanBoard. Shares useTasks hook (refetchInterval 10s) and TaskDetailDrawer from Slice 2."

Four-column Kanban board using `@dnd-kit`. Dragging a card to a new column calls `trpc.task.updateStatus`. `TaskCard` is a compact draggable card with title, priority badge, and AI badge. Clicking a card opens `TaskDetailDrawer`. Install `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.

- [ ] Install @dnd-kit packages
- [ ] Build TaskCard (draggable), KanbanColumn (droppable), KanbanBoard (drag handler)
- [ ] Build Kanban page
- [ ] Smoke test: drag card between columns → status updates → list view reflects change
- [ ] Commit

---

## Chunk 6: Slice 5 — Collaboration

### Task 13: AuditLog Helper + Comment Router

**Skill:** `/tdd-feature`
**Files:** `src/server/lib/audit.ts`, `src/lib/validations/comment.ts`, `src/server/routers/comment.ts`, `src/server/routers/audit-log.ts`, `src/server/routers/__tests__/comment.test.ts`

**Tell the skill:**
> "Create writeAuditLog helper at src/server/lib/audit.ts: takes (ctx, action: AuditAction, entityType, entityId, workspaceId, metadata?) and writes to db.auditLog. Then implement comment tRPC router: create (workspaceProcedure, creates comment, calls writeAuditLog, extracts @mentions via regex, fires inngest.send({name:'mention.created', data:{commentId, taskId, mentions, actorId}}) if any), list (by taskId, include author select), delete (fetch comment + author's workspace role; MEMBER can delete own; MANAGER can delete MEMBER's but not ADMIN's or MANAGER's; ADMIN can delete any; else FORBIDDEN). Implement auditLog router: list + listRecentForWorkspace (ADMIN/MANAGER only, take N, include actor select), listForTask (any member, entityType='task'). Tests: 5 RBAC cases for comment.delete: own→ok, other MEMBER→FORBIDDEN for MEMBER deleter, MANAGER deletes MEMBER→ok, MANAGER deletes ADMIN→FORBIDDEN, ADMIN deletes any→ok."

Create `writeAuditLog` helper. Implement comment router: `create` (any member; writes audit log; fires Inngest `mention.created` event for @mentions), `list`, `delete` (RBAC: MEMBER deletes own; MANAGER deletes MEMBER's; ADMIN deletes any). Implement audit log router: `list` + `listRecentForWorkspace` (ADMIN/MANAGER only), `listForTask` (any member).

- [ ] Create audit log helper
- [ ] Write failing comment tests (all five RBAC delete cases)
- [ ] Confirm tests FAIL, implement both routers, confirm tests PASS
- [ ] Add both routers to root router
- [ ] Commit

---

### Task 14: Inngest Setup + Collaboration UI

**Skill:** `/new-feature`
**Files:** `src/inngest/client.ts`, `src/inngest/functions/mention-notification.ts`, `src/app/api/inngest/route.ts`, `src/components/comments/CommentInput.tsx`, `src/components/comments/CommentThread.tsx`

**Tell the skill:**
> "Set up Inngest. Client at src/inngest/client.ts: new Inngest({id:'task-management'}). Function send-mention-notification: triggered by 'mention.created' event, receives {commentId, taskId, mentions, actorId}, looks up task title and actor name from db, logs notification (console.error — email sending is future work). Route handler at src/app/api/inngest/route.ts: serve({client, functions:[sendMentionNotification]}), export GET POST PUT. Then build CommentInput component: textarea, calls trpc.comment.create.mutate, clears on success, shows loading state. CommentThread: trpc.comment.list.useQuery with refetchInterval 10000, renders list of comments with author name, relative timestamp (date-fns formatDistanceToNow), delete button (calls trpc.comment.delete.mutate). Wire both into TaskDetailDrawer below task details section."

Set up Inngest: client singleton, `send-mention-notification` function (triggered by `mention.created` — looks up task + actor, logs notification), Inngest route handler. Build `CommentInput` (textarea, calls `trpc.comment.create`). Build `CommentThread` (polls every 10 seconds). Wire both into `TaskDetailDrawer`.

- [ ] Create Inngest client, mention function, route handler
- [ ] Build CommentInput and CommentThread
- [ ] Wire comment components into TaskDetailDrawer
- [ ] Run full test suite (`pnpm test`) — all pass
- [ ] Commit

---

## Chunk 7: Slice 6 — Enterprise

### Task 15: Dashboard Router + Page

**Skill:** `/tdd-feature` (router), `/new-feature` (page)
**Files:** `src/server/routers/dashboard.ts`, `src/server/routers/__tests__/dashboard.test.ts`, `src/hooks/use-dashboard.ts`, `src/app/(dashboard)/workspaces/[workspaceId]/dashboard/page.tsx`, `src/app/(dashboard)/workspaces/[workspaceId]/dashboard/DashboardClient.tsx`

**Tell the skill:**
> "Implement dashboard.workspaceMetrics tRPC procedure (workspaceProcedure, ADMIN/MANAGER only via requireRole). Uses $transaction to fetch in parallel: open task count (status != DONE), completed this week (status=DONE, updatedAt >= 7 days ago), overdue count (status!=DONE, dueDate < now), top 5 assignees by open task count (groupBy assigneeId), project list with per-status task counts. Tests: MEMBER → FORBIDDEN; ADMIN gets correct openCount; rolling 7-day window (tasks before 7 days not counted). Build use-dashboard hook (refetchInterval 30000). Build dashboard page.tsx as Server Component: auth() → redirect if no session; check WorkspaceMember role → redirect MEMBER to workspace home; render DashboardClient. DashboardClient: calls useDashboardMetrics + trpc.auditLog.listRecentForWorkspace, renders 3 metric cards (open/completed/overdue) + recent activity feed."

`dashboard.workspaceMetrics` (ADMIN/MANAGER only): returns open task count, completed-this-week (rolling 7 days), overdue count, top 5 assignees by open tasks, per-project status breakdowns — all in a single `$transaction`. Server Component page does RBAC redirect (MEMBER → workspace home). `DashboardClient` polls every 30 seconds and renders metric cards + recent activity feed.

- [ ] Write failing tests (MEMBER forbidden; correct counts; rolling 7-day window)
- [ ] Confirm tests FAIL, implement dashboard router, confirm tests PASS
- [ ] Build use-dashboard hook, dashboard page (RBAC guard), DashboardClient
- [ ] Add dashboardRouter to root router
- [ ] Commit

---

### Task 16: Audit Log Page + Final Wiring

**Skill:** `/new-feature`, then `/verification-before-completion`
**Files:** `src/app/(dashboard)/workspaces/[workspaceId]/settings/audit/page.tsx`, `src/app/(dashboard)/workspaces/[workspaceId]/settings/audit/AuditLogClient.tsx`

**Tell the skill:**
> "Build audit log page. page.tsx: Server Component, auth() + WorkspaceMember role check, redirect MEMBER to /workspaces/[id]/settings, render AuditLogClient. AuditLogClient: calls trpc.auditLog.list.useQuery({workspaceId, limit:100}), renders a table with columns: Actor (name), Action (monospace), Entity (entityType/entityId first 8 chars, monospace), When (formatDistanceToNow). Empty state: 'No audit events yet.' Then wire up complete root router in src/server/routers/index.ts — must include auth, workspace, member, project, task, comment, auditLog, dashboard, meetingNote. Run pnpm test, pnpm test:coverage (target >80% server), pnpm type-check, pnpm lint — all must pass clean."

Server Component RBAC guard (MEMBER → settings page). `AuditLogClient` renders a table: actor, action, entity, timestamp. Verify root router includes all sub-routers: `auth`, `workspace`, `member`, `project`, `task`, `comment`, `auditLog`, `dashboard`, `meetingNote`. Run full checks.

- [ ] Build audit log page and AuditLogClient
- [ ] Verify complete root router wiring
- [ ] Run `pnpm test` — all pass; `pnpm test:coverage` — >80% server coverage
- [ ] Run `pnpm type-check` and `pnpm lint` — no errors
- [ ] Final commit

---

## Chunk 8: E2E Tests

### Task 17: Playwright E2E Tests

**Skill:** `/gen-tests`
**Files:** `tests/e2e/auth.spec.ts`, `tests/e2e/task-management.spec.ts`, `tests/e2e/ai-features.spec.ts`, `tests/e2e/kanban.spec.ts`, `tests/e2e/rbac.spec.ts`

**Tell the skill:**
> "Write Playwright E2E tests for 5 critical paths. auth.spec: register with unique email → redirected to /workspaces/new; login → redirected to dashboard; logout clears session. task-management.spec: register → create workspace → create project → create task (title+priority) → verify appears in list → click task → edit title in drawer → delete task → verify gone. ai-features.spec: navigate to meeting-notes page → paste sample text → click Extract → verify task checklist appears → check all → Confirm → verify tasks in list view. kanban.spec: navigate to /kanban → drag first card from TODO column to IN_PROGRESS column → verify card appears in IN_PROGRESS → navigate to list view → verify same task shows IN_PROGRESS status. rbac.spec: create workspace as User A (ADMIN), create task as User A, login as User B (MEMBER, joined via invite), attempt to delete User A's task via direct tRPC call → verify FORBIDDEN response."

Write end-to-end tests covering the critical paths:
- **auth**: register + login + logout flows
- **task-management**: register → create workspace → create project → create task → update → delete
- **ai-features**: AI chat task creation + meeting notes extraction + bulk confirm
- **kanban**: drag card to new column → verify status updated in list view
- **rbac**: MEMBER cannot delete unowned task (tRPC returns FORBIDDEN)

- [ ] Write all five E2E specs
- [ ] Run `pnpm test:e2e` — all pass
- [ ] Commit
