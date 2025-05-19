############################################################
# CAF-Trainer • client • Dockerfile (production)
############################################################
### Étape 1 : build CRA ####################################
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/corp-root-ca.crt

COPY client/corp-root-ca.cer /usr/local/share/ca-certificates/corp-root-ca.crt
RUN cat /usr/local/share/ca-certificates/corp-root-ca.crt >> /etc/ssl/certs/ca-certificates.crt

COPY package*.json ./
COPY client/package*.json client/
RUN npm ci --workspaces --include-workspace-root=false --workspace client

COPY client ./client
WORKDIR /app/client
RUN npm run build                   
### Étape 2 : image Nginx ##################################
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Copie du build CRA
COPY --from=build /app/client/build ./        

# Conf SPA + proxy API
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
