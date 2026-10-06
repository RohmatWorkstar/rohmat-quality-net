# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FitGap::Engine do
  let!(:organization) do
    Organization.find_or_create_by!(id: 1) do |org|
      org.name       = 'Test Org'
      org.scheme     = 'test-corp'
      org.identifier = 'test-corp'
      org.host       = 'localhost'
    end
  end

  let!(:assessment) do
    Assessment.create!(
      tenant_id: 1,
      created_by: 1,
      name: 'Senior Frontend Engineer',
      time_limit_min: 45
    )
  end

  let!(:session_record) do
    Session.create!(
      tenant_id: 1,
      assessment: assessment,
      status: 'ended',
      invite_token: 'test_token_abc'
    )
  end

  let!(:portfolio) do
    Portfolio.create!(
      session: session_record,
      generation_status: 'complete'
    )
  end

  let!(:portfolio_skill) do
    portfolio.portfolio_skills.create!(
      skill_id: 'SK-ENG-001',
      skill_label: 'React / Frontend Development',
      ai_level: 3,
      ai_confidence: 'high',
      competency_summary: 'Demonstrates proficient component architecture.',
      evidence: ['Implemented custom hooks']
    )
  end

  let!(:vacancy) do
    Vacancy.create!(
      tenant_id: 1,
      created_by: 1,
      role_title: 'Frontend Lead'
    )
  end

  let!(:vacancy_skill) do
    vacancy.vacancy_skills.create!(
      skill_id: 'SK-ENG-001',
      skill_label: 'React / Frontend Development',
      expected_level: 4
    )
  end

  describe '#build_skill_comparisons (AUD-04 Seam Parity)' do
    let(:engine) { described_class.new(portfolio: portfolio, vacancy: vacancy) }

    it 'includes required_level alongside expected_level for frontend contract parity' do
      comparisons = engine.send(:build_skill_comparisons)
      comparison  = comparisons.first

      expect(comparison[:expected_level]).to eq(4)
      expect(comparison[:required_level]).to eq(4)
      expect(comparison[:candidate_level]).to eq(3)
      expect(comparison[:delta]).to eq(-1)
      expect(comparison[:result]).to eq('gap')
    end

    it 'flags is_override as true when an assessor override is present' do
      portfolio_skill.create_assessor_override!(
        ai_level: 3,
        override_level: 4,
        assessor_notes: 'Demonstrated L4 skills in portfolio review',
        overridden_by: 1
      )

      comparisons = engine.send(:build_skill_comparisons)
      comparison  = comparisons.first

      expect(comparison[:is_override]).to be(true)
      expect(comparison[:candidate_level]).to eq(4) # effective level
      expect(comparison[:result]).to eq('match')
    end

    it 'flags is_override as false when no override is present' do
      comparisons = engine.send(:build_skill_comparisons)
      comparison  = comparisons.first

      expect(comparison[:is_override]).to be(false)
    end
  end
end
