# 🚛 Unigroup Transporters Ltd – Website

Full-stack website with Node.js/Express backend, SQLite database, and Nodemailer email notifications.

---

## Project Structure

```
unigroup/
├── server.js           # Express entry point
├── package.json
├── .env.example        # ← copy to .env and fill in
├── routes/
│   └── api.js          # POST /api/enquiry, GET /api/admin/enquiries
├── middleware/
│   └── mailer.js       # Nodemailer email templates
├── db/
│   └── index.js        # SQLite schema + prepared statements
├── data/               # Auto-created – holds unigroup.db
└── public/             # Static frontend
    ├── index.html
    ├── css/style.css
    └── js/main.js
```

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# → Edit .env with your SMTP credentials and domain

# 3. Run in development
npm run dev

# 4. Open in browser
open http://localhost:3000
```

---

## Environment Variables (.env)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | `production` or `development` |
| `SMTP_HOST` | SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (usually `587`) |
| `SMTP_SECURE` | `true` for port 465, `false` for 587 |
| `SMTP_USER` | Your email address |
| `SMTP_PASS` | App password (Gmail: generate in Account > Security) |
| `EMAIL_FROM` | Sender address shown in emails |
| `EMAIL_TO` | Where enquiry notifications are sent |
| `COMPANY_NAME` | Displayed in email templates |
| `COMPANY_PHONE` | Shown in confirmation email |
| `CORS_ORIGIN` | Your live domain (e.g. `https://unigrouptransporters.co.ke`) |
| `ADMIN_TOKEN` | Secret token for the admin API |
| `RATE_LIMIT_MAX` | Max form submissions per 15 min per IP (default: 10) |

### Gmail setup
1. Go to your Google Account → Security → 2-Step Verification (enable it)
2. Search "App passwords" → Create one for "Mail"
3. Use that 16-character password as `SMTP_PASS`

---

## Deploy to Render (Free tier)

1. Push your project to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node version:** 18+
5. Add all `.env` variables under **Environment**
6. Click **Deploy**

Render gives you a free `.onrender.com` subdomain instantly.

---

## Deploy to Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
# Set env vars in Railway dashboard → Variables
```

---

## Deploy to a VPS (Ubuntu/Debian)

```bash
# Install Node
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Clone and install
git clone <your-repo> /var/www/unigroup
cd /var/www/unigroup
npm install --production
cp .env.example .env && nano .env   # Fill in your values

# Run with PM2 (process manager)
sudo npm install -g pm2
pm2 start server.js --name unigroup
pm2 save
pm2 startup

# Nginx reverse proxy (optional but recommended)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/unigroup
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.co.ke www.yourdomain.co.ke;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/unigroup /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.co.ke -d www.yourdomain.co.ke
```

---

## API Endpoints

### POST `/api/enquiry`
Submit a contact form enquiry.

**Body (JSON):**
```json
{
  "name": "John Kamau",
  "company": "Acme Ltd",
  "phone": "+254 712 345 678",
  "email": "john@acme.co.ke",
  "service": "Road Freight & Haulage",
  "message": "I need to ship 5 tonnes from Nairobi to Mombasa."
}
```
**Response:** `{ "ok": true, "id": 1 }`

---

### GET `/api/admin/enquiries`
List all enquiries (requires `x-admin-token` header).

```bash
curl -H "x-admin-token: YOUR_ADMIN_TOKEN" https://yourdomain.co.ke/api/admin/enquiries
```

---

### PATCH `/api/admin/enquiries/:id`
Update enquiry status.

```bash
curl -X PATCH \
  -H "x-admin-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"resolved"}' \
  https://yourdomain.co.ke/api/admin/enquiries/1
```

Status values: `new` · `in-progress` · `resolved`

---

### GET `/api/health`
Health check. Returns `{ "ok": true, "ts": "..." }`

---

## Customise

- **Company details:** Update phone, email, address in `public/index.html`
- **Logo:** Replace the inline SVG in `index.html` with an `<img>` tag pointing to your logo file
- **Colors:** Change `--crimson` in `public/css/style.css`
- **Services:** Edit the service cards in the Services section of `index.html`

---

## License
Proprietary – Unigroup Transporters Limited
