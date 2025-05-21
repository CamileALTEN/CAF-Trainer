# CAF-Trainer

This project provides a training platform composed of a React frontend and an Express/Prisma backend.

## Getting started

Environment variables are loaded from a `.env` file (see `.env.example`).
In addition to database and mail settings, the following variables configure the
Single Sign-On integration:

```
SSO_CLIENT_ID
SSO_CLIENT_SECRET
SSO_ISSUER
SSO_REDIRECT_URI
SSO_ADMIN_GROUP
SSO_MANAGER_GROUP
```

Run `docker-compose -f docker-compose.dev.yml up` for a development setup.

## Dependency updates

Security updates are tracked automatically with GitHub Dependabot. Every pull
request runs an `npm audit` job to detect vulnerable packages. A Software Bill
of Materials can be generated with `npm run generate:sbom`.

## Security documentation

Security related design notes and a simple STRIDE threat model are available in the [docs](docs/) folder:

- [SECURITY_DESIGN.md](docs/SECURITY_DESIGN.md)
- [THREAT_MODEL_STRIDE.md](docs/THREAT_MODEL_STRIDE.md)

These documents should be reviewed by peers or security experts to validate the architecture and countermeasures.
