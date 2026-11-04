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

## Demo testing mode (before official launch)

Set `DEMO_MODE=true` and `NEXT_PUBLIC_DEMO_MODE=true` in the demo deployment. Demo mode uses the fixed OTP `123456` even on a hosted deployment, does not send SMS, disables online payments, and displays a visible demo warning. This is intentionally insecure for testing only: use a separate demo database, fake/sample contact details, and never store real customer/payment information. Run `npx prisma db seed` after enabling demo mode to create sample providers. Sample provider logins: Ramesh `9999990001`, Suresh `9999990002`, Asha `9999990003`; all use OTP `123456`. Any other test phone can create a customer account. Configure `ADMIN_PHONE` before seeding if an admin dashboard is needed. Turn both demo flags off and configure Twilio/Razorpay before official launch.

## Deploy a demo (Vercel + Neon)

1. Create a free Neon PostgreSQL project and copy its connection string as `DATABASE_URL`.
2. Import this GitHub repository into Vercel.
3. Before the first deployment, add these Vercel Environment Variables for **Production**:
   - `DATABASE_URL`: Neon pooled PostgreSQL connection string (select the pooled option in Neon Connect).
   - `DIRECT_URL`: Neon direct PostgreSQL connection string (turn pooled off in Neon Connect). Prisma uses this for schema setup while the app uses the pooled URL.
   - `AUTH_SECRET`: a random secret of at least 32 characters (generate one with `openssl rand -base64 32`).
   - `DEMO_MODE`: `true`.
   - `NEXT_PUBLIC_DEMO_MODE`: `true`.
   - `ADMIN_PHONE`: optional 10-digit mobile number for the demo administrator.
4. Deploy. The included `vercel.json` runs `prisma db push` before the Next.js build to initialize the demo database.
5. The build automatically seeds the service categories and (when demo mode is enabled) sample providers.

Do not share the database URL or `AUTH_SECRET` in chat or commit them to Git. Demo mode is deliberately insecure and must only use a separate test database.

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

## Install on Android (PWA)

After deployment over HTTPS, open the website in Chrome on Android and use the browser menu to install Apna Kaam. The PWA includes an offline fallback page; authenticated/API data still requires an internet connection.

## Android APK

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
