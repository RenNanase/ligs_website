# LIGS Website

Official website for **Lembaga Industri Getah Sabah (LIGS)** — corporate information, services, news, announcements, feedback, and related public forms. Content is available in **English** and **Bahasa Melayu**.

## Tech stack

- **Next.js** (App Router) · **React** · **TypeScript** · **Tailwind CSS**
- **Prisma** + **MySQL/MariaDB**
- **NextAuth.js** for the admin area

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set at least `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`. See `.env.example` for optional SMTP and other variables.

3. **Database**

   ```bash
   npx prisma migrate deploy
   ```

   (Use `prisma migrate dev` during local development if you prefer.)

4. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. **Production build**

   ```bash
   npm run build
   npm start
   ```

## Project layout (short)

- `app/` — routes (public site and `/admin`)
- `components/` — UI and sections
- `lib/` — auth, API helpers, i18n, Prisma client
- `prisma/` — schema and migrations

## License

Private / proprietary — all rights reserved unless stated otherwise by LIGS.
