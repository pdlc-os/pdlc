# Optional Pre-phase: DIVERGENT IDEATION
## Anti-bias domain rotation → 100+ ideas

This phase runs before Socratic questioning. Its job is to push past the obvious
and surface the full possibility space *before* narrowing down to a single direction.

---

## Framing

Tell the user:

> "Before we start asking hard convergent questions, let's open the idea space wide.
> We'll generate 100+ raw ideas using structured domain rotation to avoid semantic
> clustering — LLMs naturally drift toward similar ideas in a row, so we'll consciously
> shift creative lens every 10 ideas.
>
> No judgment, no filtering. Quantity is the goal. The magic usually happens between
> ideas 50 and 100.
>
> Type `done` at any point to stop and move on. Ready?"

Wait for the user's confirmation before starting.

---

## Technique Selection

Ask:

> "How do you want to approach this?
>
> **A) AI-recommended** — I'll pick the techniques that suit this topic best
> **B) Structured rotation** — Pure domain cycling: Technical → UX → Business → Edge Cases
> **C) Surprise me** — Random technique drawn from 36 proven methods
> **D) Pick a technique** — Tell me which one you want (SCAMPER, Reverse Brainstorm, Six Hats, Role Storming, etc.)"

Wait for the user's choice.

- **A or B**: proceed with the Structured Domain Rotation method below
- **C**: pick a random technique from the technique library (see below), announce it, then run that technique's ideation loop
- **D**: use the technique the user names; if unfamiliar, ask for clarification

---

## Structured Domain Rotation (default)

The four domains cycle in order. Rotate every 10 ideas. Announce each domain shift
with a short line so the user knows the lens has changed.

| Batch | Domain | Creative Lens |
|-------|--------|---------------|
| 1–10 | **Technical** | Architecture, implementation, data structures, performance, APIs, infrastructure |
| 11–20 | **User Experience** | Flows, pain points, delight moments, accessibility, mental models, personas |
| 21–30 | **Business & Viability** | Revenue models, distribution, partnerships, pricing, adoption levers, risks |
| 31–40 | **Edge Cases & Failure Modes** | What breaks, who abuses it, rollback, migration, security, worst case |
| 41–50 | **Technical** (second pass) | |
| 51–60 | **User Experience** (second pass) | |
| 61–70 | **Business & Viability** (second pass) | |
| 71–80 | **Edge Cases** (second pass) | |
| 81–90 | **Analogies & Adjacent Domains** | How do other industries solve this? What metaphor unlocks a new approach? |
| 91–100+ | **Wild & Combinatorial** | Weird combinations of earlier ideas, inversions, extremes, "what if we did the opposite?" |

**At each domain shift**, say:

> "— Domain shift: [new domain] — [one-sentence lens description] —"

**Facilitation rules during ideation:**
- Present ideas as a numbered list, 5–10 per message
- Never judge, filter, or say "that won't work" during generation
- Build with YES-AND thinking: an impractical idea leads to a practical one two steps later
- If you generate a cluster of similar ideas, note it and deliberately pivot to a contrasting angle
- Keep the user in generative mode — if they start analyzing, redirect: "Great observation — let's explore that after we hit 100. For now: more ideas."
- Track the running count and show it at each batch: `[Ideas so far: 23]`

**After every 10 ideas**, check: has the user typed `done`? If yes, stop and proceed to Clustering. If not, announce the domain shift and continue.

---

## Technique Library (for options C and D)

Draw from these when the user selects random or picks a technique:

**Structured**
- **SCAMPER** — Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse each core element
- **Reverse Brainstorm** — Brainstorm how to *cause* the problem, then invert every answer
- **Morphological Analysis** — Map key dimensions × possible values, then combine cells

**Perspective-shifting**
- **Six Thinking Hats** — Cycle through: Facts → Feelings → Caution → Optimism → Creativity → Process
- **Role Storming** — Generate ideas as: a 10-year-old, a competitor, a regulator, a power user, a skeptic
- **Hero's Journey** — Map the user's journey through the feature as a narrative arc; find friction points to resolve

**Generative**
- **Random Word** — Pick 5 unrelated words; force a connection between each word and the feature
- **Forced Connections** — Pick 2 unrelated products/systems; steal their best mechanism and apply it here
- **Analogical Thinking** — "How does [aviation / medicine / gaming / logistics] solve this class of problem?"

**Deep**
- **Five Whys** — Ask "why does this problem exist?" five times; each answer generates a new solution space
- **Assumption Surfacing** — List every assumption baked into the current approach, then invert each one
- **Pre-mortem** — Imagine the feature failed catastrophically; generate 20 reasons why, then solve each

**Wild**
- **Worst Possible Idea** — Deliberately generate the 10 worst ideas, then invert them
- **Exaggeration** — Take one constraint to its extreme (infinite scale, zero budget, 1 second latency); what breaks?
- **Anti-Problems** — Define the opposite goal; solve that; flip the solutions back

---

## Completion and Clustering

When the user types `done` or the count reaches 100+:

1. Present the full numbered list as a single block titled `RAW IDEAS — [feature-name]`

2. Cluster the ideas into 4–6 theme groups. Name each group. Show the mapping:

   ```
   CLUSTERS

   [Theme Name]: ideas #3, #17, #42, #68
   [Theme Name]: ideas #7, #23, #55, #81
   ...
   ```

3. Identify the **top 10–15 standouts** — ideas that are novel, high-leverage, or appeared in multiple clusters. Present them as:

   ```
   STANDOUTS

   1. [idea] — [one sentence on why this is worth pursuing]
   2. ...
   ```

4. Ask the user:

   > "Do any of these standouts surprise you, or is there one that feels like a clear winner? You don't have to decide now — I'll carry these into the Socratic questioning to help sharpen the focus."

5. Store the standouts in working context as `[divergent-standouts]`. These inform the Socratic questions in Step 2 — reference them when probing success metrics, scope, and risks.

---

When this phase is complete, return to `01-discover.md` and proceed with **Step 1** (Visual Companion offer).
