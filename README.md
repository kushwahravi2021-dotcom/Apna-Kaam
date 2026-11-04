# Apna Kaam

**Ghar ki har zarurat, ek hi app par.**

Apna Kaam is an Indian local-services marketplace connecting customers with nearby service providers.

## Current status

The project has the initial Next.js mobile-first foundation, customer UI, service catalogue, and Prisma database schema.

## Roles

- Customer
- Service Provider
- Admin

## Service groups

- Home Services
- Repair
- Daily Needs
- Travel & Transport

## Local development

Requirements:
- Node.js 20+
- npm
- PostgreSQL for database features

```bash
npm install
npm run dev
```

Open http://localhost:3000.

For database features, copy `.env.example` to `.env` and set a PostgreSQL DATABASE_URL.

## Security

Never commit real secrets, OTP credentials, map keys, payment secrets, or production database credentials.

## Development note

The current provider cards are development/demo records. Production authentication, database wiring, OTP, payments, maps, notifications, and provider verification are planned for the next implementation phases.
