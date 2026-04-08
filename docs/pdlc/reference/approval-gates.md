# Approval Gates

PDLC pauses and waits for explicit human approval at each of the following checkpoints:

1. **End of Discover** — human approves the Socratic conversation output before PRD is drafted
2. **End of Define** — human approves the auto-generated PRD draft before Design begins
3. **End of Design** — human approves architecture, data-model, and API contract docs
4. **End of Plan** — human approves the Beads task list before Construction begins
5. **End of Review** — human approves the `REVIEW_[feature-name]_[date].md` file before PR comments are posted
6. **Ship** — human approves merge to main and deployment trigger
7. **Verify** — human sign-off after smoke tests pass against the deployed environment
8. **Reflect** — human reads and approves the episode file before it is committed

At each gate, PDLC also writes a **context handoff** to STATE.md so the user can safely `/clear` their context. See the Handoff section in `templates/STATE.md` for the schema.

## 3-Strike Loop Breaker

When Claude enters a bug-fix loop during Construction (build → test → fix → test → fix…):

- Maximum **3 automatic fix attempts** per failing test.
- On the **3rd failed attempt**, PDLC convenes a **Strike Panel** (Neo + Echo + domain agent) to diagnose the root cause and produce 3 ranked approaches. The human then chooses:
  - **(A) Implement approach 1** — the panel's recommended fix.
  - **(B) Implement approach 2** — an alternative approach.
  - **(C) Human takes the wheel** — human reviews the error and guides Claude directly.

See `skills/build/party/04-strike-panel.md` for the full protocol.
