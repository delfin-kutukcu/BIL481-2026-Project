# Project Plan Document

**BIL 481 Software Engineering - Project Assignment 1 (Fall 2026)**  
**Group:** DINC | **Finalization date:** 01-11-2026  
**Contributors to this document:** Delfin Kütükçü, Işıkalp Karakaş, Nildeniz Efe, Nadide Zeynep Dedeoğlu, Çınar Aktaş

## Table of Contents
1. [Project Scope](#1-project-scope)
2. [Project Organization - People](#2-project-organization---people)
3. [Objectives](#3-objectives)
4. [Key Phases and Timeline](#4-key-phases-and-timeline)
5. [Resource Planning](#5-resource-planning)
6. [Risk Management](#6-risk-management)
7. [Communication Plan](#7-communication-plan)
8. [Change Management Plan](#8-change-management-plan)
9. [Budget Plan](#9-budget-plan)
10. [Effort Estimation](#10-effort-estimation)
11. [Task Assignments](#11-task-assignments)
12. [Document-Specific Task Matrix](#12-document-specific-task-matrix)

---

## 1. Project Scope
**Included.** A desktop-first web application, StudyLoft, with: user accounts; a real-time multiplayer ground-floor library with avatars and text/emoji interaction; a study timer with anti-cheat auto-pause; points, tiered rewards, and a virtual store; a personal apartment decorator; an analytics dashboard with weekly charts, habit reports, and a leaderboard; and automatic connection recovery. The project also includes all project documents, tests, and a deployed demo.

**Not included.** Voice/video chat, native mobile apps, real-money payments, visiting other users' apartments, multiple library floors or private rooms, advanced moderation tools, and offline mode.

The detailed scope and the list of key features are in the Project Definition Document; the requirements are in the Requirements Document.

## 2. Project Organization - People

| Member | Main role(s) | Responsibilities |
| :--- | :--- | :--- |
| **Delfin Kütükçü** | Project Manager; Real-time (WebSocket) Developer | Planning and tracking, meeting facilitation, system architecture of the real-time server, library presence, reconnection logic. |
| **Işıkalp Karakaş** | Requirements Analyst; Backend and Database Developer | Requirements maintenance, authentication, database schema, points/tier logic, session history. |
| **Nildeniz Efe** | UI/UX Designer; Frontend Developer | Wireframes and visual design, avatar customization, apartment decorator UI, usability testing. |
| **Nadide Zeynep Dedeoğlu** | Frontend and Analytics Developer | Timer and anti-cheat on the client, dashboard charts, habit report, Gemini insight integration. |
| **Çınar Aktaş** | Tester / QA; Full-stack Developer | Test plan and automation, chat and emoji, store, leaderboard, deployment support. |

Every member also takes part in code reviews and in the weekly meeting. Decisions are made by group consensus; the Project Manager breaks ties.

## 3. Objectives
Objectives for project execution and management:
1. Deliver the three Assignment 1 documents on time (by 1 November 2026) with every member contributing.
2. Complete the architecture and UI design before development starts (by 15 November 2026).
3. Complete the core application (accounts, library, timer, real-time sync) by 29 November 2026 and all features by 5 December 2026.
4. Keep the effort spread balanced: no member more than 15% above or below the average planned effort.
5. Merge all changes through reviewed pull requests, with a clear commit history for every member.
6. Hold a weekly status meeting and record decisions and actions in the repository.
7. Finish testing and stabilization by 16 December 2026, close the project on 27 December 2026, and hold the retrospective on 28 December 2026.

## 4. Key Phases and Timeline
The dates for Phase 1 are fixed by the course. Later dates are aligned with the project assignments announced on Piazza. The entire project is planned to be closed before the end of the year.

| Phase | Start | End | Main deliverables |
| :--- | :--- | :--- | :--- |
| **P1. Requirements and Planning** | 19 Oct 2026 | 1 Nov 2026 | Assignment-1 package (Project Definition, Requirements, Project Plan) |
| **P2. Architecture, UI & Core Dev** | 2 Nov 2026 | 15 Nov 2026 | Assignment-2 package (Architecture, Database Schema, Core UI) |
| **P3. Development Sprint 1** | 16 Nov 2026 | 29 Nov 2026 | Assignment-3 package (Core functionality: Accounts, Library, Timer) |
| **P4. Development Sprint 2 (Bonus)** | 30 Nov 2026 | 5 Dec 2026 | Assignment-4 Bonus (Points/Tiers, Store, Decorator, Analytics, Reconnection) |
| **P5. Testing and Stabilization** | 6 Dec 2026 | 16 Dec 2026 | Test report, load-test results, bug fixes |
| **P6. Deployment and Final Docs** | 17 Dec 2026 | 24 Dec 2026 | Deployed demo, user guide, final report |
| **Project closure & Demo** | 25 Dec 2026 | 27 Dec 2026 | All deliverables handed over, final presentation |
| **Project evaluation** | 28 Dec 2026 | 28 Dec 2026 | Retrospective: planned vs. actual effort, lessons learned |

Unit tests are written together with the code in P3 and P4; P5 focuses on integration, load, and usability testing. Project management activities run through all phases.

**Simple Gantt view (each column is about one week, starting 19 October 2026):**
```text
Phase                  Oct       Nov                 Dec
                       19   26   2    9    16   23   30   7    14   21   28
P1 Req & Planning      ##   ##
P2 Arch & Core UI                ##   ##
P3 Sprint 1 (A3)                           ##   ##
P4 Sprint 2 (Bonus)                                  ##
P5 Testing                                                ##   ##
P6 Deploy & Docs                                                    ##   ##
Closure / Eval                                                               ##
```

## 5. Resource Planning
The project needs only free or already available resources. All members use their own laptops and individual GitHub accounts.

| Resource | Purpose | How it is accessed |
| :--- | :--- | :--- |
| GitHub repository (shared) | Source code, Markdown documents, issues, pull requests, reviews | Each member uses an individual account with write access to the group repository. |
| React (frontend) and a charting library (e.g., Chart.js or Recharts) | Library view, timer, apartment decorator, dashboard charts | Open-source packages installed with npm. |
| Node.js and Socket.io (backend) | Real-time server, REST API, authoritative timer and presence state | Open-source packages installed with npm. |
| PostgreSQL | Users, sessions, items, inventories, layouts | Local instance for development; managed free-tier instance for the demo. |
| Gemini API | Short weekly insight text for the habit report | Free-tier API key kept in environment variables, never committed to the repository. |
| Jest (or equivalent) and a WebSocket load-testing tool (e.g., Artillery or k6) | Unit tests, integration tests, load tests | Open-source packages installed with npm. |
| Free-tier cloud hosting | Deployed demo | One group account; credentials shared only with members who deploy. |
| Google Drive (group project folder) | Final PDF versions of the documents, shared working files | Shared folder; course staff are given access before submission. |
| Instant messaging group | Daily coordination | All members. |
| Learning resources | Official documentation of React, Socket.io, PostgreSQL, Gemini API; course materials | Free online access. |

Resource owners: Delfin Kütükçü (real-time stack and demo hosting), Işıkalp Karakaş (database), Nadide Zeynep Dedeoğlu (Gemini API key and quota), Çınar Aktaş (test tools and CI), Nildeniz Efe (design and charting assets).

## 6. Risk Management
The full risk list (R1-R8) is in the Project Definition Document. The table below lists the risks that matter most for project execution, their owners, and the planned response. One schedule-related risk (R9) is added here.

| ID | Risk | Likelihood / Impact | Mitigation | Owner |
| :--- | :--- | :--- | :--- | :--- |
| R1 | Real-time synchronization is harder than expected. | Medium / High | Build and test the WebSocket layer first (P2-P3); the server stays authoritative for timers and presence. | Delfin Kütükçü |
| R2 | Uneven experience with React, Socket.io, or PostgreSQL. | Medium / Medium | Pair each area owner with a supporting member (Section 11); short knowledge-sharing sessions in the weekly meeting. | Işıkalp Karakaş |
| R3 | Scope creep. | High / Medium | The scope in Section 1 is the baseline; new ideas follow the change management process (Section 8). | Delfin Kütükçü |
| R5 | Free-tier hosting or API limits are exceeded. | Medium / Medium | Rate-limit and cache Gemini calls; keep a local run option for the demo. | Nadide Zeynep Dedeoğlu |
| R6 | A team member becomes unavailable (illness, exam load). | Medium / High | Every area has a supporting member who can take over; weekly status check; shared repository and documents. | Delfin Kütükçü |
| R8 | Integration problems late in the project. | Medium / High | Small pull requests; an integration check at the end of P3 and P4; automated tests run on every pull request. | Çınar Aktaş |
| R9 | Schedule pressure: the planned effort (about 11 hours per member per week) is slightly above the 8-10 hour baseline, and exam weeks reduce availability. | Medium / Medium | Requirements with priority S (FR-2, FR-13, FR-14) are dropped or postponed first; the plan is re-checked at each weekly meeting; late tasks are re-assigned early instead of at the end of a phase. | Delfin Kütükçü |

Risks are reviewed in every weekly meeting. A new risk is added to this table through the change management process.

## 7. Communication Plan
**Within the team**

| Channel | Used for | Frequency |
| :--- | :--- | :--- |
| Weekly status meeting (in person or online, 30-45 minutes) | Progress of each member, blockers, risks, decisions, next actions. Minutes are saved in the repository (`docs/meetings/`). | Once a week, on a fixed weekday agreed by the group |
| Instant messaging group | Quick questions, reminders, coordination | Daily as needed |
| GitHub issues and pull requests | Task tracking (every issue has one assignee), code review (at least one reviewer per pull request) | Continuous |
| Integration check (short meeting) | Join the parts at the end of P3 and P4 and fix interface problems | Twice (end of P3 and P4) |
| Shared Google Drive folder | Final PDFs and shared working files | When documents change |

If a member does not respond for 48 hours, the Project Manager contacts them directly. If the problem continues, it is raised in the next weekly meeting and, when it threatens a deadline, the teaching assistant is informed.

**With stakeholders (course staff)**
* The stakeholders are the instructor (Dr. Çiğdem Avcı) and the teaching assistant (Ömer Kılınç).
* Questions about assignments are posted on the course Piazza Q&A section. The teaching assistant can also be reached by e-mail (omerkilinc@etu.edu.tr) or at the office hours (Thursday and Friday, 16:30-18:20, room TM-213).
* The Project Manager coordinates the contact; any member may ask a question on Piazza.
* Deliverables are submitted through the GitHub repository and the shared Google Drive folder, as described in the assignment.

## 8. Change Management Plan
The baseline of the project is the set of three Assignment-1 documents (Project Definition, Requirements, Project Plan). Any change to the scope, a requirement, the timeline, or the task assignment follows these steps:

1. **Request.** Any member opens a GitHub issue with the label `change-request`. The issue states what should change, why, and which documents are affected.
2. **Impact analysis.** The Project Manager and the owner of the affected area estimate the effect on effort (hours), schedule, risks, and other requirements.
3. **Decision.** The group decides in the next weekly meeting by consensus; the Project Manager breaks ties. A change that adds effort is accepted only if the same amount of effort is removed elsewhere (for example, by postponing an S-priority requirement) or if it fits in the available time.
4. **Update.** If the change is accepted, the responsible member updates the affected documents and the effort table in a pull request that is linked to the issue.
5. **Communication.** The decision is posted in the messaging group and recorded in the change log below and in the meeting minutes.

Small corrections that do not change scope, requirements, or dates (typos, wording, formatting) do not need this process; they only need a reviewed pull request.

| Change ID | Date | Description | Decision | Documents updated |
| :--- | :--- | :--- | :--- | :--- |
| CR-001 | - | (No change requests yet; the log starts after the first baseline.) | - | - |

## 9. Budget Plan
**Money.** The project is planned at near-zero cost. Hosting, the managed PostgreSQL instance, and the Gemini API are used on free tiers. Gemini calls are limited (for example, one insight request per user per week) to stay inside the free quota. No real-money payments exist in the system. A paid service is used only if the whole group agrees first.

**Effort.** The effort budget is 540 person-hours. It is allocated to the phases as follows (the details per task and per person are in Section 10):

| Phase | Effort (hours) | Share of total |
| :--- | :--- | :--- |
| P1. Requirements and Planning | 50 | 9.3% |
| P2. Architecture, UI & Core Dev | 80 | 14.8% |
| P3. Development Sprint 1 | 140 | 25.9% |
| P4. Development Sprint 2 (Bonus) | 90 | 16.7% |
| P5. Testing and Stabilization | 80 | 14.8% |
| P6. Deployment and Final Docs | 60 | 11.1% |
| Project closure & Demo | 30 | 5.6% |
| Project evaluation | 10 | 1.9% |
| **Total** | **540** | **100%** |

(Shares are rounded to one decimal, so they add up to 100.1% in the table.)

Development (P2-P4) takes about 57% of the effort, testing and stabilization about 15%, and deployment, documents, closure, and evaluation together about 28% (including the P1 documents). Project management work is included inside every phase. The effort of the real-time server and the timer (the main technical risk) is placed early, in P2 and P3.

## 10. Effort Estimation
### 10.1 Method
The estimate uses a simple work breakdown with expert judgment: the project was divided into work packages (tasks), the member responsible for each package estimated its effort in person-hours, and the Project Manager reviewed the numbers for balance. The estimates were then compared by analogy: features of similar size (for example, authentication and the store) received similar numbers of hours, and every feature estimate includes its unit tests and code review. The planned effort is checked again at the end of each phase and compared with the actual effort in the retrospective.

### 10.2 Effort per phase
| Phase | Main activities | Effort (hours) |
| :--- | :--- | :--- |
| P1. Requirements and Planning | Refining the concept notes; Project Definition, Requirements, and Project Plan documents; repository setup | 50 |
| P2. Architecture, UI & Core Dev | System architecture, database schema, wireframes, core UI, project setup and automated checks | 80 |
| P3. Development Sprint 1 | Accounts, library and presence, chat and emoji, timer and anti-cheat, session history, unit tests | 140 |
| P4. Development Sprint 2 (Bonus) | Points and tiers, store, apartment decorator, analytics, reconnection, unit tests | 90 |
| P5. Testing and Stabilization | Integration tests, load tests, usability test, bug fixing | 80 |
| P6. Deployment and Final Docs | Deployment, user guide, final report | 60 |
| Project closure & Demo | Handover of deliverables, demo preparation and rehearsal, final presentation | 30 |
| Project evaluation | Retrospective: planned vs. actual effort, lessons learned | 10 |
| **Total** | | **540** |

### 10.3 Effort per person and phase (hours)
| Member | P1 | P2 | P3 | P4 | P5 | P6 | Closure | Evaluation | Total | Difference from average (108 h) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Delfin Kütükçü | 12 | 18 | 32 | 18 | 14 | 12 | 6 | 2 | 114 | +5.6% |
| Işıkalp Karakaş | 11 | 16 | 28 | 20 | 14 | 10 | 6 | 2 | 107 | -0.9% |
| Nildeniz Efe | 8 | 18 | 24 | 16 | 14 | 12 | 6 | 2 | 100 | -7.4% |
| Nadide Zeynep Dedeoğlu | 9 | 14 | 28 | 20 | 14 | 12 | 6 | 2 | 105 | -2.8% |
| Çınar Aktaş | 10 | 14 | 28 | 16 | 24 | 14 | 6 | 2 | 114 | +5.6% |
| **Total** | **50** | **80** | **140** | **90** | **80** | **60** | **30** | **10** | **540** | |

All members are within the target of 15% around the average planned effort (Objective 4). Çınar Aktaş has the largest share in P5 because of test automation and load testing; Delfin Kütükçü has the largest share in P3 because of the real-time server.

### 10.4 Effort per task and owner
| Task ID | Task | Related requirements | Owner | Effort (hours) |
| :--- | :--- | :--- | :--- | :--- |
| D-1 | Project management: planning, tracking, weekly meetings, change log | - | Delfin Kütükçü | 26 |
| D-2 | Documents: Assignment-1 package, design documentation, share of the final report | - | Delfin Kütükçü | 14 |
| D-3 | Real-time server and library presence | FR-3, FR-4, NFR-1 | Delfin Kütükçü | 32 |
| D-4 | Reconnection and server-authoritative timer state | FR-15, NFR-2 | Delfin Kütükçü | 22 |
| D-5 | Integration, demo preparation, retrospective | - | Delfin Kütükçü | 20 |
| I-1 | Requirements maintenance and document consistency | - | Işıkalp Karakaş | 12 |
| I-2 | Authentication and security | FR-1, NFR-3, NFR-4 | Işıkalp Karakaş | 22 |
| I-3 | Database schema and data access layer | - | Işıkalp Karakaş | 20 |
| I-4 | Points and tier logic | FR-8, FR-9 | Işıkalp Karakaş | 18 |
| I-5 | Session storage and history (server side) | FR-6, FR-16 | Işıkalp Karakaş | 20 |
| I-6 | Backend unit tests and code reviews | NFR-8 | Işıkalp Karakaş | 15 |
| N-1 | Wireframes and visual design | all UI requirements | Nildeniz Efe | 20 |
| N-2 | Library and avatar UI, outfits | FR-2, FR-3 | Nildeniz Efe | 22 |
| N-3 | Apartment decorator UI (drag and drop) | FR-11 | Nildeniz Efe | 28 |
| N-4 | Usability testing and UI polish | NFR-6, NFR-7 | Nildeniz Efe | 18 |
| N-5 | Documents: user guide and UI wording | - | Nildeniz Efe | 12 |
| Z-1 | Client timer and anti-cheat auto-pause | FR-6, FR-7 | Nadide Zeynep Dedeoğlu | 26 |
| Z-2 | Dashboard: weekly study chart | FR-12 | Nadide Zeynep Dedeoğlu | 18 |
| Z-3 | Weekly habit report and Gemini insight | FR-14 | Nadide Zeynep Dedeoğlu | 26 |
| Z-4 | Session history UI | FR-16 | Nadide Zeynep Dedeoğlu | 12 |
| Z-5 | Frontend unit tests and code reviews | NFR-8 | Nadide Zeynep Dedeoğlu | 12 |
| Z-6 | Documents: share of the final report and project documents | - | Nadide Zeynep Dedeoğlu | 11 |
| C-1 | Test plan, test automation, manual test checklist | NFR-7, NFR-8 | Çınar Aktaş | 30 |
| C-2 | Chat and emoji | FR-5 | Çınar Aktaş | 18 |
| C-3 | Store (backend and UI) | FR-10 | Çınar Aktaş | 24 |
| C-4 | Leaderboard | FR-13 | Çınar Aktaş | 14 |
| C-5 | Deployment and automated checks (CI) | NFR-5 | Çınar Aktaş | 16 |
| C-6 | Load testing and test report | NFR-1, NFR-2, NFR-5 | Çınar Aktaş | 12 |

### 10.5 Total project effort
| Member | Total effort (hours) | Share |
| :--- | :--- | :--- |
| Delfin Kütükçü | 114 | 21.1% |
| Işıkalp Karakaş | 107 | 19.8% |
| Nildeniz Efe | 100 | 18.5% |
| Nadide Zeynep Dedeoğlu | 105 | 19.4% |
| Çınar Aktaş | 114 | 21.1% |
| **Total project effort** | **540** | **100%** |

The sum over all phases (Section 10.2), the sum over all members (Section 10.3), and the sum over all tasks (Section 10.4) are the same: 540 person-hours.

## 11. Task Assignments
### 11.1 Team members and roles
| Member | Main roles |
| :--- | :--- |
| Delfin Kütükçü | Project Manager; Real-time (WebSocket) Developer |
| Işıkalp Karakaş | Requirements Analyst; Backend and Database Developer |
| Nildeniz Efe | UI/UX Designer; Frontend Developer |
| Nadide Zeynep Dedeoğlu | Frontend and Analytics Developer |
| Çınar Aktaş | Tester / QA; Full-stack Developer |

The responsibilities of each role are described in Section 2.

### 11.2 Task matrix: phases
| Phase | Lead | Main contributors |
| :--- | :--- | :--- |
| P1. Requirements and Planning | Delfin Kütükçü | All members (each writes the parts listed in the document-specific task matrices) |
| P2. Architecture, UI & Core Dev | Delfin Kütükçü (architecture), Işıkalp Karakaş (database schema), Nildeniz Efe (UI design) | Nadide Zeynep Dedeoğlu, Çınar Aktaş (project setup and automated checks) |
| P3. Development Sprint 1 | Delfin Kütükçü (library, real-time), Işıkalp Karakaş (accounts, sessions) | Nadide Zeynep Dedeoğlu (timer), Çınar Aktaş (chat), Nildeniz Efe (library UI) |
| P4. Development Sprint 2 (Bonus) | Işıkalp Karakaş (points and tiers), Nadide Zeynep Dedeoğlu (analytics) | Delfin Kütükçü (reconnection), Çınar Aktaş (store, leaderboard), Nildeniz Efe (decorator) |
| P5. Testing and Stabilization | Çınar Aktaş | All members (bug fixing in their own areas), Nildeniz Efe (usability test) |
| P6. Deployment and Final Docs | Çınar Aktaş (deployment), Nildeniz Efe (user guide) | Delfin Kütükçü (final report), all members |
| Project closure & Demo | Delfin Kütükçü | All members |
| Project evaluation | Delfin Kütükçü | All members |

### 11.3 Task matrix: functional requirements
| FR | Requirement (short) | Primary owner | Supporting member | Target phase |
| :--- | :--- | :--- | :--- | :--- |
| FR-1 | Registration, login, logout | Işıkalp Karakaş | Nildeniz Efe | P3 |
| FR-2 | Avatar outfit (priority S) | Nildeniz Efe | Işıkalp Karakaş | P4 |
| FR-3 | Library view and avatar status | Delfin Kütükçü | Nildeniz Efe | P3 |
| FR-4 | Taking a seat | Delfin Kütükçü | Nildeniz Efe | P3 |
| FR-5 | Text messages and emoji | Çınar Aktaş | Delfin Kütükçü | P3 |
| FR-6 | Study timer | Nadide Zeynep Dedeoğlu | Işıkalp Karakaş | P3 |
| FR-7 | Anti-cheat auto-pause | Nadide Zeynep Dedeoğlu | Delfin Kütükçü | P3 |
| FR-8 | Points for sessions | Işıkalp Karakaş | Nadide Zeynep Dedeoğlu | P4 |
| FR-9 | Furniture tiers | Işıkalp Karakaş | Çınar Aktaş | P4 |
| FR-10 | Store and purchase | Çınar Aktaş | Işıkalp Karakaş | P4 |
| FR-11 | Apartment decorator | Nildeniz Efe | Işıkalp Karakaş | P4 |
| FR-12 | Weekly study chart | Nadide Zeynep Dedeoğlu | Işıkalp Karakaş | P4 |
| FR-13 | Leaderboard (priority S) | Çınar Aktaş | Işıkalp Karakaş | P4 |
| FR-14 | Habit report and Gemini insight (priority S) | Nadide Zeynep Dedeoğlu | Işıkalp Karakaş | P4 |
| FR-15 | Automatic reconnection | Delfin Kütükçü | Nadide Zeynep Dedeoğlu | P4 |
| FR-16 | Session storage and history | Işıkalp Karakaş | Nadide Zeynep Dedeoğlu | P3 |

The S-priority requirements (FR-2, FR-13, FR-14) may be finished at the beginning of P5 if P4 is late (risk R9).

| NFR | Quality attribute | Primary owner | Supporting member |
| :--- | :--- | :--- | :--- |
| NFR-1 | Performance (200 ms updates) | Delfin Kütükçü | Çınar Aktaş (load test) |
| NFR-2 | Reliability (timer state, reconnection) | Delfin Kütükçü | Çınar Aktaş |
| NFR-3 | Security | Işıkalp Karakaş | Çınar Aktaş |
| NFR-4 | Privacy | Işıkalp Karakaş | Çınar Aktaş |
| NFR-5 | Scalability | Çınar Aktaş | Delfin Kütükçü |
| NFR-6 | Usability | Nildeniz Efe | Nadide Zeynep Dedeoğlu |
| NFR-7 | Compatibility | Nildeniz Efe | Çınar Aktaş |
| NFR-8 | Maintainability and tests | Çınar Aktaş | Işıkalp Karakaş |

### 11.4 Rationale for task assignment
* **Roles first.** The assignments follow the roles in Section 2: the Project Manager also builds the real-time server (the main technical risk), the backend developer owns data, authentication, and points logic, the designer owns the visual parts, the analytics developer owns the timer and dashboard, and the tester also builds smaller full-stack features so that testing knowledge is used while developing.
* **Skills, interests, and learning objectives.** The roles were chosen by considering each member's skills and interests. Each member has one main area and one supporting area, so everyone also learns a second part of the system (for example, the frontend developers support backend features such as session history).
* **Fairness.** The planned effort per member is between 100 and 114 hours, within 15% of the average of 108 hours (Section 10.3). Every member has development tasks, a documentation share, and code-review duties.
* **Effectiveness and risk.** Every requirement has a primary owner and a supporting member, so the work continues if one member becomes unavailable (risk R6). Related requirements are given to the same owner (for example, FR-3, FR-4, FR-15 to the real-time developer) to reduce hand-overs.

### 11.5 Clarity of contribution on GitHub
* Every member works with an individual GitHub account; no shared accounts are used.
* Work is organized in issues with one assignee each; the issue number is written in the pull request.
* Branch names follow `feature/<area>-<short-name>` and commit messages follow `<type>(<area>): <short description>` (for example, `feat(timer): pause when tab is hidden`).
* The repository is structured by area (`docs/`, client code, server code, tests), so the folder shows who maintains what.
* Changes are merged through pull requests with at least one review by another member.

## 12. Document-Specific Task Matrix
| Task | Responsible member |
| :--- | :--- |
| Project scope, project organization, objectives, key phases and timeline (including the Gantt view) | Delfin Kütükçü |
| Resource planning and risk management | Çınar Aktaş |
| Communication plan and change management plan | Nildeniz Efe |
| Budget plan and effort estimation (per phase, per task, per person, total) | Nadide Zeynep Dedeoğlu |
| Task assignments, task matrices, and rationale | Işıkalp Karakaş |
| Consistency review with the Project Definition and Requirements Documents; PDF export | Delfin Kütükçü |
