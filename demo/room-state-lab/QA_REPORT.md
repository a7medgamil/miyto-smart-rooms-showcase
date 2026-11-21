# Room State Lab — QA evidence

> **Independent synthetic demonstration — not MIYTO production source, not a live audio service, not a load test.**

Date: **21 November 2026**, Asia/Singapore (UTC+08:00). Local environment: Windows PowerShell, Node **v24.21.0**, npm **11.19.0**. Node 22 is the declared minimum and CI target; it was not locally available/tested. This report applies only to this original synthetic demo, not the MIYTO validation figures elsewhere in the showcase.

## Executed verification

Final source verification ran **2026-11-21T17:51:27.0974525+08:00–2026-11-21T17:51:30.7415679+08:00**, from `demo/room-state-lab/`.

| Command / action | Observed result | Exit code |
| --- | --- | ---: |
| `npm test` | 26 passed, 0 failed, 0 skipped; 405.8852 ms reported by runner | 0 |
| `npm run check` | 6 JavaScript syntax checks plus dependency, UI structure and browser API guardrails passed | 0 |
| `npm start` | Printed loopback URL and independent-demo disclaimer; later stopped with Ctrl+C | 1 on intentional interruption; not a test failure |
| `git diff --check` (repository root) | No whitespace errors in tracked changes | 0 |

The 26 runner entries comprise **22 pure-engine tests**, one HTTP integration parent test and its three subtests. Assertions cover deterministic fixtures, frozen-input preservation, participant limits/identity, same-level queue order, explicit matching, all stage boundaries, fake-clock batching, active-minute attendance, individual and dual absence, reserved seats, queue rejoin, completion, invalid transitions, independent concurrent rooms, event timestamps and bounded logs. The HTTP checks actually started an ephemeral loopback listener, requested every allowlisted asset, checked headers and verified rejection of repository/traversal paths and POST. No remote requests were part of these tests.

An earlier development run exited **1**: 24 passed and 2 failed runner entries (one failing HTTP subtest and its parent). `/README.md` returned 500 because the linked demo README had not yet been created. After writing it, the repeated suite passed; the final run above also passed. The initial static check exited 0. No failing run is presented as a pass.

## Privacy and boundary scan

Ran `rg -n -i` against `demo/room-state-lab/`, `docs/DEMO-ENGINEERING-NOTES.md`, and `.github/workflows/room-state-lab.yml`.

| Scan scope | Observed result | rg exit code |
| --- | --- | ---: |
| Common AWS, GitHub and API token formats; private-key headers; long quoted credential assignments | No matches | 1 (normal “no matches”) |
| Heuristic SMI/student/learner code formats, 8–12 digit sequences, email addresses | No matches in implementation and docs before this report was added | 1 (normal “no matches”) |
| HTTP/WebSocket URLs and student-identifier/production-endpoint references | Only loopback URLs in the demo README/server, and a boundary statement in engineering notes | 0 (matches reviewed) |

Reproduction examples (from repository root):

```sh
rg -n -i -e 'AKIA[0-9A-Z]{16}' -e 'gh[pousr]_[A-Za-z0-9]{20,}' -e 'github_pat_[A-Za-z0-9_]+' -e 'sk-[A-Za-z0-9]{20,}' -e 'BEGIN[ A-Z]*PRIVATE KEY' demo/room-state-lab docs/DEMO-ENGINEERING-NOTES.md .github/workflows/room-state-lab.yml
rg -n -i -e '\bSMI[-_][0-9]{3,}\b' -e '\b(student|learner)[-_][0-9]{3,}\b' -e '\b[0-9]{8,12}\b' -e '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}' demo/room-state-lab docs/DEMO-ENGINEERING-NOTES.md .github/workflows/room-state-lab.yml
rg -n -i -e 'https?://' -e 'wss?://' -e 'student.{0,20}(code|identifier)' -e 'production.{0,20}endpoint' demo/room-state-lab docs/DEMO-ENGINEERING-NOTES.md .github/workflows/room-state-lab.yml
```

The final whole-scope scan, including this report, also found no token, email, student-code or long-number matches. URL/reference matches in this report are descriptions of the reviewed local URL and boundary checks. The existing root README’s historical links were not copied into the new implementation. Its diff was reviewed: only the publication-boundary clarification and clearly labeled demo links were added; MIYTO metrics/status were unchanged. No private repository or forbidden directory was accessed.

Final worktree/branch review at **2026-11-21T17:53:23.8407849+08:00** confirmed the requested branch and only task-created modifications. Git emitted a permission warning about its global ignore file; repository status and diff checks completed successfully. The local demo server was stopped after inspection was blocked.

These are heuristic scans, not proof that every possible secret or identifier format is absent. No private student-code list was consulted. Code review also found browser state confined to memory, synthetic sequential labels, no package dependencies, and no browser remote/media/storage APIs among the patterns enforced by `check`.

## Browser verification blocker and untested areas

The browser connector reported **“The browser access host is unavailable.”** The native Chrome fallback was **rejected by automatic approval review** because selecting an existing window could expose unrelated private browsing content. No browser page was opened, no visual pass was claimed, and no workaround was used. An explicit approval request was sent for opening the loopback demo in a new tab; approval had not been received when this report was written.

Therefore **desktop/mobile rendering, browser JavaScript execution, real keyboard focus/activation, screen-reader behavior, touch, zoom and reduced-motion behavior remain unverified in a browser**. Responsive rules, semantic controls, focus styles, focus restoration, a skip link, labeled regions and a live status are implemented and partially checked in source; that is not runtime accessibility evidence or conformance certification. Screenshot instructions are provided in the README; no screenshots were captured.

The GitHub Actions file was authored but not run remotely. Linux/Node 22 execution, cross-browser behavior, dependency-action supply-chain verification, hostile input fuzzing and a full security/privacy audit were not performed. No real audio, live attendance integration, production behavior, load/capacity test or deployment was attempted. No commits, push or PR were made. The worktree is intentionally modified for review.
