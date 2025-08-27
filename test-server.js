const http = require('http');
const setupSocketIO = require('./socket-setup');

console.log('[TEST] Starting simple test server...');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Socket.IO Test</title>
        <script src="/socket.io/socket.io.js"></script>
    </head>
    <body>
        <h1>Socket.IO Test Server</h1>
        <div id="status">Connecting...</div>
        <script>
            const socket = io();
            const status = document.getElementById('status');
            
            socket.on('connect', () => {
                status.textContent = 'Connected! Socket ID: ' + socket.id;
                console.log('Connected to server');
                
                // Test join game
                socket.emit('join-game', {
                    name: 'Test Player',
                    roomId: 'test-room'
                }, (response) => {
                    console.log('Join response:', response);
                });
            });
            
            socket.on('disconnect', () => {
                status.textContent = 'Disconnected';
            });
            
            socket.on('players-updated', (players) => {
                console.log('Players updated:', players);
            });
        </script>
    </body>
    </html>
  `);
});

// Setup Socket.IO
const io = setupSocketIO(server);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`[TEST] Server running on http://localhost:${PORT}`);
  console.log('[TEST] Open this URL in multiple browser tabs to test');
});
