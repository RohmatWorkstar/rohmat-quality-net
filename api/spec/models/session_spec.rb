# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Session, type: :model do
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
      name: 'Fullstack SDET Role',
      time_limit_min: 45
    )
  end

  describe '#invite_url (AUD-07 Routing Parity)' do
    it 'generates invite link pointing to the candidate frontend application' do
      session = Session.create!(
        tenant_id: 1,
        assessment: assessment,
        invite_token: 'valid_token_xyz_123'
      )

      # Should resolve to frontend port (5173), not API port (3001)
      expect(session.invite_url).to include('/interview/valid_token_xyz_123')
      expect(session.invite_url).to match(/5173|app\./)
    end
  end
end
