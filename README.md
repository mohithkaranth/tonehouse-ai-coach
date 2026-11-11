This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Coach and billing changes

Use Node.js 24 for the build and runtime. Run `npx prisma migrate deploy` against the database for the target environment before releasing this version. The migration adds the shared API rate-limit table. Keep the migration connection scoped to that environment.

Coach generation uses the OpenAI Responses API with `gpt-6-luna` by default. Set `OPENAI_COACH_MODEL` to a model that supports Structured Outputs to override it. `YOUTUBE_API_KEY` is optional for practice plans. The Coach uses fallback links when YouTube is unavailable.

The Stripe webhook uses subscription-created, updated and deleted events to refresh the current Stripe subscription. It also handles completed and asynchronously paid Checkout sessions when those events are enabled. `NEXTAUTH_URL` determines the trusted base URL for billing redirects.

Run `npm test` for the paid routes, Stripe subscription flow and Coach output checks. These tests use provider stubs and make no live OpenAI or Stripe requests. Set `TEST_DATABASE_URL` to a migrated, isolated PostgreSQL database to also run the concurrency check.
