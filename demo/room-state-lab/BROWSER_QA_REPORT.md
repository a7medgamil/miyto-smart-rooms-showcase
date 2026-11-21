# Browser QA — independent verification, 21 November 2026

> **Independent synthetic demonstration — not MIYTO production source, not a live audio service, not a load test.**

**Reviewer:** ChatGPT, independently rerunning checks after the Codex implementation. This is automated reviewer testing, **not** a claim of in-person human certification.
**Environment:** authorized Windows machine; Node 24.21.0, Chrome headless in an **isolated fresh browser context**; Playwright library used read-only from a separate installed project. No existing user browser profile, tabs, cookies, accounts or sites were opened.
**Application URL:** loopback-only `http://127.0.0.1:4173/`. No production endpoint was accessed.

## Verification performed

| Check | Desktop 1440 × 1000 | Mobile 390 × 844 |
|---|---|---|
| HTTP navigation / app JS renders | PASS | PASS |
| Three initial rooms and virtual clock 00:00 | PASS | PASS |
| 10-minute tick produces 00:10 and 60 total participant-minutes | PASS | PASS |
| Leave pauses one participant; next minute total 65 | PASS | PASS |
| Rejoin resumes attendance; next minute total 71 | PASS | PASS |
| Add compatible fictional participant; manual match opens fourth room | PASS | PASS |
| Reset restores 3 rooms, minute 00:00 | PASS | PASS |
| Horizontal viewport overflow guard | PASS | PASS |
| Synthetic-demo disclaimer visible | PASS | PASS |
| No JS page errors and no external HTTP requests | PASS | PASS |
| Native semantic controls and labeled input present | PASS (DOM check) | PASS (DOM check) |
| Focus visible on tested participant control | PASS (computed CSS solid outline on focus) | PASS (computed CSS solid outline on focus) |

The suite generated independent full-page screenshots under a separate local QA folder and reviewed initial desktop/mobile views for synthetic-only content. The approved static previews are included below. All simulated IDs shown are `Demo 01`, etc.; no production students, actual MIYTO screenshots, credentials or customer assets appear.

**Automated browser smoke result: PASS for both viewports.** The initial independent test script briefly failed an assertion expecting capitalized `Prepare`, whereas the UI correctly labels the phase `Silent · prepare`. The assertion was corrected to be case-insensitive; the application was **not** altered to conceal a failure. The complete independent rerun then exited 0.

## Screenshots

- [Desktop preview](assets/desktop-preview.png)
- [Mobile preview](assets/mobile-preview.png)

## Other verified results

The independent terminal rerun of `npm test` completed with **26 passed / 0 failed / 0 skipped**; `npm run check` and `git diff --check` both exited 0. See [the Codex-produced local report](QA_REPORT.md) for separate test detail and limits. A reproducible GitHub Actions run must still complete on the proposed commit after the changes are pushed.

## Not verified

This check does **not** certify full keyboard-only tab order, screen reader behavior, WCAG conformance, actual mobile/touch hardware, cross-browser reliability, performance at scale, live room/audio behavior, real attendance or production security. Testing two simulated viewports and a visible focus outline does not constitute a formal accessibility audit. Code origin and privacy checks also rely on limited-source and heuristic review, not an exhaustive audit.

**Release gate:** keep the PR draft until the exact proposed commit passes GitHub Actions and public content/links are reviewed. No deployment or data migration occurred.
