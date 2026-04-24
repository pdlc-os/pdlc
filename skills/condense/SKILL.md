---
name: condense
description: Syntactic compression ruleset for prose. Drops articles, filler, pleasantries, hedging, imperative softeners, and connective fluff without modifying code, paths, IDs, numbers, or proper nouns. Invoked by `distill` as its Pass 1 pre-compression step; also usable standalone when a prose block needs to shrink in place without restructuring.
---

# Condense

## Overview

Pure mechanical compression of natural-language prose. Strip the connective tissue between facts — articles, filler, pleasantries, hedging, softeners, redundant phrasing — and shorten verb choice. Facts, structure, code, and proper nouns stay verbatim.

This skill does **not** restructure content (headers, bullets, tables, ordering) and does **not** produce a digest. It is a single-dimension prose compressor. For the full "compress an artifact into a sub-agent-readable digest" flow, see `skills/distill/SKILL.md`, which invokes this skill as its Pass 1.

---

## When to Use

- **As Pass 1 inside `distill`** — runs before structural compression. The caller is `distill`; condense never writes to disk on its own in this mode.
- **Standalone, in-place** — when a specific prose block is over-written (e.g. a bloated PR description, an over-explained comment, an overly wordy docstring) and you want to shrink it without restructuring. In standalone use, the caller is responsible for verifying no fact was dropped; there is no built-in round-trip check.

### When NOT to use

- Files that are primarily code (`.py`, `.js`, `.ts`, etc.) — prose compression rules don't apply.
- Legal, compliance, or contractual text — dropping qualifiers and hedging can change meaning materially.
- Decision records (`DECISIONS.md`, ADRs) — the difference between "we *considered* X" and "X" is load-bearing; let `distill` handle these through its verified pipeline instead.
- Quoted speech, user quotes, stakeholder quotes — preserve verbatim.

---

## Rules

### Drop

- **Articles:** `a`, `an`, `the` — unless dropping creates ambiguity (e.g. "a table" vs "the table" where which table matters).
- **Filler:** `just`, `really`, `basically`, `actually`, `simply`, `essentially`, `generally` (keep `generally` when it is the load-bearing qualifier on a claim).
- **Pleasantries:** `sure`, `of course`, `happy to`, `I'd recommend`, `let's`.
- **Hedging phrases:** `it might be worth`, `you could consider`, `it would be good to`, `you may want to`, `perhaps`.
- **Connective fluff:** `however`, `furthermore`, `additionally`, `in addition`, `moreover`, `as noted above`, `this means that`, `therefore` — keep only when the logical link itself is the fact being communicated (e.g. causal chains in a decision).
- **Imperative softeners:** `you should`, `make sure to`, `remember to`, `be sure to` → state the action directly.
- **Redundant phrasing:** `in order to` → `to`; `the reason is because` → `because`; `at this point in time` → `now`; `due to the fact that` → `because`.

### Shorten

- `utilize` → `use`; `implement a solution for` → `fix`; `extensive` → `big`; `modification` → `change`; `approximately` → `~`; `prior to` → `before`.
- Fragments are fine: "Run tests before merge." not "You should always run the test suite before merging."
- One word when one word is enough.

### Preserve EXACTLY — never modify

- **Code blocks** — fenced (```` ``` ````) and indented — including every comment, blank line, and whitespace character.
- **Inline code** — anything inside single backticks.
- **URLs and links** — full URLs, markdown link targets, reference-style link definitions.
- **File paths and commands** — `/src/components/...`, `./config.yaml`, `npm install`, `git commit`, `bd claim`.
- **IDs and numbers** — Beads task IDs, ADR IDs, feature F-IDs, episode numbers, version numbers, timestamps, counts, thresholds.
- **Environment variables** — `$HOME`, `NODE_ENV`, etc.
- **Proper nouns** — PDLC agent names (Neo, Echo, Phantom, Jarvis, Oracle, Muse, Pulse, Friday, Bolt), service names, project names, people, company names.
- **Quoted error messages and stack traces** — preserve the quoted text exactly.
- **Frontmatter / YAML headers** — the `---` block at the top of markdown files.
- **Tables** — compress cell text with the same rules, but keep the table structure (rows, columns, alignment) intact.

### Preserve Structure

- All markdown headings — keep heading text exactly; only compress the body beneath.
- Bullet point hierarchy and nesting level.
- Numbered list ordering.

---

## Examples

**Example 1 — imperative + connective fluff:**

Before:
> You should always make sure to run the test suite before pushing any changes to the main branch. This is important because it helps catch bugs early and prevents broken builds from being deployed to production.

After:
> Run tests before push to main. Catches bugs early, prevents broken prod deploys.

**Example 2 — pleasantry + hedging:**

Before:
> Sure! I'd be happy to help with that. The issue you're experiencing is likely caused by your authentication middleware not properly validating the token expiry.

After:
> Bug in auth middleware — token expiry not validated.

**Example 3 — explanation with code (code preserved exactly):**

Before:
> The reason your React component is re-rendering is likely because you're creating a new object reference on each render cycle. I'd recommend using `useMemo` to memoize the object.

After:
> New object ref each render → re-render. Wrap in `useMemo`.

**Example 4 — table cells compressed, structure preserved:**

Before:
| Option | When to use it |
|--------|----------------|
| Merge | You should use merge when you want to preserve the full branch history |
| Squash | Use squash if you would prefer to collapse all the commits into a single commit |

After:
| Option | When to use it |
|--------|----------------|
| Merge | Preserve full branch history |
| Squash | Collapse all commits into one |

---

## Compression Target

Typical reduction on natural-language prose: **~40–50%** of tokens.

- Higher on explanation-heavy text (tutorials, overviews, rationale sections).
- Lower on already-terse text (reference tables, API contracts, structured specs).
- Zero on pure-code regions — those are preserved verbatim.

---

## Invocation Contract (when called by `distill`)

1. `distill` identifies a markdown file that meets its trigger criteria.
2. `distill` extracts the prose regions (everything outside code blocks, tables, frontmatter, and the existing digest section, if any).
3. Condense rules are applied to those prose regions in memory; the result becomes the input to `distill`'s Pass 2 (Structural).
4. The original file on disk is **not** modified by condense. Only `distill` writes back — appending the final digest section.
5. `distill`'s round-trip verification (subagent reconstruction + fact diff) catches any fact that was accidentally dropped by condense's mechanical rules.

## Invocation Contract (standalone)

1. Caller passes a prose block (or a file path and a region specifier) to condense.
2. Condense returns the compressed prose.
3. Caller verifies the output preserves every fact, decision, number, and ID. No automatic verification is performed.
4. Caller decides whether to write back, and where (append, replace, or keep as a candidate for review).

---

## Bottom Line

Condense is a deterministic prose compressor with hard "never touch" boundaries around code, IDs, and proper nouns. It is cheap, mechanical, and one-dimensional. It should almost always run as Pass 1 inside `distill`; standalone use is reserved for shrinking a single bloated prose region where restructuring is unnecessary.
