# Windows Server IIS Deployment Guide — LIGS Website

> **Note:** "Windows Server 11" does not exist. Use **Windows Server 2022** or **Windows 11** as the host. This guide applies to both.

---

## 1. Architecture Overview

```
┌─────────────┐     HTTPS/80      ┌─────┐     Reverse Proxy     ┌──────────────┐     ┌────────────────┐
│   Internet  │ ───────────────▶  │ IIS │ ───────────────────▶  │  Node.js     │ ──▶ │ MySQL/MariaDB  │
│   Users     │                   │     │  http://localhost:3000│  Next.js App │     │  (HeidiSQL)    │
└─────────────┘                   └─────┘                      └──────────────┘     └────────────────┘
```

- **IIS** acts as reverse proxy and terminates SSL.
- **Node.js** runs the Next.js app (`next start`).
- **MySQL/MariaDB** holds all data (Prisma ORM).

---

## 2. Software to Install on Windows Server

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js LTS** | 20.x or 22.x | Run Next.js |
| **MySQL** or **MariaDB** | 8.x / 10.x | Database |
| **HeidiSQL** | Latest | Database management |
| **IIS** | 10+ (built-in) | Web server |
| **URL Rewrite** | 2.1 | IIS rewrite rules |
| **Application Request Routing (ARR)** | 3.0 | Reverse proxy |
| **Git** (optional) | Latest | Clone/copy project |

### Installation Order

1. **Node.js** — Download from [nodejs.org](https://nodejs.org) (LTS). Ensure "Add to PATH" is checked.
2. **MySQL or MariaDB** — [MySQL](https://dev.mysql.com/downloads/installer/) or [MariaDB](https://mariadb.org/download/). Note root password for `DATABASE_URL`.
3. **HeidiSQL** — [heidisql.com](https://www.heidisql.com/download.php).
4. **IIS** — Server Manager → Add Roles and Features → Web Server (IIS). Include:
   - IIS Management Console
   - URL Rewrite
5. **URL Rewrite** — [Download](https://www.iis.net/downloads/microsoft/url-rewrite) and install.
6. **ARR** — [Download](https://www.iis.net/downloads/microsoft/application-request-routing). Enable proxy in IIS manager.

---

## 3. Database Setup with HeidiSQL

### 3.1 Create Database and User

1. Open **HeidiSQL**.
2. Connect to MySQL/MariaDB (host `127.0.0.1` or `localhost`, root + password).
3. Create database:
   ```sql
   CREATE DATABASE ligs_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Create user:
   ```sql
   CREATE USER 'ligs_app'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
   GRANT ALL PRIVILEGES ON ligs_website.* TO 'ligs_app'@'localhost';
   FLUSH PRIVILEGES;
   ```
5. Restrict remote access if DB is on same server; only allow `localhost`.

### 3.2 Connection String Format

```
mysql://ligs_app:YourStrongPassword123!@127.0.0.1:3306/ligs_website
```

**Important:** Special characters in the password must be URL-encoded (e.g. `#` → `%23`, `@` → `%40`).

---

## 4. Project Deployment Steps

### 4.1 Copy Project to Server

- Copy the whole project folder to e.g. `C:\inetpub\ligs-website\`
- Or clone: `git clone <repo> C:\inetpub\ligs-website`

### 4.2 Install Dependencies and Build

Open **Command Prompt** or **PowerShell as Administrator**:

```cmd
cd C:\inetpub\ligs-website
npm ci --omit=dev
npm run build
```

### 4.3 Environment Variables

Create `.env` in the project root (e.g. `C:\inetpub\ligs-website\.env`):

```env
# Database (use the DB from HeidiSQL)
DATABASE_URL="mysql://ligs_app:YOUR_PASSWORD@127.0.0.1:3306/ligs_website"

# NextAuth - use your actual domain
NEXTAUTH_URL="https://ligs.gov.my"
NEXTAUTH_SECRET="<generate-with-below-command>"

# Feedback/SMTP (optional)
FEEDBACK_ADMIN_EMAIL="admin@example.com"
SMTP_USER="your-email@gmail.com"
SMTP_APP_PASSWORD="your-app-password"

# Cron (for archive job)
CRON_SECRET="<random-secret-for-cron-endpoint>"
```

**Generate NEXTAUTH_SECRET** (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Or use: `openssl rand -base64 32` if OpenSSL is installed.

---

## 5. Database Migration and Seed

### 5.1 Run Migrations

```cmd
cd C:\inetpub\ligs-website
npx prisma migrate deploy
```

This applies migrations from `prisma/migrations/` to the database.

### 5.2 Seed Initial Data

```cmd
npx prisma db seed
```

Creates default admin user (email: `admin@ligs.com`, password: `admin123`). **Change this password after first login.**

---

## 6. Run the Application

### Option A: PM2 (Recommended)

1. Install: `npm install -g pm2`
2. Start:
   ```cmd
   cd C:\inetpub\ligs-website
   pm2 start npm --name "ligs-website" -- start
   pm2 save
   pm2 startup
   ```

### Option B: iisnode

1. Install [iisnode](https://github.com/Azure/iisnode).
2. Add a `web.config` in the project root (see project `web.config` for reverse proxy; for iisnode use iisnode-specific config).

### Option C: Windows Service (NSSM)

1. Download [NSSM](https://nssm.cc/download).
2. Create a service that runs: `node.exe C:\inetpub\ligs-website\node_modules\next\dist\bin\next start -p 3000`

---

## 7. IIS Configuration

### 7.1 Create Site in IIS

1. IIS Manager → Sites → Add Website.
2. Site name: `ligs-website`.
3. Physical path: Point to project root `C:\inetpub\ligs-website` (the `web.config` must be in the site root).

**For a Node.js app behind IIS**, you:

- Run Next.js on a port (e.g. 3000) via PM2/NSSM.
- Use IIS as reverse proxy to `http://localhost:3000`.

### 7.2 Reverse Proxy Setup

1. Enable proxy in ARR: IIS → Server → Application Request Routing Cache → Server Proxy Settings → Enable.
2. Add `web.config` in the project root (included in this project) with the rewrite rules.
3. In Server Variables (ARR), allow `HTTP_X_FORWARDED_PROTO` and `HTTP_X_FORWARDED_HOST`.

### 7.3 Bindings

Add bindings for your domain (e.g. `ligs.gov.my`) and HTTPS. Obtain SSL via Let's Encrypt (Win-ACME) or your CA.

---

## 8. Uploads Folder Permissions

The app writes to `public/uploads/` and subfolders. Grant write access to the process running the app:

```cmd
icacls "C:\inetpub\ligs-website\public\uploads" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

For PM2/NSSM, grant permissions to the Windows user that runs the Node process.

---

## 9. Security Checklist

### 9.1 Application Security

| Item | Action |
|------|--------|
| **NEXTAUTH_SECRET** | Use a strong random value (32+ bytes). |
| **CRON_SECRET** | Set and use for `/api/cron/archive`. |
| **Admin password** | Change default `admin123` after first login. |
| **.env** | Never commit to Git; keep in project root and restrict file permissions. |
| **DATABASE_URL** | Use a dedicated DB user with limited privileges, not root. |

### 9.2 Server Security

| Item | Action |
|------|--------|
| **Firewall** | Allow only 80, 443. Block direct access to 3000 from the internet. |
| **Windows updates** | Enable automatic updates. |
| **Antivirus** | Add exclusions for the project folder if needed. |
| **Remote Desktop** | Disable or restrict to VPN. |
| **File permissions** | Restrict access to `.env` and uploads; app user only. |

### 9.3 IIS Security

| Item | Action |
|------|--------|
| **Headers** | Add security headers (X-Content-Type-Options, X-Frame-Options, etc.). |
| **Directory browsing** | Disabled. |
| **Default site** | Remove or disable if unused. |

### 9.4 Database Security (HeidiSQL)

- Use strong passwords for DB users.
- Grant only needed privileges (`SELECT`, `INSERT`, `UPDATE`, `DELETE` on `ligs_website`).
- Do not expose MySQL port (3306) to the internet.
- Regular backups: use HeidiSQL → Tools → Export, or schedule mysqldump.

---

## 10. Scheduled Tasks (Archive Cron)

To run the archive job daily:

1. **Task Scheduler** → Create Basic Task.
2. Trigger: Daily, e.g. 2:00 AM.
3. Action: Start a program.
4. Program: `curl.exe` (or `Invoke-WebRequest` via PowerShell).
5. Arguments:
   ```cmd
   -X GET "https://ligs.gov.my/api/cron/archive" -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

Set `CRON_SECRET` in `.env` and use the same value in the task.

---

## 11. Post-Deployment Checklist

1. Visit `https://your-domain/` — homepage loads.
2. Visit `https://your-domain/admin` — login with `admin@ligs.com` / `admin123`, then change password.
3. Confirm uploads: add image in admin; verify it appears and files exist in `public/uploads`.
4. Run migration: `npx prisma migrate deploy` — should report "Already up to date".
5. Verify DB in HeidiSQL: tables from `prisma/schema.prisma` exist.

---

## 12. Troubleshooting

| Issue | Possible Fix |
|-------|---------------|
| 502 Bad Gateway | Ensure Node app is running (PM2/NSSM). Check logs. |
| Database connection failed | Verify `DATABASE_URL`, DB running, user privileges in HeidiSQL. |
| Migrations fail | Run `npx prisma migrate deploy`; check DB user has rights. |
| Upload fails | Check `public/uploads` and subfolders exist; ensure write permissions. |
| Admin login fails | Confirm `NEXTAUTH_URL` matches site URL (including `https://`). |
| Cron returns 401 | Ensure `CRON_SECRET` is set and matches the request header. |

---

## 13. Files Reference

| File | Purpose |
|------|---------|
| `package.json` | `build`, `start` scripts; dependencies |
| `prisma/schema.prisma` | Database schema (MySQL) |
| `.env.example` | Template for environment variables |
| `next.config.mjs` | Next.js config (images unoptimized, etc.) |
| `web.config` | IIS URL Rewrite rules for reverse proxy |
