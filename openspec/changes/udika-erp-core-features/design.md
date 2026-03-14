## Context

Udika ERP is a greenfield Next.js 16 App Router application targeting event management business operations. The system must serve three user roles (ADMIN, MEMBER, VIEWER) across 11 functional modules. The stack is fixed: Next.js 16 + tRPC v11 + Prisma 7 + Supabase PostgreSQL + NextAuth v5. External integrations include Zalo OA API and Google Drive API.

## Goals / Non-Goals

**Goals:**
- Single-tenant ERP covering all 11 modules from the requirements
- Role-based access control enforced at tRPC router layer
- Real-time-friendly data model (dashboard aggregations, kanban board)
- PDF/Excel export for monthly reports
- Zalo OA API integration for customer messaging
- Google Drive integration for quotation file management

**Non-Goals:**
- Multi-tenant / SaaS architecture
- Mobile native app
- Offline support
- Public-facing customer portal
- Advanced AI/ML features beyond basic dashboard analytics

## Decisions

### D1: Monolithic tRPC API with domain-based routers

All 11 modules become tRPC routers merged into a single root router. Each router maps to a domain: `auth`, `dashboard`, `customers`, `events`, `tasks`, `timesheets`, `reports`, `cashFlow`, `hr`, `inventory`, `zalo`.

**Why over separate microservices**: Team size and timeline favor a monorepo monolith. tRPC provides type safety across the boundary without REST contract overhead.

### D2: Single Prisma schema with explicit relations

All models live in one `schema.prisma`. Relations are explicit (no implicit many-to-many for business models). Enums for roles, statuses, and event types.

Key models: `User`, `Customer`, `Event`, `Quotation`, `Task`, `Timesheet`, `Transaction`, `Employee`, `Prop`, `ChecklistItem`, `ZaloMessage`.

**Why**: Prisma 7 handles large schemas well; keeping everything in one place makes cross-domain queries (e.g., dashboard aggregations) straightforward without distributed join complexity.

### D3: RBAC enforcement at tRPC middleware layer

A `protectedProcedure` base with role checking middleware. ADMIN has full CRUD, MEMBER has scoped write access, VIEWER has read-only. Enforced server-side — client UI reflects permissions but is not the enforcement point.

### D4: Dashboard uses server-side aggregation with SWR polling

Dashboard metrics computed via Prisma aggregations on the server. Client polls every 30s via tRPC query. No WebSockets for v1 — acceptable latency for business metrics.

**Alternative considered**: Real-time Supabase subscriptions. Rejected for v1 complexity; can be added later.

### D5: Report export via server-side PDF/Excel generation

Monthly reports use `pdfkit` (PDF) and `exceljs` (Excel) in a Next.js API route (not tRPC, as these return binary streams). Files are generated on-demand, not stored.

**Why API route over tRPC**: tRPC is JSON-based; binary file streaming requires a raw Next.js API route per CLAUDE.md boundary rules.

### D6: Zalo integration via server-side service with webhook receiver

A `ZaloService` in `src/server/services/` wraps Zalo OA API calls. Incoming Zalo webhooks handled via a Next.js API route at `/api/webhooks/zalo`. Messages stored in `ZaloMessage` model for audit trail.

### D7: Google Drive integration for quotation files

Quotation PDF files uploaded to a shared Google Drive folder via service account. Drive file IDs stored in `Quotation.driveFileId`. Download links generated server-side to avoid exposing service account credentials.

## Risks / Trade-offs

- **Large schema complexity** → Mitigation: Incrementally migrate modules; use Prisma's `schema.prisma` validation in CI
- **Zalo API rate limits** → Mitigation: Queue outbound messages via Inngest background jobs; implement retry logic
- **Google Drive API auth** → Mitigation: Use service account (not OAuth) for server-to-server; store credentials in environment variables
- **Report generation memory** → Mitigation: Stream large exports; set Vercel function memory limits appropriately
- **RBAC bypass risk** → Mitigation: All mutations require `protectedProcedure`; no public procedures for business data
- **Dashboard N+1 queries** → Mitigation: Use Prisma's `groupBy` and `aggregate` for dashboard; reviewed by `@db-analyst` before deploy

## Migration Plan

1. Set up base Next.js project with NextAuth + Prisma + Supabase connection
2. Apply full Prisma schema migration (single migration for greenfield)
3. Seed ADMIN user for initial access
4. Deploy to Vercel with environment variables (DATABASE_URL, NEXTAUTH_SECRET, ZALO_*, GOOGLE_*)
5. No rollback needed — greenfield deployment

## Open Questions

- Zalo OA API credentials and webhook URL: need production Zalo OA account setup
- Google Drive shared folder structure: to be confirmed with Udika team
- Specific chart types for dashboard: bar/line for revenue trends, pie for event categories
- Currency and locale settings: Vietnamese Dong (VND) assumed
