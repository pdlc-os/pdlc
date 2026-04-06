# Extensibility — Custom Skills, Agents, and Test Layers

PDLC can be extended without forking. Drop files into your project's `.pdlc/` directory and they're automatically discovered.

---

## Custom Skills

Create your own `/pdlc <command>` commands.

### How it works

1. Create `.pdlc/skills/<your-skill-name>/SKILL.md` in your project root
2. The skill is automatically available as `/pdlc <your-skill-name>`
3. Built-in PDLC skills take priority on name collisions

### Getting started

Copy the template from the PDLC package:

```bash
mkdir -p .pdlc/skills/deploy-staging
cp node_modules/@pdlc-os/pdlc/skills/custom-template/SKILL.md .pdlc/skills/deploy-staging/SKILL.md
```

Edit the template — it has commented sections for:
- Skill name and description (frontmatter)
- Lead agent assignment
- Pre-flight checks
- Step-by-step workflow
- User interaction points (approval gates, choices)
- Output artifacts
- Rules and constraints

### Example: deploy-staging skill

```markdown
---
name: deploy-staging
description: "Deploy the current branch to the staging environment"
---

## Lead Agent: Pulse (DevOps)

### Step 1 — Check staging config
Read CONSTITUTION.md for staging URL...

### Step 2 — Deploy
Run: npm run deploy:staging...
```

### Path resolution

Custom skill files are resolved from the **project root** (`.pdlc/skills/<name>/SKILL.md`), not the PDLC plugin root. References to PDLC built-in files (agents, templates) should use the plugin root path.

---

## Custom Agents

Add specialist agents for your team's domain.

### How it works

1. Create `.pdlc/agents/<agent-name>.md` in your project root
2. The agent is automatically included in meetings when task labels match
3. Built-in PDLC agents take priority on name collisions

### Getting started

Copy the template:

```bash
mkdir -p .pdlc/agents
cp node_modules/@pdlc-os/pdlc/agents/custom-template/agent.md .pdlc/agents/datascience.md
```

Edit the template — it has sections for:
- Frontmatter (name, role, labels, model)
- Identity and personality
- Focus areas and responsibilities
- Review checklist
- Interaction with built-in agents
- Example contribution

### Frontmatter fields

```yaml
---
name: DataScience
role: Data Engineer
always_on: false
auto_select_on_labels: ml,data,pipeline,etl
model: claude-sonnet-4-6
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Display name used in meetings and MOMs |
| `role` | Yes | Short role title |
| `always_on` | No (default: false) | `true` = participates in every task and review |
| `auto_select_on_labels` | No | Comma-separated labels — agent is included when any task has a matching label |
| `model` | No (default: sonnet) | `claude-opus-4-6` for complex reasoning, `claude-sonnet-4-6` for focused work |

### How custom agents participate

- **During meetings:** The orchestrator checks `.pdlc/agents/` before every party meeting. If a custom agent's labels match the current task's labels (or `always_on` is true), they're added to the participant list.
- **In the spawn prompt:** Custom agents use the same template as built-in agents. Their `.md` file provides persona context, focus areas, and review checklist.
- **In MOMs:** Custom agent contributions are recorded alongside built-in agents.

### Example: Data Engineer agent

```markdown
---
name: DataScience
role: Data Engineer
auto_select_on_labels: ml,data,pipeline
model: claude-sonnet-4-6
---

# Soul Spec — DataScience (Data Engineer)

## Identity
DataScience is the team's data engineer. They ensure data pipelines are
reliable, schemas are well-designed, and queries perform at scale.

## Review Checklist
- [ ] All queries use parameterized inputs
- [ ] Migration files are reversible
- [ ] New indexes considered for query patterns
```

---

## Custom Test Layers

Add project-specific test layers that run alongside PDLC's built-in 7 layers.

### How it works

1. Edit `docs/pdlc/memory/CONSTITUTION.md` section §7 "Custom Test Layers"
2. Add rows to the table with: name, command, and required (yes/no)
3. PDLC runs custom layers after the built-in 7 during the Test sub-phase

### CONSTITUTION.md table format

```markdown
### Custom Test Layers

| Name | Command | Required |
|------|---------|----------|
| Contract tests | npm run test:contracts | yes |
| HIPAA compliance | npm run test:hipaa | yes |
| Load test (k6) | k6 run tests/load.js | no |
```

| Column | Description |
|--------|-------------|
| **Name** | Display name shown in test reports and episode files |
| **Command** | Shell command to run. Must exit 0 on pass, non-zero on fail. |
| **Required** | `yes` = hard gate (must pass before ship). `no` = soft (reported but doesn't block). |

### How custom layers execute

- Run after Layer 7 (security scan) in the Test sub-phase
- Each layer follows the same pass/fail/skip reporting as built-in layers
- Required custom layers are checked against CONSTITUTION gates — same as built-in required layers
- Failures on required custom layers present the same fix/accept/defer options

---

## Directory structure

```
your-project/
  .pdlc/
    skills/
      deploy-staging/
        SKILL.md              <- /pdlc deploy-staging
      run-benchmarks/
        SKILL.md              <- /pdlc run-benchmarks
    agents/
      datascience.md          <- Data Engineer, auto-selects on ml,data labels
      compliance.md           <- Compliance Auditor, always_on for regulated projects
  docs/pdlc/
    memory/
      CONSTITUTION.md         <- Custom Test Layers table in §7
```

---

## Tips

- **Start small.** Add one custom agent or skill. Test it in a real feature cycle before adding more.
- **Use built-in agents as examples.** Read `agents/neo.md` or `agents/phantom.md` to see how the built-in agents are structured.
- **Custom agents complement, don't replace.** The 9 built-in agents cover the core concerns. Custom agents add domain-specific expertise (data, compliance, ML, accessibility).
- **Custom test layers are additive.** They run after the built-in 7, not instead of them.
- **Commit `.pdlc/` to git.** Your custom skills and agents should be version-controlled so the whole team benefits.

---

[← Previous: Doctor](13-doctor.md) | [Back to README](../../README.md)
