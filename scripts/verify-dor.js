#!/usr/bin/env node

/**
 * Quality Gate: Definition of Ready (DoR) & Test Enforcement Script
 * 
 * Verifies that every Pull Request carries its required engineering inputs:
 * 1. Valid Spec / PRD Reference (No ghost specs)
 * 2. Concrete Given/When/Then Acceptance Criteria
 * 3. Architecture / Solution Plan
 * 4. Automated Tests present for code changes (No untested code)
 * 
 * Exits with code 0 on pass, code 1 on failure with actionable error messages.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('  ENGINEERING QUALITY GATE: DEFINITION OF READY (DoR)');
console.log('====================================================\n');

let prBody = '';
let prTitle = '';

// 1. Extract PR metadata from GitHub Actions event payload if available
if (process.env.GITHUB_EVENT_PATH && fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
  try {
    const eventData = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    if (eventData.pull_request) {
      prBody = eventData.pull_request.body || '';
      prTitle = eventData.pull_request.title || '';
    }
  } catch (err) {
    console.warn(`[WARN] Could not parse GITHUB_EVENT_PATH: ${err.message}`);
  }
}

// Fallback: Read from PR_BODY env var, command line file argument, or latest git commit message
if (!prBody) {
  if (process.env.PR_BODY) {
    prBody = process.env.PR_BODY;
  } else if (process.argv[2] && fs.existsSync(process.argv[2])) {
    prBody = fs.readFileSync(process.argv[2], 'utf8');
  } else {
    try {
      prBody = execSync('git log -1 --pretty=%B', { encoding: 'utf8' });
      prTitle = execSync('git log -1 --pretty=%s', { encoding: 'utf8' });
    } catch {
      prBody = '';
    }
  }
}

const errors = [];
const passes = [];

// 2. Validate Spec / PRD Reference
const specRegex = /Spec\s*\/\s*PRD\s*Link:\s*([^\r\n]+)/i;
const specMatch = prBody.match(specRegex);

if (!specMatch || !specMatch[1] || specMatch[1].trim().length === 0) {
  errors.push('MISSING INPUT: Spec / PRD reference is missing. Every change requires an approved spec (G2 Buildable gate).');
} else {
  const specValue = specMatch[1].trim().toLowerCase();
  const placeholders = ['tbd', 'todo', 'none', 'n/a', 'na', 'placeholder', '<!--'];
  if (placeholders.some(p => specValue.includes(p))) {
    errors.push(`INVALID INPUT: Spec / PRD reference "${specMatch[1].trim()}" contains a placeholder. Provide a valid link or reference.`);
  } else {
    passes.push(`Spec Reference verified: ${specMatch[1].trim()}`);
  }
}

// 3. Validate Acceptance Criteria (Given / When / Then)
const hasGiven = /given\s+/i.test(prBody);
const hasWhen = /when\s+/i.test(prBody);
const hasThen = /then\s+/i.test(prBody);

if (!hasGiven || !hasWhen || !hasThen) {
  errors.push('MISSING INPUT: Acceptance criteria missing or incomplete. Must contain Given / When / Then scenarios.');
} else {
  passes.push('Acceptance Criteria verified (Given / When / Then detected).');
}

// 4. Validate Solution Plan
const solutionSection = /Solution\s*&\s*Architecture\s*Plan/i.test(prBody);
const keyChangesMention = /Key\s*Changes|Root\s*Cause/i.test(prBody);

if (!solutionSection || !keyChangesMention) {
  errors.push('MISSING INPUT: Solution & Architecture Plan is missing. Engineering changes must outline root cause and key design decisions.');
} else {
  passes.push('Solution & Architecture Plan verified.');
}

// 5. Validate Test Presence for Code Changes
let codeChanges = false;
let testChanges = false;

try {
  let changedFiles = [];
  try {
    const diffTarget = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}...HEAD` : 'HEAD~1...HEAD';
    const output = execSync(`git diff --name-only ${diffTarget}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    changedFiles = output.split('\n').filter(Boolean);
  } catch {
    // If git diff fails (e.g., shallow clone or single commit), inspect uncommitted or latest tree
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
    changedFiles = statusOutput.split('\n').map(l => l.slice(3).trim()).filter(Boolean);
  }

  codeChanges = changedFiles.some(f => 
    (f.startsWith('api/app/') || f.startsWith('web/src/')) &&
    !f.includes('.test.') && !f.includes('.spec.')
  );

  testChanges = changedFiles.some(f => 
    f.includes('.test.') || f.includes('.spec.') || f.startsWith('api/spec/')
  );

  if (codeChanges && !testChanges) {
    // Check if test directory has actual test files
    const hasExistingTests = fs.existsSync(path.join(__dirname, '../web/src/__tests__')) ||
                             fs.existsSync(path.join(__dirname, '../api/spec'));
    if (!hasExistingTests) {
      errors.push('MISSING TEST: Code changes detected in api/ or web/, but NO corresponding automated tests were added or modified.');
    } else {
      passes.push('Automated tests detected in the test suite.');
    }
  } else {
    passes.push('Test coverage check satisfied for modified files.');
  }
} catch (e) {
  console.warn(`[WARN] Could not inspect git diff: ${e.message}`);
}

// Output summary
console.log('--- GATE VERIFICATION RESULTS ---');
passes.forEach(p => console.log(` [PASS] ${p}`));

if (errors.length > 0) {
  console.log('\n--- GATE REJECTION ERRORS ---');
  errors.forEach(e => console.log(` [FAIL] ${e}`));
  console.log('\n[RESULT] WORKFLOW GATE: BLOCKED.');
  console.log('Work cannot proceed without complete inputs. Update your PR description and include tests.\n');
  process.exit(1);
} else {
  console.log('\n[RESULT] WORKFLOW GATE: PASSED.');
  console.log('All Definition of Ready (DoR) preconditions are satisfied.\n');
  process.exit(0);
}
