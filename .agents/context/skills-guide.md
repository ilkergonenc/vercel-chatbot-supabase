# Skills guide

This repository contains repo-local skills under `.agents/skills/`, and `skills-lock.json` records their sources.

Before using a repo-local skill, read its `SKILL.md` and follow any referenced files that are relevant to the task. Repo inspection and current project code still win over stale skill text.

## Available repo-local skills

- `ai-sdk`: Use for AI SDK work, including `generateText`, `streamText`, `useChat`, tool calling, agents, structured output, embeddings, providers, and AI-powered chatbot features. Prefer bundled, version-matched docs in `node_modules/ai/docs/` and installed package source over memory.
- `find-skills`: Use when the user asks to find, install, or evaluate skills for a capability, workflow, or specialized domain.
- `playwright-generate-test`: Use when generating a Playwright test from a user scenario. Follow its MCP-driven workflow, save the test under `tests/`, run it, and iterate until it passes.
- `shadcn`: Use for shadcn/ui component work, registry work, component installation, UI composition, and shadcn-specific troubleshooting.
- `supabase`: Use for any Supabase task, including Auth, Storage, Postgres, RLS, migrations, client libraries, SSR integration, schema changes, and Supabase security review. Verify against current Supabase docs/changelog before implementing.
- `vercel-react-best-practices`: Use when writing, reviewing, or refactoring React/Next.js code where performance, rendering, data fetching, bundle size, or server/client component patterns matter.

Do not claim other project-specific skills are installed unless matching files exist in the repo or the active tool environment exposes them. Old migration-era notes that only suggested possible skills were removed because they were not evidence of installed skills.
