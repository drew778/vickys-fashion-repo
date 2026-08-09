# Vicky's Fashion — Deploy & Auto-Update Guide

This folder is a ready-to-push copy of the Vicky's Fashion website.
Once it's linked to your Netlify site, **every push auto-deploys** — no more drag-and-drop.

- Netlify site: **vickys-fashion** → https://vickys-fashion.netlify.app
- Suggested GitHub repo: **https://github.com/drew778/vickys-fashion**
  (that remote was used before — or use any repo you like; see Step 1)

---

## Step 1 — Put this folder on GitHub

If you don't have the repo yet, create an empty one at https://github.com/new
(name it `vickys-fashion`, and do NOT add a README/.gitignore/license).

Then open Terminal and run (replace the URL if using a different account/repo):

```bash
cd path/to/vickys-fashion-repo
git init
git add -A
git commit -m "Vicky's Fashion website"
git branch -M main
git remote add origin https://github.com/drew778/vickys-fashion.git
git push -u origin main
```

- If GitHub says the repo already has content and rejects the push, and you want this build
  to replace it, run:
  ```bash
  git push -u origin main --force
  ```
- If prompted to log in, use your GitHub username and a **Personal Access Token** as the
  password (GitHub → Settings → Developer settings → Personal access tokens → `repo` scope).

---

## Step 2 — Link the repo to your Netlify site (one time)

- Go to https://app.netlify.com/projects/vickys-fashion
- **Site configuration → Build & deploy → Continuous deployment → Link repository**
- Choose **GitHub**, authorize if asked, and select your `vickys-fashion` repo
- Settings:
  - **Branch to deploy:** `main`
  - **Build command:** leave blank
  - **Publish directory:** `.` (a single dot) — the included `netlify.toml` already sets this
- Click **Deploy site**

Done. From now on, every push to `main` rebuilds and publishes automatically — the URL,
HTTPS, and site name all stay the same.

---

## Updating the site later

When I send you updated files:
1. Drop them into this folder (overwrite the old ones).
2. Then:

```bash
git add -A
git commit -m "Update site"
git push
```

Your live site updates in ~30 seconds.

---

## Notes
- Plain static site (HTML/CSS/JS + images) — no build step, which is why the build command is blank.
- Linking a repo only changes *how* deploys happen; it doesn't touch your domain or settings.
