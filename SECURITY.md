# SceneMates security policy

Security is defense in depth; no application can promise that a breach is
impossible. This repository is configured to reduce exposure and to fail closed
when authentication is unavailable.

## Secrets

- Never paste credentials into source code, chat, screenshots, tickets or logs.
- Store production values in the hosting provider's secret manager.
- Keep local values only in `.env.local` with owner-only file permissions.
- Run `npm run security:secrets` before every commit.
- Immediately rotate any credential that has been pasted or otherwise exposed.
  Removing a file does not revoke an already exposed credential.

## Production checklist

1. Generate an independent, random `AUTH_SECRET` of at least 32 bytes.
2. Use a newly rotated Google OAuth client secret and exact HTTPS redirect URIs.
3. Set `AUTH_TRUST_HOST=true` only behind a proxy/host you control.
4. Set `TRUST_PROXY_HEADERS=true` only when that proxy overwrites forwarded IP headers.
5. Use MongoDB Atlas with TLS, a least-privilege database user and a narrow IP
   access list or private endpoint. Do not use `0.0.0.0/0` in production.
6. Enable MFA for Google Cloud, MongoDB Atlas and hosting-provider administrators.
7. Configure backups, audit logs, dependency monitoring and an incident-response
   contact before accepting real user data.
8. Publish privacy, retention and account-deletion policies before launch.

## User data

- OAuth provider access, refresh and ID tokens are not retained by SceneMates.
- Session cookies are HTTP-only, SameSite and Secure in production.
- Profile media is authentication-gated, type-checked and served with private,
  no-store caching.
- Uploaded local filenames are not stored, because they can reveal personal data.

## Reporting

Do not open a public issue containing a vulnerability or user data. Contact the
project owner privately and include reproduction steps without live credentials.
