import app from './server.js';

const port = Number(process.env.API_PORT || process.env.PORT || 3001);
const host = process.env.API_HOST || '127.0.0.1';

const server = app.listen(port, host, () => {
  console.log(`OptiMall API running on http://${host}:${port}`);
});

server.on('error', (err) => {
  console.error(`Failed to start API on ${host}:${port}:`, err.message);
  process.exit(1);
});
