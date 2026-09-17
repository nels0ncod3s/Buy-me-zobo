# Buy Me Zobo

A SvelteKit frontend demo for a Nigerian creator-support platform, with a zobo-inspired visual identity, creator pages, and a connected demo dashboard.

## Run locally

```sh
npm ci
npm run dev
```

## Checks

```sh
npm test
npm run lint
npm run build
```

## Try the demo

- `/` — landing page and interactive support preview.
- `/example` — an illustrative creator page; no signup or payment required.
- `/signup` — choose a username and display name to create a local demo profile.
- `/login` — opens the demo workspace; authentication is intentionally mocked.
- `/dashboard` — profile, support, setup checklist, and simulated balance.
- `/dashboard/settings` — edit your identity, bio, photo, preferences, and page status.
- `/dashboard/supporters` — test gift history and message search.
- `/dashboard/payouts` — masked sample bank destination and simulated payouts.
- `/creator/[username]` — preview the profile saved on the current browser.

Profile data, preferences, photos, test gifts, and simulated payouts persist in localStorage on the current browser. A new demo profile replaces the previous demo on that device. Creator links do not publish or transfer a local profile to another browser; visitors without that profile see an explanatory page. The example page works for every visitor and its test gifts reset on reload.

No real authentication, payments, bank verification, transfers, or notification emails are performed. Pricing is illustrative. For bank demonstrations use sample details; only the final four account digits are stored.
