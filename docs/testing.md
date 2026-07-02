# Testing

Use the package scripts in `package.json`.

## Commands

- Static checks: `pnpm check`
- Auto-fix formatting/lint: `pnpm fix`
- Build: `pnpm build`
- Drizzle schema check: `pnpm db:check`
- Playwright: `pnpm test`
- Headed Playwright: `pnpm test:headed`
- Playwright UI: `pnpm test:ui`
- Playwright report: `pnpm test:report`

The Playwright scripts set `PLAYWRIGHT=true` through `cross-env`. In PowerShell, the equivalent direct command is:

```powershell
$env:PLAYWRIGHT='True'; pnpm exec playwright test
```

## Expectations

Add or update regression coverage when fixing bugs. Prefer Playwright for browser flows and user-visible behavior. For documentation-only changes, safe validation commands such as `git status`, directory listing, and targeted `rg` searches are usually enough.
