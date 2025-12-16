'use client';

import React from 'react';
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { BarChart, CheckCircle, Lightbulb } from 'lucide-react';
import { useReactionTest } from '@/hooks/useReactionTest';
import { median, removeOutliers } from '@/lib/stats';

import { measureDeviceLatency } from '@/lib/latency';
import type { AttemptDetail } from '@/types';

interface Props {
  onCalibrated: (latency: number, userMedian: number) => void;
  disabled?: boolean;
}

export function Calibration({ onCalibrated, disabled }: Props) {
  const [running, setRunning] = useState(false);
  const [done, setDone]   = useState(false);
  const { toast } = useToast();

  const handleComplete = useCallback(
    async (details: AttemptDetail[]) => {
      const times = details.filter((d) => !d.wasFault).map((d) => d.time);
      if (times.length < 3) {
        toast({ title: 'Calibration failed', variant: 'destructive' });
        setRunning(false);
        return;
      }
      const { filtered } = removeOutliers(times);
      const userMedian = median(filtered);
      const deviceLatency = await measureDeviceLatency();
      onCalibrated(deviceLatency, userMedian);
      setDone(true);
      setRunning(false);
    },
    [onCalibrated, toast]
  );

  const { state, start, react, reset } = useReactionTest(handleComplete);

  if (disabled) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Complete user data first.
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center p-6">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold">Calibration complete</h3>
        <Button onClick={() => { setDone(false); reset(); }} className="mt-4">
          Recalibrate
        </Button>
      </div>
    );
  }

  if (running) {
    return (
      <div className="space-y-4">
        <div className="h-64 rounded-lg bg-green-500 text-white flex flex-col items-center justify-center"
             onClick={react} role="button">
          <span className="text-3xl font-bold">Click when green!</span>
          <span className="mt-2">Attempt {state.attempt} of 5</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      <Lightbulb className="w-12 h-12 text-primary mx-auto mb-4" />
      <h3 className="text-xl font-semibold">Calibrate your device</h3>
      <p className="text-muted-foreground mt-2 mb-6">
        We will measure input latency and your baseline median.
      </p>
      <Button onClick={() => { setRunning(true); start(); }} size="lg">
        <BarChart className="w-5 h-5 mr-2" />
        Start
      </Button>
    </div>
  );
}
