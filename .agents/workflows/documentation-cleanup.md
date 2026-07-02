# Documentation cleanup workflow

1. Check `git status --short`.
2. Inspect current source files that own the behavior being documented.
3. Search existing docs for stale provider, auth, storage, database, or tooling references.
4. Update the shortest authoritative doc instead of duplicating long explanations.
5. Archive useful history and remove misleading duplicates.
6. Validate with safe listing and search commands.

Do not change runtime code during documentation-only cleanup.
