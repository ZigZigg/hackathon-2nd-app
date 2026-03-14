## 1. Base Setup & Infrastructure

- [ ] 1.1 Initialize Next.js 16 project with TypeScript strict, App Router, and CLAUDE.md stack configuration
- [ ] 1.2 Configure Tailwind CSS v4 + shadcn/ui + Radix primitives
- [ ] 1.3 Set up Prisma 7 with Supabase PostgreSQL connection and pgvector extension
- [ ] 1.4 Configure tRPC v11 with context, middleware, and root router
- [ ] 1.5 Set up Vitest 4 and Playwright for testing
- [ ] 1.6 Configure Inngest for background job processing
- [ ] 1.7 Set up Vercel deployment with environment variables

## 2. Database Schema

- [ ] 2.1 Define User, Session, Account models for NextAuth v5
- [ ] 2.2 Define Customer and CustomerInteraction models for CRM
- [ ] 2.3 Define Event, Quotation, QuotationItem, and EventTeamMember models
- [ ] 2.4 Define Task model with status enum and event relation
- [ ] 2.5 Define Timesheet, ShiftAssignment, and WorkSchedule models
- [ ] 2.6 Define Transaction and TransactionCategory models for cash flow
- [ ] 2.7 Define Employee and Collaborator models for HR
- [ ] 2.8 Define Prop, PropAllocation, Checklist, and ChecklistItem models
- [ ] 2.9 Define ZaloMessage model with delivery status tracking
- [ ] 2.10 Run `pnpm db:migrate` and seed initial ADMIN user

## 3. Authentication & RBAC

- [ ] 3.1 Configure NextAuth v5 with credentials provider and Prisma adapter
- [ ] 3.2 Implement `protectedProcedure` tRPC middleware with role checking
- [ ] 3.3 Write tRPC auth router: login, logout, updateProfile, changePassword
- [ ] 3.4 Build login page at `app/(auth)/login/page.tsx`
- [ ] 3.5 Build user profile page at `app/(dashboard)/profile/page.tsx`
- [ ] 3.6 Write unit tests for RBAC middleware (ADMIN/MEMBER/VIEWER scenarios)

## 4. Dashboard & Analytics

- [ ] 4.1 Write tRPC dashboard router: getMetrics, getRevenueTrend, getEventBreakdown
- [ ] 4.2 Implement Prisma aggregation queries for revenue, costs, profit
- [ ] 4.3 Build dashboard page with metric summary cards
- [ ] 4.4 Add revenue trend line chart (12-month view)
- [ ] 4.5 Add event category donut chart
- [ ] 4.6 Implement 30-second auto-refresh via tRPC query polling
- [ ] 4.7 Write unit tests for dashboard aggregation queries

## 5. Customer CRM

- [ ] 5.1 Write tRPC customers router: list, get, create, update, delete, addInteraction
- [ ] 5.2 Build customer list page with search and status filter
- [ ] 5.3 Build customer detail page with interaction history timeline
- [ ] 5.4 Build customer create/edit form component
- [ ] 5.5 Write unit tests for customer router mutations

## 6. Event Management

- [ ] 6.1 Write tRPC events router: list, get, create, update, updateStatus, assignTeam
- [ ] 6.2 Write tRPC quotations router: create, update, addItem, removeItem
- [ ] 6.3 Build event list page with status filter and calendar toggle
- [ ] 6.4 Build event detail page with team, quotation, and task sections
- [ ] 6.5 Build quotation builder form with line items and total calculation
- [ ] 6.6 Implement Google Drive service for PDF upload and link generation
- [ ] 6.7 Add "Export to Drive" action in quotation detail
- [ ] 6.8 Write unit tests for event and quotation routers

## 7. Task Management

- [ ] 7.1 Write tRPC tasks router: list, get, create, update, updateStatus, delete
- [ ] 7.2 Build Kanban board page with drag-and-drop column layout
- [ ] 7.3 Build task card component with priority, assignee, and due date display
- [ ] 7.4 Build task create/edit side panel with assignee and event link fields
- [ ] 7.5 Implement overdue task visual indicator
- [ ] 7.6 Add task filters: assignee, priority, linked event
- [ ] 7.7 Write unit tests for task router

## 8. Work Schedule & Timesheet

- [ ] 8.1 Write tRPC schedule router: createShift, listShifts, getMySchedule
- [ ] 8.2 Write tRPC timesheets router: submit, list, approve, reject
- [ ] 8.3 Build schedule page with weekly calendar view
- [ ] 8.4 Build timesheet submission form for daily reports
- [ ] 8.5 Build ADMIN timesheet review page with approve/reject actions
- [ ] 8.6 Build monthly attendance summary report view
- [ ] 8.7 Write unit tests for timesheet approval workflow

## 9. Cash Flow

- [ ] 9.1 Write tRPC cashFlow router: listTransactions, create, update, delete, getSummary
- [ ] 9.2 Write tRPC categories router: list, create (for transaction categories)
- [ ] 9.3 Build cash flow page with transaction list and period summary
- [ ] 9.4 Build transaction create/edit form with category and event link
- [ ] 9.5 Add category breakdown chart for income and expenses
- [ ] 9.6 Write unit tests for cash flow calculations

## 10. Human Resources

- [ ] 10.1 Write tRPC employees router: list, get, create, update, deactivate
- [ ] 10.2 Write tRPC collaborators router: list, get, create, update
- [ ] 10.3 Build employee directory page with search
- [ ] 10.4 Build employee detail page with contract history
- [ ] 10.5 Build collaborator management page
- [ ] 10.6 Implement expiring contract detection and warning indicator
- [ ] 10.7 Write unit tests for HR router

## 11. Prop Inventory

- [ ] 11.1 Write tRPC props router: list, get, create, update, allocateToEvent
- [ ] 11.2 Write tRPC checklists router: create, addItem, updateItem, getByEvent
- [ ] 11.3 Build prop catalog page with quantity and condition display
- [ ] 11.4 Build prop allocation form with over-allocation validation
- [ ] 11.5 Build on-site checklist page with check-off functionality
- [ ] 11.6 Display checklist completion percentage on event detail page
- [ ] 11.7 Write unit tests for prop allocation and over-allocation guard

## 12. Zalo Integration

- [ ] 12.1 Implement ZaloService in `src/server/services/zalo.service.ts`
- [ ] 12.2 Write Next.js API route for Zalo webhook at `app/api/webhooks/zalo/route.ts`
- [ ] 12.3 Implement webhook signature validation
- [ ] 12.4 Write tRPC zalo router: sendMessage, getHistory, sendBulk
- [ ] 12.5 Add "Send Zalo" button and form to customer profile page
- [ ] 12.6 Build message history view in customer detail
- [ ] 12.7 Implement Inngest job for bulk message sending with rate limiting
- [ ] 12.8 Write unit tests for Zalo service and webhook handler

## 13. Monthly Reports

- [ ] 13.1 Create Next.js API route for PDF export using pdfkit
- [ ] 13.2 Create Next.js API route for Excel export using exceljs
- [ ] 13.3 Write tRPC reports router: generateReport, listReports
- [ ] 13.4 Build monthly report preview page with all data sections
- [ ] 13.5 Add "Export PDF" and "Export Excel" action buttons
- [ ] 13.6 Build report history list page
- [ ] 13.7 Write unit tests for report data aggregation

## 14. Navigation & Layout

- [ ] 14.1 Build authenticated dashboard layout with sidebar navigation
- [ ] 14.2 Add role-based menu item visibility (VIEWER sees no mutation actions)
- [ ] 14.3 Add responsive mobile menu for sidebar
- [ ] 14.4 Build loading and error boundary components for all feature pages
- [ ] 14.5 Run Playwright E2E tests covering login, dashboard, and key feature flows
