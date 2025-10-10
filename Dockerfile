# Etapa 1: Base con pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Etapa 2: Instalar dependencias
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Etapa 3: Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Etapa final (runner)
FROM base AS runner
WORKDIR /app

# Copiar desde 'build', que sí tiene todos los archivos
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

# node_modules ya está en .next/standalone si usas standalone,
# pero si NO usas standalone, también necesitas copiarlo:
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["pnpm", "start"]