# RegisterBuddy — Surge Planning (prototype)

Mock frontend for a **Beacon Pod PM case study**. Not production. No auth, no real student data.

**Live (after Pages is enabled):** https://gobi-wan-kenobi.github.io/RegisterBuddy-casestudy/

## Demo path (Loom)

1. **Overview** — plan at risk, projection strip, alerts  
2. Open **Short on reader-capable capacity**  
3. Read **Why** → **Accept suggestion** → **Apply to plan**  
4. **Plan board** — Music Closet open Thu 1–3 (reader-capable)

## Local

```bash
npm install
npm run dev
```

## GitHub Pages

This repo includes a workflow that builds and deploys `dist` on push to `main`.

1. Make the repo **public** (or use a private Pages plan).  
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.  
3. Push to `main` (or re-run the workflow).  

Vite `base` is set to `/RegisterBuddy-casestudy/`.

## Note

Interview artifact only.


## Phased roadmap

See [PHASED_ROADMAP.md](./PHASED_ROADMAP.md) — CEO feature request pressure-tested across Phase 0–4 with success/kill metrics. In-app **Roadmap** tab summarizes the same plan.
