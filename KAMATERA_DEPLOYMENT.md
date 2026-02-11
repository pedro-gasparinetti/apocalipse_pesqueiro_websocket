# 🚀 Kamatera Deployment Guide

## PostgreSQL on Kamatera - Yes, It Will Work!

**Short answer:** Yes, PostgreSQL will work perfectly on Kamatera without Docker!

### ✅ PostgreSQL Without Docker

You can install PostgreSQL directly on your Kamatera server:

```bash
# For Ubuntu/Debian on Kamatera
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 🐳 Do You Need Docker?

**No, Docker is NOT required**, but it offers benefits:

#### Without Docker (Direct Install)
**Pros:**
- Simpler setup
- Less overhead
- Direct system access

**Cons:**
- Manual configuration
- OS-dependent
- Harder to replicate

#### With Docker (Recommended for Production)
**Pros:**
- Consistent environment
- Easy to move/replicate
- Isolated from system
- Easy backup/restore

**Cons:**
- Requires Docker knowledge
- Slight performance overhead

---

## 📋 Deployment Steps for Kamatera

### Option 1: Without Docker (Simpler)

#### 1. Install PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### 2. Configure PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE apocalipse_pesqueiro;
CREATE USER your_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE apocalipse_pesqueiro TO your_user;
\q
```

#### 3. Allow Remote Connections
Edit `/etc/postgresql/14/main/postgresql.conf`:
```conf
listen_addresses = '*'
```

Edit `/etc/postgresql/14/main/pg_hba.conf`:
```conf
# Add this line (replace YOUR_SERVER_IP with actual IP)
host    all             all             0.0.0.0/0            md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

#### 4. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 5. Deploy Your Application
```bash
# Clone your repo
git clone your-repo-url
cd apocalipse_pesqueiro_websocket

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
SOCKET_PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=your_user
DB_PASSWORD=strong_password
NEXT_PUBLIC_SOCKET_URL=http://your-server-ip:3001
EOF

# Setup database
npm run db:setup

# Build the app
npm run build

# Start the app (use PM2 for production)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### Option 2: With Docker (More Robust)

#### 1. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose
```

#### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: apocalipse_db
    environment:
      POSTGRES_DB: apocalipse_pesqueiro
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: prosperitylake
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: always

  backend:
    build: .
    container_name: apocalipse_backend
    depends_on:
      - postgres
    ports:
      - "3001:3001"
      - "3000:3000"
    environment:
      SOCKET_PORT: 3001
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: apocalipse_pesqueiro
      DB_USER: postgres
      DB_PASSWORD: prosperitylake
    restart: always

volumes:
  postgres_data:
```

#### 3. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000 3001

CMD ["sh", "-c", "npm run backend & npm start"]
```

#### 4. Deploy
```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🔧 Production Configuration

### PM2 Configuration (ecosystem.config.js)
Create this file in your project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'apocalipse-backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        SOCKET_PORT: 3001
      }
    },
    {
      name: 'apocalipse-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

### Environment Variables for Production
Update your `.env` on Kamatera:

```env
# Socket Configuration
SOCKET_PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=your_secure_user
DB_PASSWORD=your_very_strong_password

# Public URL (replace with your server IP or domain)
NEXT_PUBLIC_SOCKET_URL=http://your-domain.com:3001
```

---

## 🔐 Security Checklist

- [ ] Use strong database passwords
- [ ] Configure firewall (UFW)
  ```bash
  sudo ufw allow 22
  sudo ufw allow 80
  sudo ufw allow 443
  sudo ufw allow 3000
  sudo ufw allow 3001
  sudo ufw enable
  ```
- [ ] Set up SSL/TLS with Let's Encrypt
- [ ] Restrict PostgreSQL access to localhost only (if possible)
- [ ] Use environment variables for secrets
- [ ] Regular backups of PostgreSQL
  ```bash
  pg_dump -U your_user apocalipse_pesqueiro > backup.sql
  ```

---

## 📊 Monitoring

```bash
# Check if services are running
pm2 status

# View logs
pm2 logs

# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

---

## 🚨 Troubleshooting

### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Test connection
psql -h localhost -U your_user -d apocalipse_pesqueiro
```

### Build fails
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

### Server not accessible
```bash
# Check if ports are open
sudo netstat -tlnp | grep -E '3000|3001'

# Check firewall
sudo ufw status
```

---

## 📝 Recommendation

For **Kamatera production deployment**, I recommend:

1. **Start without Docker** for simplicity
2. Install PostgreSQL directly on the server
3. Use **PM2** to manage Node.js processes
4. Set up **nginx** as reverse proxy (optional but recommended)
5. Configure **SSL with Let's Encrypt**

Once you're comfortable, migrate to Docker for better scalability!
