# MIYTO — High-Level Architecture

~~~mermaid
flowchart LR
  A[Student Web Client] --> B[Application API]
  B --> C[Authoritative Room State]
  B --> D[Attendance and Moderation Workflows]
  A <--> E[Real-Time Audio Transport]
  C --> F[Room and Session Events]
  F --> A
~~~

- **Client:** learner room interface, guided practice, and session controls.
- **Application API:** request validation, authorization boundaries, and room operations.
- **Authoritative room state:** participant lifecycle, room coordination, and session state.
- **Attendance and moderation:** policy-driven records and reviewable actions.
- **Real-time audio:** media transport separated from application state.

Conceptual overview only; no provider resource IDs, endpoints, secrets, or production topology.
