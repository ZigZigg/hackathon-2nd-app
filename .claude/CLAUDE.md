# Project Context

## Tech Stack
- Framework: Next.js 15, App Router, TypeScript strict
- UI: Tailwind CSS + shadcn/ui
- API: tRPC v11 + Zod validation
- Database: PostgreSQL via Prisma + Supabase (pgvector enabled)
- Auth: NextAuth v5 + RBAC (roles: ADMIN, MEMBER, VIEWER)
- AI: Anthropic claude-sonnet-4-6 via Vercel AI SDK + streaming
- Jobs: Inngest
- Testing: Vitest (unit) + Playwright (E2E)
- Deploy: Vercel

## Superpowers Workflow — ALWAYS FOLLOW THIS ORDER
Never skip steps, even under time pressure.

### On competition day (topic revealed):
1. /scenario-activate — picks DB schema + layout in < 3 min
2. /rag-decision — 30-second RAG vs context-stuffing verdict
3. /brainstorming — full Socratic dialogue, lock 4 features
4. /writing-plans — tasks with file paths + skill mapping (NOT code to copy-paste)
5. Assign via Linear MCP
6. Per task: invoke the SKILL listed in the plan → skill drives implementation
7. Per completed feature: /requesting-code-review (@spec-reviewer then @quality-reviewer)
8. Per feature: /verification-before-completion before marking done
9. Bugs: /systematic-debugging

### Implementation approach — skill-driven (NOT plan-copy)
The plan doc = WHAT to build (goals, hints, field names, edge cases).
The skill = HOW to build it (process, TDD cycle, guardrails).
NEVER copy code from a plan file directly into the project.
ALWAYS invoke the correct skill and use plan hints as context for decisions.

## TDD Rules — tdd-guard hook enforces these
1. NEVER write implementation before a failing test exists
2. tdd-guard WILL BLOCK you if you try
3. Cycle: write test → RED → write impl → GREEN → refactor
4. Use /tdd-feature for every new backend feature
5. Target: >80% server coverage

## Feature Addition Order
1. Prisma schema change → pnpm db:migrate
2. Zod validation schema in src/lib/validations/
3. tRPC router (TDD-first via /tdd-feature)
4. React hook in src/hooks/
5. Form component in src/components/forms/
6. Page in src/app/(dashboard)/

## Code Conventions
- Zod schemas in src/lib/validations/ — shared FE + BE source of truth
- src/server/ NEVER imported by client components
- No `any` types — use `unknown` and narrow
- Error messages must be user-friendly, no stack traces to client
- No console.log in production paths — use console.error in catch blocks

## Scenario Branches (activate on competition day via /scenario-activate)

### SCENARIO A — Internal Tool
Trigger: dashboard, admin panel, tracker, management tool, internal ops
Stack: Standard. AI via context stuffing.
Context: .claude/context/scenario-a.md

### SCENARIO B — Mini CRM
Trigger: CRM, customer, pipeline, deals, contacts, sales, leads
Stack: Standard. AI for smart summaries + scoring.
Context: .claude/context/scenario-b.md

### SCENARIO C — AI App (no RAG)
Trigger: AI assistant, chatbot, automation, generator, smart tool
Stack: Claude API streaming + tool use. Context stuffing.
Context: .claude/context/scenario-c.md

### SCENARIO D — AI App + RAG
Trigger: knowledge base, wiki, document assistant, onboarding bot, support bot
Stack: pgvector + Voyage AI + RAG pipeline. Run /rag-setup.
Context: .claude/context/scenario-d.md

## RAG Decision Checklist (5 questions, 30 sec on competition day)
Q1: Does the app search user-uploaded documents or files?
Q2: Is the core feature a wiki or knowledge base?
Q3: Does AI answer from a large private unstructured corpus?
Q4: Is there an onboarding/support/HR chatbot?
Q5: Could all relevant data fit in DB query + context window?

Rule: 1+ YES on Q1–Q4 → /rag-setup (target 12 min). All NO → context stuffing.