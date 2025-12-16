/**
 * Utilidades estadísticas para el análisis de tiempos de reacción.
 * @module stats
 */

/** Tiempo de reacción mediano ideal en milisegundos para referencia de calibración */
export const IDEAL_MEDIAN = 250;

/**
 * Calcula la mediana de un array de números.
 * @param arr - Array de números para calcular la mediana
 * @returns El valor mediano, o NaN si el array está vacío
 */
export const median = (arr: number[]): number => {
  if (!arr.length) return NaN;
  const nums = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

/**
 * Calcula la Desviación Absoluta Mediana (MAD) de un array.
 * MAD es una medida robusta de dispersión estadística.
 * @param arr - Array de números
 * @returns El valor MAD
 */
export const mad = (arr: number[]): number => {
  const med = median(arr);
  return median(arr.map(v => Math.abs(v - med)));
};

/**
 * Elimina valores atípicos de un array usando filtrado basado en mediana y MAD.
 * @param arr - Array de números a filtrar
 * @param factor - Multiplicador para el umbral MAD (por defecto: 2)
 * @returns Objeto que contiene el array filtrado y los valores atípicos eliminados
 */
export const removeOutliers = (arr: number[], factor = 2) => {
  const med = median(arr);
  const dev = mad(arr) * factor;
  const filtered: number[] = [];
  const removed: number[] = [];
  arr.forEach(v => (Math.abs(v - med) <= dev ? filtered : removed).push(v));
  return { filtered, removed };
};

/**
 * Calcula el promedio robusto de tiempos de reacción después de eliminar valores atípicos.
 * @param times - Array de tiempos de reacción en milisegundos
 * @returns El promedio de tiempos filtrados, o 0 si no hay tiempos válidos
 */
export const robustAverage = (times: number[]): number => {
  const { filtered } = removeOutliers(times);
  return filtered.length ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;
};