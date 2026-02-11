# 🚀 Quick Start Guide - Docker Deployment

## For Kamatera Deployment

### Prerequisites
- Docker and Docker Compose installed on Kamatera server
- Your repository pushed to Git

### Step-by-Step Deployment

#### 1. On Your Kamatera Server

```bash
# Install Docker (if not installed)
curl -fsSL https://get.docker.com | sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repository
git clone YOUR_REPO_URL
cd apocalipse_pesqueiro_websocket
```

#### 2. Configure Environment

```bash
# Copy example env file
cp .env.production .env

# Edit with your values
nano .env
```

Update these values in `.env`:
```env
DB_PASSWORD=your_strong_password
NEXT_PUBLIC_SOCKET_URL=http://YOUR_SERVER_IP:3001
```

#### 3. Deploy

```bash
# Build and start all services
docker-compose up -d

# Check if everything is running
docker-compose ps

# View logs
docker-compose logs -f
```

#### 4. Verify

Visit in your browser:
- Frontend: `http://YOUR_SERVER_IP:3000`
- Health check: `http://YOUR_SERVER_IP:3000/api/health`

### Common Commands

```bash
# View logs
docker-compose logs -f app

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update application
git pull && docker-compose up -d --build

# Backup database
docker-compose exec postgres pg_dump -U postgres apocalipse_pesqueiro > backup.sql
```

### Troubleshooting

If services don't start:
```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

---

## 📖 Full Documentation

- **Comprehensive Docker Guide**: See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **General Kamatera Info**: See [KAMATERA_DEPLOYMENT.md](KAMATERA_DEPLOYMENT.md)
- **Fix Dropbox Build Issues**: See [DROPBOX_BUILD_FIX.md](DROPBOX_BUILD_FIX.md)

---

## ✅ What's Included

- ✅ `docker-compose.yml` - Full stack orchestration
- ✅ `Dockerfile` - Optimized multi-stage build
- ✅ `docker-entrypoint.sh` - Startup script
- ✅ `.dockerignore` - Build optimization
- ✅ `.env.production` - Environment template
- ✅ Health check endpoint at `/api/health`
- ✅ PostgreSQL with automatic initialization
- ✅ Persistent data volumes
- ✅ Automatic restart on failure

---

## 🔐 Security Checklist

- [ ] Change default database password
- [ ] Update NEXT_PUBLIC_SOCKET_URL with your domain/IP
- [ ] Configure firewall (ports 22, 80, 443, 3000, 3001)
- [ ] Set up SSL certificate (for production)
- [ ] Enable automatic backups
