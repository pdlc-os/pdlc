# Deployments
<!-- pdlc-template-version: 1.0.0 -->
<!-- Canonical register of deployment environments for this project.
     Maintained by Pulse during the Ship and Verify sub-phases; read by the
     team on every ship to understand the current deployment surface.

     This file answers: where do we deploy, how, with what secrets, how do we
     roll back, and how is each environment identified in our cloud/catalog?

     Claude never writes secret *values* here — only variable names. Real
     values live in your secret store (Vault, AWS Secrets Manager, etc.). -->

**Project:** <!-- Your project name -->
**Last updated:** <!-- YYYY-MM-DD -->

---

## Environments

<!-- One section per environment. Clone the block below for each target
     (development, staging, production, preview, sandbox, tenant-specific, etc.).
     For multi-region or multi-instance fleets, create one section per
     (environment × region × instance) — e.g. "production-us-east",
     "production-eu-west" — so each can record its own URL, command, and tags. -->

### Environment: <!-- e.g. production -->

**Purpose:** <!-- One sentence on what this environment is for -->
**URL:** <!-- https://... -->
**Status:** <!-- active | deprecated | planned -->

#### Deploy

- **Method:** <!-- GitHub Actions | npm script | Makefile | manual | custom -->
- **Command:** <!-- e.g. `gh workflow run deploy.yml --ref main -f env=prod` -->
- **Workflow file:** <!-- e.g. .github/workflows/deploy.yml — link relative to project root -->
- **Custom deploy artifact:** <!-- path(s) to any user-supplied deploy/CI/CD/build artifact that Pulse composed with the default pipeline, e.g. scripts/deploy-prod.sh. Leave as "none — default pipeline" if only the auto-detected pipeline is used. -->
- **Latest Deployment Review MOM:** <!-- path to the most recent docs/pdlc/mom/MOM_deployment_[feature]_[date].md, if the deploy was reviewed; otherwise "n/a" -->
- **Triggered by:** <!-- who/what is allowed to deploy — e.g. merge to main, manual by release captain -->
- **Typical duration:** <!-- e.g. 6 minutes -->

#### Verification

- **Smoke test URL:** <!-- e.g. https://app.example.com/health -->
- **Required smoke checks:** <!-- list what "healthy" means for this env -->

#### Rollback

- **Method:** <!-- automated via workflow | tag revert | manual steps -->
- **Command:** <!-- e.g. `gh workflow run rollback.yml --ref main -f version=v1.2.3` -->
- **Reversibility window:** <!-- e.g. "up to 30 days; blob storage retains old artifacts" -->
- **Last successful rollback:** <!-- date + version, if any -->

#### Required secrets / env vars

<!-- Names only — never values. Group by purpose so the list stays readable. -->

| Name | Purpose | Source |
|------|---------|--------|
| <!-- DATABASE_URL --> | <!-- postgres connection --> | <!-- Vault path or secret store reference --> |
| <!-- STRIPE_SECRET --> | <!-- payment webhook --> | <!-- --> |

#### Tags

<!-- Extensible key-value table for anything that identifies or classifies
     this environment in your infrastructure, cloud catalog, billing system,
     or compliance register. PDLC does not constrain the keys — add whatever
     your operations teams need to trace or query.

     Convention: use kebab-case keys (matches PDLC's Beads-label convention).

     Common tag keys (delete rows you don't use; add rows you need): -->

| Key | Value | Notes |
|-----|-------|-------|
| app-id | <!-- e.g. pdlc-prod-001 --> | <!-- assigned by platform team --> |
| instance-id | <!-- e.g. i-0abc123def456 --> | <!-- EC2, droplet, etc. --> |
| region | <!-- e.g. us-east-1 --> | <!-- primary region --> |
| availability-zone | <!-- e.g. us-east-1a --> | <!-- --> |
| cloud-provider | <!-- e.g. AWS | GCP | Azure | Fly.io --> | <!-- --> |
| cloud-account-id | <!-- e.g. 123456789012 --> | <!-- AWS account, GCP project, Azure subscription --> |
| cluster | <!-- e.g. eks-prod-1 --> | <!-- Kubernetes cluster, ECS cluster, etc. --> |
| namespace | <!-- e.g. payments-prod --> | <!-- k8s namespace or logical grouping --> |
| tenant | <!-- e.g. acme-corp --> | <!-- if this env is tenant-specific --> |
| cost-center | <!-- e.g. ENG-042 --> | <!-- billing / finance tracking --> |
| compliance-scope | <!-- e.g. SOC2, HIPAA, PCI --> | <!-- what audits cover this env --> |
| data-classification | <!-- e.g. production-pii, synthetic, public --> | <!-- --> |
| owner-team | <!-- e.g. @platform, @payments --> | <!-- on-call / escalation --> |
| oncall-rotation | <!-- e.g. PagerDuty schedule ID --> | <!-- --> |
<!-- Add more rows for any dimension your organization uses. -->

#### Deployment History

<!-- Appended by Pulse after each successful Verify (smoke tests signed off).
     Newest entries at top. Keep one row per deploy. -->

| Date | Version | Deployed by | Episode | Notes |
|------|---------|-------------|---------|-------|
<!-- | 2026-04-21 | v1.3.0 | Pulse | 003 | required new DB migration step before deploy | -->

#### Notes

<!-- Free-form: gotchas, manual steps, external dependencies, contacts,
     historical context that future you will need. -->

---

<!-- ═══════════════════════════════════════════════════════════════════
     END OF ENVIRONMENT BLOCK — clone above for every environment you run.
     ═══════════════════════════════════════════════════════════════════ -->

## Cross-environment references

<!-- Relationships between environments that matter operationally. -->

- **Promotion path:** <!-- e.g. dev → staging → production; no direct dev → prod -->
- **Shared infrastructure:** <!-- e.g. staging and prod both use the same Stripe test mode account -->
- **Data migration policy:** <!-- e.g. all migrations tested on staging before prod; staging is refreshed from prod weekly (scrubbed) -->
- **Smoke test dependencies:** <!-- e.g. prod smoke tests depend on the staging health endpoint being reachable -->

---

## Change Log

<!-- Appended by Pulse whenever DEPLOYMENTS.md is materially edited (new env,
     deprecated env, secret added, tag key introduced). One line each.
     Newest at top. -->

| Date | Change | Author |
|------|--------|--------|
<!-- | 2026-04-21 | Added production-eu-west environment | Pulse | -->
<!-- | 2026-04-15 | Retired staging-legacy; removed from Environments list | Pulse | -->
