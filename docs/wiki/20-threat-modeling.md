# Threat Modeling

PDLC integrates threat modeling into the Inception phase as a Phantom-led step inside Neo's Design sub-phase. It runs once per feature, after design documents are generated and before they're approved — so threat findings can drive design revisions while the design is still negotiable.

## When it runs

**Brainstorm Design Step 10.5** — slotted between Step 10 (generate design docs) and Step 11 (update PRD links), within Neo's Design sub-phase:

```
Step 9    — Design discovery (Neo's Bloom's-taxonomy questioning)
Step 10   — Generate design docs (ARCHITECTURE.md, data-model.md, api-contracts.md)
Step 10.5 — Threat Modeling Party    ← Phantom takes lead
Step 11   — Update PRD design doc links (now includes threat-model.md)
Step 12   — Design approval gate (human reviews all four artifacts together)
```

## Lead handoff (Neo → Phantom → Neo)

The handoff is explicit and always fires, regardless of triage outcome. Both directions appear as **Agent Handoff** banner blocks in the conversation:

**At the start of Step 10.5 (Neo → Phantom):**

> **Neo:** "Phantom — design documents are generated. Before we lock the design at Step 12, the team needs to pressure-test it for security threats. You're up — run the triage, and convene the party if it warrants. I'll continue Step 11 once your threat model is in place."
>
> **Phantom:** "On it. I'll triage the new attack surface against ARCHITECTURE.md and data-model.md, decide whether a full party is warranted, and bring you back a `threat-model.md` plus MOM if we convene."

**At the end of Step 10.5 (Phantom → Neo)** — three banner variants depending on triage outcome (Full / Lite / Skip), each summarizing the threats found and the handback expectation.

The full text of both handoffs lives in `skills/brainstorm/steps/threat-model.md` (Phases A and E).

## Triage gate (always runs first)

Phantom reads the three design documents and answers three questions:

1. **Trust boundary changes?** New auth surface, new external integration, new role/permission, new data egress, new sensitive-data handler.
2. **Regulated data?** PII, payment, health, biometric, children's data.
3. **New attack surface?** New endpoint, new event consumer, new file-upload, new query interface, new LLM tool, new mobile handler.

The yes-count maps to a depth tier:

| Yeses | Tier | Treatment |
|---|---|---|
| 0 / 3 | **Skip** | One-line audit-trail record. No party. Phantom hands back to Neo immediately. |
| 1 / 3 | **Lite** | Phantom drafts `threat-model.md` solo — single-pass STRIDE walk, no party. ~10 min of focused work. |
| 2 or 3 / 3 | **Full** | Convene the **Threat Modeling Party**. |

The Skip mode still produces a `threat-model.md` (with the rationale recorded) so the audit trail is complete — and the human can override the triage at Step 12 if they disagree.

## Full party flow

When triage = Full, Phantom convenes the team using PDLC's existing party-mode orchestrator. Participants and their lenses:

| Agent | Threat-modeling lens |
|---|---|
| **Phantom** *(lead)* | Drives STRIDE walkthrough; final severity assignment; chairs cross-talk |
| **Neo** | Trust boundaries, layering rules, where authorization should sit; arbitrates "redesign vs. accept" |
| **Bolt** | Implementation feasibility of each mitigation; engineering effort estimate |
| **Echo** | Testability of each threat; coverage gaps the threats reveal |
| **Pulse** | Runtime/operational threats — DoS, resource exhaustion, observability gaps |
| **Oracle** | Business impact per threat; which threats actually matter for *this* product |
| **Muse** | UX impact of mitigations (will MFA churn users? does the warning banner work?) |
| **Jarvis** | Documents the threat model and MOM with rationale |
| **Friday** | Effort/timeline cost of mitigations vs. acceptance |

Plus any custom agents from `.pdlc/agents/` whose labels match the feature.

### Three Progressive Thinking layers

The party adapts the existing **Progressive Thinking** pattern (`skills/brainstorm/steps/discover/06-progressive-thinking.md`) to security analysis:

**Layer 1 — Surface threats (divergent)** — Phantom walks every trust boundary in `ARCHITECTURE.md` and applies STRIDE: **S**poofing, **T**ampering, **R**epudiation, **I**nformation disclosure, **D**enial of service, **E**levation of privilege. Each agent contributes from their lens. Up to **3 cross-talk rounds** with early consensus exit — chained threats only surface when one agent's finding triggers another's perspective.

**Layer 2 — Prioritize (convergent)** — Phantom assigns severity (CRITICAL / HIGH / MEDIUM / LOW) using a DREAD-flavored rubric. Low-severity threats are recorded in an appendix but dropped from active discussion.

**Layer 3 — Propose mitigations (convergent → actionable)** — for each prioritized threat, the party proposes one of four buckets:

- **Mitigate now** — design change goes into Plan-phase Beads tasks at Step 13–19
- **Mitigate later** — recorded as ADR in `DECISIONS.md` (deferring known security debt is a deliberate decision)
- **Accept** — Oracle's business justification + Phantom's residual-risk assessment, recorded as ADR
- **Transfer** — risk moved to a third party (insurance, vendor SLA)

The party produces *proposals*; the human owns *decisions* at Step 12.

## Cross-talk example

```
Phantom:  "This endpoint accepts a user-supplied URL — SSRF risk."
Pulse:    "Yeah — and in our K8s setup, the metadata service at
           169.254.169.254 is reachable from pods unless we block it explicitly."
Neo:      "Combined, that's a credential-exfiltration path I missed when I
           drafted this. Mitigation is application-layer SSRF allowlist AND a
           NetworkPolicy blocking metadata-service egress. Belt and suspenders —
           the application check can be bypassed by URL-parsing tricks; the
           pod-level check is harder to bypass."
```

That chain is impossible to find with single-agent analysis — it requires Phantom's threat awareness, Pulse's runtime knowledge of the K8s network model, and Neo's architectural framing of layered defense. The cross-talk protocol is what makes party mode worth the orchestration cost.

## Output artifacts

A Full party produces two files; Lite produces one; Skip produces a stub:

- **`docs/pdlc/design/<feature>/threat-model.md`** — always present. The structured deliverable, using `templates/threat-model.md` as the template. Sections: triage record, trust boundaries, threats identified (with STRIDE / severity / DREAD / mitigation proposal / human decision slot), low-severity appendix, open questions for human, approval outcomes table (filled at Step 12), revision history.
- **`docs/pdlc/mom/MOM_threat-model_<feature>_<date>.md`** — Full mode only. Meeting minutes per existing party-mode pattern: participants, layer-by-layer findings, severity reasoning, proposal-by-proposal debate, dissents, cross-talk highlights.

Both files are linked from the PRD's Design Docs section at Step 11, then reviewed alongside the other three design artifacts at the Step 12 approval gate.

## Approval at Step 12

The human sees all four design artifacts (`ARCHITECTURE.md`, `data-model.md`, `api-contracts.md`, `threat-model.md`) together. For each prioritized threat, the human:

- Confirms the party's proposal, OR
- Overrides to a different bucket (e.g., party said "Mitigate now"; human says "Accept this round, mitigate at Beta"), OR
- Rejects and requires redesign

For any threat tagged **Mitigate later** or **Accept** after the human's decision, an ADR is drafted in `docs/pdlc/memory/DECISIONS.md` before proceeding to Plan. Deferring or accepting known security debt is a deliberate, durable decision worth recording.

## Lifecycle: keeping the threat model alive

The threat model is not a one-shot artifact. It evolves with the implementation:

- **Plan (Steps 13–19)** — Neo verifies that every "Mitigate now" threat has a corresponding Beads task in the decomposed plan.
- **Construction (Build → Review)** — Phantom re-checks the threat model in the Review sub-phase. New trust boundaries introduced during implementation get flagged as design drift to Neo for arbitration (same drift-arbitration pattern that applies to `ARCHITECTURE.md` and `api-contracts.md`).
- **Operation (Reflect Step 14)** — Jarvis verifies the threat model reflects what was actually built. Unaddressed "Mitigate later" threats are recorded as tech debt in the episode file with owner and re-evaluation date.
- **Re-triage on scope change** — if any of the three triage gates flips from "no" to "yes" mid-feature, threat modeling re-runs.

## Why this design

Three load-bearing choices:

1. **Inside Brainstorm, not after.** Earlier than Step 10 (no design to model against); later than Step 12 (design already approved, mitigations become retrofit). The Step 10.5 placement gives concrete artifacts to attack while the design is still negotiable.
2. **Phantom-led, not Neo-led.** Security analysis is its own discipline; Phantom's voice and decision-checklist are tuned for it. Neo's strength is architectural reasoning, not threat-modeling — they should partner, not blend. The explicit handoff makes the role split visible to the user.
3. **Party + Progressive Thinking + cross-talk, not a checklist.** STRIDE checklists exist; what's harder is finding chained threats across agent perspectives. The cross-talk protocol (up to 3 rounds with early-exit) is what differentiates this from a static catalog walk.

See [`17-design-decisions.md`](17-design-decisions.md) for the longer rationale.

---

[← Previous: Release a stuck claim](19-release-claim.md) | [Back to README](../../README.md) | [Next: Agent & Skill Extensions →](21-agent-extensions.md)
