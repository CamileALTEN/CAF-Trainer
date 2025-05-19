# Étape 1 : build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY tsconfig*.json ./
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build            # génère /app/build

# Étape 2 : exécution
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma     # pour les migrations à chaud
CMD ["node", "build/index.js"]
EXPOSE 5000
