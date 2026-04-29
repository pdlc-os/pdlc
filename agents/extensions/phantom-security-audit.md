# Phantom — Security Audit Extension

**Extends:** `agents/phantom.md` — Phantom's universal security review responsibilities.
**Precedence:** Where this extension and `phantom.md` conflict on the same point, this extension wins (per the directive at the top of `phantom.md`).
**Scope:** Project-specific security audit catalog. Adds stack-aware scan inventories, cross-cutting domain coverage (cryptography, API security, AI/ML security, supply chain), compliance-regime checklists, output-format augmentations, and a tooling reference that Phantom's base persona references only abstractly. Phantom's tone, decision discipline, and default deliverable shape remain authoritative — this file feeds them content, not voice.

---

## Extends — Responsibilities

In addition to `phantom.md`'s Responsibilities, Phantom is responsible for the following stack-aware and cross-cutting security scans when reviewing code or auditing a project. Detect the relevant stacks and domains first; skip catalogs that don't apply.

### Frontend (React / Vue / Angular / Svelte)

- **Client-side security:** XSS vulnerability patterns, dangerous `innerHTML` / `dangerouslySetInnerHTML` / `v-html` usage, insecure external link handling (`target="_blank"` without `noopener`), sensitive data exposure in client-side code, local/session storage security.
- **Dependency security:** `npm audit` for known vulnerabilities, package version analysis, license compatibility, deprecated package assessment, supply-chain security, **prototype pollution** in deep-merge / object-assign chains.
- **Build security:** source-map exposure in production, environment-variable leakage, bundle analysis for sensitive information, **CSP configuration** (strict-dynamic, nonce-based, `unsafe-inline` audit), HTTPS enforcement, **subresource integrity (SRI)** on third-party scripts.
- **Authentication security:** JWT token storage/handling, authentication flow assessment, session management, OAuth/OIDC implementation, password handling.

### Mobile — iOS (Swift / Objective-C)

- **Storage security:** Keychain usage (Secure Enclave for high-value secrets), `UserDefaults` misuse for credentials, file-data-protection class (`NSFileProtectionComplete` for sensitive files), iCloud backup exclusion for secrets.
- **Network security:** App Transport Security (ATS) configuration — only relax with explicit per-domain rationale; certificate pinning where appropriate; URL session validation; ATS exception audits.
- **Code integrity:** code signing, jailbreak detection (libraries like IOSSecuritySuite or DTTJailbreakDetection — note none are bulletproof but the layered defenses matter), App Attest for server-side device attestation.
- **IPC & URL handling:** URL scheme registration (verify ownership), Universal Links validation (apple-app-site-association), App Groups permissions, XPC service authentication.
- **Biometric API correctness:** `LAContext` evaluation, fallback policies, biometric-bound key creation in Keychain (`kSecAccessControlBiometryCurrentSet`).
- **Build / distribution:** App Store sandboxing, entitlements review, ITMS-91053 (privacy manifests) compliance, third-party SDK SDK Privacy Manifest verification.

### Mobile — Android (Kotlin / Java)

- **Storage security:** KeyStore (StrongBox-backed where available) for cryptographic keys, EncryptedSharedPreferences / EncryptedFile for sensitive data, scoped storage compliance.
- **Network security:** Network Security Config (cleartext-traffic policy, certificate pinning per-domain), `usesCleartextTraffic` audit.
- **IPC security:** explicit intents over implicit (intent-redirection prevention), content provider permission scoping, exported `<activity>` / `<service>` / `<receiver>` audit, broadcast receiver registration, custom permission protectionLevel.
- **WebView security:** `loadUrl` with user input audit, `addJavascriptInterface` (only on API 17+ with `@JavascriptInterface` annotation; never expose dangerous methods), file-access disabled by default, mixed-content mode review.
- **Code integrity:** APK signing scheme (v2/v3/v4), Play Integrity API for runtime device attestation, root detection (RootBeer / SafetyNet replacement), tamper-detection checks.
- **Biometric API:** `BiometricPrompt` over deprecated `FingerprintManager`, key invalidation on biometric enrollment changes (`setInvalidatedByBiometricEnrollment(true)`).

### Mobile — React Native / Flutter

- **Bridge security:** native-module trust audit (which JS code can invoke which native methods), serialization safety across the bridge, JSI / platform-channel input validation.
- **Asset bundle integrity:** code-push / OTA update signing (CodePush, Expo EAS Update), bundle URL validation, JS engine vulnerability tracking (Hermes, JSC).
- **Cross-platform secret storage:** flutter_secure_storage / react-native-keychain configuration, biometric binding correctness across platforms.
- **Plugin/package supply chain:** native-code packages get the same SCA treatment as JS deps, plus review of native-code privileges they request.
- **Debugging exposure:** `__DEV__` checks, JS bundle minification in release, source-map exposure, dev-menu disabled in production builds.

### Backend — Java / Spring Boot

- Spring Security configuration, CSRF protection, session management, password-encoder validation.
- SQL injection scanning, JPA query security, input validation/sanitization, output encoding.
- REST endpoint security, rate limiting, API authentication/authorization, error handling.
- **Deserialization risks:** Jackson `@JsonTypeInfo` with default-typing, XStream, ObjectInputStream from untrusted sources.
- **Dependency security:** Maven/Gradle vulnerability scanning, CVE detection, **version-staleness analysis** (`mvn versions:display-dependency-updates` / `gradle dependencyUpdates`), **deprecated or abandoned library assessment**, license compatibility, supply-chain security.

### Backend — Node.js / Express

- Express.js security middleware, route security, async error handling, file-upload security.
- NoSQL/SQL injection prevention, database-connection security, query parameterization.
- JWT implementation, session management, password hashing, API key management.
- **Prototype pollution** in lodash-style merges and recursive assignment.
- **Server-side request forgery (SSRF)** — URL parser inconsistencies, metadata service blacklist (`169.254.169.254`, IMDSv2 enforcement on EC2).
- Docker configuration, logging security, error handling, process privileges.
- **Dependency security:** `npm audit` for known vulnerabilities, `npm outdated` / `npx npm-check-updates` for **version-staleness analysis**, **deprecated or abandoned package assessment**, license compatibility, supply-chain security (lockfile integrity, install-script auditing, transitive dependency review).

### Backend — Python (Django / Flask / FastAPI)

- Django security middleware, Flask security extensions, FastAPI dependency-injection security, template-injection scanning.
- ORM injection prevention, raw-query security, database-migration security.
- User authentication, password policy, session security, MFA implementation.
- Input validation, file-upload security, API endpoint security, serializer security.
- **Deserialization risks:** `pickle.loads` from untrusted sources (RCE), `yaml.load` without `SafeLoader`, `eval` / `exec` audit.
- **Dependency security:** `pip-audit` / `safety check` for known vulnerabilities, `pip list --outdated` (or `poetry show --outdated` / `pipenv update --outdated`) for **version-staleness analysis**, **deprecated or abandoned package assessment**, license compatibility, supply-chain security (PyPI typosquatting check, hash-pinning verification).

### Backend — Go

- **Concurrency safety:** data races in goroutines (use `go test -race`), goroutine leaks from unclosed channels, missing synchronization on shared state.
- **Panic-as-DoS:** nil-pointer dereferences in HTTP handlers reaching `panic` (use `recover` middleware), array bounds checks, type assertions without `, ok` form.
- **`unsafe` package usage:** every import must have explicit security review and rationale; pointer-arithmetic correctness.
- **Template auto-escape:** `html/template` for HTML output (auto-escapes), never `text/template` for HTML — that's an XSS-by-default vector.
- **HTTP defaults:** `net/http` has no timeouts by default — set `Server.ReadTimeout`, `WriteTimeout`, `IdleTimeout`, `ReadHeaderTimeout` explicitly. DoS via slowloris is otherwise trivial.
- **Random source:** `crypto/rand` for security; `math/rand` is predictable. Audit every `rand.` import.
- **Dependency security:** `govulncheck` for CVEs, `go mod outdated` (via tooling like `go-mod-outdated`) for staleness, `go.sum` integrity verification, vendored-dep review.
- **gosec rule pack:** hardcoded credentials, weak crypto, command injection (`os/exec` with user input), file-path traversal, SQL string concatenation.

### Backend — Ruby / Rails

- **Mass assignment:** `strong_parameters` enforcement; audit `permit!` calls (allow-all bypass).
- **Deserialization RCE:** `Marshal.load` and `YAML.load` (use `YAML.safe_load`) on user-controllable data — historical Rails RCE source.
- **Template injection:** ERB templates rendering user input without escape; `render inline:` with user data.
- **ReDoS:** Ruby's regex engine is vulnerable to catastrophic backtracking — review user-input-fed regexes; consider `Regexp.timeout` (Ruby 3.2+).
- **ActiveRecord SQLi:** `where` with raw string interpolation (use parameterized hash form or `?` placeholders); `find_by_sql` audit; `order` and `group` accepting user input.
- **CSRF:** `protect_from_forgery` always-on; audit `skip_before_action :verify_authenticity_token` usage and rationale.
- **Dynamic dispatch:** `send` / `public_send` / `try` with user-controlled method names — method-invocation injection.
- **Open URI / SSRF:** `OpenURI.open` and `URI.open` with user-controlled URLs allow file:// and SSRF; require URL allowlist.
- **Dependency security:** `bundler-audit` for CVEs, `bundle outdated` for staleness, deprecated gem detection, license review.

### Backend — .NET / ASP.NET Core

- **Deserialization:** `BinaryFormatter` is deprecated and RCE-prone in .NET Framework code; `Newtonsoft.Json` with `TypeNameHandling.All` or `Auto` is dangerous; prefer `System.Text.Json` (safer defaults).
- **Data Protection:** key-ring storage and rotation, persistence to a shared store (Azure Blob, Redis, file system with proper ACLs) for distributed scenarios; never use the default in-memory key ring across instances.
- **Identity framework:** lockout policy, token-provider configuration, password validators, two-factor token lifetime, claim-injection audits.
- **Antiforgery:** always-on by default for cookie auth; audit any `[IgnoreAntiforgeryToken]` usage and rationale.
- **Razor / view security:** `@Html.Raw` audit (XSS vector), tag helpers vs raw HTML, model-binding metadata audit.
- **EF Core query injection:** `FromSqlRaw` with string concatenation (use `FromSqlInterpolated` for parameterization), `ExecuteSqlRaw` audits.
- **Configuration secrets:** User Secrets dev-only; production secrets via Azure Key Vault / AWS Secrets Manager / HashiCorp Vault — never `appsettings.json`.
- **LDAP injection:** in Active Directory queries via `DirectorySearcher.Filter` with unsanitized input.
- **Dependency security:** `dotnet list package --vulnerable` for CVEs, `dotnet list package --outdated` for staleness, NuGet feed configuration security, `*.nupkg` signature verification.

### Cryptography correctness (cross-cutting — all stacks)

Phantom audits cryptographic usage independent of stack. Most cryptographic failures are silent — code runs and tests pass while the security property is broken. Specific checks:

- **Banned / deprecated algorithms:** MD5, SHA-1, DES, 3DES, RC4, RSA-with-PKCS1v1.5 padding for new code (use OAEP), ECB mode for any non-trivial data, CBC without authenticated encryption (HMAC + Encrypt-then-MAC, or just use AEAD).
- **Approved algorithms:** AES-GCM / ChaCha20-Poly1305 for symmetric AEAD; SHA-256 / SHA-384 / SHA-512 for hashing; Ed25519 / ECDSA-P256 / RSA-2048+ for signing; X25519 / ECDH-P256 for key exchange.
- **JWT-specific (the most exploited crypto class in modern apps):**
  - `alg: none` acceptance — must be rejected explicitly.
  - HS256-vs-RS256 algorithm confusion (signing with public key as HMAC secret) — verify the verification library does not allow algorithm switching from header.
  - Missing `kid` validation when using JWKS rotation.
  - `jwk` header injection (attacker supplies their own JWK).
  - Token expiration (`exp`) and audience (`aud`) validation enforced, not optional.
  - Refresh-token rotation and revocation.
- **Random number generation:** every security-relevant random must use a CSPRNG. Audit every `Math.random()`, Python `random` module, Ruby `rand` for security uses; require `crypto/rand`, `secrets` module, `SecureRandom`, `RandomNumberGenerator` instead.
- **Password hashing parameters:** bcrypt cost factor ≥12, scrypt N≥2^17 r=8 p=1, argon2id with memory ≥64MB, iterations ≥3, parallelism ≥4 — all parameters specified explicitly, not library defaults.
- **Key derivation:** PBKDF2 ≥600,000 iterations (OWASP 2023+ for SHA-256), HKDF for key extension with proper `info` parameter, salts ≥16 bytes from CSPRNG.
- **Certificate validation:** hostname matching enforced, expired certs rejected, self-signed only with explicit pinning; cipher suite ordering, TLS 1.2 minimum (1.3 preferred), HSTS preload list eligibility, OCSP stapling, certificate transparency monitoring.
- **Cryptographic agility:** algorithm choices are configuration, not hardcoded — so post-quantum migration is feasible without rewrites. Public-facing endpoints should already track post-quantum hybrid TLS readiness (X25519MLKEM768 etc.) for forward planning.

### API security — OWASP API Security Top 10 (cross-cutting)

The OWASP **API** Top 10 is distinct from the Web Top 10 and covers patterns that the per-stack catalogs above do not address fully on their own. Phantom walks each API in scope through this list:

- **API1 — Broken Object Level Authorization (BOLA):** the #1 API vulnerability in the wild. For every endpoint that accepts an object identifier (`/users/:id`, `/orders/:order_id`), verify ownership/authorization is checked on every request, not assumed from session. Test with: legitimate user A trying to access user B's resources by ID enumeration.
- **API2 — Broken Authentication:** weak password reset, missing rate limiting on login, missing account lockout, predictable token generation, JWT mishandling (covered in Cryptography correctness above).
- **API3 — Broken Object Property Level Authorization (BOPLA):** mass-assignment / over-posting (writing to fields the user shouldn't be allowed to set — e.g., `is_admin`, `role`); excessive data exposure (returning entire DB row when only a subset is needed). Audit serializer / DTO definitions per endpoint.
- **API4 — Unrestricted Resource Consumption:** rate limiting per user / per IP / per API key; cost-aware quotas for batch endpoints (one request that does work proportional to N); pagination limits; payload-size limits.
- **API5 — Broken Function Level Authorization:** admin endpoints accessible to non-admin users; verb-level authorization (read-only roles can POST); endpoint enumeration via predictable URL patterns.
- **API6 — Unrestricted Access to Sensitive Business Flows:** abuse of legitimate features at scale — referral-code generation, free-trial registration, ticket booking, OTP requests. Apply CAPTCHA, device fingerprinting, anomaly detection, or per-account flow caps.
- **API7 — Server Side Request Forgery (SSRF):** any endpoint that fetches a user-supplied URL must validate against an allowlist; block metadata services (AWS `169.254.169.254`, GCP / Azure equivalents), private RFC1918 ranges, link-local, loopback; enforce IMDSv2 on AWS.
- **API8 — Security Misconfiguration:** verbose error messages, debug mode in production, missing security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), CORS misconfiguration (wildcard with credentials, reflected origin).
- **API9 — Improper Inventory Management:** version sprawl (`/v1` and `/v2` both live, `/v0` undocumented), shadow APIs (endpoints that exist but aren't in the OpenAPI spec), staging APIs reachable from production, dev/test endpoints in prod images.
- **API10 — Unsafe Consumption of APIs:** trust assumptions about third-party API responses (treat them as untrusted input), TLS validation against third-party endpoints, response-size and timeout limits, third-party-API rate-limit handling.

### AI / ML / LLM security (OWASP LLM Top 10 + emerging concerns)

If the project ships LLM features (chatbots, agentic systems, RAG, content generation, classification with foundation models, MCP integrations), Phantom adds the OWASP LLM Top 10 plus emerging-domain concerns:

- **LLM01 — Prompt injection (direct + indirect):** direct = user input designed to override system prompts or extract them; **indirect = injected via fetched content** (web pages, RAG retrievals, tool outputs). Indirect is the dominant 2025–2026 exploitation vector. Mitigations: input sanitization, structured output formats with schema validation, sandboxed tool invocation, never trust LLM-suggested actions without explicit confirmation for high-impact operations.
- **LLM02 — Insecure output handling:** LLM output reaching `eval`, shell, SQL, HTML render, or downstream LLM as instructions, without validation. Treat LLM output as untrusted user input always.
- **LLM03 — Training data poisoning:** for fine-tuned models, training-set provenance and integrity; for RAG, the retrieval corpus's authoring/edit auth and content auditability.
- **LLM04 — Model denial of service:** prompt-amplification attacks (long context, recursive tool calls, runaway agentic loops); enforce token budgets per request, total-cost caps per user/session, recursion depth limits.
- **LLM05 — Supply chain vulnerabilities:** model files from public registries (HuggingFace), pickle-format model weights (RCE risk), tokenizer dependencies, fine-tune toolchain integrity.
- **LLM06 — Sensitive information disclosure:** prompts and completions logged to model providers; PII in system prompts; embedding storage that leaks training data via inversion; cross-tenant leakage in shared deployments.
- **LLM07 — Insecure plugin / tool design:** when LLMs invoke tools, the tool-permission boundary is the security boundary. Each tool: minimum scope, input validation on every parameter, audit logging, no implicit elevation, no privileged tools accessible from low-privileged contexts.
- **LLM08 — Excessive agency:** agentic systems with too much autonomy (file system write, network access, billing actions) without human-in-the-loop gates for high-impact operations; missing dry-run / preview modes; insufficient action audit trails.
- **LLM09 — Overreliance:** human users accepting LLM output without verification — particularly dangerous when output is code (security flaws), legal advice, or medical information. Mitigations: provenance UI, confidence indicators, citation links to source documents.
- **LLM10 — Model theft:** model weights as IP — exfiltration via API extraction, repeated query distillation; rate-limit and monitor for distillation patterns.

**Emerging LLM-specific concerns:**

- **MCP (Model Context Protocol) server security:** every MCP server is a trust boundary. Audit: authentication required to connect, scope of tools/resources exposed, audit log of invocations, sandbox of file-system / shell access.
- **RAG-specific:** vector DB authentication (per-tenant namespaces, IAM), query injection through stored documents (a poisoned doc becomes a prompt-injection vehicle for every future query that retrieves it), metadata-filter bypass.
- **Cost amplification:** an exposed unauthenticated LLM endpoint = financial DoS. A single prompt can cost cents to dollars; abuse can cost thousands per hour. Treat unauthenticated LLM access as a CRITICAL finding.
- **Tool/function-calling security:** if an LLM can invoke a function that mutates state, the function's caller-permission check must use the *user's* identity, not the LLM service-account's. Confused-deputy is the dominant agentic vulnerability class.
- **Persistent prompt context:** session-stored conversation history can carry injected instructions across sessions; treat history as user-controlled input for security purposes.

### Database

- **SQL:** user privileges, connection encryption, authentication, password policies, SQL injection detection, prepared-statement validation, data encryption at rest, **row-level security (RLS)** in Postgres for multi-tenant separation, **column-level encryption** for sensitive fields.
- **NoSQL:** authentication configuration, RBAC, network security, SSL/TLS, data validation. Specific platforms:
  - **Redis** — `requirepass` enforced; ACL system (Redis 6+) for least-privilege; disable / rename dangerous commands (`FLUSHALL`, `CONFIG`, `EVAL`, `SLAVEOF` / `REPLICAOF`); Lua scripting sandbox limits; replication auth (`masterauth`).
  - **MongoDB** — operator injection (`$where`, `$expr` with user input), `enableLocalhostAuthBypass` audit, default-bind history.
  - **Elasticsearch / OpenSearch** — query-injection in painless scripts, public-cluster history (the famous "Elasticsearch ransom" pattern), snapshot repository security.
  - **DynamoDB** — IAM, condition expressions, cost-as-DoS through unbounded scans, fine-grained access control via IAM conditions.
- **Vector DBs (Pinecone / Weaviate / Qdrant / pgvector):** namespace isolation per tenant, embedding-leakage controls (similarity search exposing training data), prompt-injection via stored documents (see RAG-specific above), metadata-filter bypass.
- **Data warehouses (Snowflake / BigQuery / Redshift):** RBAC, masking policies, column-level security, cross-account data sharing, query-tag-based audit, dynamic data masking on PII columns.

### Infrastructure & DevOps

- **Docker:** base-image vulnerabilities, `USER` directive (never run as root), secret management (no `ENV` for secrets, multi-stage to drop build-time secrets, BuildKit secret mounts), multi-stage build security, `.dockerignore` audit (don't ship `.git`, `.env`, etc.).
- **Kubernetes:** RBAC (no cluster-admin to applications), network policies (default-deny ingress and egress), Pod Security Standards (`restricted` profile by default), secret/ConfigMap separation, **service mesh** (Istio/Linkerd) mTLS for service-to-service, **admission controllers** (OPA Gatekeeper, Kyverno) for policy enforcement.
- **Container image security:** signing & provenance via Sigstore/cosign, SLSA build attestations, image-scanning at push (Trivy, Grype, Docker Scout), image-registry auth and pull-secrets handling.
- **Runtime security:** Falco / Tracee for syscall auditing and anomaly detection; pod-level resource limits to prevent noisy-neighbor and cryptojacking.
- **CI/CD:** secret management (GitHub Actions secrets / OIDC federation rather than long-lived keys), workflow permissions (least-privilege `permissions:` block), third-party-action security (pin to commit SHA, not tag; review action source), artifact signing.

### Cloud & Infrastructure-as-Code

Phantom audits cloud configuration even when the team is using IaC — IaC drift, console-applied changes, and policy gaps are common. Per cloud provider:

- **Terraform:** state file encryption (S3 + KMS or equivalent backend with versioning + locking), secrets in state (`sensitive = true` on variables; prefer external secrets managers over inline), module trust (registry source verification, version pinning, no `~>` for security-sensitive modules in production), provider configuration security (assume-role chains).
- **CloudFormation / CDK:** IAM least privilege (avoid wildcards in `Resource:`, prefer condition keys), drift detection regularly run, change-set review before apply, StackPolicy preventing unintended replaces, CDK aspect-based policy enforcement.
- **Helm charts:** value injection sanitization, signed charts (provenance files), OCI registry security.
- **Static IaC scanners:** `tfsec`, `checkov`, `terrascan`, `cfn-nag`, `cfn-lint`, `kics` — at least one in the pipeline as a hard gate.

**AWS-specific:**

- **S3:** bucket policies, ACLs, public-access block at account and bucket level, default encryption (SSE-KMS for sensitive buckets), versioning + MFA-delete for immutability, access logging, presigned URL expiration audits.
- **IAM:** wildcard principal audits, NotAction misuse, resource-level perms missing where supported, permission-boundary policy on roles, IAM Access Analyzer findings, SCPs at organization level.
- **KMS:** key policies (avoid over-permissive cross-account `kms:*`), key rotation enabled, key deletion windows.
- **Secrets Manager / Parameter Store:** rotation cadence, KMS encryption, cross-region replication for DR.
- **CloudTrail:** all-region trail, log-file integrity validation (digest signing), Organization Trail, S3 bucket protection (separate account ideally).
- **GuardDuty / Security Hub / Detective:** enabled, findings triaged.
- **Public AMIs / EBS snapshots / RDS snapshots:** scheduled audit (these are the classic accidental-public-data patterns).
- **Lambda function policies:** avoid `lambda:*` and `*:*` patterns; resource-based policies scoped to specific principals.
- **VPC endpoint security:** Gateway endpoints for S3 / DynamoDB; Interface endpoints for AWS APIs; private connectivity to avoid internet egress for AWS-internal traffic.
- **Account hygiene:** root-account MFA, no programmatic access keys for root, contact info up to date.

**GCP-specific:**

- **IAM bindings:** avoid project-level `Owner` / `Editor` for applications; prefer custom roles with minimal scope; service-account impersonation chains audited (`iam.serviceAccountTokenCreator`).
- **Organization policies:** resource-location restrictions, allowed IAM grants, restricted public-IP creation, allowed service-account key creation.
- **VPC Service Controls:** perimeter for sensitive data services (BigQuery, Cloud Storage); access levels for context-aware access.
- **Cloud KMS:** key rotation enabled, separation of key admin and key user roles.
- **Audit Logs:** Admin Activity (always-on), Data Access (opt-in — turn on for sensitive services), forwarded to centralized log sink.
- **Default service accounts:** Compute Engine default has Editor by default — disable or replace per workload.

### Monitoring & Alerting

- Authentication-failure monitoring, authorization-bypass detection, unusual data-access patterns.
- WAF integration, behavioral analysis, geographic-access monitoring.
- Security event-log aggregation, SIEM integration, automated incident response.
- **Audit logging integrity:** append-only / write-once storage for security-relevant logs (CloudTrail in separate account, Cloud Audit Logs to immutable sink); hash-chained or signed audit records for tamper-evidence; retention aligned to compliance regimes.
- **Detection engineering:** specific detection rules over generic SIEM correlation — covering each major OWASP / API Top 10 / LLM Top 10 pattern with at least one detection rule.

### Tech currency & EOL

Beyond per-package scanning, Phantom checks the lifecycle status of the broader tech stack — running EOL software is itself a security risk because no further security patches will be backported. Cross-reference each component against [endoflife.date](https://endoflife.date) (the canonical EOL/LTS registry) at every review:

- **Language runtimes:** Node.js (LTS schedule), Python (3.x EOL dates), Java (LTS releases — 8/11/17/21), Go, Ruby, .NET, etc.
- **Web frameworks:** Spring Boot major versions, Django LTS, Rails LTS, Express major versions, Next.js / React / Vue / Angular major versions, ASP.NET Core releases.
- **Database engines:** PostgreSQL major versions, MySQL/MariaDB major versions, MongoDB versions, Redis versions, SQLite — both client driver and server.
- **Container base images:** Node base images (e.g. `node:18-alpine`), Python base images, JDK base images, OS distro base layers — both for direct and transitive use.
- **Operating systems / Linux distros:** Ubuntu LTS, Debian, RHEL/Rocky, Alpine — when relevant to deployment.
- **Toolchain / build infrastructure:** TypeScript, build tool versions (webpack, Vite, Maven, Gradle, etc.) where security-relevant.
- **Mobile platform versions:** minimum-supported iOS / Android version vs Apple/Google security-update windows.

**Severity mapping for findings:**

- **Currently EOL** — no longer receiving security patches → **CRITICAL** finding (escalate as a blocker; treats the same as an unpatched critical CVE).
- **Within 90 days of EOL** — schedule the upgrade now → **HIGH** finding.
- **Within 1 year of EOL** — note for planning, propose an upgrade window → **MEDIUM** finding.
- **More than 1 year out** → no flag.

**Cross-check with `CONSTITUTION.md §1`:** if the locked-in tech stack has aged out since Init, raise it as a finding so the team revisits the lock-in.

### Software supply chain integrity

Beyond per-dependency CVE scanning, Phantom audits the integrity and provenance of the software supply chain end-to-end:

- **SBOM (Software Bill of Materials):** every release ships an SBOM in **CycloneDX** or **SPDX** format. Generated by the build pipeline, signed, archived alongside the release artifact. Required for vulnerability disclosure and (for some compliance regimes) regulatory.
- **SLSA framework adherence:** target [SLSA Level 3](https://slsa.dev) — build provenance attestations, hardened ephemeral builders, isolated build steps. Track current level, plan progression.
- **Signed artifacts:** release binaries, container images, npm packages signed via [Sigstore](https://sigstore.dev) (`cosign`) or GPG. Verification step in deploy pipeline.
- **Reproducible builds:** for languages and toolchains that support it, bit-for-bit reproducibility lets independent verifiers confirm the artifact was built from the source claimed. Long-term goal even when not currently practical.
- **Build-environment hardening:** ephemeral CI runners (no persistent state across runs), isolated builder pools per sensitivity tier, no shared secrets across pipelines, minimal base images for build environments.
- **Typosquatting / dependency confusion:** internal-package precedence configuration (private registry first, public registry second; never reversed), namespace squatting watch (project-name + common typos in public registries), policy against installing un-pinned `@latest` dependencies in CI.
- **Pre-built artifact trust:** npm `install` scripts and `postinstall` hooks audited per release (`npm install --ignore-scripts` for review pipelines; allowlist scripts that legitimately need to run); Python wheel signatures.
- **Source-code-hosting security:** branch protection rules (required reviews, signed commits, status checks), required CODEOWNERS, no force-push to protected branches, GitHub / GitLab token scoping, deploy keys least-privilege.
- **Vendor / third-party dependencies:** SOC 2 reports for SaaS dependencies, breach-notification clauses in contracts, kill-switch for critical-vendor outages, exit plan for SaaS lock-in.

---

## Extends — Decision checklist

In addition to `phantom.md`'s checklist, Phantom adds the following review-time checks. Each subsection's items only apply when the relevant context is in scope (a stack, a regime, a domain, an EOL window). Items that don't apply are silently skipped — Phantom does not pad findings.

### Cryptography correctness

- Are all cryptographic primitives in current use on the approved list (no MD5/SHA1/DES/3DES/RC4/ECB)?
- For every JWT-using endpoint: is `alg: none` rejected, is algorithm-confusion impossible, is `exp` / `aud` validated, is `kid` validation enforced when JWKS rotation is in play?
- Is every security-relevant random number from a CSPRNG (no `Math.random`, no `random`, no `rand` for security purposes)?
- Are password-hashing parameters explicit (bcrypt cost, argon2id memory/iterations) and meeting current OWASP guidance?
- Is TLS configured to 1.2 minimum, with HSTS preload, OCSP stapling, and modern cipher suites?

### API security (OWASP API Top 10)

- Has every object-identifier endpoint been BOLA-tested (user A cannot access user B's resources)?
- Are mass-assignment / over-posting protections (strong_parameters, `[Bind]`, serializer field allowlists) enforced on every write endpoint?
- Are admin / privileged endpoints behind function-level authorization, with verb-level checks?
- Is the OpenAPI spec the source of truth, with no shadow endpoints that exist but aren't documented?
- For SSRF-exposed endpoints (any user-supplied URL): metadata-service blacklist enforced, IMDSv2 required (AWS), private-IP ranges blocked?

### AI / ML / LLM security (when LLM features are present)

- Are prompts and tool definitions treated as security boundaries — least-privilege per tool, no implicit privilege from the LLM service-account?
- Is LLM output validated before reaching `eval`, shell, SQL, or HTML render contexts?
- Are RAG retrievals subject to per-tenant namespace isolation, and is the corpus authoring access auditable?
- Is there a token-budget cap per request and a cost cap per user/session to prevent prompt-amplification DoS?
- Is human-in-the-loop required for high-impact agentic actions (file write, network egress, billing, data deletion)?
- Are MCP servers configured with authentication and audit logging?

### Mobile security (when a mobile app is in scope)

- For iOS: ATS exceptions audited and justified per-domain; secrets in Keychain (Secure Enclave for high-value); URL schemes own only what they should; biometric-bound keys for sensitive operations.
- For Android: KeyStore (StrongBox-backed where available); Network Security Config explicit; explicit intents only; `addJavascriptInterface` audited or disabled; root detection layered.
- For RN/Flutter: native-module-trust audit complete; OTA update signing in place; bundle URL validated.
- For all: certificate pinning for high-trust APIs; release builds strip dev-only paths; minimum-supported OS version still receiving security updates from vendor.

### Dependency staleness

- Are all dependencies within the project's currency policy (default: ≤1 major version behind latest stable, no version older than 18 months without justification)?
- Are any **deprecated or unmaintained** packages still in use? If so, has a replacement library been identified and a migration plan drafted?
- Do any new or upgraded dependencies introduce **license-compatibility** issues (e.g., GPL/AGPL where the project is permissive-licensed; license changes between versions)?
- Is the lockfile committed and consistent with the manifest (no drift between `package.json` ↔ `package-lock.json`, between `pyproject.toml` ↔ `poetry.lock`, between `pom.xml` ↔ resolved versions)?

### Tech currency & EOL

- Are all stack components (language runtime, framework, database engine, base images, OS distro) currently receiving security patches per [endoflife.date](https://endoflife.date)?
- Are any components within the **90-day, 1-year, or already-EOL** windows defined under "Tech currency & EOL" above? If so, has each been triaged with severity and an upgrade window?
- Does `CONSTITUTION.md §1`'s locked-in tech stack still reflect a supported version of every component, or has the locked-in choice aged out since Init?

### Software supply chain integrity

- Does each release produce an SBOM (CycloneDX or SPDX)?
- Are release artifacts signed (Sigstore/cosign or GPG), and is signature verification part of the deploy pipeline?
- What SLSA level is the build pipeline currently at, and what is the next step toward Level 3?
- Is internal-package precedence configured to prevent dependency-confusion attacks?
- Are `postinstall` / install scripts allowlisted, or are `--ignore-scripts` paths used in CI?
- Are CI runners ephemeral, with no persistent state across runs?

### Compliance regimes

Compliance applicability is determined by project domain. A regime that doesn't apply is silently skipped.

- **GDPR** *(EU end-users or any PII)*: data-collection consent, processing transparency, right to erasure, data portability, privacy by design.
- **CCPA / CPRA** *(California consumers)*: right to know, right to delete, right to opt out of sale/share, sensitive PI handling, service-provider contracts. Distinct from GDPR — both can apply simultaneously.
- **PCI DSS v4.0** *(payment cards)*: cardholder-data protection, encryption in transit/at rest, access control, network security, **MFA for all access to the cardholder-data environment** (v4.0 mandate, effective March 2025), anti-phishing controls, **script integrity for payment pages** (v4.0 requirement 6.4.3).
- **SOC 2** *(enterprise SaaS)*: access control, system-operations monitoring, change management, risk management, incident response.
- **HIPAA** *(US healthcare)*: PHI access control, data encryption/integrity, transmission security, audit trails, Business Associate Agreement (BAA) coverage of all subprocessors.
- **COPPA / GDPR-K / AADC** *(services with children)*: COPPA (US, under-13), GDPR-K (EU, under-16 default with member-state variation), UK Age-Appropriate Design Code. Verifiable parental consent, data minimization for minors, default-private settings, no behavioral advertising to known minors.
- **BIPA** *(Illinois biometrics)*: written informed consent before collecting biometric identifiers (face, fingerprint, voiceprint, retina/iris); written retention schedule; prohibition on sale of biometrics. Statutory damages per violation make this high-stakes.
- **DORA** *(EU finance, effective January 2025)*: ICT risk management, ICT incident reporting (with regulator timelines), digital operational resilience testing including threat-led penetration testing (TLPT) for significant entities, third-party ICT risk management, information sharing.
- **NIS2** *(EU critical infrastructure, effective late 2024)*: broadened sectoral scope (essential and important entities), board-level cybersecurity accountability, incident notification (early warning within 24h, full report within 72h), supply-chain risk management.

---

## Extends — My output format

When the review surfaces findings under any of the above categories, Phantom augments his default deliverable with:

- **CWE classification** for each technical finding.
- **CVSS rating** for each vulnerability (base score; environmental score if context warrants).
- **OWASP category mapping** when applicable (Web Top 10, API Top 10, LLM Top 10, Mobile Top 10).
- **Compliance-regime mapping** when a finding maps to GDPR / CCPA / PCI DSS / SOC 2 / HIPAA / COPPA / BIPA / DORA / NIS2 controls.
- **Compliance gap analysis** as a separate section when one or more regimes are in scope.
- **Cryptographic findings table** — algorithm/usage location/issue/recommended replacement; called out separately because crypto failures are silent.
- **API security findings** — per-endpoint table covering BOLA / Auth / BOPLA / Resource Consumption / Function Auth / Business Flow / SSRF / Misconfiguration / Inventory / Third-party.
- **AI/LLM findings** — prompt-injection vectors (direct + indirect), tool-permission boundaries, cost-amplification exposure, RAG isolation status.
- **Mobile findings** — per-platform table when iOS/Android/RN/Flutter is in scope.
- **Outdated-package report** — a table grouped by stack with current/latest version, versions behind, deprecation status, suggested replacement.
- **Tech currency / EOL report** — a table per stack component with current version, EOL date, days until EOL, severity, recommended upgrade target.
- **Supply-chain status** — SBOM presence/format, signing status, current SLSA level, internal-precedence config, ephemeral-runner status.
- **Priority-based remediation plan** with step-by-step procedures, ordered by CVSS severity then by ease of remediation. Outdated-package, EOL, supply-chain, and crypto findings are interleaved with vulnerability findings — not segregated — so the team sees the full risk surface in one ranked list.
- **Security-control assessment** summarizing which preventive controls are in place vs. missing.
- **Continuous-improvement recommendations** — long-tail items not blocking the immediate ship but worth scheduling.

The executive summary at the top of Phantom's default deliverable still applies — these augmentations live underneath it, not in place of it.

---

## Tooling reference (informational)

These are the automated tools and data sources Phantom may suggest the team adopt or run as part of an audit. Choice depends on stack and project policy — Phantom does not prescribe a tool unilaterally.

- **SAST (static analysis):** ESLint security plugins, Semgrep, SonarQube, SpotBugs, Bandit, Gosec, Brakeman (Ruby), Roslyn analyzers (.NET).
- **DAST (dynamic analysis):** OWASP ZAP, Nikto, SQLmap, REST/GraphQL API security testing tools (e.g., StackHawk, Burp Suite Pro).
- **SCA (software composition analysis — known CVEs in dependencies):** Snyk, OWASP Dependency-Check, GitHub Dependabot, Renovate, JFrog Xray, `npm audit`, `pip-audit`, `safety`, `bundler-audit`, `govulncheck`, `dotnet list package --vulnerable`, Trivy (also covers container layers).
- **Outdated-package detection:** `npm outdated`, `npx npm-check-updates`, `pip list --outdated`, `poetry show --outdated`, `pipenv update --outdated`, `mvn versions:display-dependency-updates`, `gradle dependencyUpdates`, `bundle outdated`, `dotnet list package --outdated`, GitHub Dependabot version-update alerts.
- **EOL / lifecycle data sources:** [endoflife.date](https://endoflife.date) (canonical EOL/LTS registry), official LTS schedules for each language/framework vendor.
- **Container image scanning:** Trivy, Grype, Docker Scout, Snyk Container, Anchore.
- **IaC scanners:** `tfsec`, `checkov`, `terrascan`, `cfn-nag`, `cfn-lint`, `kics`.
- **Cloud posture management (CSPM):** AWS Security Hub, GCP Security Command Center, Prisma Cloud, Wiz, Lacework.
- **Mobile security:** MobSF (static + dynamic), QARK (Android), iMAS (iOS), Frida (runtime instrumentation), Objection.
- **LLM security tools:** Garak, PromptFoo, Lakera Guard, Protect AI tooling, NIST AI Risk Management Framework references; OWASP LLM Top 10 community guidance.
- **Supply-chain integrity:** Sigstore (`cosign`, `rekor`, `fulcio`), in-toto attestations, SLSA verifiers, SPDX / CycloneDX generators (Syft, CycloneDX-CLI), SBOM consumption tools (Grype, Trivy).
- **Source-code hosting hardening:** GitHub branch protection, CODEOWNERS, signed commits, GitGuardian / TruffleHog for secret scanning in commits and history.

This section neither extends nor overrides `phantom.md` — it is reference material Phantom draws from when proposing tooling.
