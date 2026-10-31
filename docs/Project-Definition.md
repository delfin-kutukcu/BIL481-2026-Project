# Project Definition Document

**BIL 481 Software Engineering - Project Assignment 1 (Fall 2026)**  
**Group:** DINC | **Finalization date:** 01-11-2026  
**Contributors to this document:** Delfin Kütükçü, Işıkalp Karakaş, Nildeniz Efe, Nadide Zeynep Dedeoğlu, Çınar Aktaş

## Table of Contents
1. [Project Name](#1-project-name)
2. [Project Summary](#2-project-summary)
3. [Objectives](#3-objectives)
4. [Scope](#4-scope)
5. [Target Audience](#5-target-audience)
6. [Key Features](#6-key-features)
7. [Deliverables](#7-deliverables)
8. [Budget and Resources](#8-budget-and-resources)
9. [Risks and Mitigation Strategies](#9-risks-and-mitigation-strategies)
10. [Project Success Criteria](#10-project-success-criteria)
11. [Document-Specific Task Matrix](#11-document-specific-task-matrix)

---

## 1. Project Name
**Study Loft (Group DINC)**  
The name combines "study" with "loft": a cozy apartment-style space that students decorate and return to while studying together.

## 2. Project Summary
StudyLoft is a multiplayer virtual apartment study platform that keeps students accountable. Users appear as real-time avatars in a shared ground-floor virtual library, sit at tables next to each other, and run an integrated study timer while they work. Communication is limited to text and emojis; voice and video are intentionally excluded so that the platform supports focus instead of distraction.

The project addresses a common problem: students often struggle with motivation, isolation, and consistency during long study sessions. StudyLoft combines the "body-doubling" effect of studying next to others with light gamification. Completed study sessions earn points, and points are spent in a virtual store on tiered furniture and clothing. Users use these items to decorate their own apartment floor. A dashboard with weekly charts, habit reports, and a leaderboard helps users see their progress over time.

## 3. Objectives
By the end of the project we want to:
* **01.** Deliver a working real-time virtual library where multiple users can see each other's avatars and statuses and interact through text and emojis.
* **02.** Implement a study timer that measures only active study time and pauses automatically when the user leaves the browser tab (anti-cheat).
* **03.** Implement a points and tiered reward system that converts completed study time into spendable points and unlocks progressively rarer items.
* **04.** Provide a virtual store and a personal apartment decorator in which users can buy, place, arrange, and save items.
* **05.** Provide a productivity dashboard with weekly study charts, habit reports, and a leaderboard.
* **06.** Keep real-time synchronization responsive and robust, including automatic recovery of dropped WebSocket connections.
* **07.** Practice professional software engineering: documented requirements, a project plan, traceable individual contributions on GitHub, and tested code.

## 4. Scope

### 4.1 Included
* Web application (desktop browsers) with user registration, login, and session management.
* Ground-floor virtual library with tables, seats, avatar presence, and text/emoji interaction.
* Study timer with anti-cheat auto-pause and session history.
* Gamification engine: point calculation, tiered unlocks, virtual store.
* Personal apartment floor with drag-and-drop item placement and saved layouts.
* Analytics dashboard: weekly charts, weekly habit report, global leaderboard (including AI-generated insight text through the Gemini API).
* Automatic reconnection with state re-synchronization after network drops.

### 4.2 Not Included
* Voice chat, video chat, or screen sharing.
* Native mobile applications (the web UI is desktop-first).
* Real-money purchases or any payment system; points cannot be bought.
* Visiting or interacting inside other users' personal apartments (only the shared library is multiplayer).
* Multiple library floors, private study rooms, or user-created rooms.
* Content moderation tooling beyond basic message length limits and a profanity filter.
* Offline mode.

## 5. Target Audience
* High school students preparing for exams who need consistency and motivation.
* University students who study alone for long periods (e.g., during exam weeks or thesis work).
* Study groups who want a shared, distraction-free place to study at the same time.

## 6. Key Features
1. **Real-time multiplayer virtual library:** shared tables, seats, live avatar presence and status.
2. **Text and emoji interaction:** chat bubbles and emoji reactions between nearby users.
3. **Integrated study timer with anti-cheat:** counts active study time and auto-pauses on tab switch or minimize.
4. **Points and tiered rewards:** points from completed sessions; higher tiers unlock rarer furniture.
5. **Virtual store:** redeem points for furniture and clothing.
6. **Personal apartment decorator:** drag-and-drop placement of owned items and persistent layouts.
7. **Analytics dashboard:** weekly study charts, habit tracking reports, and a leaderboard.
8. **Connection recovery:** automatic WebSocket reconnect with exponential backoff and state re-sync.

## 7. Deliverables

| # | Deliverable | Description |
| :--- | :--- | :--- |
| **D1** | Concept Notes | Initial proposal from Assignment 0 (kept in docs/). |
| **D2** | Project Definition Document | This document. |
| **D3** | Requirements Document | Functional and non-functional requirements. |
| **D4** | Project Plan Document | Phases, timeline, effort estimates, task assignments. |
| **D5** | Design documentation | Architecture, data model, UI wireframes. |
| **D6** | StudyLoft web application | Frontend (React), backend (Node.js + Socket.io), PostgreSQL database. |
| **D7** | Test suite and test report | Unit, integration, and load-test results. |
| **D8** | Deployed demo and final doc | Running instance, user guide, final report. |

## 8. Budget and Resources
**Team (5 members):** Delfin Kütükçü, Işıkalp Karakaş, Nildeniz Efe, Nadide Zeynep Dedeoğlu, Çınar Aktaş. Estimated total effort is about 540 person-hours (see the Project Plan Document).

**Software tools:**
| Area | Tool |
| :--- | :--- |
| **Frontend** | React, a charting library, HTML5 canvas or a 2D grid renderer |
| **Backend** | Node.js, Socket.io |
| **Database** | PostgreSQL |
| **AI insights** | Gemini API |
| **Version control** | Git, GitHub (individual accounts, one shared repository) |
| **Documentation** | Markdown in the repository, exported to PDF; Google Drive |
| **Communication** | Instant messaging group and weekly meetings |
| **Testing** | Jest (or equivalent) for unit tests, a WebSocket load-testing tool |

* **Hardware:** Members' own laptops. No special hardware is needed.
* **Learning resources:** Official documentation for React, Socket.io, PostgreSQL, and the Gemini API; course materials; tutorials on real-time web applications.
* **Time:** About 13 weeks of the semester and winter-break buffer, at roughly 8-10 hours per member per week.
* **Budget:** The project is intended to run at near-zero cost: free tiers of cloud hosting, a managed PostgreSQL instance, and the Gemini API are used where available. We will limit API calls (for example, one insight request per user per week) to stay inside free quotas. Any paid service will be agreed on by the whole group before use.

## 9. Risks and Mitigation Strategies

| # | Risk | Likelihood / Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| **R1** | Real-time synchronization is harder than expected (latency, state conflicts). | Medium / High | Prototype the WebSocket layer first; keep the server authoritative for timers and presence; test early. |
| **R2** | Team members have uneven experience with React, Socket.io, or PostgreSQL. | Medium / Medium | Pair each requirement owner with a supporting member; short knowledge-sharing sessions. |
| **R3** | Scope creep (extra items, rooms, social features). | High / Medium | Keep the scope list above as the baseline; handle new ideas through the change-management process. |
| **R4** | Cheating on the study timer (e.g., scripts, multiple tabs). | Medium / Medium | Server-side validation of session length and tab-visibility events; cap points per day. |
| **R5** | Free-tier hosting or API limits are exceeded. | Medium / Medium | Cache insights, rate-limit Gemini calls, keep a local run option for the demo. |
| **R6** | A team member becomes unavailable (illness, exam load). | Medium / High | Shared repository and documents, backup owner for each feature, weekly status check. |
| **R7** | Security or privacy issues (weak authentication, leaked data). | Low / High | Hash passwords, use HTTPS/WSS, authenticate every socket connection, store minimal data. |
| **R8** | Integration problems late in the project. | Medium / High | Continuous integration through small pull requests; integration milestone at the end of each sprint. |

## 10. Project Success Criteria
1. **Feature completeness:** all 8 key features in Section 6 are implemented and demonstrated end to end (library timer points → store decorator → dashboard).
2. **Real-time performance:** in a load test with at least 50 simulated concurrent users, at least 95% of real-time updates (avatar state, chat) reach other clients within 200 ms.
3. **Reliability:** after a simulated network drop, the client reconnects and restores its state automatically within 30 seconds in at least 9 of 10 test runs.
4. **Usability:** in a small user test (at least 8 students), at least 80% start a first study session within 3 minutes without help.
5. **Quality and traceability:** all functional requirements have at least one passing test or documented manual test, and every team member has visible commits on GitHub.

## 11. Document-Specific Task Matrix

| Task | Responsible member |
| :--- | :--- |
| Project summary and objectives | Delfin Kütükçü |
| Scope (included / not included) and target audience | Nildeniz Efe |
| Key features and deliverables | Nadide Zeynep Dedeoğlu |
| Budget and resources; risks and mitigation | Çınar Aktaş |
| Success criteria, consistency review with Concept Notes, PDF export | Işıkalp Karakaş |
