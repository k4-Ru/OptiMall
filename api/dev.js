import app from './server.js';

const port = Number(process.env.API_PORT || process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`OptiMall API running on http://localhost:${port}`);
});
