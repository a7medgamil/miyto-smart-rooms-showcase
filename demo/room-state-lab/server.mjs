import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Explicit allowlist: never expose repository files, directories or arbitrary paths.
const assets = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/styles.css', ['styles.css', 'text/css']],
  ['/app.mjs', ['app.mjs', 'text/javascript']],
  ['/engine.mjs', ['engine.mjs', 'text/javascript']],
  ['/README.md', ['README.md', 'text/plain']]
]);

export function createStaticServer() {
  return createServer(async (request, response) => {
    response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; media-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method not allowed');
      return;
    }
    const asset = assets.get(request.url.split('?')[0]);
    if (!asset) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : 'Not found');
      return;
    }
    try {
      const content = await readFile(new URL(asset[0], import.meta.url));
      response.writeHead(200, { 'Content-Type': `${asset[1]}; charset=utf-8` });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : 'Unable to read local demo asset');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createStaticServer();
  server.on('error', error => {
    console.error(`Local demo server: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(4173, '127.0.0.1', () => {
    console.log('Independent synthetic demonstration — not MIYTO production source, not a live audio service, not a load test.');
    console.log('Room State Lab: http://127.0.0.1:4173 (Ctrl+C to stop)');
  });
}
