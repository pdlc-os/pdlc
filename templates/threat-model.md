# Threat Model — [feature-name]
<!-- pdlc-template-version: 1.0.0 -->

**Triage:** Full | Lite | Skipped  *(set per Phantom's triage outcome at Brainstorm Step 10.5)*
**Convened:** [YYYY-MM-DD]
**Lead:** Phantom (Security Reviewer)
**Participants:** [list — full team for Full mode; Phantom-only for Lite; n/a for Skip]
**Status:** Pending human approval (Step 12) | Approved | Approved with overrides | Revision requested

---

## Triage Record

| Question | Answer | Evidence |
|---|---|---|
| Does this feature introduce or modify a trust boundary? | yes / no | [where in ARCHITECTURE.md] |
| Does this feature touch regulated data (PII, payment, health, biometric, children's)? | yes / no | [data type if yes] |
| Does this feature add a new attack surface (endpoint, event consumer, file upload, query interface, LLM tool, mobile handler)? | yes / no | [list if yes] |

**Triage outcome:** [Full / Lite / Skip]

---

## Trust Boundaries

*(Full and Lite modes only. List every trust boundary identified in or modified by this feature, referencing the diagram in `ARCHITECTURE.md`.)*

| ID | Boundary | What crosses | Trust direction | Diagram reference |
|---|---|---|---|---|
| TB-1 | [e.g., Browser → API gateway] | [e.g., user session token + request body] | untrusted → semi-trusted | ARCHITECTURE.md §3.1 |
| TB-2 | [e.g., Service A → Service B (internal)] | [e.g., service-mesh-authenticated request, propagated user identity] | semi-trusted → trusted | ARCHITECTURE.md §3.2 |
| TB-3 | [e.g., Service A → external SaaS] | [e.g., OAuth-authorized API call, customer data] | trusted → untrusted (egress) | ARCHITECTURE.md §3.3 |

---

## Threats Identified

*(One section per threat. Use STRIDE category and severity. Order by severity descending, then by trust boundary.)*

### T-001 — [Threat Title]

- **STRIDE category:** Spoofing | Tampering | Repudiation | Information Disclosure | Denial of Service | Elevation of Privilege
- **Trust boundary:** TB-N
- **Asset affected:** [what's at risk — user data, system integrity, availability, credentials, …]
- **Attack vector:** [one-paragraph plain-language description of how an attacker would exploit this]
- **Severity:** CRITICAL | HIGH | MEDIUM | LOW
- **DREAD breakdown:** Damage [H/M/L] · Reproducibility [H/M/L] · Exploitability [H/M/L] · Affected users [scope] · Discoverability [H/M/L]
- **Mapped frameworks:** [OWASP Web Top 10 ID / OWASP API Top 10 ID / OWASP LLM Top 10 ID / CWE-NNN / regulatory regime control where applicable]
- **Current mitigation status:** None | Partial: [what exists] | Mitigated by: [specific control]
- **Proposed action (party recommendation):** Mitigate now | Mitigate later | Accept | Transfer
  - **If "Mitigate now":** [specific design change; Bolt's effort estimate; Neo's architectural-fit confirmation; will land as Plan-phase Beads task]
  - **If "Mitigate later":** [tech-debt entry to be created in `docs/pdlc/memory/DECISIONS.md` as ADR; re-evaluation trigger]
  - **If "Accept":** [Atlas's business justification; residual-risk assessment; ADR in `DECISIONS.md`]
  - **If "Transfer":** [transfer mechanism — insurance, contract, vendor SLA, third-party tokenization]
- **Decision (human, at Step 12 approval):** *[blank until human reviews; one of: confirm party recommendation / override to: ___ / reject and require redesign]*
- **Cross-talk note:** *[fill in if this threat was discovered or sharpened via cross-talk between agents — capture the chain]*

### T-002 — [Threat Title]
*(repeat structure)*

---

## Threats Noted but Not Prioritized

*(LOW-severity threats — recorded for completeness, not actively debated. One row per finding.)*

| ID | Title | STRIDE | Boundary | Why deprioritized |
|---|---|---|---|---|
| T-NL-1 | [...] | [...] | TB-N | [e.g., requires physical access to data center] |

---

## Open Questions for Human

*(Things the agent party could not resolve without organization-specific context. The human addresses these at Step 12.)*

1. [Question — e.g., "Are we contractually required to notify Customer X within 24h of suspected unauthorized access to their tenant? This affects how we triage T-005."]
2. [Question — e.g., "What's our threat-actor profile for this feature? Drive-by attackers vs targeted competitors vs state-level — affects whether T-007 is realistic."]
3. [Question — e.g., "Does the org's incident response plan have a runbook for the data-leak scenario in T-002? If not, that's a gap independent of the design."]

---

## Approval Outcomes (filled in at Step 12)

*(Updated by Neo when the human approves the design package. Tracks deviations from party recommendations.)*

| Threat ID | Party recommendation | Human decision | Rationale |
|---|---|---|---|
| T-001 | Mitigate now | Mitigate now ✓ | — |
| T-002 | Accept | Mitigate later | "We'd rather take the engineering hit than carry this risk in writing." |
| T-003 | Mitigate now | Accept | "Acceptable trade-off for v1; revisit at Beta." |

**ADR registry updates required:**
- [ADR-NNN — accepted-risk record for T-002]
- [ADR-NNN — accepted-risk record for T-003]

**Beads tasks to be created at Plan (Step 13):**
- [Threat T-001 mitigation: ___ ]
- [Threat T-004 mitigation: ___ ]

---

## Revision History

| Date | Author | Change |
|---|---|---|
| [YYYY-MM-DD] | Phantom (initial draft) | Created at Step 10.5 |
| [YYYY-MM-DD] | Neo (design-drift update) | T-007 added — implementation introduced new auth boundary not in original design |
| [YYYY-MM-DD] | Phantom (Reflect re-check) | Marked T-002 mitigation complete; T-003 deferred → tech debt |
