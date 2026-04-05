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

## Roadmap Progress Display

When showing roadmap progress (session start, post-ship, or when the user asks about progress), use color-coded status markers:

```
\033[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m
\033[1;37m  📋 Roadmap Progress ([shipped]/[total] shipped)\033[0m
\033[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m

  \033[1;32m✓\033[0m F-001  user-auth         \033[1;32mShipped\033[0m
  \033[1;32m✓\033[0m F-002  billing            \033[1;32mShipped\033[0m
  \033[1;33m▶\033[0m F-003  notifications      \033[1;33mIn Progress\033[0m  ◀ current
  \033[0;37m○\033[0m F-004  reporting          \033[0;37mPlanned\033[0m
  \033[0;37m○\033[0m F-005  admin-dashboard    \033[0;37mPlanned\033[0m
```

Status markers:
- `\033[1;32m✓\033[0m` — Green checkmark for Shipped
- `\033[1;33m▶\033[0m` — Yellow arrow for In Progress
- `\033[0;37m○\033[0m` — Gray circle for Planned
- `\033[0;31m✗\033[0m` — Red X for Dropped
- `\033[0;90m◌\033[0m` — Dim circle for Deferred

---

## Warning and Alert Blocks

For interrupted work, safety warnings, and other alerts:

```
\033[1;31m⚠  [Warning title]\033[0m
\033[0;31m   [Warning details]\033[0m
```

Red for warnings/errors. Yellow (`\033[1;33m`) for informational alerts.

---

## Meeting Announcement Block

When convening a party meeting:

```
\033[1;35m┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\033[0m
\033[1;35m  🗣  Convening: [Meeting Name]\033[0m
\033[1;35m┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\033[0m

  \033[0;37mCalled by:\033[0m   \033[1;37m[Agent Name] ([Role])\033[0m
  \033[0;37mParticipants:\033[0m \033[1;37m[Name], [Name], [Name]\033[0m — [N] agents
  \033[0;37mPurpose:\033[0m     [one sentence]
  \033[0;37mEst. time:\033[0m   \033[1;33m~[duration]\033[0m
```

---

## Agent Speech

When an agent speaks to the user (greetings, handoffs, announcements), use bold white for the agent name and dim for the role:

```
\033[1;37m[Agent Name]\033[0m \033[0;90m([Role])\033[0m: "[message text]"
```

---

## Confirmation Prompts

When asking the user for a yes/no decision:

```
\033[1;37m[Question text]\033[0m
  \033[1;32m▸ Yes\033[0m — [what happens if yes]
  \033[1;31m▸ No\033[0m  — [what happens if no]
```

---

## Success / Completion Messages

```
\033[1;32m✓ [Action completed successfully]\033[0m
  [details in normal text]
```

---

## Color Reference

| Element | ANSI Code | Color | Purpose |
|---------|-----------|-------|---------|
| Phase banner | `\033[1;36m` | Bold Cyan | Major phase transitions |
| Sub-phase header | `\033[1;33m` | Bold Yellow | Sub-phase transitions within a phase |
| Agent handoff | `\033[1;35m` | Bold Magenta | Lead agent changes |
| Meeting announcement | `\033[1;35m` | Bold Magenta | Party meeting convened |
| Agent name | `\033[1;37m` | Bold White | Agent speaking |
| Agent role | `\033[0;90m` | Dim Gray | Role label next to agent name |
| Success / shipped | `\033[1;32m` | Bold Green | Completion, shipped status, checkmarks |
| In progress | `\033[1;33m` | Bold Yellow | Active work markers |
| Warning / error | `\033[1;31m` | Bold Red | Alerts, interrupted work, conflicts |
| Planned / neutral | `\033[0;37m` | Light Gray | Future items, labels |
| Deferred / dim | `\033[0;90m` | Dim Gray | Low-priority or deferred items |
| Reset | `\033[0m` | — | Always reset after colored output |
