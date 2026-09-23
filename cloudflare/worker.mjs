export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'obsidianclaw.ai') {
      url.hostname = 'www.obsidianclaw.ai';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 307);
    }
    if (url.pathname === '/') url.pathname = '/index.html';
    // Preserve Vercel's trailing-slash handling for known static files only.
    if (url.pathname === '/index.html/' || url.pathname === '/humanity-labs-logo.png/') {
      url.pathname = url.pathname.slice(0, -1);
    }
    return env.ASSETS.fetch(new Request(url, request));
  }
};
