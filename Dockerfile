# Utilizar una imagen oficial de Node.js con menor superficie de ataque
FROM node:18-alpine AS base

# Instalar pnpm de forma segura
RUN corepack enable && corepack prepare pnpm@latest --activate

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias sin modificar el lockfile
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN pnpm build

# Usar usuario no root para mayor seguridad
USER node

# Exponer el puerto
EXPOSE 3000

# Comando de inicio
CMD ["pnpm", "start"]
