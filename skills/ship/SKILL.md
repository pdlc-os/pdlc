# Ship Protocol

## When this skill activates

Activate at the start of the **Ship sub-phase** of Operation, triggered by `/pdlc ship`. This skill governs the complete sequence from merge through deployment, versioning, and tagging. Do not begin the Ship protocol unless Construction (Build + Review + Test) is fully complete and the Constitution test gates have passed.

---

## Protocol

Execute the following steps in strict sequence. Do not skip or reorder steps.

### Step 1 — Verify Constitution test gates

1. Read the active episode file at `docs/pdlc/memory/episodes/[episode-id].md`. Find the Test Summary section.
2. Read `docs/pdlc/memory/CONSTITUTION.md`. Find the "Test gates" section. Identify which layers are required to pass.
3. For each required layer: confirm its status in the Test Summary is "Pass" or "Accepted" (human-approved).
4. If any required layer shows "Fail" and was not explicitly accepted by the human: stop. Do not proceed. State: "Constitution test gate not satisfied: [layer name] failed and was not accepted. Resolve before shipping."
5. If all required gates are satisfied: proceed to Step 2.

### Step 2 — Verify human PR approval

1. Read `docs/pdlc/memory/STATE.md`. Check for a "PR approved" or equivalent entry.
2. If no PR approval is recorded: ask the human directly: "Has the PR for [feature-name] been approved? Please confirm before I proceed with the merge."
3. Wait for explicit confirmation. Do not proceed without it.
4. Once confirmed: proceed to Step 3.

### Step 3 — Merge commit

Use a merge commit. Never squash. Never rebase. Preserving the full branch history is a non-negotiable requirement of the PDLC merge strategy.

```bash
git checkout main
git pull origin main
git merge --no-ff feature/[feature-name]
```

- If merge conflicts arise: stop. Surface the conflicting files to the human. Ask: "Merge conflicts detected in [files]. Please resolve them and let me know when ready."
- Do not auto-resolve merge conflicts. Wait for human resolution.
- Once the merge is clean: proceed to Step 4.

### Step 4 — Push to main

```bash
git push origin main
```

- If the push is rejected (e.g. remote has diverged): stop. Do not force-push. Report to human: "Push rejected — remote main has diverged. Please advise on resolution before I continue."
- Force-pushing to main is a Tier 1 guardrail. It must not happen without double-RED confirmation (see `skills/safety-guardrails.md`).

### Step 5 — Trigger CI/CD

Pulse coordinates CI/CD. Determine the deployment trigger:

1. Check for a `.github/workflows/` directory. Look for workflow files with `on: push` to `main` or a `deploy` trigger. If found: CI/CD has been triggered by the push. Note the workflow file name.
2. Check for a `Makefile` with a `deploy` or `release` target. If found: run `make deploy` (or `make release`) after confirming with the human that this is the correct command.
3. Check `package.json scripts` for `deploy`, `release`, or `publish` entries. If found: run `npm run deploy` (or equivalent) after human confirmation.
4. If no deployment trigger is found: ask the human: "I couldn't find a configured deployment trigger. How should I trigger the CI/CD pipeline?"
5. Record in `docs/pdlc/memory/STATE.md`: CI/CD triggered via [method], at [timestamp].

### Step 6 — Generate CHANGELOG entry and release notes

Jarvis generates the CHANGELOG entry. Provide Jarvis with:
- The feature name and episode ID
- The complete list of Beads tasks completed in this cycle (read from the episode file)
- The test summary from the episode file
- Any tech debt or known tradeoffs recorded in the episode file

Jarvis produces:
- A CHANGELOG entry in the format defined in `docs/pdlc/memory/CHANGELOG.md` (check existing entries for the format convention)
- A release notes summary (2–5 sentences, human-readable, suitable for a GitHub release or announcement)

Append the CHANGELOG entry to `docs/pdlc/memory/CHANGELOG.md`. Do not overwrite existing entries.

### Step 7 — Determine semantic version bump

Analyze what was shipped in this feature cycle:

- **Patch** — bug fixes, minor tweaks, documentation-only changes, internal refactors with no API or behavioral change.
- **Minor** — new features, new API endpoints, new UI components, backwards-compatible additions to existing interfaces.
- **Major** — breaking changes (removed APIs, changed API contracts, removed UI features, significant architectural shifts that require consumer updates).

When determining the bump:
1. Read the list of completed Beads tasks and their labels.
2. Read the PRD to understand the scope of what shipped.
3. Read `docs/pdlc/design/[feature-name]/api-contracts.md` for any contract changes.
4. If the classification is not obvious, or if any task could be argued as Minor vs Major: ask the human. State your reasoning and proposed bump, then ask for confirmation.

Once determined: proceed to Step 8.

### Step 8 — Tag the commit

Read the current version from `docs/pdlc/memory/CHANGELOG.md`, `package.json`, or the latest git tag (`git describe --tags --abbrev=0`). Apply the version bump from Step 7.

```bash
git tag v[X.Y.Z] -m "[feature name]"
```

Example:
```bash
git tag v1.3.0 -m "User authentication feature"
```

### Step 9 — Push the tag

```bash
git push origin v[X.Y.Z]
```

Confirm the tag is visible on the remote. If the project uses GitHub Releases: create a GitHub Release using the release notes from Step 6. Use the tag just pushed as the release target.

### Step 10 — Update STATE.md

Update `docs/pdlc/memory/STATE.md`:

- Phase: Operation/Verify
- Last shipped: [feature-name] v[X.Y.Z] at [timestamp]
- CI/CD: triggered via [method]
- Tag: v[X.Y.Z] pushed
- Next step: Verify sub-phase

Report to human: "Ship complete. [feature-name] merged to main, tagged as v[X.Y.Z], CI/CD triggered. Proceeding to Verify."

---

## Rules

- Merge strategy is always merge commit (`--no-ff`). Squash and rebase are forbidden.
- Never force-push to main. This is a Tier 1 guardrail (double-RED confirmation required if human explicitly requests it).
- Do not begin the Ship sequence unless Constitution test gates are verified as passed (or explicitly accepted by human).
- Do not push the merge without explicit human PR approval — either confirmed in STATE.md or confirmed verbally in this session.
- Do not auto-resolve merge conflicts. Surface them to the human.
- Semver bump determination must be explicit. When ambiguous, ask the human — do not guess.
- The CHANGELOG must be updated before the tag is pushed. Do not tag first and update docs later.
- All steps must be recorded in STATE.md as they are completed. If the session ends mid-Ship, STATE.md must reflect exactly where the sequence was paused.

---

## Output

- Feature branch merged to main via `git merge --no-ff`.
- Main pushed to origin.
- CI/CD pipeline triggered.
- CHANGELOG entry appended to `docs/pdlc/memory/CHANGELOG.md`.
- Release notes generated.
- Commit tagged as `v[X.Y.Z]` and tag pushed to origin.
- `docs/pdlc/memory/STATE.md` updated: phase set to Operation/Verify.
- Human notified of successful ship and next step (Verify sub-phase).
