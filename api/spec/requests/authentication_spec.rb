# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Authentication API', type: :request do
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

  let!(:admin) do
    User.create!(
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    )
  end

  describe 'POST /api/v1/auth/login (AUD-02 Role Gate Remediations)' do
    it 'allows assessors to log in with valid credentials' do
      post '/api/v1/auth/login', params: {
        email: 'assessor@example.com',
        password: 'password123'
      }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']['token']).to be_present
      expect(body['data']['user']['role']).to eq('assessor')
    end

    it 'allows admins to log in' do
      post '/api/v1/auth/login', params: {
        email: 'admin@example.com',
        password: 'password123'
      }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']['token']).to be_present
      expect(body['data']['user']['role']).to eq('admin')
    end

    it 'rejects invalid passwords' do
      post '/api/v1/auth/login', params: {
        email: 'assessor@example.com',
        password: 'wrong_password'
      }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/auth/signup (AUD-03 Missing Route Remediations)' do
    it 'registers a new user and returns an authentication token' do
      post '/api/v1/auth/signup', params: {
        email: 'new_assessor@example.com',
        password: 'securepassword123',
        role: 'user'
      }

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body['data']['token']).to be_present
      expect(body['data']['user']['email']).to eq('new_assessor@example.com')
    end

    it 'rejects registration when email is already taken' do
      post '/api/v1/auth/signup', params: {
        email: 'assessor@example.com',
        password: 'securepassword123'
      }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
