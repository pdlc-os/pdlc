# Security in PDLC

> *Canonical reference for how PDLC handles security. Reads end-to-end as a self-contained document.*

## Security is paramount in PDLC

Security in PDLC is enforced through a **layered defense model** rather than a single security checkpoint. A feature shipped through PDLC passes through five independent security mechanisms:

1. **Configuration** — the security contract is captured once at init time in `CONSTITUTION.md`.
2. **Dedicated lifecycle stops** — explicit security activities at specific points in the feature lifecycle (threat modeling at design time, security review at construction time, security gates at ship time).
3. **Continuous agent participation** — Phantom (the Security Reviewer agent) is `always_on: true` and contributes to every task, every meeting, every decision, every retrospective.
4. **Hook layer** — runtime guardrails fire on every Bash, Edit, and Write tool call regardless of phase.
5. **Lifecycle of findings** — threats found at design time propagate forward through Plan → Build → Ship → Reflect with named owners and re-evaluation triggers.

The layers are intentionally redundant. A single missed check in any one layer is caught by another. **The only path to ship with a known security issue is a deliberate, recorded acceptance** — `/override` for Tier 1 hard blocks, `/decide` to formally defer findings, or a "Mitigate later"/"Accept" decision at the design-approval gate. There is no silent-ship path.

**The redundancy is the strength.** No single layer is responsible for catching everything; each layer specializes; together they create overlapping coverage where the sum is meaningfully stronger than any one stop.

For Phantom's full audit catalog (what is checked: OWASP Top 10 / API Top 10 / LLM Top 10, Mobile, Cryptography correctness, Cloud / IaC, etc.), see [`agents/extensions/phantom-security-audit.md`](../../agents/extensions/phantom-security-audit.md). For the safety-guardrails reference, see [`skills/safety-guardrails/SKILL.md`](../../skills/safety-guardrails/SKILL.md).

---

## The five-layer defense model

| Layer | What it covers | Where it lives |
|---|---|---|
| **1. Configuration** | The security contract — what rules apply to this project, captured once at init | `CONSTITUTION.md` §1 / §4 / §7 / §8; `DECISIONS.md` ADRs |
| **2. Dedicated lifecycle stops** | Explicit security activities at specific lifecycle points | Brainstorm Step 10.5, Build Review, Build Test Layer 7, Ship Step 9.0 / 9.2 / Verify |
| **3. Continuous agent participation** | Phantom always-on; contributes to every task, meeting, decision, retro | All phases — Build, Review, parties, retrospectives |
| **4. Hook layer** | Tier 1 / 2 / 3 guardrails on every Bash / Edit / Write tool call | `hooks/pdlc-guardrails.js` |
| **5. Lifecycle of findings** | Threats stay alive across phases with named owners and re-evaluation triggers | `docs/pdlc/design/<feature>/threat-model.md`, ADRs in `DECISIONS.md`, episode files |

---

## What happens when a security issue is found

PDLC uses a **three-tier severity model**. The behavior depends on how severe the finding is — and every behavior creates a durable record so nothing ships silently.

### Severity → action mapping

| Severity | Action | Bypass path | Record created |
|---|---|---|---|
| **Tier 1 — Critical** | **Hard block.** Cannot proceed. | `/override` (double-RED confirmation) | Permanent entry in `STATE.md` + ADR in `DECISIONS.md`. Permanently logged. |
| **Tier 2 — Major** | **Pause and confirm.** Execution stops; explicit "yes" required. | Type `yes` at the prompt | Recorded in `STATE.md` "Guardrail log" |
| **Tier 3 — Minor** | **Logged warning.** Proceeds without interruption. | None needed | Recorded in `STATE.md` "Guardrail log" with rationale |

### Tier 1 — Hard blocks (security findings)

These cannot ship without an explicit `/override`:

- **Hardcoded secrets / credentials in repo** — Phantom-driven detection (covered by the secret-scan in Layer 7 tests, Phantom's per-task review, and the pre-merge guardrails hook).
- **Critical dependency vulnerabilities** — known critical CVE in any project dependency (covered by Layer 7 dep-audit and Phantom's per-task review).
- **Failing test gates** — including Layer 7 Security tests (dep audit, secret scan, OWASP). Deploying with failing test gates is itself Tier 1 per CLAUDE.md.
- **Force-push to `main` / `master`** — bypasses review records and history integrity.
- **Phantom's "Blocking concerns"** *(per `agents/phantom.md`)*:
  - IDOR / broken access control allowing cross-user data access.
  - Unauthenticated endpoint that performs a state-mutating action or exposes sensitive data.
  - Unsanitized user input reaching SQL / NoSQL / shell execution context.
- **Critical findings from the Deployment Review Party** *(when user provides custom deploy artifact)* — hardcoded secrets in the artifact, exposed credentials, unsafe shell commands. Per [`custom-deploy-review.md`](../../skills/ship/steps/custom-deploy-review.md), these escalate to Tier 1 even though deployment review is normally a soft-gate party.

### Tier 2 — Pause-and-confirm (security findings)

These pause execution and require explicit "yes":

- **Phantom's findings rated CRITICAL or HIGH that aren't in the Tier 1 hard-block list above** — e.g., a high-severity SSRF finding the user wants to defer.
- **Editing `CONSTITUTION.md` / `DECISIONS.md`** — including drafting the ADR that records a deferred or accepted security finding. Intentional friction: even *recording* an accepted risk is itself a Tier 2 confirmation point.
- **Production database commands** — `psql` / `mysql` / `sqlite3` against connection strings indicating production. Most common path for accidental data exposure.
- **External API calls that write/post/send** — `curl -X POST/PUT/DELETE` to non-localhost URLs, including Slack webhooks, payment processors, GitHub API write calls.
- **`git reset --hard`** — discards uncommitted work, including in-progress security fixes.

### Tier 3 — Logged warnings (security findings)

These ship through but get recorded:

- **Phantom's "Soft warnings"** *(per `agents/phantom.md`)*:
  - Missing rate limiting on authenticated endpoints (defense-in-depth)
  - CVE rated Medium or below with no available patch
  - Missing security headers (HSTS, CSP, X-Frame-Options) — defense-in-depth, not primary control
  - Error messages more verbose than necessary but not exposing secrets
  - Authz check correct but in an inconsistent layer compared to the codebase
- **Skipping a non-Layer-7 test layer** with rationale.
- **Constitution-rule overrides** with rationale (deviations from project-defined rules in CONSTITUTION.md §1–§7).

### Override paths and accountability records

Sometimes a project has to ship with a known issue. PDLC's design ensures every such case is **deliberate and recorded** — there's no silent-ship path:

| Override path | When used | Record created |
|---|---|---|
| **`/override "<command>"`** *(double-RED)* | Any Tier 1 hard block | Permanent entry in `STATE.md` + ADR in `DECISIONS.md` with rationale |
| **`/decide`** | Formally accepting or deferring a security finding | ADR in `DECISIONS.md` with full Decision Review Party MOM |
| **Step 12 approval gate** "Mitigate later" / "Accept" decision | A threat from Step 10.5 the user wants to ship with | ADR in `DECISIONS.md`; threat tagged in `threat-model.md` Approval Outcomes table; tech-debt entry recorded at Reflect |
| **`CONSTITUTION.md §8` Safety Guardrail Overrides** | Long-standing project policy to downgrade specific actions | The CONSTITUTION.md is the record; every override fires Tier 3 logged-warning even when downgraded |

### The "no silent ship" principle

PDLC explicitly does **not** allow:

- ❌ Skipping Layer 7 Security tests with no rationale (rationale is mandatory; the skip is logged in STATE.md).
- ❌ Silently bypassing Phantom's Blocking concerns (Tier 1 cannot be ignored — only `/override`d with explicit double-RED).
- ❌ Shipping a "Mitigate now" threat without implementation (Phantom's design-drift check at Build Review catches this).
- ❌ Editing `DECISIONS.md` or `CONSTITUTION.md` without acknowledgment (Tier 2 pause-and-confirm even when *recording* an accepted risk).
- ❌ Closing all open Beads tasks (including security-related ones) at once (Tier 2 pause-and-confirm prevents bulk dismissal).

---

## Where security gates fire across the ship pipeline

A single feature may pass through up to seven security gates between Build start and Ship Verify:

| # | Gate | Location | What blocks shipping |
|---|---|---|---|
| 1 | **Phantom's per-task review** *(continuous)* | Build Loop, every task | Phantom's Blocking concerns → Tier 1 hard block. Soft warnings → Tier 3 logged. |
| 2 | **Party Review security pillar** | Build Review (Phantom is one of 4 always-on parallel reviewers) | Critical findings gate the merge. |
| 3 | **Layer 7 — Security tests** *(always-on)* | Build Test sub-phase | Test failures → Tier 1 hard block on the deploy that follows. |
| 4 | **Pre-merge guardrails hook** *(every commit)* | `hooks/pdlc-guardrails.js` on every Bash/Edit/Write tool call | Hardcoded secrets, force-push to main, DROP TABLE without migration → Tier 1 hard block. |
| 5 | **Threat-model "Mitigate now" verification** | Build Review (Phantom re-checks the threat model) | If a Step-10.5 "Mitigate now" threat doesn't have a corresponding implementation, Phantom flags design drift requiring resolution before merge. |
| 6 | **Deployment Review Party** *(conditional)* | Ship Step 9.2, only when user provides custom artifact | Phantom's critical findings on deploy artifacts (secrets, missing auth on prod, unsafe shell) → Tier 1 hard block. |
| 7 | **Pre-deploy security check** | Ship Verify sub-phase | Dependency audit + secret scan + security-headers verification before smoke-test sign-off. Failures gate the deploy. |

A feature that starts with no security risk-surface (Step 10.5 triage = Skip) still passes through gates 1, 2, 3, 4, 7. Gates 5 and 6 are conditional on threat-model findings and custom-artifact presence respectively.

---

## The five layers in detail

### Layer 1 — Configuration

The security contract is captured once at init time and referenced by every subsequent phase. Four sections of `CONSTITUTION.md` carry security weight:

| Section | Purpose | Used by |
|---|---|---|
| **§1 — Tech Stack Decisions** | Locks in language runtimes, frameworks, databases, infra | Phantom's **Tech currency & EOL** checks at every review — flags components running EOL or within 90-day / 1-year EOL windows |
| **§4 — Security & Compliance Requirements** | Project's security rules: input validation, secrets management, encryption, audit cadence, applicable compliance regimes | Phantom enforces every constraint; deviations require explicit override |
| **§7 — Test Gates** | Mandates **Layer 7 — Security tests** as part of every Build (dependency audit, secret scan, OWASP check); skipping any layer is Tier 3 logged | Build Test sub-phase enforces |
| **§8 — Safety Guardrail Overrides** | The only legitimate way to relax Tier 1 / 2 / 3 — e.g., downgrade a Tier 2 to Tier 3 with rationale | The guardrails hook reads this at every tool call |

Decisions accepting or deferring known security risk become ADRs in `docs/pdlc/memory/DECISIONS.md`. The ADR record is durable: every "Mitigate later" threat from Step 10.5, every "Accept" decision from Step 12, every Tier 1 override executed via `/override`. Future audits can trace the *why* behind any accepted risk.

### Layer 2 — Dedicated lifecycle stops

These are explicit, named security activities at specific points in the feature lifecycle. Each has its own gate, output artifact, and approval path.

- **Threat Modeling Party — Brainstorm Design Step 10.5** *(major section, see deep dive below)* — Phantom-led party between design-doc generation and the design approval gate. Triage tier (Skip / Lite / Full) decides depth. Output: `threat-model.md` reviewed alongside ARCHITECTURE / data-model / api-contracts at the Step 12 approval gate.
- **Party Review (security pillar) — Build Review** — Phantom is one of four always-on parallel reviewers. Runs his full Decision Checklist + extension catalog on the diff. Cross-talk rounds (up to 3) link related findings to shared root causes. Critical findings gate the merge.
- **Layer 7 — Security Tests — Build Test** — always-on test layer (per CONSTITUTION §7 default). Three sub-checks: full dependency audit (re-scans the entire dependency tree), secret scan on diff, OWASP automated SAST/DAST sweep. Skip requires Tier 3 logged warning with explicit rationale.
- **Deployment Review Party — Ship Step 9.2** *(conditional)* — triggered only when the user provides a custom deploy / CI/CD / build artifact at Ship Step 9.1. Phantom's findings on deployment artifacts are escalated: hardcoded secrets, exposed credentials, missing auth on production endpoints, unsafe shell commands all become **Tier 1 hard blocks** even though deployment review is normally a soft-gate party.
- **Pre-deploy security check — Ship Verify** — automated check before smoke-test sign-off. Dependency audit against the deployed environment, secret scan of deployed configuration / environment variables, security-headers verification against deployed endpoints (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- **Lint pass — Ship Step 9.0** — Pulse's first action on takeover, per [`skills/ship/steps/fix-lint.md`](../../skills/ship/steps/fix-lint.md). Not strictly a security check but security-adjacent: linters used (ESLint security plugins, gosec, Bandit) include SAST rules that catch many security smells (insecure deserialization patterns, weak crypto usage, command-injection vectors).

### Layer 3 — Continuous agent participation

Phantom's frontmatter is `always_on: true`. He participates in every task, every review, every meeting, every decision, every retrospective without needing label-based selection. Per-task during Build:

| Check | Scope | What Phantom looks for |
|---|---|---|
| **OWASP Top 10 pass** | Every task | Injection, broken auth, broken access control, security misconfig, sensitive-data exposure, XXE, insecure deserialization, known-vulnerable components, insufficient logging, SSRF |
| **Auth / authz layer audit** | Every task with auth | Trust boundary traced from route → controller → service → data layer; flags any layer where the developer assumed a previous layer enforced authorization |
| **Input validation audit** | Every task with user input | Every user-controlled input verified for parameterization, sanitization, length capping; SQL / NoSQL / shell / file path / template / redirect contexts |
| **Secrets management audit** | Every task | No credentials in code, comments, logs, error messages, or version control |
| **Dependency CVE check** | Every task adding/updating deps | New or updated dependencies checked against `npm audit` / `pip-audit` / `bundler-audit` / `govulncheck` / equivalent |
| **Distillation digest preserve** | Every Phantom-authored doc | ADR IDs, security constraints, "must not" rules preserved verbatim in any digest |

### Layer 4 — Hook layer (always-on guardrails)

The `hooks/pdlc-guardrails.js` PreToolUse hook fires on every Bash, Edit, and Write tool call — regardless of phase, regardless of which agent is active. Three tiers (full reference in [`14-safety-guardrails.md`](14-safety-guardrails.md)):

- **Tier 1 hard blocks** — security-relevant rules listed in the [Tier 1 — Hard blocks](#tier-1--hard-blocks-security-findings) section above.
- **Tier 2 pause-and-confirm** — security-relevant rules listed in the [Tier 2 — Pause-and-confirm](#tier-2--pause-and-confirm-security-findings) section above.
- **Tier 3 logged warnings** — Phantom's accepted soft warnings, test-layer skips, Constitution-rule overrides, downgraded actions per CONSTITUTION §8.

**Metadata-command short-circuit:** `git commit`, `git tag -m`, `gh release|pr|issue`, and `gh api` legitimately quote arbitrary text in their argument bodies (commit messages, release notes, PR descriptions). Those bodies routinely *describe* destructive operations (`rm -rf`, `git reset --hard`, `DROP TABLE`, `curl -X POST`) without executing them. The hook treats these outer commands as message-data wrappers and skips all Tier 1 / Tier 2 Bash checks. Edit/Write tool checks on protected files are unaffected.

### Layer 5 — Lifecycle of findings

Security findings are not one-shot. They propagate forward through the lifecycle with named owners, due dates, and re-evaluation triggers:

| Phase | Touchpoint |
|---|---|
| **Brainstorm Design Step 10.5** | Threat Modeling Party produces `threat-model.md` with per-threat proposed action: Mitigate now / Mitigate later / Accept / Transfer. |
| **Brainstorm Design Step 12 (approval)** | Human reviews each threat and confirms the party's proposal or overrides. "Mitigate later" and "Accept" decisions become ADRs in `DECISIONS.md`. |
| **Brainstorm Plan (Steps 13–19)** | Neo verifies that every "Mitigate now" threat has a corresponding Beads task in the decomposed plan. |
| **Build Review** | Phantom re-checks the threat model in the Review sub-phase. New trust boundaries introduced during implementation are flagged as design drift to Neo for arbitration (same drift-arbitration pattern used for ARCHITECTURE.md and api-contracts.md). |
| **Operation Reflect (Step 14)** | Jarvis verifies the threat model reflects what was actually built. Unaddressed "Mitigate later" threats are recorded as tech debt in the episode file with owner and re-evaluation date. |
| **Re-triage on scope change** | If any of the three triage gates flips from "no" to "yes" mid-feature, threat modeling re-runs. |

The lifecycle ensures nothing accepted at design time is silently forgotten by ship time.

---

## Threat Modeling Party — deep dive (Brainstorm Design Step 10.5)

The single most security-deliberate addition to PDLC. Phantom-led party that pressure-tests the just-generated design before approval.

### When it runs

```
Step 9    — Design discovery (Neo's Bloom's-taxonomy questioning)
Step 10   — Generate design docs (ARCHITECTURE.md, data-model.md, api-contracts.md)
Step 10.5 — Threat Modeling Party    ← Phantom takes lead
Step 11   — Update PRD design doc links (now includes threat-model.md)
Step 12   — Design approval gate (human reviews all four artifacts together)
```

This placement is load-bearing: the design artifacts are concrete enough to model threats against, but design isn't yet locked, so threat findings can drive design revisions before approval.

### Lead handoff (Neo → Phantom → Neo)

The handoff is explicit and always fires, regardless of triage outcome. Both directions appear as **Agent Handoff** banner blocks in the conversation:

**At the start of Step 10.5 (Neo → Phantom):**

> **Neo:** "Phantom — design documents are generated. Before we lock the design at Step 12, the team needs to pressure-test it for security threats. You're up — run the triage, and convene the party if it warrants. I'll continue Step 11 once your threat model is in place."
>
> **Phantom:** "On it. I'll triage the new attack surface against ARCHITECTURE.md and data-model.md, decide whether a full party is warranted, and bring you back a `threat-model.md` plus MOM if we convene."

**At the end of Step 10.5 (Phantom → Neo)** — three banner variants depending on triage outcome (Full / Lite / Skip), each summarizing the threats found and the handback expectation. Full text in `skills/brainstorm/steps/threat-model.md` (Phases A and E).

### Triage gate

Phantom answers three questions about the design:

1. **Trust boundary changes?** New auth surface, new external integration, new role/permission, new data egress, new sensitive-data handler.
2. **Regulated data?** PII, payment, health, biometric, children's data.
3. **New attack surface?** New endpoint, new event consumer, new file-upload, new query interface, new LLM tool, new mobile handler.

| Yeses | Tier | Treatment |
|---|---|---|
| 0 / 3 | **Skip** | One-line audit-trail record. No party. Phantom hands back to Neo immediately. |
| 1 / 3 | **Lite** | Phantom drafts `threat-model.md` solo — single-pass STRIDE walk, no party. ~10 min of focused work. |
| 2 or 3 / 3 | **Full** | Convene the **Threat Modeling Party**. |

Skip mode still produces a `threat-model.md` (with rationale recorded) so the audit trail is complete — and the human can override the triage at Step 12 if they disagree.

### Full party participants

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

### Cross-talk example

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

### Output artifacts

A Full party produces two files; Lite produces one; Skip produces a stub:

- **`docs/pdlc/design/<feature>/threat-model.md`** — always present. Structured deliverable, using `templates/threat-model.md` as the template. Sections: triage record, trust boundaries, threats identified (with STRIDE / severity / DREAD / mitigation proposal / human decision slot), low-severity appendix, open questions for human, approval outcomes table (filled at Step 12), revision history.
- **`docs/pdlc/mom/MOM_threat-model_<feature>_<date>.md`** — Full mode only. Meeting minutes per existing party-mode pattern: participants, layer-by-layer findings, severity reasoning, proposal-by-proposal debate, dissents, cross-talk highlights.

Both files are linked from the PRD's Design Docs section at Step 11, then reviewed alongside the other three design artifacts at the Step 12 approval gate.

### Why this design

Three load-bearing choices:

1. **Inside Brainstorm, not after.** Earlier than Step 10 (no design to model against); later than Step 12 (design already approved, mitigations become retrofit). The Step 10.5 placement gives concrete artifacts to attack while the design is still negotiable.
2. **Phantom-led, not Neo-led.** Security analysis is its own discipline; Phantom's voice and decision-checklist are tuned for it. Neo's strength is architectural reasoning, not threat-modeling — they should partner, not blend. The explicit handoff makes the role split visible to the user.
3. **Party + Progressive Thinking + cross-talk, not a checklist.** STRIDE checklists exist; what's harder is finding chained threats across agent perspectives. The cross-talk protocol (up to 3 rounds with early-exit) is what differentiates this from a static catalog walk.

See [`17-design-decisions.md`](17-design-decisions.md) for the longer rationale.

---

## Phantom's audit catalog summary

Beyond the per-task continuous checks listed in Layer 3, Phantom's expanded extension catalog (active via `agents/extensions/phantom-security-audit.md`) covers:

- **OWASP Web Top 10** — injection, broken auth, broken access control, security misconfig, sensitive-data exposure, XXE, insecure deserialization, known-vulnerable components, insufficient logging, SSRF.
- **OWASP API Security Top 10** — BOLA, BOPLA (mass assignment / over-data exposure), broken auth/function-level auth, unrestricted resource consumption, SSRF, business-flow abuse, security misconfig, improper inventory management, unsafe consumption of APIs.
- **OWASP LLM Top 10** *(when LLM features present)* — prompt injection (direct + indirect), insecure output handling, training data poisoning, model DoS, supply chain, sensitive info disclosure, insecure plugin design, excessive agency, overreliance, model theft. Plus emerging concerns: MCP server security, RAG isolation, cost amplification, tool/function-calling boundaries, persistent prompt context.
- **Mobile** *(iOS / Android / RN / Flutter)* — Keychain / KeyStore, ATS / Network Security Config, code signing, IPC security, biometric APIs, OTA update signing.
- **Cryptography correctness** — banned algorithms (MD5/SHA1/DES/RC4/ECB), JWT alg confusion (alg:none, HS-vs-RS, kid validation, jwk injection), CSPRNG audit, password-hashing parameters (bcrypt cost, argon2id memory/iterations), key derivation, certificate validation, TLS config, cryptographic agility.
- **Backend stacks** — Java/Spring (deserialization, JPA query security, dep CVEs/staleness), Node/Express (middleware, prototype pollution, SSRF), Python (Django/Flask/FastAPI; pickle/yaml deserialization, ORM injection), Go (data races, panic-as-DoS, unsafe usage, HTTP timeouts), Ruby/Rails (Marshal.load deserialization, ERB injection, ReDoS, ActiveRecord SQLi), .NET/ASP.NET Core (BinaryFormatter, Data Protection key ring, EF Core query injection).
- **Cloud & IaC** — Terraform (state encryption, secrets in state), CloudFormation/CDK (IAM least privilege, drift), Helm (signed charts), AWS-specific (S3 policies, IAM, KMS, CloudTrail, GuardDuty, Lambda, VPC endpoints), GCP-specific (IAM bindings, service-account impersonation, VPC SC, Cloud KMS, Audit Logs).
- **Tech currency & EOL** — language runtimes, frameworks, databases, container base images, OS distros vs [endoflife.date](https://endoflife.date). EOL components → CRITICAL; ≤90-day EOL → HIGH; ≤1-year EOL → MEDIUM.
- **Software supply chain integrity** — SBOM (CycloneDX/SPDX) per release, SLSA framework target Level 3, signed artifacts via Sigstore (`cosign`), reproducible builds, build-environment hardening (ephemeral CI runners), typosquatting / dependency-confusion mitigation, install-script auditing, source-code-hosting hardening.
- **Compliance regimes** — GDPR, CCPA/CPRA, PCI DSS v4.0, SOC 2, HIPAA, COPPA/GDPR-K/AADC, BIPA, DORA, NIS2.
- **Database** — SQL (privileges, encryption, RLS for multi-tenant separation, column-level encryption), NoSQL (Redis ACLs, MongoDB operator injection, Elasticsearch painless sandbox, DynamoDB IAM conditions), vector DBs (namespace isolation, embedding leakage, RAG-content prompt injection), data warehouses (RBAC, masking, column-level security).
- **Infrastructure & DevOps** — Docker (base-image vulns, USER directive, BuildKit secrets, multi-stage), Kubernetes (RBAC, network policies, Pod Security Standards `restricted`, service-mesh mTLS, admission controllers OPA Gatekeeper / Kyverno), runtime security (Falco / Tracee), CI/CD (secret management, OIDC federation, workflow permissions, third-party action signing).
- **Monitoring & alerting** — auth-failure monitoring, authz-bypass detection, unusual data-access patterns, WAF integration, SIEM integration, audit-logging integrity (append-only, tamper-evident, retention).

See `agents/extensions/phantom-security-audit.md` for the full catalog with detection techniques and remediation guidance per category.

---

## Phase-by-phase walkthrough

Putting all five layers together, here's where security touchpoints fire across a feature's lifecycle.

### Phase 0 — Initialization (`/setup`)

| Step | Touchpoint | Type |
|---|---|---|
| 1c-iii | Plugin / skill conflict scan (`pdlc check-conflicts`) | Automated |
| 1e | Baseline security scan (`npm audit` / equivalent on full tree) | Automated |
| 5a | CONSTITUTION.md §1 / §4 / §7 / §8 captured | Configuration anchor |

### Phase 1 — Inception (`/brainstorm`)

| Sub-phase | Touchpoint | Type |
|---|---|---|
| Discover | Adversarial Review, Edge Case Analysis | Agent-led, security-adjacent |
| **Design Step 10.5** | **Threat Modeling Party** *(Phantom-led, triage-tiered)* | **Dedicated security party** |
| Design Step 12 | Approval gate covers `threat-model.md` alongside ARCHITECTURE / data-model / api-contracts | Human gate |

### Phase 2 — Construction (`/build`)

| Sub-phase | Touchpoint | Type |
|---|---|---|
| Build (per task) | OWASP Top 10 pass, auth/authz, input validation, secrets, dep CVE | Continuous (Phantom always-on) |
| **Review** | **Party Review — security pillar** *(Phantom one of 4 parallel reviewers)* | **Dedicated security review** |
| Test | **Layer 7 — Security tests** *(dep audit + secret scan + OWASP)* | Automated, always-on |
| Wrap-up | Episode draft includes accepted security warnings | Documentation |

### Phase 3 — Operation (`/ship`)

| Sub-phase | Touchpoint | Type |
|---|---|---|
| Ship Step 9.0 | Lint pass *(SAST-included via fix-lint extension)* | Automated, security-adjacent |
| Ship Step 9.2 | Deployment Review Party *(when custom artifact provided)* | Conditional security party |
| **Verify** | **Pre-deploy security check** *(dep audit + secret scan + headers)* | **Automated, always-on** |
| Reflect | Threat-model lifecycle review *(Jarvis verifies; tech-debt tagging)* | Documentation + accountability |

### Cross-cutting commands

| Command | Touchpoint |
|---|---|
| `/decide` | Decision Review Party — Phantom assesses security implications |
| `/whatif` | Read-only — Phantom evaluates security implications of hypothetical |
| `/rollback` | Post-Mortem Party — Phantom diagnoses security regression |
| `/hotfix` | Compressed flow — Phantom contributes per always-on flag |
| `/diagnose` | Check 9 — plugin/skill conflicts |
| `/override` | Tier 1 hard-block escape hatch (double-RED, permanently logged) |

### Always-on (every Bash / Edit / Write tool call)

| Tier | Security-relevant rules |
|---|---|
| Tier 1 | Force-push to main, DROP TABLE without migration, rm -rf outside project, deploy with failing tests, **hardcoded secrets**, **critical dep vulnerabilities** |
| Tier 2 | rm -rf, git reset --hard, prod DB commands, **external write API calls**, editing CONSTITUTION/DECISIONS, bulk Beads close |
| Tier 3 | Accepted warnings logged, test-layer skips, override events, downgraded actions |

---

## Frequency summary

| Frequency | Security touchpoints |
|---|---|
| **Once per project** | CONSTITUTION.md §1/§4/§7/§8 capture; baseline dep audit; plugin/skill conflict scan |
| **Once per feature** | Threat Modeling Party (Step 10.5); threat-model lifecycle close at Reflect |
| **Once per build wave** | Party Review (security pillar) |
| **Every task during Build** | OWASP Top 10, auth/authz, input validation, secrets, dependency CVE — all Phantom-driven; Layer 7 Security tests |
| **Every ship** | Lint pass (Step 9.0), pre-deploy security check, deployment review party (conditional on custom artifact) |
| **Every tool call (Bash/Edit/Write)** | Tier 1/2/3 guardrails hook |
| **Every `/decide`, `/whatif`, `/rollback`, `/hotfix`** | Phantom contributes from his `always_on: true` flag |
| **On demand** | `/diagnose` Check 9 (conflicts), `pdlc check-conflicts`, `/override` (only when explicitly invoked) |

---

## Concrete worked example

Suppose Phantom flags two findings during Build Review:

1. **CVE-2024-XXXX in `lodash` (CRITICAL)** — known critical vulnerability with a patch available
2. **Missing CSP header** — defense-in-depth, no immediate exploit

What happens if the team tries to ship?

| Finding | PDLC's response |
|---|---|
| Critical lodash CVE | **Tier 1 hard block.** Build Review's critical-findings gate refuses to merge. Three options: (a) update lodash and re-run review (most common); (b) `/override` with explicit rationale (rare; permanently logged in STATE.md + ADR in DECISIONS.md); (c) `/decide` to formally defer with an ADR (still requires `/override` to merge, but the deferral is documented). Without one of these, Build does not transition to Ship. |
| Missing CSP header | **Tier 3 logged warning.** Recorded in `STATE.md` Guardrail log; team can address in a follow-up feature. Ship proceeds. The episode file Jarvis drafts at Reflect notes the open warning so it doesn't get lost. |

The principle illustrated: **the answer to "can I ship with this issue?" is always one of three things** — *yes, recorded* / *yes, but pause and confirm* / *only with double-RED override and permanent record*. There is no path to ship silently with security issues, by design.

---

[← Previous: Release a stuck claim](19-release-claim.md) | [Back to README](../../README.md) | [Next: Agent & Skill Extensions →](21-agent-extensions.md)
