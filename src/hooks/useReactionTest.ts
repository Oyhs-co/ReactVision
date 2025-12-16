/**
 * Hook para gestionar secuencias de pruebas de tiempo de reacción con retrasos aleatorios.
 * Maneja la lógica de temporización para intentos de calibración y pruebas.
 * @module UseReactionTest
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AttemptDetail } from '@/types';

/** Número total de intentos en una secuencia de prueba */
const TOTAL = 5;
/** Tiempo mínimo de reacción válido en milisegundos */
const MIN = 80;
/** Tiempo máximo de reacción válido en milisegundos */
const MAX = 2000;

/**
 * Estado interno para el hook de prueba de reacción.
 */
interface State {
  /** Estado actual de la secuencia de prueba */
  status: 'idle' | 'ready' | 'waiting' | 'react' | 'result' | 'fault' | 'summary';
  /** Número de intento actual (basado en 1) */
  attempt: number;
  /** Último tiempo de reacción registrado */
  lastTime: number;
  /** Marca de tiempo de inicio para el intento actual (cuando entra en 'react') */
  start?: number;
  /** Delay planificado para el intento actual */
  delay?: number;
  /** Array de detalles de intentos */
  details: AttemptDetail[];
}

/**
 * Hook que gestiona una prueba de tiempo de reacción con retrasos aleatorios entre intentos.
 * Usado tanto para calibración como para pruebas principales, con soporte de teclado y clic.
 *
 * @param onComplete - Callback activado cuando se completan todos los intentos
 * @returns Objeto con state, función start, función react y función reset
 */
/**
 * useReactionTest
 * ----------------
 * Hook that manages a single reaction-test sequence for calibration or a regular test.
 * It handles timing, random delays, keyboard listener and completion callback.
 * Important notes:
 * - The hook uses internal timers stored in a ref and clears them on unmount.
 * - `onComplete` is called with the final `AttemptDetail[]` when the sequence finishes.
 *
 * @example
 * const { state, start, react, reset } = useReactionTest((details) => console.log(details));
 */
export function useReactionTest(onComplete: (details: AttemptDetail[]) => void) {
  const [state, setState] = useState<State>({
    status: 'idle',
    attempt: 1,
    lastTime: 0,
    details: [],
  });

  const timers = useRef<Record<string, number>>({});

  /**
   * Limpia un temporizador específico y lo elimina de la ref.
   */
  const clear = useCallback((k: string) => {
    window.clearTimeout(timers.current[k]);
    delete timers.current[k];
  }, []);

  /**
   * Inicia la secuencia de prueba entrando en estado listo.
   */
  const start = useCallback(() => {
    setState((s) => ({ ...s, status: 'ready' }));
    timers.current.ready = window.setTimeout(() => {
      setState((st) => ({ ...st, status: 'waiting' }));
      const delay = Math.random() * 3000 + 2000;
      timers.current.wait = window.setTimeout(() => {
        setState((st) => ({ ...st, status: 'react', start: performance.now(), delay }));
      }, delay);
    }, 1000);
  }, []);

  /**
   * Maneja la entrada de reacción del usuario (clic o barra espaciadora).
   * Registra el tiempo y avanza al siguiente intento o completa la prueba.
   */
  const react = useCallback(() => {
    if (state.status === 'ready' || state.status === 'waiting') {
      clear('ready');
      clear('wait');
      const fault: AttemptDetail = {
        time: 0,
        wasFault: true,
        // If user clicks early (while waiting), we don't reliably have the planned delay stored; use 0
        delayUsed: 0,
      };
      setState((s) => ({
        ...s,
        status: 'fault',
        details: [...s.details, fault],
      }));
      timers.current.next = window.setTimeout(() => {
        if (state.attempt < TOTAL) {
          setState((s) => ({ ...s, attempt: s.attempt + 1 }));
          start();
        } else {
          setState((s) => ({ ...s, status: 'summary' }));
        }
      }, 1500);
      return;
    }

    if (state.status === 'react') {
      const raw = performance.now() - (state.start ?? 0);
      const ok = raw >= MIN && raw <= MAX;
      const detail: AttemptDetail = {
        time: raw,
        wasFault: !ok,
        delayUsed: state.delay ?? 0,
      };
      const nextDetails = [...state.details, detail];
      setState((s) => ({
        ...s,
        lastTime: raw,
        details: nextDetails,
        status: ok ? 'result' : 'fault',
      }));
      timers.current.next = window.setTimeout(() => {
        if (state.attempt < TOTAL) {
          setState((s) => ({ ...s, attempt: s.attempt + 1 }));
          start();
        } else {
          setState((s) => ({ ...s, status: 'summary' }));
          onComplete(nextDetails);
        }
      }, 1500);
    }
  }, [state, start, onComplete, clear]);

  /* Oyente de eventos de teclado para barra espaciadora */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        react();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [react]);

  /* Limpieza de temporizadores al desmontar */
  useEffect(
    () => () => Object.values(timers.current).forEach((t) => window.clearTimeout(t)),
    []
  );

  /**
   * Reinicia el estado de la prueba al estado inicial inactivo.
   */
  const reset = () => setState({
    status: 'idle',
    attempt: 1,
    lastTime: 0,
    details: [],
  });

  return { state, start, react, reset };
}