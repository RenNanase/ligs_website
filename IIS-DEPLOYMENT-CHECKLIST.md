# IIS Deployment Checklist — Windows Server 2016

Use this checklist to get the LIGS website online with IIS + ARR + PM2.

---

## Prerequisites (Install First)

- [ ] **Node.js** 20.x or 22.x LTS
- [ ] **MySQL** 8.x (running, database `ligs_website` created)
- [ ] **IIS** with **URL Rewrite** and **Application Request Routing (ARR)**

---

## Step 1: ARR Server Variables (Critical)

ARR does not allow custom server variables by default. You must add them:

1. Open **IIS Manager** → select the **server name** (not the site)
2. Double-click **Application Request Routing Cache**
3. In the right panel, click **Server Proxy Settings**
4. Check **Enable proxy**
5. Click **Apply**

6. Open this file in Notepad **as Administrator**:
   ```
   C:\Windows\System32\inetsrv\config\applicationHost.config
   ```

7. Find the `<rewrite>` section and look for `<allowedServerVariables>`. If empty or missing, add:

   ```xml
   <rewrite>
     <allowedServerVariables>
       <add name="HTTP_X_FORWARDED_PROTO" />
       <add name="HTTP_X_FORWARDED_HOST" />
     </allowedServerVariables>
   </rewrite>
   ```

   If `allowedServerVariables` already exists, add the two `<add name="..."/>` lines inside it.

8. Save and restart IIS:
   ```powershell
   iisreset
   ```

---

## Step 2: Project Location and Permissions

- [ ] Project path: `C:\inetpub\wwwroot\ligs_website`
- [ ] Ensure `.env` exists in project root with correct `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

**NEXTAUTH_URL** must match how users access the site:
- If via `http://yourserver/` → `NEXTAUTH_URL="http://yourserver"`
- If via `https://ligs.gov.my` → `NEXTAUTH_URL="https://ligs.gov.my"`

---

## Step 3: Build the App

```powershell
cd C:\inetpub\wwwroot\ligs_website
npm install
npm run build
```

Ensure MySQL is running so the build can connect (or build will use empty fallback data).

---

## Step 4: Run Node.js with PM2

```powershell
cd C:\inetpub\wwwroot\ligs_website
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Verify the app is running:
```powershell
pm2 list
pm2 logs ligs_website
```

Test directly: open `http://localhost:3000` in a browser. If it works, Node.js is fine.

---

## Step 5: IIS Site Configuration

1. **IIS Manager** → Sites → Add Website (or use Default Web Site)
2. **Site name:** ligs_website
3. **Physical path:** `C:\inetpub\wwwroot\ligs_website`
4. **Binding:** Port 80 (or 443 for HTTPS), host name if needed

5. Ensure **web.config** exists in `C:\inetpub\wwwroot\ligs_website` (it should already be there).

---

## Step 6: HTTP_X_FORWARDED_PROTO (if using HTTPS)

If your site is accessed via **HTTP only** (port 80), change `web.config` so it does not force HTTPS:

Find this in web.config:
```xml
<set name="HTTP_X_FORWARDED_PROTO" value="HTTPS" />
```

- For **HTTP only**: change to `value="HTTP"`
- For **HTTPS**: keep `value="HTTPS"`

---

## Step 7: Test

1. Open `http://yourserver` or `http://localhost` in a browser
2. You should see the LIGS website
3. If you get **502 Bad Gateway** or **503**: Node.js is not running or not on port 3000. Run `pm2 list` and `pm2 restart ligs_website`
4. If you get **blank page**: Check browser console and `pm2 logs ligs_website`

---

## Troubleshooting

| Problem | Check |
|---------|--------|
| 502 Bad Gateway | PM2 running? `pm2 list`. Node on port 3000? `netstat -an | findstr 3000` |
| 503 Service Unavailable | IIS → Site → Application Pool: ensure it's Started |
| Blank page / errors | `pm2 logs ligs_website` for Node errors; check DATABASE_URL and MySQL |
| ARR server variable error | Add `HTTP_X_FORWARDED_PROTO` and `HTTP_X_FORWARDED_HOST` to `allowedServerVariables` |
| Wrong cwd in PM2 | `ecosystem.config.js` uses `cwd: __dirname` (project root) |
| NEXTAUTH redirect issues | Set `NEXTAUTH_URL` to the exact URL users use to access the site |

---

## Quick Reference

| Item | Value |
|------|-------|
| Node app port | 3000 |
| PM2 app name | ligs_website |
| Project path | C:\inetpub\wwwroot\ligs_website |
| web.config | Proxies all requests to http://localhost:3000 |
