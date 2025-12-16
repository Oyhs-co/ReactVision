# ReactiVision: Medidor de Tiempo de Reacción

ReactiVision es una aplicación web de alta precisión diseñada para medir el tiempo de reacción de un usuario en milisegundos. Construida con un stack moderno que incluye **Next.js (App Router)**, **React**, y **TailwindCSS + ShadCN/UI**, la aplicación ofrece una experiencia de usuario fluida y reactiva. La persistencia de datos se gestiona a través de **Supabase**, y se ha integrado un flujo de análisis avanzado con **IA (Genkit + Google Gemini)** para el procesamiento de los resultados.

![ReactiVision Screenshot](https://raw.githubusercontent.com/Ivis-dev/reactivision/main/public/reactivision.png)

## Índice

- [ReactiVision: Medidor de Tiempo de Reacción](#reactivision-medidor-de-tiempo-de-reacción)
  - [Índice](#índice)
  - [Descripción General](#descripción-general)
  - [Características Principales](#características-principales)
  - [Stack Tecnológico](#stack-tecnológico)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Instalación y Ejecución Local](#instalación-y-ejecución-local)
  - [Variables de Entorno](#variables-de-entorno)
  - [Despliegue en Railway (Recomendado)](#despliegue-en-railway-recomendado)
  - [Despliegue con Docker y Docker Compose](#despliegue-con-docker-y-docker-compose)
  - [Flujo de IA con Genkit y Gemini](#flujo-de-ia-con-genkit-y-gemini)
  - [Calidad de Código](#calidad-de-código)
  - [Licencia](#licencia)

## Descripción General

ReactiVision va más allá de una simple medición. Permite a los usuarios:

- **Calibrar** su tiempo de reacción base para obtener mediciones más precisas.
- Realizar **tests de reacción** compuestos por múltiples intentos.
- Registrar **datos contextuales** como edad, género, y fatiga visual.
- **Visualizar** resultados detallados, incluyendo promedios y promedios calibrados.
- **Exportar** los datos de los tests a formato **CSV**.
- Utilizar un **flujo de IA** para analizar y procesar los datos exportados, obteniendo insights adicionales.

## Características Principales

- **Test de Reacción**: 5 intentos por prueba con control de tiempos válidos e inválidos.
- **Calibración Personalizada**: Establece una línea base para corregir y contextualizar los resultados.
- **Tabla de Resultados**: Historial de tests con promedios, promedios calibrados y número de fallos.
- **Exportación a CSV**: Genera un dataset plano con todos los datos de un test para su análisis externo.
- **Análisis con IA**: Un flujo de Genkit que utiliza Gemini para procesar el CSV y generar un análisis curado.
- **UI Moderna y Responsiva**: Desarrollada con ShadCN/UI, Radix, y TailwindCSS, con modo oscuro por defecto.

## Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript.
- **UI**: TailwindCSS, ShadCN/UI, Radix UI.
- **Persistencia de Datos**: Supabase (PostgreSQL).
- **Inteligencia Artificial**: Genkit, Google Gemini.
- **Contenerización**: Docker (multi-stage build).
- **Gestor de Paquetes**: pnpm.

## Estructura del Proyecto

```text
/ 
├── src/
│   ├── app/                # Rutas y páginas de Next.js
│   ├── components/         # Componentes de React (ReactionTest, Calibration, Results)
│   ├── lib/                # Librerías y helpers (API de Supabase)
│   └── ai/                 # Flujos de IA con Genkit
├── public/                 # Archivos estáticos
├── .env.example            # Ejemplo de variables de entorno
├── Dockerfile              # Configuración para la imagen de producción
├── next.config.ts          # Configuración de Next.js (output: 'standalone')
└── package.json            # Dependencias y scripts
```

## Instalación y Ejecución Local

**Requisitos Previos**:
- Node.js (v20.x o superior)
- pnpm (instalado vía `corepack enable`)
- Un proyecto en [Supabase](https://supabase.com/) para las credenciales de la base de datos.
- Una clave API de [Google AI (Gemini)](https://aistudio.google.com/).

**Pasos**:
1. Clona el repositorio:

   ```bash
   git clone https://github.com/Ivis-dev/reactivision.git
   cd reactivision
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   ```

3. Configura las variables de entorno. Crea un archivo `.env` a partir de `.env.example` y añade tus claves.
4. Ejecuta la aplicación en modo de desarrollo:

   ```bash
   pnpm dev
   ```
   La aplicación estará disponible en `http://localhost:9002`.

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# URL pública de tu proyecto en Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co

# Clave anónima (pública) de tu proyecto en Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>

# Clave de administrador para operaciones sensibles (ej. borrar datos)
NEXT_PUBLIC_ADMIN_KEY=<tu-clave-admin>

# Clave API para el servicio de IA de Google (Gemini)
GEMINI_API_KEY=<tu-api-key>
```

## Despliegue en Railway (Recomendado)

Railway es una plataforma de despliegue moderna que simplifica enormemente el proceso de llevar una aplicación a producción. Gracias al `Dockerfile` incluido en este repositorio, el despliegue en Railway es un proceso rápido y sencillo.

**Pasos para el despliegue:**

1. **Haz un Fork** de este repositorio en tu cuenta de GitHub.
2. Ve a tu [Dashboard de Railway](https://railway.app/dashboard) y haz clic en **"New Project"**.
3. Selecciona **"Deploy from GitHub repo"** y elige el fork de `reactivision` que acabas de crear.
4. Railway detectará automáticamente el `Dockerfile` y comenzará a construir la imagen de producción.
5. **Configura las variables de entorno**:
    - En el dashboard de tu nuevo proyecto en Railway, ve a la pestaña **"Variables"**.
    - Añade las siguientes variables de entorno con tus claves correspondientes:
        - `NEXT_PUBLIC_SUPABASE_URL`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        - `NEXT_PUBLIC_ADMIN_KEY`
        - `GEMINI_API_KEY`
    - Railway guardará y aplicará estas variables automáticamente.
6. **Configura el puerto de red**:
    - Ve a la pestaña **"Settings"** de tu servicio.
    - En la sección **"Networking"**, asegúrate de que el puerto expuesto sea el `3000`. Railway generalmente maneja esto de forma automática, pero es bueno verificarlo.
7. Una vez que el despliegue finalice, Railway te proporcionará una URL pública donde tu aplicación estará en vivo.

## Despliegue con Docker y Docker Compose

Para facilitar el desarrollo y las pruebas locales en un entorno similar al de producción, el proyecto incluye un archivo `docker-compose.yml` optimizado. Este archivo utiliza el `Dockerfile` multi-stage para construir y ejecutar la aplicación.

**Pasos para ejecutar con Docker Compose:**

1. **Crea un archivo `.env`**: Asegúrate de tener un archivo `.env` en la raíz del proyecto con todas las variables de entorno necesarias (puedes basarte en `.env.example`).
2. **Construye la imagen**:

    ```bash
    docker-compose build
    ```

    Este comando leerá el `Dockerfile` y construirá la imagen de producción.
3. **Inicia el servicio**:

    ```bash
    docker-compose up
    ```

    La aplicación estará disponible en `http://localhost:3000`. El servicio se reiniciará automáticamente si se detiene de forma inesperada.

El `Dockerfile` está estructurado en múltiples etapas para crear una imagen final ligera y segura:

- **Stage 1 (base)**: Configura `pnpm`.
- **Stage 2 (builder)**: Instala las dependencias de producción.
- **Stage 3 (build)**: Construye la aplicación Next.js con `output: 'standalone'`.
- **Stage 4 (runner)**: Copia solo los artefactos necesarios a una imagen ligera de Node.js.

## Flujo de IA con Genkit y Gemini

El archivo `src/ai/flows/process-reaction-data.ts` contiene la lógica para el procesamiento de datos con IA.

- **Entrada**: Recibe un archivo CSV con los datos de un test de reacción.
- **Proceso**: Invoca al modelo de IA de **Google Gemini** para limpiar, analizar y transformar los datos.
- **Salida**: Devuelve un CSV procesado y un análisis de texto de los resultados.

Este flujo se puede ejecutar por separado para desarrollo y pruebas con los scripts de Genkit disponibles en `package.json`.

## Calidad de Código

El proyecto está configurado con **ESLint** y **TypeScript** para asegurar la calidad y mantenibilidad del código. Para verificar el código, puedes ejecutar:
```bash
pnpm run lint
pnpm run typecheck
```

## Licencia

Este proyecto se distribuye bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.
