# Acceptance Tests and Acceptance Criteria

**BIL 481 Software Engineering - Project Assignment 3 (Fall 2026)**  
**Group:** DINC  
**Version 0.1 (draft) · 21/11/2026**

## Contributors
- Işıkalp Karakaş

## Table of Contents
1. [Task Matrix (Contribution Table)](#task-matrix-contribution-table)
2. [Change Record](#change-record)
3. [1. Introduction](#1-introduction)
4. [2. Acceptance Testing Approach](#2-acceptance-testing-approach)
5. [3. Acceptance Criteria](#3-acceptance-criteria)
6. [4. Acceptance Tests](#4-acceptance-tests)
7. [5. Correspondence Between Tests and Criteria](#5-correspondence-between-tests-and-criteria)
8. [6. Requirements Verified Outside the Acceptance Tests](#6-requirements-verified-outside-the-acceptance-tests)
9. [Appendix A: Traceability Matrix](#appendix-a-traceability-matrix)
10. [Appendix B: Test Data and SQL Checks](#appendix-b-test-data-and-sql-checks)
11. [Appendix C: Result Recording Template](#appendix-c-result-recording-template)

## Task Matrix (Contribution Table)

| Document Section | Responsible Team Member(s) | Contribution |
| :--- | :--- | :--- |
| 1. Introduction | Işıkalp Karakaş | Purpose, scope, references, terms |
| 2. Acceptance Testing Approach | Işıkalp Karakaş | Test levels and dates, environment, roles, entry and exit criteria |
| 3. Acceptance Criteria | Işıkalp Karakaş | Measurable criteria for the four demo scenarios |
| 4. Acceptance Tests | Işıkalp Karakaş | Acceptance tests AT-1 to AT-4 |
| 5. Correspondence Between Tests and Criteria | Işıkalp Karakaş | Coverage matrix and explanation for each test |
| 6. Requirements Verified Outside the Acceptance Tests | Işıkalp Karakaş | Out-of-scope parts and where they are verified |
| Appendices A to C | Işıkalp Karakaş | Traceability matrix, test data and SQL checks, result template |

## Change Record

| Version | Date | Updated Section | Description of Changes | Updated By |
| :--- | :--- | :--- | :--- | :--- |
| 0.1 | 21/11/2026 | Initial Document | First draft of the acceptance criteria and the four acceptance tests (Sprint 1, task 20) | Işıkalp Karakaş |

---

## 1. Introduction

### 1.1 Purpose
This document defines clear and measurable acceptance criteria for the four scenarios selected for the demo, and one acceptance test for each scenario. The tests are run on the demo build before the presentation. Their results, the issues found, and the logs are reported in the Test Results Report.

### 1.2 Scope: the four demo scenarios
The four scenarios are the use cases of Design Document Section 3:

| Scenario | Use case (Design Document) | Design pattern | Requirements | Acceptance test |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Use Case 1: Interact in Library (Section 3.1) | Observer | FR-3, FR-4, FR-5, NFR-1, NFR-3 | AT-1 |
| 2 | Use Case 2: Manage Study Timer (Section 3.2) | State | FR-6, FR-7, NFR-2, NFR-8 | AT-2 |
| 3 | Use Case 3: Buy Items in Virtual Store (Section 3.3) | Factory | FR-10, FR-9, NFR-3 | AT-3 |
| 4 | Use Case 4: Calculate Points & Unlock Tiers (Section 3.4) | Strategy | FR-8, FR-9, FR-16, NFR-2, NFR-8 | AT-4 |

Registration and login (FR-1) are preconditions of every test; they are tested by QA Plan TC-01 and are not repeated here. Parts of these requirements that need a load test, a user study, or another phase are listed in Section 6.

### 1.3 References
- Requirements Document (01-11-2026): FR-1 to FR-16 and NFR-1 to NFR-8 with their verification statements.
- Design Document v1.2 (19/11/2026): Sections 2.2 to 2.4 (business rules, interfaces, wireframes) and 3.1 to 3.4 (use case flows).
- Quality Assurance Plan (PA2): test levels, quality metrics, test cases TC-01 to TC-10, bug tracking.
- Project Plan (01-11-2026): phases and roles.
- `server/src/db/schema.sql` and `server/src/db/seed.sql`: database tables and the eight store items used as test data.
- Deployment Plan and Test Results Report (PA3): demo environment and test results.

### 1.4 Terms
- **Acceptance criterion (AC-s.n):** a measurable condition that scenario *s* must meet. Each criterion names its requirement, its measurement method, and its pass threshold.
- **Acceptance test (AT-s):** a step-by-step system test of scenario *s* on the demo build. Each step names its expected result and the criteria it checks.
- **Room update:** a change that the server pushes to the other users in the library: a seat taken or released, a status change, or a chat bubble.
- **Pass / Fail:** a step passes when the observed result matches the expected result; otherwise it fails. A test passes when all its steps pass. A criterion passes when every step that checks it passes.

## 2. Acceptance Testing Approach

### 2.1 Test levels and validation approach
The acceptance tests are system tests at the top level of the V-model described in the QA Plan. They **validate** the product: the tester uses the demo build in the browser in the way a student would, following the demo flow (log in, sit in the library, study with the timer, earn points, spend them in the store). DevTools and SQL queries are used only to read results that the screen does not show, such as message times and stored rows. The lower test levels **verify** the components against the design; they are linked to each requirement in Appendix A.

| Test level | What is tested | Tools | Planned date |
| :--- | :--- | :--- | :--- |
| Unit | Points and tiers, store rules, timer calculation | Jest (`npm test`) | With every pull request in Sprint 1 (16/11/2026 to 29/11/2026) |
| Integration | Database transactions, REST and Socket.io interfaces | Jest with `TEST_DATABASE_URL`, Supertest | Before each feature is merged, Sprint 1 |
| System (acceptance) | The four demo scenarios: AT-1 to AT-4 | Chrome, DevTools, SQL client, `curl` | 27/11/2026 to 28/11/2026 (proposed), before the PA3 deadline of 29/11/2026 |
| Load, reliability, usability, compatibility | Section 6 (QA Plan TC-09, TC-10, usability and browser tests) | Artillery or k6, DevTools, user test | P5 Testing and Stabilization, 06/12/2026 to 16/12/2026 |

The actual dates are recorded in the Test Results Report.

### 2.2 Test environment
- **Build:** the `main` branch, deployed as described in the Deployment Plan (client, server, PostgreSQL). The tested commit hash is recorded with the results.
- **Database:** created with `npm run db:init` and `npm run db:seed`, so the store contains the eight items of `seed.sql`.
- **Browser:** the latest Google Chrome on a desktop screen at least 1280 px wide (NFR-7). Every test user works in a separate Chrome profile, so that the logins of different users do not mix.
- **Tools:** Chrome DevTools (Network tab, and its WS view for WebSocket frames), a stopwatch with lap times, an SQL client connected to the demo database (psql or DBeaver), and a terminal with `curl`.
- **Test accounts:** registered through the application, with names that start with `atest_` (Appendix B.1). Balances needed as preconditions are set with the SQL statements in Appendix B.2.

### 2.3 Roles
The test run is coordinated by the Tester / QA role of the Project Plan (Çınar Aktaş). AT-1 needs three users and AT-2 two users; they can be played by different team members or by one member with several Chrome profiles.

### 2.4 Entry and exit criteria
**Entry criteria**
1. The four scenarios are merged into `main` and deployed to the demo environment.
2. `npm test` has been run on the deployed commit and its output is saved.
3. The database is initialized and seeded, and the test accounts exist.

**Exit criteria**
1. AT-1 to AT-4 have each been run once completely, and every step is recorded as Pass or Fail with its evidence (Appendix C).
2. Every failed step is reported as a GitHub Issue, using the bug template and the severity labels of the QA Plan, and is listed in the Test Results Report with its cause and a proposed solution.

**Acceptance decision:** the four scenarios are accepted for the demo when every criterion in Section 3 passes. A failed criterion is not hidden; it is reported with its result and analysis.

### 2.5 Evidence
For each test the tester keeps screenshots of the expected results, the WebSocket frames used for timing (AT-1, AT-2), the outputs of the SQL queries, the stopwatch lap times (AT-2, AT-4), the `npm test` output, and the server log of the test period. The evidence is attached to the Logs and Outputs part of the Test Results Report.

## 3. Acceptance Criteria

The thresholds come from the verification statements of the Requirements Document, the metrics and test cases of the QA Plan, and the flows of the Design Document.

### 3.1 Scenario 1: Interact in Library (FR-3, FR-4, FR-5, NFR-1, NFR-3)

| ID | Criterion | Requirement | Measurement method | Pass threshold |
| :--- | :--- | :--- | :--- | :--- |
| AC-1.1 | The library is shown as six tables with four seats each, and every seat is shown as empty or occupied. | FR-3 (Design 2.4) | Inspection on three clients | 24 seats; every seat shows the same state on all three clients |
| AC-1.2 | Every seated user is shown with an avatar on the right seat and the right status: AVAILABLE (timer idle), STUDYING (timer running), IDLE (PAUSED) (timer paused). | FR-3 (Design 3.1) | Inspection on three clients | All three clients show all three avatars with the right seat and status after each change |
| AC-1.3 | A logged-in user can take an empty seat, also at a table next to another user's table, and the other users see the user there. | FR-4 | Inspection | The seat becomes occupied on all clients |
| AC-1.4 | A seat that another user occupies cannot be taken. | FR-4 (QA Plan TC-02) | Inspection | The occupied seat cannot be selected, or the user is told that it is not available; the seat stays with its user and no client's view changes |
| AC-1.5 | A text message of at most 140 characters and an emoji reaction are shown to the other users as chat bubbles above the sender's avatar. | FR-5 | Inspection | Shown on all other clients; a message of exactly 140 characters is accepted |
| AC-1.6 | A text message longer than 140 characters is not sent. | FR-5 | Inspection | A 141-character message reaches no other client |
| AC-1.7 | The library has no voice or video chat. | FR-5 | Inspection | No voice or video controls; the browser never asks for microphone or camera access |
| AC-1.8 | When a user leaves the library, the user's seat becomes empty for the others. | FR-3 (Design 3.1, step 5) | Inspection | The seat is empty on all remaining clients |
| AC-1.9 | Room updates reach the other users within 200 ms. | NFR-1, with three users (the 50-user load is in Section 6) | Time of the frame sent by the acting client and of the frame received by another client, both read in Chrome DevTools on the same computer | All 10 sampled updates take 200 ms or less |
| AC-1.10 | Chat text is shown as text and is never run as code. | NFR-3 (QA Plan TC-07) | Send `<script>alert('xss')</script>` as a message | Shown as plain text; no script runs and no dialog opens |
| AC-1.11 | Only logged-in users can join the library; the WebSocket connection is authenticated. | NFR-3 | Open the library without logging in | The library cannot be joined, and the user does not appear on the other clients |

### 3.2 Scenario 2: Manage Study Timer (FR-6, FR-7, NFR-2, NFR-8)

| ID | Criterion | Requirement | Measurement method | Pass threshold |
| :--- | :--- | :--- | :--- | :--- |
| AC-2.1 | The timer can be started only while the user is seated. | FR-6 | Inspection | Without a seat, the timer cannot be started |
| AC-2.2 | Each timer state offers only its legal actions: Idle offers Start; Running offers Pause and Finish; Paused offers Resume and Finish. | FR-6 (Design 2.4, 3.2) | Inspection of the timer controls in each state | No other action is available in that state |
| AC-2.3 | The stored active duration equals the elapsed time minus all paused time, manual and automatic. | FR-6 | Stopwatch lap times compared with `study_sessions.active_duration_sec` | Difference of 2 s or less |
| AC-2.4 | When the browser tab is hidden while the timer is running, the timer pauses and the other users see the status IDLE (PAUSED). | FR-7 (QA Plan TC-03) | Inspection on a second client | Within 1 s |
| AC-2.5 | When the tab becomes visible again, an automatically paused timer continues without any user action, and the status returns to STUDYING. | FR-7 (Design 3.2, step 3) | Inspection | The timer runs again without a click |
| AC-2.6 | A timer that the user paused manually stays paused when the tab is hidden and shown again, until the user presses Resume. | FR-6, FR-7 (Design 3.2, step 3) | Inspection, and the stored `paused_count` | The timer stays paused; the hidden time is not counted as an automatic pause |
| AC-2.7 | Every automatic pause, and only an automatic pause, increases the pause count. | FR-7 (Design 3.2, step 3) | `study_sessions.paused_count` | Equal to the number of automatic pauses |
| AC-2.8 | Finishing saves the session, shows the result (active time and earned points), and releases the user's seat. | FR-6, FR-16 (Design 3.2, steps 5 and 6) | Result dialog, second client, SQL | Result shown; one new session row; the seat is empty on the other clients |
| AC-2.9 | The server keeps the authoritative timer: the client never sends a duration or a point value. | NFR-2, risk R4 (Design 2.2, 3.2) | WebSocket frames sent by the client, read in DevTools | No timer frame contains a duration or a point value |
| AC-2.10 | Automated unit tests cover the timer calculation (state transitions, active duration, pause count) and pass. | NFR-8 | `npm test` output | Timer tests exist; 0 failures |

### 3.3 Scenario 3: Buy Items in Virtual Store (FR-10, FR-9, NFR-3)

| ID | Criterion | Requirement | Measurement method | Pass threshold |
| :--- | :--- | :--- | :--- | :--- |
| AC-3.1 | The store lists the catalogue with the name, cost, and tier of every item and can be filtered by furniture and clothing. | FR-10 (Design 2.4) | Inspection | 8 items; the filters show 5 furniture and 3 clothing items |
| AC-3.2 | Every item card shows the right state for the user: Buy, Owned, Tier N required, or Not enough points. The rules are checked in the order owned, tier, points. | FR-9, FR-10 (Design 2.4, 3.3) | Comparison with the expected table in AT-3 | All 8 cards as expected |
| AC-3.3 | Buying an unlocked item that the user can afford deducts exactly its cost and adds it to the inventory; a success message is shown and the points in the top bar are updated. Lifetime points and tier do not change. | FR-10, FR-9 | Screen; SQL on `users` and `inventory` | 500 − 300 = 200 points; lifetime points and tier unchanged; one inventory row |
| AC-3.4 | A purchase that costs more than the user's points is rejected with a message, and nothing changes. | FR-10 | Item card, a direct purchase request, SQL | Rejected; points and inventory unchanged |
| AC-3.5 | A purchase of an item whose tier is not unlocked is rejected even when the user has enough points, and nothing changes. | FR-9, FR-10 | Item card, a direct purchase request, SQL | Rejected; points and inventory unchanged |
| AC-3.6 | An owned item cannot be bought again. | FR-10 (Design 3.3) | Item card, a direct purchase request, SQL | The card shows Owned; the request is rejected; still one inventory row |
| AC-3.7 | Purchase requests sent at the same time never produce a negative balance or a duplicate item. | NFR-3 (QA Plan TC-05 and quality factor 3) | Two simultaneous requests; SQL | Exactly one request succeeds; points stay at 0 or more; no duplicate row |
| AC-3.8 | Invalid purchase input is rejected without changing any data. | NFR-3, FR-10 (Design 3.3) | Requests with a non-existent item id and with an SQL fragment as the item id | Both rejected; no data change; the store still has 8 items |
| AC-3.9 | Only a logged-in user can buy. | NFR-3 (Design 2.3) | Purchase request without the login credentials | Rejected; no data change |

### 3.4 Scenario 4: Calculate Points & Unlock Tiers (FR-8, FR-9, FR-16, NFR-2, NFR-8)

| ID | Criterion | Requirement | Measurement method | Pass threshold |
| :--- | :--- | :--- | :--- | :--- |
| AC-4.1 | A finished session of at least 15 active minutes gives 5 points per whole active minute, and both points and lifetime points increase by that amount. | FR-8 | Result dialog, top bar, SQL | 30 min gives +150; 15 min gives +75 |
| AC-4.2 | A finished session of less than 15 active minutes gives 0 points, the balances do not change, and the session is still saved. | FR-8, FR-16 | Result dialog, SQL | +0; balances unchanged; the session row is saved with `points_earned = 0` |
| AC-4.3 | The active time is rounded down to whole minutes before the points are calculated. | FR-8 (Design 2.2) | Sessions of 14 min 30 s and 15 min 30 s; unit tests of QA Plan TC-04 | 14 min 30 s gives 0 points; 15 min 30 s gives 75 points |
| AC-4.4 | The tier follows the lifetime points (Tier 1 = 0, Tier 2 = 200, Tier 3 = 1000, Tier 4 = 3000). Crossing 200 lifetime points shows a "Tier 2 unlocked" message and makes Tier 2 items purchasable. | FR-9 | Result dialog, top bar, item cards | Tier 1 at 150 lifetime points; Tier 2 at 225, with the unlock message once; an affordable Tier 2 item shows Buy |
| AC-4.5 | Spending points never lowers the tier. | FR-9 (Design 3.4) | A purchase after Tier 2 is reached; SQL | Points decrease; lifetime points and tier unchanged |
| AC-4.6 | Every finished session is stored with its user, active duration, date, pause count, and earned points. | FR-16 | SQL on `study_sessions` | 3 rows after 3 sessions, with the expected values |
| AC-4.7 | The points shown to the user are the values that the server calculated and stored. | NFR-2, risk R4 (Design 3.4) | Result dialog and top bar compared with SQL | Equal |
| AC-4.8 | Automated unit tests cover the point and tier rules, including the cases of QA Plan TC-04, and pass. | NFR-8 | `npm test` output | Tests exist for 14 min 59 s (0 points), 27 min 45 s (135 points), 30 min (150 points), and the tier thresholds; 0 failures |

## 4. Acceptance Tests

Each test is run from the start to the end without changing its steps. Expected texts such as "Tier 3 required" come from the wireframes in Design Document Section 2.4; a different wording with the same meaning passes.

### 4.1 AT-1: Interact in Library

| Field | Value |
| :--- | :--- |
| Scenario | 1: Use Case 1 (Observer Pattern) |
| Requirements | FR-3, FR-4, FR-5, NFR-1, NFR-3 |
| Criteria | AC-1.1 to AC-1.11 |
| Test users | `atest_reader_a` (A), `atest_reader_b` (B), `atest_reader_c` (C) |
| Preconditions | The three accounts are registered. A, B, and C use three Chrome profiles on the same computer, so that all frame times come from one clock. DevTools is open on the Network tab in all three windows **before** the library page is opened (DevTools records WebSocket frames only for connections opened while it is open). No test user is seated. |
| Estimated time | 30 minutes |

| Step | Action | Expected result | Criteria |
| :--- | :--- | :--- | :--- |
| 1 | Open a new private window and, without logging in, open the library page. | The library cannot be joined (for example, the login page is shown). A, B, and C do not see a new user. | AC-1.11 |
| 2 | A, B, and C log in and open the library. | Each client shows six tables with four seats each. Every seat shows the same state (empty or occupied) on the three clients. | AC-1.1 |
| 3 | A takes an empty seat at Table 1. | A's avatar appears on that seat with the status AVAILABLE on all three clients, and the seat is occupied. *Timing sample 1.* | AC-1.2, AC-1.3, AC-1.9 |
| 4 | B takes an empty seat at Table 2, the table next to Table 1. | B's avatar appears there with AVAILABLE on all clients; A and B see each other at adjacent tables. *Sample 2.* | AC-1.2, AC-1.3, AC-1.9 |
| 5 | C tries to take A's seat. | C cannot take it: the seat cannot be selected, or C is told that it is not available. A stays on the seat, and the views of A and B do not change. | AC-1.4 |
| 6 | C takes an empty seat at Table 2. | C's avatar appears with AVAILABLE on all clients. *Sample 3.* | AC-1.2, AC-1.3, AC-1.9 |
| 7 | A presses Start on the study timer. | A's status changes to STUDYING on B and C. *Sample 4.* | AC-1.2, AC-1.9 |
| 8 | A presses Pause. | A's status changes to IDLE (PAUSED) on B and C. *Sample 5.* | AC-1.2, AC-1.9 |
| 9 | A sends the text `Hello from A`, then an emoji reaction. | Both appear as chat bubbles above A's avatar on B and C. *Samples 6 and 7.* | AC-1.5, AC-1.9 |
| 10 | B sends the 140-character message of Appendix B.4. | It appears above B's avatar on A and C. *Sample 8.* | AC-1.5, AC-1.9 |
| 11 | B pastes the 141-character message of Appendix B.4 and tries to send it. | The message is not sent: the input stops at 140 characters, or an error is shown. Nothing new appears on A and C. | AC-1.6 |
| 12 | C sends `<script>alert('xss')</script>`. | A and B see the text exactly as typed; no dialog opens and no script runs. *Sample 9.* | AC-1.10, AC-1.9 |
| 13 | During the whole test, look at the library screen and the browser's address bar. | No voice or video controls exist, and the browser never asks for microphone or camera access. | AC-1.7 |
| 14 | C leaves the library. | C's seat becomes empty and C's avatar disappears on A and B. *Sample 10.* | AC-1.8, AC-1.9 |
| 15 | Calculate the 10 timing samples: for each sample, the time of the room update received by another client minus the time of the frame sent by the acting client (Appendix C.2). | Every sample is 200 ms or less. | AC-1.9 |

After the test, A finishes the timer and A and B leave the library; these actions are not checked.

### 4.2 AT-2: Manage Study Timer

| Field | Value |
| :--- | :--- |
| Scenario | 2: Use Case 2 (State Pattern) |
| Requirements | FR-6, FR-7, NFR-2, NFR-8 (and FR-16 through AC-2.8) |
| Criteria | AC-2.1 to AC-2.10 |
| Test users | `atest_timer` (T), `atest_observer` (O) |
| Preconditions | Both accounts are registered and logged in, and both have the library open. O is seated; T is not. In T's window, DevTools was opened on the Network tab before the library page was opened. A stopwatch with lap times is ready. T has no saved sessions (new account). |
| Planned timeline | Running 0:00 to 6:00, automatic pause 6:00 to 8:00, running 8:00 to 13:00, manual pause 13:00 to 15:00, running 15:00 to 20:00. Elapsed time 20 min, paused time 4 min, active time 16 min (960 s), one automatic pause. |
| Estimated time | 25 minutes |

| Step | Action | Expected result | Criteria |
| :--- | :--- | :--- | :--- |
| 1 | T, who is not seated, tries to start the timer. | The timer cannot be started (Start is not available, or T is asked to take a seat first). | AC-2.1 |
| 2 | T takes an empty seat. | The timer is Idle and offers only Start. O sees T with the status AVAILABLE. | AC-2.2 |
| 3 | T presses Start and starts the stopwatch at the same moment (0:00). | The timer is Running and offers only Pause and Finish. O sees T as STUDYING. | AC-2.2 |
| 4 | At 6:00, T switches to another browser tab (lap). | Within 1 s, O sees T as IDLE (PAUSED). | AC-2.4 |
| 5 | At 8:00, T returns to the StudyLoft tab (lap). | Without any click, T's timer is Running again, and O sees STUDYING. | AC-2.5 |
| 6 | At 13:00, T presses Pause (lap). | The timer is Paused and offers only Resume and Finish. O sees IDLE (PAUSED). | AC-2.2 |
| 7 | At 14:00, T switches to another tab; at 14:30, T returns. | The timer is still Paused; it does not continue on its own. | AC-2.6 |
| 8 | At 15:00, T presses Resume (lap). | The timer is Running; O sees STUDYING. | AC-2.2 |
| 9 | At 20:00, T presses Finish (lap). | A result dialog shows an active time of 16 min and +80 points. On O's screen, T's seat becomes empty. | AC-2.8, AC-4.1 |
| 10 | In T's DevTools, open the timer frames that T sent (start, automatic pause, resume, pause, finish). | No frame contains a duration or a point value. | AC-2.9 |
| 11 | Run the session query of Appendix B.3 for `atest_timer`. | One row: `active_duration_sec` equals the active time from the laps ± 2 s (planned 960 s), `paused_count` = 1, `points_earned` = 80. | AC-2.3, AC-2.6, AC-2.7, AC-2.8, AC-4.1, AC-4.6 |
| 12 | Run `npm test` in the `server` folder of the tested commit and save the output. | The timer unit tests (state transitions, active duration, pause count) run and pass. | AC-2.10 |

The active time from the laps is (lap 4 − 0:00) + (lap 6 − lap 5) + (lap 9 − lap 8). The tester records the actual lap times, not the planned ones.

### 4.3 AT-3: Buy Items in Virtual Store

| Field | Value |
| :--- | :--- |
| Scenario | 3: Use Case 3 (Factory Pattern) |
| Requirements | FR-10, FR-9, NFR-3 |
| Criteria | AC-3.1 to AC-3.9 |
| Test users | `atest_buyer_a` (A): 500 points, 500 lifetime points (Tier 2)<br>`atest_buyer_b` (B): 100 points, 500 lifetime points (Tier 2)<br>`atest_buyer_c` (C): 950 points, 950 lifetime points (Tier 2)<br>`atest_buyer_d` (D) and `atest_buyer_e` (E): 150 points, 150 lifetime points (Tier 1) |
| Preconditions | The accounts are registered, their balances are set with Appendix B.2, and they own no items. The item ids are read with Appendix B.3. Direct purchase requests are sent as described in Appendix B.5. |
| Estimated time | 30 minutes |

The balances are chosen so that each rule is checked on its own: A repeats the FR-10 verification (500 points, 300-point desk), B has too few points for an unlocked item, C has enough points for a locked item, and D and E test simultaneous purchases.

**Expected item cards for A** (from `seed.sql` and the rules of AC-3.2):

| Item | Type | Cost | Tier | Before step 3 | After step 3 |
| :--- | :--- | ---: | ---: | :--- | :--- |
| Floor lamp | furniture | 80 | 1 | Buy | Buy |
| Bookshelf | furniture | 120 | 1 | Buy | Buy |
| Wooden desk | furniture | 300 | 2 | Buy | Owned |
| Armchair | furniture | 450 | 2 | Buy | Not enough points |
| Grand piano | furniture | 3000 | 4 | Tier 4 required | Tier 4 required |
| Hoodie | clothing | 60 | 1 | Buy | Buy |
| Sneakers | clothing | 200 | 2 | Buy | Buy (cost equal to the points) |
| Winter coat | clothing | 900 | 3 | Tier 3 required | Tier 3 required |

| Step | Action | Expected result | Criteria |
| :--- | :--- | :--- | :--- |
| 1 | A opens the store, then selects the Furniture filter and the Clothing filter. | 8 items with name, cost, and tier; 5 furniture and 3 clothing items. The top bar shows 500 points and Tier 2; the tier bar shows 500 / 1000 lifetime points to Tier 3. | AC-3.1 |
| 2 | A checks every item card. | The cards match the "Before step 3" column. | AC-3.2 |
| 3 | A buys the Wooden desk. | A success message is shown (for example "Purchased: Wooden desk"). The top bar shows 200 points and Tier 2. The cards match the "After step 3" column. SQL (B.3): 200 points, 500 lifetime points, one inventory row for the Wooden desk. | AC-3.2, AC-3.3, AC-3.6, AC-4.5 |
| 4 | Send a direct purchase request for the Wooden desk as A. | The request is rejected with an error. SQL: still 200 points and one Wooden desk row. | AC-3.6 |
| 5 | B opens the store and checks the Wooden desk card. Then a direct purchase request for the Wooden desk is sent as B. | The card shows Not enough points. The request is rejected with a message. SQL: B still has 100 points and 500 lifetime points and owns nothing. | AC-3.4 |
| 6 | C opens the store and checks the Winter coat card. Then a direct purchase request for the Winter coat is sent as C. | The card shows Tier 3 required, although C has 950 points. The request is rejected (QA Plan TC-05 expects `403 Forbidden` for a locked tier). SQL: C still has 950 points and 950 lifetime points and owns nothing. | AC-3.5 |
| 7 | Send two purchase requests for the Bookshelf as D at the same time. | Exactly one request succeeds. SQL: D has 30 points, 150 lifetime points, and exactly one Bookshelf row. | AC-3.7 |
| 8 | Send a purchase request for the Floor lamp and one for the Bookshelf as E at the same time. | Exactly one request succeeds, because together they cost 200 points. SQL: E has 70 or 30 points (never below 0) and one inventory row. | AC-3.7 |
| 9 | As A, send one purchase request with the item id `9999` and one with the item id `"1 OR 1=1"`. | Both requests are rejected with an error. SQL: A is unchanged (200 points, one row), and `items` still has 8 rows. | AC-3.8 |
| 10 | Send a purchase request for the Hoodie without the login credentials. | The request is rejected; no test account changes. | AC-3.9 |

### 4.4 AT-4: Calculate Points & Unlock Tiers

| Field | Value |
| :--- | :--- |
| Scenario | 4: Use Case 4 (Strategy Pattern) |
| Requirements | FR-8, FR-9, FR-16, NFR-2, NFR-8 |
| Criteria | AC-4.1 to AC-4.8 |
| Test user | `atest_scholar` (S): new account with 0 points and 0 lifetime points (Tier 1) |
| Preconditions | S is registered, logged in, and has the library open. A stopwatch is ready. |
| Session plan | The three sessions of the example in Design Document Section 3.4 (Concept Notes Scenario 1): 30, 14, and 15 active minutes. Each target time has 30 s of margin, so that small stopwatch errors cannot change the whole number of minutes. |
| Estimated time | 75 minutes. AT-4 can run at the same time as AT-1 and AT-3, which use other accounts. |

| Step | Action | Expected result | Criteria |
| :--- | :--- | :--- | :--- |
| 1 | Session 1: S takes an empty seat and presses Start. At 20:00 S presses Pause, at 25:00 Resume, and at 35:30 Finish (active time 30 min 30 s). | The result shows an active time of 30 min and +150 points, without a tier message. Top bar: 150 points, Tier 1. | AC-4.1, AC-4.3, AC-4.4 |
| 2 | Session 2: S takes an empty seat again (the seat was released at the finish), presses Start, and at 14:30 presses Finish. | The result shows an active time of 14 min and +0 points, with a note that at least 15 active minutes are needed. Top bar: 150 points, Tier 1. | AC-4.2, AC-4.3 |
| 3 | Session 3: S takes an empty seat, presses Start, and at 15:30 presses Finish. | The result shows an active time of 15 min, +75 points, and "Tier 2 unlocked". Top bar: 225 points, Tier 2. | AC-4.1, AC-4.3, AC-4.4 |
| 4 | Run the balance and session queries of Appendix B.3 for `atest_scholar`. | `users`: 225 points and 225 lifetime points. `study_sessions`: three rows in this order, as (`active_duration_sec`, `paused_count`, `points_earned`): (1830 ± 2, 0, 150), (870 ± 2, 0, 0), (930 ± 2, 0, 75), all with today's date. The values equal those shown in steps 1 to 3. | AC-2.7, AC-4.2, AC-4.6, AC-4.7 |
| 5 | S opens the store. | The tier bar shows Tier 2 and 225 / 1000 lifetime points to Tier 3. Sneakers (200 points, Tier 2) shows Buy; Wooden desk (300 points, Tier 2) shows Not enough points; Winter coat (Tier 3) shows Tier 3 required. | AC-3.2, AC-4.4 |
| 6 | S buys the Sneakers. | Top bar: 25 points and Tier 2. SQL: 25 points and 225 lifetime points. | AC-4.5 |
| 7 | Run `npm test` in the `server` folder of the tested commit and save the output. | `tests/points/points.test.ts` passes and contains the TC-04 cases (14 min 59 s gives 0 points, 27 min 45 s gives 135 points, 30 min gives 150 points) and the tier thresholds. 0 failures. | AC-4.3, AC-4.8 |

The pause in session 1 is a manual pause, so `paused_count` stays 0 (AC-2.7).

## 5. Correspondence Between Tests and Criteria

The matrix shows which steps of each test check each criterion. Every criterion is checked by at least one step.

| Criterion | AT-1 steps | AT-2 steps | AT-3 steps | AT-4 steps |
| :--- | :--- | :--- | :--- | :--- |
| AC-1.1 | 2 | | | |
| AC-1.2 | 3, 4, 6, 7, 8 | | | |
| AC-1.3 | 3, 4, 6 | | | |
| AC-1.4 | 5 | | | |
| AC-1.5 | 9, 10 | | | |
| AC-1.6 | 11 | | | |
| AC-1.7 | 13 | | | |
| AC-1.8 | 14 | | | |
| AC-1.9 | 3, 4, 6, 7, 8, 9, 10, 12, 14, 15 | | | |
| AC-1.10 | 12 | | | |
| AC-1.11 | 1 | | | |
| AC-2.1 | | 1 | | |
| AC-2.2 | | 2, 3, 6, 8 | | |
| AC-2.3 | | 11 | | |
| AC-2.4 | | 4 | | |
| AC-2.5 | | 5 | | |
| AC-2.6 | | 7, 11 | | |
| AC-2.7 | | 11 | | 4 |
| AC-2.8 | | 9, 11 | | |
| AC-2.9 | | 10 | | |
| AC-2.10 | | 12 | | |
| AC-3.1 | | | 1 | |
| AC-3.2 | | | 2, 3 | 5 |
| AC-3.3 | | | 3 | |
| AC-3.4 | | | 5 | |
| AC-3.5 | | | 6 | |
| AC-3.6 | | | 3, 4 | |
| AC-3.7 | | | 7, 8 | |
| AC-3.8 | | | 9 | |
| AC-3.9 | | | 10 | |
| AC-4.1 | | 9, 11 | | 1, 3 |
| AC-4.2 | | | | 2, 4 |
| AC-4.3 | | | | 1, 2, 3, 7 |
| AC-4.4 | | | | 1, 3, 5 |
| AC-4.5 | | | 3 | 6 |
| AC-4.6 | | 11 | | 4 |
| AC-4.7 | | | | 4 |
| AC-4.8 | | | | 7 |

**How AT-1 corresponds to its criteria.** AT-1 follows the library flow of Design Document Section 3.1 (join, take a seat, chat, leave) with three users, as the verification of FR-3 requires. Each rule of FR-4 and FR-5 is checked with an allowed and a rejected case: an empty and an occupied seat (steps 3 and 5), a 140-character and a 141-character message (steps 10 and 11). The three statuses of FR-3 are produced by the timer (steps 3, 7, 8). Ten room updates of different kinds are timed for NFR-1 (AC-1.9), and NFR-3 is checked by an unauthenticated visit (step 1) and an XSS message (step 12).

**How AT-2 corresponds to its criteria.** The planned timeline contains one automatic and one manual pause, so the expected active time (16 min) and pause count (1) are known before the test. A second user observes every status change (AC-2.4, AC-2.5). The lap times are compared with the stored row within the ±2 s of FR-6 (AC-2.3). Step 7 separates manual from automatic pauses (AC-2.6, AC-2.7). The sent WebSocket frames show that the client never sends a duration (AC-2.9, NFR-2), and `npm test` shows the timer unit tests of NFR-8 (AC-2.10).

**How AT-3 corresponds to its criteria.** The five accounts isolate the purchase rules: A repeats the FR-10 verification and also meets the boundary "cost equal to points" (Sneakers after step 3); B is rejected only for points (AC-3.4); C is rejected only for the tier (AC-3.5); D and E produce the two possible race conditions of the NFR-3 metric, a duplicate item and a negative balance (AC-3.7). The direct requests check that the server enforces the rules and not only the disabled buttons (AC-3.4 to AC-3.9).

**How AT-4 corresponds to its criteria.** AT-4 repeats the example of Design Document Section 3.4, so its expected values (150, 0, 75 points; Tier 2 at 225 lifetime points) are already documented. The sessions cover both sides of the 15-minute threshold and the rounding rule (AC-4.1 to AC-4.3), the tier crossing (AC-4.4), and a purchase after the crossing (AC-4.5). The SQL check of step 4 shows that every session is stored (FR-16) and that the shown values are the stored values (AC-4.7), and `npm test` covers the cases of TC-04 (AC-4.8).

## 6. Requirements Verified Outside the Acceptance Tests

| Requirement or part | Reason it is not in AT-1 to AT-4 | Where it is verified | When |
| :--- | :--- | :--- | :--- |
| NFR-1 with 50 concurrent users (95% of messages within 200 ms) | Needs 50 simulated clients; AT-1 checks the same limit with three users | QA Plan TC-09 (Artillery or k6) | P5 |
| NFR-5 (100 concurrent connections, several server instances) | Needs a load test and a design review | QA Plan TC-09 | P5 |
| FR-15 and the reconnection part of NFR-2 (at most 5 s of progress lost, reconnection within 30 s) | Reconnection (FR-15) is not one of the four scenarios | QA Plan TC-10 | P5 |
| NFR-3: salted password hashes and HTTPS/WSS | Belong to registration (FR-1) and to the deployment | QA Plan TC-01; Deployment Plan | Sprint 1 and deployment |
| NFR-6 (at least 80% of at least 8 students register and start a session within 3 minutes) | Needs a user study | QA Plan quality factor 4 | P5 |
| NFR-7 in Firefox, Edge, and Safari | AT-1 to AT-4 run in Chrome | Manual browser checklist | P5 |
| FR-16: viewing the session history | The history is shown on the dashboard, which is not one of the four scenarios | `GET /api/sessions` and the dashboard | Sprint 2 |
| FR-1 | Precondition of every test | QA Plan TC-01 | Sprint 1 |
| FR-2, FR-11 to FR-14, NFR-4 | Not part of the four demo scenarios | QA Plan TC-06, TC-08, and later tests | Sprint 2 and P5 |

P5 is the Testing and Stabilization phase of the Project Plan (06/12/2026 to 16/12/2026).

---

## Appendix A: Traceability Matrix

Requirement → design element → implementation → acceptance criteria → acceptance test → other tests. The implementation column shows the state on 21/11/2026; task numbers refer to the Sprint 1 plan. Code paths are under `server/src/`, and the test files under `server/tests/`.

| Requirement | Design element (Design Document) | Implementation | Acceptance criteria | Acceptance test | Other tests |
| :--- | :--- | :--- | :--- | :--- | :--- |
| FR-3 | 3.1: `LibraryRoom`, `RoomObserver`, `room:state` | Planned: tasks 5, 7, 8, 10, 16 | AC-1.1, AC-1.2, AC-1.8 | AT-1 | TC-02 |
| FR-4 | 3.1: `seat:take` | Planned: tasks 5, 10 | AC-1.3, AC-1.4 | AT-1 | TC-02 |
| FR-5 | 3.1: `receiveMessage()`, `chat:message`, `chat:emoji`, `chat:new` | Planned: task 14 | AC-1.5, AC-1.6, AC-1.7 | AT-1 | TC-07 |
| FR-6 | 3.2: `StudyTimer`, `IdleState`, `RunningState`, `PausedState`, `getActiveDuration()` | Planned: task 13 | AC-2.1, AC-2.2, AC-2.3, AC-2.6, AC-2.8 | AT-2 | TC-03, TC-04 |
| FR-7 | 3.2: `timer:autoPause`, `pausedCount` | Planned: tasks 12, 13. Implemented: `study_sessions.paused_count` (task 4) | AC-2.4, AC-2.5, AC-2.6, AC-2.7 | AT-2 | TC-03 |
| FR-8 | 3.4: `PointService`, `StandardPointStrategy`, `StudySession.getActiveMinutes()` | Implemented: `points/`, `models/` | AC-4.1, AC-4.2, AC-4.3 | AT-4 | TC-04; `points.test.ts` |
| FR-9 | 3.4: `TierPolicy`; 3.3: tier check in `canPurchase()` | Implemented: `points/TierPolicy.ts`, `store/StoreService.ts` (task 18) | AC-3.2, AC-3.5, AC-4.4, AC-4.5 | AT-3, AT-4 | TC-05; `points.test.ts`, `store.test.ts` |
| FR-10 | 3.3: `StoreService`, `ItemFactory`, `StoreItem`, `Inventory`; `GET /api/store/items`, `POST /api/store/buy` | Implemented: `store/` (task 18); `items` and `inventory` tables and seed data (tasks 4, 21). Planned: `buyItem()` and the endpoints (task 19) | AC-3.1 to AC-3.9 | AT-3 | TC-05; `store.test.ts` |
| FR-16 | 3.4, step 7: the session is saved with its points | Implemented: `study_sessions` table (task 4), `PgSessionRepository.saveFinishedSession()` (task 15) | AC-2.8, AC-4.2, AC-4.6 | AT-2, AT-4 | TC-04; `sessionRepository.test.ts`, `sessionRepository.db.test.ts` |
| NFR-1 | 3.1: the Observer pushes every change; no polling | Planned: tasks 10, 16 | AC-1.9 | AT-1 | TC-02, TC-09 |
| NFR-2 | 2.2, 3.2: the server keeps the authoritative timer | Planned: task 13 | AC-2.9, AC-4.7 | AT-2, AT-4 | TC-10 |
| NFR-3 | 2.3: authenticated REST and WebSocket; 3.3: purchase in one transaction | Implemented: database constraints (task 4), parameterized queries (task 15). Planned: authentication (task 11), chat input checks (task 14), purchase transaction (task 19) | AC-1.10, AC-1.11, AC-3.7, AC-3.8, AC-3.9 | AT-1, AT-3 | TC-01, TC-05, TC-07; `sessionRepository.db.test.ts` |
| NFR-8 | 2.2: business logic covered by unit tests | Implemented: 49 automated tests for points, store, and sessions (5 of them need `TEST_DATABASE_URL`). Planned: CI (task 6), timer tests (task 13) | AC-2.10, AC-4.8 | AT-2, AT-4 | `npm test` |

## Appendix B: Test Data and SQL Checks

### B.1 Test accounts
All accounts are registered through the application with the e-mail address `<username>@example.com`.

| Username | Test | Starting points / lifetime points | Set by |
| :--- | :--- | :--- | :--- |
| `atest_reader_a`, `atest_reader_b`, `atest_reader_c` | AT-1 | 0 / 0 | Registration |
| `atest_timer`, `atest_observer` | AT-2 | 0 / 0 | Registration |
| `atest_buyer_a` | AT-3 | 500 / 500 | B.2 |
| `atest_buyer_b` | AT-3 | 100 / 500 | B.2 |
| `atest_buyer_c` | AT-3 | 950 / 950 | B.2 |
| `atest_buyer_d`, `atest_buyer_e` | AT-3 | 150 / 150 | B.2 |
| `atest_scholar` | AT-4 | 0 / 0 | Registration |

### B.2 Setting the starting balances
Run after the accounts are registered. The database does not accept more points than lifetime points.

```sql
UPDATE users SET points = 500, lifetime_points = 500 WHERE username = 'atest_buyer_a';
UPDATE users SET points = 100, lifetime_points = 500 WHERE username = 'atest_buyer_b';
UPDATE users SET points = 950, lifetime_points = 950 WHERE username = 'atest_buyer_c';
UPDATE users SET points = 150, lifetime_points = 150 WHERE username IN ('atest_buyer_d', 'atest_buyer_e');
```

### B.3 Checks

```sql
-- Store catalogue and item ids (8 rows)
SELECT item_id, name, item_type, cost, tier FROM items ORDER BY item_id;

-- Balances of the test accounts
SELECT username, points, lifetime_points
  FROM users
 WHERE username LIKE 'atest\_%'
 ORDER BY username;

-- Items owned by the test accounts
SELECT u.username, i.name, v.acquired_at
  FROM inventory v
  JOIN users u ON u.user_id = v.user_id
  JOIN items i ON i.item_id = v.item_id
 WHERE u.username LIKE 'atest\_%'
 ORDER BY u.username, i.name;

-- Sessions of one test account (replace the username)
SELECT s.session_id, s.active_duration_sec, s.paused_count, s.points_earned, s.finished_at
  FROM study_sessions s
  JOIN users u ON u.user_id = s.user_id
 WHERE u.username = 'atest_timer'
 ORDER BY s.session_id;
```

After the test run, the test accounts can be removed; their sessions and items are deleted with them:

```sql
DELETE FROM users WHERE username LIKE 'atest\_%';
```

### B.4 Chat messages for AT-1
140 characters (the digits 1 to 0 written 14 times):

```text
12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
```

141 characters (the same with one more digit):

```text
123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901
```

Script text: `<script>alert('xss')</script>`

### B.5 Direct purchase requests
Direct requests show that the server checks the purchase rules itself, also when the client does not offer the Buy button.

1. In the Chrome profile of the user, open DevTools on the Network tab and reload the store page.
2. Right-click the request to `/api/store/items` and choose Copy → Copy as cURL. Paste it into a terminal; it contains the user's login credentials.
3. Change the path `/api/store/items` to `/api/store/buy` and add the following at the end of the command (use the item id from B.3):

   ```bash
   -X POST -H 'Content-Type: application/json' --data '{"itemId": 3}'
   ```

4. For two requests at the same time (macOS or Linux terminal), write both commands on one line, each followed by `&`, and end the line with `wait`:

   ```bash
   curl ... --data '{"itemId": 2}' & curl ... --data '{"itemId": 2}' & wait
   ```

5. For a request without login, delete the part of the command that carries the login (the `authorization` header or the cookie).

## Appendix C: Result Recording Template

### C.1 Steps
For every run, the tester also writes down the date, the tester names, the tested commit, the demo address, and the Chrome version.

| Test | Step | Expected result (short) | Observed result | Pass / Fail | Evidence | Issue |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| AT-3 | 3 | 500 → 200 points; Wooden desk owned | | | Screenshot, SQL output | |

### C.2 Timing samples (AT-1)

| Sample | Step | Sent by, time | Received by, time | Latency (ms) |
| :--- | :--- | :--- | :--- | ---: |
| 1 | 3 | A, hh:mm:ss.mmm | B, hh:mm:ss.mmm | |

### C.3 Lap times (AT-2 and AT-4)

| Test | Session | Action | Planned time | Lap time |
| :--- | :--- | :--- | :--- | :--- |
| AT-2 | 1 | Tab hidden | 6:00 | |
