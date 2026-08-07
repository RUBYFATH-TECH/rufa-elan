<<<<<<< HEAD
# RUFA ELAN

A scalable production-ready e-commerce storefront for RUFA ELAN — a ladies handbag and fashion accessories brand in Ghana.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase PostgreSQL + Auth
- Paystack payment integration
- Zustand cart state
- Zod validation
- React Hook Form
- Cloudinary or Supabase Storage support

## Features

- Home, shop, category, product, about, contact, delivery, returns, privacy, terms, FAQ, order tracking
- Product catalog with categories, variants, prices, ratings, SKU and related items
- Persistent cart, guest checkout, user checkout
- Paystack initialization and server-side verification
- Delivery tracking and order status timeline
- Customer account pages and auth flows
- Admin dashboard skeleton with product and order management
- Supabase Row Level Security policies
- Sitemap and robots.txt for SEO

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy environment variables

```bash
cp .env.example .env.local
```

3. Set your Supabase, Paystack, Cloudinary, and email credentials.

4. Run database migrations in Supabase using `supabase/schema.sql` and `supabase/policies.sql`.

5. Start the dev server

```bash
npm run dev
```

## Supabase deployment

- Create a Supabase project
- Enable Auth providers for email/password
- Apply `supabase/schema.sql` to create the normalized database schema
- Apply `supabase/policies.sql` to enable RLS and secure access
- Add Row Level Security policies to protect user data and admin resources

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `CLOUDINARY_*` (optional)
- `RESEND_API_KEY`
- `NEXTAUTH_URL`

## Deployment to Vercel

1. Push the repository to GitHub.
2. Create a new Vercel project connected to the repo.
3. Add environment variables in Vercel using `.env.example` values.
4. Set the build command to `npm run build`.
5. Use the output directory default for Next.js.
6. Deploy.

## Security checklist

- Secrets are stored in environment variables
- Paystack secret key is never exposed in frontend code
- Payment initialization and verification happen in API routes
- Supabase Row Level Security enabled for user-owned tables
- Input validations use Zod schemas
- Admin pages are gated via middleware
- HTTPS required in production

## Notes

This repository provides a strong skeleton for RUFA ELAN. For production readiness, connect the admin dashboard and checkout flow to Supabase functions, implement full auth with Supabase Auth, and wire email/WhatsApp notifications via Resend and messaging APIs.
=======
# rufa-elan
Ladies Fashion e-commerce website
>>>>>>> 26f08d0fc59858fff3204433277c538054887f7c
