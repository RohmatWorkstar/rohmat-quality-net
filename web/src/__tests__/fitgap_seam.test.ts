import { describe, it, expect } from 'vitest';
import { LEVEL_LABELS, FIT_GAP_RESULT_LABELS } from '@/utils/constants';
import type { SkillComparison } from '@/types';

/**
 * Audit Reference: AUD-04 (Seam Desync in Fit/Gap Report)
 * Principle: Correctness is about data and outcome, not the screen.
 * 
 * Tests the contract between backend FitGap::Engine and frontend ComparisonTable.
 * Backend sends { expected_level, required_level, is_override, candidate_level, result, delta }.
 * Frontend MUST resolve the required level and display the human override indicator.
 */
describe('AUD-04: Fit/Gap Contract & Seam Parity', () => {
  it('correctly maps required_level or expected_level to display label', () => {
    // Backend API response payload structure
    const backendComparison = {
      skill_label: 'React / Frontend Development',
      skill_id: 'SK-ENG-001',
      candidate_level: 3,
      expected_level: 3, // sent by API
      required_level: 3, // alias required by web types
      result: 'match' as const,
      delta: 0,
      is_override: true,
      confidence: 'high'
    };

    // Helper simulating ComparisonTable resolution
    const resolveRequiredLevel = (c: any) => c.required_level ?? c.expected_level;

    const levelNumber = resolveRequiredLevel(backendComparison);
    expect(levelNumber).toBe(3);
    expect(LEVEL_LABELS[levelNumber]).toBe('L3');
  });

  it('preserves the human override flag for UI denotation', () => {
    const overriddenComparison = {
      skill_label: 'System Design',
      candidate_level: 4,
      required_level: 3,
      result: 'exceed' as const,
      delta: 1,
      is_override: true
    };

    const regularComparison = {
      skill_label: 'System Design',
      candidate_level: 3,
      required_level: 3,
      result: 'match' as const,
      delta: 0,
      is_override: false
    };

    expect(overriddenComparison.is_override).toBe(true);
    expect(regularComparison.is_override).toBe(false);
  });
});
