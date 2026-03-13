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
