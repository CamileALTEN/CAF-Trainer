# CAF-Trainer

This project provides a training platform composed of a React frontend and an Express/Prisma backend.

## Getting started

Environment variables are loaded from a `.env` file (see `.env.example`).
Run `docker-compose -f docker-compose.dev.yml up` for a development setup.

## Security documentation

Security related design notes and a simple STRIDE threat model are available in the [docs](docs/) folder:

- [SECURITY_DESIGN.md](docs/SECURITY_DESIGN.md)
- [THREAT_MODEL_STRIDE.md](docs/THREAT_MODEL_STRIDE.md)

These documents should be reviewed by peers or security experts to validate the architecture and countermeasures.
