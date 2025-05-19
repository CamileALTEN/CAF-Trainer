############################################################
# CAF-Trainer • backend • Dockerfile (production)
############################################################
# ── Étape 1 : build ───────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/corp-root-ca.crt

# 1) Certificat interne
COPY backend/corp-root-ca.cer /usr/local/share/ca-certificates/corp-root-ca.crt
RUN cat /usr/local/share/ca-certificates/corp-root-ca.crt >> /etc/ssl/certs/ca-certificates.crt

# 2) Dépendances mono-repo
COPY package*.json ./
COPY backend/package*.json backend/
COPY tsconfig*.json ./
RUN npm ci --workspaces --include-workspace-root=false --workspace backend

# 3) Code & Prisma (+ génération client)
COPY backend ./backend
WORKDIR /app/backend
RUN npx prisma generate                      

RUN npm run build                          

# ── Étape 2 : runtime léger ────────────────
FROM node:20-alpine
WORKDIR /app/backend
ENV NODE_ENV=production \
    NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/corp-root-ca.crt

COPY backend/corp-root-ca.cer /usr/local/share/ca-certificates/
RUN cat /usr/local/share/ca-certificates/corp-root-ca.crt >> /etc/ssl/certs/ca-certificates.crt

COPY --from=build /app/node_modules       /app/node_modules
COPY --from=build /app/backend/build      ./build
COPY --from=build /app/backend/prisma     ./prisma

EXPOSE 5000
CMD ["node", "build/index.js"]
