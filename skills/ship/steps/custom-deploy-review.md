# Party Mode: Deployment Review

**Topic slug:** `deployment-review`
**Trigger:** Ship Step 9.2 — the user supplied a custom deployment, CI/CD, or build artifact and Pulse has composed a draft plan that layers that artifact onto PDLC's default pipeline.
**Purpose:** Verify, from every agent's domain, that the composed deployment plan is safe, correct, and consistent with the project's constitution before the deploy executes. User preferences take precedence — this meeting surfaces risks so the user can make an informed choice.

---

## Participants

The full team — 9 built-in agents plus any matching custom agents from `.pdlc/agents/`. Pulse leads (current phase lead) and synthesizes the consolidated plan at the end.

---

## Context to Load

Before spawning agents, gather:

- **User's custom artifact(s)** — file paths, pasted scripts, or workflow YAML the user provided in Step 9.1. Read every artifact in full.
- **Pulse's composed-plan draft** from Step 9.2 — the merge of user artifact + PDLC pipeline scaffolding.
- `docs/pdlc/memory/DEPLOYMENTS.md` — current environment register for the target environment(s).
- `docs/pdlc/memory/CONSTITUTION.md` — tech stack (§1), architectural constraints (§3), security requirements (§4), test gates (§7), safety overrides (§8).
- `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md` — deployment-relevant acceptance criteria (anything mentioning environments, rollout, feature flags, smoke URLs).

Pass this full context to every agent spawn. Do not abbreviate the artifact — agents must see the actual script content.

---

## Durable Checkpoint

Follow `skills/build/party/orchestrator.md` for the pending-file protocol. Write `docs/pdlc/memory/.pending-party.json` with `meetingType: "deployment-review"` at the start.

---

## Round 1 — Per-agent assessment

Each agent receives the user's artifact(s), the composed plan, and the context above. Each answers one focused question from their domain:

| Agent | Focus | Question |
|-------|-------|----------|
| **Pulse** (DevOps) | Overall ops safety | Does the composed plan preserve a viable rollback path? Are environment variables, secrets, and infra dependencies handled consistently with `DEPLOYMENTS.md`? Does it respect the promotion path (dev → staging → prod)? |
| **Neo** (Architect) | Architectural soundness | Does the deploy plan align with the system architecture in `ARCHITECTURE.md`? Any architectural constraint from `CONSTITUTION.md` §3 violated by the user's artifact? |
| **Phantom** (Security) | Secret & credential safety | **Loud check:** any hardcoded secrets, credentials, API keys, or tokens in the user's artifact? Any public URL that exposes internal services? Any privilege escalation in the deploy user? Missing auth on deploy-triggered endpoints? |
| **Echo** (QA) | Pipeline correctness | Does the composed plan run the Constitution's required test gates? Are any gates skipped or reordered in a way that lets bad code ship? |
| **Bolt** (Backend) | Backend deploy correctness | Migration ordering correct? Backward compatibility during the deploy window? Long-running jobs handled? DB connection pools drained/restored correctly? |
| **Friday** (Frontend) | Frontend build & deploy | Build step produces the expected artifacts? Cache invalidation handled? Static assets versioned? Any breaking change to public routes? |
| **Muse** (UX) | User-facing impact | Does the deploy introduce downtime, degraded UX, or a mid-session state change that affects users? Any feature-flag rollout the user's script skips? |
| **Oracle** (PM) | PRD conformance | Does the composed deploy plan match the rollout expectations stated in the PRD (environments, phasing, feature flags)? Any scope creep introduced by the custom artifact? |
| **Jarvis** (Tech Writer) | Traceability & docs | Is the deploy self-documenting — logs, versioned artifacts, a recorded source-of-truth? Will `DEPLOYMENTS.md` capture the custom artifact reference? Is the rollback command documented? |

**Custom agents:** any agent in `.pdlc/agents/` with `always_on: true` or matching `auto_select_on_labels` also participates, answering from their focus areas per their persona file.

Each agent produces:
```
Agent: [name]
Severity: [None | Advisory | Important | Critical]
Finding: [concrete issue — cite file:line from the artifact where applicable]
Recommendation: [specific action — adopt as-is / modify / remove / add]
```

Update `.pending-party.json`: set `"progress": "round-1-complete"`.

---

## Round 2 — Cross-talk

Pulse identifies overlapping findings (where two agents flagged the same underlying issue from different angles) and routes them for a single-fix resolution:

- If Phantom flags a hardcoded secret AND Pulse flags a missing env-var handoff → route to both: "same root cause — the script should read from the secrets store. Propose the single fix."
- If Echo flags a skipped test layer AND Neo flags an architectural invariant that test protects → route to both.
- If Oracle flags missing PRD conformance AND Muse flags a UX impact → route to both.

Maximum one cross-talk round. Update `.pending-party.json`: set `"progress": "cross-talk-complete"`.

---

## Round 3 — Pulse synthesizes the consolidated plan

Pulse produces the final consolidated plan as a structured document with three sections:

### Adopted from user
Every step from the user's artifact that survives unchanged. Quote command, file path, or workflow step.

### Layered on top (PDLC scaffolding)
Steps added around the user's artifact to preserve PDLC guarantees — semver tagging, smoke tests, DEPLOYMENTS.md recording, episode drafting, rollback tag.

### Modifications to user's artifact
Specific changes Pulse recommends based on Round 1/2 findings. For each:
- **Change:** [what line/step to modify]
- **Reason:** [which agent finding motivates it]
- **Severity if not applied:** [Advisory / Important / Critical]

### Findings accepted without modification
Agents raised concerns but the user's preference is preserved. Listed explicitly so the user can override their own preference after seeing the full picture.

### Tier 1 blocks
Any **Critical** security findings (hardcoded secrets, credentials, exposed internal URLs) become Tier 1 hard blocks. These are **not** "accepted without modification" — they must be resolved before deploy. If the user insists on proceeding, they must run `/pdlc override`, which is permanently logged.

---

## Write MOM

Write to: `docs/pdlc/mom/MOM_deployment_[feature-name]_[YYYY-MM-DD].md`

Structure:
```markdown
# Deployment Review: [feature-name]

**Date:** [today]
**Feature:** [feature-name]
**Version:** [v-X.Y.Z]
**Target environment(s):** [from DEPLOYMENTS.md]
**User's artifact(s):** [paths or inline source]

---

## Round 1 — Per-agent assessments

[For each agent that produced findings:]

### [Agent Name] ([Role])
- **Severity:** [None | Advisory | Important | Critical]
- **Finding:** [concrete issue]
- **Recommendation:** [specific action]

[For agents with no findings:]
### [Agent Name] ([Role])
- No concerns identified.

---

## Round 2 — Cross-talk

[List linked findings and single-fix resolutions, or "No cross-linking needed — findings were domain-isolated."]

---

## Consolidated plan

### Adopted from user
- [step 1]
- [step 2]

### Layered on top (PDLC scaffolding)
- [step 1]
- [step 2]

### Modifications to user's artifact
| # | Change | Reason | Severity if skipped |
|---|--------|--------|---------------------|
| 1 | ... | ... | ... |

### Findings accepted without modification
- [finding 1 — user preference preserved]
- [finding 2 — user preference preserved]

### Tier 1 blocks
- [list any Critical findings that must be resolved before deploy, or "None."]
```

Update `.pending-party.json`: set `"progress": "mom-written"` and `"momFile": "[path]"`.

---

## Present to user

Pulse presents the consolidated plan summary:

> "**Deployment Review complete.**
>
> [N] of [total participating] agents raised findings.
>
> **Consolidated plan:**
> - Adopted from your artifact: [N] steps
> - PDLC scaffolding layered on top: [N] steps
> - Recommended modifications to your artifact: [N] ([M] Critical, [K] Important, [L] Advisory)
>
> [If any Tier 1 blocks:]
> **🔴 Tier 1 hard blocks ([N]):**
> - [Critical finding 1] — cite `[file:line]`
> - [Critical finding 2] — cite `[file:line]`
>
> These must be resolved before deploy, or override via `/pdlc override` (permanently logged).
>
> [If no Tier 1 blocks:]
> **Your preferences take precedence.** Choose:
> - **proceed** — execute the consolidated plan as drafted (includes recommended modifications)
> - **proceed as-is** — execute your artifact unchanged (skip PDLC's recommended modifications; accepted findings logged)
> - **modify** — tell me which modifications to apply and which to skip
> - **abort** — cancel the deploy
>
> Full review details: `docs/pdlc/mom/MOM_deployment_[feature-name]_[date].md`"

Wait for the user's choice. Apply their direction.

Update `.pending-party.json`: set `"progress": "presented"`.

---

## On completion

Delete `.pending-party.json`. Return to **Step 9.3** in `skills/ship/steps/01-ship.md` with the consolidated plan as the deploy plan to execute.

---

## Rules

- **User preference is the tiebreaker** on non-Tier-1 conflicts. Surface the disagreement in the MOM; don't suppress it.
- **Critical security findings are Tier 1.** No "accepted without modification" path for hardcoded secrets, credentials, or exposed internal URLs — the user must fix them or formally override.
- **The review is required when the user provides a custom artifact.** It cannot be skipped in normal ship flow (hotfix is a separate flow and skips it — see `skills/hotfix/SKILL.md`).
- **Read every artifact in full.** Abbreviating the deploy script is how a hardcoded key slips past Phantom.
- **DEPLOYMENTS.md is updated at Step 9.4 (record deploy)** with a reference to this MOM file, so future sessions can trace why the deploy was shaped this way.
