#!/bin/sh
set -e

echo "🚀 Starting Apocalipse Pesqueiro application..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
max_attempts=30
attempt=0

until node -e "
const {Pool} = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});
pool.query('SELECT 1')
  .then(() => {
    console.log('DB ready');
    process.exit(0);
  })
  .catch((err) => {
    console.error('DB not ready:', err.message);
    process.exit(1);
  });
" 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "❌ PostgreSQL did not become ready in time"
    exit 1
  fi
  echo "PostgreSQL is unavailable - sleeping (attempt $attempt/$max_attempts)"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run database setup (will skip if already initialized)
echo "📊 Setting up database..."
node db/setup-database.js || echo "⚠️  Database setup skipped (may already exist)"

# Start Socket.IO backend in background
echo "🔌 Starting Socket.IO backend server on port ${SOCKET_PORT}..."
node server.js &
BACKEND_PID=$!

# Give backend a moment to start
sleep 3

# Start Next.js frontend
echo "⚡ Starting Next.js frontend on port ${PORT}..."
node server.js &
FRONTEND_PID=$!

echo "✅ All services started!"
echo "   - Frontend: http://localhost:${PORT}"
echo "   - Backend: http://localhost:${SOCKET_PORT}"

# Function to handle shutdown
shutdown() {
  echo "🛑 Shutting down gracefully..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}

trap shutdown SIGTERM SIGINT

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
