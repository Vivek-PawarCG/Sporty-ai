# ═══════════════════════════════════════════════════════════════
# Sporty-AI — Multi-stage Dockerfile for Cloud Run
# ═══════════════════════════════════════════════════════════════

# Stage 1: Build React frontend
FROM node:22-slim AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:22-slim
WORKDIR /app

# Copy server dependencies and install
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server source code
COPY server/ ./server/

# Copy built frontend from stage 1
COPY --from=frontend-build /app/client/dist ./client/dist

# Cloud Run provides PORT env variable
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Run as non-root for security
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "server/index.js"]
