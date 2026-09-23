import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
for (const host of ['obsidianclaw.ai', 'www.obsidianclaw.ai', 'obsidianclaw-landing.ai-wizards-previews.workers.dev']) {
  for (const path of ['/', '/?x=1', '/index.html', '/index.html/?x=1', '/humanity-labs-logo.png', '/humanity-labs-logo.png/', '/index', '/unknown-path', '/robots.txt', '/favicon.ico']) {
    test(host + path, async () => {
      let seen;
      const response = await worker.fetch(new Request('https://' + host + path), {
        ASSETS: { fetch: async (request) => { seen = new URL(request.url); return new Response('asset'); } }
      });
      if (host === 'obsidianclaw.ai') {
        assert.equal(response.status, 307);
        assert.equal(response.headers.get('location'), 'https://www.obsidianclaw.ai' + path);
        assert.equal(seen, undefined);
      } else {
        const want = new URL('https://' + host + path);
        if (want.pathname === '/') want.pathname = '/index.html';
        if (['/index.html/', '/humanity-labs-logo.png/'].includes(want.pathname)) want.pathname = want.pathname.slice(0, -1);
        assert.equal(seen.href, want.href);
        assert.equal(response.status, 200);
      }
    });
  }
}
