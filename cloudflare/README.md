# ObsidianClaw website on Cloudflare

This directory deploys **only** the existing `landing/index.html` and `landing/humanity-labs-logo.png`. It does not build, publish, or change the Obsidian plugin. The separate plugin release workflow is unchanged.

## Source and production

The production source is `oscarhenrycollins/obsidianclaw`, not the older same-named Humanity Labs organization repository. The page and logo were byte-matched against the Vercel deployment of commit `aa4125f1bc1460fef9e825c7d46745d57420b1a6` before migration.

- Live: https://www.obsidianclaw.ai/
- Apex: https://obsidianclaw.ai/ redirects to www with HTTP 307, preserving path/query.
- Worker: `obsidianclaw-landing` in Humanity Labs account `92b29f2f2f8c6d5e59594884ee852913`.
- Preview: https://obsidianclaw-landing.ai-wizards-previews.workers.dev/
- Exact-host routes are versioned in `wrangler.json`. DNS is managed separately.

## Test and deploy

Requires Node 22+ and a Cloudflare token authorized for this account and zone. Supply `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` securely; never commit credentials.

```sh
npm --prefix cloudflare ci
npm --prefix cloudflare test
npm --prefix cloudflare run build
npm --prefix cloudflare run deploy
```

Deployment is **manual**. GitHub Actions checks routing and the asset allowlist but does not deploy and has no Cloudflare token. Do not assume a Git push updates the website.

The Worker serves assets without an origin fallback. `/`, `/index.html`, and `/index.html/` retain the existing behavior; unknown/extensionless paths remain 404. Preview-host managed robots responses may differ from custom-domain responses. Public assets are copied into an isolated directory; plugin/config files cannot be published accidentally.

## DNS and rollback

The two existing records are updated in-place to proxied A `192.0.2.1` only after both exact-host Worker routes and active TLS are verified. This is a reserved placeholder, not a server: Workers handles all requests, and the routes must never fail open. No mail or unrelated records are changed.

Vercel project `prj_ifGLZjwJl8I37CUzSwrWRQdnguhJ` remains intact for rollback; its last production deployment before cutover is `dpl_AZGHWmQpahUAy8owB1gpBPLE9HJ6`.

To roll back, **restore the original DNS records first**, verify normal custom-domain traffic reaches Vercel, and only then remove the Cloudflare routes:

- `obsidianclaw.ai`: DNS-only A `216.150.1.1`.
- `www.obsidianclaw.ai`: DNS-only CNAME `f39e197914866dea.vercel-dns-016.com`.

Preserve the original record IDs and TTLs from the operator's pre-cutover backup. Do not delete the Vercel project or cancel its plan until all remaining projects have been assessed and separately approved.
