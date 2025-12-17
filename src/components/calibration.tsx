'use client';

import React from 'react';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, CheckCircle, Lightbulb, XCircle } from 'lucide-react';
import { useReactionTest } from '@/hooks/useReactionTest';
import { median, removeOutliers } from '@/lib/stats';

import { measureDeviceLatency } from '@/lib/latency';
import type { AttemptDetail } from '@/types';
import '@/styles/ripple.css';
import '@/styles/flash.css';

/**
 * A map of messages to display to the user during the calibration process.
 * @const {Record<string, {title: string, description: string}>}
 */
const messages = {
  idle: {
    title: 'Calibrate Your Device',
    description: 'We will measure input latency and your baseline median.',
  },
  ready: {
    title: 'Get Ready...',
    description: 'Prepare to click.',
  },
  waiting: {
    title: 'Wait for Green',
    description: 'Click only when the box turns green.',
  },
  react: {
    title: 'Click Now!',
    description: `Attempt ${'{}'} of 5`,
  },
  result: {
    title: 'Good!',
    description: 'Success!',
  },
  fault: {
    title: 'Fault!',
    description: 'Clicked too early.',
  },
  summary: {
    title: 'Analyzing...',
    description: 'Please wait.',
  },
};

interface Props {
  onCalibrated: (latency: number, userMedian: number) => void;
  disabled?: boolean;
}

export function Calibration({ onCalibrated, disabled }: Props) {
  const [isDone, setIsDone] = useState(false);
  const { toast } = useToast();

  const handleComplete = useCallback(
    async (details: AttemptDetail[]) => {
      const times = details.filter((d) => !d.wasFault).map((d) => d.time);
      if (times.length < 3) {
        toast({ title: 'Calibration failed', variant: 'destructive' });
        return;
      }
      const { filtered } = removeOutliers(times);
      const userMedian = median(filtered);
      const deviceLatency = await measureDeviceLatency();
      onCalibrated(deviceLatency, userMedian);
      setIsDone(true);
    },
    [onCalibrated, toast]
  );

  const { state, start, react, reset } = useReactionTest(handleComplete);
  const progress = useMemo(() => (state.attempt / 5) * 100, [state.attempt]);

  useEffect(() => {
    if (state.status === 'react') {
      new Audio('/audio/beep.wav').play();
    }
  }, [state.status]);

  const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];

    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  if (disabled) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Complete user data first.
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="text-center p-6">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold">Calibration Complete</h3>
        <Button onClick={() => { setIsDone(false); reset(); }} className="mt-4">
          Recalibrate
        </Button>
      </div>
    );
  }

  const { title, description } = messages[state.status];
  const color =
    state.status === 'react'
      ? 'bg-green-500'
      : state.status === 'fault'
      ? 'bg-red-500'
      : 'bg-gray-800';

  return (
    <div className="space-y-6 text-center">
      {state.status === 'idle' && (
        <>
          <Lightbulb className="w-12 h-12 text-primary mx-auto" />
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          <Button onClick={start} size="lg">
            <BarChart className="w-5 h-5 mr-2" />
            Start Calibration
          </Button>
        </>
      )}

      {state.status !== 'idle' && (
        <>
          <div
            className={`h-64 rounded-lg text-white flex flex-col items-center justify-center transition-colors duration-200 relative overflow-hidden ${color} ${state.status === 'react' ? 'flash' : ''}`}
            onClick={(e) => {
              react();
              createRipple(e);
            }}
            role="button"
            aria-live="polite"
          >
            <div className="h-24 flex flex-col items-center justify-center">
              {state.status === 'fault' && <XCircle className="w-16 h-16 mb-4" />}
              <span className="text-4xl font-bold">
                {title.replace('{}', String(state.attempt))}
              </span>
              <span className="mt-2 text-lg">
                {description.replace('{}', String(state.attempt))}
              </span>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="text-sm text-muted-foreground">
            Attempt {state.attempt} of 5
          </div>
        </>
      )}
    </div>
  );
}
