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
**Included.** A desktop-first web application, Study Loft, with: user accounts; a real-time multiplayer ground-floor library with avatars and text/emoji interaction; a study timer with anti-cheat auto-pause; points, tiered rewards, and a virtual store; a personal apartment decorator; an analytics dashboard with weekly charts, habit reports, and a leaderboard; and automatic connection recovery. The project also includes all project documents, tests, and a deployed demo.

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
3. Complete the core application (accounts, library, timer, real-time sync) by 6 December 2026 and all features by 27 December 2026.
4. Keep the effort spread balanced: no member more than 15% above or below the average planned effort.
5. Merge all changes through reviewed pull requests, with a clear commit history for every member.
6. Hold a weekly status meeting and record decisions and actions in the repository.
7. Finish testing and stabilization by 10 January 2027 and close the project with a retrospective.

## 4. Key Phases and Timeline
The dates for Phase 1 are fixed by the course. Later dates are aligned with the project assignments announced on Piazza. The entire project is planned to be closed before the end of the year.

| Phase | Start | End | Main deliverables |
| :--- | :--- | :--- | :--- |
| **P1. Requirements and Planning** | 19 Oct 2026 | 1 Nov 2026 | Assignment-1 package (Project Definition, Requirements, Project Plan) |
| **P2. Architecture, UI & Core Dev** | 2 Nov 2026 | 15 Nov 2026 | Assignment-2 package (Architecture, Database Schema, Core UI) |
| **P3. Development Sprint 1** | 16 Nov 2026 | 29 Nov 2026 | Assignment-3 package (Core functionality: Accounts, Library, Timer) |
| **P4. Development Sprint 2 (Bonus)** | 30 Nov 2026 | 5 Dec 2026 | Assignment-4 Bonus (Points/Tiers, Analytics, Reconnection) |
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
