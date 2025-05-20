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

## Validation

This document is intended for peer or security expert review to validate the overall design and proposed protections.
