## Why

Udika requires a comprehensive ERP/CRM platform to manage its event management business operations, including customer relationships, staff scheduling, financial tracking, and event coordination. The current lack of a unified system creates operational inefficiencies across HR, finance, CRM, and event management workflows.

## What Changes

- Implement full-stack ERP system on Next.js with Supabase/PostgreSQL backend
- Add role-based authentication (ADMIN, MEMBER, VIEWER) for controlled access
- Build real-time dashboard with revenue and profit analytics
- Create event/program management with quotation workflows
- Implement CRM for customer profiles and interaction history
- Add HR module for staff and collaborator management
- Build task management with Kanban board interface
- Add timesheet and work schedule tracking with daily reports
- Implement financial tracking (income/expenditure cash flow)
- Add prop inventory management with on-site checklists
- Integrate Zalo OA API for customer communications
- Enable monthly report generation with PDF/Excel export

## Capabilities

### New Capabilities

- `auth-rbac`: User authentication, role-based access control (ADMIN/MEMBER/VIEWER), and user profile management
- `dashboard-analytics`: Executive dashboard with revenue metrics, profit charts, and key business KPIs
- `customer-crm`: Customer profile management, interaction history, and care tracking
- `event-management`: Event/program creation, quotation management, and team coordination workflows
- `task-management`: Kanban board for task assignment, tracking, and status management
- `work-schedule-timesheet`: Employee work schedules, daily reports, and timesheet management
- `monthly-reports`: Monthly report templates with PDF and Excel export capabilities
- `cash-flow`: Internal income/expenditure tracking and cash flow reporting
- `hr-management`: Human resources and collaborator profile management
- `prop-inventory`: Event prop inventory tracking and on-site checklist management
- `zalo-integration`: Zalo OA API integration for customer messaging and notifications

### Modified Capabilities

<!-- No existing capabilities — this is a greenfield implementation -->

## Impact

- **New database schemas**: Users, Customers, Events, Quotations, Tasks, Timesheets, Transactions, Employees, Props, ZaloMessages
- **New API surface**: tRPC routers for all 11 feature modules
- **External integrations**: Zalo OA API, Google Drive API (quotation file management)
- **Auth system**: NextAuth v5 with Prisma adapter, RBAC middleware
- **File exports**: PDF/Excel generation for monthly reports
- **Real-time features**: Dashboard metrics, task board updates
