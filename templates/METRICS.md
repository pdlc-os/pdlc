# Metrics
<!-- pdlc-template-version: 2.2.0 -->
<!-- Append-only. Jarvis adds a row after every shipped feature.
     Used by Atlas for roadmap planning and by Doctor for trend analysis.
     Do not delete rows — they form the project's delivery history. -->

**Project:** <!-- Your project name -->
**Last updated:** <!-- YYYY-MM-DD -->

---

## Delivery Metrics

| Episode | Feature | Type | Cycle Days | Test Pass % | Review Rounds | Strikes | Tier1 Overrides | Security Findings | Tasks | Date Shipped |
|---------|---------|------|-----------|-------------|---------------|---------|-----------------|-------------------|-------|-------------|
<!-- No episodes yet. -->

---

## Trend Summary

<!-- Updated by Jarvis after every ship. Shows how the latest episode
     compares to the project average and the previous episode. -->

No trends yet — ship your first feature to start tracking.

---

## UX Scorecard Trend

<!-- Populated by the Ship Verify step (skills/ship/steps/ux-verify.md) when a
     feature ran Brainstorm Step 10.6 (Design-Laws Audit) with Lite or Full triage.
     Features that skipped Step 10.6 (no UI surface) do not appear here.
     Append-only — Jarvis adds a row at Reflect after every ship that produced a
     UX scorecard. Audit-5d columns become populated when the Audit Scorecard
     5-dimension section ships in agents/extensions/muse-ux-design.md. -->

| Episode | Feature | Triage | Nielsen (d / a / s) | Audit-5d (d / a / s) | Cognitive load failures (d / a / s) | Findings P0 / P1 / P2 / P3 | ADRs open / closed | Date Shipped |
|---------|---------|--------|---------------------|----------------------|--------------------------------------|---------------------------|--------------------|-------------|
<!-- No UX-audited features yet. -->

*Legend:* `d` = design-time (Step 10.6), `a` = as-built (Construction Review), `s` = ship-verify. P0 finding count should always be `0` at ship — P0 blocks merge unless `/pdlc override` was invoked. ADRs columns count UX-related entries in `DECISIONS.md` from this feature.

### UX trend signals

<!-- Updated by Jarvis at Reflect after every ship that produced a UX scorecard.
     Four signals to read against the table above. -->

1. **Cross-feature trend** — are Nielsen totals trending up, down, or flat across features? A consistent downward trend signals capability erosion (UX standards slipping); a consistent upward trend signals capability building.
2. **Design-time → as-built delta** — is the implementation consistently losing points against the design? A persistent negative delta is a process signal: either the design is over-promising or the build is under-delivering. Worth a Reflect-phase callout.
3. **As-built → ship-verify delta** — is the deploy pipeline introducing UX regressions? A persistent negative delta here points at CI/CD or build-config issues (CSS minifier dropping focus rules, CDN serving stale stylesheets, environment-specific theming bugs).
4. **Open-finding accumulation** — are P1+ UX findings accumulating in `DECISIONS.md` as "mitigate later" without ever closing? A growing backlog is UX tech debt; surface in the retrospective.

Latest UX trend: <!-- Populated by Jarvis after every UX-audited ship — one paragraph reading the four signals against the row added this ship. -->
