import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

function startServer(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

test('POST /api/intelligence/pipeline uses auth + DB activity + Python mock', async () => {
  const pythonMock = await startServer((req, res) => {
    if (req.method === 'POST' && req.url === '/intelligence/pipeline') {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
      });
      req.on('end', () => {
        const body = JSON.parse(raw || '{}');
        assert.equal(body.budget, 5000);
        assert.ok(Array.isArray(body.products));
        assert.ok(Array.isArray(body.activity_events));
        assert.ok(body.products[0].outcome_boost >= 0);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          promotional_engine: { engine: 'promotional_intelligence', promoted_products: [] },
          realtime_recommendation: { engine: 'realtime_recommendation', suggestions: [] },
          bundle_optimization: {
            engine: 'bundle_optimization',
            strategy: 'greedy_ratio',
            budget: body.budget,
            total_cost: 2100,
            remaining_budget: 2900,
            bundle_score: 7.5,
            bundle: [{ id: 1, name: 'Laptop Stand', price: 1200, qty: 1 }],
          },
          anomaly_detection: { engine: 'anomaly_detection', risk_level: 'low', signals: [] },
        }));
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });

  const pythonAddress = pythonMock.address();
  const pythonPort = typeof pythonAddress === 'object' ? pythonAddress.port : null;
  process.env.PYTHON_ENGINE_URL = `http://127.0.0.1:${pythonPort}`;
  process.env.OPTIMALL_TEST_BYPASS_AUTH = '1';

  globalThis.__OPTIMALL_TEST_MOCK_POOL = {
    async query(sql) {
      if (String(sql).includes('INSERT INTO users')) return [{ affectedRows: 1 }];
      if (String(sql).includes('SELECT id FROM users')) return [[{ id: 7 }]];
      if (String(sql).includes('FROM user_activity')) {
        return [[
          { event_type: 'add_to_cart', product_id: 1, search_query: null, created_at: '2026-05-19T00:00:00Z' },
          { event_type: 'view_product', product_id: 2, search_query: null, created_at: '2026-05-18T12:00:00Z' },
        ]];
      }
      if (String(sql).includes('FROM products')) {
        return [[
          { id: 1, name: 'Laptop Stand', category: 'Tech', price: 1200, stock: 10, popularity_score: 0.8, tag_vector: null, extra: null },
          { id: 2, name: 'Desk Lamp', category: 'Home', price: 900, stock: 8, popularity_score: 0.5, tag_vector: null, extra: null },
        ]];
      }
      return [[]];
    },
  };

  const { default: app } = await import('../server.js');
  const apiServer = await startServer(app);
  const apiAddress = apiServer.address();
  const apiPort = typeof apiAddress === 'object' ? apiAddress.port : null;

  const response = await fetch(`http://127.0.0.1:${apiPort}/api/intelligence/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer fake-token',
      'x-test-user-id': 'clerk_test_user_123',
    },
    body: JSON.stringify({
      budget: 5000,
      preferences: ['Tech'],
      products: [],
      activity_events: [],
    }),
  });

  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.bundle_optimization.budget, 5000);
  assert.equal(data.bundle_optimization.remaining_budget, 2900);

  await closeServer(apiServer);
  await closeServer(pythonMock);
  delete globalThis.__OPTIMALL_TEST_MOCK_POOL;
  delete process.env.OPTIMALL_TEST_BYPASS_AUTH;
});

test('POST /api/intelligence/pipeline returns 400 on invalid payload', async () => {
  process.env.OPTIMALL_TEST_BYPASS_AUTH = '1';
  globalThis.__OPTIMALL_TEST_MOCK_POOL = {
    async query() {
      return [[]];
    },
  };

  const { default: app } = await import('../server.js');
  const apiServer = await startServer(app);
  const apiAddress = apiServer.address();
  const apiPort = typeof apiAddress === 'object' ? apiAddress.port : null;

  const response = await fetch(`http://127.0.0.1:${apiPort}/api/intelligence/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer fake-token',
    },
    body: JSON.stringify({ budget: 0, preferences: 'bad-type' }),
  });

  const data = await response.json();
  assert.equal(response.status, 400);
  assert.equal(data.error, 'Invalid intelligence pipeline payload');
  assert.ok(Array.isArray(data.details));

  await closeServer(apiServer);
  delete globalThis.__OPTIMALL_TEST_MOCK_POOL;
  delete process.env.OPTIMALL_TEST_BYPASS_AUTH;
});
