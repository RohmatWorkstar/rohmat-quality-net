# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Assessments API', type: :request do
  let!(:organization) do
    Organization.find_or_create_by!(id: 1) do |org|
      org.name       = 'Test Org'
      org.scheme     = 'test-corp'
      org.identifier = 'test-corp'
      org.host       = 'localhost'
    end
  end

  let!(:assessor) do
    User.create!(
      email: 'assessor@example.com',
      password: 'password123',
      role: 'assessor'
    )
  end

  let(:auth_token) do
    JsonWebToken.encode(user_id: assessor.id, role: assessor.role, scheme: 'test-corp')
  end

  let(:headers) do
    {
      'Authorization' => "Bearer #{auth_token}",
      'X-Tenant-Scheme' => 'test-corp'
    }
  end

  describe 'PUT /api/v1/assessments/:id (AUD-06 Zombie Skill Prevention & AUD-08 Language)' do
    let!(:assessment) do
      Assessment.create!(
        tenant_id: 1,
        created_by: assessor.id,
        name: 'Fullstack SDET Role',
        time_limit_min: 45,
        language: 'id'
      )
    end

    let!(:skill_a) do
      assessment.assessment_skills.create!(
        skill_id: 'SK-ENG-001',
        skill_label: 'Skill A',
        l1_anchor: 'L1', l2_anchor: 'L2', l3_anchor: 'L3', l4_anchor: 'L4', l5_anchor: 'L5',
        expected_level: 3,
        display_order: 0
      )
    end

    let!(:skill_b) do
      assessment.assessment_skills.create!(
        skill_id: 'SK-ENG-002',
        skill_label: 'Skill B',
        l1_anchor: 'L1', l2_anchor: 'L2', l3_anchor: 'L3', l4_anchor: 'L4', l5_anchor: 'L5',
        expected_level: 3,
        display_order: 1
      )
    end

    it 'deletes nested skill records when _destroy is provided' do
      expect(assessment.assessment_skills.count).to eq(2)

      put "/api/v1/assessments/#{assessment.id}", params: {
        assessment: {
          name: 'Updated Role',
          language: 'id',
          assessment_skills_attributes: [
            { id: skill_a.id, display_order: 0 },
            { id: skill_b.id, _destroy: true } # Explicitly destroy skill_b
          ]
        }
      }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(assessment.reload.assessment_skills.count).to eq(1)
      expect(assessment.assessment_skills.first.id).to eq(skill_a.id)
      expect(assessment.language).to eq('id')
    end
  end
end
