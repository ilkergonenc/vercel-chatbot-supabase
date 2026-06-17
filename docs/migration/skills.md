# Skills and agent setup guide

This guide explains how to use Vercel Labs Skills as support material for future Codex migration sessions.

Skills are helpful, but they are not a replacement for repo-specific inspection. Every implementation phase must inspect the current repository before editing.

## Skills CLI basics

The Vercel Labs `skills` CLI supports Codex and many other coding agents. Useful commands:

```bash
npx skills add vercel-labs/agent-skills --list
npx skills add vercel-labs/agent-skills --agent codex
npx skills add vercel-labs/agent-skills --skill react-best-practices --agent codex
npx skills find nextjs
npx skills find react
npx skills find typescript
npx skills find supabase
npx skills find drizzle
npx skills find openai
npx skills find auth
npx skills find testing
npx skills list
npx skills update
```

For Next.js-specific skills:

```bash
npx skills add vercel-labs/next-skills --skill next-best-practices --agent codex
npx skills add vercel-labs/next-skills --list
```

## Recommended searches

Run these before implementation if skills are not already installed:

```bash
npx skills find nextjs
npx skills find react
npx skills find typescript
npx skills find supabase
npx skills find drizzle
npx skills find openai
npx skills find auth
npx skills find testing
```

## Useful skills for this migration

- `next-best-practices` from `vercel-labs/next-skills`
  - Useful for App Router, route handlers, server/client boundaries, async APIs, and middleware changes.
- `react-best-practices` from `vercel-labs/agent-skills`
  - Useful if client auth provider or session UI changes are needed.
- `writing-guidelines` from `vercel-labs/agent-skills`
  - Useful for final README/docs cleanup.

Potentially useful if discovered through `skills find`:

- Supabase-related skills
- Drizzle-related skills
- OpenAI / AI SDK skills
- Testing or Playwright skills
- Auth migration skills

Install only the skills needed for the phase being implemented.

## Skills not necessary for this migration

- `web-design-guidelines`
  - Not needed unless changing UI/UX, which is a non-goal.
- `vercel-deploy-claimable`
  - Not needed for local migration work.
- `vercel-optimize`
  - Not needed unless doing a later deployment performance/cost audit.
- React Native skills
  - Not relevant to this web app.
- View transition or composition refactor skills
  - Not needed because product/UX redesign and broad refactors are non-goals.

## Phase-by-phase skill use

| Phase | Suggested skills |
| --- | --- |
| Phase 0 | `next-best-practices`, testing skills if available |
| Phase 1 | OpenAI/AI SDK skills if available, `next-best-practices` |
| Phase 2 | Supabase/Drizzle skills if available |
| Phase 3 | Supabase skills if available, `next-best-practices` for route handler behavior |
| Phase 4 | Supabase Auth/auth skills if available, `next-best-practices`, `react-best-practices` |
| Phase 5 | `writing-guidelines`, testing skills if available |

## Agent instructions

When using a skill:

- Read the skill instructions before editing.
- Still inspect repo files directly.
- Keep diffs small and phase-scoped.
- Do not let generic skill guidance override this repo's migration decisions in `AGENTS.md` and `docs/migration/decisions.md`.
