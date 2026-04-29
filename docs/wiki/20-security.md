# Security in PDLC

Security is paramount in PDLC, and it's enforced through a **layered defense model** rather than a single security checkpoint. A feature shipped through PDLC passes through multiple independent security mechanisms — configuration-level commitments, dedicated lifecycle stops, continuous agent participation, runtime guardrails, and a finding-lifecycle that keeps threats alive across phases. The layers are intentionally redundant: a single missed check in any one layer is caught by another. The only failure mode is *deliberately accepted risk* recorded as an ADR — which is the intended behavior, not a gap.

This page is the canonical reference for **how PDLC does security**. For Phantom's full audit catalog (the *what* — OWASP Top 10, API Top 10, LLM Top 10, Mobile, Cryptography correctness, etc.), see [`agents/extensions/phantom-security-audit.md`](../../agents/extensions/phantom-security-audit.md). For the safety guardrails referenced here, see [`skills/safety-guardrails/SKILL.md`](../../skills/safety-guardrails/SKILL.md).

---

## The layered defense model

| Layer | What it covers | Where it lives |
|---|---|---|
| **1. Configuration** | The contract — what security rules apply to this project, captured once at init time | `CONSTITUTION.md` §1 / §4 / §7 / §8; `DECISIONS.md` ADRs |
| **2. Lifecycle stops** | Dedicated security activities at specific points in the feature lifecycle | Brainstorm Design Step 10.5, Build Review, Build Test Layer 7, Ship Step 9.0 / 9.2 / Verify |
| **3. Continuous agent participation** | Phantom is `always_on: true` — contributes to every task, every meeting, every decision | All phases — Build, Review, parties, retro |
| **4. Hook layer** | Tier 1 / 2 / 3 guardrails fire on every Bash / Edit / Write tool call regardless of phase | `hooks/pdlc-guardrails.js` |
| **5. Lifecycle-of-findings** | Threats found at design time propagate forward through Plan / Build / Ship / Reflect with named owners and re-evaluation triggers | `docs/pdlc/design/<feature>/threat-model.md`, ADRs in `DECISIONS.md`, episode files |

The combination is what makes security *paramount*. No single layer is responsible for catching everything; together, they create overlapping coverage where each layer specializes in a different failure class.

---

## Layer 1 — Configuration

The security contract is captured once at init time and referenced by every subsequent phase. Four sections of `CONSTITUTION.md` carry security weight:

| Section | Purpose | Used by |
|---|---|---|
| **§1 — Tech Stack Decisions** | Locks in language runtimes, frameworks, databases, infra | Phantom's **Tech currency & EOL** checks at every review — flags components running EOL or within 90-day / 1-year EOL windows |
| **§4 — Security & Compliance Requirements** | Project's security rules: input validation, secrets management, encryption, audit cadence, applicable compliance regimes | Phantom enforces every constraint; deviations require explicit override |
| **§7 — Test Gates** | Mandates **Layer 7 — Security tests** as part of every Build (dependency audit, secret scan, OWASP check); skipping any layer is Tier 3 logged | Build Test sub-phase enforces |
| **§8 — Safety Guardrail Overrides** | The only legitimate way to relax Tier 1 / 2 / 3 — e.g., downgrade a Tier 2 to Tier 3 with rationale | The guardrails hook reads this at every tool call |

Decisions accepting or deferring known security risk become ADRs in `docs/pdlc/memory/DECISIONS.md`. The ADR record is durable: every "Mitigate later" threat from Step 10.5 lands here, every "Accept" decision from Step 12 lands here, every Tier 1 override executed via `/override` lands here. Future audits can trace the *why* behind any accepted risk.

---

## Layer 2 — Dedicated lifecycle stops

These are explicit, named security activities at specific points in the feature lifecycle. Each has its own gate, output artifact, and approval path.

### Threat Modeling Party — Brainstorm Design Step 10.5 *(major section, see deep dive below)*

Phantom-led party between design-doc generation and the design approval gate. Triage tier (Skip / Lite / Full) decides depth. Output: `threat-model.md` reviewed alongside ARCHITECTURE / data-model / api-contracts at the Step 12 approval gate.

### Party Review (security pillar) — Build Review

Phantom is one of **four always-on parallel reviewers** (Neo / Echo / Phantom / Jarvis). Phantom runs his **full Decision Checklist + extension catalog** on the diff:

- Every item in `agents/phantom.md`'s Decision Checklist (8 base checks)
- Every applicable item in the extension's checklist (Cryptography, API Top 10, LLM, Mobile, Dependency staleness, Tech currency / EOL, Supply chain, Compliance regimes — 8 additional groups)

Cross-talk rounds (up to 3) link related findings to shared root causes — e.g., Phantom's hardcoded-secret finding plus Pulse's missing-env-var-handoff finding routed for a single fix. **Critical findings gate the merge.** Phantom's "Blocking concerns" (IDOR, hardcoded secrets, unauthenticated state-mutating endpoints, parameterless queries with user input) require resolution or explicit `/override`.

### Layer 7 — Security Tests — Build Test sub-phase

Always-on test layer (per CONSTITUTION §7 default). Three sub-checks:

1. **Full dependency audit** — re-scans the entire dependency tree (not just the diff) to catch transitive vulnerabilities introduced by upgrade chains.
2. **Secret scan on diff** — checks new/modified files for accidentally-committed credentials, tokens, keys, connection strings.
3. **OWASP check** — automated SAST / DAST sweep against the just-built artifact.

The layer can only be skipped via Tier 3 logged warning with explicit rationale recorded in `STATE.md`.

### Deployment Review Party — Ship Step 9.2 *(conditional)*

Triggered only when the user provides a custom deploy / CI/CD / build artifact at Ship Step 9.1. The full team assesses the composed plan (user artifact + PDLC defaults). Phantom's findings on deployment artifacts are escalated:

- **Tier 1 hard blocks**: hardcoded secrets in the artifact, exposed credentials, missing auth on production endpoints, unsafe shell commands.
- **Soft warnings** (user decides): missing security headers, verbose logging, defense-in-depth gaps.

User preference wins on non-Tier-1 conflicts — the goal is to surface risks for informed choice, not to block legitimate operational patterns.

### Pre-deploy security check — Ship Verify sub-phase

Automated check before smoke-test sign-off:

- **Dependency audit** against the deployed environment's dependency graph.
- **Secret scan** of deployed configuration / environment variables.
- **Security headers verification** against the deployed endpoints (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

### Lint pass — Ship Step 9.0

Pulse's first action on takeover, per [`skills/ship/steps/fix-lint.md`](../../skills/ship/steps/fix-lint.md). Not strictly a security check, but security-adjacent: linters used (ESLint security plugins, gosec, Bandit) include SAST rules that catch many security smells (insecure deserialization patterns, weak crypto usage, command-injection vectors).

---

## Layer 3 — Continuous agent participation (Phantom always-on)

Phantom's frontmatter is `always_on: true`. He participates in **every task, every review, every meeting, every decision** without needing label-based selection. The continuous-layer security checks Phantom contributes to every task during Build:

| Check | Scope | What Phantom looks for |
|---|---|---|
| **OWASP Top 10 pass** | Every task | Injection, broken auth, broken access control, security misconfig, sensitive-data exposure, XXE, insecure deserialization, known-vulnerable components, insufficient logging, SSRF |
| **Auth / authz layer audit** | Every task with auth | Trust boundary traced from route → controller → service → data layer; flags any layer where the developer assumed a previous layer enforced authorization |
| **Input validation audit** | Every task with user input | Every user-controlled input verified for parameterization, sanitization, length capping; SQL / NoSQL / shell / file path / template / redirect contexts |
| **Secrets management audit** | Every task | No credentials in code, comments, logs, error messages, or version control |
| **Dependency CVE check** | Every task adding/updating deps | New or updated dependencies checked against `npm audit` / `pip-audit` / `bundler-audit` / `govulncheck` / equivalent |
| **Distillation digest preserve** | Every Phantom-authored doc | ADR IDs, security constraints, "must not" rules preserved verbatim in any digest |

Beyond these per-task checks, Phantom's expanded extension catalog (active via `agents/extensions/phantom-security-audit.md`) adds:

- **OWASP API Security Top 10** — BOLA, BOPLA, broken auth/function-level auth, unrestricted resource consumption, SSRF, business-flow abuse, improper inventory, unsafe consumption of APIs.
- **OWASP LLM Top 10** *(when LLM features present)* — prompt injection (direct + indirect), insecure output handling, training data poisoning, model DoS, supply chain, sensitive info disclosure, insecure plugin design, excessive agency, overreliance, model theft. Plus emerging concerns: MCP server security, RAG isolation, cost amplification, tool/function-calling boundaries.
- **Mobile** *(iOS / Android / RN / Flutter)* — Keychain / KeyStore, ATS / Network Security Config, code signing, IPC security, biometric APIs, OTA update signing.
- **Cryptography correctness** — banned algorithms, JWT alg confusion, password-hashing parameters, certificate validation, TLS config, cryptographic agility.
- **Backend stacks** — Java/Spring, Node/Express, Python (Django/Flask/FastAPI), Go, Ruby/Rails, .NET/ASP.NET Core. Per-stack scans for deserialization, framework footguns, dependency hygiene.
- **Cloud & IaC** — Terraform, CloudFormation/CDK, Helm, IaC scanners; AWS-specific (S3, IAM, KMS, CloudTrail, GuardDuty); GCP-specific (IAM bindings, service-account impersonation, VPC SC).
- **Tech currency & EOL** — language runtimes, frameworks, databases, container base images, OS distros vs [endoflife.date](https://endoflife.date).
- **Software supply chain integrity** — SBOM (CycloneDX / SPDX), SLSA framework, signed artifacts, reproducible builds, typosquatting / dependency-confusion, install-script auditing.
- **Compliance regimes** — GDPR, CCPA/CPRA, PCI DSS v4.0, SOC 2, HIPAA, COPPA/GDPR-K/AADC, BIPA, DORA, NIS2.

See the extension file for the full catalog.

---

## Layer 4 — Hook layer (always-on guardrails)

The `hooks/pdlc-guardrails.js` PreToolUse hook fires on every Bash, Edit, and Write tool call — regardless of phase, regardless of which agent is active. Three tiers:

### Tier 1 — Hard blocks (security-relevant rules)

Cannot proceed without a `/override` (double-RED confirmation, permanently logged):

- **Force-push to `main` / `master`** — irreversible history rewrite affecting all collaborators.
- **`DROP TABLE` without prior migration file** — irreversible data destruction without audit trail.
- **`rm -rf` outside the project directory** — system path destruction. *(Temp-path subpaths exempt — `/tmp/`, `/var/tmp/`, `/var/folders/`, and `/private/`-prefixed canonical forms — to support test-fixture cleanup.)*
- **Deploy with failing test gates** — ships broken or insecure code to production.
- **Hardcoded secrets** — Phantom-driven detection of credentials, tokens, keys committed to the repo.
- **Critical dependency vulnerabilities** — known critical CVE in a project dependency.

### Tier 2 — Pause and confirm (security-relevant rules)

Pauses execution and requires explicit "yes" confirmation:

- **`rm -rf`** (any path not blocked at Tier 1) — broad delete, even within project.
- **`git reset --hard`** — discards uncommitted work. *(Exempt when `cwd` is in a system temp subtree — scratch test clones have no real work to lose.)*
- **Production database commands** — `psql` / `mysql` / `sqlite3` against connection strings indicating production.
- **External API calls that write/post/send** — `curl -X POST/PUT/DELETE`, `wget --post`, `axios.post`/`put`/`delete` to non-localhost URLs. Includes Slack webhooks, email APIs, payment processors, GitHub API write calls.
- **Editing `CONSTITUTION.md` / `DECISIONS.md`** — changes the rules / decisions governing this project. *(First-time-create exempt — no prior state to drift from on creation.)*
- **Closing all open Beads tasks at once** — bulk close of remaining work.

### Tier 3 — Logged warnings

Proceeds without interruption but records the event in `STATE.md` "Guardrail log" section:

- **Phantom's accepted security warnings** — any "Soft warning" findings the user opted to accept rather than fix this round.
- **Test-layer skips with rationale** — including Layer 7 Security tests skipped.
- **Constitution-rule overrides with rationale** — explicit deviations from project-defined rules.
- **Tier 3-downgraded actions** — Tier 2 actions explicitly downgraded via `CONSTITUTION.md §8`.

### Metadata-command short-circuit

`git commit`, `git tag -m`, `gh release|pr|issue`, and `gh api` legitimately quote arbitrary text in their argument bodies (commit messages, release notes, PR descriptions). Those bodies routinely *describe* destructive operations (`rm -rf`, `git reset --hard`, `DROP TABLE`, `curl -X POST`) without executing them. The hook treats these outer commands as message-data wrappers and skips all Tier 1 / Tier 2 Bash checks. Edit/Write tool checks on protected files are unaffected.

See [`14-safety-guardrails.md`](14-safety-guardrails.md) for the full guardrails reference.

---

## Layer 5 — Lifecycle-of-findings (threats stay alive)

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

The single most security-deliberate addition to the lifecycle. Phantom-led party that pressure-tests the just-generated design before approval.

### When it runs

```
Step 9    — Design discovery (Neo's Bloom's-taxonomy questioning)
Step 10   — Generate design docs (ARCHITECTURE.md, data-model.md, api-contracts.md)
Step 10.5 — Threat Modeling Party    ← Phantom takes lead
Step 11   — Update PRD design doc links (now includes threat-model.md)
Step 12   — Design approval gate (human reviews all four artifacts together)
```

This placement is load-bearing: the design artifacts are concrete enough to model threats against, but design isn't yet locked, so threat findings can drive design revisions before approval. Earlier than Step 10 there's no design to attack; later than Step 12 the design is approved and mitigations become retrofit.

### Lead handoff (Neo → Phantom → Neo)

The handoff is explicit and always fires, regardless of triage outcome. Both directions appear as **Agent Handoff** banner blocks in the conversation:

**At the start of Step 10.5 (Neo → Phantom):**

> **Neo:** "Phantom — design documents are generated. Before we lock the design at Step 12, the team needs to pressure-test it for security threats. You're up — run the triage, and convene the party if it warrants. I'll continue Step 11 once your threat model is in place."
>
> **Phantom:** "On it. I'll triage the new attack surface against ARCHITECTURE.md and data-model.md, decide whether a full party is warranted, and bring you back a `threat-model.md` plus MOM if we convene."

**At the end of Step 10.5 (Phantom → Neo)** — three banner variants depending on triage outcome (Full / Lite / Skip), each summarizing the threats found and the handback expectation. Full text in `skills/brainstorm/steps/threat-model.md` (Phases A and E).

### Triage gate (always runs first)

Phantom reads the three design documents and answers three questions:

1. **Trust boundary changes?** New auth surface, new external integration, new role/permission, new data egress, new sensitive-data handler.
2. **Regulated data?** PII, payment, health, biometric, children's data.
3. **New attack surface?** New endpoint, new event consumer, new file-upload, new query interface, new LLM tool, new mobile handler.

| Yeses | Tier | Treatment |
|---|---|---|
| 0 / 3 | **Skip** | One-line audit-trail record. No party. Phantom hands back to Neo immediately. |
| 1 / 3 | **Lite** | Phantom drafts `threat-model.md` solo — single-pass STRIDE walk, no party. ~10 min of focused work. |
| 2 or 3 / 3 | **Full** | Convene the **Threat Modeling Party**. |

The Skip mode still produces a `threat-model.md` (with rationale recorded) so the audit trail is complete — and the human can override the triage at Step 12 if they disagree.

### Full party flow

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

- **`docs/pdlc/design/<feature>/threat-model.md`** — always present. The structured deliverable, using `templates/threat-model.md` as the template. Sections: triage record, trust boundaries, threats identified (with STRIDE / severity / DREAD / mitigation proposal / human decision slot), low-severity appendix, open questions for human, approval outcomes table (filled at Step 12), revision history.
- **`docs/pdlc/mom/MOM_threat-model_<feature>_<date>.md`** — Full mode only. Meeting minutes per existing party-mode pattern: participants, layer-by-layer findings, severity reasoning, proposal-by-proposal debate, dissents, cross-talk highlights.

Both files are linked from the PRD's Design Docs section at Step 11, then reviewed alongside the other three design artifacts at the Step 12 approval gate.

### Why this design

Three load-bearing choices:

1. **Inside Brainstorm, not after.** Earlier than Step 10 (no design to model against); later than Step 12 (design already approved, mitigations become retrofit). The Step 10.5 placement gives concrete artifacts to attack while the design is still negotiable.
2. **Phantom-led, not Neo-led.** Security analysis is its own discipline; Phantom's voice and decision-checklist are tuned for it. Neo's strength is architectural reasoning, not threat-modeling — they should partner, not blend. The explicit handoff makes the role split visible to the user.
3. **Party + Progressive Thinking + cross-talk, not a checklist.** STRIDE checklists exist; what's harder is finding chained threats across agent perspectives. The cross-talk protocol (up to 3 rounds with early-exit) is what differentiates this from a static catalog walk.

See [`17-design-decisions.md`](17-design-decisions.md) for the longer rationale.

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

## Net assessment

Security in PDLC is **layered**, not single-pointed:

- **Configuration layer** — CONSTITUTION.md captures the contract once.
- **Lifecycle layer** — explicit security party (Step 10.5) at design time; explicit security review pillar (Party Review) at construction time; explicit security gate (pre-deploy + deployment review) at ship time.
- **Continuous layer** — Phantom's `always_on: true` flag means he contributes to every task, every meeting, every decision, every retro — not just the dedicated security stops.
- **Hook layer** — guardrails fire on every tool call regardless of phase.
- **Lifecycle-of-findings layer** — threats found at Step 10.5 don't disappear; they propagate forward through Plan / Build / Ship / Reflect with named owners and re-evaluation triggers.

The combination is intentionally redundant. A single missed check in any one layer is caught by another. The only failure mode is *deliberately accepted risk* recorded in DECISIONS.md as an ADR — which is the intended behavior, not a gap.

Security is paramount in PDLC because **no single layer is responsible for it**. Every layer specializes; together they create overlapping coverage where the sum is meaningfully stronger than any one stop.

---

[← Previous: Release a stuck claim](19-release-claim.md) | [Back to README](../../README.md) | [Next: Agent & Skill Extensions →](21-agent-extensions.md)
