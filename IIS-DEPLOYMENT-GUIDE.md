# LIGS Website — IIS Deployment Guide (Windows Server 2016)

## 1. Project Structure Overview

```
c:\inetpub\wwwroot\ligs_website\
├── package.json              # Root wrapper scripts
├── ecosystem.config.js       # PM2 config (runs Next.js)
├── web.config                # IIS reverse proxy (ROOT site)
└── ligs_website/             # ← Main Next.js application
    ├── package.json          # Next.js scripts & dependencies
    ├── next.config.mjs       # Next.js config
    ├── app/                  # App Router (entry point)
    │   ├── layout.tsx        # Root layout
    │   ├── page.tsx          # Homepage
    │   ├── api/              # API routes (require Node.js)
    │   └── ...
    ├── .next/                # Build output (created by next build)
    ├── node_modules/
    ├── web.config            # (Optional, if subfolder is site root)
    └── .env                  # Environment variables
```

---

## 2. Entry Point ("Main Gate")

| Layer | Entry Point | Purpose |
|-------|-------------|---------|
| **IIS** | `web.config` | Routes all requests to Node.js |
| **PM2** | `ecosystem.config.js` | Starts `next start` |
| **Next.js** | `app/layout.tsx` + `app/page.tsx` | Root layout & homepage |
| **Runtime** | `node_modules/next/dist/bin/next start` | Serves built app on port 3000 |

**Important:** There is no `index.js`. The app is Next.js; the entry is `next start`, which serves from `.next/`.

---

## 3. Build vs. Static Export

### This app **cannot** be statically exported (pure HTML/JS/CSS folder)

Your app uses:

- **API routes** (`/api/*`) — feedback, gallery, perkhidmatan, NextAuth, etc.
- **NextAuth** — session/cookie handling
- **Prisma + MySQL** — database queries
- **Server components** — `layout.tsx` calls `fetchInitialData()`, which hits the DB

→ **You must run a Node.js server.** IIS will act as a **reverse proxy**, not as a static file host.

### What `next build` produces

```
ligs_website\.next\
├── BUILD_ID
├── static/           # Static assets (JS, CSS, images)
├── server/           # Server-side chunks (API routes, RSC)
└── ...
```

These files are **not meant to be served directly by IIS**. The `next start` process reads them and serves pages + API routes.

---

## 4. How to Build for Production

From project root `c:\inetpub\wwwroot\ligs_website`:

```powershell
# 1. Install dependencies (if needed)
npm install

# 2. Build the Next.js app
npm run build

# 3. Ensure Prisma schema is synced (optional, if schema changed)
cd ligs_website
npx prisma generate
cd ..
```

**Production-ready folder:** `c:\inetpub\wwwroot\ligs_website\ligs_website\` with:

- `node_modules/` (installed)
- `.next/` (built)
- `app/`, `components/`, `lib/`, etc.

---

## 5. web.config — IIS Routing

### Root web.config (`c:\inetpub\wwwroot\ligs_website\web.config`)

**Current content:** Proxies to `http://localhost:3000`

```xml
<rule name="ReverseProxyInboundRule1" stopProcessing="true">
  <match url="(.*)" />
  <action type="Rewrite" url="http://localhost:3000/{R:1}" />
</rule>
```

**Assessment:** Correct for a reverse proxy. It forwards all requests to the Node.js app on port 3000.

### Notes

1. **URL Rewrite + ARR** must be installed in IIS.
2. **ARR proxy** must be enabled: Application Request Routing → Server Proxy Settings → Enable.
3. Port must match `ecosystem.config.js` (`PORT: 3000`).
4. For HTTPS, add `serverVariables` like in `ligs_website\web.config`:

```xml
<serverVariables>
  <set name="HTTP_X_FORWARDED_PROTO" value="HTTPS" />
  <set name="HTTP_X_FORWARDED_HOST" value="{HTTP_HOST}" />
</serverVariables>
```

### Inner web.config (`ligs_website\ligs_website\web.config`)

Used only if IIS site root is `ligs_website\ligs_website\` (e.g. sub-application). If the site root is `c:\inetpub\wwwroot\ligs_website\`, use the root `web.config` only.

---

## 6. Deployment Checklist

| Step | Command / Action |
|------|-------------------|
| 1. Build | `npm run build` (from root) |
| 2. Env | Ensure `ligs_website\.env` has `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` |
| 3. DB | Run migrations: `cd ligs_website && npx prisma migrate deploy` |
| 4. PM2 | `pm2 start ecosystem.config.js` (from root) |
| 5. IIS | Site root = `c:\inetpub\wwwroot\ligs_website`; URL Rewrite + ARR enabled |
| 6. Test | Browse site via IIS; confirm API routes and admin work |

---

## 7. Summary

| Question | Answer |
|----------|--------|
| **Entry point** | `next start` (PM2 runs it via `ecosystem.config.js`); app entry is `app/layout.tsx` |
| **Build command** | `npm run build` |
| **Production folder** | `ligs_website/` with `.next/`, `node_modules/`, source files |
| **Static export?** | No — requires Node.js for API routes, NextAuth, DB |
| **web.config** | Root `web.config` is correct; proxies all traffic to `localhost:3000` |
