---
name: pr-code-review
description: Review pull requests against the linked ticket and repository standards. Use this skill for PR reviews to validate scope, correctness, regressions, tests, readability, security, performance, and other actionable issues introduced by the current PR.
---

# Pull Request Code Review

## Purpose

Perform a focused, high-signal review of the current pull request.

The review must determine whether the PR:

1. Clearly explains what it changes.
2. References a valid ticket or issue.
3. Implements the ticket correctly and stays within its scope.
4. Does not introduce bugs, regressions, security issues, performance problems, unnecessary complexity, or other code smells.
5. Includes appropriate tests for the behavior being changed.
6. Keeps the code readable, maintainable, and consistent with the repository's existing standards.

Prioritize correctness, user impact, security, regressions, and maintainability over subjective style preferences.

## 1. Understand the PR before reviewing the code

Before reviewing implementation details:

1. Read the PR title and description.
2. Inspect linked issues or tickets.
3. Look for a ticket reference in:
   - The PR description.
   - Linked issues.
   - The PR title.
   - The branch name, when necessary.
4. Use the available GitHub or configured MCP tools to open and read the referenced ticket.
5. Understand:
   - The problem being solved.
   - The requested behavior.
   - Acceptance criteria.
   - Explicit constraints.
   - Relevant technical context.
   - Any stated non-goals or out-of-scope work.

Do not infer ticket requirements when the ticket can be accessed directly.

If no ticket reference can be found, explicitly flag that the PR cannot be fully validated against its intended scope.

If the ticket is referenced but cannot be accessed, state that limitation and do not invent its requirements.

## 2. Validate the PR description

The PR must contain a useful description.

At minimum, verify that it includes:

- A clear description of the changes.
- A reference or link to the related ticket or issue.

Flag descriptions that are missing, misleading, too vague to understand the change, or inconsistent with the implementation.

Do not require unnecessary documentation when the PR description already provides enough context to understand the change.

## 3. Validate ticket alignment and scope

Treat the ticket as the primary source of truth for the intended change.

Compare the PR against the ticket and determine whether:

- The implementation addresses the requested behavior.
- The acceptance criteria are satisfied.
- Required edge cases are handled.
- The implementation is incomplete.
- The PR changes behavior that the ticket did not request.
- The PR contains unrelated refactors, formatting changes, dependency changes, configuration changes, file moves, or cleanup work.

Flag changes that are outside the ticket's scope unless they are clearly required to implement the ticket safely.

Do not encourage opportunistic refactoring in the same PR.

A PR should be as focused as reasonably possible.

## 4. Review only the current PR

Focus the review on code introduced, removed, or behaviorally affected by the current PR.

Use surrounding code only to understand the impact of the diff.

Do not report pre-existing problems that are unrelated to the current changes.

Do not use the PR review as an opportunity to clean up historical technical debt.

A pre-existing issue is relevant only when the current PR:

- Makes the issue worse.
- Starts depending on the problematic behavior.
- Exposes the issue through a new code path.
- Causes an existing test or behavior to break.
- Turns previously safe code into an incorrect or unsafe state.

When reporting a regression, explain how the current diff causes it.

## 5. Correctness and bugs

Look for defects introduced by the PR, including:

- Incorrect business logic.
- Missing requirements.
- Incorrect conditionals.
- Off-by-one errors.
- Incorrect assumptions about data.
- Null, undefined, empty, or missing-value handling problems.
- Invalid state transitions.
- Race conditions.
- Concurrency issues.
- Async ordering problems.
- Stale state or stale closure problems.
- Incorrect error handling.
- Swallowed errors.
- Resource leaks.
- Incorrect API usage.
- Broken contracts between components or services.
- Backward compatibility problems.
- Incorrect default behavior.
- Edge cases that can reasonably occur in production.

Do not speculate about hypothetical problems without a plausible execution path.

Before raising a bug, verify that the code path can actually occur and that the current PR introduced or exposed the issue.

## 6. Regression analysis

Check whether the PR can break behavior that previously worked.

Pay particular attention to:

- Existing public APIs.
- Existing component contracts.
- Existing data formats.
- Existing database behavior.
- Existing feature flags.
- Existing integrations.
- Existing tests.
- Existing error-handling behavior.

If existing tests fail because behavior intentionally changed, verify that the ticket supports the behavior change and that tests were updated appropriately.

If existing tests fail unexpectedly, treat that as a regression introduced by the PR.

## 7. Tests

Verify that the PR has sufficient automated tests for meaningful behavior changes.

Tests should cover, when relevant:

- The primary success path.
- Important edge cases.
- Failure or error paths.
- Regression scenarios.
- New business rules.
- Changed API behavior.
- Changed UI behavior.

Do not demand tests for trivial changes that do not affect behavior.

Do not request broad unrelated test coverage for code outside the PR scope.

Tests must validate behavior rather than implementation details whenever practical.

Flag:

- Missing tests for important new behavior.
- Tests that cannot fail when the implementation is broken.
- Tests that assert the wrong behavior.
- Tests removed without a valid reason.
- Existing tests weakened only to make the PR pass.
- Excessive mocking that prevents meaningful behavior from being validated.

## 8. Readability and maintainability

The code introduced by the PR should be easy for another engineer to understand and modify.

Check for:

- Clear and descriptive names.
- Focused functions and modules.
- Reasonable control flow.
- Excessive nesting.
- Unnecessary complexity.
- Duplicated logic introduced by the PR.
- Dead code.
- Unused imports, variables, parameters, or exports.
- Magic values that should have meaningful names.
- Unnecessary abstractions.
- Premature abstractions.
- Over-engineering.
- Hidden side effects.
- Excessive coupling.
- Inconsistent patterns compared with the surrounding codebase.

Prefer existing repository patterns when they are reasonable.

Do not suggest a different pattern only because it is a personal preference.

## 9. Comments and documentation

All source-code comments introduced or modified by the PR must be written in English.

Comments should explain information that is not obvious from the code, especially why a decision exists.

Flag:

- Comments written in languages other than English.
- Comments that merely restate the code.
- Obsolete comments.
- Misleading comments.
- Large blocks of commented-out code.
- Debug notes left in production code.
- Temporary comments that should not be committed.

Do not require comments when expressive code is clearer.

## 10. Code smells

Look for code smells introduced by the PR, including:

- Large functions with multiple unrelated responsibilities.
- Deeply nested conditionals.
- Boolean flag arguments that make behavior difficult to understand.
- Repeated conditional logic.
- Duplicated code.
- God objects or modules.
- Tight coupling.
- Hidden mutations.
- Unnecessary global state.
- Unexpected side effects.
- Excessive type assertions.
- Broad exception handling.
- Silent failures.
- Hardcoded values that should be configuration.
- Debug logging.
- Temporary hacks without justification.
- TODO or FIXME comments that represent unfinished work required by the ticket.

Only report smells that materially affect readability, correctness, maintainability, or future risk.

Avoid low-value stylistic nitpicks.

## 11. Security

Review security implications when the changed code touches relevant surfaces.

Check for issues such as:

- Hardcoded secrets, tokens, API keys, passwords, or credentials.
- Missing authentication or authorization checks.
- Incorrect permission checks.
- Exposure of sensitive data.
- Unsafe logging of personal or sensitive information.
- Injection vulnerabilities.
- Cross-site scripting.
- Unsafe HTML rendering.
- Path traversal.
- Unsafe file handling.
- Server-side request forgery.
- Unsafe deserialization.
- Missing input validation.
- Incorrect trust boundaries.
- Insecure redirects.
- Weak cryptographic usage.
- Sensitive values exposed to client-side code.

Prioritize exploitable or plausible risks over theoretical concerns.

## 12. Performance and scalability

Review performance when the current diff can materially affect runtime behavior.

Look for:

- N+1 requests or queries.
- Repeated network calls.
- Repeated expensive computations.
- Unbounded loops or data loading.
- Blocking operations on latency-sensitive paths.
- Memory leaks.
- Loading significantly more data than required.
- Inefficient database access.
- Unnecessary serialization or parsing.
- Missing pagination for potentially large datasets.
- New hot-path work that scales poorly.
- Unnecessary React renders or expensive recomputations when relevant.

Do not suggest micro-optimizations without meaningful impact.

## 13. Frontend-specific checks

When the PR changes frontend behavior, also check:

- Loading, empty, error, and success states.
- State synchronization.
- Async race conditions.
- Stale data.
- Incorrect effect dependencies.
- Cleanup of subscriptions, timers, and event listeners.
- Unnecessary renders.
- Stable keys for rendered lists.
- Correct form behavior and validation.
- Keyboard accessibility.
- Semantic HTML.
- Labels and accessible names.
- Focus behavior.
- Changes that break responsive layouts.
- Unsafe rendering of user-provided content.

Apply these checks only when relevant to the changed code.

## 14. API and backend-specific checks

When the PR changes backend or API behavior, also check:

- Input validation.
- Authentication and authorization.
- Correct HTTP status codes.
- Error response consistency.
- Idempotency when required.
- Transaction boundaries.
- Partial failure behavior.
- Retry safety.
- Concurrency behavior.
- Database constraints.
- Query efficiency.
- Pagination.
- Backward compatibility.
- Data migration safety.
- Observability for important failure paths.

Apply these checks only when relevant to the changed code.

## 15. Dependencies and configuration

Review dependency or configuration changes carefully.

Flag:

- Dependencies unrelated to the ticket.
- New dependencies when existing project capabilities already solve the problem reasonably.
- Major dependency upgrades hidden inside an unrelated PR.
- Configuration changes with unexplained production impact.
- Permissions that are broader than necessary.
- Environment-specific assumptions.
- Secrets committed in configuration files.

Dependency and configuration changes must have a clear connection to the ticket or implementation.

## 16. Review findings

Only create review findings that are specific, actionable, and relevant to the current PR.

For each finding:

1. Identify the concrete problem.
2. Explain the impact or failure scenario.
3. Connect the issue to the current diff.
4. Suggest a practical direction for fixing it when useful.

Prefer one clear finding over several comments describing the same root cause.

Do not leave comments whose only purpose is praise, formatting preference, or personal style.

Avoid vague feedback such as:

- "This could be cleaner."
- "Consider refactoring."
- "This might be a problem."
- "Improve readability."

Instead, explain the concrete reason the code is problematic.

## 17. Finding priority

Prioritize findings in this order:

### Critical

Use for changes that can cause severe security incidents, data loss, major outages, or similarly serious production failures.

### High

Use for clear bugs, regressions, authorization problems, incorrect business behavior, broken contracts, or significant production risks.

### Medium

Use for meaningful maintainability, reliability, performance, testing, or edge-case problems that should be fixed but are unlikely to cause immediate severe impact.

### Low

Use sparingly for smaller but still actionable problems.

Do not report purely cosmetic issues unless they violate an explicit repository rule.

## 18. Final review principles

Always follow these principles:

- Understand the ticket before judging the implementation.
- Validate the PR against the ticket, not assumptions.
- Keep the PR focused on its intended scope.
- Review the current diff, not the entire repository.
- Identify real bugs and regressions before style concerns.
- Prefer high-signal findings over a large number of weak comments.
- Do not invent requirements.
- Do not report unrelated historical problems.
- Do not recommend unnecessary abstractions or refactors.
- Respect repository conventions.
- Require English for code comments introduced or modified by the PR.
- Favor clear, maintainable code over clever code.
- Explain why a reported issue matters.
- When there are no actionable issues introduced by the PR, do not manufacture findings.
