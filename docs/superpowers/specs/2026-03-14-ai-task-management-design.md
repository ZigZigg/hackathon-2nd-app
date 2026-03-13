# AI-Powered Task Management — Design Spec
**Date:** 2026-03-14
**Status:** Approved (pending pre-release version confirmation — see Section 2)

---

## 1. Overview

An enterprise-grade task management web application with two AI-powered features. Full-scope product built using vertical slices so a working demo exists at every stage.

**In scope:**
- Workspace + project + task management (full CRUD)
- Team collaboration: comments, @mentions, activity feed (sourced from AuditLog)
- Two views: List and Kanban
- AI Task Assistant — natural language → task via dedicated input bar
- AI Meeting Notes → Tasks — paste text or upload `.txt`/`.md` file; AI extracts action items
- Polling-based live updates (10s refetch interval)
- RBAC: ADMIN, MANAGER, MEMBER roles at workspace level
- Dashboard (defined metrics, see Section 9) and Audit Log

**Out of scope:**
- Gantt view
- AI Workload Balancing
- AI Auto-prioritization
- AI Deadline Risk Alerts
- WebSocket real-time (using polling instead)
- Schema-per-tenant (using shared schema with `workspaceId` FK)
- Custom report builder
- Invite code expiry (v1 simplification — noted in Section 3)
- Comment editing (comments are immutable once posted)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 *(pre-release — verify GA before implementation)*, App Router, TypeScript strict |
| UI | Tailwind CSS v4 + shadcn/ui + Radix primitives |
| API | tRPC v11 + Zod validation |
| Database | PostgreSQL via Prisma 7 *(pre-release — verify GA before implementation)* + Supabase (pgvector enabled) |
| Auth | NextAuth v5 (beta) + RBAC |
| AI | Anthropic claude-sonnet-4-6 via Vercel AI SDK + streaming |
| Jobs | Inngest — used for @mention email notifications (Slice 5) |
| Testing | Vitest 4 + Playwright (E2E) |
| Deploy | Vercel |

> Versions reflect `package.json` as of 2026-03-14. Pin exact versions at implementation time and verify pre-release stability.
> **Implementation gate:** Do not begin Slice 1 until Next.js 16 and Prisma 7 are confirmed stable GA. Fallback versions if pre-release at implementation time: **Next.js 15.x** and **Prisma 6.x** (both proven stable). All App Router patterns and Prisma query API in this spec are compatible with both major versions.

---

## 3. Data Model

> Conceptual model — Prisma schema with types, indexes, and relations written during implementation.
> All models include `createdAt: DateTime @default(now())` and `updatedAt: DateTime @updatedAt` unless otherwise noted (enforced by Prisma).

### Entities

**User** (managed by NextAuth)
- `id`, `name`, `email`, `image`
- Relations: `workspaces (WorkspaceMember[])`, `assignedTasks (Task[])`

**Workspace**
- `id`, `name`, `slug`, `inviteCode: String (unique)`
- `inviteCode` is a static random string generated on workspace creation. No expiry in v1 — this is a known simplification. ADMINs can rotate it via `workspace.generateInviteCode`.
- Relations: `members (WorkspaceMember[])`, `projects (Project[])`, `meetingNotes (MeetingNote[])`

**WorkspaceMember**
- `id` (PK)
- `workspaceId`, `userId`
- `role: ADMIN | MANAGER | MEMBER`
- `joinedAt: DateTime @default(now())`
- `invitedBy: String?` — stored userId of the User who granted access (bare string, no Prisma relation — no referential integrity; user deletion does not cascade). Used for AuditLog display only.

**Project**
- `id`, `name`, `description`, `workspaceId`, `createdBy`
- `archivedAt: DateTime?` — soft delete; `project.archive` sets this field. Hard deletion is out of scope. AuditLog and Task records are preserved on archive.
- `project.list` excludes archived projects by default. `project.getById` returns archived projects (direct links remain valid). A `includeArchived: boolean` filter param may be added in v2.
- Relations: `tasks (Task[])`

**Task**
- `id`, `title`, `description`
- `status: TODO | IN_PROGRESS | IN_REVIEW | DONE`
- `priority: LOW | MEDIUM | HIGH | URGENT`
- `projectId`, `assigneeId`, `createdBy`, `dueDate`
- `aiGenerated: Boolean @default(false)` — true if created by AI
- `sourceNoteId: String?` — Prisma `@relation` to MeetingNote with `onDelete: SetNull` (tasks are preserved if the meeting note is later deleted)

**MeetingNote**
- `id`, `workspaceId`, `projectId` — scoped to a project (matches the meeting-notes page URL: `/workspaces/[workspaceId]/projects/[projectId]/meeting-notes/`)
- `uploadedBy`
- `rawContent: String` — pasted text or extracted file content
- `status: PENDING | PROCESSING | DONE | FAILED @default(PENDING)`
- `errorMessage: String?` — populated on FAILED status for display in UI
- `processedAt: DateTime?` — set when status transitions to DONE
- Relations: `tasks (Task[])`

**Comment**
- `id`, `taskId`, `authorId`, `body`

**AuditLog**
- `id`, `workspaceId`, `actorId`, `action`, `entityType`, `entityId`, `metadata (JSON)`
- No `updatedAt` — audit entries are immutable.

---

## 4. Architecture

### Build Strategy: Vertical Slices

| Slice | Scope | Key deliverable |
|-------|-------|----------------|
| 1 | Foundation | Workspace creation, open registration, invite code membership, RBAC middleware |
| 2 | Task Core | Project + Task CRUD, List view, assignee/priority/due date |
| 3 | AI Features | AI Task Assistant (input bar + streaming) + Meeting Notes → Tasks (paste/upload) |
| 4 | Kanban View | Drag-and-drop Kanban board, view toggle in URL |
| 5 | Collaboration | Comments, @mentions, activity feed (from AuditLog), 10s polling |
| 6 | Enterprise | Dashboard (Section 9), Audit Log page |

### Page Structure

```
(auth)/
  login/
  register/

(dashboard)/
  page.tsx                          ← redirect to first workspace or onboarding
  workspaces/
    new/
    [workspaceId]/
      page.tsx                      ← workspace home (project list)
      settings/                     ← members, invite codes, roles
        audit/                      ← full audit log (ADMIN and MANAGER only)
      dashboard/                    ← workspace metrics and activity feed (ADMIN and MANAGER only)
      projects/
        new/
        [projectId]/
          page.tsx                  ← task board (List view default)
          kanban/                   ← Kanban view
          meeting-notes/            ← upload / paste meeting notes

api/
  ai/chat/route.ts                  ← streaming AI Task Assistant (Vercel AI SDK)
  ai/extract/route.ts               ← meeting notes → task extraction (non-streaming)
```

### tRPC Routers

| Router | Key procedures | Notes |
|--------|---------------|-------|
| `workspace` | `create`, `getById`, `listMine`, `updateSettings`, `generateInviteCode` | |
| `member` | `join`, `list`, `updateRole`, `remove` | See RBAC table for per-procedure permissions |
| `project` | `create`, `getById`, `list`, `update`, `archive` | `archive` is a soft-delete — sets `archivedAt` on the Project record; no hard deletion |
| `task` | `create`, `getById`, `list`, `update`, `updateStatus`, `delete`, `bulkCreate` | `updateStatus` is lightweight (Kanban drag); `update` covers all fields |
| `comment` | `create`, `list`, `delete` | `delete`: see Section 6 Comment Delete Clarification for full role matrix |
| `auditLog` | `list`, `listForTask`, `listRecentForWorkspace` | `list`: ADMIN and MANAGER only (Audit Log page, full workspace feed). `listForTask(taskId)`: all roles — activity feed inside TaskDetailDrawer. `listRecentForWorkspace(workspaceId, limit)`: all roles — last 20 **workspace-wide** entries on workspace home page (intentionally unfiltered — transparency is a feature of collaborative tools; MEMBERs can see all workspace activity) |
| `dashboard` | `workspaceMetrics` | Returns: open task count, tasks completed this week, overdue task count, tasks-per-member top 5, per-project status breakdown. ADMIN and MANAGER only. |
| `meetingNote` | `create`, `getById`, `list`, `delete` | `delete`: ADMIN or MANAGER only; notes are immutable after processing — no `update` |

#### `task.updateStatus` vs `task.update`
- `updateStatus(taskId, status)` — lightweight procedure called by Kanban drag-and-drop. Any MEMBER with access to the project can call this.
- `update(taskId, { title, description, priority, dueDate, assigneeId, … })` — full edit. Requires MANAGER role or task ownership (see RBAC Section 6).

#### `task.bulkCreate`
- Input: `{ tasks: TaskCreateInput[], projectId: string, sourceNoteId?: string }`
- `TaskCreateInput`: `{ title: string, description?: string, priority?: Priority, dueDate?: Date, assigneeId?: string }`
- Execution: wrapped in a Prisma `$transaction` — all tasks created or none (full rollback on any Zod or DB failure)
- All created tasks have `aiGenerated: true` and `sourceNoteId` set when called from meeting note extraction

### AI API Routes

#### `POST /api/ai/chat` — AI Task Assistant
- Transport: JSON body `{ prompt: string, projectContext: { projectId, members[], existingTasks[] } }`
- Uses Vercel AI SDK `streamText` with Claude tool use to enforce output structure
- Streams prose response, terminates with a structured tool call result: `{ title, description, priority: Priority, dueDate?: ISO string, assigneeId?: string }`
- Client parses the tool result from the stream to pre-populate the task preview card

#### `POST /api/ai/extract` — Meeting Notes → Tasks
- Transport: `multipart/form-data`; field `text` (string) or field `file` (.txt or .md, max 1 MB)
- Server reads file with `request.formData()` and extracts text content server-side
- 1 MB limit enforced before sending to Claude (well within Vercel's body limit)
- **Synchronous** — the MeetingNote record status transitions are managed within the HTTP request: `PENDING → PROCESSING` (on request start) → `DONE` or `FAILED` (on Claude response). No Inngest job is used for extraction.
- Returns `{ tasks: TaskCreateInput[], noteId: string }` JSON on success
- Claude output validated against the `TaskCreateInput` Zod schema in `src/lib/validations/task.ts` — same schema used by `task.bulkCreate`, single source of truth for both routes. Malformed AI responses return a 422 with `errorMessage` set on the MeetingNote record.
- **Retry:** client re-POSTs to `/api/ai/extract` with only `noteId: string` in the body (no re-upload of content). The server reads `MeetingNote.rawContent` from the DB using `noteId`, validates the record is in `FAILED` status (returns `BAD_REQUEST` otherwise), then re-runs extraction and updates the record in-place on success (status → DONE, `processedAt` set). No new `MeetingNote` record is created on retry.

#### Inngest — Background Jobs
Inngest is used exclusively for **@mention email notifications** (Slice 5):
- Trigger event: `mention.created` — fired from `comment.create` tRPC procedure when body contains `@userId`
- Function: `send-mention-notification` — looks up the mentioned user's email and sends a notification
- No other Inngest jobs are defined in v1.

---

## 5. UI/UX Structure

### Layout

```
RootLayout
  └── DashboardLayout
        ├── Sidebar — workspace switcher, project list, nav links
        ├── Topbar — breadcrumb, user menu, notifications bell
        └── PageContent
```

### Component Groups

| Group | Key Components |
|-------|---------------|
| `components/workspace/` | `WorkspaceCard`, `MemberList`, `InviteCodeBox`, `RoleBadge` |
| `components/project/` | `ProjectCard`, `ProjectList` |
| `components/task/` | `TaskCard`, `TaskRow`, `TaskStatusBadge`, `PriorityBadge`, `TaskDetailDrawer` |
| `components/board/` | `ListView`, `KanbanBoard`, `KanbanColumn`, `ViewToggle` |
| `components/ai/` | `AIInputBar`, `MeetingNoteUploader`, `ExtractedTasksPreview` |
| `components/comments/` | `CommentThread`, `CommentInput` |
| `components/forms/` | `TaskForm`, `ProjectForm`, `WorkspaceForm` |

### Key Interactions

- **TaskDetailDrawer** — clicking any task slides open a right-side drawer (not a new page); shows description, comments, activity feed (AuditLog entries for this task), assignee, due date, AI badge if `aiGenerated: true`
- **AIInputBar** — pinned above the task list; user types natural language, hits Enter, sees a preview card of the AI-generated task before confirming creation
- **ExtractedTasksPreview** — after meeting note processing, shows a checklist of extracted tasks; user deselects unwanted items before bulk-confirming. If all items are deselected, the confirm button is disabled. After confirmation, the MeetingNote record is retained (status → DONE) and all confirmed tasks have `sourceNoteId` set. Deselected tasks are not created. If `task.bulkCreate` fails after confirmation, the preview remains open with an error banner; the user can retry confirmation — `MeetingNote.status` is NOT modified by `bulkCreate` (it reflects extraction success only, not task-creation success). If extraction itself fails (status → FAILED), the UI shows the `errorMessage` with a retry button — retry re-POSTs to `/api/ai/extract` with only `noteId`; the server re-reads `rawContent` from the DB, no re-upload needed.
- **MeetingNoteUploader** — `projectId` is read from the URL params (`[projectId]` route segment); no project selector is needed. The component is only rendered within the project-scoped route.
- **ViewToggle** — Kanban / List switch in project topbar; state persisted in URL (`?view=kanban`)
- **Polling** — `refetchInterval: 10_000` on task list queries via tRPC + React Query

---

## 6. RBAC

Enforced server-side in tRPC procedures — never trust the client.

### Role Permissions

| Role | `task.update` / `task.delete` | `task.updateStatus` | Project | `updateRole` | `remove` member | Workspace settings | Comment delete |
|------|-------------------------------|--------------------|---------|--------------|-----------------|--------------------|---------------|
| `ADMIN` | Any task | Any task | Full CRUD | Any role | Anyone | Full access | Any comment |
| `MANAGER` | Any task (ownership bypass — intentional) | Any task | Full CRUD | FORBIDDEN | MEMBERs only | Read only | Own or any MEMBER's; not another MANAGER's or ADMIN's |
| `MEMBER` | Own tasks only (`createdBy` OR `assigneeId`) | Any task in project | Read only | — | — | Read only | Own only |

### Member Management Clarification
- `member.join` — any authenticated user with a valid `inviteCode`
- `member.list` — all roles
- `member.updateRole` — ADMIN only (can set any role); MANAGER has no access to `updateRole`
- `member.remove` — ADMIN can remove anyone; MANAGER can remove MEMBERs only

### Task Ownership
- For `task.update` and `task.delete`, a MEMBER may act if `task.createdBy === userId` OR `task.assigneeId === userId`.
- ADMIN and MANAGER bypass the ownership check unconditionally — a MANAGER can edit or delete any task including those created by an ADMIN. This is intentional: MANAGERs are trusted to manage all work in their workspace.
- When a member is removed and their `assigneeId` is nulled out, their `createdBy`-based ownership is preserved. They retain edit rights to tasks they created if they rejoin the workspace. MANAGERs and ADMINs can edit those tasks at any time regardless.
- Rejoin after removal does NOT restore prior `assigneeId` links — a MANAGER must explicitly reassign. Ownership after rejoin is `createdBy`-based only.

### Comment Delete Clarification
- MANAGER may delete their own comments or any MEMBER's comment, but not another MANAGER's or ADMIN's comment.
- ADMIN may delete any comment regardless of author.
- Server check order: `if comment.authorId === userId → allow; else check role hierarchy`.
- **Intentional asymmetry:** A MANAGER can delete any task (including ADMIN-created ones) but cannot delete an ADMIN's comment. Rationale: task management is a core MANAGER responsibility; comment moderation above their level requires ADMIN authority.
- **Comment editing (update) is out of scope for v1** — comments are immutable once posted.

### Member Removal Orphaned Data
- On `member.remove`: tasks where `assigneeId = removedUserId` are set to `assigneeId = null` (unassigned). Tasks where `createdBy = removedUserId` are retained unchanged (audit trail).
- `workspace.delete` is out of scope for v1 — workspaces cannot be deleted.

### Dashboard Route Access
- The `/workspaces/[workspaceId]/dashboard` route is accessible to ADMIN and MANAGER only.
- A MEMBER navigating to this URL is redirected to the workspace home page.
- Enforcement order: (1) the dashboard page component (Server Component) checks role first and redirects before rendering — this prevents any tRPC call from being made. (2) the tRPC `dashboard.workspaceMetrics` procedure returns `FORBIDDEN` as a secondary guard. The page redirect fires first; the tRPC guard is never reached for correctly redirected MEMBERs.

---

## 7. Error Handling

| Scenario | tRPC Code | User-facing message |
|----------|-----------|-------------------|
| Not authenticated | `UNAUTHORIZED` | "Please sign in to continue" |
| Insufficient role | `FORBIDDEN` | "You don't have access to this resource" |
| Resource not found | `NOT_FOUND` | "This item no longer exists" |
| Invalid input | `BAD_REQUEST` | Zod field-level messages shown inline |
| AI service failure | `INTERNAL_SERVER_ERROR` | "AI is unavailable right now, try again" |
| Malformed AI output | 422 (API route) | "AI returned an unexpected response, please try again" |
| File too large / wrong type | `BAD_REQUEST` | "Only .txt and .md files under 1MB are supported" |
| bulkCreate partial failure | `INTERNAL_SERVER_ERROR` | "Task creation failed, no tasks were saved. Please try again." (full rollback) |

- No raw errors or stack traces ever reach the client
- AI output validated through Zod before any DB write
- Meeting note content truncated to 32,000 characters before sending to Claude (character-count approximation — no tokenizer dependency required; safe upper bound for claude-sonnet-4-6 context)
- Rate limiting: out of scope for v1. No per-user or per-IP limit on AI routes — acceptable for a controlled enterprise deployment where users are authenticated.

---

## 8. Testing Strategy

### Unit Tests (Vitest) — target >80% server coverage

| Area | Approach |
|------|---------|
| tRPC routers | Mock Prisma client — happy path + auth/RBAC failure cases per procedure |
| Zod schemas | Valid and invalid input coverage for each schema |
| AI service utils | Mock Claude API — test task extraction parsing and Zod validation of AI output |
| `bulkCreate` logic | Assert `aiGenerated: true`, `sourceNoteId` set, transaction rollback on failure |
| RBAC middleware | Test MEMBER/MANAGER/ADMIN boundary conditions for each sensitive procedure |

### E2E Tests (Playwright) — critical user journeys

1. Register → create workspace → create project → create task (manual)
2. Use AI input bar → confirm AI-generated task appears in list with AI badge
3. Paste meeting notes → review extracted tasks → confirm bulk creation
4. Switch List ↔ Kanban view → drag task to new status column (use `@dnd-kit/core` for drag implementation; require `data-testid="kanban-card-{id}"` and `data-testid="kanban-column-{status}"` attributes; Playwright test uses `page.dragAndDrop()` or keyboard-based drag via `aria-grabbed` for reliability)
5. Invite member → member joins → sees workspace tasks
6. MEMBER (User B) attempts to delete a task where `createdBy = User A` and `assigneeId = null` → server returns FORBIDDEN (precondition: User B has no ownership relation to the task)

### Excluded
- UI snapshot tests (shadcn/ui components tested upstream)
- Real Claude API calls in tests (always mocked)

---

## 9. Dashboard

The dashboard (`/workspaces/[workspaceId]/dashboard`) displays the following fixed metrics. No custom report builder.

**Workspace-level widgets:**
- Total open tasks (status ≠ DONE) across all projects
- Tasks completed this week (count)
- Tasks per member (bar chart — top 5 assignees by open task count)
- Overdue tasks (dueDate < today AND status ≠ DONE)

**Project-level widgets (per project card):**
- Task count by status (TODO / IN_PROGRESS / IN_REVIEW / DONE) as a mini progress bar

**Activity feed:**
- Workspace home page: last 20 AuditLog entries via `auditLog.listRecentForWorkspace` — accessible to all roles
- TaskDetailDrawer: AuditLog entries for that task via `auditLog.listForTask` — accessible to all roles
- Full Audit Log page (`/workspaces/[workspaceId]/settings/audit`): complete history via `auditLog.list` — ADMIN and MANAGER only

All data sourced from tRPC queries — no separate analytics service.
