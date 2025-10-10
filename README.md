# ReactVision - Medidor de Tiempo de Reacción de Precisión

ReactiVision es una aplicación web construida con Next.js, React y ShadCN/UI, diseñada para medir el tiempo de reacción de un usuario con alta precisión. La aplicación incluye funcionalidades para calibrar una línea base personal, realizar series de tests y exportar los resultados para su análisis, incluyendo un procesador de datos asistido por IA (Genkit y Gemini).

![Captura de pantalla de la aplicación ReactiVision](https://placehold.co/800x450/232323/FFF?text=ReactiVision+App)

## Características Principales

- **Test de Reacción:** Una serie de 5 intentos donde el usuario debe reaccionar a un estímulo visual.
- **Calibración:** Establece un tiempo de reacción promedio base para el usuario, permitiendo mediciones más personalizadas.
- **Formulario de Datos de Usuario:** Recopila información contextual (edad, género, fatiga visual) para enriquecer los resultados.
- **Tabla de Resultados:** Muestra un historial de todos los tests realizados, con promedios y promedios calibrados.
- **Exportación a CSV:** Permite descargar todos los datos, incluyendo detalles por intento, en formato CSV.
- **Procesador con IA:** Utiliza Google Gemini a través de Genkit para procesar los datos exportados, permitiendo al usuario seleccionar campos y ajustar valores.
- **Diseño Responsivo:** Interfaz limpia y funcional que se adapta a diferentes tamaños de pantalla, con modo oscuro por defecto.

## Estructura del Proyecto

La aplicación sigue una estructura de componentes moderna basada en el App Router de Next.js.

- `src/app/page.tsx`: El componente principal que gestiona el estado global (resultados, calibración, datos del usuario).
- `src/components/reaction-test.tsx`: El núcleo interactivo que maneja la lógica de un test completo.
- `src/components/calibration.tsx`: Componente que reutiliza `ReactionTest` para el proceso de calibración.
- `src/components/results.tsx`: Muestra la tabla de resultados, gestiona la exportación y la interacción con la IA.
- `src/ai/flows/process-reaction-data.ts`: Flujo de Genkit que define la lógica de procesamiento de datos con el modelo de lenguaje.
- `src/components/ui/`: Componentes de UI de ShadCN.

Para más detalles, consulta el archivo `Arquitectura.md`.

## Cómo Empezar (Ejecución Local)

Para ejecutar este proyecto en tu máquina local, sigue estos pasos:

### 1. Requisitos Previos

- **Node.js:** (Se recomienda la versión LTS) - [Descargar aquí](https://nodejs.org/).
- **pnpm:** Un gestor de paquetes rápido y eficiente. Puedes instalarlo con `npm install -g pnpm`.
- **Clave de API de Google AI:** Necesaria para la funcionalidad de IA. Puedes obtener una gratuita en [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Instalación

Clona el repositorio y, desde la carpeta raíz del proyecto, instala las dependencias necesarias con pnpm:

```bash
pnpm install
```

### 3. Configuración del Entorno

Esta es la adaptación más importante que debes hacer. Crea un archivo llamado `.env` en la raíz del proyecto. Este archivo guardará tu clave de API de forma segura.

Añade la siguiente línea al archivo `.env`, reemplazando `"TU_CLAVE_DE_API_AQUÍ"` con tu clave real:

```
GEMINI_API_KEY="TU_CLAVE_DE_API_AQUÍ"
```

El archivo `.env` es ignorado por Git, por lo que tu clave no se subirá al repositorio.

### 4. Ejecutar el Servidor de Desarrollo

Una vez completada la instalación y configuración, inicia la aplicación:

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:9002` (o el puerto que se indique en la terminal).

---
