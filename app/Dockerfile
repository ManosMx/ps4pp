# ── Stage 1: Install dependencies ──
FROM node:20-bullseye AS deps
WORKDIR /app
# Install dependencies for Bun
RUN apt-get update && apt-get install -y curl bash
COPY package.json bun.lock ./
RUN curl -fsSL https://bun.sh/install | bash
RUN export PATH="/root/.bun/bin:$PATH"
RUN bun install --frozen-lockfile

# ── Stage 2: Build the Next.js app ──
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (overridden at runtime via docker-compose)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN bun build

# ── Stage 3: Production image ──
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone output + static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
