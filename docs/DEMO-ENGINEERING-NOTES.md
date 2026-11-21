# Independent Room State Lab — engineering notes

> **Independent synthetic demonstration — not MIYTO production source, not a live audio service, not a load test.**

[Room State Lab](../demo/room-state-lab/README.md) is a new, original implementation created for this public showcase. The public README and high-level documents provided product context only. No private implementation, student identifiers, real participant names, production endpoints, original application assets or SMI modules are part of the demo. Its design is original and does not represent actual MIYTO UI.

## What the code demonstrates

- A pure state engine with deterministic IDs, exact-level FIFO-compatible matching, fixed two-seat membership and explicit lifecycle transitions.
- A manual virtual clock, three 10-minute silent stages, an invented 10-minute discussion, and per-person active-minute accounting.
- Reserved seats during absence, rejoining without backfilled attendance, independently timed concurrent rooms and closed-session handling.
- A small dependency-free browser interface with keyboard controls, focus handling, responsive layout, text status and an inspectable ledger/log.
- Node built-in unit and local HTTP tests, syntax/static checks, a loopback-only allowlisted static server and a minimal read-only CI workflow.

The implementation favors simple snapshots and invariant checks over infrastructure. At this intentionally small scale, cloning and scanning arrays makes state transitions straightforward to inspect and test. Matching and ticking are explicit actions; no timers or wall-clock fixtures can race the tests. Errors reject a transition without changing the caller’s snapshot.

## Honest distinctions

The demo’s levels, matching order, seat reservation, session length and attendance arithmetic are invented illustrative assumptions. They do **not** encode real SMI policy, attendance integrations or MIYTO production behavior. There is no live audio, real user data, network service integration, distributed coordination or durable record. Its 24-person ceiling is a product boundary for a readable local experiment, not a benchmark.

Public MIYTO QA figures and production-status notes in the existing case study are separate historical evidence. They do not apply to this independent code. Conversely, this demo’s passing tests would establish only the behavior asserted by its own tests; they cannot establish production readiness, media performance or capacity. A new workflow definition does not mean GitHub Actions has run.

See the demo’s [exact assumptions](../demo/room-state-lab/README.md#exact-simulation-assumptions), [test code](../demo/room-state-lab/test/engine.test.mjs) and [QA evidence](../demo/room-state-lab/QA_REPORT.md). Start locally with Node 22+: `cd demo/room-state-lab`, then `npm test`, `npm run check`, and `npm start`. No dependency installation is required.
