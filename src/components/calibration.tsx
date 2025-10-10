"use client"

import { useState, useCallback } from 'react';
import { ReactionTest } from './reaction-test';
import { Button } from './ui/button';
import { BarChart, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * Propiedades para el componente Calibration.
 * @typedef {object} CalibrationProps
 * @property {(avg: number) => void} onCalibrated - Función de callback que se llama con el tiempo de reacción promedio.
 * @property {boolean} [disabled] - Si la calibración está deshabilitada.
 */
type CalibrationProps = {
  onCalibrated: (avg: number) => void;
  disabled?: boolean;
};

type TestResultData = {
  attempts: { time: number; wasFault: boolean; delayUsed: number }[];
  average: number;
  faults: number;
};

/**
 * Componente para calibrar el tiempo de reacción base del usuario.
 * Realiza una serie de 5 pruebas y calcula el promedio.
 * @param {CalibrationProps} props - Las propiedades para el componente.
 * @returns {JSX.Element}
 */
export function Calibration({ onCalibrated, disabled = false }: CalibrationProps) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [average, setAverage] = useState<number | null>(null);

  /**
   * Maneja el resultado de la serie de 5 tests de reacción.
   */
  const handleCalibrationComplete = useCallback((data: TestResultData) => {
    const testAverage = data.average;
    if (testAverage > 0) { // Solo usar resultados válidos
        setAverage(testAverage);
        onCalibrated(testAverage);
    }
    setIsCalibrating(false);
  }, [onCalibrated]);


  /**
   * Inicia el proceso de calibración.
   */
  const startCalibration = () => {
    setAverage(null);
    setIsCalibrating(true);
  };
  
  if (disabled) {
     return (
       <div className="text-center p-4 text-muted-foreground">
         <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
         <h3 className="text-xl font-semibold text-card-foreground">Calibration Disabled</h3>
         <p className="mt-2">Please go to the <strong>Test</strong> tab and fill in all user data to enable calibration.</p>
       </div>
     );
  }

  if (average !== null) {
    return (
      <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">Calibration Complete!</h3>
        <p className="text-lg mt-2">Your average reaction time is:</p>
        <p className="text-5xl font-bold text-primary my-2">{average}<span className="text-2xl ml-1">ms</span></p>
        <p className="text-muted-foreground">This value will be used as the initial delay for processing your data.</p>
        <Button onClick={startCalibration} className="mt-6">Recalibrate</Button>
      </div>
    );
  }

  if (isCalibrating) {
    return (
      <div className="space-y-6">
        <ReactionTest onTestComplete={handleCalibrationComplete} onNewTest={() => {}} />
        <div className="text-center">
          <Button onClick={() => setIsCalibrating(false)} variant="outline">Cancel Calibration</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      <Lightbulb className="w-12 h-12 text-primary mx-auto mb-4" />
      <h3 className="text-xl font-semibold">Calibrate Your Reaction Time</h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">We&apos;ll run one quick test (5 attempts) to establish your baseline reaction time. This helps in getting more accurate results.</p>
      <Button onClick={startCalibration} size="lg">
        <BarChart className="w-5 h-5 mr-2" />
        Start Calibration
      </Button>
    </div>
  );
}
