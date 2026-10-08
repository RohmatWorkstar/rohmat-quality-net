import { describe, it, expect } from 'vitest';
import { formatDuration } from '../utils/formatDuration';

describe('formatDuration utility (PRD-02 Session Duration)', () => {
  it('formats zero seconds as 00:00', () => {
    expect(formatDuration(0)).toBe('00:00');
  });

  it('formats seconds under one minute with leading zero', () => {
    expect(formatDuration(9)).toBe('00:09');
    expect(formatDuration(59)).toBe('00:59');
  });

  it('formats minutes and seconds accurately', () => {
    expect(formatDuration(60)).toBe('01:00');
    expect(formatDuration(125)).toBe('02:05');
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('formats hours when duration exceeds 60 minutes', () => {
    expect(formatDuration(3600)).toBe('01:00:00');
    expect(formatDuration(3665)).toBe('01:01:05');
  });

  it('handles negative or invalid seconds defensively by returning 00:00', () => {
    expect(formatDuration(-10)).toBe('00:00');
    expect(formatDuration(NaN)).toBe('00:00');
  });
});
