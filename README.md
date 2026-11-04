# Apna Kaam

**Ghar ki har zarurat, ek hi app par.**

Apna Kaam is a mobile-first Indian local-services marketplace for customers, service providers and administrators.

## Implemented application flows

- Phone OTP login and signed HTTP-only sessions
- Customer profile management
- Service catalogue loaded from PostgreSQL
- Provider registration and admin approval
- Approved provider directory and availability toggle
- Customer booking creation and booking history
- Provider booking acceptance/rejection and work-status workflow
- In-app notifications
- Completed-booking reviews and provider rating aggregates
- Optional Razorpay checkout for completed bookings
- Customer complaint submission and admin complaint handling
- Admin booking overview and map-direction links
- PWA manifest and offline fallback
- CI type-check and production build workflow

## Requirements

- Node.js 20+
- npm
- PostgreSQL
- Twilio credentials for production OTP delivery
- Razorpay account keys for online payments
- A deployed HTTPS URL before creating the Android wrapper APK

## Local development

```bash
npm install
cp .env.example .env
```

Set `DATABASE_URL` and a random `AUTH_SECRET` of at least 32 characters, then run:

```bash
npx prisma db push
npx prisma migrate resolve --applied 20261104150000_add_otp_challenge
npx prisma generate
npx prisma db seed
npm run dev
```

Open http://localhost:3000.

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: long random secret used for session and OTP HMAC signatures.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`: Twilio SMS sender settings. Production OTP sending fails closed when these are missing. Development uses OTP `123456`. OTP challenges are stored in PostgreSQL, expire after five minutes and allow five attempts.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: Razorpay test/live keys. Payment is unavailable until configured.
- `ADMIN_PHONE`: 10-digit phone number used by the seed script to bootstrap an admin account. Admin still signs in using OTP.
- `NEXT_PUBLIC_APP_URL`: HTTPS deployment URL used by the Android wrapper workflow.
- `MAPS_API_KEY`: reserved for a future maps integration; maps are not yet connected.

Never commit real secrets.

## Install on Android (PWA)\n\nAfter deployment over HTTPS, open the website in Chrome on Android and use the browser menu to install Apna Kaam. The PWA includes an offline fallback page; authenticated/API data still requires an internet connection.\n\n## Android APK

The app must first be deployed to an HTTPS URL and have its production environment configured. In GitHub, open Actions → Android APK → Run workflow and provide the deployed URL as `app_url`. The workflow builds a Capacitor Android wrapper and uploads a debug APK artifact for 30 days. You may optionally publish a prerelease GitHub Release. This is a debug APK, not a Play Store-ready signed production build; a signed production APK/AAB requires Android signing credentials.

## Important production checks

- Apply database migrations before starting the app.
- Configure Twilio and Razorpay keys in the hosting provider's secret settings.
- Use Razorpay test mode before live payments.
- Configure backups, monitoring, rate limits and a production session revocation strategy.
- In-app notifications are stored in the database; push notifications are not configured.
- Maps/geolocation, live cab/travel inventory, refunds, provider payouts and dispute workflows are not yet integrated.

## CI

GitHub Actions runs Prisma Client generation, TypeScript type-checking and a Next.js production build on pushes and pull requests targeting `main`.
