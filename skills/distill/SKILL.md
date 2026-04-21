---
name: distill
description: Compress large markdown artifacts into a dense inline digest that preserves every fact, verified by round-trip reconstruction. Use this whenever an agent writes a markdown file that sub-agents will re-read in later sessions.
---

# Distillation

## Overview

Human-facing PDLC artifacts (PRDs, design docs, episodes, OVERVIEW, DECISIONS) are written as readable prose — that's what the `writing-clearly-and-concisely` skill is for. But those same artifacts are also re-read repeatedly by sub-agents in later sessions, and full-prose reads cost significant tokens each time.

Distillation produces a **dense structured digest appended to the same file** (inline, not a sidecar). Humans keep reading the prose; sub-agents read only the digest section. A round-trip verification step proves the digest preserves every fact from the source.

This skill is the counterpart to `writing-clearly-and-concisely`:
- **Writing-clearly** — compose readable prose from scratch
- **Distill** — compress existing prose into an LLM-optimized digest without information loss

---

## When to Use

An agent authoring a markdown file invokes this skill when **any** of these is true:

1. **The always-distill whitelist** — regardless of size, these files always get a digest because they accumulate over the project's lifetime and are read on every phase:
   - `docs/pdlc/memory/OVERVIEW.md`
   - `docs/pdlc/memory/DECISIONS.md`
   - `docs/pdlc/memory/DEPLOYMENTS.md`
   - `docs/pdlc/memory/episodes/*.md`

2. **The size gate is crossed** — for everything else, distill when the file exceeds the **distill threshold** (default: 800 tokens; overridable in CONSTITUTION.md Section 9) **and** the file is expected to be re-read by sub-agents in later sessions. Good candidates:
   - `docs/pdlc/prds/PRD_*.md`
   - `docs/pdlc/design/[feature]/*.md`
   - `docs/pdlc/prds/plans/plan_*.md`

### When to skip

Do **not** distill:
- Ephemeral artifacts consumed once: MOM files, review files, brainstorm logs
- Files under the threshold
- Files that are themselves structured (data-model tables, API contract tables) — already dense; distillation adds no value
- Files actively being edited in the current turn — wait until the author finishes drafting

---

## Inline Digest Format

Append the digest as the **last section** of the file, preceded by a horizontal rule:

```markdown
[... original prose content ...]

---

## Distilled Digest
<!-- pdlc-distill
     source-checksum: sha256:abc123def456...
     distilled-at: 2026-04-21T14:32:00Z
     distilled-by: Oracle
     source-tokens: ~2400
     digest-tokens: ~520
     To refresh: delete this section and re-run distill.
-->

**Purpose:** [1 sentence]
**Audience:** [who reads this]
**Key facts:**
- [dense bullet, one fact per line]
- [IDs, paths, numbers kept verbatim]
- [no narrative prose]

**Structured data:**
| [tables preserved exactly] |
```

**Rules for the metadata comment:**
- `source-checksum` — sha256 of all file content **before** the `## Distilled Digest` heading (ignore trailing newlines). Computed so downstream agents can detect staleness.
- `distilled-at` — UTC ISO 8601 timestamp.
- `distilled-by` — the agent name that produced the digest.
- `source-tokens` / `digest-tokens` — rough counts for telemetry.

Compute the checksum:
```bash
python3 -c "import hashlib, sys; s=open(sys.argv[1]).read().split('\n## Distilled Digest')[0].rstrip(); print('sha256:' + hashlib.sha256(s.encode()).hexdigest())" <file>
```

---

## Compression Patterns

**Keep verbatim** (these must survive intact):
- All IDs: Beads task IDs, ADR IDs, feature F-IDs, episode numbers
- All file paths
- All numbers: timestamps, thresholds, version numbers, counts
- All external names: person names, service names, environment names
- Tables — reproduce them as-is; don't re-phrase

**Compress aggressively:**
- Multi-sentence explanations → single declarative statement or bullet
- Qualifications and hedges ("generally", "usually", "typically") — drop unless the qualification is load-bearing
- Examples — keep one canonical example, drop the rest (label it "Example")
- Background and motivation — preserve the decision, drop the narrative arc leading to it
- Transitional prose ("As noted above", "This means that", "Therefore") — delete

**Structure over prose:**
- Headers → bullets
- Paragraphs with multiple facts → bulleted list with one fact per bullet
- Sequences → numbered lists
- Any trade-off discussion → a short table: `| Option | Chosen | Reason |`

**Abbreviations** — only where unambiguous in PDLC context:
- "acceptance criteria" → "AC"
- "user story" → "US"
- "architectural decision record" → "ADR"
- Do not invent new abbreviations; only use ones already common in the source.

Target compression: **3-5× reduction** in tokens with zero information loss.

---

## Round-trip Verification

Compression without verification is just lossy summarization. The round trip proves no fact was dropped.

**Protocol:**

1. Produce the candidate digest.
2. Dispatch a subagent with **only the digest** (not the source) and this prompt:
   > "Reconstruct the original document from this digest. Be complete — every fact, ID, path, number, and decision should appear. Output markdown prose."
3. The subagent returns a reconstruction.
4. Diff the reconstruction against the source along these axes:
   - **Facts** — does every numeric value, ID, path, and named entity from the source appear in the reconstruction?
   - **Decisions** — does every decision and its rationale appear?
   - **Structure** — is every table and list preserved?
5. If the reconstruction is missing any fact, the digest is under-specified. Revise the digest to add the missing information and re-run the round trip.
6. When the reconstruction captures everything, the digest is final. Write it into the file.

The goal is not that the reconstruction equals the source word-for-word — it's that **no fact is lost in compression**. Phrasing drift is fine; missing facts are not.

---

## Invalidation

Digests become stale when the source changes.

**How to detect staleness:**
1. Read the file.
2. Compute sha256 of content before the `## Distilled Digest` heading.
3. Compare to the `source-checksum` in the digest's metadata comment.
4. If they match, the digest is current — safe to use.
5. If they differ, the digest is stale — either regenerate it now or read the full source.

**Who regenerates:**
- The agent that **writes** an update to a distilled file is responsible for re-running distillation after the edit. If they don't, the next reader will see stale checksum and regenerate or fall back.
- For the always-distill whitelist (OVERVIEW, DECISIONS, DEPLOYMENTS, episodes), Jarvis is the final checkpoint — at the end of Reflect, Jarvis verifies all four have current digests.

**Never** silently trust a stale digest. Always check the checksum before consuming.

---

## How Sub-agents Consume a Digest

When an orchestrating agent dispatches a sub-agent that needs context from a large distilled file:

1. **Verify the digest is current** (checksum check above). If stale, regenerate or instruct the sub-agent to read the full file.
2. **Instruct the sub-agent to read only the digest section**:
   > "Read the `## Distilled Digest` section of `docs/pdlc/prds/PRD_foo.md`. Do not read the full file unless you need information that's missing from the digest."
3. The sub-agent uses `Read` with grep or section-anchored offset to grab just that section.
4. If the sub-agent determines the digest is insufficient for its task, it escalates and reads the full file. This is a rare case; if it happens repeatedly for the same file, the digest is under-specified and should be revised next round-trip.

---

## Configuration

The size gate threshold is defined in `docs/pdlc/memory/CONSTITUTION.md` Section 9:

```
**Distill threshold (tokens):** 800
```

Projects can override this. Set it higher if your context budget is comfortable and you want less distillation overhead. Set it lower if context pressure is acute.

The always-distill whitelist is fixed at the skill level, not per-project — OVERVIEW, DECISIONS, and episodes always get distilled regardless of size.

---

## Cross-references

- `skills/writing-clearly-and-concisely/SKILL.md` — for authoring readable prose (invoked before distillation, not after). The source content you distill should already be clear.
- `agents/jarvis.md` — Jarvis is the keeper of distilled quality across the project; Jarvis verifies OVERVIEW/DECISIONS/episode digests during Reflect.

---

## Bottom Line

Every agent that writes a markdown file checks: does this file need a digest? If yes (whitelist or size gate), distill it inline, verify via round-trip, and record the source checksum so staleness is detectable. Sub-agents read digests, not full prose, unless the digest proves insufficient for their task.
