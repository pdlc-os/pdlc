# Threat Modeling Party

**Topic slug:** `threat-model`
**Trigger:** Brainstorm Design Step 10.5 — after the three design documents (`ARCHITECTURE.md`, `data-model.md`, `api-contracts.md`) are generated, **before** PRD design-doc links are updated (Step 11) and the design approval gate (Step 12).
**Lead:** **Phantom** (security authority for this party). Neo hands lead off at the start of Step 10.5 and receives lead back at the end. Both handoffs are explicit (banner blocks below).
**Purpose:** Pressure-test the just-generated design for security threats using **STRIDE per trust boundary**, then propose **mitigate now / mitigate later / accept / transfer** for each finding. Threat modeling output goes through the human approval gate at Step 12 alongside the design docs — it is not a separate gate, it is part of the same approval.

---

## Triage gate (always runs first)

Phantom reads the three design documents and answers three questions to decide the depth of treatment:

1. Does this feature introduce or modify a **trust boundary**? (new auth surface, new external integration, new role/permission, new data egress, new sensitive-data handler)
2. Does this feature touch **regulated data**? (PII, payment, health, biometric, children's data)
3. Does this feature add a **new attack surface**? (new endpoint, new event consumer, new file-upload, new query interface, new LLM tool, new mobile handler)

Each "yes" maps to a depth tier:

| Yeses | Tier | Treatment |
|---|---|---|
| 0 / 3 | **Skip** | Phantom records a one-line note in `threat-model.md`: *"No new trust boundaries, no regulated data, no new attack surface — threat modeling skipped per Phantom's triage."* No party convened. Hand back to Neo immediately. |
| 1 / 3 | **Lite** | Phantom drafts `threat-model.md` solo — single-pass STRIDE walk over the new attack surface, no party convened. Output goes through the human approval gate at Step 12 alongside the design docs. |
| 2 / 3 or 3 / 3 | **Full** | Convene the **Threat Modeling Party** described below. |

Record the triage outcome in the brainstorm log:
```
## Threat Modeling Triage
- Trust boundary changes: yes/no — [evidence]
- Regulated data: yes/no — [type if yes]
- New attack surface: yes/no — [list if yes]
- Triage tier: Skip / Lite / Full
```

---

## Phase A — Neo → Phantom handoff (always)

Output an **Agent Handoff** block (per `skills/formatting.md`) at the start of Step 10.5, before triage runs:

> **Neo (Architect):** "Phantom — design documents are generated and committed at `docs/pdlc/design/[feature-name]/` (`ARCHITECTURE.md`, `data-model.md`, `api-contracts.md`). Before we lock the design at Step 12, the team needs to pressure-test it for security threats. You're up — run the triage, and convene the party if it warrants. I'll continue Step 11 (PRD link updates) and walk us into the design approval gate at Step 12 once your threat model is in place. The three design docs are the source of truth for the trust-boundary walk, and if UX Discovery ran (Step 4.5), pull the user-flow diagram into your modeling — attackers think like users do."
>
> **Phantom (Security Reviewer):** "On it. I'll triage the new attack surface against ARCHITECTURE.md and data-model.md, decide whether a full party is warranted, and bring you back a `threat-model.md` plus MOM if we convene. If the triage comes out Skip, you'll have the file as a one-line record so the audit trail is complete either way."

---

## Phase B — Full party flow (when triage = Full)

### Participants

The full team — 9 built-in agents plus any matching custom agents from `.pdlc/agents/`. **Phantom leads** (current-step authority); the other agents contribute from their domains:

| Agent | Threat-modeling lens |
|---|---|
| **Phantom** *(lead)* | Drives STRIDE walkthrough; final severity assignment; chairs cross-talk |
| **Neo** | Trust boundaries (he just authored ARCHITECTURE.md), layering rules, where authorization should sit; arbitrates "redesign vs. accept" calls |
| **Bolt** | Implementation feasibility of each mitigation; engineering effort estimate per fix |
| **Echo** | Testability of each threat (can we write a regression test?); coverage gaps the threats reveal |
| **Pulse** | Runtime/operational threats — DoS, resource exhaustion, observability gaps that hide in-progress attacks |
| **Atlas** | Business impact per threat; which threats actually matter for *this* product/user/value-prop |
| **Muse** | UX impact of mitigations (will MFA churn users? does the warning banner work? does the rate-limit error message frustrate or inform?) |
| **Jarvis** | Documents the threat model and the MOM; ensures decisions are written down clearly with rationale |
| **Friday** | Effort/timeline cost of mitigations vs. acceptance; surfaces hidden coordination cost |

Read each agent's persona file before spawning. Use the existing party-mode orchestrator from `skills/build/party/orchestrator.md`.

### Three Progressive Thinking layers

Threat modeling adapts the existing Progressive Thinking pattern from `skills/brainstorm/steps/discover/06-progressive-thinking.md` (divergent → convergent layered analysis):

#### Layer 1 — Surface threats (divergent)

Phantom walks **every trust boundary** in `ARCHITECTURE.md` and applies STRIDE at each one:

- **S — Spoofing:** can an attacker impersonate a legitimate principal at this boundary?
- **T — Tampering:** can data crossing this boundary be modified by an unauthorized party (in transit, at rest, in memory)?
- **R — Repudiation:** can an action taken across this boundary be later denied by the actor?
- **I — Information disclosure:** can sensitive data leak across this boundary (intentionally or via side channel — timing, error messages, log lines, metric labels)?
- **D — Denial of service:** can resources be exhausted at this boundary to deny service?
- **E — Elevation of privilege:** can a low-privilege actor gain higher privileges by passing data through this boundary?

Each agent contributes threats from their lens. Use the existing **cross-talk protocol** from `skills/build/party/spawn-and-mom.md` — up to **3 cross-talk rounds** with early consensus exit. Threat modeling especially benefits from cross-talk because **chained threats** only surface when one agent's finding triggers another's perspective:

> *Example chain that needs cross-talk to find:*
> **Phantom:** "This endpoint accepts a user-supplied URL — SSRF risk."
> **Pulse:** "Yeah — and in our K8s setup, the metadata service at `169.254.169.254` is reachable from pods unless we block it explicitly."
> **Neo:** "Combined, that's a credential-exfiltration path I missed when I drafted this. The mitigation is either an SSRF allowlist at the application layer **and** a NetworkPolicy to block metadata-service egress at the pod level. Belt and suspenders — the application-layer check can be bypassed by clever URL parsing, the pod-level check is harder to bypass."

Output of Layer 1: a flat list of candidate threats, each tagged with the trust boundary, the STRIDE category, and the contributing agent(s).

**Pitch+vote within the party (non-binding):** if cross-talk doesn't converge on a specific threat — disagreement on severity, mitigation bucket, or whether the threat is real — run a Pitch Round + Vote per `skills/build/party/spawn-and-mom.md` → "Pitch Round + Vote." **In threat modeling, the vote informs the party's *recommendation* per threat — it is not a binding decision.** The human owns final acceptance at the Step 12 design approval gate by design; the vote tally and pitches are recorded in `threat-model.md` (under the threat's "Cross-talk note" / "Open Questions" sections) and the MOM as input data the human sees when reviewing the threat. Tier 1 hard blocks (e.g., a hardcoded-secret finding in a custom deployment artifact at Ship Step 9.2) cannot be voted out — they remain hard blocks regardless of pitch+vote outcome.

#### Layer 2 — Prioritize (convergent)

Phantom assigns severity (CRITICAL / HIGH / MEDIUM / LOW) to each Layer 1 threat using a DREAD-flavored rubric:

- **Damage if exploited** — Atlas inputs business impact.
- **Reproducibility** — Echo inputs based on test feasibility.
- **Exploitability** — Phantom + Neo input attack feasibility (skill required, prerequisites).
- **Affected users** — Atlas + Muse input scope (single user / cohort / all users / multi-tenant cross-leak).
- **Discoverability** — Phantom inputs how easily an attacker would find this.

Filter: drop **LOW-severity** threats from active discussion (they're recorded but not debated). Focus the rest of the party on **CRITICAL + HIGH + MEDIUM**.

#### Layer 3 — Propose mitigations (convergent → actionable)

For each prioritized threat, the party debates and Phantom records a proposal in one of four buckets:

| Bucket | When chosen | Required content |
|---|---|---|
| **Mitigate now** | Threat is critical/high and the fix is achievable within the current feature's scope | Specific design change (Bolt assesses cost, Neo confirms architectural fit, Friday assesses timeline). The fix becomes a Plan-phase Beads task at Step 13–19. |
| **Mitigate later** | Threat is real but the fix has scope/dependencies that exceed the current feature | Tech-debt entry to be created. Recorded as an ADR in `DECISIONS.md` because deferring known security debt is a deliberate accepted-risk decision. |
| **Accept** | Risk is judged acceptable given business impact and mitigation cost | Atlas's business justification + Phantom's residual-risk assessment. Recorded as an ADR in `DECISIONS.md`. **Final acceptance is the human's call at Step 12, not the party's.** |
| **Transfer** | Risk is moved to a third party (insurance, contractual, vendor SLA) | Description of the transfer mechanism. Rare but valid for some classes (e.g., payment tokenization shifts PCI DSS scope to the processor). |

The party produces *proposals*; the human owns *decisions*. Step 12 is the decision gate.

### MOM (Meeting Minutes)

Jarvis writes the MOM to `docs/pdlc/mom/MOM_threat-model_[feature-name]_[YYYY-MM-DD].md` per the existing party-mode pattern. The MOM captures:

- Triage outcome (Skip / Lite / Full) and the three triage answers.
- Participants (built-in + any custom agents).
- For each Layer 1 finding: contributing agent, trust boundary, STRIDE category, raw threat.
- For each Layer 2 prioritization: severity score with DREAD breakdown.
- For each Layer 3 proposal: which bucket, who proposed, dissents (if any), final party recommendation.
- Cross-talk highlights (chained threats found via cross-agent discussion).
- Open questions for the human (anything the party couldn't resolve without org-specific context — regulatory exposure, contractual constraints, threat-actor profile, prior incidents).

### Threat model deliverable

Jarvis (with Phantom co-authoring the security-content sections) writes the threat model to `docs/pdlc/design/[feature-name]/threat-model.md`. Use `templates/threat-model.md` as the structural template.

The threat model is a **living document** — Neo and Phantom update it during Construction whenever the implementation diverges materially from the design.

---

## Phase C — Lite mode (when triage = Lite)

When triage produces 1/3 yes:

- **No party convened.** Phantom drafts `threat-model.md` solo.
- **Single-pass STRIDE** focused on the *new* attack surface only (don't model the whole system; only what changed).
- **No MOM** (no meeting happened).
- **Same template** (`templates/threat-model.md`) as full mode — just sparser.
- **Same approval path** at Step 12 — the human reviews the threat model alongside the design docs.

Lite mode typically takes ~10 minutes of Phantom's effort. It's the right depth when the feature changes a single endpoint, adds one input, or modifies a small data flow — enough to deserve a security pass but not enough to convene the team.

---

## Phase D — Skip mode (when triage = 0/3)

When triage produces 0/3 yes:

- Create `docs/pdlc/design/[feature-name]/threat-model.md` containing only:
  ```markdown
  # Threat Model — [feature-name]

  **Triage:** Skipped
  **Date:** [YYYY-MM-DD]
  **Triage answers:**
  - Trust boundary changes: no
  - Regulated data: no
  - New attack surface: no

  **Rationale:** No new trust boundaries, no regulated data, and no new attack surface. Threat modeling intentionally skipped per Phantom's triage.

  **Re-triage trigger:** if any of the three answers becomes "yes" during Construction (e.g., scope expansion adds a new endpoint), re-run the triage and upgrade to Lite or Full as appropriate.
  ```
- Hand back to Neo immediately. Skipped threat models still go through Step 12 — the human sees the one-line record and can override the triage if they disagree.

---

## Phase E — Phantom → Neo handoff back (always)

After triage and (if applicable) the party complete, Phantom hands lead back to Neo. Output an **Agent Handoff** block at the close of Step 10.5:

**For Full mode:**

> **Phantom (Security Reviewer):** "Neo — threat model is complete. Triage came back **Full**, so we convened the team. The full breakdown is in `docs/pdlc/design/[feature-name]/threat-model.md`, the MOM is at `docs/pdlc/mom/MOM_threat-model_[feature-name]_[YYYY-MM-DD].md`. We surfaced [N] threats across [X] trust boundaries — [N1] CRITICAL, [N2] HIGH, [N3] MEDIUM. [N4] are tagged 'mitigate now' and will need to land as Plan-phase tasks; [N5] are tagged 'mitigate later' and will need ADRs. Two open questions for the human are flagged at the bottom of the threat model — please make sure those surface at the Step 12 approval gate. The doc is yours."
>
> **Neo (Architect):** "Got it, Phantom. I'll link `threat-model.md` from the PRD's Design Docs section at Step 11, and at Step 12 I'll present all four design artifacts for human approval together — architecture, data model, API contracts, threat model. The 'mitigate now' tasks will be the first thing I plumb into task decomposition at Step 13. Anything that lands as 'mitigate later' I'll make sure shows up as an ADR before we cross into Plan."

**For Lite mode:**

> **Phantom (Security Reviewer):** "Neo — triage came back **Lite** (one of three triage gates flagged), so I drafted the threat model solo. It's at `docs/pdlc/design/[feature-name]/threat-model.md`. I found [N] threats — all on the new attack surface, none requiring a full team review. [N1] are tagged 'mitigate now', the rest are 'accept' with rationale. The doc is yours; bring it to the Step 12 gate alongside the other design artifacts."
>
> **Neo (Architect):** "Got it. I'll fold the threat-model link into the PRD at Step 11 and walk all four design artifacts to the human together at Step 12."

**For Skip mode:**

> **Phantom (Security Reviewer):** "Neo — triage came back **Skip** (no new trust boundaries, no regulated data, no new attack surface). I've left a one-line record at `docs/pdlc/design/[feature-name]/threat-model.md` so the audit trail is complete. The human will see the skip rationale at the Step 12 gate and can override if they disagree with the triage. Back to you."
>
> **Neo (Architect):** "Got it. Linking the skip-record at Step 11. Continuing to Step 12."

---

## Lifecycle: keeping the threat model alive

The threat model is a **living document**, not a one-shot artifact:

- During **Plan (Steps 13–19)**, Neo verifies that every "mitigate now" threat has a corresponding Beads task in the decomposed plan.
- During **Construction (Build → Review)**, Phantom re-checks the threat model in the Review sub-phase — if the implementation introduces a new boundary not in the threat model, Phantom flags it as design drift to Neo for arbitration (the same drift-arbitration pattern that applies to ARCHITECTURE.md and api-contracts.md).
- During **Operation (Reflect Step 14)**, Jarvis verifies the threat model reflects what was actually built. If any "mitigate later" threats remain unaddressed, they're recorded as tech debt in the episode file with a clear owner and re-evaluation date.
- **Re-triage on scope change:** if any of the three triage gates flips from "no" to "yes" mid-feature, re-run threat modeling — the original triage outcome was based on the design at Step 10, not on what the feature became.
