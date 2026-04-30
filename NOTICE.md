# Third-Party Notices and Attributions

This software contains content derived from third-party sources. The following
notices are required by their respective licenses.

---

## `agents/extensions/muse-ux-design.md`

Portions of `agents/extensions/muse-ux-design.md` (the Muse UX Design Catalog
extension) are derived from `pbakaus/impeccable`
(<https://github.com/pbakaus/impeccable>), an open-source UX/visual-craft skill
for Claude Code, licensed under the Apache License, Version 2.0 (the "License").

You may obtain a copy of the License at:

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

### Significant modifications

The derived content in `muse-ux-design.md` differs substantially from the
original `pbakaus/impeccable` source files. Modifications include:

- **Audience re-framing** — impeccable is authored for a human operator running
  slash commands at a Claude Code harness; the catalog is re-framed for
  agent-internal execution by Muse (PDLC's UX Designer agent) during ideation
  and review work.
- **Voice re-authoring** — impeccable's directive, declarative voice ("Stop
  using HSL," "Don't use `ease`," "Modal as first thought is wrong") is
  re-authored into Muse's empathetic, perceptive voice while preserving
  thresholds, code values, and named criteria verbatim.
- **PDLC lifecycle integration** — content is tagged to PDLC's four-phase
  lifecycle (Initialization / Inception / Construction / Operation) and wired
  to specific lifecycle moments (mockup review, Party Review, Ship Verify)
  rather than to slash-command invocations.
- **Structural reorganization** — content is restructured into the PDLC
  agent-extension pattern (`Extends — Responsibilities` / `Extends — Decision
  checklist` / `Extends — My output format` / `Tooling reference`), mirroring
  `agents/extensions/phantom-security-audit.md`.
- **Citation enhancement** — explicit citations to WCAG 2.2 success criteria,
  WAI-ARIA Authoring Practices, and MDN Web Docs are added throughout as
  canonical authorities. The original source uses the underlying values and
  API names without formal citations.
- **Selective import** — impeccable's persona content (Alex / Jordan / Sam /
  Riley / Casey), 23 slash commands, brand-register material, and live-server
  harness machinery are not included.
- **Removal of impeccable-specific framing** — references to the impeccable
  skill, its commands, and its harness-CLI conventions do not appear in the
  derived content.

The choice to derive from `pbakaus/impeccable` is acknowledged here as required
by the Apache-2.0 license. The underlying methodology — the Nielsen 10
heuristics, WCAG criteria, and Cognitive Load Theory — predates impeccable and
is drawn from canonical sources independently.

---

## `scripts/html2canvas.umd.js`

PDLC vendors `html2canvas` v1.4.1 (<https://html2canvas.hertzen.com>) at
`scripts/html2canvas.umd.js`. Used by the visual companion's annotation overlay
to capture the rendered `.main` element as a base64 PNG when the user clicks
the screenshot button (Wave 7b).

```
html2canvas 1.4.1
Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
Released under MIT License
```

You may obtain a copy of the MIT License at:

    https://opensource.org/licenses/MIT

The vendored bundle is the upstream UMD distribution from
<https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js>, retained
unmodified with the original copyright header intact. PDLC does not patch or
fork the library.

### Why vendor

PDLC supports an air-gapped install path (clone over HTTPS, no npm registry).
Vendoring keeps the screenshot capability available offline without adding a
runtime CDN dependency or an `npm install` build step. The library is updated
in-tree when a new upstream version warrants it.

---
