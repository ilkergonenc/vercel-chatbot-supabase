<a href="https://chatbot.ai-sdk.dev/demo">
  <img alt="Chatbot" src="app/(chat)/opengraph-image.png">
  <h1 align="center">Chatbot</h1>
</a>

<p align="center">
    Chatbot (formerly AI Chatbot) is a free, open-source template built with Next.js and the AI SDK that helps you quickly build powerful chatbot applications.
</p>

<p align="center">
  <a href="https://chatbot.ai-sdk.dev/docs"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://ai-sdk.dev/docs/introduction)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Uses OpenAI models through the AI SDK OpenAI provider
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Supabase Postgres](https://supabase.com/database) with Drizzle ORM for saving chat history and user data
  - [Supabase Storage](https://supabase.com/storage) for public chat attachment uploads
- [Supabase Auth](https://supabase.com/auth)
  - Email/password accounts and anonymous guest sessions

## Model Providers

This template uses the [AI SDK OpenAI provider](https://ai-sdk.dev/providers/ai-sdk-providers/openai) to access OpenAI models directly. Models and local capability metadata are configured in `lib/ai/models.ts`.

### OpenAI Authentication

Set `OPENAI_API_KEY` in your `.env.local` file.

## Deploy Your Own

You can deploy your own version of Chatbot to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/templates/next.js/chatbot)

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

For Supabase Postgres, set `DATABASE_URL` for the app runtime and `DIRECT_DATABASE_URL` for Drizzle migrations. `POSTGRES_URL` is still accepted as a legacy fallback during migration.

For Supabase Auth, enable email/password sign-ins and anonymous sign-ins. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

For Supabase Storage uploads, create a public bucket named `chat-attachments` or set `SUPABASE_STORAGE_BUCKET`. Set the server-only `SUPABASE_SERVICE_ROLE_KEY`; never expose the service role key to client code.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm db:migrate # Setup database or apply latest database changes
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000).
