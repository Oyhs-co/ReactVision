"use client"

import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReactionTest } from '@/components/reaction-test';
import { Calibration } from '@/components/calibration';
import { Results } from '@/components/results';
import { TestTube, Timer, FileText, AlertTriangle, User, Glasses, VenetianMask, Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

/**
 * @typedef {object} AttemptDetail
 * @property {number} time - El tiempo de reacción para este intento.
 * @property {boolean} wasFault - Si el intento fue un fallo (prematuro o inválido).
 * @property {number} delayUsed - El retardo aleatorio exacto usado antes de que la pantalla se pusiera verde.
 */
export type AttemptDetail = {
  time: number;
  wasFault: boolean;
  delayUsed: number;
};

/**
 * @typedef {object} Result
 * @property {number} id - El identificador único del resultado.
 * @property {AttemptDetail[]} attempts - Array con los detalles de cada uno de los 5 intentos.
 * @property {number} average - El tiempo de reacción promedio de los intentos válidos.
 * @property {number} faults - El número total de fallos.
 * @property {string} timestamp - La fecha y hora en que se completó el test.
 * @property {number} age - La edad del usuario.
 * @property {boolean} wearsGlasses - Si el usuario usaba gafas.
 * @property {'male' | 'female' | 'other'} gender - El género del usuario.
 * @property {number} visualFatigue - El nivel de fatiga visual del usuario (1-10).
 */
export type Result = {
  id: number;
  average: number;
  attempts: AttemptDetail[];
  faults: number;
  timestamp: string;
  age: number;
  wearsGlasses: boolean;
  gender: 'male' | 'female' | 'other';
  visualFatigue: number;
};

/**
 * Componente principal de la aplicación ReactiVision.
 * Gestiona el estado de los resultados de las pruebas y la calibración.
 * @returns {JSX.Element} El componente de la página de inicio.
 */
export default function Home() {
  const [results, setResults] = useState<Result[]>([]);
  const [calibration, setCalibration] = useState<number>(0);
  const [age, setAge] = useState<number | ''>('');
  const [wearsGlasses, setWearsGlasses] = useState<boolean>(false);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [visualFatigue, setVisualFatigue] = useState<number>(1);


  /**
   * Agrega un nuevo resultado de prueba a la lista de resultados.
   * @param {object} testData - Los datos del test completado.
   * @param {AttemptDetail[]} testData.attempts - El detalle de cada intento.
   * @param {number} testData.average - El promedio de los tiempos válidos.
   * @param {number} testData.faults - El número de fallos.
   */
  const addResult = useCallback((testData: { attempts: AttemptDetail[]; average: number; faults: number }) => {
    if (age === '') return;
    setResults(prev => [
      ...prev,
      { 
        id: prev.length + 1, 
        ...testData,
        timestamp: new Date().toISOString(),
        age: Number(age), 
        wearsGlasses,
        gender,
        visualFatigue
      }
    ]);
  }, [age, wearsGlasses, gender, visualFatigue]);

  /**
   * Limpia todos los resultados de las pruebas.
   */
  const clearResults = useCallback(() => {
    setResults([]);
  }, []);
  
  const handleCalibrated = useCallback((avg: number) => {
    setCalibration(avg);
  }, []);

  const handleNewTestRequest = useCallback(() => {
    setAge('');
    setWearsGlasses(false);
    setGender('other');
    setVisualFatigue(1);
  }, []);
  
  const isTestDisabled = age === '';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-primary font-headline flex items-center justify-center gap-3">
            <Timer className="w-12 h-12" />
            ReactiVision
          </h1>
          <p className="text-muted-foreground mt-2">Precision Reaction Time Measurement</p>
        </header>

        <Tabs defaultValue="test" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="test"><TestTube className="w-4 h-4 mr-2" />Test</TabsTrigger>
            <TabsTrigger value="calibration"><Timer className="w-4 h-4 mr-2" />Calibration</TabsTrigger>
            <TabsTrigger value="results"><FileText className="w-4 h-4 mr-2" />Results & Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Reaction Test</CardTitle>
                <CardDescription>Click the screen as soon as it turns green. Each test consists of 5 attempts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 items-start">
                  {/* User Data */}
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="age" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Your Age
                    </Label>
                    <Input 
                      id="age" 
                      type="number" 
                      placeholder="Enter your age" 
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="wears-glasses" 
                      checked={wearsGlasses}
                      onCheckedChange={setWearsGlasses}
                    />
                    <Label htmlFor="wears-glasses" className="flex items-center cursor-pointer">
                      <Glasses className="w-4 h-4 mr-2" />
                       Do you wear glasses?
                    </Label>
                  </div>

                  {/* Gender */}
                  <div className="grid w-full items-center gap-2">
                    <Label className="flex items-center">
                      <VenetianMask className="w-4 h-4 mr-2" />
                      Gender
                    </Label>
                    <RadioGroup value={gender} className="flex gap-4" onValueChange={(value) => setGender(value as 'male' | 'female' | 'other')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Visual Fatigue */}
                  <div className="grid w-full items-center gap-2">
                     <Label htmlFor="visual-fatigue" className="flex items-center">
                       <Eye className="w-4 h-4 mr-2" />
                       Visual Fatigue (1 to 10)
                     </Label>
                     <div className="flex items-center gap-4">
                       <Slider
                         id="visual-fatigue"
                         min={1}
                         max={10}
                         step={1}
                         value={[visualFatigue]}
                         onValueChange={(value) => setVisualFatigue(value[0])}
                       />
                       <span className="font-bold text-lg w-8 text-center">{visualFatigue}</span>
                     </div>
                  </div>
                </div>
                
                {calibration === 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Suggestion</AlertTitle>
                    <AlertDescription>
                      For more accurate results, we recommend completing the calibration in the <strong>Calibration</strong> tab first.
                    </AlertDescription>
                  </Alert>
                )}
                
                <ReactionTest onTestComplete={addResult} onNewTest={handleNewTestRequest} disabled={isTestDisabled} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calibration" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Calibration</CardTitle>
                 <CardDescription>Establish your baseline reaction time for more accurate results.</CardDescription>
              </CardHeader>
              <CardContent>
                <Calibration onCalibrated={handleCalibrated} disabled={isTestDisabled}/>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <Results results={results} calibration={calibration} onClearResults={clearResults} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
