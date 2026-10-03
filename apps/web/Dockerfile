# syntax=docker/dockerfile:1.7
# ============================================================
# Stage 1: deps  — install node_modules with a BuildKit cache mount
# ============================================================
FROM node:22-alpine AS deps

WORKDIR /app

# Faster, deterministic installs. The cache mount survives across
# builds so repeated installs are near-instant.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --prefer-offline

# ============================================================
# Stage 2: build  — produce the standalone Next.js server
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* values are inlined into the bundle at build time, so
# they MUST be provided here (not at runtime). Override with --build-arg
# or compose `build.args`.
ARG NEXT_PUBLIC_LOGIFY_API_BASE_URL=http://localhost:8080
ENV NEXT_PUBLIC_LOGIFY_API_BASE_URL=${NEXT_PUBLIC_LOGIFY_API_BASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================================
# Stage 3: runtime  — run Next.js as a non-root user on :8080
# ============================================================
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node
STOPSIGNAL SIGTERM

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:8080/healthz || exit 1

CMD ["node", "server.js"]
