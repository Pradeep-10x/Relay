# Relay Backend Documentation

### Overview

**Relay** is a multi-tenant project management and workflow orchestration platform (similar to Jira or Linear). It aims to provide seamless workspace collaboration, issue tracking, kanban boards, real-time collaboration (whiteboards), and event-driven notifications.

### Key Features

- **Authentication & User Profiles:** Secure JWT-based authentication with refresh tokens (HttpOnly cookies). Avatars via Cloudflare R2 uploaded with presigned URLs.
- **Multi-tenant Workspaces:** Users can create workspaces, invite others (via unique expirable links or direct emails), and define workspace-level roles (`OWNER`, `ADMIN`, `MEMBER`).
- **Project & Workflow Management:** Inside workspaces, members can create independent projects. Each project manages its own customizable workflow states (e.g., `OPEN`, `In_Progress`, `Review`, `Done`) and Role-Based Access Control (RBAC) enforced state transitions.
- **Issue Tracking & Dependencies:** Complete issue CRUD. Issues support custom prioritization, assignment, and dependency graphs (blockers). Issue activities (history) are fully tracked.
- **Real-time Notifications:** Users receive instant notifications when assigned an issue or `@mentioned` in comments. Uses Socket.IO + Redis Adapter.
- **Interactive Kanban Boards:** Fully functional Kanban boards aggregated by project workflow states. Cached via Redis for strict latency requirements.
- **Real-time Project Whiteboards:** Collaborative drawing board with data buffered via in-memory structures and synchronized via WebSockets (pub/sub via Redis), persisting coordinates into JSON structures in PostgreSQL.

## 2. System Architecture & Tech Stack

### Tech Stack

- **Runtime:** Node.js using `tsx` (TypeScript)
- **Framework:** Express 5.x
- **Database:** PostgreSQL (via Prisma ORM 7.x schema)
- **Caching & Pub/Sub:** Redis (via `ioredis`)
- **WebSockets:** Socket.IO with `@socket.io/redis-adapter` for multi-node horizontal scaling.
- **Validation:** Zod schemas.
- **Storage:** AWS S3 SDK for Cloudflare R2 object storage.
- **Documentation:** Swagger (OpenAPI 3.0) via `swagger-jsdoc` and `swagger-ui-express`.

### Architecture Patterns

- **Module-based folder structure:** The project is separated into functional domains within `src/modules/*` (auth, board, comment, issue, kanban, notification, project, user, workspace).
- **Routings -> Controllers -> Services:**
  - `*.routes.ts`: Maps HTTP methods to controllers and applies middlewares (Auth/RBAC validation). Includes Swagger Annotations.
  - `*.controller.ts`: Handles Request/Response objects, parses and validates inputs using Zod, and delegates logic to services.
  - `*.service.ts`: Core business logic encapsulation and Prisma interactions (often using `$transaction` to ensure ACID compliance).
- **Error Handling:** Standardized custom [ApiError](file:///home/x/coding/Relay/Backend/src/utils/ApiError.ts#1-27) class caught globally via an `AsyncHandler` wrapper.
- **Real-time Synchronization:** Socket.IO listeners are registered centrally in [src/lib/socket.ts](file:///home/x/coding/Relay/Backend/src/lib/socket.ts) using Redis Adapters allowing seamless scaling to multiple Node instances. Whiteboard strokes are buffered in memory and flushed to PostgreSQL asynchronously to minimize database writes.

## 3. Database Schema Overview (Prisma)

### Core Entities

1. **User & Authentication:**
   - [User](file:///home/x/coding/Relay/Backend/src/modules/auth/auth.service.ts#59-93): Basic user info (email, username, passwordHash, avatar, soft deletes).
   - [RefreshToken](file:///home/x/coding/Relay/Backend/src/utils/jwt.ts#24-27): Track and revoke individual JWT refresh tokens.
2. **Tenants (Workspaces & Projects):**
   - [Workspace](file:///home/x/coding/Relay/Backend/src/modules/workspace/workspace.service.ts#301-340): Top-level tenant container.
   - [WorkspaceMember](file:///home/x/coding/Relay/Backend/src/modules/workspace/workspace.service.ts#123-155): Links [User](file:///home/x/coding/Relay/Backend/src/modules/auth/auth.service.ts#59-93) to [Workspace](file:///home/x/coding/Relay/Backend/src/modules/workspace/workspace.service.ts#301-340) with `WorkspaceRole` enum (`OWNER`, `ADMIN`, `MEMBER`).
   - `WorkspaceInvite`: Expirable tokens for new users to join workspaces.
   - [Project](file:///home/x/coding/Relay/Backend/src/modules/project/project.controller.ts#14-27): Scoped to a Workspace. Generates short sequential issue keys (e.g., `PRJ-1`, `PRJ-2`) using `issueCounter`.
   - [ProjectMember](file:///home/x/coding/Relay/Backend/src/modules/project/project.controller.ts#50-68): Links [User](file:///home/x/coding/Relay/Backend/src/modules/auth/auth.service.ts#59-93) to [Project](file:///home/x/coding/Relay/Backend/src/modules/project/project.controller.ts#14-27) with `ProjectRole`.
3. **Workflows:**
   - `WorkflowState`: Defines custom column/status for a project (e.g., "To Do", "In Progress"). Ranked by `order`.
   - `WorkflowTransition`: Enforces rules mapping `fromStateId` to `toStateId` and the `allowedRoles` that can execute this transition.
4. **Issues & Data:**
   - [Issue](file:///home/x/coding/Relay/Backend/src/modules/issue/issue.controller.ts#93-111): Represents tasks/tickets. Belongs to a project and assigned a `WorkflowState`. Tracks dependencies (`blocker`, `blockedBy`).
   - [IssueDependency](file:///home/x/coding/Relay/Backend/src/modules/issue/issue.services.ts#244-319): Many-to-Many self-relation linking blocker tasks to blocked tasks.
   - [IssueActivity](file:///home/x/coding/Relay/Backend/src/modules/issue/issue.controller.ts#85-92): Tracks state, assignee, or dependency changes (Audit Log).
   - [IssueComment](file:///home/x/coding/Relay/Backend/src/modules/comment/comment.service.ts#69-87): Threaded communication on issues.
5. **Real-time Modules:**
   - [ProjectBoard](file:///home/x/coding/Relay/Backend/src/modules/issue/issue.controller.ts#112-119): Captures JSON schema arrays of canvas strokes per project in `strokes`.
   - [Notification](file:///home/x/coding/Relay/Backend/src/modules/notification/notification.cotroller.ts#5-9): In-app updates linked to users (`MENTION`, `ISSUE_ASSIGNED`).

## 4. Key Business Logic & Workflows

### 4.1. Issue Workflow Transitions

When changing an issue state, the system verifies:

- Are there cyclic dependencies or unresolved blockers? (A task cannot be moved to a `DONE` state if a blocker is unresolved.)
- Privileges: `OWNER` and `ADMIN` can forcefully edit states. `MEMBER` users must mathematically follow the paths defined in the `WorkflowTransition` table (e.g., Members can move `OPEN` -> `In_Progress`, but cannot move `Review` -> `Done` directly).
- Optimistic Concurrency: Handled via a `version` integer column inside [Issue](file:///home/x/coding/Relay/Backend/src/modules/issue/issue.controller.ts#93-111). If versions mismatch between fetch and update, a 409 Conflict is thrown.

### 4.2. Kanban Boards & Caching

Kanban boards group all issues in a project under their respective `WorkflowState` column.

- Heavily uses Redis for caching (`board:{projectId}`).
- Cache invalidation is triggered proactively in every Issue service function: Creating an issue, updating state, modifying dependencies, or deleting an issue executes [deleteCache("board:<id>")](file:///home/x/coding/Relay/Backend/src/utils/cache.ts#13-16).

### 4.3. Real-time Project Whiteboards

- Users open the board and join a socket room: `project-{projectId}`.
- Every drawing `stroke` is broadcasted via socket to the room except the sender (`socket.to().emit`).
- To prevent database overload, strokes are kept in an in-memory buffer array (`boardBuffers`). A `setInterval` flushes pending strokes from memory into PostgreSQL via an `upsert/update` logic every 3 seconds.

### 4.4. Analytics

Provides aggregation on active, completed, unassigned issues and generates completion rates. Computation results are cached via Redis `setex` with a TTL of 30 seconds.

### 4.5. User Profile Images

Utilizes the presigned URL pattern.

1. Client requests a signed S3 PUT string via `/api/v1/user/avatar/upload-url`.
2. Client uploads the binary image directly to Cloudflare R2.
3. Client patches `/api/v1/user/avatar` with the returned key path.
4. Avatars are requested via authenticated `getObject` S3 GET presigned URLs cached heavily on frontend.

## 5. API Endpoints Reference

Base Path: `/api/v1`
Auth Requirements: Bearer JWT Access Token (except `/auth/login`, `/auth/register`, `/auth/refresh`).

### Auth

- `POST /auth/register`: Create user
- `POST /auth/login`: Issue access & refresh tokens (Cookies)
- `POST /auth/refresh`: Refresh JWT
- `POST /auth/logout`: Revoke tokens
- `GET /auth/me`: Validates session

### User

- `GET /user/me`: Get profile object with presigned avatar URL
- `POST /user/avatar/upload-url`: Request secure PUT link
- `PATCH /user/avatar`: Save object key
- `POST /user/edit-profile`: Mutate details
- `POST /user/change-password`: Update hashing sequence

### Workspace

- `POST /workspace/create`: New workspace (User becomes OWNER)
- `GET /workspace`: List workspaces
- `POST /workspace/{id}/add`: Add team member
- `POST /workspace/{id}/invite`: Generate a 24-hr secure invite code string
- `POST /workspace/{inviteCode}/join`: Claim workspace membership access
- `DELETE /workspace/{id}/remove-member`: Kick members
- `DELETE /workspace/{id}/delete`: Disband (OWNER only)

### Projects

- `POST /project/{workspaceId}/create`: Setup project, scaffolds default workflow states and transition mappings.
- `GET /project/{workspaceId}`: Project list
- `POST /project/{projectId}/add-member`: Include members to scope

### Issues

- `POST /projects/{projectId}/issues`: Scaffold task, increments project counter to create sequential task IDs (e.g., REL-42).
- `PATCH /issues/{id}`: Mutate content
- `PATCH /issues/{id}/state`: Request workflow transition
- `POST /issues/{id}/dependencies`: Create blockers
- `DELETE /issues/{id}/dependencies/{blockerId}`: Resolve blockers
- `GET /issues/{id}/activity`: Fetch history audit log

### Interactions

- `POST /issues/{id}/comment`: Adds a comment, explicitly parsing `@mentions` via regex mapper to emit asynchronous Notifications.
- `GET /issues/{id}/comments`: Fetch timeline
- `PATCH /comments/{id}` & `DELETE /comments/{id}`: Edit interactions
- `GET /notifications`: Get bell events
- `PATCH /notifications/{id}/read`: Mark visual indication
- `GET /projects/{projectId}/board`: Fetch whiteboard data array
- `GET /projects/{projectId}/kanban`: Fetch structured issue array segmented by state columns.
- `GET /projects/{projectId}/analytics`: Fetch analytics stats (metrics).
