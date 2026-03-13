# Scenario B — Mini CRM

## Core Entities
- Contact (id, name, email, company, phone, status, ownerId)
- Deal (id, title, value, stage, probability, contactId, closedAt)
- Activity (id, type, note, contactId, userId, createdAt)

## tRPC Routers
- contacts.router: list, create, update, delete, search
- deals.router: list, create, update, updateStage, getByContact
- activities.router: list, create, getByContact

## UI Pages
- /contacts — DataTable + search + filter by status
- /contacts/[id] — contact detail + deal list + activity timeline
- /deals — Kanban board by stage
- /dashboard — pipeline value + win rate + recent activities

## AI (context stuffing)
Smart summary: "Summarize this contact: {contact + deals + activities}"
Deal scoring: "Score this deal 0-100 and explain why: {deal data}"
