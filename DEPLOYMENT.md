# Deployment

`.github/workflows/hugo.yml` builds and deploys the site to GitHub Pages on every push to `main`
(and on manual dispatch). The live site is <https://arockiaraj.co.in/>.

## How it works

1. Installs Hugo Extended `HUGO_VERSION` (currently 0.167.0).
2. Checks out the repo **with submodules**, so the Blowfish theme is available.
3. Builds with `hugo --gc --minify --baseURL <Pages URL>`. The Pages URL is the custom domain.
4. Uploads `public/` and deploys it with `actions/deploy-pages`.

## Repository settings

- **Settings → Pages → Source:** GitHub Actions
- **Custom domain:** `arockiaraj.co.in` (set in the Pages settings; with Actions deploys no `CNAME` file is needed), HTTPS enforced

## Gotchas

- Hugo skips future-dated pages (`buildFuture = false`) and CI runs in UTC. Give new posts an explicit
  offset, e.g. `date: 2026-10-10T00:00:00+05:30`, and make sure that moment has already passed when you push.
- Keep `HUGO_VERSION` inside the range the pinned Blowfish version supports (see README).

## Local production check

```bash
hugo --gc --minify && hugo server --environment production
```
