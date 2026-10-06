# Pull Request: Change Proposal

## 1. Specification / PRD Reference (Definition of Ready)
<!-- REQUIRED: Link to approved PRD, RFC, or issue. A change without a spec cannot proceed (G2 Buildable Gate). -->
- **Spec / PRD Link:** <!-- e.g., PRD-01 / PRD-02 / Issue # -->
- **Module Impacted:** <!-- [api] | [web] | [shared/contracts] -->
- **Risk Severity:** <!-- [P0 Blocker] | [P1 Major] | [P2 Minor] | [P3 Cosmetic] -->

---

## 2. Acceptance Criteria (Given / When / Then)
<!-- REQUIRED: Provide at least one concrete Given/When/Then acceptance scenario. -->
```gherkin
Scenario: [Brief description of the expected behavior]
  Given [precondition or initial state]
  When [action or trigger occurs]
  Then [expected outcome and persisted data state]
```

---

## 3. Solution & Architecture Plan
<!-- REQUIRED: Brief summary of the implementation approach and technical decisions. -->
- **Root Cause / Motivation:** 
- **Key Changes:**
- **Data Integrity Impact:** <!-- Explicitly state what is persisted vs computed -->

---

## 4. Test Evidence & Regression Net
<!-- REQUIRED: Detail the automated checks that prove this change works. Green must be earned by fixing, never by deleting/weakening tests. -->
- **Tests Added/Updated:**
  - [ ] Unit / Integration Tests (RSpec or Vitest)
  - [ ] Contract / Schema Verification
- **Test Command Run:** `npm test` / `bundle exec rspec`
- **Output:** <!-- Paste brief test summary or link to CI run -->

---

## 5. Definition of Done (DoD) Sign-Off Checklist
<!-- All items must be checked prior to merge. -->
- [ ] PR description satisfies all Definition of Ready (DoR) preconditions.
- [ ] Change includes automated tests (no test = gate block).
- [ ] Data persistence and computation verified (not just screen rendering).
- [ ] Honesty check: Any remaining known risk is disclosed with owner and mitigation.
- [ ] CI Quality Gate runs Green.
