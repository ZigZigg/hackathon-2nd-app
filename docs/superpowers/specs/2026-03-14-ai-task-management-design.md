# AI-Powered Task Management — Design Spec
**Date:** 2026-03-14
**Status:** Approved

---

## 1. Overview

An enterprise-grade task management web application with two AI-powered features. Full-scope product built using vertical slices so a working demo exists at every stage.

**In scope:**
- Workspace + project + task management (full CRUD)
- Team collaboration: comments, @mentions, activity feed
- Two views: List and Kanban
- AI Task Assistant — natural language → task via dedicated input bar
- AI Meeting Notes → Tasks — paste text or upload `.txt`/`.md` file; AI extracts action items
- Polling-based live updates (10s refetch interval)
- RBAC: ADMIN, MANAGER, MEMBER roles at workspace level
- Dashboard & reporting, Audit Logs

**Out of scope:**
- Gantt view
- AI Workload Balancing
- AI Auto-prioritization
- AI Deadline Risk Alerts
- WebSocket real-time (using polling instead)
- Schema-per-tenant (using shared schema with `workspaceId` FK)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, App Router, TypeScript strict |
| UI | Tailwind CSS v4 + shadcn/ui + Radix primitives |
| API | tRPC v11 + Zod validation |
| Database | PostgreSQL via Prisma 7 + Supabase (pgvector enabled) |
| Auth | NextAuth v5 (beta) + RBAC |
| AI | Anthropic claude-sonnet-4-6 via Vercel AI SDK + streaming |
| Jobs | Inngest |
| Testing | Vitest 4 (unit) + Playwright (E2E) |
| Deploy | Vercel |

---

## 3. Data Model

> Conceptual model — Prisma schema with types, indexes, and relations written during implementation.

### Entities

**User** (managed by NextAuth)
- `id`, `name`, `email`, `image`
- Relations: `workspaces (WorkspaceMember[])`, `assignedTasks (Task[])`

**Workspace**
- `id`, `name`, `slug`, `inviteCode`
- Relations: `members (WorkspaceMember[])`, `projects (Project[])`, `meetingNotes (MeetingNote[])`

**WorkspaceMember**
- `workspaceId`, `userId`
- `role: ADMIN | MANAGER | MEMBER`

**Project**
- `id`, `name`, `description`, `workspaceId`, `createdBy`
- Relations: `tasks (Task[])`

**Task**
- `id`, `title`, `description`
- `status: TODO | IN_PROGRESS | IN_REVIEW | DONE`
- `priority: LOW | MEDIUM | HIGH | URGENT`
- `projectId`, `assigneeId`, `createdBy`, `dueDate`
- `aiGenerated: Boolean` — true if created by AI
- `sourceNoteId: String?` — FK to MeetingNote if extracted from meeting

**MeetingNote**
- `id`, `workspaceId`, `uploadedBy`
- `rawContent: String` — pasted text or extracted file content
- `processedAt: DateTime?`
- Relations: `tasks (Task[])`

**Comment**
- `id`, `taskId`, `authorId`, `body`, `createdAt`

**AuditLog**
- `id`, `workspaceId`, `actorId`, `action`, `entityType`, `entityId`, `metadata (JSON)`, `createdAt`

### Key Design Decisions
- Multi-tenancy via shared schema — all entities scoped by `workspaceId`
- `aiGenerated` flag on Task enables filtering and UI badging
- `sourceNoteId` creates a traceable link: MeetingNote → extracted Tasks
- RBAC lives at `WorkspaceMember.role`, enforced server-side in tRPC procedures

---

## 4. Architecture

### Build Strategy: Vertical Slices

| Slice | Scope | Key deliverable |
|-------|-------|----------------|
| 1 | Foundation | Workspace creation, open registration, invite code membership, RBAC middleware |
| 2 | Task Core | Project + Task CRUD, List view, assignee/priority/due date |
| 3 | AI Features | AI Task Assistant (input bar + streaming) + Meeting Notes → Tasks (paste/upload) |
| 4 | Kanban View | Drag-and-drop Kanban board, view toggle in URL |
| 5 | Collaboration | Comments, @mentions, activity feed, 10s polling |
| 6 | Enterprise | Dashboard, reporting, Audit Log |

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
      projects/
        new/
        [projectId]/
          page.tsx                  ← task board (List view default)
          kanban/                   ← Kanban view
          meeting-notes/            ← upload / paste meeting notes

api/
  ai/chat/                          ← streaming AI Task Assistant (Vercel AI SDK)
  ai/extract/                       ← meeting notes → task extraction (non-streaming)
```

### tRPC Routers

| Router | Key procedures |
|--------|---------------|
| `workspace` | `create`, `getById`, `listMine`, `updateSettings`, `generateInviteCode` |
| `member` | `join`, `list`, `updateRole`, `remove` |
| `project` | `create`, `getById`, `list`, `update`, `delete` |
| `task` | `create`, `getById`, `list`, `update`, `updateStatus`, `delete`, `bulkCreate` |
| `comment` | `create`, `list`, `delete` |
| `auditLog` | `list` |
| `meetingNote` | `create`, `getById`, `list` |

### AI API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai/chat` | POST | Streams Claude response; natural language → structured task JSON |
| `/api/ai/extract` | POST | Accepts raw text or file upload; returns extracted task list (non-streaming) |

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

- **TaskDetailDrawer** — clicking any task slides open a right-side drawer (not a new page); shows description, comments, activity, assignee, due date, AI badge if `aiGenerated: true`
- **AIInputBar** — pinned above the task list; user types natural language, hits Enter, sees a preview card of the AI-generated task before confirming creation
- **ExtractedTasksPreview** — after meeting note processing, shows a checklist of extracted tasks; user deselects unwanted items before bulk-confirming
- **ViewToggle** — Kanban / List switch in project topbar; state persisted in URL (`?view=kanban`)
- **Polling** — `refetchInterval: 10_000` on task list queries via tRPC + React Query

---

## 6. RBAC

Enforced server-side in tRPC procedures — never trust the client.

| Role | Permissions |
|------|------------|
| `ADMIN` | Full access: workspace settings, member management, delete anything |
| `MANAGER` | Create/edit/delete projects and tasks, manage MEMBERs |
| `MEMBER` | Create/edit own tasks, comment, read all workspace content |

All workspace-scoped procedures validate `WorkspaceMember.role` before executing.

---

## 7. Error Handling

| Scenario | tRPC Code | User-facing message |
|----------|-----------|-------------------|
| Not authenticated | `UNAUTHORIZED` | "Please sign in to continue" |
| Insufficient role | `FORBIDDEN` | "You don't have access to this resource" |
| Resource not found | `NOT_FOUND` | "This item no longer exists" |
| Invalid input | `BAD_REQUEST` | Zod field-level messages shown inline |
| AI service failure | `INTERNAL_SERVER_ERROR` | "AI is unavailable right now, try again" |
| File too large / wrong type | `BAD_REQUEST` | "Only .txt and .md files under 1MB are supported" |

- No raw errors or stack traces ever reach the client
- AI output validated through Zod before any DB write — malformed AI responses rejected cleanly
- Meeting note content truncated to 8,000 tokens before sending to Claude

---

## 8. Testing Strategy

### Unit Tests (Vitest) — target >80% server coverage

| Area | Approach |
|------|---------|
| tRPC routers | Mock Prisma client — happy path + auth/RBAC failure cases |
| Zod schemas | Valid and invalid input coverage for each schema |
| AI service utils | Mock Claude API — test task extraction parsing and Zod validation of AI output |
| `bulkCreate` logic | Assert `aiGenerated: true` and `sourceNoteId` are set correctly |

### E2E Tests (Playwright) — critical user journeys

1. Register → create workspace → create project → create task (manual)
2. Use AI input bar → confirm AI-generated task appears in list with AI badge
3. Paste meeting notes → review extracted tasks → confirm bulk creation
4. Switch List ↔ Kanban view → drag task to new status column
5. Invite member → member joins → sees workspace tasks

### Excluded
- UI snapshot tests (shadcn/ui components tested upstream)
- Real Claude API calls in tests (always mocked)
