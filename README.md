# ReactiVision

Aplicación web para medición de tiempo de reacción con precisión milisegundo, construida con Next.js (App Router), React, Tailwind + ShadCN/UI, y persistencia en Supabase. Incluye calibración personalizada, ejecución de tests, exportación a CSV y un flujo de procesamiento asistido por IA (Genkit + Google Gemini) para análisis avanzados de los resultados.


## Índice
- Descripción general
- Características
- Arquitectura y stack
- Estructura del proyecto
- Modelo de datos (Supabase)
- Instalación y ejecución local
- Variables de entorno
- Flujo de IA (Genkit + Gemini)
- Exportación de resultados (CSV)
- Despliegue con Docker
- Calidad de código (ESLint/TypeScript)
- Resolución de problemas (Troubleshooting)
- Seguridad y consideraciones
- Licencia
- Referencias


## Descripción general
ReactiVision permite:
- Calibrar el tiempo de reacción base de una persona.
- Ejecutar pruebas compuestas por múltiples intentos.
- Registrar datos contextuales (edad, género, uso de gafas, fatiga visual).
- Visualizar resultados, promedios y promedios calibrados.
- Exportar datos detallados por intento a CSV.
- Procesar el dataset con IA para obtener análisis adicionales y curación del CSV.


## Características
- Test de reacción: 5 intentos por test con control de tiempos válidos e inválidos.
- Calibración: establece una línea base personalizada para corrección posterior.
- Resultados: tabla con historial, promedio, promedio calibrado y fallos.
- Exportación a CSV: dataset plano con fila por intento y metadatos del test.
- Procesamiento con IA: flujo Genkit que invoca Gemini para generar un CSV procesado.
- UI moderna: ShadCN/UI + Radix, responsive, modo oscuro predeterminado.


## Arquitectura y stack
- Frontend: Next.js 15 (App Router), React 18, TypeScript, TailwindCSS, ShadCN/UI, Radix.
- Persistencia: Supabase (PostgreSQL + PostgREST), tipado generado en src/lib/supabase/supabase.types.ts.
- AI: Genkit + @genkit-ai/google-genai (Google Gemini).
- Gráficas: Recharts (cuando aplica).
- Construcción/ejecución: pnpm, Docker multi-stage, output standalone de Next.


## Estructura del proyecto
- src/app/page.tsx: página principal, orquesta calibración, test y resultados.
- src/components/reaction-test.tsx: motor del test (estados, delays, validación, resumen).
- src/components/calibration.tsx: reusa ReactionTest y delega promedio a la página.
- src/components/results.tsx: tabla, exportación CSV y disparador de análisis por IA.
- src/lib/supabase/api.ts: funciones para CRUD con Supabase (tests, intentos, análisis IA).
- src/lib/supabase/supabase.types.ts: tipos inferidos de la BD.
- src/ai/flows/process-reaction-data.ts: flujo Genkit para procesar CSV con Gemini.


## Modelo de datos (Supabase)
Tablas principales (ver src/lib/supabase/supabase.types.ts):
- public.reaction_tests
  - id (number, PK)
  - timestamp (string ISO)
  - age (number)
  - gender (string: 'male' | 'female' | 'other')
  - wears_glasses (boolean)
  - visual_fatigue (number)
  - average_time (number)
  - calibrated_average (number)
  - faults (number)
  - created_at (string ISO)
- public.attempts
  - id (number, PK)
  - test_id (number, FK reaction_tests.id)
  - attempt_number (number)
  - time (number)
  - was_fault (boolean)
  - delay_used (number)
  - created_at (string ISO)
- public.ai_analysis
  - id (number, PK)
  - test_id (number, FK reaction_tests.id)
  - analysis_text (string)
  - processed_data (string, contenido CSV procesado)
  - created_at (string ISO)

Nota: también se expone una función RPC reset_sequence para reiniciar secuencias de IDs tras limpieza de datos.


## Instalación y ejecución local
Requisitos previos:
- Node.js LTS
- pnpm (Corepack recomendado): npm i -g corepack && corepack enable
- Cuenta y proyecto en Supabase (credenciales públicas URL y ANON KEY)
- Clave API de Google AI (Gemini) si se usará el flujo de IA

Pasos:
1) Instalar dependencias
   pnpm install

2) Configurar variables de entorno (ver sección Variables de entorno)
   Crear .env en la raíz con las claves necesarias.

3) Ejecutar en desarrollo (puerto 9002)
   pnpm dev

4) Compilar y arrancar en modo producción
   pnpm build
   pnpm start


## Variables de entorno
Definir en .env según el entorno (desarrollo/producción):
- NEXT_PUBLIC_SUPABASE_URL: URL del proyecto Supabase (pública)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: clave ANON pública de Supabase
- NEXT_PUBLIC_ADMIN_KEY: clave admin para operaciones sensibles (por ejemplo, borrar todos los datos)
- GEMINI_API_KEY: clave de Google AI Studio para usar Gemini en el flujo de IA

Ejemplo .env
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyXXXX
NEXT_PUBLIC_ADMIN_KEY=admin-strong-key
GEMINI_API_KEY=AIzaXXXX


## Flujo de IA (Genkit + Gemini)
Archivo: src/ai/flows/process-reaction-data.ts
- Entrada: CSV generado localmente con ALL_FIELDS y parámetros (initialDelay, selectedFields).
- Proceso: se delega a Gemini para limpiar, transformar y devolver un CSV procesado.
- Persistencia: resultados se guardan opcionalmente en public.ai_analysis (campo processed_data).

Requisitos:
- GEMINI_API_KEY en el entorno.
- El comando de desarrollo de Genkit está disponible en package.json (genkit:dev, genkit:watch) si se desea ejecutar el flujo por separado.


## Exportación de resultados (CSV)
- El CSV base contiene una fila por intento y metadatos del test.
- Columnas predeterminadas (ALL_FIELDS):
  - Test ID, Timestamp, Age, Gender, Wears Glasses, Visual Fatigue
  - Average Time (ms), Calibrated Average (ms), Faults
  - Attempt Number, Attempt Time (ms), Was Fault, Delay Used (ms)
- El procesamiento con IA permite reordenar/filtrar columnas y aplicar transformaciones simples.


## Despliegue con Docker
El proyecto incluye Dockerfile multi-stage y docker-compose.yml de ejemplo.

Construir y ejecutar con Docker Compose:
- Definir variables en el entorno del host o en un archivo .env.
- Construcción
  docker-compose build
- Arranque
  docker-compose up -d
- Acceso
  http://localhost:3000 (por defecto)

Notas:
- Dockerfile usa Node 18-alpine + corepack (pnpm). El build se realiza con pnpm build y Next output standalone.
- Se ejecuta como usuario node sin privilegios root y expone el puerto 3000.


## Calidad de código (ESLint/TypeScript)
- Linter: next lint (ESLint + reglas Next/TypeScript). Ejecutar con
  pnpm run lint
- Se han corregido advertencias comunes: dependencias de hooks, tipos de errores desconocidos, uso de any, prefer-const, contenido no escapado en JSX, etc.
- El build de Next puede ignorar errores de TypeScript y ESLint en producción mediante next.config.js:
  typescript.ignoreBuildErrors = true
  eslint.ignoreDuringBuilds = true
  Recomendación: mantener el linter en cero y corregir los tipos cuando sea posible.


## Resolución de problemas (Troubleshooting)
- TypeError/TS sobre IDs de Supabase
  Los IDs se tipan como number. Evita parseInt sobre valores number; usar Number(id) o directamente id.
- ReferenceError: Cannot access 'resetTest' before initialization
  Asegurar que hooks useEffect no importan o referencian constantes useCallback antes de su inicialización. Se reordenó resetTest para declararse antes del useEffect que lo usa.
- next lint falla
  Ejecutar pnpm run lint para ver los errores. Se priorizó eliminar any, usar unknown con guards, ajustar dependencias de hooks, y escapar caracteres en JSX.
- Exportación CSV en navegadores restringidos
  Se intenta usar el File System Access API (showSaveFilePicker) y, en caso de fallo, se recurre a un enlace de descarga de objeto Blob.


## Seguridad y consideraciones
- No expongas claves sensibles del lado cliente. Las claves de Supabase públicas (URL/ANON) son seguras para lectura controlada por RLS.
- Configura reglas RLS y políticas en Supabase si expones endpoints públicamente.
- Protege NEXT_PUBLIC_ADMIN_KEY y compártela solo con operadores autorizados (usada para borrar datos masivamente).
- Considera almacenar claves privadas (si las hubiera) solo en el servidor o usar un gestor de secretos.


## Licencia
Este proyecto se distribuye bajo la licencia MIT. Ver archivo LICENSE en la raíz del repositorio.


## Referencias
- Next.js: https://nextjs.org/docs
- React: https://react.dev/learn
- Tailwind CSS: https://tailwindcss.com/docs
- ShadCN/UI: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com/primitives
- Supabase: https://supabase.com/docs
- Genkit: https://firebase.google.com/docs/genkit
- Google AI Studio (Gemini): https://aistudio.google.com
- Recharts: https://recharts.org/en-US
