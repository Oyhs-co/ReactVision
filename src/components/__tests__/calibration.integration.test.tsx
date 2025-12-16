import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Calibration } from '../calibration';

describe('Calibration component', () => {
  it('shows disabled message when disabled prop is true', () => {
    render(<Calibration onCalibrated={() => {}} disabled={true} />);
    expect(screen.getByText(/Complete user data first/i)).toBeTruthy();
  });

  it('shows start button when enabled', () => {
    render(<Calibration onCalibrated={() => {}} disabled={false} />);
    expect(screen.getByRole('button', { name: /start/i })).toBeTruthy();
  });
});