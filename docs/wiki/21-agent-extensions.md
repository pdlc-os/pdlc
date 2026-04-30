# Agent & Skill Extensions

PDLC supports two extension patterns that let projects layer additional behavior onto built-in agents and skills without forking the plugin. The split is load-bearing — *who loads the extension* determines *where it should live*.

## The two patterns

### Pattern 1 — Agent-wide extensions

Extend a specific agent across **every** invocation of that agent, regardless of phase or skill.

**Location:** `agents/extensions/<agent>-<topic>.md`

**Loaded by:** the agent's persona file itself, via a top-of-file directive that points at the extension and applies the **extension-wins-on-conflict** precedence rule.

**Use when:** the additional behavior is the agent's responsibility universally — e.g., domain-specific knowledge, expanded checklists, project-specific rules that apply whenever the agent is engaged.

**Example (shipped):** `agents/extensions/phantom-security-audit.md` extends Phantom with a project's stack-aware security audit catalog (per-stack scan inventories, OWASP Top 10 / API Top 10 / LLM Top 10 mappings, compliance regimes, supply-chain integrity, tech currency / EOL tracking). Phantom reads it on every invocation — whether participating in a Build Party Review, leading a Threat Modeling Party, or signing off at the Operation phase.

The directive at the top of `agents/phantom.md`:

> **Project-specific extension — read first.** Before applying the persona below, read `agents/extensions/phantom-security-audit.md` and treat its contents as **additive** instructions on top of this file. Where the extension and this file conflict on the same point, the **extension takes precedence**. If the extension file does not exist, proceed with this file alone.

### Pattern 2 — Phase / step-specific extensions

Extend a specific step within a skill — fires only when that step runs, not on every invocation of the agent involved.

**Location:** alongside the owning step file, at `skills/<phase>/steps/<topic>.md` (peer to the numbered step files like `01-ship.md`, alongside other helper files like `custom-deploy-review.md`).

**Loaded by:** the step in the skill that explicitly references the helper.

**Use when:** the additional behavior is phase-specific — e.g., a deploy-time check that only matters at Ship, a discovery activity that only matters in Brainstorm Define.

**Example (shipped):** `skills/ship/steps/fix-lint.md` is invoked by `01-ship.md` Step 9.0 as Pulse's first action when taking over for deploy. Pulse runs a stack-aware lint pass before any deployment-artifact prompt or pipeline work — auto-detecting the project's tech stack and applying lint/format fixes so the codebase ships clean. The extension fires only at Ship Step 9.0; it doesn't run when Pulse is involved in init prerequisites or a deployment review party.

## Why the split matters

A naive design would put every extension in one place (e.g., `agents/extensions/`). That works until you have an extension whose lifetime is *one step in one skill*. Putting it in the agent-wide folder either:

- Misloads — the extension fires whenever the agent is involved, including phases where it's irrelevant (Pulse running a lint pass during init prereqs would be off-purpose), OR
- Hides intent — the file says "agent extension" but is actually only triggered by one step in one skill, and the loading mechanism is invisible at the agent layer.

The two-pattern split makes the loading point visible at the path. If you see something at `agents/extensions/`, you know it loads on every agent invocation. If you see something at `skills/<phase>/steps/`, you know a specific step loads it.

## Authoring conventions

### Agent-wide extensions (`agents/extensions/<agent>-<topic>.md`)

The structure is regular — extensions delegate voice and structure back to the base persona, and only override specific behaviors:

```markdown
# <Agent> — <Topic> Extension

**Extends:** `agents/<agent>.md` — <one-line summary of the base agent's role>.
**Precedence:** Where this extension and `agents/<agent>.md` conflict on the same point, this extension wins (per the directive at the top of `<agent>.md`).
**Scope:** <one paragraph describing what the extension adds and what it doesn't override>.

---

## Extends — Responsibilities
<additional responsibilities, organized in subsections that map to the base agent's responsibility framing>

## Extends — Decision checklist
<additional checklist items the agent runs through, organized by topic>

## Extends — My output format
<additional fields/sections that augment the agent's deliverable>

## Tooling reference (informational)
<reference material — neither extends nor overrides; just available to draw from>
```

Key conventions:

- **No YAML frontmatter** — extensions aren't registered files; the YAML `name`/`description` fields are inert at this path and would mislead authors into treating the extension like a slash command. *(Files in `agents/`, `skills/<name>/SKILL.md`, and `.claude/commands/` register; extensions don't.)*
- **Section names anchor to the base persona's vocabulary** — `## Extends — <base-section-name>` makes the layering visible to anyone reading both files.
- **Voice delegates back to the base.** The extension provides content; the base persona provides tone, decision discipline, and deliverable format.
- **Add the directive to the base agent file** — without it, the extension never loads. The directive is a one-paragraph blockquote between the YAML frontmatter and the body, instructing the agent to read the extension first with extension-wins precedence.

### Phase / step-specific extensions (`skills/<phase>/steps/<topic>.md`)

Structure mirrors PDLC's existing helper-file pattern (e.g. `custom-deploy-review.md`):

```markdown
# <Topic Title>

**Topic slug:** `<slug>`
**Trigger:** <Phase> Step <N> — <one-line description of when it fires>
**Purpose:** <one paragraph on what the extension does>

---

<body — execution steps, scope options, key rules>
```

Key conventions:

- **No YAML frontmatter** — same reason as agent-wide extensions.
- **Inline metadata header** (`Topic slug:` / `Trigger:` / `Purpose:`) tells maintainers and agents exactly where this fits in the lifecycle.
- **Reframe usage as agent-facing, not user-facing.** A step-helper isn't a slash command — it's an inlined skill. Don't write `/<slug> [--flag]` syntax; write "the calling step selects scope based on context" instead.
- **Update the calling step** in the parent skill (`01-ship.md`, `03-design.md`, etc.) to reference the helper by path. Without that reference, the helper is dead code.

## When extensions can override the base

Both patterns use the same precedence rule: **the extension wins on points of conflict with the base file**. But the spirit of the convention is *additive, not redefining*:

- ✅ **Add new responsibilities** — Phantom's audit extension adds stack-aware catalogs Phantom didn't previously cover.
- ✅ **Add new checklist items** — Phantom's extension adds 8 subsection-grouped checks layered on the base's 8 checks.
- ✅ **Add new output fields** — Phantom's extension adds CWE/CVSS/compliance-mapping rows to the base deliverable.
- ✅ **Tighten an existing rule** — extensions can make a base check stricter (e.g., "OWASP Top 10 pass" → "OWASP Top 10 + API Top 10 + LLM Top 10").
- ⚠️ **Loosen an existing rule** — discouraged. Don't use extensions to soften the base agent's safety posture. If a project genuinely needs to relax a built-in rule, that's a `CONSTITUTION.md` override, not an agent extension.
- ❌ **Replace the persona's voice** — don't redefine tone, identity, or core belief in an extension. Extensions feed content into the base persona's voice; they don't replace it.

## Tier-aliased model declarations

While we're on the topic of agent files: every built-in agent's `model:` frontmatter field uses **tier aliases** (`opus` / `sonnet` / `haiku`) rather than version-pinned IDs (`claude-opus-4-7`, `claude-sonnet-4-6`, etc.). Tier aliases resolve to the current latest model in that tier at runtime — so PDLC agents stay current as Anthropic ships new models without requiring a PDLC release for every model bump.

If you author a custom agent (`.pdlc/agents/<name>.md`), follow the same convention. Reserve specific-version pinning for the rare case where reproducibility (compliance, regression testing) demands it. The override path for a single session is the `CLAUDE_CODE_SUBAGENT_MODEL` environment variable.

See [`17-design-decisions.md`](17-design-decisions.md) for the rationale and [`18-extensibility.md`](18-extensibility.md) for the full custom-agent authoring guide.

## Existing extensions catalog

| Extension | Path | Type | Loaded by |
|---|---|---|---|
| Security audit catalog | `agents/extensions/phantom-security-audit.md` | Agent-wide | `agents/phantom.md` directive |
| UX design catalog | `agents/extensions/muse-ux-design.md` | Agent-wide | `agents/muse.md` directive |
| Deploy-time lint pass | `skills/ship/steps/fix-lint.md` | Phase / step-specific | `skills/ship/steps/01-ship.md` Step 9.0 |

---

[← Previous: Security](20-security.md) | [Back to README](../../README.md)
