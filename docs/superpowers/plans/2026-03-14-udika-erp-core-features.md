# Udika ERP Core Features Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack ERP/CRM system for Udika covering 11 business modules: Auth/RBAC, Dashboard Analytics, Customer CRM, Event Management, Task Management, Work Schedule & Timesheet, Cash Flow, HR Management, Prop Inventory, Zalo Integration, and Monthly Reports.

**Architecture:** Monolithic Next.js 16 App Router with a single tRPC v11 root router composed of 11 domain routers, a single Prisma 7 schema for all models, and RBAC enforced at the tRPC middleware layer (inside `src/server/trpc.ts` — not a separate middleware file). External integrations (Zalo OA API, Google Drive) are wrapped in server-side service classes that are never imported by client components.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, tRPC v11, Prisma 7, Supabase PostgreSQL, NextAuth v5, Tailwind CSS v4, shadcn/ui, Inngest, Vitest 4, Playwright, pdfkit, exceljs, Vercel

---

## Available Skills & Agents Reference

Use this table to pick the right tool before starting each task. **Skills** are invoked as slash commands (e.g. `/tdd-feature`). **Agents** are dispatched via the `@agent-name` syntax.

### Skills (invoke BEFORE writing code)

| Skill | When to use |
|-------|-------------|
| `/tdd-feature` | Every new tRPC router or backend service — enforces RED→GREEN→REFACTOR cycle |
| `/new-feature` | Full-stack feature that needs schema + router + hook + form + page in sequence |
| `/db-migrate` | Any Prisma schema change — safely adds models and runs migration |
| `/add-api-route` | Next.js API routes (binary streams, webhooks) — NOT tRPC |
| `/gen-tests` | When test coverage for a router drops below 80% |
| `/fix-bug` | Any unexpected behavior — reproduce first, then fix |
| `/supabase-postgres-best-practices` | Before writing complex Prisma queries or finalising schema |

### Agents (dispatch for specialized review or isolated implementation)

| Agent | When to dispatch |
|-------|-----------------|
| `@implementer` | Focused single-task implementation with full TDD discipline |
| `@ui-designer` | Designing page layouts, component libraries, visual polish |
| `@ux-reviewer` | Review loading/empty/error states, accessibility, mobile responsiveness |
| `@db-analyst` | After writing aggregation or join-heavy queries — finds N+1, missing indexes |
| `@postgres-pro` | Schema design decisions, query optimization, complex Postgres patterns |
| `@spec-reviewer` | Stage 1 code review — does implementation match the spec? Run after each phase. |
| `@quality-reviewer` | Stage 2 code review — security, performance, code quality. Run after `@spec-reviewer` passes. |
| `@security-auditor` | Full security audit of auth, webhook validation, API exposure |

### Hooks (fire automatically — no action required)

| Hook | Trigger | What it does |
|------|---------|--------------|
| `tdd-guard.sh` | Before any Write to an implementation file | Blocks write if no test file exists for the module |
| `pre-bash-guard.sh` | Before any Bash command | Blocks catastrophic commands (rm -rf, DROP TABLE, etc.) |
| `post-write.sh` | After every file save | Runs ESLint + TypeScript check on the saved file |
| `post-edit-test.sh` | After saving implementation files | Auto-runs related test file |
| `on-commit-check.sh` | After git commit | Runs full `pnpm test` suite |

### Phase → Skill/Agent Map

| Phase | Primary Skill | Supporting Agents |
|-------|--------------|-------------------|
| 1. Base Setup | manual (no skill) | — |
| 2. Schema | `/db-migrate` × 10 steps | `@postgres-pro` (design review), `@db-analyst` (index check) |
| 3. Auth & RBAC | `/tdd-feature` | `@spec-reviewer` after completion |
| 4. Dashboard | `/tdd-feature` | `@db-analyst` (aggregation queries), `@ui-designer` (charts) |
| 5. Customer CRM | `/new-feature` | `@ui-designer` (list/detail), `@ux-reviewer` (states), `@spec-reviewer` |
| 6. Event Management | `/new-feature` | `@ui-designer` (calendar, quotation builder), `@spec-reviewer` |
| 7. Task Management | `/new-feature` | `@ui-designer` (Kanban), `@ux-reviewer` (drag-and-drop, mobile) |
| 8. Timesheets | `/tdd-feature` | `@ui-designer` (calendar), `@spec-reviewer` |
| 9. Cash Flow | `/tdd-feature` | `@db-analyst` (period queries), `@ui-designer` (charts) |
| 10. HR | `/tdd-feature` | `@ui-designer` (directory), `@spec-reviewer` |
| 11. Inventory | `/tdd-feature` | `@db-analyst` (allocation atomicity), `@spec-reviewer` |
| 12. Zalo | `/tdd-feature` + `/add-api-route` | `@security-auditor` (webhook validation) |
| 13. Reports | `/tdd-feature` + `/add-api-route` | `@db-analyst` (aggregation), `@spec-reviewer` |
| 14. Layout & E2E | `@ui-designer` | `@ux-reviewer` (a11y + mobile), `@spec-reviewer` → `@quality-reviewer` |

---

## Chunk 1: Foundation (Phases 1–3)

---

### Phase 1: Base Setup & Infrastructure

**Goal:** Create a runnable Next.js 16 project with all dependencies configured, env wired up, and a working dev server.

**Skill/Agent:** No skill invocation — manual bootstrapping. The `post-write.sh` hook will automatically lint/typecheck every file as you write it.

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`
- Create: `src/app/layout.tsx` — root layout
- Create: `src/lib/utils.ts` — `cn()` utility from shadcn
- Create: `src/server/db.ts` — Prisma client singleton (import this everywhere, never `new PrismaClient()` directly)
- Create: `src/server/trpc.ts` — tRPC init, context type, `publicProcedure`, `protectedProcedure` stubs
- Create: `src/server/root.ts` — merged root router (empty for now)
- Create: `src/app/api/trpc/[trpc]/route.ts` — tRPC HTTP adapter
- Create: `src/trpc/server.ts` — server-side tRPC caller helper
- Create: `src/trpc/client.ts` — client-side tRPC React provider
- Create: `.env.example` — all required env vars documented
- Create: `vitest.config.ts` — Vitest 4 config
- Create: `playwright.config.ts` — Playwright config
- Create: `src/inngest/client.ts` — Inngest client

**Steps:**

- [ ] **1.1** Initialize the Next.js 16 project using `create-next-app` with TypeScript strict, App Router, and Tailwind CSS v4. Verify `pnpm dev` starts without errors.

- [ ] **1.2** Install and configure shadcn/ui. Run `npx shadcn@latest init` choosing Tailwind v4 style. Install base components: `button`, `dialog`, `input`, `form`, `select`, `badge`, `card`, `table`, `dropdown-menu`, `sidebar`, `sheet`, `toast`, `skeleton`. Verify components appear in `src/components/ui/`.

- [ ] **1.3** Install Prisma 7 (`prisma`, `@prisma/client`). Configure `prisma/schema.prisma` with the Supabase PostgreSQL `DATABASE_URL` and enable the `pgvector` extension. Create `src/server/db.ts` as the Prisma client singleton (check the global cache pattern to prevent hot-reload connection leaks in dev). Run `pnpm db:generate` to confirm the client generates without errors.

- [ ] **1.4** Install tRPC v11 (`@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`). Create `src/server/trpc.ts` with the context type (includes `session: Session | null`), `publicProcedure`, and `protectedProcedure` stub (throws `UNAUTHORIZED` if no session — full RBAC added in Phase 3). Create `src/server/root.ts` as the empty root router. Create `src/app/api/trpc/[trpc]/route.ts` HTTP adapter. Create `src/trpc/client.ts` and `src/trpc/server.ts`. Verify tRPC responds at `/api/trpc`.

- [ ] **1.5** Install Vitest 4 (`vitest`, `@vitejs/plugin-react`, `@testing-library/react`). Configure `vitest.config.ts` targeting `src/**/*.test.ts`. Run `pnpm test` — passes with zero tests. Install Playwright (`@playwright/test`). Configure `playwright.config.ts` targeting `http://localhost:3000`. Run `pnpm test:e2e` — passes with zero tests.

- [ ] **1.6** Install Inngest (`inngest`). Create `src/inngest/client.ts` with the Inngest client using `INNGEST_EVENT_KEY`. Create `src/app/api/inngest/route.ts` as the Inngest serve handler (registers functions — empty array for now). Verify `pnpm dev` still starts cleanly.

- [ ] **1.7** Create `.env.example` documenting all required env vars (see the Environment Variables section at the bottom of this plan). Create `vercel.json` with build settings. Commit: `"chore: base project setup with all dependencies"`.

**How to test:** `pnpm dev` starts without errors, `pnpm build` succeeds, `pnpm test` passes, `/api/trpc` responds.

---

### Phase 2: Database Schema

**Goal:** Define the complete Prisma schema for all 11 modules in a single migration. All models, relations, and enums in one place.

**Skill/Agent:**
- **`/db-migrate`** — invoke before each schema step (2.1–2.9) to safely add models and run migrations
- **`@postgres-pro`** — dispatch after step 2.9 to review the full schema for normalization, index placement, and constraint design before the first migration
- **`@db-analyst`** — dispatch after step 2.10 to verify all foreign keys and commonly queried columns have appropriate indexes

**Files:**
- Modify: `prisma/schema.prisma` — all models
- Create: `prisma/seed.ts` — seed ADMIN user + default transaction categories

**Steps:**

- [ ] **2.1** Add NextAuth v5 models: `User` (id, email, name, role, hashedPassword, createdAt, updatedAt), `Account`, `Session`, `VerificationToken`. Add `Role` enum: `ADMIN`, `MEMBER`, `VIEWER`.

- [ ] **2.2** Add CRM models: `Customer` (id, name, phone, email, company, address, status, createdAt, updatedAt), `CustomerInteraction` (id, customerId, type, notes, staffId, createdAt). Add `CustomerStatus` enum: `ACTIVE`, `PROSPECT`, `INACTIVE`. Add `InteractionType` enum: `CALL`, `MEETING`, `MESSAGE`, `OTHER`.

- [ ] **2.3** Add Event models: `Event` (id, name, date, venue, type, status, budget, customerId, createdAt, updatedAt), `EventTeamMember` (id, eventId, userId, role, isCollaborator), `Quotation` (id, eventId, status, totalAmount, driveFileId, createdAt, updatedAt), `QuotationItem` (id, quotationId, description, quantity, unitPrice, totalPrice). Add `EventStatus` enum: `PLANNING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`. Add `EventType` enum for event categories (e.g., `WEDDING`, `CORPORATE`, `BIRTHDAY`, `OTHER`).

- [ ] **2.4** Add `Task` model: (id, title, description, status, priority, dueDate, assigneeId, eventId, createdAt, updatedAt). Add `TaskStatus` enum: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`. Add `TaskPriority` enum: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.

- [ ] **2.5** Add timesheet models: `ShiftAssignment` (id, employeeId, date, startTime, endTime, createdBy), `Timesheet` (id, userId, date, hoursWorked, activities, notes, status, rejectionReason, reviewedBy, reviewedAt, createdAt). Note: `rejectionReason` is required for the reject workflow. Add `TimesheetStatus` enum: `PENDING`, `APPROVED`, `REJECTED`.

- [ ] **2.6** Add cash flow models: `TransactionCategory` (id, name, type), `Transaction` (id, amount, type, description, date, categoryId, eventId, createdBy, createdAt). Add `TransactionType` enum: `INCOME`, `EXPENSE`.

- [ ] **2.7** Add HR models: `Employee` (id, name, role, department, phone, email, hireDate, salary, isActive, userId, updatedAt, createdAt), `Collaborator` (id, name, specialty, phone, email, status, createdAt), `Contract` (id, employeeId, startDate, endDate, type, notes, createdAt). Note: `Employee.userId` is an optional foreign key to `User` for staff who also have system logins.

- [ ] **2.8** Add inventory models: `Prop` (id, name, category, totalQuantity, availableQuantity, condition, storageLocation, photoUrl, createdAt, updatedAt), `PropAllocation` (id, propId, eventId, quantity, returnedAt, createdAt), `Checklist` (id, eventId, type, title, createdAt), `ChecklistItem` (id, checklistId, label, isChecked, checkedByUserId, checkedAt). Add `ChecklistType` enum: `PRE_EVENT`, `POST_EVENT`.

- [ ] **2.9** Add `ZaloMessage` model: (id, customerId, direction, content, status, senderUserId, zaloMessageId, createdAt). Add `ZaloMessageDirection` enum: `OUTBOUND`, `INBOUND`. Add `ZaloDeliveryStatus` enum: `QUEUED`, `SENT`, `FAILED`. Add `Report` model: (id, month, year, generatedBy, createdAt) — used by Phase 13 to store report metadata.

- [ ] **2.10** Run `pnpm db:migrate` to apply the full schema. Create `prisma/seed.ts` to insert one ADMIN user (hashed password via bcrypt) plus default transaction categories: "Event Revenue", "Staff Cost", "Equipment Rental", "Utilities", "Marketing". Run `pnpm db:seed`. Run `pnpm db:generate`. Verify all tables exist in Supabase. Commit: `"feat: full prisma schema for all ERP modules"`.

**How to test:** `pnpm db:migrate` succeeds without warnings, `pnpm db:seed` inserts admin and categories, Prisma Studio shows all tables with correct relations.

---

### Phase 3: Authentication & RBAC

**Goal:** Working login/logout, JWT sessions, RBAC enforcement on every tRPC mutation, user profile management.

**Skill/Agent:**
- **`/tdd-feature`** — invoke at the start of phase 3 before writing any auth code. The `tdd-guard.sh` hook will block implementation if no test file exists.
- **`@security-auditor`** — dispatch after step 3.5 (GREEN) to audit the auth implementation for credential handling, session security, and RBAC bypass risks before building UI
- **`@spec-reviewer`** — dispatch after step 3.7 to verify the implementation matches `specs/auth-rbac/spec.md`

**Files:**
- Create: `src/lib/auth.ts` — NextAuth v5 config (credentials provider + Prisma adapter)
- Modify: `src/server/trpc.ts` — add `protectedProcedure`, `adminProcedure`, `memberProcedure` (RBAC lives here, not in a separate middleware file)
- Create: `src/lib/validations/auth.schema.ts` — Zod schemas
- Create: `src/server/routers/auth.router.ts` — auth tRPC router
- Create: `src/server/routers/auth.router.test.ts` — unit tests (written FIRST)
- Create: `src/app/(auth)/login/page.tsx` — login page
- Create: `src/app/(auth)/layout.tsx` — centered layout for auth pages
- Create: `src/components/forms/LoginForm.tsx`
- Create: `src/app/(dashboard)/profile/page.tsx`
- Create: `src/components/forms/ProfileForm.tsx`
- Modify: `src/server/root.ts` — register auth router

**Steps (TDD order — tests first):**

- [ ] **3.1** Write failing tests in `src/server/routers/auth.router.test.ts` covering:
  - `protectedProcedure`: unauthenticated caller → throws `UNAUTHORIZED`
  - `adminProcedure`: VIEWER caller → throws `UNAUTHORIZED`; MEMBER caller → throws `UNAUTHORIZED`; ADMIN caller → proceeds
  - `memberProcedure`: VIEWER caller → throws `UNAUTHORIZED`; MEMBER caller → proceeds; ADMIN caller → proceeds
  - `auth.getSession`: returns session for authenticated user, returns null for unauthenticated
  - `auth.changePassword`: rejects if current password is wrong; rejects if new password < 8 chars; succeeds and updates hash on valid input; after a successful password change, the old password no longer authenticates (verify by attempting login with the old password and confirming failure)
  - Login behavior: valid credentials → session created; invalid credentials → error, no session created
  - Note: NextAuth v5 JWT sessions are stateless — full session invalidation across devices requires either migrating to database sessions or implementing a `passwordChangedAt` timestamp that JWT validation checks against. Document this constraint in a code comment in `src/lib/auth.ts` so the team is aware of the limitation in v1.

  Run `pnpm test` — RED (all fail, router doesn't exist yet).

- [ ] **3.2** Install NextAuth v5 (`next-auth@beta`, `@auth/prisma-adapter`). Create `src/lib/auth.ts` with the credentials provider: look up user by email, compare password with `bcryptjs`, return user object with `id`, `name`, `email`, `role`. Configure Prisma adapter. Configure JWT strategy. Export `auth`, `signIn`, `signOut`, `handlers`. Add the catch-all route at `src/app/api/auth/[...nextauth]/route.ts`.

- [ ] **3.3** Update `src/server/trpc.ts` to extract session from context using `auth()`. Add three procedure tiers:
  - `protectedProcedure` — throws `UNAUTHORIZED` if no session
  - `adminProcedure` — extends `protectedProcedure`, additionally throws `UNAUTHORIZED` if `session.user.role !== 'ADMIN'`
  - `memberProcedure` — extends `protectedProcedure`, throws `UNAUTHORIZED` if role is `VIEWER`

  RBAC middleware lives here — do NOT create `src/server/middleware/rbac.ts`.

- [ ] **3.4** Create `src/lib/validations/auth.schema.ts` with Zod schemas: `updateProfileSchema` (name required), `changePasswordSchema` (currentPassword, newPassword min 8 chars). Create `src/server/routers/auth.router.ts` with procedures:
  - `getSession` (public) — returns current session user
  - `updateProfile` (protected) — updates user name
  - `changePassword` (protected) — verifies current password, hashes new password, updates `User.hashedPassword`

  Note: Login and logout are handled exclusively by NextAuth at `/api/auth/[...nextauth]` — they are NOT tRPC procedures. Register router in `src/server/root.ts`.

- [ ] **3.5** Run `pnpm test` — all auth tests should be GREEN.

- [ ] **3.6** Build `src/app/(auth)/login/page.tsx` and `LoginForm.tsx`. The form uses `react-hook-form` with `loginSchema` (email, password). On submit, calls NextAuth `signIn('credentials', { email, password, redirect: false })`. Show inline error on failure ("Invalid email or password"). On success, call `router.push('/dashboard')`.

- [ ] **3.7** Build `src/app/(dashboard)/profile/page.tsx` and `ProfileForm.tsx`. Shows current name and email (read-only). Allows name update (calls `api.auth.updateProfile`) and password change (calls `api.auth.changePassword`). Commit: `"feat: NextAuth v5 auth with RBAC tRPC middleware"`.

**How to test:** Login with seeded admin works, wrong password shows error, `/dashboard` without session redirects to `/login`, all unit tests pass.

---

## Chunk 2: Core Business Modules (Phases 4–7)

---

### Phase 4: Dashboard & Analytics

**Goal:** Executive dashboard with KPI cards, 12-month revenue trend chart, event type donut chart, 30-second auto-refresh on all widgets.

**Skill/Agent:**
- **`/tdd-feature`** — invoke before step 4.1 to set up the TDD cycle for `dashboard.router.ts`
- **`/supabase-postgres-best-practices`** — invoke during step 4.2 when writing the `groupBy` and `aggregate` Prisma queries to ensure they avoid N+1 and full-table scans
- **`@db-analyst`** — dispatch after step 4.2 (GREEN) to review the aggregation queries before wiring them to the UI
- **`@ui-designer`** — dispatch for step 4.3 to design the MetricCard, RevenueTrendChart, and EventBreakdownChart components with proper spacing, color tokens, and empty states
- **`@spec-reviewer`** — dispatch after step 4.5 to verify against `specs/dashboard-analytics/spec.md`

**Files:**
- Create: `src/server/routers/dashboard.router.ts`
- Create: `src/server/routers/dashboard.router.test.ts`
- Create: `src/lib/validations/dashboard.schema.ts`
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/components/dashboard/MetricCard.tsx`
- Create: `src/components/dashboard/RevenueTrendChart.tsx`
- Create: `src/components/dashboard/EventBreakdownChart.tsx`
- Create: `src/hooks/useDashboard.ts`
- Modify: `src/server/root.ts`

**Steps:**

- [ ] **4.1** Write failing tests in `dashboard.router.test.ts`:
  - `getMetrics(month, year)` returns `{ revenue: number, costs: number, profit: number, period: { month, year } }`
  - `getMetrics` with period where no data exists returns zeros (not null/undefined)
  - `getRevenueTrend` returns exactly 12 objects of `{ month: number, year: number, total: number }` in chronological order, with `total: 0` for months with no data
  - `getEventBreakdown` returns array of `{ type: string, count: number }`

  Run `pnpm test` — RED.

- [ ] **4.2** Create `src/lib/validations/dashboard.schema.ts` with `periodSchema` (month: 1–12, year: 4-digit number). Create `src/server/routers/dashboard.router.ts`. Implement:
  - `getMetrics`: use `prisma.transaction.aggregate({ where: { date filtered to month/year } })` grouped by `INCOME`/`EXPENSE`. `profit = revenue - costs`. Return zeros when no data.
  - `getRevenueTrend`: use `prisma.transaction.groupBy` over the past 12 months by month+year, filling missing months with zero.
  - `getEventBreakdown`: use `prisma.event.groupBy({ by: ['type'], _count: true })`.

  Run `pnpm test` — GREEN.

- [ ] **4.3** Install Recharts (`recharts`). Create `MetricCard.tsx` — a shadcn Card showing label, value formatted as `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`, optional trend indicator. Create `RevenueTrendChart.tsx` using Recharts `BarChart`. Create `EventBreakdownChart.tsx` using `PieChart`. Both components MUST handle empty data gracefully: `RevenueTrendChart` renders bars with height 0 and a visible "No data for this period" text overlay; `EventBreakdownChart` shows a placeholder circle with "No events" label when data is empty.

- [ ] **4.4** Create `src/hooks/useDashboard.ts` — calls ALL THREE queries with `refetchInterval: 30_000`:
  ```
  api.dashboard.getMetrics.useQuery(period, { refetchInterval: 30_000 })
  api.dashboard.getRevenueTrend.useQuery(undefined, { refetchInterval: 30_000 })
  api.dashboard.getEventBreakdown.useQuery(undefined, { refetchInterval: 30_000 })
  ```
  Returns `{ metrics, trend, breakdown, isLoading }`.

- [ ] **4.5** Build `src/app/(dashboard)/dashboard/page.tsx`. Renders: period picker (month/year selectors at top), MetricCard × 3 (Revenue / Costs / Net Profit), RevenueTrendChart, EventBreakdownChart. Use `Skeleton` components for loading state. Commit: `"feat: dashboard analytics with 30s auto-refresh"`.

**How to test:** Dashboard loads, cards show zeros with no data, period selector updates all widgets, network tab shows re-fetches every 30s.

---

### Phase 5: Customer CRM

**Goal:** Paginated searchable customer list, customer detail with interaction history, create/edit forms.

**Skill/Agent:**
- **`/new-feature`** — invoke at the start of phase 5. This skill enforces the canonical order: schema (done) → validation schema → tRPC router (TDD) → hook → form → page.
- **`@ui-designer`** — dispatch for steps 5.3–5.4 to design the customer list table, detail page layout, and `InteractionTimeline` component
- **`@ux-reviewer`** — dispatch after step 5.4 to verify loading states (skeleton table), empty states ("No customers yet"), error states, and mobile responsiveness of the list and detail pages
- **`@spec-reviewer`** → **`@quality-reviewer`** — dispatch in sequence after the full phase is complete

**Files:**
- Create: `src/server/routers/customers.router.ts`
- Create: `src/server/routers/customers.router.test.ts`
- Create: `src/lib/validations/customer.schema.ts`
- Create: `src/app/(dashboard)/customers/page.tsx`
- Create: `src/app/(dashboard)/customers/[id]/page.tsx`
- Create: `src/components/customers/CustomerForm.tsx`
- Create: `src/components/customers/InteractionTimeline.tsx`
- Modify: `src/server/root.ts`

**Steps:**

- [ ] **5.1** Write failing tests in `customers.router.test.ts`:
  - `list` with no filters returns paginated results
  - `list` with `search: "Alice"` returns only matching customers (by name, phone, or email)
  - `list` with `status: "ACTIVE"` returns only active customers
  - `list` with `assignedStaffId` returns only customers assigned to that staff member
  - `create` with valid data creates and returns the customer
  - `update` modifies customer fields
  - `delete` succeeds for ADMIN, throws `UNAUTHORIZED` for MEMBER
  - `addInteraction` creates an interaction record linked to the customer

  Run `pnpm test` — RED.

- [ ] **5.2** Create `src/lib/validations/customer.schema.ts` with: `createCustomerSchema` (name required, phone required, email optional, company optional, address optional, status defaults to `PROSPECT`), `updateCustomerSchema` (all optional), `addInteractionSchema` (customerId, type, notes), `listCustomersSchema` (search optional string, status optional `CustomerStatus`, assignedStaffId optional string, page default 1, pageSize default 20). Create `src/server/routers/customers.router.ts`. The `list` procedure builds a Prisma `where` clause: `name/phone/email contains search string` (case-insensitive), `status` exact match, `assignedStaffId` match. `delete` uses `adminProcedure`. Register in root router. Run `pnpm test` — GREEN.

- [ ] **5.3** Build `src/app/(dashboard)/customers/page.tsx`: search input (debounced 300ms with `useDebounce` hook), status filter dropdown, assigned-staff filter dropdown (lists users from session-aware query), paginated table (Name, Phone, Company, Status, Created), "Add Customer" button opens dialog with `CustomerForm`.

- [ ] **5.4** Build `src/app/(dashboard)/customers/[id]/page.tsx`: customer info card, `InteractionTimeline` below in reverse chronological order (icon per type, timestamp, notes). "Log Interaction" button opens dialog. Commit: `"feat: customer CRM with interaction history and staff filter"`.

---

### Phase 6: Event Management

**Goal:** Event list and calendar view, event detail with team and quotation, quotation builder with Google Drive export.

**Skill/Agent:**
- **`/new-feature`** — invoke at the start of phase 6 to enforce the full-stack feature order for the Events module
- **`/tdd-feature`** — invoke separately for the Quotations router (step 6.3) since it is a distinct router from Events
- **`@ui-designer`** — dispatch for steps 6.5–6.6 to design the `EventCalendar`, `QuotationBuilder`, and `TeamAssignment` components with correct visual hierarchy
- **`@ux-reviewer`** — dispatch after step 6.6 to check empty calendar state, loading states for the Drive export action, and quotation error handling UX
- **`@spec-reviewer`** → **`@quality-reviewer`** — dispatch after step 6.7

**Files:**
- Create: `src/server/routers/events.router.ts`
- Create: `src/server/routers/events.router.test.ts`
- Create: `src/server/routers/quotations.router.ts`
- Create: `src/server/routers/quotations.router.test.ts`
- Create: `src/server/services/google-drive.service.ts`
- Create: `src/lib/validations/event.schema.ts`
- Create: `src/lib/validations/quotation.schema.ts`
- Create: `src/app/(dashboard)/events/page.tsx`
- Create: `src/app/(dashboard)/events/[id]/page.tsx`
- Create: `src/components/events/EventForm.tsx`
- Create: `src/components/events/EventCalendar.tsx`
- Create: `src/components/events/QuotationBuilder.tsx`
- Create: `src/components/events/TeamAssignment.tsx`
- Modify: `src/server/root.ts`

**Steps:**

- [ ] **6.1** Write failing tests in `events.router.test.ts`:
  - `list` with status filter, date range filter returns matching events
  - `create` creates event with PLANNING status
  - `updateStatus` with valid transition (PLANNING → CONFIRMED) succeeds
  - `updateStatus` with invalid transition (COMPLETED → PLANNING) throws `BAD_REQUEST`
  - `updateStatus` with `CANCELLED` from any non-terminal state succeeds (CANCELLED is a valid terminal state from any status)
  - `assignTeam` adds a team member; re-assigning same user updates their role

  Run RED.

- [ ] **6.2** Create `src/lib/validations/event.schema.ts`. Implement `src/server/routers/events.router.ts`. The valid state machine:
  - `PLANNING` → `CONFIRMED`, `CANCELLED`
  - `CONFIRMED` → `IN_PROGRESS`, `CANCELLED`
  - `IN_PROGRESS` → `COMPLETED`, `CANCELLED`
  - `COMPLETED` → (terminal, no further transitions)
  - `CANCELLED` → (terminal)

  Run tests — GREEN.

- [ ] **6.3** Write failing tests in `quotations.router.test.ts`:
  - `create` linked to an event creates quotation with `totalAmount: 0`
  - `addItem` computes `totalPrice = quantity × unitPrice` and updates `Quotation.totalAmount`
  - `removeItem` decrements `Quotation.totalAmount`
  - `getByEvent` returns the quotation with all items for a given event

  Run RED. Implement `src/server/routers/quotations.router.ts`. Run GREEN.

- [ ] **6.4** Create `src/server/services/google-drive.service.ts`. Uses `googleapis` package with service account credentials loaded from `GOOGLE_SERVICE_ACCOUNT_JSON` env var (parse as JSON). Exposes `uploadPDF(buffer: Buffer, filename: string): Promise<{ fileId: string, viewLink: string }>`. This file lives in `src/server/` — it is NEVER imported by client components.

- [ ] **6.5** Build `src/app/(dashboard)/events/page.tsx`: view toggle (List / Calendar). List: filterable table with Status badge, date, type, customer, budget. Calendar: monthly grid (`EventCalendar` component) showing event names on their dates. Status filter and date range picker shared between both views.

- [ ] **6.6** Build `src/app/(dashboard)/events/[id]/page.tsx` with three sections:
  1. Event details card + status change dropdown (validates state machine; CANCELLED is always available from non-terminal states)
  2. `TeamAssignment` — current team list (employees + collaborators) with roles; "Assign" opens a dialog to select from employees/collaborators
  3. `QuotationBuilder` — line items table with editable quantity/price, calculated totals, "Export to Drive" button (calls Google Drive service via tRPC mutation, stores `driveFileId`), "Send via Zalo" button (calls `api.zalo.sendMessage` with the Drive view link — Zalo router is available from Phase 12, but wire the button now and guard it with `isZaloReady` flag that can be `false` until Phase 12 is complete)

- [ ] **6.7** Commit: `"feat: event management with quotation builder, Drive export, state machine"`.

---

### Phase 7: Task Management

**Goal:** Kanban board with drag-and-drop, overdue detection, priority badges, task detail panel, filters.

**Skill/Agent:**
- **`/tdd-feature`** — invoke before step 7.1 for the tasks router
- **`@ui-designer`** — dispatch for steps 7.3–7.5 to design the Kanban board layout, `TaskCard` priority badge system, and `TaskDetailPanel` side panel. Provide the `@dnd-kit` context and the four-column grid requirement.
- **`@ux-reviewer`** — dispatch after step 7.5 to check: drag-and-drop accessibility (keyboard nav), overdue indicator contrast ratio (WCAG AA), mobile layout (cards must be scrollable on 375px), empty column placeholder copy
- **`@spec-reviewer`** → **`@quality-reviewer`** — dispatch after step 7.6

**Files:**
- Create: `src/server/routers/tasks.router.ts`
- Create: `src/server/routers/tasks.router.test.ts`
- Create: `src/lib/validations/task.schema.ts`
- Create: `src/app/(dashboard)/tasks/page.tsx`
- Create: `src/components/tasks/KanbanBoard.tsx`
- Create: `src/components/tasks/TaskCard.tsx`
- Create: `src/components/tasks/TaskDetailPanel.tsx`
- Create: `src/components/tasks/TaskForm.tsx`
- Modify: `src/server/root.ts`

**Steps:**

- [ ] **7.1** Write failing tests in `tasks.router.test.ts`:
  - `list` with `assigneeId` filter returns only that user's tasks
  - `list` with `priority: HIGH` returns only high-priority tasks
  - `list` with `eventId` returns only tasks linked to that event
  - `create` with `{ title, assigneeId }` defaults to `status: TODO`
  - `updateStatus` with valid `TaskStatus` value updates and returns the task
  - `updateStatus` with invalid string throws `BAD_REQUEST`
  - `delete` succeeds for ADMIN, throws `UNAUTHORIZED` for MEMBER (delete is ADMIN-only for consistency with other modules)

  Run RED. Implement `src/server/routers/tasks.router.ts`. Run GREEN.

- [ ] **7.2** Note on assignee notification: the spec requires notifying the assignee on task creation. For Phase 7, log a console note about the notification rather than implementing delivery — Zalo integration (Phase 12) is not yet available. Add a TODO comment in the `create` procedure: `// TODO Phase 12: trigger Zalo notification to assignee`. This is a known deferred integration, not an oversight.

- [ ] **7.3** Install `@dnd-kit/core` and `@dnd-kit/sortable`. Create `KanbanBoard.tsx` with four `DroppableColumn` components (TODO / IN_PROGRESS / REVIEW / DONE). On drag end: call `api.tasks.updateStatus.mutate({ id, status: targetColumn })`. Use optimistic updates (`onMutate` → revert on `onError`) for smooth UX. Empty column shows a placeholder: "No tasks here".

- [ ] **7.4** Create `TaskCard.tsx`: title, priority badge (LOW=gray, MEDIUM=blue, HIGH=orange, URGENT=red using Tailwind), assignee avatar/initials, due date. If `new Date(task.dueDate) < new Date() && task.status !== 'DONE'` → show a red "Overdue" badge.

- [ ] **7.5** Create `TaskDetailPanel.tsx` as a shadcn Sheet. Full task details, status dropdown, edit mode via `TaskForm`. `TaskForm` fields: title, description, priority, due date, assignee (user select), linked event (event select, optional).

- [ ] **7.6** Build `src/app/(dashboard)/tasks/page.tsx`: `KanbanBoard` with filter bar (assignee select, priority select, event select). "New Task" button opens `TaskDetailPanel` in create mode. Commit: `"feat: kanban task board with drag-and-drop and overdue detection"`.

---

## Chunk 3: Operations Modules (Phases 8–11)

---

### Phase 8: Work Schedule & Timesheet

**Goal:** ADMIN shift scheduling in weekly calendar, employee daily timesheet submission, ADMIN approval workflow with rejection reasons, monthly attendance summary.

**Skill/Agent:**
- **`/tdd-feature`** — invoke before step 8.1 for the timesheets router (schedule router can share the same TDD session)
- **`@ui-designer`** — dispatch for step 8.3 (`WeeklyCalendar`) and step 8.6 (`AttendanceSummary`) — both are complex data-dense components needing careful layout design
- **`@ux-reviewer`** — dispatch after step 8.5 to check: MEMBER timesheet form accessibility, ADMIN rejection dialog UX (reason field prominence), mobile view of weekly calendar
- **`@spec-reviewer`** — dispatch after step 8.5 commit to verify against `specs/work-schedule-timesheet/spec.md`

**Files:**
- Create: `src/server/routers/schedule.router.ts`
- Create: `src/server/routers/timesheets.router.ts`
- Create: `src/server/routers/timesheets.router.test.ts`
- Create: `src/lib/validations/schedule.schema.ts`
- Create: `src/lib/validations/timesheet.schema.ts`
- Create: `src/app/(dashboard)/schedule/page.tsx`
- Create: `src/app/(dashboard)/timesheets/page.tsx`
- Create: `src/app/(dashboard)/timesheets/review/page.tsx`
- Create: `src/components/schedule/WeeklyCalendar.tsx`
- Create: `src/components/timesheets/TimesheetForm.tsx`
- Create: `src/components/timesheets/AttendanceSummary.tsx`
- Modify: `src/server/root.ts`

**Steps:**

- [ ] **8.1** Write failing tests in `timesheets.router.test.ts`:
  - `submit` creates a `PENDING` timesheet for the current user
  - `submit` with a date in the future throws `BAD_REQUEST` ("Cannot submit future timesheets")
  - `submit` with a duplicate date for the same user throws `BAD_REQUEST` ("Already submitted for this date")
  - `approve(id)` sets status to `APPROVED` — requires ADMIN
  - `reject(id, reason)` requires a non-empty reason string; sets status to `REJECTED` and stores `rejectionReason` — requires ADMIN
  - `list(filters)` with `date` filter returns timesheets for that date
  - `list(filters)` with `userId` filter returns timesheets for that user
  - `getAttendanceSummary(employeeId, month, year)` returns `{ totalDays: number, approvedHours: number, rejectedCount: number }` for that employee/period

  Run RED. Implement `schedule.router.ts` and `timesheets.router.ts`. Run GREEN.

- [ ] **8.2** Create validation schemas. `submitTimesheetSchema`: date (max: today — enforce with `z.date().max(new Date(), { message: "Cannot submit future timesheets" })`), hoursWorked (0.5–24 step 0.5), activities (required string), notes (optional). `rejectTimesheetSchema`: id, reason (min 1 char — required). The `reason` field is stored on the `Timesheet.rejectionReason` column defined in Phase 2.5.

- [ ] **8.3** Build `WeeklyCalendar.tsx` — a 7-column grid (Mon–Sun) for a given week. Each cell lists shift assignments for that day. ADMIN: clicking a cell opens an "Add Shift" dialog (select employee, start time, end time). Shows week nav (prev/next). Employee filter at top.

- [ ] **8.4** Build `src/app/(dashboard)/schedule/page.tsx` (ADMIN-gated via `adminProcedure` data; MEMBERs see read-only view of their own shifts). Build `src/app/(dashboard)/timesheets/page.tsx` for MEMBERs: their own timesheet list with status badges and `TimesheetForm` to submit today's report. `TimesheetForm` uses `submitTimesheetSchema`, date defaults to today and is read-only.

- [ ] **8.5** Build `src/app/(dashboard)/timesheets/review/page.tsx` for ADMINs: date filter and user filter at top, table of all timesheets with employee name, date, hours, status. "Approve" button triggers mutation. "Reject" opens dialog with a required reason textarea. `AttendanceSummary` component: employee select + month picker, fetches `getAttendanceSummary`, displays total days / approved hours / rejection count. Commit: `"feat: work schedule and timesheet approval workflow"`.

---

### Phase 9: Cash Flow

**Goal:** Transaction list with pagination and filters, income/expense recording with categories, period-scoped summary, event-linked transactions.

**Skill/Agent:**
- **`/tdd-feature`** — invoke before step 9.1 for the cash flow router
- **`/supabase-postgres-best-practices`** — invoke during step 9.1 when writing the `getSummary` aggregate query and the paginated `listTransactions` query to check for performance issues
- **`@db-analyst`** — dispatch after step 9.1 (GREEN) to check that the `Transaction.date` column is indexed and the `groupBy` category breakdown query won't full-scan
- **`@ui-designer`** — dispatch for step 9.3 to design the `CashFlowSummary` cards and `CategoryBreakdownChart` with VND formatting consistency
- **`@spec-reviewer`** — dispatch after step 9.4 commit

**Files:**
- Create: `src/server/routers/cash-flow.router.ts`
- Create: `src/server/routers/cash-flow.router.test.ts`
- Create: `src/server/routers/categories.router.ts`
- Create: `src/lib/validations/transaction.schema.ts`
- Create: `src/app/(dashboard)/cash-flow/page.tsx`
- Create: `src/components/cash-flow/TransactionForm.tsx`
- Create: `src/components/cash-flow/CashFlowSummary.tsx`
- Create: `src/components/cash-flow/CategoryBreakdownChart.tsx`
- Modify: `src/server/root.ts`

**Steps:**

- [ ] **9.1** Write failing tests in `cash-flow.router.test.ts`:
  - `getSummary(month, year)` returns `{ totalIncome: number, totalExpenses: number, netBalance: number }` for that period only
  - `getSummary` for a period with no transactions returns all zeros
  - `listTransactions(filters)` supports `type`, `categoryId`, `eventId`, `page`, `pageSize` filters
  - `listTransactions` returns transactions sorted by `date` descending by default
  - `create` with `amount: 0` throws `BAD_REQUEST`
  - `create` with `amount: -5` throws `BAD_REQUEST` (amount must be positive)
  - `delete` requires ADMIN

  Run RED. Implement `cash-flow.router.ts` and `categories.router.ts`. Run GREEN.

- [ ] **9.2** Create `transactionSchema`: amount (positive number, required), type (`INCOME` | `EXPENSE`), description (required), date (required), categoryId (required FK to `TransactionCategory`), eventId (optional FK to `Event`). The `getSummary` procedure accepts `month` (1–12) and `year` (4-digit) — it filters `Transaction.date` to that calendar month only.

- [ ] **9.3** Build `src/app/(dashboard)/cash-flow/page.tsx`: period picker (month/year) at top, `CashFlowSummary` row (3 cards: Total Income / Total Expenses / Net Balance formatted as VND), `CategoryBreakdownChart` (Recharts `BarChart` with two grouped bars: income categories vs expense categories), transaction list with pagination. "Add Transaction" button opens dialog.

- [ ] **9.4** Build `TransactionForm`: type toggle (Income/Expense), amount input (VND format hint), category select (filtered by selected type so only income categories show for INCOME), description, date picker, optional event link. Commit: `"feat: cash flow with VND formatting, period filter, and category breakdown"`.

---

### Phase 10: Human Resources

**Goal:** Employee directory, collaborator management, collaborator-event assignment, contract tracking with expiry warnings.

**Skill/Agent:**
- **`/tdd-feature`** — invoke before step 10.1 for the HR router
- **`@ui-designer`** — dispatch for step 10.3 to design the tabbed HR page (Employees / Collaborators) and the employee detail page with `ContractList`. Emphasize the 30-day expiry warning badge design (yellow, high-contrast).
- **`@spec-reviewer`** — dispatch after step 10.5 commit to verify `specs/hr-management/spec.md` coverage (especially the `assignCollaboratorToEvent` scenario)

**Files:**
- Create: `src/server/routers/hr.router.ts`
- Create: `src/server/routers/hr.router.test.ts`
- Create: `src/lib/validations/hr.schema.ts`
- Create: `src/app/(dashboard)/hr/page.tsx`
- Create: `src/app/(dashboard)/hr/employees/[id]/page.tsx`
- Create: `src/app/(dashboard)/hr/collaborators/page.tsx`
- Create: `src/components/hr/EmployeeForm.tsx`
- Create: `src/components/hr/CollaboratorForm.tsx`
- Create: `src/components/hr/ContractList.tsx`
- Modify: `src/server/root.ts`

**Steps:**

- [ ] **10.1** Write failing tests in `hr.router.test.ts`:
  - `listEmployees` with `search: "Alice"` returns matching employees (name or email)
  - `listEmployees` with `isActive: false` returns only inactive employees
  - `createEmployee` with optional `userId` links the employee to that system user
  - `deactivateEmployee` sets `isActive: false`
  - `addContract` saves contract with start/end dates linked to employee
  - `getExpiringContracts` returns contracts where `endDate` is between today and 30 days from today
  - `assignCollaboratorToEvent(collaboratorId, eventId, role)` creates an `EventTeamMember` record with `isCollaborator: true`

  Run RED. Implement `hr.router.ts`. Run GREEN.

- [ ] **10.2** Create `src/lib/validations/hr.schema.ts`: `createEmployeeSchema` (name, role, department, phone, email, hireDate, salary, userId optional), `collaboratorSchema` (name, specialty, phone, email, status: AVAILABLE | BUSY | INACTIVE), `contractSchema` (employeeId, startDate, endDate, type: FULLTIME | PARTTIME | FREELANCE, notes optional). The `assignCollaboratorToEvent` procedure is `adminProcedure`.

- [ ] **10.3** Build `src/app/(dashboard)/hr/page.tsx` with tabs: "Employees" (searchable table, "Add Employee" button, active/inactive toggle) and "Collaborators" (searchable list with availability badges, "Add Collaborator" button, "Assign to Event" action).

- [ ] **10.4** Build `src/app/(dashboard)/hr/employees/[id]/page.tsx`: employee info card (shows linked system user email if `userId` is set), `ContractList` with start/end dates. Contracts where `endDate` is within 30 days get a yellow ⚠️ warning badge. "Add Contract" button opens dialog.

- [ ] **10.5** Commit: `"feat: HR module with employee, collaborator, contract expiry tracking"`.

---

### Phase 11: Prop Inventory

**Goal:** Prop catalog, event allocation with over-allocation prevention (atomic transaction), pre/post-event checklists with per-item timestamp tracking.

**Skill/Agent:**
- **`/tdd-feature`** — invoke before step 11.1 for the inventory router. Pay special attention to the atomic allocation test — the `tdd-guard` hook will enforce the test exists before you write the `$transaction` code.
- **`/supabase-postgres-best-practices`** — invoke during step 11.2 when designing the `$transaction` block to confirm it follows Supabase/Postgres locking best practices for concurrent allocation
- **`@db-analyst`** — dispatch after step 11.2 to verify the `Prop.availableQuantity` update path cannot produce a race condition under concurrent requests
- **`@ux-reviewer`** — dispatch after step 11.5 to check the checklist check-off interaction on mobile (tap targets, progress bar updates), and the over-allocation error state clarity
- **`@spec-reviewer`** — dispatch after step 11.5 commit

**Files:**
- Create: `src/server/routers/inventory.router.ts`
- Create: `src/server/routers/inventory.router.test.ts`
- Create: `src/lib/validations/inventory.schema.ts`
- Create: `src/app/(dashboard)/inventory/page.tsx`
- Create: `src/app/(dashboard)/inventory/checklists/[eventId]/page.tsx`
- Create: `src/components/inventory/PropForm.tsx`
- Create: `src/components/inventory/PropAllocationForm.tsx`
- Create: `src/components/inventory/ChecklistView.tsx`
- Modify: `src/server/root.ts`

**Steps:**

- [ ] **11.1** Write failing tests in `inventory.router.test.ts`:
  - `listProps` with `category` filter returns matching props
  - `createProp` with valid data adds prop with `availableQuantity === totalQuantity`
  - `allocateProp(propId, eventId, quantity)` throws `BAD_REQUEST` when `quantity > prop.availableQuantity`
  - `allocateProp` with valid quantity decrements `prop.availableQuantity` atomically (test by checking DB state after call)
  - `createChecklist(eventId, type, title)` creates checklist with `type: PRE_EVENT | POST_EVENT`
  - `addChecklistItem(checklistId, label)` adds item with `isChecked: false`, `checkedByUserId: null`, `checkedAt: null`
  - `updateChecklistItem(itemId, isChecked: true)` sets `isChecked: true`, `checkedByUserId` to the caller's user ID, `checkedAt` to now
  - `getChecklistProgress(checklistId)` returns `{ total: number, completed: number, percentage: number }`

  Run RED.

- [ ] **11.2** Implement `src/server/routers/inventory.router.ts`. The `allocateProp` procedure MUST use `prisma.$transaction([...])` to atomically: (1) verify `prop.availableQuantity >= quantity` (throw `BAD_REQUEST` if not), (2) decrement `Prop.availableQuantity` by `quantity`, (3) create the `PropAllocation` record. The `updateChecklistItem` procedure reads the caller's session user ID from context and sets both `checkedByUserId` and `checkedAt: new Date()`.

  Run tests — GREEN.

- [ ] **11.3** Build `src/app/(dashboard)/inventory/page.tsx`: prop catalog table (Name, Category, Total, Available, Condition, Location, Photo URL). Availability badge: green (>50%), orange (10–50%), red (<10%). "Add Prop" button opens `PropForm` which includes a `photoUrl` text input (URL to hosted image — no file upload in v1). "Allocate" button opens `PropAllocationForm`.

- [ ] **11.4** `PropAllocationForm`: event select, quantity input. Below quantity input, show "Available: N" as helper text fetched live. Disable submit and show red helper if entered quantity exceeds available.

- [ ] **11.5** Build `src/app/(dashboard)/inventory/checklists/[eventId]/page.tsx`: tabs for "Pre-Event" and "Post-Event" checklists (filtered by `ChecklistType`). Each tab shows its checklist items as checkboxes. Checking an item calls `updateChecklistItem` mutation. Progress bar at top shows `percentage%` complete. "Add Item" button. Commit: `"feat: prop inventory with atomic allocation and typed checklists"`.

---

## Chunk 4: Integrations and Reports (Phases 12–14)

---

### Phase 12: Zalo Integration

**Goal:** Send Zalo OA messages from customer profiles, receive and store incoming messages via webhook (with signature validation), bulk sending via Inngest.

**Skill/Agent:**
- **`/tdd-feature`** — invoke before step 12.1 for the Zalo tRPC router
- **`/add-api-route`** — invoke before step 12.4 to scaffold the Zalo webhook route at `src/app/api/webhooks/zalo/route.ts`. This skill handles streaming/webhook route patterns correctly (raw `Request`/`Response` types, no tRPC).
- **`@security-auditor`** — dispatch after step 12.4 to audit the webhook endpoint: HMAC-SHA256 signature validation correctness, timing-safe comparison (prevent timing attacks), rejection of requests without signature header, and the GET verification handshake security
- **`@spec-reviewer`** → **`@quality-reviewer`** — dispatch in sequence after step 12.6 commit

**Files:**
- Create: `src/server/services/zalo.service.ts`
- Create: `src/server/routers/zalo.router.ts`
- Create: `src/server/routers/zalo.router.test.ts`
- Create: `src/lib/validations/zalo.schema.ts`
- Create: `src/app/api/webhooks/zalo/route.ts`
- Create: `src/inngest/functions/send-bulk-zalo.ts`
- Create: `src/components/customers/ZaloMessageForm.tsx`
- Create: `src/components/customers/ZaloMessageHistory.tsx`
- Modify: `src/server/root.ts`
- Modify: `src/app/(dashboard)/customers/[id]/page.tsx`
- Modify: `src/app/api/inngest/route.ts` — register bulk send function

**Steps:**

- [ ] **12.1** Write failing tests in `zalo.router.test.ts`:
  - `sendMessage(customerId, message)` calls `ZaloService.sendMessage` and creates a `ZaloMessage` record with status `SENT` on success
  - `sendMessage` creates a `ZaloMessage` with status `FAILED` when `ZaloService` throws; does NOT re-throw to client (returns `{ success: false, error: string }`)
  - `getHistory(customerId)` returns messages ordered by `createdAt` ascending (oldest first)
  - `sendBulk(customerIds, message)` enqueues one Inngest `zalo/message.send` event per customer; returns count of queued messages

  Run RED.

- [ ] **12.2** Create `src/lib/validations/zalo.schema.ts`: `sendMessageSchema` (customerId string, message string min 1 max 1000), `sendBulkSchema` (customerIds array min 1, message string). Create `src/server/services/zalo.service.ts` — server-only, never imported by client components. Uses `fetch` to call the Zalo OA API send-message endpoint with `Authorization: Bearer ${ZALO_OA_ACCESS_TOKEN}`. Exposes `sendMessage(userId: string, message: string): Promise<{ messageId: string }>` — throws on API error.

- [ ] **12.3** Implement `src/server/routers/zalo.router.ts`. Register in root. Run tests — GREEN.

- [ ] **12.4** Create `src/app/api/webhooks/zalo/route.ts` as a Next.js route handler supporting BOTH methods:
  - `GET`: Zalo sends a verification challenge — respond with the `verifyToken` query param echoed back (Zalo OA webhook activation handshake)
  - `POST`: Validate `X-Zalo-Signature` header using HMAC-SHA256 with `ZALO_OA_SECRET` — return `Response(null, { status: 401 })` if invalid. Parse payload for `user_id_by_app`, `message.text`, `message.msg_id`. Upsert customer by `zaloUserId` (add `zaloUserId` field to `Customer` model — run `pnpm db:migrate` and `pnpm db:generate`). Create `INBOUND` `ZaloMessage` record.

- [ ] **12.5** Create `src/inngest/functions/send-bulk-zalo.ts`. Triggered by `zalo/bulk.send` event. Receives `{ customerId, message, customerZaloId }`. Calls `ZaloService.sendMessage`. Updates `ZaloMessage.status` to `SENT` or `FAILED`. Set `concurrency: { limit: 5 }` on the Inngest function to cap parallel sends. Add 100ms sleep between individual sends for additional rate-limit safety. Register function in `src/app/api/inngest/route.ts`.

- [ ] **12.6** Add `ZaloMessageForm` (textarea + submit) and `ZaloMessageHistory` (messages list with direction indicator: outbound=right-aligned blue, inbound=left-aligned gray, timestamp, status badge) to `src/app/(dashboard)/customers/[id]/page.tsx`. Now wire the "Send via Zalo" button in `QuotationBuilder` (Phase 6.6) to call `api.zalo.sendMessage` with the Drive view link as the message content. Commit: `"feat: Zalo OA integration with webhook, bulk sending, and rate limiting"`.

---

### Phase 13: Monthly Reports

**Goal:** Report generation preview, authenticated PDF/Excel binary exports, report history.

**Skill/Agent:**
- **`/tdd-feature`** — invoke before step 13.1 for the reports tRPC router
- **`/add-api-route`** — invoke before step 13.3 for the PDF route, and again before step 13.4 for the Excel route. Each binary stream endpoint needs its own route handler with auth guard.
- **`@db-analyst`** — dispatch after step 13.1 (GREEN) to review the `generateReport` aggregation query across three tables (`Transaction`, `Event`, `Timesheet`) for N+1 issues and missing period-date indexes
- **`@spec-reviewer`** — dispatch after step 13.5 commit to verify `specs/monthly-reports/spec.md` coverage (generation, PDF, Excel, history)

**Files:**
- Create: `src/server/routers/reports.router.ts`
- Create: `src/server/routers/reports.router.test.ts`
- Create: `src/lib/validations/report.schema.ts`
- Create: `src/app/api/reports/pdf/route.ts`
- Create: `src/app/api/reports/excel/route.ts`
- Create: `src/app/(dashboard)/reports/page.tsx`
- Create: `src/components/reports/ReportPreview.tsx`
- Create: `src/components/reports/ReportHistory.tsx`
- Modify: `src/server/root.ts`

**Steps:**

- [ ] **13.1** Write failing tests in `reports.router.test.ts` (TDD first):
  - `generateReport(month, year)` returns `{ period, revenue: number, expenses: number, eventCount: number, approvedHours: number }` aggregated from DB
  - `generateReport` for empty period returns zeros, not nulls
  - `generateReport` saves a `Report` record (verify by checking DB after call)
  - `listReports` returns saved reports ordered by `createdAt` descending

  Run RED. Implement `src/server/routers/reports.router.ts`. Run GREEN.

- [ ] **13.2** Create `src/lib/validations/report.schema.ts`: `generateReportSchema` (month: 1–12, year: 4-digit number). The `generateReport` procedure uses `protectedProcedure` (any authenticated user can generate; ADMIN-only export gating is at the API route level).

- [ ] **13.3** Create `src/app/api/reports/pdf/route.ts` as a Next.js GET route handler:
  1. Call `auth()` server-side — if no session, return `Response(null, { status: 401 })`
  2. Parse `?month=` and `?year=` query params; validate with `generateReportSchema`
  3. Aggregate the same data as `reports.router.ts` using server-side Prisma queries
  4. Use `pdfkit` to build a PDF with sections: Report Header, Revenue Summary, Event List, Timesheet Summary, Expense Breakdown
  5. Return `new Response(buffer, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="report-YYYY-MM.pdf"' } })`

- [ ] **13.4** Create `src/app/api/reports/excel/route.ts` using the same auth guard pattern. Use `exceljs` to create a `Workbook` with sheets: "Revenue", "Events", "Timesheets", "Expenses". Each sheet has typed column headers and data rows. Return as `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

- [ ] **13.5** Build `src/app/(dashboard)/reports/page.tsx`. Period picker + "Generate Report" button. On generate: calls `api.reports.generateReport` mutation and shows `ReportPreview` below. `ReportPreview` shows summary cards and section breakdowns. Export buttons use a client-side authenticated fetch (NOT `window.open` — instead use `fetch('/api/reports/pdf?month=X&year=Y', { credentials: 'include' })`, receive the blob, create an object URL with `URL.createObjectURL(blob)`, and trigger download with a programmatic `<a>` click). Build `ReportHistory` list at the top of the page showing past reports from `api.reports.listReports`. Commit: `"feat: monthly report generation with authenticated PDF/Excel export"`.

---

### Phase 14: Navigation, Layout & Polish

**Goal:** Authenticated dashboard shell with sidebar nav, role-based menu visibility (role sourced from server session prop), mobile nav, loading/error states, E2E tests.

**Skill/Agent:**
- **`@ui-designer`** — dispatch at the start of phase 14 to design the full sidebar navigation system: item groupings, active state styles, ADMIN section gating, mobile hamburger, and `UserMenu` avatar dropdown. Provide the role prop flow and nav item list.
- **`@ux-reviewer`** — dispatch after step 14.4 to audit: keyboard navigation through sidebar, focus trapping in mobile Sheet, `ErrorBoundary` copy review, Suspense skeleton fidelity (does skeleton match loaded layout?), WCAG contrast on all nav items
- **`@spec-reviewer`** — dispatch after step 14.5 (all E2E tests pass) for the final stage-1 review across all specs
- **`@quality-reviewer`** — dispatch after `@spec-reviewer` passes — final stage-2 review covering security (auth redirect, RBAC enforcement end-to-end), performance (bundle size, Lighthouse score), and code quality across the full codebase

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/MobileSidebar.tsx`
- Create: `src/components/layout/UserMenu.tsx`
- Create: `src/components/shared/LoadingSpinner.tsx`
- Create: `src/components/shared/ErrorBoundary.tsx`
- Create: `tests/e2e/auth.spec.ts`
- Create: `tests/e2e/dashboard.spec.ts`
- Create: `tests/e2e/customers.spec.ts`
- Create: `tests/e2e/navigation.spec.ts`

**Steps:**

- [ ] **14.1** Build `src/app/(dashboard)/layout.tsx` as a **Server Component**. Call `auth()` server-side — if no session, call `redirect('/login')`. Extract `session.user.role`. Pass `role` as a prop to `Sidebar` and `MobileSidebar`. This is how role reaches client components without importing `src/server/` code.

- [ ] **14.2** Build `src/components/layout/Sidebar.tsx` as a **Client Component** receiving `role: Role` prop (passed from the Server Component layout). Navigation items:
  - **Overview**: Dashboard
  - **Operations**: Events, Tasks, Schedule, Timesheets
  - **CRM**: Customers, Zalo
  - **Finance**: Cash Flow, Reports
  - **HR**: HR Management
  - **Inventory**: Props
  - **Admin** (render only if `role === 'ADMIN'`): Settings placeholder

  Active route highlighted using `usePathname()`. Uses shadcn Sidebar primitive.

- [ ] **14.3** Build `MobileSidebar.tsx` as a shadcn Sheet (left-side slide-in). Same nav items as `Sidebar`, same `role` prop. Triggered by a hamburger `Button` in a top header bar visible only on mobile (`md:hidden`).

- [ ] **14.4** Create `LoadingSpinner.tsx` (centered Tailwind animate-spin circle). Wrap every page-level data fetch with `<Suspense fallback={<LoadingSpinner />}>`. Create `ErrorBoundary.tsx` using React's class-based ErrorBoundary. It catches thrown errors and renders a user-friendly card: "Something went wrong. Please refresh the page." — never exposes stack traces or tRPC error codes to the UI.

- [ ] **14.5** Write Playwright E2E tests:

  `auth.spec.ts`:
  - Login with valid credentials → URL is `/dashboard`
  - Login with invalid credentials → page shows error message, URL stays `/login`
  - Visit `/dashboard` without session → redirected to `/login`

  `dashboard.spec.ts`:
  - Authenticated user sees dashboard with at least 3 metric cards

  `customers.spec.ts`:
  - Create a customer → appears in list
  - Open customer detail page → interaction timeline section visible
  - Log an interaction → appears in timeline

  `navigation.spec.ts`:
  - ADMIN sees "Admin" nav section
  - VIEWER does not see "Admin" nav section
  - On mobile viewport (375px wide), hamburger button is visible and clicking it opens the mobile sidebar
  - Closing the mobile sidebar hides it

- [ ] **14.6** Run `pnpm lint`, `pnpm type-check`, `pnpm build` — all clean with zero errors. Run `pnpm test` — all unit tests pass. Run `pnpm test:e2e` — all E2E tests pass. Commit: `"feat: dashboard shell, sidebar nav, RBAC visibility, E2E tests complete"`.

---

## Summary: File Map by Layer

### Server (tRPC Routers)
| File | Router |
|------|--------|
| `src/server/routers/auth.router.ts` | `auth` |
| `src/server/routers/dashboard.router.ts` | `dashboard` |
| `src/server/routers/customers.router.ts` | `customers` |
| `src/server/routers/events.router.ts` | `events` |
| `src/server/routers/quotations.router.ts` | `quotations` |
| `src/server/routers/tasks.router.ts` | `tasks` |
| `src/server/routers/schedule.router.ts` | `schedule` |
| `src/server/routers/timesheets.router.ts` | `timesheets` |
| `src/server/routers/cash-flow.router.ts` | `cashFlow` |
| `src/server/routers/categories.router.ts` | `categories` |
| `src/server/routers/hr.router.ts` | `hr` |
| `src/server/routers/inventory.router.ts` | `inventory` |
| `src/server/routers/zalo.router.ts` | `zalo` |
| `src/server/routers/reports.router.ts` | `reports` |

### Server (Services — never imported by client)
| File | Purpose |
|------|---------|
| `src/server/db.ts` | Prisma client singleton |
| `src/server/services/zalo.service.ts` | Zalo OA API wrapper |
| `src/server/services/google-drive.service.ts` | Google Drive service account upload |

### API Routes (non-tRPC — streaming/webhooks/binary)
| File | Purpose |
|------|---------|
| `src/app/api/trpc/[trpc]/route.ts` | tRPC HTTP adapter |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth handlers |
| `src/app/api/inngest/route.ts` | Inngest serve handler |
| `src/app/api/webhooks/zalo/route.ts` | Zalo webhook (GET=verify, POST=inbound) |
| `src/app/api/reports/pdf/route.ts` | Authenticated PDF binary stream |
| `src/app/api/reports/excel/route.ts` | Authenticated Excel binary stream |

### Pages
| Route | Purpose |
|-------|---------|
| `/login` | Auth login |
| `/dashboard` | Analytics dashboard |
| `/customers` | CRM list |
| `/customers/[id]` | CRM detail + Zalo history |
| `/events` | Event list + calendar |
| `/events/[id]` | Event detail + quotation + team |
| `/tasks` | Kanban board |
| `/schedule` | Work schedule calendar |
| `/timesheets` | Timesheet submission |
| `/timesheets/review` | ADMIN approval queue |
| `/cash-flow` | Financial transactions |
| `/reports` | Monthly report generation + history |
| `/hr` | Employee + collaborator directory |
| `/hr/employees/[id]` | Employee detail + contracts |
| `/inventory` | Prop catalog |
| `/inventory/checklists/[eventId]` | Pre/post-event checklists |
| `/profile` | User profile settings |

---

## Environment Variables Required

```
DATABASE_URL=                   # Supabase PostgreSQL connection string
NEXTAUTH_SECRET=                # Random 32+ char secret (openssl rand -base64 32)
NEXTAUTH_URL=                   # e.g., https://your-app.vercel.app
ZALO_OA_ACCESS_TOKEN=           # Zalo OA API access token
ZALO_OA_SECRET=                 # Zalo OA secret for webhook HMAC-SHA256 validation
GOOGLE_SERVICE_ACCOUNT_JSON=    # Full JSON string of GCP service account key
GOOGLE_DRIVE_FOLDER_ID=         # Google Drive folder ID for quotation uploads
INNGEST_EVENT_KEY=              # Inngest event key
INNGEST_SIGNING_KEY=            # Inngest signing key for production
```

---

---

## Review Checkpoints

Run these after every phase before moving to the next. The two-stage review catches spec gaps before quality issues so you don't fix code that doesn't meet requirements.

```
After each phase completes (tests green, committed):
  1. @spec-reviewer   → must PASS before continuing
  2. @quality-reviewer → run only after @spec-reviewer passes
  If either FAILS → fix issues → re-run that stage
```

**Per-phase review targets (spec file to pass to `@spec-reviewer`):**

| Phase | Spec file |
|-------|-----------|
| 3 | `openspec/changes/udika-erp-core-features/specs/auth-rbac/spec.md` |
| 4 | `openspec/changes/udika-erp-core-features/specs/dashboard-analytics/spec.md` |
| 5 | `openspec/changes/udika-erp-core-features/specs/customer-crm/spec.md` |
| 6 | `openspec/changes/udika-erp-core-features/specs/event-management/spec.md` |
| 7 | `openspec/changes/udika-erp-core-features/specs/task-management/spec.md` |
| 8 | `openspec/changes/udika-erp-core-features/specs/work-schedule-timesheet/spec.md` |
| 9 | `openspec/changes/udika-erp-core-features/specs/cash-flow/spec.md` |
| 10 | `openspec/changes/udika-erp-core-features/specs/hr-management/spec.md` |
| 11 | `openspec/changes/udika-erp-core-features/specs/prop-inventory/spec.md` |
| 12 | `openspec/changes/udika-erp-core-features/specs/zalo-integration/spec.md` |
| 13 | `openspec/changes/udika-erp-core-features/specs/monthly-reports/spec.md` |
| 14 | All specs (final sweep) |

---

## Key Architectural Rules (for implementers)

1. **`src/server/` is never imported by client components.** Role and session data flows from Server Components (layout.tsx) down to Client Components as props.
2. **RBAC lives in `src/server/trpc.ts`** as `protectedProcedure`, `adminProcedure`, `memberProcedure`. Do not create a separate middleware file.
3. **Login/logout are NextAuth operations** at `/api/auth/[...nextauth]` — never tRPC procedures.
4. **Binary exports (PDF, Excel) are API routes**, not tRPC, because tRPC is JSON-only.
5. **Webhook endpoints are API routes**, not tRPC, and must validate their own auth (Zalo signature / session).
6. **TDD order**: write failing test → run to confirm RED → implement → run to confirm GREEN → commit.
7. **VND currency formatting**: use `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` everywhere money is displayed.
8. **After any schema change**: always run both `pnpm db:migrate` AND `pnpm db:generate` before writing router code.
