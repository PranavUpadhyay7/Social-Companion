# SceneMates

SceneMates is a Next.js nightlife discovery and social matching app. Events, groups and the landing page are public. Clubbers, profiles, matches, private media and chat require a registered Google account.

## Local setup

Install dependencies and create the local environment file:

```bash
npm install
cp .env.example .env.local
openssl rand -base64 32
```

Copy the generated value into `AUTH_SECRET` in `.env.local`. Do not paste it into source files or commit it.

Create a Google OAuth web client and add these local URLs:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

Then set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env.local`, start MongoDB, and run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register once on the auth page, then use the login action with that same Google account on later visits.

## MongoDB data

`MONGODB_URI` defaults to `mongodb://127.0.0.1:27017/scenemates` in local development. The application stores:

- Auth.js users and minimal Google account linkage
- SceneMates profile fields and private GridFS media
- Vibed With records, conversations and messages

Google passwords are never available to SceneMates. Provider access, refresh and ID tokens are removed before an account record is stored. Browser sessions use signed, HTTP-only cookies, and API authorization is derived from the server session rather than a user ID supplied by the client.

## Security notes

- Never commit `.env.local`, OAuth credentials, database connection strings or `AUTH_SECRET`.
- Use a separate OAuth client and database user for production.
- Use HTTPS in production and replace the local Google origin and callback with the exact production URLs.
- Give the production MongoDB user only the permissions this application needs.
- Profile uploads are type, signature, size and count checked before being stored.
- The in-memory API rate limiter is suitable for local development. Replace it with a shared Redis-backed limiter before running multiple production instances.

Run the project checks with:

```bash
npm run lint
npm run build
npm audit --omit=dev
```
