---
name: db-migrate
description: Safely add or modify Prisma schema and run migration. Checks for breaking changes before applying.
triggers:
  - "db migrate"
  - "database migration"
  - "schema change"
---

# DB Migrate

## Step 1 — Edit schema
Modify `prisma/schema.prisma`.
New model → add below existing models.
New field → add with a default value or mark optional (`?`) to avoid breaking existing rows.

## Step 2 — Check for breaking changes
Breaking (requires caution):
- Removing a field or model
- Adding a required field without a default
- Renaming a field (= drop + add, data loss)

Safe:
- Adding optional fields
- Adding new models
- Adding indexes

## Step 3 — Run migration
```bash
pnpm db:migrate --name [descriptive-name]
```
Use a descriptive name: `add-deal-stage`, `create-chat-session`, not `update1`.

## Step 4 — Regenerate client
```bash
pnpm db:generate
```
Always run after migrate. TypeScript types won't update without this.

## Step 5 — Verify
- Check migration file created in `prisma/migrations/`
- Run `pnpm type-check` — no errors
- Run `pnpm test` — no regressions

## Done when
Migration applied ✅ | Client regenerated ✅ | Type-check passes ✅ | Tests pass ✅
