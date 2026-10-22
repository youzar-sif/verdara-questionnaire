# Verdara Intelligence — Discovery Questionnaire

A polished, mobile-friendly questionnaire for **Verdara Home**, built to feed the **Verdara Intelligence** management system blueprint.

It takes 10–15 minutes to complete, saves answers as people type, and stores every submission on the server. A private dashboard at `/admin` shows the responses and exports them to CSV.

No build step. No npm dependencies. Node 18+.

---

## Run it locally

```bash
cd Questions
npm start
```

Open:

- **Questionnaire:** http://localhost:3000
- **Responses dashboard:** http://localhost:3000/admin

Default admin password: `verdara-admin`

Set your own before sharing the link:

**Windows (PowerShell):**

```powershell
$env:ADMIN_PASSWORD="choose-a-strong-password"; npm start
```

**Windows (cmd):**

```cmd
set ADMIN_PASSWORD=choose-a-strong-password && npm start
```

**macOS / Linux:**

```bash
ADMIN_PASSWORD="choose-a-strong-password" npm start
```

---

## How responses are stored

Each submission is written to `data/submissions/` as a timestamped JSON file. Nothing is sent to a third party when you use the built-in server.

The dashboard can:

- Read every response with all questions and answers
- Search by name, role or answer content
- Show totals, this week's responses, the most common first priority, and average completion time
- Delete a response
- Export everything to CSV (Excel-ready, UTF-8 BOM)

Back up the `data/` folder regularly. It is excluded from Git by `.gitignore`.

---

## Share a link

### Option A — Host it (recommended)

The app is a single Node process, so it runs on any small host.

**Render (one-click, uses `render.yaml`)**

1. Push this folder to a GitHub repository.
2. Render → **New → Blueprint** → connect the repo. Render reads `render.yaml`
   and configures the runtime, start command and environment variables automatically.
3. When prompted, enter `ADMIN_PASSWORD` and click **Apply**.
4. Deploy, then share the generated URL.

> **Free tier warning:** Render does not allow persistent disks on free services, so
> submissions live on the container's temporary filesystem. They survive idle
> spin-downs but are **lost on every redeploy or restart** — export your CSV from
> `/admin` before pushing a new commit. For permanent storage, upgrade to a paid
> instance and add a disk mounted at `/var/data` with `DATA_DIR=/var/data`.

**Render (manual)**

1. Push this folder to a GitHub repository.
2. Render → **New → Web Service** → connect the repo.
3. Build command: leave empty (there are no dependencies).
4. Start command: `node server.js`.
5. Environment variables:
   - `ADMIN_PASSWORD` = a strong password
   - `DATA_DIR` = `/var/data` *(only needed when a disk is mounted)*
6. On a paid instance, add a **persistent disk** mounted at `/var/data` so responses
   survive restarts and deploys.
7. Deploy, then share the generated URL.

> Render's free instance spins down after 15 minutes idle; the first visit after
> that takes about 30 seconds to wake. If you need durable storage for free, keep
> your own machine running and use the tunnel below instead.

**Railway**

1. Deploy the repo.
2. Add a volume mounted at `/data`.
3. Set `ADMIN_PASSWORD` and `DATA_DIR=/data`.
4. Generate a public domain.

**Fly.io / VPS**

Run `node server.js` behind HTTPS (Caddy, Nginx, or the platform's proxy). Set `ADMIN_PASSWORD` and `DATA_DIR` to a persistent volume.

### Option B — Share temporarily from your computer

While `npm start` is running:

```bash
npx localtunnel --port 3000
```

Or use a Cloudflare Tunnel. Share the public URL it prints. The admin dashboard stays password-protected; the questionnaire itself is public.

### Option C — Static hosting only

You can host `public/` on Netlify, Vercel, or GitHub Pages. In that case submissions need an external form endpoint:

1. Create a form at [Formspree](https://formspree.io) (or Web3Forms).
2. Open `public/config.js` and set:

```js
window.VERDARA_CONFIG = {
  endpoint: 'https://formspree.io/f/your-form-id',
  contactEmail: 'you@example.com'
};
```

The front end will post there instead of `/api/submit`. Note that the built-in `/admin` dashboard requires the Node server — with static hosting you read responses in the form service's dashboard.

If a submission ever fails, the respondent sees a fallback screen and can download their answers as JSON, so nothing is lost.

---

## Customising

| What | Where |
| --- | --- |
| Questions, wording, sections | `public/index.html` |
| Colours, typography, layout | `public/styles.css` |
| Behaviour, validation, review screen | `public/app.js` |
| Admin dashboard | `public/admin.html`, `public/admin.css`, `public/admin.js` |
| Submission storage, auth, CSV columns | `server.js` |
| Endpoint / contact fallback | `public/config.js` |

After editing question text, also update the labels in `SECTIONS` inside `public/admin.js` so the dashboard matches.

### Change the admin password

Set the `ADMIN_PASSWORD` environment variable. The server warns at startup if it is still using the default.

### Change the port

```bash
PORT=8080 npm start
```

---

## Security notes

- `/admin` and all admin APIs use HTTP Basic Auth. Always serve over HTTPS when public.
- Submission endpoint is rate-limited (15 per hour per IP) and has a hidden honeypot field.
- Input is length-limited and cleaned; API responses render with HTML escaping.
- Security headers include a strict CSP, `X-Frame-Options: DENY`, and `nosniff`.
- No IP addresses are stored with responses.
- The questionnaire collects names and business information — share the link only with the intended recipients.

---

## Project structure

```
Questions/
├─ server.js              Zero-dependency Node server + JSON/CSV API
├─ package.json
├─ data/                  Created automatically; stores submissions
│  └─ submissions/
├─ public/
│  ├─ index.html          Questionnaire (intro, 5 sections, review, success)
│  ├─ styles.css          Design system and all styling
│  ├─ app.js              Autosave, navigation, ranking, review, submit
│  ├─ config.js           Optional external form endpoint
│  ├─ admin.html          Private responses dashboard
│  ├─ admin.css
│  ├─ admin.js
│  └─ favicon.svg
└─ README.md
```

---

*Verdara Intelligence · Discovery questionnaire · October 2026*
