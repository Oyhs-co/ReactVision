# Contribuir y Desarrollo — ReactiVision

Este archivo ofrece notas rápidas para mantener y extender el proyecto.

## Flujo de desarrollo

- Instala dependencias: `pnpm install`
- Ejecuta en modo dev: `pnpm dev` (por defecto servidor en `http://localhost:9002`)
- Build de producción: `pnpm build`
- Formateo y lint: `pnpm run lint`
- Typecheck: `pnpm run typecheck`

## Estructura y responsabilidades

- `src/app`: Páginas (App Router)
- `src/components`: Componentes UI principales (`reaction-test`, `calibration`, `results`)
- `src/hooks`: Hooks personalizados (estado de calibración, lógica de tests)
- `src/lib`: Helpers y utilidades (latencia, estadísticas, Supabase API)
- `src/ai`: Flujos de Genkit / Gemini

## Reglas y convenciones

- TypeScript: usa tipos explícitos y evita `any`.
- Hooks: respeta reglas de Hooks (siempre llamarlos en el mismo orden)
- Tests: Agregar pruebas unitarias en `src/lib/__tests__` para utilidades y lógica crítica

## Ejemplos rápidos

Uso de `useReactionTest`:

```ts
const { start, react, reset } = useReactionTest((details) => {
  // `details` es AttemptDetail[] con tiempos y fallos
  console.log('Test completo:', details);
});

// start(); // inicia la secuencia
// react(); // simula reacción (p. ej. desde onClick)
```

Uso de `useCalibrationGate` (store de Zustand):

```ts
const { calibrated, deviceLatency, calibratedMedian, setCalibrated, reset } = useCalibrationGate();

// setCalibrated(20, 180); // marca como calibrado con latencia y mediana del usuario
// reset(); // vuelve a estado sin calibrar
```

## Base de datos (Supabase)

Si cambias la estructura de la tabla `reaction_tests`, actualiza también:
- `src/lib/supabase/supabase.types.ts`
- `src/lib/supabase/api.ts` (mapeos en `getTests`, `insertTest`)

## Buenas prácticas para PRs

- Ejecuta `pnpm run lint` y `pnpm run typecheck` antes de abrir PR
- Añade cobertura de tests para cambios en lógica (calibración, cálculo de promedios)
- Documenta cambios en `DEVELOPING.md` o en el README cuando afecten al flujo de despliegue

---

Si necesitas ayuda con la integración de IA (Genkit/Gemini), revisa `src/ai/flows/process-reaction-data.ts` para entender cómo se consume el CSV y se genera el análisis.