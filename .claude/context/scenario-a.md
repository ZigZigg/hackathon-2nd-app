# Scenario A — Internal Tool

## Core Entities
- User (id, name, email, role, createdAt)
- Item (id, title, description, status, priority, assigneeId, createdAt)
- Activity (id, itemId, userId, action, metadata, createdAt)

## tRPC Routers
- items.router: list, create, update, delete, updateStatus, bulkUpdate
- users.router: list, invite, updateRole
- analytics.router: summary, activityFeed, exportCsv

## UI Pages
- /dashboard — KPI cards + activity feed + status chart
- /items — DataTable + filters + bulk actions
- /items/[id] — detail view + activity timeline + edit form
- /settings — user management + role assignment

## AI (context stuffing)
Prompt: "Given these items: {items}. {userQuestion}"
