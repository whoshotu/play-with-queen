# Deployment Guide

This guide covers deploying the Interactive Content Creator Platform to free-tier infrastructure: **AlterVista** (frontend) and **Oracle Cloud** (signaling server).

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Frontend Deployment (AlterVista)](#frontend-deployment-altervista)
- [Backend Deployment (Oracle Cloud)](#backend-deployment-oracle-cloud)
- [Troubleshooting](#troubleshooting)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

### Required Accounts
- [AlterVista account](https://www.altervista.org/) (free)
- [Oracle Cloud account](https://www.oracle.com/cloud/free/) (free tier)
- GitHub account (optional, for version control)

### Required Tools
- Node.js 18+ (for local development)
- Git (for version control)
- FTP client (FileZilla, Cyberduck, etc.)
- SSH client (optional, for Oracle Cloud)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd "Interactive content creator website-Page not found error causes"
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Create Environment Variables

Create `.env.local` for local development:

```bash
# Signaling server URL (for local dev)
VITE_SIGNALING_URL=http://localhost:3001

# Room ID (optional)
VITE_ROOM_ID=default-room

# Enable/disable features
VITE_ENABLE_WEBCRTC=true
VITE_ENABLE_DICE=true
VITE_ENABLE_TRUTH_OR_DARE=false
```

**⚠️ IMPORTANT:** Do NOT commit `.env.local` to git!

---

## Frontend Deployment (AlterVista)

### Step 1: Create AlterVista Account

1. Go to [altervista.org](https://www.altervista.org/)
2. Click "Register" and create a free account
3. Choose a subdomain (e.g., `your-name.altervista.org`)
4. Verify your email address

### Step 2: Build for Production

```bash
npm run build
```

This creates an optimized `dist/` folder with:
- `index.html` - Entry point
- `assets/` - JavaScript, CSS, images
- `generated/` - Theme and font CSS

### Step 3: Configure Environment for Production

Create `.env.production`:

```bash
# Replace with your Oracle Cloud signaling server URL
VITE_SIGNALING_URL=https://your-signaling-server.oraclecloudapps.com

# Or use HTTP if no SSL certificate
# VITE_SIGNALING_URL=http://your-ip:3001

VITE_ROOM_ID=default-room
```

### Step 4: Deploy via FTP

1. Open your FTP client (FileZilla, Cyberduck, etc.)
2. Connect to AlterVista:
   - **Host:** `ftp.altervista.org`
   - **Username:** Your AlterVista username
   - **Password:** Your AlterVista password
   - **Port:** 21
3. Navigate to `public_html/` folder
4. Upload all contents of `dist/` to `public_html/`:
   ```
   dist/
   ├── index.html          →  public_html/index.html
   ├── assets/             →  public_html/assets/
   │   ├── index-xxx.js
   │   └── index-xxx.css
   └── generated/         →  public_html/generated/
       ├── font.css
       └── theme.css
   ```

### Step 5: Verify Deployment

1. Open your browser
2. Go to `https://your-name.altervista.org`
3. Check that the app loads correctly
4. Open browser DevTools (F12)
5. Check Console for errors
6. Check Network tab for failed requests

### Common AlterVista Issues

**Issue:** 404 Not Found
- **Solution:** Ensure `index.html` is in `public_html/`, not a subdirectory

**Issue:** Mixed Content Error
- **Solution:** Use HTTPS for signaling server or upgrade to AlterVista Premium

**Issue:** Slow loading
- **Solution:** Enable compression in AlterVista control panel (if available)

---

## Backend Deployment (Oracle Cloud)

### Step 1: Create Oracle Cloud Free Tier Account

1. Go to [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Sign up for free tier (requires credit card for verification)
3. Choose your home region (closest to your users)
4. Complete verification

### Step 2: Create Compute Instance

1. Log in to Oracle Cloud Console
2. Navigate to **Compute** → **Instances**
3. Click **Create Instance**
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `signaling-server` |
| Availability Domain | Default |
| Shape | `VM.Standard.E2.1.Micro` (Free Tier) |
| Image | `Oracle Linux` or `Ubuntu` |
| SSH Key | Upload your public key |

5. Click **Create**
6. Wait for instance to be running (2-5 minutes)

### Step 3: Configure Firewall

1. Select your instance
2. Click **Virtual Cloud Network**
3. Click **Security Lists**
4. Add Ingress Rules:

| Rule | Source | Destination | Protocol | Port |
|------|--------|-------------|-----------|------|
| SSH | 0.0.0.0/0 | Your instance | TCP | 22 |
| HTTP | 0.0.0.0/0 | Your instance | TCP | 80 |
| HTTPS | 0.0.0.0/0 | Your instance | TCP | 443 |
| Signaling | 0.0.0.0/0 | Your instance | TCP | 3001 |

### Step 4: Connect via SSH

```bash
ssh -i /path/to/your-key.pem ubuntu@<your-public-ip>
```

Or on Windows (PowerShell):
```powershell
ssh -i "C:\path\to\your-key.pem" ubuntu@<your-public-ip>
```

### Step 5: Install Node.js

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 6: Deploy Signaling Server

#### Option A: Clone Repository (Recommended)

```bash
# Clone your repository
cd ~
git clone <your-repo-url>
cd "Interactive content creator website-Page not found error causes/server"

# Install dependencies
npm install

# Test locally
npm start
```

#### Option B: Manual Upload

1. Upload `server/` folder contents via SCP:
```bash
scp -i /path/to/key.pem -r server/ ubuntu@<your-ip>:~/signaling-server
```

2. SSH into server and install:
```bash
cd ~/signaling-server
npm install
```

### Step 7: Install PM2 (Process Manager)

PM2 keeps the server running after SSH disconnect:

```bash
sudo npm install -g pm2

# Start server
pm2 start signaling-server.js --name "signaling-server"

# Configure to start on boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs signaling-server
```

### Step 8: Configure Environment Variables (Optional)

If using environment variables for the signaling server:

```bash
# Create .env file in server directory
cd ~/signaling-server
nano .env
```

Add:
```bash
PORT=3001
NODE_ENV=production
```

Update `signaling-server.js` to use these:
```javascript
const PORT = process.env.PORT || 3001;
```

### Step 9: Verify Server Health

```bash
# From your local machine
curl http://<your-public-ip>:3001/health

# Should return:
# {"status":"healthy"}
```

### Step 10: (Optional) Setup Domain with HTTPS

#### Using Cloudflare (Free)

1. Go to [Cloudflare](https://cloudflare.com) (free account)
2. Add your domain (or subdomain)
3. Point to Oracle Cloud IP (A record)
4. Enable "Proxied" (orange cloud icon)
5. Enable SSL/TLS → "Full" mode
6. Create a Page Rule:
   - URL: `your-domain.com/ws/*`
   - Setting: Disable SSL verification

**⚠️ CRITICAL:** WebSockets don't work well with Cloudflare proxy. Disable proxy for WebSocket path.

#### Using Let's Encrypt (Manual)

```bash
# Install Certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificate location:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

Update `server/signaling-server.js`:
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/your-domain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/your-domain.com/fullchain.pem')
};

const httpServer = https.createServer(options, app);
```

---

## Troubleshooting

### Frontend Issues

**Issue:** White screen on load
- **Check:** Browser Console (F12) for JavaScript errors
- **Fix:** Check all assets uploaded correctly
- **Fix:** Verify `VITE_SIGNALING_URL` is correct

**Issue:** WebRTC connection fails
- **Check:** Browser Console for Mixed Content errors
- **Fix:** Use HTTPS signaling server
- **Fix:** Check firewall rules

**Issue:** App loads but features don't work
- **Check:** Network tab for failed API calls
- **Fix:** Verify signaling server is running
- **Fix:** Check CORS settings

### Backend Issues

**Issue:** Cannot SSH to server
- **Check:** Security list allows port 22
- **Check:** SSH key is correct
- **Fix:** Reset SSH key in Oracle Cloud Console

**Issue:** Server won't start
- **Check:** PM2 logs: `pm2 logs signaling-server`
- **Check:** Port 3001 is not in use: `sudo lsof -i :3001`
- **Fix:** Kill process using port 3001

**Issue:** Health check fails
- **Check:** Firewall allows port 3001
- **Check:** PM2 process is running
- **Fix:** Restart PM2: `pm2 restart signaling-server`

**Issue:** WebSockets blocked
- **Check:** If using Cloudflare, disable proxy for `/ws/*`
- **Check:** Firewall allows WebSocket upgrades
- **Fix:** Use HTTP polling fallback

---

## Post-Deployment Checklist

### Frontend
- [ ] App loads correctly in browser
- [ ] No console errors
- [ ] All pages accessible
- [ ] Responsive on mobile
- [ ] WebRTC connects to signaling server
- [ ] Dice game works
- [ ] Chat works
- [ ] Video calling works

### Backend
- [ ] Signaling server running
- [ ] Health check returns success
- [ ] PM2 configured to auto-start
- [ ] Firewall rules configured
- [ ] Logs show no errors
- [ ] Multiple users can connect
- [ ] WebRTC signaling works
- [ ] Chat messages relay correctly

### Monitoring

#### Frontend Monitoring
- Check error tracking (if implemented)
- Monitor console errors
- Track performance

#### Backend Monitoring
```bash
# Check server status
pm2 status

# View logs
pm2 logs signaling-server

# Monitor in real-time
pm2 monit
```

---

## Updates & Maintenance

### Frontend Updates

```bash
# Make changes locally
git pull
npm install

# Build for production
npm run build

# Upload dist/ to AlterVista via FTP
```

### Backend Updates

```bash
# SSH into Oracle Cloud
ssh ubuntu@<your-ip>

# Navigate to server directory
cd ~/signaling-server

# Pull latest code
git pull

# Install dependencies
npm install

# Restart PM2
pm2 restart signaling-server
```

---

## Security Best Practices

### Frontend
- ✅ Use HTTPS
- ✅ Validate all user inputs
- ✅ Don't expose sensitive data
- ✅ Enable CSP headers (if possible)

### Backend
- ✅ Use firewall rules
- ✅ Keep Node.js updated
- ✅ Monitor logs for suspicious activity
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting (future)

---

## Cost Estimation

| Service | Plan | Monthly Cost |
|----------|-------|--------------|
| AlterVista | Free | $0 |
| Oracle Cloud Compute | Always Free | $0 |
| Oracle Cloud Bandwidth | 10TB/month free | $0 |
| Cloudflare (optional) | Free | $0 |
| **Total** | | **$0/month** |

---

## Support

### Documentation
- [Vite Deployment Guide](https://vitejs.dev/guide/build.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Socket.IO Documentation](https://socket.io/docs/)

### Community
- Check [ISSUE_TRACKING.md](ISSUE_TRACKING.md) for known issues
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions
- Follow [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards

---

## Version History

| Date | Version | Changes |
|------|--------|---------|
| 2026-01-30 | 1.0.0 | Initial deployment guide |

---

*This guide should be updated when deployment processes change.*
