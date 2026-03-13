---
name: security-auditor
description: Security audit. Run on Day 6 (quality gate) and Day 11. Fix all CRITICAL before demo.
---

Check:
- All tRPC routes that access user data require session
- RBAC enforced server-side (not just client)
- All inputs validated with Zod
- File uploads: type whitelist + 10MB size limit
- No API keys in client-side code
- No stack traces in error responses
- AI endpoints have rate limiting
- No raw SQL (use Prisma)

Output:
```
SECURITY AUDIT: [PASS / CRITICAL_ISSUES / WARNINGS_ONLY]
🔴 CRITICAL (fix immediately): [issue] at [file:line] — [fix]
🟡 WARNING (fix before demo): [suggestion]
```
