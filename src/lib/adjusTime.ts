/**
 * Utilidades de ajuste de tiempo para normalizar tiempos de reacción.
 * @module adjustTime
 */

import { IDEAL_MEDIAN } from './stats';

/**
 * Ajusta el tiempo de reacción bruto eliminando la latencia del dispositivo y escalando a la mediana ideal.
 * Esto normaliza los tiempos entre diferentes dispositivos y usuarios para una mejor comparación.
 *
 * Fórmula: ajustado = (bruto - latenciaDispositivo) * (MEDIANA_IDEAL / medianaUsuario)
 *
 * @param raw - Tiempo de reacción bruto en milisegundos
 * @param deviceLatency - Latencia de entrada del dispositivo medida en milisegundos
 * @param userMedian - Tiempo de reacción mediano base del usuario de la calibración
 * @returns Tiempo de reacción ajustado, limitado a mínimo 0
 */
export function adjustTime(
  raw: number,
  deviceLatency: number,
  userMedian: number
): number {
  return Math.max(
    0,
    (raw - deviceLatency) * (IDEAL_MEDIAN / Math.max(1, userMedian))
  );
}