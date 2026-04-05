# PDLC Output Formatting Guide

This file defines the visual patterns PDLC uses for phase transitions, sub-phase transitions, and agent handoffs. All agents must follow these patterns exactly when outputting transition messages.

---

## Phase Transition Banner

Used when entering a new major phase (init, brainstorm, build, ship). Renders as a prominent colored block.

Output this **exactly** (replace placeholders):

```
\033[1;36m
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ◆  PHASE: [PHASE NAME]
  ◆  Feature: [feature-name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\033[0m
```

Where `\033[1;36m` is bold cyan and `\033[0m` resets. If the terminal does not render ANSI codes, fall back to the markdown version:

```markdown
---
### ◆ PHASE: [PHASE NAME]
**Feature:** [feature-name]
---
```

---

## Sub-phase Transition Header

Used when moving between sub-phases within a phase (e.g., Discover → Define, Build → Review). Renders as a lighter colored block.

Output this **exactly**:

```
\033[1;33m
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  ▸ [SUB-PHASE NAME]
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
\033[0m
```

Where `\033[1;33m` is bold yellow. Markdown fallback:

```markdown
#### ▸ [SUB-PHASE NAME]
```

---

## Agent Welcome (phase entry)

When a lead agent begins a phase, they introduce themselves warmly. The tone is confident, friendly, and specific about what they'll do. The welcome includes the phase banner above, followed by the agent's greeting.

Pattern:

```
[Phase Transition Banner]

[Agent greeting — first person, warm, specific to phase]
```

---

## Agent Handoff (agent change)

When one lead agent hands off to another, both agents speak. The departing agent says goodbye with a personal touch, then the arriving agent welcomes the user. This should feel like a real team handoff — not a system notification.

### Departing agent farewell

The departing agent:
- Summarizes what was accomplished during their lead
- Thanks the user for the collaboration
- Expresses confidence in the incoming agent
- Tone: warm, satisfied, human

### Arriving agent welcome

The arriving agent:
- Greets the user
- Shows genuine enthusiasm for the upcoming work
- Previews what they'll focus on
- Tone: energetic, eager, specific

Pattern:

```
\033[1;35m
  ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
  ↻ HANDOFF: [Old Agent] → [New Agent]
  ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
\033[0m

**[Old Agent Name] ([Role]):** [Farewell message]

**[New Agent Name] ([Role]):** [Welcome message]
```

Where `\033[1;35m` is bold magenta. Markdown fallback:

```markdown
---
**↻ HANDOFF: [Old Agent] → [New Agent]**
---
```

---

## Color Reference

| Element | ANSI Code | Color | Purpose |
|---------|-----------|-------|---------|
| Phase banner | `\033[1;36m` | Bold Cyan | Major phase transitions |
| Sub-phase header | `\033[1;33m` | Bold Yellow | Sub-phase transitions within a phase |
| Agent handoff | `\033[1;35m` | Bold Magenta | Lead agent changes |
| Reset | `\033[0m` | — | Always reset after colored output |
