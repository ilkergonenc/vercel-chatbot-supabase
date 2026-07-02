# AI provider migration plan

Phase 1 implemented the provider change to direct OpenAI.

## Previous Gateway usage

- `lib/ai/providers.ts`
  - Imports `gateway` from `ai`.
  - Returns `gateway.languageModel(modelId)`.
  - Keeps test provider behavior through `customProvider`.
- `lib/ai/models.ts`
  - Defines Gateway model IDs.
  - Defines `gatewayOrder`.
  - Fetches model capabilities from `https://ai-gateway.vercel.sh`.
  - Fetches dynamic Gateway catalog in demo mode.
- `app/(chat)/api/chat/route.ts`
  - Calls `getLanguageModel(chatModel)`.
  - Calls `getCapabilities()`.
  - Sends `providerOptions.gateway`.
  - Handles Gateway credit-card activation errors.
- `app/(chat)/actions.ts`
  - Uses `getTitleModel()`.
  - Sends `providerOptions.gateway`.
- `app/(chat)/api/models/route.ts`
  - Returns Gateway-derived model metadata.
- `components/chat/shell.tsx`
  - Shows AI Gateway activation dialog.
- `hooks/use-active-chat.tsx`
  - Checks for AI Gateway credit-card/activation errors and toggles the activation alert.
- `app/(auth)/layout.tsx`
  - Displays AI Gateway branding copy.
- `lib/errors.ts`
  - Contains `activate_gateway` error surface.

## Files affected

Likely Phase 1 files:

- `package.json`
- `pnpm-lock.yaml`
- `.env.example`
- `lib/ai/providers.ts`
- `lib/ai/models.ts`
- `app/(chat)/api/chat/route.ts`
- `app/(chat)/actions.ts`
- `app/(chat)/api/models/route.ts`
- `components/chat/shell.tsx`
- `hooks/use-active-chat.tsx`
- `app/(auth)/layout.tsx`
- `lib/errors.ts`
- `tests/e2e/model-selector.test.ts`
- `tests/pages/chat.ts`
- `README.md`

The model selector tests currently expect Gateway-era providers and model names such as Kimi, Mistral, DeepSeek, and Grok. They will need updates when the app uses a small OpenAI-only model list.

## Recommended OpenAI model list

Choose a small static list and verify with current AI SDK/OpenAI docs before implementation. Candidate structure:

- Default chat model: a current OpenAI flagship or balanced chat model.
- Fast model: a lower-latency OpenAI model.
- Reasoning model: an OpenAI reasoning-capable model, if desired.
- Title model: fast and inexpensive model.

Example placeholders:

- `gpt-4.1`
- `gpt-4.1-mini`
- `o4-mini`

Assumption: exact model availability can change. Verify before coding.

## Preserve streaming

Keep `streamText`, `createUIMessageStream`, and `createUIMessageStreamResponse` in `app/(chat)/api/chat/route.ts`.

Only replace model construction and provider options. Do not rewrite chat streaming logic.

## Preserve tool calling

Keep existing tools:

- `getWeather`
- `createDocument`
- `editDocument`
- `updateDocument`
- `requestSuggestions`

Replace Gateway capability metadata with static per-model capabilities:

```ts
{
  tools: true,
  vision: true,
  reasoning: false
}
```

Set `experimental_activeTools` using the same existing logic.

## Preserve title generation

Keep `generateTitleFromUserMessage` and `titlePrompt`.

Only change:

- `getTitleModel()`
- remove `providerOptions.gateway`
- choose an OpenAI title model

## Replace Gateway capability metadata

Remove Gateway fetches from `lib/ai/models.ts`.

Use a static object keyed by OpenAI model ID. Keep `/api/models` response shape stable if possible because UI code expects capabilities.

## Env changes

- Remove: `AI_GATEWAY_API_KEY`
- Add: `OPENAI_API_KEY`

## Implementation notes

- `@ai-sdk/openai` is used for direct OpenAI model construction.
- The active model list is static and OpenAI-only: `gpt-4.1`, `gpt-4.1-mini`, `o4-mini`, and `gpt-4o-mini`.
- Gateway model catalog and capability endpoint fetches were replaced with local capability metadata.
- Gateway provider ordering and activation/credit-card handling were removed.

## Error handling changes

- Remove `bad_request:activate_gateway` and Gateway credit-card handling after no code references it.
- Remove the Gateway activation alert path in `hooks/use-active-chat.tsx` and `components/chat/shell.tsx` after replacement error handling exists.
- Add generic OpenAI/API-key error handling only if needed.
- Avoid exposing raw provider errors to users.

## Tradeoffs from removing Gateway

- No Vercel OIDC Gateway auth.
- No Gateway model catalog.
- No Gateway provider fallback routing.
- No `gatewayOrder`.
- Billing, rate limits, and model availability are direct OpenAI concerns.

## Non-target Vercel utilities

Do not automatically remove these just because they mention Vercel:

- `@vercel/functions`
- `@vercel/otel`
- `@vercel/analytics`
- `botid`
- Vercel template links
- `avatar.vercel.sh`

These are separate from the requested AI Gateway migration unless explicitly removed in a later cleanup decision.
