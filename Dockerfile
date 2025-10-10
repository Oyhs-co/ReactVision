# Stage 1: Base image with pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Stage 2: Builder stage for installing dependencies
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Stage 3: Build stage for creating the Next.js application
FROM base AS build
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 4: Production runner stage
FROM node:20-alpine AS runner
WORKDIR /app
USER node

# Copy standalone output, public assets, and static files from the build stage
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["sh", "-c", "node server.js"]
