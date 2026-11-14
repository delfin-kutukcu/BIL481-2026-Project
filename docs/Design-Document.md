# Design Document

## Table of Contents
1. [Task Matrix](#task-matrix)
2. [Contributors](#contributors)
3. [1. System Overview](#1-system-overview)
4. [2. Implementation Details](#2-implementation-details)
5. [3. Use Case Support in Design](#3-use-case-support-in-design)
6. [4. Design Decisions](#4-design-decisions)

## Task Matrix (Design Document)

| Document Section | Responsible Member |
| :--- | :--- |
| **1. System Overview** (Description, Architecture, Tech Stack) | Nildeniz Efe |
| **2. Implementation Details** (Codebase Structure, Key Modules, UI) | Çınar Aktaş |
| **3.1 Use Case 1: Interact in Library** (Observer Pattern & UML) | Işıkalp Karakaş |
| **3.2 Use Case 2: Manage Study Timer** (State Pattern & UML) | Işıkalp Karakaş |
| **3.3 Use Case 3: Buy Items in Store** (Factory Pattern & UML) | Çınar Aktaş |
| **3.4 Use Case 4: Calculate Points & Unlock Tiers** (Strategy Pattern & UML) | Delfin Kütükçü |
| **4. Design Decisions** (Tech Comparisons & Justifications) | Nildeniz Efe |

## Contributors
* Işıkalp Karakaş
* Delfin Kütükçü
* Nildeniz Efe
* Nadide Zeynep Dedeoğlu
* Çınar Aktaş

---

## 1. System Overview

### Brief Project Description
StudyLoft is a multiplayer virtual apartment study platform designed to tackle student isolation, lack of motivation, and poor consistency during long study sessions. By combining the psychological "body-doubling" effect with engaging gamification, StudyLoft provides a ground-floor virtual library where users can study together using real-time avatars and integrated study timers. Communication is strictly limited to text and emojis to maintain a distraction-free, focused study environment (voice and video chats are intentionally excluded). 

Completed study sessions award points based on active study duration, which users redeem in a virtual store for tiered furniture and clothing items. These items are then used to decorate their own personal apartment floor. Additionally, a comprehensive analytics dashboard featuring weekly study charts, habit reports, leaderboards, and AI-powered insights via the Gemini API helps students monitor and improve their long-term productivity.

### System Architecture
StudyLoft adopts a robust **client-server architecture** optimized for low-latency, real-time multiplayer interactions:
*   **Client Tier:** A single-page application (SPA) built using React.js that renders the user interface, 2D grid environments, apartment decorator, and analytics dashboards.
*   **Real-Time / WebSocket Tier:** A dedicated Node.js server running **Socket.io** to manage low-latency, bidirectional broadcasting of avatar presence, seating states, chat messages, and automatic connection recovery with exponential backoff.
*   **Application & REST API Tier:** Handles user authentication, session history logging, store purchases, and communicates securely with the **Google Gemini API** for weekly habit analysis report generation.
*   **Data Tier:** A relational database (**PostgreSQL**) storing structured data entities including user profiles, active study sessions, item inventories, and floor layouts.

### Technology Stack
*   **Frontend:** React.js, HTML5 Canvas / 2D Grid Renderer, CSS modules, Chart.js / Recharts (for analytics dashboards).
*   **Backend:** Node.js, Express.js, Socket.io (for real-time multiplayer state synchronization).
*   **Database:** PostgreSQL (Relational Database Management System).
*   **AI Integration:** Google Gemini API (for generating personalized weekly productivity and habit insights).
*   **Version Control & CI:** Git, GitHub (branching strategy, pull request reviews, automated tests).
  
## 2. Implementation Details
*(Çınar bu kısmı dolduracak: Codebase Structure, Key Implementations, Component Interfaces, Visual Interfaces)*

## 3. Use Case Support in Design

### 3.1 Use Case 1: Interact in Library

  **Requirement Mapping:** 
This use case directly supports **FR-3** (Real-time synchronization of user actions), **FR-4** (Visible library presence and interactions), and **FR-5** (Chat functionality and emoji usage) from our Requirements Document.
  
  **UML Class Diagram:**
  <img src="images/uc1_UML.png" alt="Use Case 1 Observer Pattern UML" width="250">

  **Design Pattern & Justification: Observer Pattern**
  
We selected the Observer Pattern as the core architectural solution to handle real-time interactions within the virtual library. Based on our requirements, whenever a user performs a specific action (e.g., joins a desk, leaves the room, or sends a chat message), the screens of all other active users in that same room must be updated instantly without requiring manual page refreshes.

In this design, `LibraryRoom` acts as the Concrete Subject. It maintains a dynamic list of connected `UserClient` objects, which act as the Observers. Instead of forcing each client to repeatedly request (poll) the server for new data—which would consume excessive bandwidth and cause lag—the `LibraryRoom` automatically pushes the updated `roomState` to all attached observers via the `notifyObservers()` method exactly when a change occurs. This creates a highly scalable, decoupled architecture that perfectly complements a WebSocket-based backend infrastructure for real-time gamified study environments.

### 3.2 Use Case 2: Manage Study Timer
**Requirement Mapping:** 
This use case directly supports **FR-6** (Timer state controls: start, pause, resume, finish, and active time calculation) and **FR-7** (Automatic pause when tab is hidden and paused count tracking) from our Requirements Document.

**UML Class Diagram:**
<img src="images/uc2-UML.png" alt="Use Case 2 State Pattern UML" width="650">

**Design Pattern & Justification: State Pattern**
We selected the **State Pattern** to manage the complex lifecycle and transition logic of the study timer. Initially, we considered applying the Strategy Pattern for this component. However, through architectural trade-off analysis, we concluded that while the Strategy Pattern is ideal for interchanging algorithms, our timer is fundamentally governed by strict behavioral boundaries and statuses (States: *Idle*, *Running*, *Paused*). For instance, an already running timer cannot be started again, and a paused timer cannot be paused twice.

By implementing the State Pattern, we avoid fragile and monolithic if-else condition blocks. Instead, we encapsulate state-specific behaviors into individual classes (`IdleState`, `RunningState`, `PausedState`) that all implement the `TimerState` interface. The `StudyTimer` acts as the **Context**, delegating behavior to its `currentState` object. This architecture strictly enforces legal state transitions and demonstrates a precise application of structural design beyond basic algorithmic swaps. Crucially, when the timer transitions to a finished state (e.g., via a `finish()` method), the session data is logged. If the active session duration meets the 15-minute threshold (FR-8), `PointService.awardPoints(user, session)` is invoked, ensuring seamless integration with the point calculation module (Use Case 4).

### 3.3 Use Case 3: Buy Items in Virtual Store

**Requirement Mapping:**
This use case directly supports **FR-10** (browse the store and buy an item whose tier is unlocked and whose cost does not exceed the user's points). It depends on **FR-9** (furniture tiers unlocked by lifetime points) for the tier check, and its result feeds **FR-2** (equipping owned clothing) and **FR-11** (placing owned furniture in the apartment).

**UML Class Diagram:**
<img src="images/uc3_UML.png" alt="Use Case 3 Factory Pattern UML" width="600">

**Design Pattern & Justification: Factory Pattern**
The virtual store sells two kinds of products, furniture and clothing. They share a name, a cost, and a tier, but they differ in their own data: furniture has a size on the apartment grid, and clothing has an avatar slot. If the store code created these objects directly with `new FurnitureItem(...)` and `new ClothingItem(...)`, every new product type would force changes in the purchase logic.

We therefore selected the **Factory Pattern**. All products implement the common `StoreItem` interface (`getId()`, `getName()`, `getCost()`, `getTier()`). The `ItemFactory` class has one method, `createItem(type, data)`, which reads the item type from the database record and returns the matching `FurnitureItem` or `ClothingItem`. `StoreService` works only with the `StoreItem` interface and never needs to know the concrete class. A new product type (for example wallpaper) can be added by creating one new class and one new branch in the factory, without touching `StoreService`. This follows the Open/Closed Principle. We considered the Strategy Pattern, but the problem here is *which object to create*, not *which algorithm to run*, so Factory is the better fit.

**Purchase Flow (data flow and state changes):**
1. The user opens the store. `StoreService.listItems()` loads item records, and `ItemFactory` turns each record into a `StoreItem` (name, cost, tier).
2. The user selects an item and presses *Buy*. The client sends `POST /api/store/buy` with `{ itemId }`. The user is identified by the authenticated session.
3. `StoreService.buyItem(userId, itemId)` checks three conditions in `canPurchase()`:
   - the item exists and is not already owned (`Inventory.owns()`),
   - the item tier is not higher than the user's tier (`User.getTier()`, based on lifetime points, FR-9),
   - the user has enough points (`points >= cost`).
4. **Success:** `User.deductPoints(cost)` lowers the balance, `Inventory.add(item)` stores the item, and the server returns the new balance and inventory.
5. **Failure:** the server returns an error message (tier locked or not enough points). Points and inventory do not change.

The purchase runs as a single database transaction, so the point deduction and the inventory update happen together or not at all. The user's lifetime points do not change when buying, so the tier never drops after a purchase.

**Example (from FR-10 verification):** A user with 500 points buys a 300-point Tier-2 desk and has 200 points left. With 100 points, the same purchase is rejected and nothing changes.

### 3.4 Use Case 4: Calculate Points & Unlock Tiers
*(Delfin'in hazırlayacağı Strategy Pattern UML kısmı buraya gelecek)*

## 4. Design Decisions

### 4.1. Technology Comparisons
To build StudyLoft efficiently and ensure it meets our performance and real-time synchronization requirements, we evaluated and compared alternative technologies for key layers of the system:

*   **Comparison 1: Database Selection — PostgreSQL (Relational) vs. MongoDB (NoSQL)**
    *   *PostgreSQL:* Offers robust relational integrity, structured schemas for user profiles, secure authentication data, item inventories, and transaction safety for point deductions and store purchases.
    *   *MongoDB:* Provides high flexibility for unstructured documents, making it easy to store dynamic JSON objects like apartment floor layouts (`placedItems[]`).
    *   *Decision:* We selected **PostgreSQL** because maintaining strict consistency for user points, tiered item ownership, and secure session history is critical. PostgreSQL also supports JSONB columns, allowing us to store flexible floor layout coordinates without sacrificing relational data integrity.

*   **Comparison 2: Real-Time Synchronization Protocol — WebSockets (Socket.io) vs. HTTP Short/Long Polling / Server-Sent Events (SSE)**
    *   *HTTP Polling / SSE:* Polling repeatedly opens HTTP connections, causing high server overhead and latency, whereas SSE is strictly unidirectional (server-to-client), which is insufficient for a multiplayer environment where clients must send avatar movements and chat messages.
    *   *WebSockets (Socket.io):* Establishes a persistent, low-latency, bidirectional communication channel. Socket.io specifically adds built-in automatic reconnection logic, fallback mechanisms, and room management.
    *   *Decision:* We selected **WebSockets via Socket.io** to satisfy Requirement NFR-1 (real-time synchronization under 200ms) and to seamlessly handle avatar presence broadcasting, text/emoji chat bubbles, and automatic connection recovery.

### 4.2. Decision Justifications
*   **Frontend Framework (React.js):** Chosen for its component-based architecture, rich ecosystem, and high rendering efficiency, which is essential for managing interactive dashboards, the apartment grid decorator, and real-time UI updates.
*   **Backend Framework (Node.js & Express.js):** Selected for its non-blocking asynchronous I/O model and native JavaScript synergy with frontend React components, streamlining the development of REST endpoints and real-time event handlers.
*   **AI Integration (Google Gemini API):** Chosen over alternative LLMs due to its robust free-tier availability and high capability in generating structured, personalized weekly habit analysis and productivity insights for students.
