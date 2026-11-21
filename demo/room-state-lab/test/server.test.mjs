import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { once } from 'node:events';
import { createStaticServer } from '../server.mjs';

function get(port, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method, agent: false }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', part => { body += part; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('local static server serves only allowlisted assets with restrictive headers', async t => {
  const server = createStaticServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const { port, address } = server.address();
  assert.equal(address, '127.0.0.1');

  await t.test('HTML and modules have correct content types and no cookies', async () => {
    const page = await get(port, '/');
    assert.equal(page.status, 200);
    assert.match(page.body, /Independent synthetic demonstration/);
    assert.match(page.headers['content-type'], /text\/html/);
    assert.match(page.headers['content-security-policy'], /connect-src 'none'/);
    assert.equal(page.headers['permissions-policy'], 'camera=(), microphone=(), geolocation=()');
    assert.equal(page.headers['set-cookie'], undefined);
    assert.equal(page.headers['cache-control'], 'no-store');
    for (const path of ['/app.mjs', '/engine.mjs', '/styles.css', '/README.md']) {
      const asset = await get(port, path);
      assert.equal(asset.status, 200, path);
      assert.ok(asset.body.length > 0);
      assert.match(asset.headers['content-type'], path.endsWith('.mjs') ? /text\/javascript/ : /text\//);
    }
  });

  await t.test('unknown, repository and traversal paths return 404', async () => {
    for (const path of ['/package.json', '/server.mjs', '/.git/config', '/../README.md', '/%2e%2e/README.md', '/missing']) {
      assert.equal((await get(port, path)).status, 404, path);
    }
  });

  await t.test('HEAD has no body, queries work, and POST is rejected', async () => {
    const head = await get(port, '/', 'HEAD');
    assert.equal(head.status, 200);
    assert.equal(head.body, '');
    assert.equal((await get(port, '/styles.css?v=1')).status, 200);
    assert.equal((await get(port, '/', 'POST')).status, 405);
  });
});
