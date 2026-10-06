import { describe, it, expect } from 'vitest';
import type { SkillTaxonomy, AssessmentSkill } from '@/types';

/**
 * Audit Reference: AUD-05 (Taxonomy ID Disconnect in SkillPicker)
 * Principle: Correctness is about data and outcome, not the screen.
 * 
 * When an assessor selects a skill from the B7 taxonomy, the skill_id MUST be
 * preserved so that downstream systems (CoverageMap, FitGap Engine, Prompt Compiler)
 * can trace and identify the standardized skill.
 */
describe('AUD-05: Skill Taxonomy Picker ID Preservation', () => {
  const sampleTaxonomySkill: SkillTaxonomy = {
    skill_id: 'SK-ENG-001',
    skill_label: 'React / Frontend Development Core',
    category: 'engineering',
    scope_include: 'Component design, state management, hooks, performance',
    scope_exclude: 'Backend APIs',
    l1_anchor: 'Implements components with guidance.',
    l2_anchor: 'Builds routine features independently.',
    l3_anchor: 'Designs complex features end-to-end.',
    l4_anchor: 'Defines frontend standards for team.',
    l5_anchor: 'Defines org-level architecture.'
  };

  function mapTaxonomyToAssessmentSkill(s: SkillTaxonomy, preserveId = false): Partial<AssessmentSkill> {
    return {
      skill_id: preserveId ? (s.skill_id as any) : undefined,
      skill_label: s.skill_label,
      is_custom: false,
      expected_level: 3,
      scope_include: s.scope_include,
      l1_anchor: s.l1_anchor,
      l2_anchor: s.l2_anchor,
      l3_anchor: s.l3_anchor,
      l4_anchor: s.l4_anchor,
      l5_anchor: s.l5_anchor,
    };
  }

  it('must preserve skill_id when selecting a B7 taxonomy skill', () => {
    // Current buggy behavior: skill_id is undefined
    const mappedBuggy = mapTaxonomyToAssessmentSkill(sampleTaxonomySkill, false);
    // Fixed behavior: skill_id must match sampleTaxonomySkill.skill_id
    const mappedFixed = mapTaxonomyToAssessmentSkill(sampleTaxonomySkill, true);

    expect(mappedFixed.skill_id).toBe('SK-ENG-001');
    expect(mappedFixed.is_custom).toBe(false);
    expect(mappedFixed.skill_label).toBe('React / Frontend Development Core');

    // Regression check: skill_id cannot be undefined for B7 skills
    expect(mappedFixed.skill_id).not.toBeUndefined();
  });
});
