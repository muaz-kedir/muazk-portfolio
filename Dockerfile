# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# Mukti Portfolio + CMS — production image
#
#   docker build -t portifol .
#   docker run -p 3000:3000 --env-file .env portifol
#
# The runner keeps the full node_modules so that `npm run db:deploy`
# (prisma migrate deploy) can run inside the container.
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat openssl

# --- dependencies -----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npm ci
# --- build ------------------------------------------------------------------
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# --- runtime ----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    UPLOAD_DIR=/app/public/uploads \
    PRIVATE_UPLOAD_DIR=/app/private

COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/.next         ./.next
COPY --from=builder /app/public       ./public
COPY --from=builder /app/src          ./src
COPY --from=builder /app/scripts      ./scripts
COPY --from=builder /app/prisma       ./prisma
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

RUN mkdir -p /app/public/uploads /app/private && chown -R node:node /app
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

CMD ["npm", "run", "start"]
