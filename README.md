# MIYTO Smart Rooms — Product Case Study

MIYTO is an audio-first, level-aware learning-room experience developed for Superior Multiskills Institute (SMI). It structures learner practice into paired rooms, guided silent-practice rounds, and moderated speaking discussions.

> Public documentation only. No application source, student records, production credentials, internal endpoints, or deployment configuration are included.

## Product scope

- Paired learner rooms with level-aware matching and room lifecycle management.
- Structured practice rounds followed by guided speaking discussions.
- A curated discussion bank documented as 240 topics and 4,800 question slots.
- Attendance synchronization and session-window workflows.
- Peer reporting, moderation restrictions, and auditable handling.
- Administrative room visibility and session oversight.

## Engineering validation snapshot

The private sanitized engineering snapshot was checked on 13 November 2026:

| Check | Result |
|---|---:|
| Unit assertions | 1,202 passed; 61 skipped |
| Worker / Durable Object assertions | 180 passed; 2 skipped |
| Build | Passed |
| Type generation and typecheck | Passed |
| Browser credential scan | Passed |
| GitHub Actions validation workflow | Passed |

**Combined assertions:** 1,382 passed, 63 skipped, 0 failed.

These results describe the tested local engineering snapshot and CI revision only. They are not a production certification or a live-media end-to-end result.

## Explicit limitations

- The isolated 400-participant / 200-room load scenario was not run.
- A live SFU end-to-end test was not run in this QA pass.
- Production deployment and live configuration changes were outside the validation scope.
- Bundle-size optimization remains follow-up engineering work.

## Product access

[MIYTO student experience](https://secondary-session.smi-platform.org/) · [Portfolio case study](https://ahmed-gamil-portfolio.ahmedabdulbarim.workers.dev/case-studies/miyto-smart-rooms)

## Publication boundary

The application source remains in a separate private repository. No client or learner data is published.

© 2026 Superior Multiskills Institute. All rights reserved.
