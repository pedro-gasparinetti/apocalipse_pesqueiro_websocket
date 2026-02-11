# 🐳 Docker Deployment Guide for Kamatera

## Quick Start

### 1. Update Environment Variables

Edit `.env.production` with your settings:
```bash
DB_PASSWORD=your_strong_password_here
NEXT_PUBLIC_SOCKET_URL=http://your-server-ip:3001
```

### 2. Deploy to Kamatera

```bash
# SSH into your Kamatera server
ssh root@your-server-ip

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repository
git clone your-repo-url
cd apocalipse_pesqueiro_websocket

# Copy environment file
cp .env.production .env

# Edit .env with your actual values
nano .env

# Start the application
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 3. Verify Deployment

```bash
# Check if containers are running
docker-compose ps

# Check application logs
docker-compose logs app

# Check database logs
docker-compose logs postgres

# Test the application
curl http://localhost:3000
```

---

## 📋 Management Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Stop and remove volumes (⚠️ deletes database!)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 app
```

### Database Management

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d apocalipse_pesqueiro

# Backup database
docker-compose exec postgres pg_dump -U postgres apocalipse_pesqueiro > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres -d apocalipse_pesqueiro < backup.sql

# Check database size
docker-compose exec postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('apocalipse_pesqueiro'));"
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Or step by step:
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔥 Troubleshooting

### Container won't start

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs app

# Check Docker system
docker system df
docker system prune -a  # Clean up unused resources
```

### Database connection issues

```bash
# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready

# Check database connections
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Restart database
docker-compose restart postgres
```

### Port conflicts

```bash
# Check what's using ports 3000 or 3001
sudo netstat -tlnp | grep -E '3000|3001|5432'

# Kill processes using the ports
sudo kill -9 $(sudo lsof -t -i:3000)
sudo kill -9 $(sudo lsof -t -i:3001)
```

### Out of disk space

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

---

## 🔐 Production Best Practices

### 1. Use Strong Passwords

Generate strong passwords:
```bash
openssl rand -base64 32
```

### 2. Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Next.js
sudo ufw allow 3001  # Socket.IO
sudo ufw enable
```

### 3. Set Up SSL with Let's Encrypt

First, install nginx reverse proxy:
```bash
# Uncomment nginx service in docker-compose.yml
# Then create nginx.conf (see below)
```

Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream nextjs {
        server app:3000;
    }

    upstream socketio {
        server app:3001;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /socket.io/ {
            proxy_pass http://socketio;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### 4. Auto-Start on Boot

```bash
# Create systemd service
sudo nano /etc/systemd/system/apocalipse.service
```

Add:
```ini
[Unit]
Description=Apocalipse Pesqueiro Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/apocalipse_pesqueiro_websocket
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable apocalipse
sudo systemctl start apocalipse
```

### 5. Regular Backups

Create backup script `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backups/apocalipse"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U postgres apocalipse_pesqueiro | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

Add to crontab:
```bash
crontab -e
# Add line:
0 2 * * * /path/to/backup.sh
```

---

## 📊 Monitoring

### Basic Monitoring

```bash
# Container stats
docker stats

# Check memory usage
docker-compose exec app free -h

# Check disk usage
docker system df
```

### Advanced Monitoring (Optional)

Add to `docker-compose.yml`:
```yaml
  # Prometheus monitoring
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - apocalipse_network

  # Grafana dashboards
  grafana:
    image: grafana/grafana
    ports:
      - "3333:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - apocalipse_network
```

---

## 🚀 Performance Tuning

### Database Optimization

Add to docker-compose.yml under postgres environment:
```yaml
POSTGRES_SHARED_BUFFERS: 256MB
POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
POSTGRES_MAINTENANCE_WORK_MEM: 64MB
POSTGRES_MAX_CONNECTIONS: 100
```

### Application Scaling

Scale to multiple instances:
```bash
docker-compose up -d --scale app=3
```

(Requires load balancer like nginx)

---

## ✅ Deployment Checklist

- [ ] Git repository cloned
- [ ] Docker and Docker Compose installed
- [ ] `.env` file configured with production values
- [ ] Strong database password set
- [ ] Firewall configured
- [ ] Application started: `docker-compose up -d`
- [ ] Database initialized: check logs
- [ ] Application accessible on port 3000
- [ ] Socket.IO working on port 3001
- [ ] Auto-start configured (systemd)
- [ ] Backup script created and scheduled
- [ ] SSL certificate configured (if using domain)
- [ ] Monitoring set up

---

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Test database connection: `docker-compose exec postgres psql -U postgres -d apocalipse_pesqueiro`
4. Restart services: `docker-compose restart`
5. Rebuild from scratch: `docker-compose down -v && docker-compose up -d --build`
