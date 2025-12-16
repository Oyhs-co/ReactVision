/**
 * Tipos de dominio comunes para ReactiVision
 * @module types
 */

/**
 * Representa el género de un usuario para la recopilación de datos demográficos.
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * Detalles de un único intento de tiempo de reacción.
 */
export interface AttemptDetail {
  /** Tiempo de reacción bruto en milisegundos */
  time: number;
  /** Si este intento fue considerado un fallo (demasiado rápido o lento) */
  wasFault: boolean;
  /** Retraso usado entre las señales amarilla y verde en milisegundos */
  delayUsed: number;
}

/**
 * Resultado completo de una sesión de prueba de tiempo de reacción.
 */
export interface Result {
  /** Identificador único para el resultado de la prueba */
  id: number;
  /** Array de todos los intentos realizados durante la prueba */
  attempts: AttemptDetail[];
  /** Tiempo de reacción promedio de intentos válidos en milisegundos */
  average: number;
  /** Número de intentos fallidos */
  faults: number;
  /** Marca de tiempo ISO cuando se completó la prueba */
  timestamp: string;
  /** Edad del usuario en el momento de la prueba */
  age: number;
  /** Si el usuario usa gafas */
  wearsGlasses: boolean;
  /** Género del usuario */
  gender: Gender;
  /** Nivel de fatiga visual auto-reportado (1-10) */
  visualFatigue: number;
  /** Latencia de entrada del dispositivo medida durante la calibración en milisegundos */
  deviceLatency?: number;
  /** Tiempo de reacción mediano base del usuario de la calibración en milisegundos */
  calibratedMedian?: number;
}