/**
 * Store de Zustand para gestionar el estado de calibración.
 * Persiste los datos de calibración entre sesiones usando localStorage.
 * @module useCalibrationGate
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Interfaz de estado para el store de puerta de calibración.
 */
interface State {
  /** Si el dispositivo ha sido calibrado */
  calibrated: boolean;
  /** Latencia de entrada del dispositivo medida en milisegundos */
  deviceLatency: number;
  /** Tiempo de reacción mediano base del usuario de la calibración */
  calibratedMedian: number;
  /** Establece los datos de calibración y marca como calibrado */
  setCalibrated: (deviceLatency: number, calibratedMedian: number) => void;
  /** Reinicia el estado de calibración */
  reset: () => void;
}

/**
 * Hook de store de Zustand para gestión del estado de calibración.
 * Usa middleware de persistencia para mantener el estado entre sesiones del navegador.
 */
export const useCalibrationGate = create<State>()(
  persist(
    (set) => ({
      calibrated: false,
      deviceLatency: 0,
      calibratedMedian: 0,
      setCalibrated: (deviceLatency, calibratedMedian) =>
        set({ calibrated: true, deviceLatency, calibratedMedian }),
      reset: () => set({ calibrated: false, deviceLatency: 0, calibratedMedian: 0 }),
    }),
    { name: 'reactivision-calibration' }
  )
);