FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --no-audit --no-fund
COPY frontend frontend
RUN npm run build --workspace frontend
FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=5000
WORKDIR /app
COPY package*.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --chown=node:node backend backend
COPY --from=build --chown=node:node /app/frontend/dist frontend/dist
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","backend/server.js"]
