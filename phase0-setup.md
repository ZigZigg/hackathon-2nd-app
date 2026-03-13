# Phase 0 — Complete Pre-Setup Reference
> **Goal:** Build the machine, not the app. The topic is unknown during Phase 0 — you cannot brainstorm a real product yet. Instead, you build the infrastructure so that on competition day, any random topic becomes a working product in under 4 hours.

---

## The Most Important Clarification

```
Phase 0 (2 weeks prep)       ← YOU ARE HERE. No real brainstorming yet. Topic unknown.
  └─ Day 0:  Accounts + tools
  └─ Day 1:  Full infrastructure setup (repo + .claude/ + hooks + MCP)
  └─ Day 2:  Workflow validation (dummy brainstorm — testing the machine, not building a product)
  └─ Days 3–6: Component library + scenario skeletons + speed drills
  └─ Day 7:  Mock Hackathon #1 (first real /brainstorming on a mock topic)

Competition Day (after 2 weeks) ← /brainstorming runs HERE on the real topic
  └─ Topic revealed → /brainstorming → /writing-plans → build
```

**Why not brainstorm first?**
You don't know the topic yet. `/brainstorming` in Superpowers is a Socratic dialogue about a *specific product idea*. There is nothing to brainstorm until the topic is revealed. Phase 0 builds the rails — competition day runs the train.

---

## Sequential Steps — Follow in This Exact Order

---

### STEP 0 — Before Day 1 Starts (All 4 people)

Create every account and install every tool. Nothing in Step 1 works without this.

#### Accounts to create

| Account | URL | What to note down |
|---------|-----|-------------------|
| Claude Code | claude.ai/code | Confirm all 4 team members have access |
| GitHub | github.com | Create org repo, add all 4 as collaborators |
| Supabase | supabase.com | `SUPABASE_URL` + `ANON_KEY` + `SERVICE_ROLE_KEY` |
| Vercel | vercel.com | Connect GitHub org, enable auto-deploy |
| Linear | linear.app | Create team workspace, note `TEAM_ID` |
| Sentry | sentry.io | Create Next.js project, note `DSN` + `AUTH_TOKEN` |
| Voyage AI | voyageai.com | Note `VOYAGE_API_KEY` (used only if RAG topic) |

#### Tools on every machine

```bash
# Node.js 20+
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20 && nvm use 20

# Package manager + CLIs
npm install -g pnpm vercel supabase

# Claude Code (if not already installed)
npm install -g @anthropic-ai/claude-code

# Verify
node --version   # must be 20+
pnpm --version   # must be 8+
claude --version # latest
```

#### Create .env.local (every machine, never commit this file)

```bash
# ─── DATABASE ─────────────────────────────────────────
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# ─── SUPABASE ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"

# ─── AUTH ──────────────────────────────────────────────
NEXTAUTH_SECRET="[run: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# ─── AI ────────────────────────────────────────────────
ANTHROPIC_API_KEY="[YOUR_KEY]"

# ─── RAG (dormant — only fill if topic needs it) ────────
VOYAGE_API_KEY="[YOUR_VOYAGE_KEY]"

# ─── MONITORING ────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN="[YOUR_DSN]"
SENTRY_AUTH_TOKEN="[YOUR_AUTH_TOKEN]"
```

---

### STEP 1 — Install Superpowers (Captain, Day 1 — very first command)

**Do this before anything else. Every other step assumes Superpowers is installed.**

```bash
# Open Claude Code (can be an empty directory at this point — no repo needed yet)
claude

# Inside Claude Code, run in sequence:
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace

# Confirm install succeeded (30 seconds):
/superpowers help
```

You should see 14 built-in skills listed:
`brainstorming, writing-plans, subagent-driven-development, executing-plans,
finishing-a-development-branch, test-driven-development, systematic-debugging,
verification-before-completion, using-git-worktrees, dispatching-parallel-agents,
requesting-code-review, receiving-code-review, using-superpowers, writing-skills`

✅ **See all 14? Installation done. Move immediately to Step 2.**

If skills are missing: `/plugin reinstall superpowers@superpowers-marketplace`

> **Do NOT run /brainstorming now.** There is no topic yet and no repo to build into.
> The full workflow test happens on Day 2 (Step 12), after the repo exists.
> Full-Stack starts Step 2 in parallel right now — they do not wait for you.

---

### STEP 2 — Init Repository (Full-Stack, Day 1 — starts at same time as Step 1)

Full-Stack does not wait for Captain. Both tracks run simultaneously from 09:00.

```bash
pnpm create next-app@latest hackathon-app \
  --typescript --tailwind --eslint \
  --app --src-dir --import-alias "@/*"

cd hackathon-app

# Core dependencies
pnpm add @trpc/server @trpc/client @trpc/next @trpc/react-query \
  @tanstack/react-query zod superjson

# Database
pnpm add @prisma/client
pnpm add -D prisma

# Auth
pnpm add next-auth@beta @auth/prisma-adapter

# UI
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-select @radix-ui/react-toast \
  class-variance-authority clsx tailwind-merge lucide-react
npx shadcn-ui@latest init

# Forms + AI
pnpm add react-hook-form @hookform/resolvers
pnpm add ai @anthropic-ai/sdk @ai-sdk/anthropic inngest

# Dev + testing
pnpm add -D @types/node vitest @vitejs/plugin-react \
  @testing-library/react @playwright/test

# Push to GitHub immediately
git init && git add . && git commit -m "init"
git remote add origin [YOUR_GITHUB_REPO_URL]
git push -u origin main
```

#### Create folder structure

```bash
mkdir -p src/app/{(auth)/{login,register},(dashboard),api/{trpc/\[trpc\],ai}}
mkdir -p src/server/{db,trpc/{routers/__tests__},services,auth}
mkdir -p src/components/{ui,layout,forms,data-display,feedback,rag}
mkdir -p src/hooks src/lib/validations src/types
mkdir -p .claude/{skills,agents,hooks,context}
mkdir -p .claude/skills/{scenario-activate,rag-decision,seed-demo-data,demo-script}
mkdir -p .claude/skills/{tdd-feature,new-feature,ai-feature,rag-setup,fix-bug}
mkdir -p prisma/schemas
```

#### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

#### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm run type-check
      - run: pnpm run lint
      - run: pnpm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Connect repo to Vercel. Confirm production URL is live before moving on.

---

### STEP 3 — Write CLAUDE.md (Captain, Day 1 — after Step 1)

This is the master context file. Claude reads it at the start of every session.
Place at both `.claude/CLAUDE.md` and root `CLAUDE.md`.

```markdown
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
4. /writing-plans — tasks with exact file paths for each feature
5. Assign via Linear MCP
6. Per task: /subagent-driven-development → @implementer
7. Per completed feature: /requesting-code-review (@spec-reviewer then @quality-reviewer)
8. Per feature: /verification-before-completion before marking done
9. Bugs: /systematic-debugging

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
- No console.log in production paths — use Sentry

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
```

---

### STEP 4 — Write 4 Custom Skills (Captain, Day 1 — after Step 3)

These are the only custom skills you need. Superpowers already provides brainstorming, TDD, review, etc. These 4 are hackathon-specific wrappers that don't exist in Superpowers.

#### `.claude/skills/scenario-activate/SKILL.md`

```markdown
---
name: scenario-activate
description: Activate the correct pre-built scenario in < 3 min. Run FIRST on competition day before brainstorming.
triggers:
  - "activate scenario"
  - "topic revealed"
---

# Scenario Activate

## Step 1 — Classify
Ask: "What is the competition topic in one sentence?"
Map to scenario A/B/C/D using trigger keywords from CLAUDE.md.

## Step 2 — Activate DB schema
Uncomment the correct section in prisma/schema.prisma.
Run: pnpm db:migrate --name init-[scenario]
Run: pnpm db:seed

## Step 3 — Activate layout
Import the correct layout template in src/app/(dashboard)/layout.tsx.

## Step 4 — Load context doc
Read .claude/context/scenario-[x].md for domain-specific conventions.

## Done when
Schema migrated ✅ | Layout active ✅ | Context loaded ✅
Total time target: < 3 minutes
```

#### `.claude/skills/rag-decision/SKILL.md`

```markdown
---
name: rag-decision
description: Run the 5-question RAG checklist. Output YES/NO + exact next command. Takes 30 seconds.
triggers:
  - "rag decision"
  - "do we need rag"
---

# RAG Decision

Ask these 5 questions about the competition topic:
1. Does the app search user-uploaded documents or files?
2. Is the core feature a wiki, knowledge base, or documentation system?
3. Does AI need to answer from a large private unstructured corpus?
4. Is there an onboarding bot, support assistant, or HR chatbot?
5. Could all relevant data fit in a ~100k context window from the DB?

Decision:
- 1+ YES on Q1–Q4 → "RAG NEEDED. Run /rag-setup now in background."
- All NO → "Context stuffing sufficient. Proceed to /brainstorming."

Output: one-line verdict + exact next command.
```

#### `.claude/skills/seed-demo-data/SKILL.md`

```markdown
---
name: seed-demo-data
description: Generate realistic demo data for the current scenario. No Lorem Ipsum.
triggers:
  - "seed data"
  - "demo data"
---

# Seed Demo Data

1. Read active prisma/schema.prisma
2. Ask: "What industry/domain is this demo for?"
3. Write prisma/seed.ts:
   - Realistic names, companies, dates, amounts for the domain
   - 10+ records per main entity
   - All relationships correctly wired
   - Pre-written AI conversation history if Scenario C/D
   - 5 real-looking documents if Scenario D (RAG)
4. Run: pnpm db:seed
5. Verify data appears in UI

Rule: No Lorem Ipsum. No "Test User 1". No "Example Company".
```

#### `.claude/skills/demo-script/SKILL.md`

```markdown
---
name: demo-script
description: Generate the adaptive 5-min demo script from what was actually built.
triggers:
  - "demo script"
  - "generate script"
---

# Demo Script

1. List all completed features from today's Linear tasks
2. Generate script with exact timing:

0:00–0:30 Captain:
  Show CLAUDE.md → Superpowers /brainstorming output → TDD red→green screenshot

0:30–2:00 Frontend:
  Product walkthrough with real data, all 4 features, show loading + empty states

2:00–3:30 AI Lead:
  Live streaming AI feature → tool use → RAG citations if Scenario D

3:30–4:00 Captain:
  Architecture summary → what we'd build next → team intro

3. Flag any missing demo data or broken states before recording
```

---

### STEP 5 — Write 7 Subagents (Captain, Day 1 — after Step 4)

Create one `.md` file per subagent in `.claude/agents/`.

#### `implementer.md`

```markdown
---
name: implementer
description: Focused implementation agent. One task, TDD-first. Dispatched by /subagent-driven-development.
---

You receive one specific task. Do only that task.

Process:
1. Read the full task spec before touching code
2. Create the test file first — tdd-guard will block you otherwise
3. Write failing test → confirm RED
4. Write minimum implementation → confirm GREEN
5. Refactor only after GREEN
6. Report: files changed, tests passing, time taken

Never mark done until tests are GREEN.
```

#### `spec-reviewer.md`

```markdown
---
name: spec-reviewer
description: Stage 1 of 2-stage review. Checks implementation matches original spec. Called by /requesting-code-review.
---

Verify implementation matches what was requested. Not about code quality yet.

Check:
- Every requirement from the spec is present in code
- All edge cases handled
- Input validation rules implemented
- Auth requirements respected
- Error messages are user-friendly
- Return shapes correct

Output:
```
SPEC REVIEW: [PASS / FAIL / PARTIAL]
✅ IMPLEMENTED: [requirement] at [file:line]
❌ MISSING: [requirement] — [what's missing]
⚠️ DEVIATIONS: [spec said X, code does Y]
```
Only PASS if ALL requirements met. Do not pass to @quality-reviewer until PASS.
```

#### `quality-reviewer.md`

```markdown
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
```

#### `db-analyst.md`

```markdown
---
name: db-analyst
description: Finds N+1 queries, missing indexes, unbounded queries, unnecessary data fetching.
---

Find database performance issues.

N+1 pattern (CRITICAL):
// BAD
const items = await db.item.findMany()
for (const item of items) {
  const user = await db.user.findUnique({ where: { id: item.userId } }) // N+1
}
// GOOD
const items = await db.item.findMany({ include: { user: true } })

Also check:
- Columns in WHERE/ORDER BY without @@index
- findMany() without take (unbounded)
- Selecting all fields when only 2 are needed

Output: file, line, severity (CRITICAL/WARNING/INFO), exact fix.
```

#### `ux-reviewer.md`

```markdown
---
name: ux-reviewer
description: Reviews loading states, empty states, error states, accessibility, mobile responsiveness.
---

Every async operation needs all 3 states:
- Loading: skeleton or spinner
- Empty: EmptyState component (never a blank screen)
- Error: user-friendly message (never a crash)

Accessibility:
- All buttons/links have labels
- Forms have associated labels
- Keyboard navigation works (Tab through interactive elements)

Mobile (at 375px):
- No horizontal overflow
- Touch targets 44×44px minimum
- Tables scroll or stack

Output: missing states with component + line. Priority: CRITICAL / WARNING / INFO.
```

#### `security-auditor.md`

```markdown
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
```

#### `rag-builder.md` (conditional — Scenario D only)

```markdown
---
name: rag-builder
description: CONDITIONAL. Builds RAG pipeline for Scenario D (document search topics).
---

Chunking: 512 tokens, 20% overlap. Adjust per doc type:
- Legal/technical: 256 tokens
- Narrative: 768 tokens
- Code: chunk by function boundaries

Embedding: Voyage AI voyage-2 (1536 dims). Batch in groups of 128.

Retrieval: k=5, cosine similarity, min threshold 0.7.

Reranking: ask Claude to rank retrieved chunks, return top 3.

Citation format (required in every answer):
{ "answer": "...", "sources": [{ "documentId": "...", "title": "...", "chunkIndex": 2 }] }

Quality test: upload 5 docs, run 10 queries, verify >80% accuracy, no hallucinated sources.
```

---

### STEP 6 — Write .claude/context/ Docs (Captain, Day 1 — after Step 5)

One file per scenario. These are the domain knowledge docs Claude reads during the hackathon.

#### `scenario-a.md` (Internal Tool)

```markdown
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
```

#### `scenario-b.md` (Mini CRM)

```markdown
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
```

#### `scenario-c.md` (AI App)

```markdown
# Scenario C — AI App (no RAG)

## Core Entities
- ChatSession (id, userId, title, createdAt)
- ChatMessage (id, sessionId, role, content, tokens, createdAt)

## tRPC Routers
- sessions.router: list, create, delete, rename
- messages.router: list (by session)

## API Routes
- POST /api/ai/chat — streaming response via Vercel AI SDK

## UI Pages
- /chat — chat window + streaming + session sidebar
- /chat/[id] — conversation history
- /settings — model config, system prompt

## AI Features
- Streaming response (tokens appear in real time)
- Tool use: create/update records directly from chat
- Context stuffing: inject relevant DB data into system prompt
```

#### `scenario-d.md` (AI + RAG)

```markdown
# Scenario D — AI App + RAG

## Core Entities (extends Scenario C)
- Document (id, title, fileUrl, status, uploadedById, createdAt)
- DocumentChunk (id, documentId, content, embedding vector(1536), chunkIndex)

## pgvector Setup (already in migration — just activate)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX ON "DocumentChunk" USING ivfflat (embedding vector_cosine_ops);

## RAG Pipeline
1. Upload → parse → chunk (512 tokens, 20% overlap)
2. Embed via Voyage AI voyage-2 (1536 dims)
3. Store in DocumentChunk.embedding
4. Query → embed → cosine search → top-5 chunks
5. Rerank → inject into Claude prompt → answer with citations

## tRPC Routers
- documents.router: upload, list, delete, getStatus
- chat.router: createSession, sendMessage (streaming), listSessions
- search.router: semanticSearch

## UI Pages
- /documents — upload + list + processing status
- /chat — streaming chat + source citations panel
- /search — semantic search with highlighted results
```

---

### STEP 7 — Configure Hooks (AI Lead, Day 1 — parallel with Steps 2–6)

Create all scripts, then make them executable.

```bash
chmod +x .claude/hooks/*.sh
```

#### `.claude/hooks/tdd-guard.sh` — MOST CRITICAL

```bash
#!/bin/bash
# PreToolUse:Write — blocks impl files without a test file
FILE_PATH="$1"

if [[ "$FILE_PATH" =~ src/server/trpc/routers/[^_][^/]+\.ts$ ]] && \
   [[ ! "$FILE_PATH" =~ \.test\.ts$ ]] && \
   [[ ! "$FILE_PATH" =~ root\.ts$ ]] && \
   [[ ! "$FILE_PATH" =~ index\.ts$ ]]; then

  ROUTER_NAME=$(basename "$FILE_PATH" .ts)
  TEST_FILE="src/server/trpc/routers/__tests__/${ROUTER_NAME}.test.ts"

  if [ ! -f "$TEST_FILE" ]; then
    echo "🚫 TDD GUARD BLOCKED"
    echo "Cannot write: $FILE_PATH"
    echo "Missing test: $TEST_FILE"
    echo "Create the test file first → confirm RED → then write impl"
    exit 1
  fi
fi
exit 0
```

#### `.claude/hooks/post-write.sh`

```bash
#!/bin/bash
# PostToolUse:Write — lint + typecheck on every file save
FILE_PATH="$1"
if [[ "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  pnpm eslint "$FILE_PATH" --max-warnings=0 --quiet 2>&1
  pnpm tsc --noEmit --pretty 2>&1 | grep -E "error TS" | head -5
fi
exit 0
```

#### `.claude/hooks/post-edit-test.sh`

```bash
#!/bin/bash
# PostToolUse:Write — auto-run related test after every implementation edit
FILE_PATH="$1"

if [[ "$FILE_PATH" =~ src/server/trpc/routers/([^/]+)\.ts$ ]] && \
   [[ ! "$FILE_PATH" =~ \.test\.ts$ ]]; then
  ROUTER_NAME="${BASH_REMATCH[1]}"
  TEST_FILE="src/server/trpc/routers/__tests__/${ROUTER_NAME}.test.ts"
  if [ -f "$TEST_FILE" ]; then
    pnpm vitest run "$TEST_FILE" --reporter=verbose 2>&1 | tail -20
  fi
fi

if [[ "$FILE_PATH" =~ \.test\.ts$ ]]; then
  pnpm vitest run "$FILE_PATH" --reporter=verbose 2>&1 | tail -20
fi
exit 0
```

#### `.claude/hooks/pre-bash-guard.sh`

```bash
#!/bin/bash
# PreToolUse:Bash — blocks catastrophic commands
COMMAND="$1"

DANGEROUS=(
  "rm -rf /" "rm -rf ~" "rm -rf \*"
  "DROP TABLE" "DROP DATABASE"
  "DELETE FROM.*WHERE.*1=1"
  "git push.*--force.*main" "git push.*-f.*main"
  "npx prisma db push --accept-data-loss"
)

for pattern in "${DANGEROUS[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern"; then
    echo "🚫 BLOCKED: $COMMAND (matched: $pattern)"
    echo "Run manually outside Claude Code if truly needed."
    exit 1
  fi
done
exit 0
```

#### `.claude/hooks/on-stop-notify.sh`

```bash
#!/bin/bash
# Stop event — desktop notification when task completes
TASK_SUMMARY="${1:-Task completed}"
if command -v osascript &> /dev/null; then
  osascript -e "display notification \"$TASK_SUMMARY\" with title \"Claude Code\" sound name \"Glass\""
fi
if command -v notify-send &> /dev/null; then
  notify-send "Claude Code" "$TASK_SUMMARY"
fi
echo -e "\a"
exit 0
```

#### `.claude/hooks/on-commit-check.sh`

```bash
#!/bin/bash
# PostToolUse:Bash — full test suite after git commit
COMMAND="$1"
if echo "$COMMAND" | grep -q "git commit"; then
  echo "🧪 Running full test suite..."
  pnpm vitest run --reporter=verbose 2>&1 | tail -30
fi
exit 0
```

---

### STEP 8 — Configure MCP Servers (AI Lead, Day 1 — parallel)

Create `.claude/settings.json` with both hooks registration AND MCP servers:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": ".claude/hooks/tdd-guard.sh", "args": ["{{ tool_input.path }}"] }]
      },
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": ".claude/hooks/pre-bash-guard.sh", "args": ["{{ tool_input.command }}"] }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/post-write.sh", "args": ["{{ tool_input.path }}"] },
          { "type": "command", "command": ".claude/hooks/post-edit-test.sh", "args": ["{{ tool_input.path }}"] }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/on-commit-check.sh", "args": ["{{ tool_input.command }}"] }
        ]
      }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": ".claude/hooks/on-stop-notify.sh", "args": ["{{ result.summary }}"] }] }
    ]
  },
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_PAT>" }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest",
               "--supabase-url", "<YOUR_SUPABASE_URL>",
               "--supabase-service-role-key", "<YOUR_SERVICE_ROLE_KEY>"]
    },
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server"],
      "env": { "LINEAR_API_KEY": "<YOUR_KEY>" }
    },
    "vercel": {
      "command": "npx",
      "args": ["-y", "@vercel/mcp-adapter"],
      "env": { "VERCEL_TOKEN": "<YOUR_TOKEN>" }
    },
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server"],
      "env": { "SENTRY_AUTH_TOKEN": "<YOUR_TOKEN>", "SENTRY_ORG": "<YOUR_ORG>" }
    },
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-mcp"],
      "env": { "FIGMA_API_KEY": "<YOUR_KEY>" }
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": { "NOTION_API_KEY": "<YOUR_KEY>" }
    }
  }
}
```

**Test each MCP inside Claude Code immediately after adding:**

```
GitHub:   "List the last 3 pull requests on this repo"
Supabase: "Show me all tables in the database"
Linear:   "Show me open issues in the current sprint"
Vercel:   "What's the status of the latest deployment?"
Sentry:   "Are there any new errors in the last 24 hours?"
```

Fix any broken MCP before moving on. A broken MCP on competition day costs 20 minutes.

**GitHub PAT required permissions:** `repo` (full), `workflow`, `read:org`, `notifications`

---

### STEP 9 — Prisma Schema (Full-Stack, Day 1)

Single `prisma/schema.prisma` file with all 4 scenarios as commented blocks.
On competition day, uncomment the correct section in < 3 minutes.

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [pgvector(map: "vector")]
}

// ─── ALWAYS PRESENT ──────────────────────────────────────────────────────────

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
enum Role { ADMIN MEMBER VIEWER }

// ─── SCENARIO A: INTERNAL TOOL ── uncomment for dashboard/tracker/admin topics

// model Item {
//   id          String     @id @default(cuid())
//   title       String
//   description String?
//   status      ItemStatus @default(TODO)
//   priority    Priority   @default(MEDIUM)
//   assigneeId  String?
//   assignee    User?      @relation(fields: [assigneeId], references: [id])
//   createdAt   DateTime   @default(now())
//   updatedAt   DateTime   @updatedAt
//   activities  Activity[]
//   @@index([status, assigneeId])
// }
// enum ItemStatus { TODO IN_PROGRESS DONE CANCELLED }
// enum Priority   { LOW MEDIUM HIGH URGENT }
// model Activity {
//   id        String   @id @default(cuid())
//   itemId    String
//   userId    String
//   action    String
//   metadata  Json     @default("{}")
//   createdAt DateTime @default(now())
//   item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
//   @@index([itemId, createdAt])
// }

// ─── SCENARIO B: MINI CRM ── uncomment for CRM/sales/contacts/deals topics

// model Contact {
//   id        String        @id @default(cuid())
//   name      String
//   email     String?
//   company   String?
//   phone     String?
//   status    ContactStatus @default(LEAD)
//   ownerId   String?
//   owner     User?         @relation(fields: [ownerId], references: [id])
//   deals     Deal[]
//   createdAt DateTime      @default(now())
//   updatedAt DateTime      @updatedAt
// }
// enum ContactStatus { LEAD PROSPECT CUSTOMER CHURNED }
// model Deal {
//   id          String    @id @default(cuid())
//   title       String
//   value       Float     @default(0)
//   stage       DealStage @default(PROSPECTING)
//   probability Int       @default(0)
//   contactId   String
//   contact     Contact   @relation(fields: [contactId], references: [id])
//   closedAt    DateTime?
//   createdAt   DateTime  @default(now())
//   updatedAt   DateTime  @updatedAt
// }
// enum DealStage { PROSPECTING QUALIFIED PROPOSAL NEGOTIATION CLOSED_WON CLOSED_LOST }

// ─── SCENARIO C: AI APP ── uncomment for chatbot/assistant/automation topics

// model ChatSession {
//   id        String        @id @default(cuid())
//   title     String        @default("New Chat")
//   userId    String
//   user      User          @relation(fields: [userId], references: [id])
//   messages  ChatMessage[]
//   createdAt DateTime      @default(now())
// }
// model ChatMessage {
//   id        String      @id @default(cuid())
//   sessionId String
//   role      MessageRole
//   content   String      @db.Text
//   tokens    Int         @default(0)
//   createdAt DateTime    @default(now())
//   session   ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
// }
// enum MessageRole { USER ASSISTANT }

// ─── SCENARIO D: AI + RAG ── uncomment for wiki/knowledge-base/onboarding topics
// (also uncomment Scenario C above)

// model Document {
//   id           String    @id @default(cuid())
//   title        String
//   fileUrl      String?
//   content      String?   @db.Text
//   status       DocStatus @default(PROCESSING)
//   uploadedById String
//   uploadedBy   User      @relation(fields: [uploadedById], references: [id])
//   chunks       DocumentChunk[]
//   createdAt    DateTime  @default(now())
// }
// enum DocStatus { PROCESSING READY ERROR }
// model DocumentChunk {
//   id         String   @id @default(cuid())
//   documentId String
//   content    String   @db.Text
//   embedding  Unsupported("vector(1536)")?
//   metadata   Json     @default("{}")
//   chunkIndex Int
//   createdAt  DateTime @default(now())
//   document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
//   @@index([documentId])
// }
```

---

### STEP 10 — AI Service Layer (AI Lead, Day 1–2)

#### `src/server/services/ai.service.ts` — active from Day 1

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { createAnthropic } from '@ai-sdk/anthropic'

const anthropicSDK = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 3 })
export const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export const DEFAULT_MODEL = 'claude-sonnet-4-6' as const

// For tool use (non-streaming)
export async function generateWithTools(
  systemPrompt: string,
  userMessage: string,
  tools?: Anthropic.Tool[],
) {
  return anthropicSDK.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    tools: tools ?? [],
  })
}

// For data-aware queries — context stuffing (Scenarios A, B, C)
export async function queryWithContext<T>(context: T, question: string, systemPrompt?: string) {
  const response = await anthropicSDK.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    system: systemPrompt ?? 'Answer based only on the provided context.',
    messages: [{
      role: 'user',
      content: `Context:\n${JSON.stringify(context, null, 2)}\n\nQuestion: ${question}`,
    }],
  })
  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}
```

#### Streaming API route template (copy for every AI feature)

```typescript
// src/app/api/ai/[feature]/route.ts
import { anthropic } from '@/server/services/ai.service'
import { streamText } from 'ai'
import { auth } from '@/server/auth'
import { z } from 'zod'

const inputSchema = z.object({
  message: z.string().min(1).max(4000),
  context: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const body = inputSchema.parse(await req.json())
  const result = await streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `You are a helpful assistant. Context: ${body.context ?? 'None'}`,
    messages: [{ role: 'user', content: body.message }],
    maxTokens: 1000,
  })
  return result.toDataStreamResponse()
}
```

#### `src/server/services/rag.service.ts` — DORMANT stub (commit Day 2, activate only if needed)

```typescript
// RAG SERVICE — DORMANT STUB
// Uncomment ONLY when /rag-setup skill is triggered on competition day
// Requires: VOYAGE_API_KEY set, DocumentChunk migration run

/*
import { db } from '@/server/db'

const CHUNK_WORDS = 384   // ~512 tokens
const OVERLAP_WORDS = 77  // ~20% overlap
const DEFAULT_K = 5
const MIN_SIMILARITY = 0.7

export function chunkText(text: string): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += CHUNK_WORDS - OVERLAP_WORDS) {
    const chunk = words.slice(i, i + CHUNK_WORDS).join(' ')
    if (chunk.trim()) chunks.push(chunk)
    if (i + CHUNK_WORDS >= words.length) break
  }
  return chunks
}

export async function embedText(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: texts, model: 'voyage-2' }),
  })
  const data = await res.json()
  return data.data.map((d: { embedding: number[] }) => d.embedding)
}

export async function embedAndStore(documentId: string, content: string) {
  const chunks = chunkText(content)
  const embeddings = await embedText(chunks)
  await db.$transaction(
    chunks.map((chunk, i) =>
      db.$executeRaw`
        INSERT INTO "DocumentChunk" (id, "documentId", content, embedding, metadata, "chunkIndex", "createdAt")
        VALUES (gen_random_uuid(), ${documentId}, ${chunk},
                ${JSON.stringify(embeddings[i])}::vector, '{}', ${i}, NOW())
      `
    )
  )
}

export async function semanticSearch(query: string, k = DEFAULT_K) {
  const [queryEmbedding] = await embedText([query])
  return db.$queryRaw<Array<{
    id: string; content: string; documentId: string; chunkIndex: number; similarity: number
  }>>`
    SELECT id, content, "documentId", "chunkIndex",
           1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) AS similarity
    FROM "DocumentChunk"
    WHERE 1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${MIN_SIMILARITY}
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${k}
  `
}
*/
```

---

### STEP 11 — Component Library (Frontend, Days 1–3)

Pre-build these before competition day. On competition day, assemble — don't build from scratch.

```
src/components/
├── layout/
│   ├── Sidebar.tsx       # Collapsible nav — swap links per scenario
│   ├── Topbar.tsx        # Search + user menu
│   └── PageContainer.tsx # Consistent padding + max-width
├── data-display/
│   ├── DataTable.tsx     # Sort + filter + pagination + skeleton
│   ├── KPICard.tsx       # Metric + trend + icon
│   ├── Chart.tsx         # Line/Bar/Pie via recharts
│   └── ActivityFeed.tsx  # Timestamped event list
├── forms/
│   ├── FormBuilder.tsx   # Zod schema → form (wildcard insurance)
│   └── fields/           # Input, Select, Textarea, DatePicker, FileUpload
├── feedback/
│   ├── EmptyState.tsx    # Icon + title + CTA (every list needs this)
│   ├── Skeleton.tsx      # Table/card/page variants
│   └── ErrorBoundary.tsx
└── rag/                  # DORMANT until Scenario D
    ├── DocumentUpload.tsx
    ├── SearchResults.tsx  # With citation cards
    └── ChatWindow.tsx     # Streaming message display

src/app/(dashboard)/_layouts/
├── InternalToolLayout.tsx
├── CRMLayout.tsx
├── AIAppLayout.tsx
└── AIRagLayout.tsx
```

---

### STEP 12 — Full Workflow Validation (Day 2, after repo exists)

**This is the first time you run /brainstorming** — on a dummy topic, purely to test the machine.

```
Inside Claude Code, in the hackathon-app repo:

1. /brainstorming
   → Dummy topic: "a task tracker for a bakery"
   → Complete the full Socratic dialogue — do not skip any questions
   → Expected: Claude asks clarifying questions, refines the idea

2. /writing-plans
   → Input: the brainstorm output above
   → Expected: 2–5 min tasks with exact file paths and test file locations

3. /tdd-feature
   → Pick one task from the plan (e.g. "create items tRPC router")
   → Expected: Claude creates test file first, confirms RED, then writes impl, confirms GREEN

4. /subagent-driven-development
   → Dispatch @implementer on a single small task
   → Expected: fresh subagent completes the task independently

5. /verification-before-completion
   → Verify the dummy task is actually done
   → Expected: Claude asks for evidence, not just assurance
```

**Time the full run.** Target: < 30 minutes total.
Any friction you find here = fix before Day 3.
This dummy run is thrown away — it's a systems test, not real product work.

---

### STEP 13 — Day 1 EOD Verification

Run at 17:00 on Day 1. Everything must pass before Day 2.

```bash
#!/bin/bash
echo "🔍 Day 1 Setup Verification"
PASS=0; FAIL=0

check() {
  if eval "$2" &>/dev/null; then echo "  ✅ $1"; ((PASS++))
  else echo "  ❌ $1"; ((FAIL++)); fi
}

echo "── Repo ──"
check "Git repo exists"              "git status"
check "Production URL on Vercel"     "vercel ls 2>/dev/null | grep -q hackathon"
check "pnpm install works"           "pnpm install --frozen-lockfile"
check "TypeScript compiles"          "pnpm type-check"
check "Tests pass"                   "pnpm test"

echo "── .claude/ ──"
check "CLAUDE.md exists"             "test -f .claude/CLAUDE.md || test -f CLAUDE.md"
check "8+ Skills exist"              "[ $(ls .claude/skills/ | wc -l) -ge 8 ]"
check "7 Subagents exist"            "[ $(ls .claude/agents/ | wc -l) -ge 7 ]"
check "6 Hooks exist"                "[ $(ls .claude/hooks/*.sh | wc -l) -ge 6 ]"
check "Hooks are executable"         "test -x .claude/hooks/tdd-guard.sh"
check "settings.json exists"         "test -f .claude/settings.json"
check "4 context docs exist"         "[ $(ls .claude/context/ | wc -l) -ge 4 ]"

echo "── Database ──"
check "Prisma client generated"      "test -d node_modules/.prisma"
check "DB connection works"          "pnpm prisma db pull"

echo "── Environment ──"
check "ANTHROPIC_API_KEY set"        "test -n \"$ANTHROPIC_API_KEY\""
check "DATABASE_URL set"             "test -n \"$DATABASE_URL\""
check "SUPABASE_URL set"             "test -n \"$NEXT_PUBLIC_SUPABASE_URL\""

echo "── Hook Tests ──"
check "tdd-guard blocks without test" \
  ".claude/hooks/tdd-guard.sh src/server/trpc/routers/fake.ts; [ \$? -eq 1 ]"
check "pre-bash-guard blocks DROP" \
  ".claude/hooks/pre-bash-guard.sh 'DROP TABLE users'; [ \$? -eq 1 ]"

echo ""
echo "Passed: $PASS | Failed: $FAIL"
[ $FAIL -eq 0 ] && echo "🎉 Day 1 complete." || echo "⚠️  Fix $FAIL items before Day 2."
```

---

## Summary — The Correct Sequential Order

```
STEP 0   Accounts + tools + .env         All 4 people    Before Day 1
STEP 1   Install Superpowers             Captain         Day 1, 09:00 (first command)
STEP 2   Init repo + CI/CD + Vercel      Full-Stack      Day 1, 09:00 (parallel with Step 1)
STEP 3   Write CLAUDE.md                 Captain         Day 1, after Step 1
STEP 4   Write 4 custom Skills           Captain         Day 1, after Step 3
STEP 5   Write 7 Subagents               Captain         Day 1, after Step 4
STEP 6   Write context docs (4 files)    Captain         Day 1, after Step 5
STEP 7   Configure Hooks (6 scripts)     AI Lead         Day 1 (parallel with Steps 2–6)
STEP 8   Configure MCP servers (7)       AI Lead         Day 1 (parallel)
STEP 9   Prisma schema (4 scenarios)     Full-Stack      Day 1 (parallel)
STEP 10  AI service layer                AI Lead         Day 1–2
STEP 11  Component library               Frontend        Days 1–3
STEP 12  Full workflow validation         Captain         Day 2 — FIRST real /brainstorming run
                                                          (dummy topic, testing the machine)
STEP 13  Day 1 EOD verification          All 4 people    Day 1, 17:00

─────────────── Days 3–6: Build scenarios, speed drills, quality gate ───────────────

Day 7    Mock Hackathon #1               All 4 people    First /brainstorming on a mock topic
Day 13   Final Simulation                All 4 people    Second /brainstorming run
Competition Day  Real Hackathon          All 4 people    /brainstorming on the REAL topic
```

---

## Speed Benchmarks — Must Hit Before Day 7 (Mock Hackathon)

| Action | Target | Owner |
|--------|--------|-------|
| Topic → scenario decision | < 5 min | Captain |
| /brainstorming → 4 features locked | < 8 min | Captain |
| /writing-plans → tasks assigned | < 7 min | Captain |
| First /tdd-feature running | < 15 min from topic reveal | Full-Stack |
| Schema activation + migration | < 3 min | Full-Stack |
| Full feature page from components | < 15 min | Frontend |
| RAG cold activation → live search | < 12 min | AI Lead |
| AI streaming feature on production | < 12 min | AI Lead |
| Realistic demo data seeded | < 5 min | Full-Stack |
| Demo script generated | < 2 min | Captain |
