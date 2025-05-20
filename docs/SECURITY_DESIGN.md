# Security Design

This document describes how security concerns are integrated into the project.

## Architecture

The application is split into a **backend** (Node.js/Express + Prisma + PostgreSQL) and a **frontend** (React). Authentication is based on JWT.

Secrets are loaded from environment variables using `dotenv` and validated on startup.

## Security Principles

- **Security by Design**: the code applies `helmet` for secure HTTP headers and enforces HTTPS when certificates are provided.
- **Least Privilege**: API routes use an authentication middleware that verifies the user role before granting access.
- **Secret Management**: critical secrets (`JWT_SECRET`, `DATA_KEY`, SMTP credentials) are not stored in the repository and must be provided via environment variables.
- **Logging and Audit**: a winston based logger records HTTP requests and errors to a log file.
- **Revocation**: JWT tokens include a `tokenVersion` checked against the database to allow revocation.

## Dependency Management

The project relies on third‑party packages that must be kept up to date to
avoid known vulnerabilities. Updates are tracked automatically by GitHub
Dependabot for all workspaces and GitHub Actions. Every pull request triggers a
`npm audit` workflow which fails the build if high or critical issues are
reported. A Software Bill of Materials (SBOM) can be generated with
`npm run generate:sbom` to inventory components. Dependencies should be reviewed
weekly and updated promptly when security patches are released.

## Validation

This document is intended for peer or security expert review to validate the overall design and proposed protections.

## Software and Data Integrity

To address OWASP A08 risks:

- Dependencies are locked with `package-lock.json` and verified by the CI workflow running `npm audit`.
- Dockerfiles check the SHA-256 hash of the internal certificate before adding it to the trust store.
- Any future resources loaded from a CDN must include a Subresource Integrity (`integrity`) attribute, for example:

```html
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```
- External artifacts such as scripts or archives must have their hash validated before use.
