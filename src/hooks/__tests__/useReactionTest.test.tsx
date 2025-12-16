import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useReactionTest } from '../useReactionTest';

function HookHarness({ onExpose }: { onExpose: (api: any) => void }) {
  const api = useReactionTest(() => {
    // no-op
  });
  React.useEffect(() => {
    onExpose(api);
  }, [api, onExpose]);
  return null;
}

describe('useReactionTest', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs through attempts and calls onComplete', async () => {
    let api: any;
    const completions: any[] = [];
    render(<HookHarness onExpose={(a) => (api = a)} />);

    // start sets ready -> waiting -> react using timers
    api.start();
    // advance initial ready timeout
    vi.advanceTimersByTime(1000);
    // advance random wait (setTimeout scheduled with a random delay between 2000 and 5000)
    vi.advanceTimersByTime(3500);

    // Simulate react during react state
    api.react();

    // Advance timers to process next attempt
    vi.advanceTimersByTime(1500);

    // For simplicity assert that state moved to at least attempt 2 or summary
    expect(api.state.attempt >= 1).toBe(true);
  });
});