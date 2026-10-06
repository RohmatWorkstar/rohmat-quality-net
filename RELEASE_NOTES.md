# Release Notes — Version v1.0.0
**Product:** Skills Assessment & AI Interview Platform  
**Release Tag:** `v1.0.0`  
**Quality Lead & Release Owner:** Rohmat Supriyadi ([@RohmatWorkstar](https://github.com/RohmatWorkstar))  
**Release Date:** October 2026  
**Pipeline Gate Status:** PASSED (Verified via Automated Quality Net)

---

## 1. Release Overview

Version `v1.0.0` delivers the hardened, production-ready baseline of the Skills Assessment Platform. This release resolves critical architectural blockers in user authentication, eliminates silent data corruption across assessment and vacancy configurations, aligns frontend-backend API contracts, and introduces an automated development quality gate enforcing Definition of Ready (DoR) preconditions on all future changes.

---

## 2. Key Capabilities Delivered

### Core Authentication & Access Control
- **Assessor Role Enablement:** Restored access for assessors to authenticate via `POST /api/v1/auth/login`. Removed hardcoded admin-only constraint.
- **Self-Serve Assessor Registration:** Implemented backend endpoint `POST /api/v1/auth/signup` with password hashing and tenant assignment, connecting the previously broken frontend signup flow.

### Assessment & Vacancy Lifecycle Integrity
- **Taxonomy Identity Preservation:** Fixed B7 skill taxonomy integration in `SkillPicker`. Skills chosen from the reference taxonomy preserve their unique `skill_id` (e.g. `SK-ENG-001`).
- **Zero Zombie Skills (Nested Lifecycle Enforcement):** Implemented explicit `_destroy: true` markers in frontend edit forms (`AssessmentEditPage`, `VacancyEditPage`). Deleted skills are cleanly purged from PostgreSQL relational tables upon update.
- **Language Configuration Persistence:** Added bilingual selection support (`language: 'id' | 'en'`) to assessment updates, preventing silent resets to English.

### Fit/Gap Report & Candidate Experience
- **Contract Parity on Fit/Gap Engine:** Harmonized API response payload to provide both `expected_level` and `required_level`, resolving blank required level columns in the UI.
- **Assessor Override Indicator:** Exposed `is_override` in the evaluation comparison payload, ensuring human-adjusted scores are visibly denoted with the pencil icon (`✏`) in the UI and PDF exports.
- **Candidate Invite Routing:** Configured `APP_BASE_URL` to route candidates to the client application port (`http://localhost:5173`), preventing 404 errors when opening interview tokens.

### Engineering Governance & Quality Net
- **Workflow Gate (DoR Check):** Automated gate (`scripts/verify-dor.js`) blocking changes lacking PRD links, Given/When/Then acceptance criteria, or automated tests.
- **Automated Regression Pipelines:** Added GitHub Actions workflows for continuous integration (`quality-gate.yml`) and tag-driven deployment validation (`release-gate.yml`).

---

## 3. Breaking Changes & Deprecations
- **API Response:** `GET /api/v1/portfolios/:id/fitgap/:vacancy_id` now includes `required_level` and `is_override` fields in `skill_comparisons`.
- **Environment Variable:** `FRONTEND_URL` is now preferred for candidate invite link generation, falling back to `APP_BASE_URL`.

---

## 4. Known Risks & Disclosures (Honesty Sign-Off)
- **AUD-09 (Audio Reconnection Race Condition):** Rapid candidate disconnect/reconnect cycles under poor cellular networks may experience minor audio frame loss.
  - *Mitigation:* The 120-second backend grace period and local ring buffer preserve connection state; candidates are advised via UI banner to maintain stable WiFi.
  - *Risk Owner:* Rohmat Supriyadi (Quality Lead)
- **Gemini Live Rate Limits:** Heavy concurrent sessions depend on upstream Gemini Live WebSocket quotas.
  - *Mitigation:* Quotas monitored via Sidekiq failure queues.

---

## 5. Verification Commands
To reproduce and verify the release locally:
```bash
# 1. Verify Definition of Ready gate
node scripts/verify-dor.js

# 2. Run Web regression suite & build
cd web && npm test -- --run && npm run build

# 3. Run API regression suite
cd ../api && bundle exec rspec
```
