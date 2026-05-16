// Simple Node server without npm dependencies
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Nexus API Server is running!');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Nexus API Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});