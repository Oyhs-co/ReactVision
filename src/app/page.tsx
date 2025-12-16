/**
 * Home Page Component
 * Main application page providing reaction time testing interface with calibration, testing, and results.
 * @module page
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReactionTest } from '@/components/reaction-test';
import { Calibration } from '@/components/calibration';
import { Results } from '@/components/results';
import { UserForm } from '@/components/user-form';
import { TestTube, Timer, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTests, insertTest, insertAttempts, deleteTest } from '@/lib/supabase/api';
import { useToast } from '@/hooks/use-toast';
import { saveLocal, syncAndDelete } from '@/lib/offline';
import { useCalibrationGate } from '@/hooks/useCalibrationGate';
import { getUserProfile, UserProfile } from '@/lib/user';
import type { Gender, Result, AttemptDetail } from '@/types';

/**
 * Main application page component.
 * Manages the overall state of the reaction time testing application,
 * including user data collection, calibration, testing, and result display.
 */
export default function HomePage() {
  const { calibrated, deviceLatency, calibratedMedian } = useCalibrationGate();
  const [results, setResults] = useState<Result[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadResults = useCallback(async () => {
    try {
      const data = await getTests();
      const formatted: Result[] = (data || []).map((t) => ({
        id: Number(t.id),
        average: Number(t.average_time),
        attempts: t.attempts.map((a) => ({
          time: Number(a.time),
          wasFault: Boolean(a.was_fault),
          delayUsed: Number(a.delay_used),
        })),
        faults: Number(t.faults),
        timestamp: t.timestamp,
        age: Number(t.age),
        wearsGlasses: Boolean(t.wears_glasses),
        gender: t.gender as Gender,
        visualFatigue: Number(t.visual_fatigue),
        deviceLatency: undefined,
        calibratedMedian: Number(t.calibrated_average) || undefined,
      }));
      setResults(formatted);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
    // load stored user profile from localStorage
    try {
      const p = getUserProfile();
      if (p) setUserProfile(p);
    } catch {
      // ignore
    }
  }, [loadResults]);

  const addResult = useCallback(
    async (details: AttemptDetail[]) => {
      if (!userProfile || !calibrated) return;
      const times = details.filter((d) => !d.wasFault).map((d) => d.time);
      const average = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;

      const result: Omit<Result, 'id'> = {
        attempts: details,
        average: Math.round(average),
        faults: details.filter((d) => d.wasFault).length,
        timestamp: new Date().toISOString(),
        age: Number(userProfile.age),
        wearsGlasses: userProfile.wearsGlasses,
        gender: userProfile.gender as Gender,
        visualFatigue: userProfile.visualFatigue,
        deviceLatency,
        calibratedMedian,
      };

      const localId = await saveLocal(result);
      try {
        const newTest = await insertTest({
          timestamp: result.timestamp,
          age: result.age,
          gender: result.gender,
          wears_glasses: result.wearsGlasses,
          visual_fatigue: result.visualFatigue,
          average_time: result.average,
          faults: result.faults,
          calibrated_average: result.calibratedMedian ?? 0,
        });
        if (!newTest?.id) throw new Error('No test id');
        await insertAttempts(
          details.map((d, idx) => ({
            test_id: newTest.id,
            attempt_number: idx + 1,
            time: d.time,
            was_fault: d.wasFault,
            delay_used: d.delayUsed,
          }))
        );
        await syncAndDelete(localId);
        toast({ title: 'Test saved' });
        setResults((r) => [
          {
            id: Number(newTest.id),
            ...result,
          },
          ...r,
        ]);
      } catch (err: unknown) {
        console.error('Save failed:', err);
        toast({ variant: 'destructive', title: 'Save failed' });
      }
    },
    [userProfile, deviceLatency, calibratedMedian, calibrated, toast]
  );

  const isUserDataComplete = !!userProfile;
  // Test disabled if user data not saved or not calibrated
  const isTestDisabled = !calibrated || !isUserDataComplete;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Timer className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center relative">
          <h1 className="text-5xl font-bold text-primary flex items-center justify-center gap-3">
            <Timer className="w-12 h-12" />
            ReactiVision
          </h1>
          <p className="text-muted-foreground mt-2">Precision Reaction Time Measurement</p>
          <div className="absolute top-0 right-0">
            <a href="/manual/index.html" target="_blank" rel="noopener noreferrer" aria-label="Open user manual">
              <Button variant="outline" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </header>

        {/* User data form moved out of the Test tab into its own section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User information</CardTitle>
            <CardDescription>Provide your demographic data before calibrating.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm onSave={(p) => { setUserProfile(p); toast({ title: 'User profile saved' }); }} />
          </CardContent>
        </Card>

        <Tabs defaultValue={calibrated ? 'test' : 'calibration'} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calibration">
              <Timer className="w-4 h-4 mr-2" />
              Calibration
            </TabsTrigger>
            <TabsTrigger value="test">
              <TestTube className="w-4 h-4 mr-2" />
              Test
            </TabsTrigger>
            <TabsTrigger value="results">
              <FileText className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Reaction Test</CardTitle>
                <CardDescription>5 valid attempts required (max 10). Click when green.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="text-center text-sm text-muted-foreground">
                  User data is managed in the User information card above. Make sure you have saved your profile before calibrating or running tests.
                </div>

                <ReactionTest onTestComplete={addResult} onNewTest={() => {}} disabled={isTestDisabled} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calibration" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Calibration</CardTitle>
                <CardDescription>Mandatory before testing. Measures device latency and your baseline median.</CardDescription>
              </CardHeader>
              <CardContent>
                <Calibration onCalibrated={async (l, m) => {
                // ensure user profile exists before finalizing calibration
                const profile = getUserProfile();
                if (!profile) {
                  toast({ variant: 'destructive', title: 'Save your user data first' });
                  return;
                }
                useCalibrationGate.getState().setCalibrated(l, m);
                toast({ title: 'Calibration saved' });
              }} disabled={!userProfile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <Results results={results} calibration={calibratedMedian || 0} onDelete={async (id) => {
              try {
                await deleteTest(id);
                setResults((r) => r.filter((it) => it.id !== id));
                toast({ title: 'Deleted' });
              } catch {
                toast({ variant: 'destructive', title: 'Delete failed' });
              }
            }} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
