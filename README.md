# Supabase Next.js E-commerce

A small full-stack e-commerce application using Next.js App Router, React Hook Form, Zod, Supabase Auth/PostgreSQL, and Tailwind CSS.

## Requirements

- Node.js 24.x
- A Supabase project containing the existing schema, RLS policies, and `public.create_order(p_items jsonb, p_phone text, p_address text) returns uuid` RPC described by the application specification.

## Run

1. Copy `.env.example` to `.env.local` and set the two Supabase variables.
2. Run `npm install`.
3. Run `npm run dev` for local development.
4. Run `npm run build` and `npm run start` for a production build.

The application does not seed or modify the existing product data, RLS policies, auth users, or database schema.
