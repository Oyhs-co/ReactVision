/**
 * Reaction Test Component
 * Interactive component for conducting reaction time tests with visual feedback.
 * @module reaction-test
 */

'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useValidatedTest } from '@/hooks/useValidatedTest';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart } from 'lucide-react';
import { robustAverage } from '@/lib/stats';
import type { AttemptDetail } from '@/types';

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
  const { state, addAttempt, finish, setState } = useValidatedTest(onTestComplete);

  useEffect(() => {
    if (state.status === 'summary') finish();
  }, [state.status, finish]);

  /**
   * Handles keyboard input for spacebar presses.
   */
  const handleKey = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      handleClick();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  /**
   * Handles user input (click or spacebar) to record reaction time.
   */
  const handleClick = () => {
    if (state.status === 'idle') {
      setState((s) => ({ ...s, status: 'running', attempt: 0 }));
      return;
    }
    if (state.status !== 'running') return;

    const now = performance.now();
    const w = window as Window & { __lastStart?: number | null };
    const last = w.__lastStart;
    if (!last) {
      /* too soon */
      addAttempt({ time: 0, wasFault: true, delayUsed: 0 });
      return;
    }
    const raw = now - last;
    const ok = raw >= 80 && raw <= 2000;
    addAttempt({ time: raw, wasFault: !ok, delayUsed: 0 });
  };

  /**
   * Starts a random delay before showing the green signal.
   */
  const startDelay = () => {
    const delay = Math.random() * 3000 + 2000;
    const w = window as Window & { __lastStart?: number | null };
    w.__lastStart = null;
    setTimeout(() => {
      w.__lastStart = performance.now();
    }, delay);
  };

  useEffect(() => {
    if (state.status === 'running' && state.attempt < 10) startDelay();
  }, [state.attempt, state.status]);

  if (disabled) {
    return (
      <div className="text-center p-4 text-muted-foreground">Test disabled — complete calibration first.</div>
    );
  }

  const valid = state.details.filter((d) => !d.wasFault).length;
  const needed = 5;

  const screen = {
    idle: { bg: 'bg-muted', text: 'Press Space or Click to Start', sub: '5 valid attempts required (max 10)' },
    running: { bg: 'bg-green-500 text-white', text: 'Click when screen turns green!', sub: `Valid: ${valid}/${needed} – Attempt ${state.attempt + 1}` },
    summary: { bg: 'bg-card', text: 'Test complete', sub: `Average: ${Math.round(robustAverage(state.details.map((d) => d.time)))} ms` },
  } as const;

  const s = state.status === 'summary' ? screen.summary : state.status === 'running' ? screen.running : screen.idle;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn('w-full h-96 rounded-lg flex flex-col items-center justify-center select-none', s.bg)}
        onClick={handleClick}
        role="button"
      >
        <span className="text-2xl font-semibold">{s.text}</span>
        <span className="mt-2 text-sm">{s.sub}</span>
      </div>
      {state.status === 'summary' ? (
        <Button onClick={onNewTest}>
          <BarChart className="w-4 h-4 mr-2" />
          New Test
        </Button>
      ) : (
        <Button variant="outline" onClick={() => setState({ details: [], attempt: 0, status: 'idle' })}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      )}
    </div>
  );
}
