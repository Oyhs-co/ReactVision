# Utilizar la imagen oficial de Node.js
FROM node:18-slim AS base

# Instalar pnpm
RUN npm install -g pnpm

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN pnpm build

# Iniciar la aplicación
CMD ["pnpm", "start"]

# Exponer el puerto 3000
EXPOSE 3000