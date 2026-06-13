# syntax=docker/dockerfile:1.7
# ============================================================
# Stage 1: deps  — install node_modules with a BuildKit cache mount
# ============================================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --prefer-offline

# ============================================================
# Stage 2: build  — produce the static SPA bundle in /app/dist
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production

# Vite inlines VITE_* values into the bundle at build time, so they
# MUST be provided here (not at runtime). Override with --build-arg
# or compose `build.args` when you add any.

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `npm run build` = `tsc -b && vite build` (emits ./dist)
RUN npm run build

# ============================================================
# Stage 3: runtime  — serve /app/dist via non-root nginx on :8080
# ============================================================
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

USER root
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html
USER 101

STOPSIGNAL SIGQUIT

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
