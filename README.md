# ReactiVision: Medidor de Tiempo de Reacción

<div align="center">
  <img src="https://raw.githubusercontent.com/Ivis-dev/reactivision/main/public/reactivision.png" alt="ReactiVision Screenshot" width="800">
  <br />
  <br />
  <p>
    <strong>ReactiVision</strong> es una aplicación web de alta precisión diseñada para medir el tiempo de reacción de un usuario en milisegundos.
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </p>
</div>

## Índice

- [ReactiVision: Medidor de Tiempo de Reacción](#reactivision-medidor-de-tiempo-de-reacción)
  - [Índice](#índice)
  - [Descripción General](#descripción-general)
  - [Características Principales](#características-principales)
  - [Arquitectura](#arquitectura)
    - [Flujo de Datos](#flujo-de-datos)
  - [Diseño](#diseño)
  - [Fórmulas](#fórmulas)
  - [Desarrollo](#desarrollo)
  - [Stack Tecnológico](#stack-tecnológico)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Instalación y Ejecución Local](#instalación-y-ejecución-local)
  - [Variables de Entorno](#variables-de-entorno)
  - [Despliegue en Railway (Recomendado)](#despliegue-en-railway-recomendado)
  - [Despliegue con Docker y Docker Compose](#despliegue-con-docker-y-docker-compose)
  - [Flujo de IA con Genkit y Gemini](#flujo-de-ia-con-genkit-y-gemini)
  - [Calidad de Código](#calidad-de-código)
  - [Mejoras Futuras](#mejoras-futuras)
  - [Contribuciones](#contribuciones)
  - [Código de Conducta](#código-de-conducta)
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

## Arquitectura

ReactiVision está construido con una arquitectura moderna y escalable, utilizando las siguientes tecnologías y patrones:

- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript
- **Librería UI:** React
- **Estilos:** Tailwind CSS con ShadCN/UI
- **Gestión de Estado:** React Hooks (`useState`, `useCallback`, `useEffect`) y Zustand para el estado global de calibración.
- **Base de Datos:** Supabase (PostgreSQL)
- **IA:** Google Gemini a través de Genkit
- **Despliegue:** Docker, Railway

### Flujo de Datos

1.  **Entrada de Usuario:** El usuario proporciona sus datos a través del componente `UserForm`, que se guardan en el almacenamiento local.
2.  **Calibración:** El componente `Calibration` utiliza el hook `useReactionTest` para medir el tiempo de reacción base del usuario y guarda los datos de calibración en el estado global.
3.  **Test de Reacción:** El componente `ReactionTest` también utiliza el hook `useReactionTest` para realizar el test de tiempo de reacción.
4.  **Resultados:** Los resultados del test se guardan en la base de datos de Supabase a través de las funciones `insertTest` y `insertAttempts` en `lib/supabase/api.ts`.
5.  **Análisis de IA:** El componente `Results` puede activar un análisis de IA de los resultados del test llamando a la función `getAiAnalysis`, que obtiene el análisis de la base de datos de Supabase.

## Diseño

El diseño de ReactiVision se centra en la usabilidad y la experiencia de usuario, con los siguientes principios:

- **Minimalismo:** Una interfaz limpia y despejada para minimizar las distracciones.
- **Feedback Visual:** Indicadores visuales claros, como barras de progreso, efectos de Foco y animaciones, para guiar al usuario.
- **Feedback Audible:** Una señal audible al inicio de cada test para mejorar la accesibilidad y la precisión.
- **Consistencia de Marca:** Una paleta de colores coherente que utiliza el color primario de la marca para los elementos interactivos.

## Fórmulas

La aplicación utiliza las siguientes fórmulas para calcular los resultados de los tests:

- **Mediana:** La mediana se utiliza para calcular el tiempo de reacción base del usuario durante la calibración, lo que proporciona una medida más robusta que la media.
- **Eliminación de Outliers:** Se utiliza un algoritmo de eliminación de outliers para eliminar los tiempos de reacción anómalos, asegurando que los resultados sean precisos.

## Desarrollo

- **Estilo de Código:** Sigue el estilo de código y el formato existentes, que se aplican con ESLint y Prettier.
- **Diseño de Componentes:** Los componentes deben ser pequeños, reutilizables y centrados en una única responsabilidad.
- **Gestión de Estado:** Utiliza el estado local siempre que sea posible. Para el estado compartido, considera la posibilidad de crear un hook personalizado. Para el estado global, utiliza el store `useCalibrationGate` o crea uno nuevo si es necesario.
- **Llamadas a la API:** Todas las llamadas a la API de Supabase deben realizarse en `lib/supabase/api.ts`.
- **Documentación:** Mantén la documentación en el código (JSDoc) actualizada con cualquier cambio.

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

## Mejoras Futuras

- **Análisis de IA Completo:** El análisis de IA "general" actual podría ampliarse para proporcionar un análisis más completo de todos los resultados del usuario, identificando tendencias y patrones a lo largo del tiempo.
- **Cuentas de Usuario y Persistencia de Datos:** La aplicación actualmente almacena los datos del usuario en el almacenamiento local. La implementación de cuentas de usuario permitiría a los usuarios guardar sus resultados y acceder a ellos desde diferentes dispositivos.
- **Calibración Más Sofisticada:** El proceso de calibración podría hacerse más sofisticado teniendo en cuenta otros factores, como la resolución de la pantalla y la frecuencia de actualización del usuario.
- **Gamificación:** Para que la aplicación sea más atractiva, se podrían añadir elementos de gamificación, como tablas de clasificación, logros y desafíos.
- **Accesibilidad:** La aplicación podría ser más accesible para los usuarios con discapacidades añadiendo funciones como el soporte para lectores de pantalla y la navegación por teclado.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir a este proyecto, por favor sigue estos pasos:

1.  Haz un fork del repositorio.
2.  Crea una nueva rama para tu feature (`git checkout -b feature/nueva-feature`).
3.  Realiza tus cambios y haz commit (`git commit -m 'Añade nueva feature'`).
4.  Haz push a tu rama (`git push origin feature/nueva-feature`).
5.  Abre un Pull Request.

## Código de Conducta

Este proyecto se adhiere al [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md).

## Licencia

Este proyecto se distribuye bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.
