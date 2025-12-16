/**
 * Utilidades de medición de latencia del dispositivo.
 * @module latency
 */

/**
 * Mide la latencia de entrada del dispositivo cronometrando eventos de puntero y ciclos de requestAnimationFrame.
 * Esto proporciona una estimación del retraso de entrada del sistema para mediciones más precisas del tiempo de reacción.
 *
 * @returns Promesa que se resuelve con la latencia promedio en milisegundos sobre 5 muestras
 */
export async function measureDeviceLatency(): Promise<number> {
  return new Promise((resolve) => {
    const samples: number[] = [];
    let count = 0;
    const total = 5;

    const listener = () => {
      const start = performance.now();
      requestAnimationFrame(() => {
        const delta = performance.now() - start;
        samples.push(delta);
        count++;
        if (count === total) {
          window.removeEventListener('pointerdown', listener);
          resolve(samples.reduce((a, b) => a + b, 0) / total);
        }
      });
    };
    window.addEventListener('pointerdown', listener, { passive: true });

    /* auto-inicio */
    requestAnimationFrame(() => {});
  });
}