# arockiaraj.co.in

Personal site of Arockiaraj Rayappan: posts, projects, talks, and course notes.
Built with [Hugo](https://gohugo.io/) and the [Blowfish](https://blowfish.page/) theme,
deployed to GitHub Pages at <https://arockiaraj.co.in/>.

## Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) **0.164.0 to 0.167.x** (the range Blowfish v3.9.0 supports; CI uses 0.167.0)
- Git

## Development

```bash
git clone --recurse-submodules https://github.com/arockiaraj1994/arockiaraj.git
cd arockiaraj
hugo server -D        # http://localhost:1313
```

Already cloned without submodules? Run `git submodule update --init --recursive`.

Production build: `hugo --gc --minify` (output in `public/`).

## Layout

```
config/_default/     site config: hugo, languages (author), menus, markup, params
content/
├── posts/           blog posts
├── projects/        project write-ups
├── talks/           talk recaps
├── courses/         course pages; notes come from data/courses/<notesData>.yaml
└── profile.md       About page (also served at /about/)
assets/
├── css/custom.css   course-notes styles, loaded after Blowfish
├── css/schemes/buildlog.css   site colour scheme
└── img/             avatar and default social card
layouts/             overrides of Blowfish templates (see below)
static/              images, PDFs, favicons
themes/blowfish/     Blowfish theme (git submodule, pinned to v3.9.0)
```

## Writing content

```bash
hugo new posts/my-new-post.md
```

Front matter used by the theme:

| Field | Purpose |
|---|---|
| `description` | Card text, meta description, and link-preview text |
| `featureimage` | Card thumbnail, e.g. `"/images/<section>/<slug>/cover.jpg"` (files under `static/images/`) |
| `images` | Link-preview (`og:image`) image; set it to the same path as `featureimage` |
| `tags`, `categories` | Lowercase, hyphenated tags; one category per page |

## Theme overrides

These files copy a Blowfish template and change a few lines. Re-check them against the theme when you bump the submodule:

- `layouts/courses/single.html`: Blowfish `single.html` plus the certificate link and course notes
- `layouts/partials/article-link/card.html`, `card-related.html`: cards show `description` instead of the auto summary

## Updating Blowfish

```bash
cd themes/blowfish && git fetch --tags && git checkout vX.Y.Z && cd ../..
```

Check the Hugo range the new version supports, update `HUGO_VERSION` in `.github/workflows/hugo.yml` to match, then commit the submodule bump.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md).
