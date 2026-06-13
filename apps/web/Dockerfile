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
# Stage 2: build  — produce the static export in /app/out
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

# next.config.ts sets output: "export" — `next build` emits ./out
RUN npm run build

# ============================================================
# Stage 3: runtime  — serve /app/out via non-root nginx on :8080
# ============================================================
# nginx-unprivileged drops all root privileges and listens on 8080
# instead of 80, which is required for read-only fs and rootless runtimes.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# nginx-unprivileged uses UID 101 ("nginx").
USER root
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=101:101 /app/out /usr/share/nginx/html
USER 101

# Graceful shutdown — nginx interprets SIGQUIT as "finish in-flight requests".
STOPSIGNAL SIGQUIT

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
