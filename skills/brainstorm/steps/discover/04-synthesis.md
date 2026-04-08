# Steps 5–6 — External context and discovery summary

---

## Step 5 — Ingest external context (if applicable)

If during the conversation the user mentions:
- A URL → use WebFetch to retrieve the content and summarize what is relevant
- "my Figma file" or "the Figma link" → ask them to share the URL; retrieve and summarize the design intent
- "the Notion doc" or "our spec in Notion" → ask for the URL; retrieve and summarize
- "a Word doc" or shared document → ask them to paste the relevant content directly if you cannot retrieve it

Summarize any external content you retrieve and confirm with the user what you have extracted as relevant requirements.

**If any external context was ingested**, replace the `## External Context` section in `[brainstorm-log]` with:

````markdown
## External Context

### [Source title or URL]
**Ingested:** [ISO 8601 timestamp]
**Extracted as relevant:**
[bullet list of requirements or decisions extracted from this source]

[repeat block for each source]
````

Update `last-updated` in the frontmatter to now.

---

## Step 6 — Present discovery summary

After the Socratic session, adversarial review, and edge case analysis are complete, present a structured summary to the user for confirmation before proceeding to Define. Format it clearly:

```
DISCOVERY SUMMARY — [feature-name]

Feature: [Feature Name]
Problem: [1–2 sentences]
User: [who and context]
Success metric: [specific, measurable]
Technical constraints: [bullet list]
Out of scope: [bullet list]
Key risks / assumptions: [bullet list]
```

Ask: "Does this capture what you have in mind? Confirm to continue to Define, or tell me what to adjust."

Iterate until the user confirms.

**When the summary is confirmed**, replace the `## Discovery Summary` section in `[brainstorm-log]` with the confirmed summary verbatim, and update the frontmatter:

```
status: discover-complete
last-updated: [ISO 8601 timestamp]
approved-by: [user name or initials if known, else "user"]
approved-date: [ISO 8601 timestamp]
```

Update `docs/pdlc/memory/STATE.md`: Current Sub-phase → `Define`.

**Write the Handoff** in `docs/pdlc/memory/STATE.md`. Overwrite the Handoff JSON block (between the `## Handoff` heading and the next `---`) with:

```json
{
  "phase_completed": "Inception / Discover",
  "next_phase": "Inception / Define",
  "feature": "[feature-name]",
  "key_outputs": [
    "docs/pdlc/brainstorm/brainstorm_[feature-name]_[date].md"
  ],
  "decisions_made": ["[2-3 key decisions from discovery — e.g. 'Chose REST over GraphQL', 'Target user: solo devs']"],
  "next_action": "Read skills/brainstorm/steps/02-define.md and generate the PRD draft",
  "pending_questions": []
}
```

Then check context usage: run `cat /tmp/pdlc-ctx-*.json 2>/dev/null | sort -t'"' -k4 -r | head -1` to read the most recent bridge file. If `used_pct` is **65% or above**, strongly recommend clearing:

> "**Context is at ~[X]% — strongly recommend clearing now.**
> Your handoff is saved. Type `/clear` and the next session will resume seamlessly from Define."

If below 65% or the bridge file doesn't exist, don't mention it.

---

Return to `01-discover.md`. Discover is complete.
