/**
 * Reaction Test Component
 * Interactive component for conducting reaction time tests with visual feedback.
 * @module reaction-test
 */

'use client';

import { useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useReactionTest } from '@/hooks/useReactionTest';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, BarChart, CheckCircle, XCircle, Timer } from 'lucide-react';
import { robustAverage } from '@/lib/stats';
import type { AttemptDetail } from '@/types';
import '@/styles/ripple.css';
import '@/styles/flash.css';

/**
 * A map of messages to display to the user during the reaction test.
 * @const {Record<string, {title: string, description: string}>}
 */
const messages = {
  idle: {
    title: 'Start Test',
    description: 'Click to begin. 5 valid attempts are required.',
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
    description: `Attempt ${'{}'} of 10`,
  },
  result: {
    title: 'Good!',
    description: 'Success!',
  },
  fault: {
    title: 'Fault!',
    description: 'Clicked too early or too late.',
  },
  summary: {
    title: 'Test Complete',
    description: `Average: ${'{avg}'} ms`,
  },
};

/**
 * Props for the ReactionTest component.
 */
interface Props {
  /** Callback fired when test completes with attempt details */
  onTestComplete: (details: AttemptDetail[]) => void;
  /** Callback fired when user requests a new test */
  onNewTest: () => void;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export function ReactionTest({ onTestComplete, onNewTest, disabled }: Props) {
  const { state, start, react, reset } = useReactionTest(onTestComplete);
  const validAttempts = useMemo(() => state.details.filter((d) => !d.wasFault).length, [state.details]);
  const progress = useMemo(() => (validAttempts / 5) * 100, [validAttempts]);

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
        Test disabled — complete calibration first.
      </div>
    );
  }

  const { title, description } = messages[state.status] || {};
  const color =
    state.status === 'react'
      ? 'bg-green-500'
      : state.status === 'fault'
      ? 'bg-red-500'
      : 'bg-gray-800';

  if (state.status === 'summary') {
    const avg = Math.round(robustAverage(state.details.map((d) => d.time)));
    return (
      <div className="text-center p-6 space-y-4">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
        <h3 className="text-3xl font-bold">{title}</h3>
        <p className="text-xl text-muted-foreground">{description.replace('{avg}', String(avg))}</p>
        <Button onClick={() => { onNewTest(); reset(); }} size="lg">
          <BarChart className="w-5 h-5 mr-2" />
          New Test
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      {state.status === 'idle' && (
        <>
          <Timer className="w-12 h-12 text-primary mx-auto" />
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          <Button onClick={start} size="lg">
            <BarChart className="w-5 h-5 mr-2" />
            Start Test
          </Button>
        </>
      )}

      {state.status !== 'idle' && (
        <>
          <div
            className={cn(
              'w-full h-80 rounded-lg text-white flex flex-col items-center justify-center select-none transition-colors duration-200 relative overflow-hidden',
              color,
              state.status === 'react' ? 'flash' : ''
            )}
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
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Valid: {validAttempts} of 5</span>
            <span>Attempt: {state.attempt} of 10</span>
          </div>
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </>
      )}
    </div>
  );
}
