# PaycoreOS

Public site, merchant portal, and admin for PaycoreOS, a DBA of Telecom Elite, Inc. The app is a Cloudflare Worker with static assets, D1, and R2.

The $39 application fee is disclosed on the site. The pay button is off until `FEE_PAYMENTS_ENABLED` is set to `true`. There is no Stripe call in this repo.

## Local

```bash
npm install
cp .dev.vars.example .dev.vars
# Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 10 characters). Do not commit .dev.vars.
npx wrangler d1 migrations apply paycoreos --local
npx wrangler dev
```

The first request creates the admin user from those two variables if no admin exists yet.

## Secrets

Set these in Cloudflare with `wrangler secret put`. Do not commit the values.

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

`FEE_PAYMENTS_ENABLED` stays `false` in `wrangler.toml` until a fee account is ready.
