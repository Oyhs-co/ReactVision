import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useValidatedTest } from '../useValidatedTest';

function HookHarness({ onExpose }: { onExpose: (api: any) => void }) {
  const api = useValidatedTest((details) => {
    // no-op
  });
  React.useEffect(() => {
    onExpose(api);
  }, [api, onExpose]);
  return null;
}

describe('useValidatedTest', () => {
  it('accumulates attempts and reaches summary when enough valid attempts', async () => {
    let api: any;
    render(<HookHarness onExpose={(a) => (api = a)} />);

    // Add 5 valid attempts one by one inside act to ensure state updates flush
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        api.addAttempt({ time: 200 + i, wasFault: false, delayUsed: 0 });
      }
    });

    // Wait for the state to reflect the changes
    await waitFor(() => {
      expect(api.state.details.length).toBe(5);
      expect(api.state.status).toBe('summary');
    });
  });

  it('finish() calls onComplete when valid', async () => {
    let called = false;
    function HookFinish() {
      const { state, addAttempt, finish } = useValidatedTest(() => {
        called = true;
      });
      React.useEffect(() => {
        addAttempt({ time: 200, wasFault: false, delayUsed: 0 });
        addAttempt({ time: 210, wasFault: false, delayUsed: 0 });
        addAttempt({ time: 220, wasFault: false, delayUsed: 0 });
        addAttempt({ time: 230, wasFault: false, delayUsed: 0 });
        addAttempt({ time: 240, wasFault: false, delayUsed: 0 });
        finish();
      }, []);
      return <div data-testid="s" />;
    }

    render(<HookFinish />);
    await waitFor(() => {
      expect(called).toBe(true);
    });
  });
});