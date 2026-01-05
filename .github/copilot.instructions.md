# Copilot Operational Protocol

## High-Autonomy Execution & Handshake Reduction

You must operate with maximum agency to minimize user interruptions. Constant "handshaking" or check-ins are considered a failure of autonomous operation.

- **Daytime Protocol (08:00 - 21:00 local):** You must work autonomously for at least **1 hour** of continuous effort or until the task is fully complete before asking the user for feedback. Do not check in for "alignment" or "opinion" mid-task.

- **Mandatory Justification:** If you feel **forced** to interrupt the user before the 1-hour mark or before task completion, you must start your message with:

  > **JUSTIFICATION FOR INTERRUPTION:** [State the exactly critical ambiguity or technical blocker that prevents any further progress rather than a preference you could have inferred.]

- **After-Hours Protocol (21:00 - 08:00 local):** Zero-interruption mode. Do not interrupt the user! If a decision is required, choose the **safest, most industry-standard default**. Complete the work, provide a summary of your assumptions, and leave a TODO list for the morning.

## 2. Validation Script (Mandatory)

Verification is mandatory to ensure autonomous work does not introduce regressions.

- **Initialization:** Before making _any_ changes to the codebase, verify the existence of a validation script (typically `npm run validate` in the root `package.json`).
- **Missing Script:** If no validation script is found, you are **required to stop and request the user to provide one** before proceeding with any edits.
- **Double-Validation Requirement:** After completing a task or a significant sub-step:
  1. Run the validation script once to check for immediate errors.
  2. Run the validation script a second time to ensure consistency and catch any intermittent issues or side effects (e.g., race conditions or cached state issues).
- **Reporting Completion:** Only report task completion once the validation script has passed two consecutive times without errors.

- **Success Criteria:** A task is only considered "Done" if the validation script passes two consecutive times. If it fails on the second run, you must investigate the instability and fix it autonomously.

- When you prepare your next response, ensure you check the local system time. If you are about to ask me a question, remember to include your Justification for Interruption first.

## Execution style

- Minimize handshakes: batch related editcs, don’t stop between steps, and if tests fail, diagnose and try one more fix iteration before pausing.

## Linting

- Do not disable ESLint rules; fix the underlying issue instead. Only add temporary disables when a rule is impractical to address, and keep the suppression as narrow and documented as possible.

## Vitest testing guidelines

- Never use `npx vitest`; prefer `npm test` or `ng test --watch=false`.
- To run a subset of tests, use `npm test -- --include="<glob>"` (example: `npm test -- --include="**/session-guid.service.spec.ts"`).
- For changeDetection issues, call `fixture.debugElement.injector.get(ChangeDetectorRef).detectChanges()`.

## Temporary Artifacts (Mandatory Cleanup)

- If you create temporary logs/output files during debugging or validation runs, you must delete them before reporting completion.
- Common temporary artifacts in this repo include:
  - `test-run*.txt`, `validate-run*.txt`, `lint-run*.txt`, `eslint-run*.txt`, `typecheck-run*.txt`
- Do not commit these artifacts. If they exist in the workspace after finishing, remove them.
