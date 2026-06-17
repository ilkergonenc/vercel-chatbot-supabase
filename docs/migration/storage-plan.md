# Supabase Storage migration plan

Phase 3 implements public Supabase Storage uploads. Do not add private bucket signed URL handling until a later hardening phase.

## Previous Vercel Blob usage

- Upload route: `app/(chat)/api/files/upload/route.ts`
- Image host allowlist: `next.config.ts`
- Client upload caller: `components/chat/multimodal-input.tsx`
- Preview/render components:
  - `components/chat/preview-attachment.tsx`
  - `components/chat/message.tsx`

## Upload route behavior

`POST /api/files/upload`:

- Calls `auth()`.
- Returns 401 if no session.
- Reads multipart form field `file`.
- Validates file.
- Sanitizes original filename.
- Uploads to a public Supabase Storage bucket.
- Returns `{ url, pathname, contentType }`.

## File validation rules

Current rules:

- Max size: 5 MB
- Allowed media types:
  - `image/jpeg`
  - `image/png`

Keep these rules in the first Supabase Storage phase.

## Current client expectations

`components/chat/multimodal-input.tsx` expects the upload response to contain:

```ts
{
  url: string;
  pathname: string;
  contentType: string;
}
```

The client stores attachments as:

```ts
{
  url,
  name: pathname,
  contentType
}
```

Message parts persist file URLs directly. This is why a public bucket is the safest first migration.

Important persistence detail:

- Persisted attachment URLs currently live in AI SDK message `parts` as `file` parts.
- `Message_v2.attachments` is currently saved as `[]` in `app/(chat)/api/chat/route.ts`.
- Rendered attachments come from `message.parts`, not from the `attachments` DB column.
- This matters if private Supabase Storage is considered later because signed URLs expire and would need regeneration from stable storage metadata.

## Supabase bucket recommendation

- Bucket name: `chat-attachments`
- Initial access: public
- Path format: `{userId}/{timestamp-or-uuid}-{safeName}`
- Optional later path format: `{userId}/{chatId}/{messageId-or-uuid}-{safeName}`

The current upload route does not receive `chatId`, so adding chat-scoped paths may require a client request change. Avoid that in the first pass unless needed.

## Public bucket phase

Use a public bucket first to match Vercel Blob:

- Upload server-side.
- Return `getPublicUrl(...).data.publicUrl`.
- Preserve `{ url, pathname, contentType }`.
- Update `next.config.ts` remote patterns for the Supabase Storage host.
- Keep the old Vercel Blob image host allowlist for historic messages that already store Blob URLs.

## Phase 3 env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`, optional and defaults to `chat-attachments`

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client code.

## Optional private bucket phase

A private bucket improves access control but changes URL semantics:

- Persist storage path, bucket, content type, and original filename.
- Generate signed URLs when rendering messages.
- Refresh signed URLs after expiry.
- Consider a dedicated attachment metadata table.
- Do not rely on `Message_v2.attachments` without first changing write/read behavior; it is not currently populated with uploaded attachment metadata.

This should be Phase 5 or later, not part of initial storage migration.

## RLS policy considerations

For public bucket first:

- Public read is enabled at bucket level.
- Writes should still go through the authenticated server route.
- If using service role server-side, enforce user path checks in code.
- If using user auth with Supabase Storage policies, allow users to insert only under their own `{userId}/` prefix.

For private bucket later:

- Read policy should allow owners to read their own paths.
- Public chat sharing needs a separate signed URL strategy.
- Delete policy should be owner-only.

## URL persistence implications

Current messages store final image URLs. Public URLs remain stable. Signed URLs expire. Therefore:

- First migration should return stable public URLs.
- Do not switch to signed URLs without changing persistence/rendering logic.
- If private storage is later chosen, store stable bucket/path metadata separately from short-lived signed URLs.

## Cleanup/delete strategy

Current app does not delete Blob files when:

- A user removes an attachment before sending.
- A chat is deleted.
- All chats are deleted.

Potential later cleanup:

- Add an attachment metadata table.
- Track uploaded file path and owning user.
- Delete storage objects when deleting chats.
- Add a scheduled cleanup for orphaned uploads.
