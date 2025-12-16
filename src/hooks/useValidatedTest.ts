/**
 * Hook para gestionar pruebas de tiempo de reacción validadas.
 * Maneja la validación de intentos, detección de fallos y lógica de finalización de pruebas.
 * @module useValidatedTest
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AttemptDetail } from '@/types';

/** Número requerido de intentos válidos para completar la prueba */
const REQUIRED_VALID = 5;
/** Número máximo total de intentos permitidos */
const MAX_ATTEMPTS = 10;

/**
 * Estado interno para el hook de prueba validada.
 */
interface State {
  /** Array de detalles de intentos */
  details: AttemptDetail[];
  /** Número de intento actual (basado en 0) */
  attempt: number;
  /** Estado actual de la prueba */
  status: 'idle' | 'running' | 'summary';
}

/**
 * Hook que gestiona el estado y la lógica para una prueba de tiempo de reacción validada.
 * Asegura que se recopilen intentos válidos mínimos antes de la finalización.
 *
 * Nota: Si los criterios de validación cambian (por ejemplo, el número requerido de intentos
 * o los límites de tiempo válidos), actualiza `REQUIRED_VALID` y añade pruebas unitarias
 * en `src/lib/__tests__/` que cubran los bordes.
 *
 * @param onComplete - Callback activado cuando la prueba se completa con intentos válidos
 * @returns Objeto con state, función addAttempt, función finish y setState
 */
export function useValidatedTest(onComplete: (details: AttemptDetail[]) => void) {
  const [state, setState] = useState<State>({ details: [], attempt: 0, status: 'idle' });
  const { toast } = useToast();

  /**
   * Agrega un nuevo intento al estado de la prueba.
   * Transita automáticamente al resumen cuando se cumplen los requisitos.
   */
  const addAttempt = useCallback(
    (detail: AttemptDetail) => {
      setState((s) => {
        const details = [...s.details, detail];
        const validCount = details.filter((d) => !d.wasFault).length;
        const newAttempt = s.attempt + 1;

        if (validCount >= REQUIRED_VALID || newAttempt >= MAX_ATTEMPTS) {
          return { ...s, details, status: 'summary' };
        }
        return { ...s, details, attempt: newAttempt };
      });
    },
    []
  );

  /**
   * Finaliza la prueba, verificando intentos válidos suficientes.
   * Muestra toast de error y reinicia si son insuficientes.
   */
  const finish = () => {
    // Use functional setState so we always operate on the latest state snapshot
    setState((s) => {
      const valid = s.details.filter((d) => !d.wasFault);
      if (valid.length < REQUIRED_VALID) {
        toast({
          variant: 'destructive',
          title: 'Intentos válidos insuficientes',
          description: `Se necesitan ${REQUIRED_VALID} válidos, se obtuvieron ${valid.length}. Inténtalo de nuevo.`,
        });
        return { details: [], attempt: 0, status: 'idle' };
      }

      // Enough valid attempts — call onComplete with the finalized details
      onComplete(s.details);
      return s;
    });
  };

  return { state, addAttempt, finish, setState };
}