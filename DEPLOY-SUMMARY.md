# LIGS Website — IIS Deployment Summary

Quick reference for deploying to Windows Server with IIS.

---

## 1. Server Prerequisites

| Item | What |
|------|------|
| **Node.js** | 20.x or 22.x LTS |
| **MySQL** | 8.x, database `ligs_website` |
| **IIS** | URL Rewrite + ARR (Application Request Routing) |

---

## 2. ARR Setup (Required)

1. IIS Manager → Server → **Application Request Routing Cache** → Server Proxy Settings → **Enable proxy**
2. Edit `C:\Windows\System32\inetsrv\config\applicationHost.config` (as Administrator)
3. Inside `<system.webServer><rewrite>`, add or update:
   ```xml
   <allowedServerVariables>
     <add name="HTTP_X_FORWARDED_PROTO" />
     <add name="HTTP_X_FORWARDED_HOST" />
   </allowedServerVariables>
   ```
4. Run: `iisreset`

---

## 3. Project Setup

**Path:** `C:\inetpub\wwwroot\ligs_website`

**Files needed in project root:**
- `web.config` — reverse proxy to Node (already in project)
- `.env` — environment variables
- `ecosystem.config.js` — PM2 config

---

## 4. .env

```env
DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/ligs_website"
NEXTAUTH_URL="https://w2.ligs.gov.my"
NEXTAUTH_SECRET="<random-32-byte-base64>"
```

- **NEXTAUTH_URL**: Use the public URL (http or https) users access
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32` or PowerShell:
  `[Convert]::ToBase64String((1..32|%{Get-Random -Max 256})-as[byte[]])`

---

## 5. Build & Run

```powershell
cd C:\inetpub\wwwroot\ligs_website
npm install
npm run build
npx prisma db push
npx prisma db seed
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```

---

## 6. IIS Site

- **Physical path:** `C:\inetpub\wwwroot\ligs_website`
- **Binding:** Host name `w2.ligs.gov.my`, port 80 (and 443 if HTTPS)
- **web.config** must be in that folder (proxies to `http://localhost:3000`)

---

## 7. HTTPS

If using HTTPS, keep `HTTP_X_FORWARDED_PROTO` as `HTTPS` in web.config (already set).

If HTTP only, change to `value="HTTP"`.

---

## 8. PM2 Auto-Start (Windows)

`pm2 startup` does not work on Windows. Options:

**A) Task Scheduler** — Create a task that runs at logon:
- Program: `pm2`
- Arguments: `resurrect`
- Start in: `C:\inetpub\wwwroot\ligs_website`
- Trigger: At log on

**B) pm2-windows-startup** (optional):
```powershell
npm install -g pm2-windows-startup
pm2-windows-startup install
```

---

## 9. After Server Reboot

```powershell
cd C:\inetpub\wwwroot\ligs_website
pm2 resurrect
```

Or restart manually: `pm2 start ecosystem.config.js`

---

## 10. Deploy Updates

```powershell
cd C:\inetpub\wwwroot\ligs_website
# Pull/copy new code
npm install
npm run build
npx prisma db push   # if schema changed
pm2 restart ligs_website
pm2 save
```

---

## Checklist

- [ ] Node.js, MySQL, IIS (ARR + URL Rewrite)
- [ ] ARR proxy enabled + allowedServerVariables
- [ ] Project at `C:\inetpub\wwwroot\ligs_website`
- [ ] .env with DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
- [ ] npm install + npm run build
- [ ] prisma db push + prisma db seed
- [ ] pm2 start ecosystem.config.js
- [ ] IIS site bound to w2.ligs.gov.my, path = project root
- [ ] Test: https://w2.ligs.gov.my
