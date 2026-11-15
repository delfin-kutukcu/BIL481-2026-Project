# Quality Assurance Plan

**BIL 481 Software Engineering - Project Assignment 2 (Fall 2026)**  
**Group:** DINC  

## Contributors
- Nadide Zeynep Dedeoğlu
- Işıkalp Karakaş
- Delfin Kütükçü
- Nildeniz Efe
- Çınar Aktaş

## Table of Contents
1. [Task Matrix](#task-matrix-qa-plan)
2. [QA Strategy & Testing Methodologies](#1-qa-strategy--testing-methodologies)
3. [2. Quality Factors & Metrics](#2-quality-factors--metrics)
4. [3. Test Cases & Bug Tracking](#3-test-cases--bug-tracking)

## Task Matrix (QA Plan)

| Document Section | Responsible Member |
| :--- | :--- |
| **1. QA Strategy & Testing Methodologies** | Nadide Zeynep Dedeoğlu |
| **2. Quality Factors & Metrics** | Nadide Zeynep Dedeoğlu |
| **3. Test Cases** | Nadide Zeynep Dedeoğlu |
| **3. Bug Tracking Mechanism** | Nadide Zeynep Dedeoğlu |
| Consistency review with the Requirements Document | Delfin Kütükçü |

---

## 1. QA Strategy & Testing Methodologies
### QA Strategy Overview & Testing Methodologies
StudyLoft adopts an **iterative, shift-left Quality Assurance (QA) strategy** aligned with the **V-Model** across our project lifecycle (Phases P2–P5). Rather than treating testing as an isolated phase at the end of development, verification activities are embedded directly into each sprint (`P3: Development Sprint 1` and `P4: Development Sprint 2`), followed by dedicated system stabilization in `P5: Testing and Stabilization`. Every functional requirement (`FR-1` to `FR-16`) and non-functional requirement (`NFR-1` to `NFR-8`) is mapped directly to verifiable test criteria.

To ensure end-to-end reliability across the React frontend, Node.js/Express REST API, Socket.io real-time layer, and PostgreSQL database, our testing methodology encompasses five distinct levels:

1. **Unit Testing:** Isolates and verifies core business logic and state transitions at the class/function level using **Jest**. Key targets include active study duration calculations (`StudyTimer`, `StudySession.getActiveMinutes()`), point and tier threshold evaluations (`PointService`, `StandardPointStrategy`, `TierPolicy`), and store eligibility checks (`StoreService.canPurchase()`).
2. **Integration Testing:** Validates interactions between decoupled modules and external services. Specifically, this tests bidirectional **Socket.io** room broadcasts (`LibraryRoom` Observer notifications), atomic **PostgreSQL** transactions during store purchases (deducting points and updating inventory simultaneously), and graceful fallback handling when the **Google Gemini API** is unreachable or rate-limited.
3. **System / End-to-End (E2E) Testing:** Verifies complete user workflows from the browser UI down to the database. This covers the primary StudyLoft gamification loop: logging in, taking a library seat, running a study session with anti-cheat tab switching, earning points, purchasing tiered items in the store, and saving the personal apartment layout.
4. **Performance & Load Testing:** Simulates concurrent student traffic using **Artillery** (or **k6**) to stress-test WebSocket event broadcasting (`50–100` concurrent clients) and verify sub-200 ms latency and automatic reconnection recovery.
5. **Usability & Cross-Browser Testing:** Evaluates real-world user experience through structured task completion sessions with at least 8 students and compatibility verification across major desktop browsers.

---

### Automated vs. Manual Testing Strategy
To balance development velocity with thorough verification within our 540 person-hour project budget, StudyLoft divides testing responsibilities between automated pipelines and structured manual execution:

| Testing Approach | Target Scope & Components | Tools & Execution Trigger | Rationale |
| :--- | :--- | :--- | :--- |
| **Automated Testing** | • Business logic unit tests (timer math, `Math.floor` minute rounding, 15-min point threshold, tier unlocks)<br>• REST API endpoint validation & SQL injection/XSS input sanitization<br>• WebSocket multi-client concurrency & latency benchmarks | **Jest**, **Supertest**, **Artillery / k6**<br><br>Triggered automatically on every Pull Request via GitHub CI checks and at sprint milestones. | Eliminates regression bugs in deterministic rules (points, balances, state transitions) and provides objective, repeatable latency metrics under load. |
| **Manual Testing** | • 2D grid rendering, avatar animations, and drag-and-drop apartment layout usability<br>• Cross-browser UI verification (Chrome, Firefox, Edge, Safari at $\ge 1280\text{ px}$ width)<br>• Exploratory anti-cheat edge cases (tab minimization, multi-tab behavior) & 8-student usability trials | **Browser DevTools**, **Manual Test Checklists**, **User Observation**<br><br>Executed during PR reviews, sprint integration checks, and `P5: Testing & Stabilization`. | Visual layout alignment, drag-and-drop responsiveness, and intuitive user onboarding (`< 3 min`) require human visual inspection and real user feedback. |

---

## 2. Quality Factors & Metrics

To objectively evaluate whether StudyLoft meets its non-functional requirements (`NFR-1` through `NFR-8`), four primary software quality factors—aligned with the **ISO/IEC 25010** quality model—have been established along with measurable acceptance thresholds:

| Quality Factor | Related Requirement | Metric Definition | Target Threshold (Pass Criteria) | Measurement Method |
| :--- | :--- | :--- | :--- | :--- |
| **1. Performance (Time Behavior)** | `NFR-1` | **End-to-End WebSocket Broadcast Latency:** Time elapsed from a client emitting a room event (seat selection, status change, chat message, emoji reaction) until all peer clients in the same `LibraryRoom` receive the update. | **$\ge 95\%$** of messages delivered in **$< 200\text{ ms}$** with up to $50$ concurrent users. | Automated load testing via **Artillery / k6** measuring round-trip and broadcast timestamps. |
| **2. Reliability & Fault Tolerance** | `NFR-2` | **Session Data Preservation & Reconnection Rate:** Maximum active study time lost during an abrupt network drop, and the time required for the Socket.io client to automatically restore session state once connectivity returns. | • Data loss **$\le 5\text{ seconds}$** per disconnect<br>• Automatic reconnection in **$< 30\text{ seconds}$** with **$\ge 90\%$** ($9/10$) success rate. | Simulated network throttling/disconnection tests in **Chrome DevTools** & automated socket drop scripts. |
| **3. Security & Data Integrity** | `NFR-3` | **Authentication Enforcement & Transaction Atomicity:** Percentage of passwords stored using salted cryptographic hashing (`bcrypt`), percentage of WebSocket/REST endpoints enforcing session auth, and rate of balance/inventory mismatches during concurrent purchases. | • **$100\%$** salted password hashing & HTTPS/WSS transport<br>• **$100\%$** authenticated socket connections<br>• **$0$** negative-balance or duplicate-item race conditions. | Static code review, **Supertest** unauthorized-access probes, and concurrent PostgreSQL transaction tests. |
| **4. Usability (Operability)** | `NFR-6` | **First-Time Task Completion Rate & Time-on-Task:** Percentage of first-time student users who successfully register, join a library room, select a seat, and start a study timer without external assistance. | **$\ge 80\%$** of test participants ($n \ge 8$ students) complete the onboarding workflow in **$< 3\text{ minutes}$**. | Moderated usability testing sessions with stopwatch timing and post-task observation logs. |

---

## 3. Test Cases & Bug Tracking
### Test Cases

The following test cases verify StudyLoft's core functional requirements and the performance, reliability, security, and scalability requirements (`NFR-1`, `NFR-2`, `NFR-3`, `NFR-5`) across unit, integration, system, and load testing levels. Their expected results follow the verification statements of the Requirements Document:

| Test ID | Req. ID | Test Title & Type | Preconditions | Test Steps | Expected Result (Pass Criteria) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | `FR-1`, `NFR-3` | **User Registration & Secure Authentication** *(Integration / API)* | Database is running; test email `student@etu.edu.tr` is not yet registered. | 1. Send `POST /api/auth/register` with valid email, username, and password.<br>2. Send the same request again with the same username, then with the same e-mail.<br>3. Inspect the `users` table in PostgreSQL.<br>4. Attempt `POST /api/auth/login` with wrong password, then with valid password. | • Registration returns `201 Created`; password is stored as a salted `bcrypt` hash (never plaintext).<br>• Duplicate username or e-mail is rejected.<br>• Wrong password returns `401 Unauthorized`.<br>• Valid login returns `200 OK` with a signed session/JWT token. |
| **TC-02** | `FR-3`, `FR-4`, `NFR-1` | **Real-Time Library Seat Selection & Broadcast** *(System / E2E)* | User A and User B are authenticated and connected to the same `LibraryRoom` via Socket.io. | 1. User A clicks an unoccupied seat (`Seat #4`).<br>2. Observe User B's library view.<br>3. User B attempts to click `Seat #4`. | • Seat `#4` locks to User A (`OCCUPIED`) and User A's avatar renders in **$< 200\text{ ms}$** on User B's screen.<br>• User B cannot claim `Seat #4` and receives a seat-unavailable notification. |
| **TC-03** | `FR-6`, `FR-7` | **Anti-Cheat Tab-Switch Detection & Pause** *(System / E2E)* | User A is seated with an active study session (`StudyTimer` running). | 1. Let the timer run actively for 10 minutes.<br>2. Switch to another browser tab (`visibilitychange` -> `hidden`) for 3 minutes.<br>3. Return to the StudyLoft tab, resume, and finish the session. | • Timer automatically transitions to `PAUSED` within 1 second of tab switch, and User A's avatar status changes to `IDLE (PAUSED)` for other users.<br>• Upon return, active elapsed time remains **10 minutes** (the 3 away minutes are excluded).<br>• The saved session has `paused_count` increased by 1. |
| **TC-04** | `FR-6`, `FR-8`, `FR-16` | **Minimum 15-Minute Point Threshold & Rounding** *(Unit — Jest)* | `PointService` configured with `StandardPointStrategy` (5 points per active minute, $\ge 15$ min threshold). | 1. Call `awardPoints()` for a session with `14` active minutes and `59` seconds.<br>2. Call `awardPoints()` for a session with `27` active minutes and `45` seconds.<br>3. Call `awardPoints()` for a session with exactly `30` active minutes. | • Case 1 (`14m 59s`): `getActiveMinutes()` floors to `14` (< 15), awarding **`0` points**; the session is still recorded with `pointsEarned = 0`.<br>• Case 2 (`27m 45s`): floors to `27` ($\ge 15$), awarding **`135` points**; both `points` and `lifetimePoints` increase by 135.<br>• Case 3: **`150` points** (FR-8 verification).<br>• Automated in `server/tests/points/points.test.ts`. |
| **TC-05** | `FR-9`, `FR-10`, `NFR-3` | **Tiered Store Purchase & Atomic Balance Deduction** *(Integration)* | User has `150` points and `150` lifetime points, so the user is in **Tier 1** (Tier 2 requires 200 lifetime points). Store has Item X (`100` pts, Tier 1) and Item Y (`120` pts, Tier 2). | 1. Attempt to purchase Item Y (Tier 2).<br>2. Purchase Item X (Tier 1).<br>3. Trigger two simultaneous purchase requests for Item X with `150` pts balance (fresh user). | • Item Y purchase is rejected (`403 Forbidden: Tier locked`) and nothing changes.<br>• Item X purchase succeeds atomically: balance becomes **`50` pts**, lifetime points stay `150`, and Item X is added to the inventory.<br>• Of the concurrent requests only one succeeds; there is no negative balance and no duplicate item. |
| **TC-06** | `FR-11` | **2D Apartment Grid Customization & Persistence** *(System / E2E)* | User owns Item X in inventory and opens the personal apartment editor. | 1. Drag Item X onto valid grid coordinates `(x: 4, y: 3)`.<br>2. Attempt to place a second item overlapping `(x: 4, y: 3)`.<br>3. Attempt to place an item the user does not own.<br>4. Save layout, log out, and log back in. | • Valid placement snaps to `(4, 3)`; overlapping placement is prevented by collision check.<br>• An item that is not owned cannot be placed.<br>• After re-login, Item X persists at `(4, 3)`. |
| **TC-07** | `FR-5`, `NFR-3` | **Room Chat, Emoji Reactions & XSS Sanitization** *(Integration / Security)* | User A and User B are in the same `LibraryRoom`. | 1. User A sends a chat message containing `<script>alert('xss')</script>` and triggers a `☕` emoji reaction.<br>2. User A sends a 141-character message.<br>3. Inspect User B's received payload and UI. | • Script tags are escaped/sanitized (no JS execution occurs).<br>• Clean text and the emoji appear as chat bubbles above User A's avatar on User B's screen in **$< 200\text{ ms}$**.<br>• The 141-character message is rejected. |
| **TC-08** | `FR-14` | **Weekly Habit Report & Gemini API Fallback** *(Integration)* | User has seeded study sessions in the current week. | 1. Request `GET /api/report/weekly` with a valid **Google Gemini API** response.<br>2. Simulate Gemini API timeout / `503 Service Unavailable` and repeat the request. | • The report shows total hours, number of sessions, average session length, and longest streak matching the seeded data, plus a short AI insight.<br>• With the API unavailable, the report still renders with the same numbers and without the insight; the system does not crash. |
| **TC-09** | `NFR-1`, `NFR-5` | **Concurrent WebSocket Load Benchmark** *(Performance — Artillery/k6)* | Staging server deployed with test room capacity for 100 concurrent sockets. | 1. Spawn `50` virtual Socket.io clients in the library and emit status updates and chat events for 5 minutes.<br>2. Increase to `100` concurrent clients. | • With 50 clients, **$\ge 95\%$** of broadcast events complete in **$< 200\text{ ms}$** (NFR-1).<br>• With 100 clients, all connections stay open (`0%` dropped) and server CPU/memory remains stable (NFR-5). |
| **TC-10** | `FR-15`, `NFR-2` | **Network Drop Recovery & Timer Preservation** *(Reliability)* | User A is seated with an active timer at `20:00`. | 1. Disconnect User A's network for 15 seconds via Chrome DevTools.<br>2. Restore network connectivity and observe reconnection behavior. | • A "reconnecting" indicator is shown while offline.<br>• Socket.io client reconnects automatically with exponential backoff in **$< 30\text{ seconds}$**.<br>• The same seat and status are restored, and the recovered active study time differs from the expected value by **$\le 5\text{ seconds}$**. |

---

### Bug Tracking Mechanism

StudyLoft manages all defects centrally through **GitHub Issues** within the `BIL481-2026-Project` repository, ensuring full traceability between bug reports, pull requests, and sprint deliverables.

#### 1. Issue Reporting Template & Required Fields
Every discovered defect must be logged as a GitHub Issue using a standardized structure containing:
- **Title:** Concise summary prefixed by module (e.g., `[Timer] Active minutes not flooring seconds before 15-min check`).
- **Environment & Build:** Browser/OS version, branch/commit hash, and test type (Unit, Integration, E2E, Manual).
- **Steps to Reproduce:** Numbered, deterministic actions required to trigger the bug.
- **Expected vs. Actual Behavior:** Clear comparison referencing the violated `FR`/`NFR` or `TC-XX` identifier.
- **Evidence:** Console logs, network payloads, or screenshots/screen recordings.

#### 2. Severity & Priority Classification
Each issue is tagged with a `bug` label, a module label (`frontend`, `backend`, `socket`, `database`), and one of four severity labels:

| Severity Label | Definition & Impact | Target Resolution SLA | Release Gate Policy |
| :--- | :--- | :--- | :--- |
| **`severity: critical`** | System crash, authentication bypass, data loss, point-duplication exploit, or broken core timer/seat loop. | **Within 24 hours** | Blocks pull request merges and sprint release until resolved and verified. |
| **`severity: high`** | Major feature malfunction with no easy workaround (e.g., store item fails to equip, reconnection exceeds 30s). | **Within 48 hours** | Must be resolved before the end of the current sprint (`P3`/`P4`). |
| **`severity: medium`** | Non-blocking functional defect or layout misalignment on supported desktop resolutions ($\ge 1280\text{ px}$). | **Within 3–4 days** | Scheduled into the active sprint or `P5` stabilization backlog. |
| **`severity: low`** | Minor cosmetic/UI polish issue, typo, or non-critical animation glitch. | **Best effort (`P5`)** | Deferred if higher-priority items remain open. |

#### 3. Defect Lifecycle Workflow
All bugs follow a five-stage state transition linked directly to GitHub Pull Requests:

1. **`Open`:** Bug is logged in GitHub Issues and triaged by the QA lead (`Çınar Aktaş`, Tester / QA in the Project Plan), who assigns severity and module labels.
2. **`In Progress`:** The responsible module developer assigns themselves to the issue and creates a dedicated fix branch (e.g., `fix/timer-floor-rounding`).
3. **`In Review`:** Developer opens a Pull Request referencing `Closes #<issue-number>` and includes a new or updated regression test preventing recurrence.
4. **`Verified`:** QA lead or a peer reviewer verifies the fix locally/on staging against the original `Steps to Reproduce` and confirms CI tests pass.
5. **`Closed`:** Upon merging the PR into `main`, GitHub automatically closes the issue and archives the resolution history.
