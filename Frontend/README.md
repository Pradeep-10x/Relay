# Plane — Jira-like Project Management Frontend

A modern, dense, powerful project management frontend built with **React + TypeScript + Tailwind CSS**.

---

## ✨ Features

- 🎨 **Dark / Light theme toggle** with CSS variables
- 🗂️ **Kanban Board** with full drag-and-drop (dnd-kit)
- 📋 **Issue Detail Panel** — status, priority, assignees, labels, due date
- 💬 **Comment system** with `@mention` support
- 🔔 **Notification system** with unread badge
- 📊 **Analytics page** — burndown chart, status/priority breakdown
- 🖌️ **Drawing boards** per project
- 🔒 **JWT Auth** — login, register, protected routes
- ⚡ **React Query** — smart caching, background refetch
- 🧩 **Zustand** stores for auth + UI state
- 🏗️ Fully modular, ready to wire to your backend

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:

```
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Start dev server

```bash
npm run dev
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # ProtectedRoute, PublicRoute
│   ├── issue/          # IssueDetailPanel, CreateIssueModal, IssueFiltersBar
│   ├── layout/         # AppShell, Sidebar, Topbar
│   └── ui/             # Avatar, Badge, Spinner, Skeleton, Tooltip, etc.
├── constants/          # STATUS_CONFIG, PRIORITY_CONFIG, ROUTES, QUERY_KEYS
├── hooks/              # useAuth, useIssues, useComments, useNotifications, ...
├── pages/              # LoginPage, RegisterPage, WorkspaceDashboard, KanbanBoardPage, ...
├── services/           # apiClient, authService, issueService, workspaceService, ...
├── store/              # authStore (Zustand), uiStore (Zustand)
├── types/              # All TypeScript interfaces
└── utils/              # cn, formatDate, getInitials, parseMentions, ...
```

---

## 🔌 API Integration

All services are in `src/services/`. They expect a REST API with this structure:

| Endpoint | Description |
|---|---|
| `POST /auth/login` | Login → `{ access_token, user }` |
| `POST /auth/register` | Register → `{ access_token, user }` |
| `GET /auth/me` | Current user |
| `GET /workspaces` | All workspaces |
| `GET /workspaces/:id/projects` | Projects in workspace |
| `GET /projects/:id/issues` | Issues with filters |
| `POST /projects/:id/issues` | Create issue |
| `PATCH /issues/:id` | Update issue |
| `GET /issues/:id/comments` | Comments |
| `POST /issues/:id/comments` | Create comment (with `mention_ids`) |
| `GET /projects/:id/analytics` | Analytics data |
| `GET /notifications` | Notifications |
| `POST /notifications/mark-all-read` | Mark all read |
| `GET /projects/:id/boards` | Drawing boards |
| `POST /projects/:id/boards` | Create drawing board |

---

## 🎨 Design System

CSS variables are in `src/index.css`. Key tokens:

```css
--bg-primary          /* Page background */
--bg-secondary        /* Sidebar, cards */
--accent-primary      /* Blue/Cyan accent (#06a6f0 dark, #2fbeff light) */
--text-primary        /* Main text */
--text-tertiary       /* Muted / placeholder */
--border-subtle       /* Subtle borders */
```

---

## 🧰 Tech Stack

| Library | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| React Router v6 | Routing |
| TanStack Query v5 | Data fetching + cache |
| Zustand | Global state |
| dnd-kit | Drag and drop |
| Axios | HTTP client |
| Tailwind CSS | Utility styling |
| date-fns | Date formatting |
| react-hot-toast | Notifications |
| lucide-react | Icons |

---

## 🏗️ Extending

### Add a new page
1. Create `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add nav item in `src/components/layout/Sidebar.tsx`

### Add a new API call
1. Add method to relevant service in `src/services/`
2. Add query key in `src/constants/index.ts`
3. Create hook in `src/hooks/index.ts`

### Connect Drawing Board
Replace the placeholder in `DrawingBoardPage.tsx` with [Excalidraw](https://docs.excalidraw.com/) or [tldraw](https://tldraw.dev/):

```bash
npm install @excalidraw/excalidraw
```

---

## 📝 Notes

- Token is stored in `localStorage` as `access_token`
- Dark mode class is toggled on `<html>` element
- All issue state updates are optimistic (local first, then API)
- Mention system uses `@[Name](userId)` syntax in comment content
