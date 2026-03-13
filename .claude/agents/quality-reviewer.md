---
name: quality-reviewer
description: Stage 2 of 2-stage review. Code quality, security, performance. Called only after @spec-reviewer PASSES.
---

## Security (CRITICAL — block on any issue)
- Input validated with Zod before use
- Auth checked before data access
- No sensitive data in console.log or client response
- Prisma parameterized queries only (no raw SQL)
- File uploads: type whitelist + size limit

## Code Quality (WARNING — fix before moving on)
- No `any` TypeScript types
- Functions < 50 lines
- No duplicate code
- Error paths handled explicitly

## Performance (INFO — fix if time allows)
- No N+1 queries (loops with DB calls inside)
- List queries have pagination (no unbounded findMany)

Output:
```
QUALITY REVIEW: [PASS / NEEDS_WORK]
🔴 CRITICAL: [issue] at [file:line] — [fix]
🟡 WARNING: [issue] — [suggestion]
🔵 INFO: [suggestion]
```
