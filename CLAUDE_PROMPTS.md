# OSVitae — Claude Code Implementation Prompts
# Agile/Scrum + DevSecOps Optimization

Paste these prompts directly into Claude Code (claude) from the project root.
Organized by priority: do Phase 1 before Phase 2, etc.

---

## PHASE 1 — DATABASE FOUNDATIONS
> Run these first. Everything else depends on the schema.

---

### 1.1 — Task Type Enum + Sprint/Epic Fields on Tasks

```
Create a new Supabase migration file at supabase/migrations/00020_agile_task_fields.sql.

Add the following to the tasks table:
- A new PostgreSQL enum called task_type with values: feature, bug, security, debt, incident. Default to 'feature'.
- A boolean column called blocked with DEFAULT false.
- A text column called acceptance_criteria (nullable).
- A smallint column called story_points (nullable, range 1–21 for Fibonacci).
- A uuid column called sprint_id (nullable FK to a sprints table, set null on delete).
- A uuid column called epic_id (nullable FK to an epics table, set null on delete).

Do not create the sprints or epics tables yet — just add the nullable FK columns. Add appropriate indexes: idx_tasks_sprint on tasks(sprint_id), idx_tasks_epic on tasks(epic_id), idx_tasks_type on tasks(task_type).

Add RLS — users can only see/edit their own tasks (same pattern as existing task policies).
```

---

### 1.2 — Sprints Table

```
Create a new Supabase migration file at supabase/migrations/00021_sprints_table.sql.

Create a sprints table with:
- id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE
- name text NOT NULL (e.g. "Sprint 1", "Q2 Security Hardening")
- goal text (nullable — the sprint goal statement)
- start_date date NOT NULL
- end_date date NOT NULL
- status text DEFAULT 'planning' with a CHECK constraint allowing only: planning, active, review, closed
- capacity integer (nullable — planned story points)
- velocity integer (nullable — story points completed, set at sprint close)
- created_at timestamptz DEFAULT now()
- updated_at timestamptz DEFAULT now()

Add an update_updated_at trigger (same pattern as other tables).
Add indexes: idx_sprints_user, idx_sprints_workspace, idx_sprints_status.
Enable RLS with full CRUD policies scoped to auth.uid() = user_id.

Then add the foreign key constraint to the tasks table:
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;
```

---

### 1.3 — Epics Table

```
Create a new Supabase migration file at supabase/migrations/00022_epics_table.sql.

Create an epics table with:
- id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL
- title text NOT NULL
- description text (nullable)
- status text DEFAULT 'open' with CHECK constraint: open, in_progress, done, cancelled
- color text (nullable — hex color for UI display)
- position integer DEFAULT 0
- created_at timestamptz DEFAULT now()
- updated_at timestamptz DEFAULT now()

Add update_updated_at trigger. Add indexes: idx_epics_user, idx_epics_workspace.
Enable RLS with full CRUD policies scoped to auth.uid() = user_id.

Then add the FK constraint to tasks:
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_epic FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE SET NULL;
```

---

### 1.4 — WIP Limits on Projects + Retrospectives Table

```
Create a new Supabase migration file at supabase/migrations/00023_wip_limits_retrospectives.sql.

1. Add WIP limit columns to the projects table (check the existing schema — projects table has id, user_id, workspace_id, name, icon, color, position):
   ALTER TABLE projects ADD COLUMN wip_limit_todo integer;
   ALTER TABLE projects ADD COLUMN wip_limit_in_progress integer;
   ALTER TABLE projects ADD COLUMN wip_limit_in_review integer;

2. Create a retrospectives table with:
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
   - sprint_id uuid NOT NULL REFERENCES sprints(id) ON DELETE CASCADE
   - went_well text
   - improvements text
   - action_items text[] DEFAULT '{}'
   - mood smallint CHECK (mood BETWEEN 1 AND 5)
   - created_at timestamptz DEFAULT now()
   - updated_at timestamptz DEFAULT now()

Add update_updated_at trigger. Add index: idx_retrospectives_sprint.
Enable RLS scoped to auth.uid() = user_id.
```

---

### 1.5 — Audit Log Table

```
Create a new Supabase migration file at supabase/migrations/00024_audit_log.sql.

Create an audit_log table with:
- id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
- action text NOT NULL (e.g. 'task.created', 'task.deleted', 'sprint.closed', 'security.credential_accessed')
- resource_type text (e.g. 'task', 'sprint', 'project', 'apple_credentials')
- resource_id uuid (nullable)
- old_value jsonb (nullable)
- new_value jsonb (nullable)
- ip_address text (nullable)
- created_at timestamptz DEFAULT now()

Add indexes: idx_audit_user on audit_log(user_id), idx_audit_action on audit_log(action), idx_audit_created on audit_log(created_at DESC).

Enable RLS: users can SELECT their own rows (auth.uid() = user_id). No INSERT policy — inserts will happen via service role or edge functions only. No UPDATE or DELETE — audit logs are immutable.
```

---

## PHASE 2 — CONSTANTS & ICONS

---

### 2.1 — Add DevSecOps Icons to WS_ICON_OPTIONS

```
Edit the file src/lib/constants.jsx.

In the import block at the top, add these Lucide icons to the existing import from "lucide-react":
Shield, Bug, Terminal, GitBranch, Cpu, Lock, FlaskConical, Network, AlertTriangle, Zap, Database, Server

Then add these entries to the WS_ICON_OPTIONS array (after the existing items):
{ key: "Shield", component: Shield },
{ key: "Bug", component: Bug },
{ key: "Terminal", component: Terminal },
{ key: "GitBranch", component: GitBranch },
{ key: "Cpu", component: Cpu },
{ key: "Lock", component: Lock },
{ key: "FlaskConical", component: FlaskConical },
{ key: "Network", component: Network },
{ key: "Database", component: Database },
{ key: "Server", component: Server },

Also add a TASK_TYPES constant array for the new task_type enum:
export const TASK_TYPES = [
  { key: "feature",  label: "Feature",  color: "#6366F1", icon: "Rocket" },
  { key: "bug",      label: "Bug",      color: "#EF4444", icon: "Bug" },
  { key: "security", label: "Security", color: "#F59E0B", icon: "Shield" },
  { key: "debt",     label: "Tech Debt",color: "#8B5CF6", icon: "Wrench" },
  { key: "incident", label: "Incident", color: "#FF3D3D", icon: "AlertTriangle" },
];

Add a STORY_POINTS constant array (Fibonacci):
export const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21];
```

---

## PHASE 3 — SIDEBAR RESTRUCTURE

---

### 3.1 — Add Scrum + Security Sections to Sidebar

```
Edit src/components/Sidebar.jsx.

1. Add two new section keys to the sidebarSections state initialization in App.jsx (wherever sidebarSections is defined): scrum: true, security: false.

2. In Sidebar.jsx, between the "Home" section block and the "Track" section block, add a new "Scrum" section using the exact same pattern as the existing sections (collapsible, with ChevronDown). The nav items for this section are:
   - { icon: <Layers size={18} />, label: "Sprint Board", id: "sprintBoard" }
   - { icon: <ListChecks size={18} />, label: "Backlog", id: "backlog" }
   - { icon: <TrendingDown size={18} />, label: "Burndown", id: "burndown" }
   - { icon: <RotateCcw size={18} />, label: "Retrospective", id: "retrospective" }

3. Add a "Security" section below "Track" with:
   - { icon: <Shield size={18} />, label: "Security Issues", id: "securityIssues" }
   - { icon: <ScrollText size={18} />, label: "Audit Log", id: "auditLog" }
   - { icon: <AlertTriangle size={18} />, label: "Vuln Tracker", id: "vulnTracker" }

4. Import all new icons at the top: Layers, ListChecks, TrendingDown, RotateCcw, Shield, ScrollText, AlertTriangle (check which are already imported).

5. Move the existing "Review" page reference to use id: "retrospective" instead (it's currently unreachable from the sidebar nav).
```

---

## PHASE 4 — KANBAN BOARD UPGRADES

---

### 4.1 — Add Sprint Grouping + Story Points to Kanban

```
Edit src/components/KanbanBoard.jsx.

1. Add "sprint" to GROUPING_OPTIONS array:
   { key: "sprint", label: "Sprint" }

2. In the column-building logic (the if/else if block starting with "if (groupBy === 'status')"), add a new else if for sprint grouping. It should work like the workspace/project grouping: find all unique sprint_ids on filtered tasks, build a column per sprint using the sprint name as label, plus a "Backlog" column for tasks with no sprint_id.

   The component receives tasks, ws, and projects as props — you'll need to also accept a sprints prop (array of sprint objects with id, name, color). Add this to the KanbanBoard component signature.

3. In KanbanCard, in the badges flex row (where workspace, project, pomos, dueDate, and reward badges are rendered), add:
   - A story points badge: if task.storyPoints exists, render a badge with label "SP {task.storyPoints}" in indigo color.
   - A blocked indicator: if task.blocked is true, render an AlertTriangle icon (size 10, color #EF4444) at the start of the header row, and add a left border of 3px solid #EF4444 to the card container style.
   - A task type badge: if task.taskType exists and is not 'feature', render a colored pill using the TASK_TYPES constant from constants.jsx for the color.

4. Add a sprint filter to the toolbar. Add a sprints prop to KanbanBoard. In the toolbar, after the group-by pills, add a sprint selector: "Sprint: All | Active | [sprint names...]" using the same pill button style as filterPriority. Wire this to filter tasks before the sort/group logic runs.
```

---

### 4.2 — WIP Limits Display in Kanban Columns

```
Edit src/components/KanbanBoard.jsx.

In the KanbanColumn component:
1. Add a wipLimit prop (integer or null).
2. In the column header where tasks.length is shown in the badge, change the display to:
   - If no wipLimit: just show tasks.length (unchanged)
   - If wipLimit exists: show "{tasks.length} / {wipLimit}"
   - If tasks.length > wipLimit: color the badge background #EF444420 and text color #EF4444 to signal the WIP limit is exceeded

In the main KanbanBoard component, when building columns for status grouping, pass wipLimit down from the active project's wip_limit_todo / wip_limit_in_progress / wip_limit_in_review fields. KanbanBoard already receives a projects prop — use the activeProjectId (or add a prop for it) to look up the current project's WIP limits.
```

---

### 4.3 — Replace window.confirm() with Modal Component

```
Search the entire src/ directory for all uses of window.confirm() or confirm().

For each occurrence (likely in KanbanBoard.jsx, ProjectPage.jsx, TaskDetailPage.jsx, and possibly AllTasksPage.jsx):
1. Replace the inline confirm() call with a state variable: const [confirmDelete, setConfirmDelete] = useState(null) where the value holds the item to delete (id + title).
2. Render a Modal component (imported from "../ui") that shows when confirmDelete is not null. The modal should display "Delete [item name]?" with a Cancel button and a red Delete button.
3. The Delete button calls the actual delete function and then sets confirmDelete back to null. The Cancel button also sets it to null.

Use the existing Modal component from src/components/ui/Modal.jsx — check its props interface first before implementing.
```

---

## PHASE 5 — PAGE UPGRADES

---

### 5.1 — Sprint Context Banner on TodayPage

```
Edit src/components/pages/TodayPage.jsx.

Add a SprintBanner component at the top of the page (above the "Today's Schedule" heading). This component should:

1. Accept props: activeSprint (the currently active sprint object or null), sprintTasks (tasks assigned to this sprint), and all tasks.

2. If activeSprint is null or undefined, render nothing (return null).

3. If activeSprint exists, render a Glass component containing:
   - Left side: sprint name in heading font, sprint goal in muted body font below it
   - Center: a Ring component (already imported) showing story points completion percentage. Calculate as: (story points of done sprint tasks) / (total story points of sprint tasks) * 100. Fall back to task count if no story points are set.
   - Right side: "Day X of Y" — calculate current day number using: Math.ceil((new Date() - new Date(activeSprint.start_date)) / (1000*60*60*24)) and total days similarly. Show days remaining in muted text below.
   - A small colored status badge (on-track in green, at-risk in orange, overdue in red) based on whether the sprint end_date has passed or the burndown pace is behind.

Place the SprintBanner between the page title/XP section and the TodaySchedule component.
```

---

### 5.2 — Sprint Hub (Rework ReviewPage into Retrospective)

```
Rework src/components/pages/ReviewPage.jsx into a full Sprint Hub page.

Add tab state: const [tab, setTab] = useState("overview"). Render three tab buttons at the top: "Overview", "Retrospective", "Security Posture".

TAB 1 — Overview (current content + additions):
Keep the existing 3 stat cards (Open Tasks, Deadlines, Inbox Items). Add 3 more cards: Sprint Velocity (story points completed this sprint), Sprint Health (days remaining), Open Security Issues (count of tasks with task_type = 'security' and not done).
Keep the Upcoming Deadlines and Habits lists.

TAB 2 — Retrospective (new):
Accept a prop: activeSprint, retrospectives (array), onSaveRetro (callback).
If no activeSprint, show a message: "No active sprint. Start a sprint to run retrospectives."
Otherwise show a form with three labeled textarea fields: "What went well", "What could be improved", "Action items (one per line)". A mood selector (1–5 scale using emoji). A Save button that calls onSaveRetro with the data.
Below the form, show previous retrospectives (if retrospectives prop is populated) as collapsible Glass cards sorted by created_at DESC.

TAB 3 — Security Posture (new):
Accept props: tasks, auditLog.
Show: count of open security tasks by priority (high/medium/low) as colored stat cards. A list of the 5 most recent auditLog entries (action, resource_type, created_at). A list of overdue security tasks (past due_date and not done).
```

---

### 5.3 — Sprint + Story Points on ProjectPage

```
Edit src/components/pages/ProjectPage.jsx.

1. Add a sprint badge below the project name. Accept an activeSprint prop. If activeSprint exists and has tasks in this project, render a pill badge: "Sprint: {activeSprint.name} · Day {currentDay} of {totalDays}". Style it like the existing workspace breadcrumb span.

2. Replace the single progress bar with dual metrics:
   - Keep the existing task completion bar (done tasks / total tasks)
   - Add a second bar below it labeled "Story Points" showing done story points / total story points. Calculate by summing task.storyPoints for done vs all project tasks. If no tasks have story points set, hide this bar entirely.
   - Show the percentage as colored text on the right of each bar.

3. Add a "Backlog / Sprint" task grouping toggle above the task list. Two pill buttons: "All", "Sprint", "Backlog". When "Sprint" is selected, only show tasks where task.sprint_id === activeSprint?.id. When "Backlog" is selected, show tasks where task.sprint_id is null/undefined. Default is "All".

4. On each task row, if the task has a taskType of 'security', 'bug', or 'incident', prepend a small colored dot or pill before the task title using TASK_TYPES from constants.jsx for the color lookup.
```

---

### 5.4 — Sprint Board Page (New Page)

```
Create a new file src/components/pages/SprintBoardPage.jsx.

This page shows the active sprint's kanban board. It should:

1. Accept props: sprints, tasks, ws, projects, pColors, goTask, toggleTask, deleteTask, startFocus, updateTaskStatus, updateTaskField.

2. At the top, render a sprint selector dropdown. Find sprints where status is 'active' — default to the first active sprint. If no active sprint, show a message with a button to create one.

3. Show sprint stats in a row of Glass stat cards: Goal (sprint goal text), Velocity (done SP / total SP), Days Remaining, Tasks Done.

4. Render the existing KanbanBoard component (import it) filtered to only show tasks that belong to the selected sprint (sprint_id === selectedSprintId). Pass the sprint's WIP limits as wipLimit props per column.

5. Below the board, add a "Sprint Backlog" section (collapsible) that shows tasks not yet assigned to any sprint, with a button on each to "Add to Sprint". This calls updateTaskField(taskId, 'sprint_id', selectedSprintId).

Wire this page up in App.jsx for the 'sprintBoard' page id added to the sidebar.
```

---

### 5.5 — Backlog Page (New Page)

```
Create a new file src/components/pages/BacklogPage.jsx.

This page is the product backlog — all tasks not assigned to any sprint, organized by epic.

1. Accept props: tasks, epics, sprints, ws, projects, pColors, goTask, toggleTask, deleteTask, startFocus, updateTaskField.

2. At the top, show a toolbar with: filter by workspace, filter by task_type (All | Feature | Bug | Security | Debt | Incident), sort by priority/story_points/created.

3. Group tasks by epic_id. Show one section per epic (using the epic color as an accent). Tasks with no epic go in an "Ungroomed" section at the bottom.

4. Each task row shows: priority dot, task type badge, title, story_points badge (or a "-" placeholder if not set), due_date, and an "Add to Sprint" button that opens a small dropdown of active/planning sprints to assign the task to.

5. Add an "Add Epic" button at the top that opens a Modal to create a new epic (title, description, color, workspace).

Wire this page in App.jsx for the 'backlog' page id.
```

---

### 5.6 — Burndown + Velocity Page (New Page)

```
Create a new file src/components/pages/BurndownPage.jsx.

This page shows Scrum metrics. Since the project uses no charting library, build SVG charts inline.

1. Accept props: sprints, tasks.

2. Sprint selector at top (same pattern as SprintBoardPage).

3. BURNDOWN CHART — an SVG line chart showing:
   - X axis: each day of the sprint (start_date to end_date)
   - Y axis: story points remaining
   - Ideal line: straight diagonal from total SP on day 1 to 0 on last day
   - Actual line: calculated from task completion dates — for each day, sum SP of tasks NOT yet done as of that date
   - Render as a simple SVG with polyline elements. Use the CSS variables (var(--primary), var(--muted)) for colors.

4. VELOCITY CHART — a bar chart (SVG) showing story points completed per closed sprint (last 6 sprints). Bar height proportional to velocity. Show average velocity as a horizontal dashed line.

5. CYCLE TIME section — for each task in the selected sprint that is done, calculate days from created_at to updated_at (as a proxy for when it was completed). Show min, max, and average cycle time.

Wire in App.jsx for the 'burndown' page id.
```

---

## PHASE 6 — SECURITY FEATURES

---

### 6.1 — Security Issues Page (New Page)

```
Create a new file src/components/pages/SecurityIssuesPage.jsx.

This page shows all tasks with task_type = 'security', 'bug', or 'incident' across all workspaces.

1. Accept props: tasks, ws, projects, pColors, goTask, updateTaskField.

2. At the top, show 4 stat cards: Open Security Issues (count), Open Bugs (count), Open Incidents (count), Resolved This Month (count of done security/bug/incident tasks with updated_at in current month).

3. Below stats, show a filter row: "Type: All | Security | Bug | Incident" and "Priority: All | High | Medium | Low" and "Status: All | Open | Done".

4. Show filtered tasks in a table-like list. Each row: priority dot, task type colored badge (using TASK_TYPES colors), title, workspace/project breadcrumb, due date (red if overdue), status pill, and a quick-action to mark done.

5. Add a "New Security Issue" button at the top right that opens a modal pre-populated with task_type = 'security'.

Wire in App.jsx for the 'securityIssues' page id.
```

---

### 6.2 — Audit Log Page (New Page)

```
Create a new file src/components/pages/AuditLogPage.jsx.

This page displays the audit_log table.

1. Accept props: auditLog (array of log entries), loading.

2. Show a searchable, filterable table of audit log entries. Columns: Timestamp, Action, Resource Type, Resource ID (truncated), Details (old→new value summary).

3. Filter controls: search by action text, filter by resource_type (task, sprint, project, apple_credentials, etc.), date range picker (from/to date inputs).

4. Color-code actions: deletes in red, creates in green, updates in blue/muted, security-related actions (credential_accessed, export_data) in amber.

5. Pagination: show 50 entries per page with prev/next buttons.

6. Load audit_log data in App.jsx via: supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200)

Wire in App.jsx for the 'auditLog' page id.
```

---

## PHASE 7 — CI/CD & TOOLING

---

### 7.1 — GitHub Actions CI Pipeline

```
Create the file .github/workflows/ci.yml.

This workflow should trigger on: push to any branch, pull_request to main.

Jobs:
1. lint — runs on ubuntu-latest, uses Node 20, runs: npm ci, then npm run lint. Fails the build on any ESLint error.

2. build — runs after lint, same setup, runs: npm ci, then npm run build. Fails if build produces errors.

3. security-audit — runs after lint independently (parallel with build), same Node setup, runs: npm audit --audit-level=high. This fails the job only on HIGH or CRITICAL severity vulnerabilities, not moderate.

4. type-check — if the project gets TypeScript added later, add a tsc --noEmit step here as a placeholder job that just echoes "No TypeScript yet".

Add environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as GitHub Actions secrets (reference them as ${{ secrets.VITE_SUPABASE_URL }}).

Create the .github directory if it doesn't exist.
```

---

### 7.2 — Dependabot Configuration

```
Create the file .github/dependabot.yml.

Configure Dependabot to:
1. Check npm dependencies weekly (every Monday), targeting the main branch. Group all patch updates into a single PR. Group all minor updates into a single PR. Keep major updates as individual PRs. Label all Dependabot PRs with "dependencies".

2. Check GitHub Actions versions monthly. Label with "dependencies" and "github-actions".

Set commit-message prefix to "chore(deps):" for npm and "chore(actions):" for GitHub Actions.

Limit open pull requests to 5 at a time (open-pull-requests-limit: 5).
```

---

### 7.3 — ESLint Security Plugins

```
Install the following dev dependencies:
npm install --save-dev eslint-plugin-security eslint-plugin-no-secrets

Then edit eslint.config.js to add both plugins to the existing config.

For eslint-plugin-security: import it and add it to the plugins object, then enable the recommended ruleset: ...pluginSecurity.configs.recommended.rules in the rules section.

For eslint-plugin-no-secrets: import it and add it with the rule 'no-secrets/no-secrets': ['error', { tolerance: 4.2 }] — this tolerance level avoids false positives on things like UUIDs and base64 strings while still catching actual secrets.

After adding, run npm run lint to verify no existing code is flagged. If there are false positives, add targeted eslint-disable comments with an explanation, do not just disable the entire rule.
```

---

### 7.4 — Pre-commit Secret Scanning with Husky

```
Install husky and lint-staged:
npm install --save-dev husky lint-staged

Initialize husky:
npx husky init

Create the pre-commit hook at .husky/pre-commit with:
1. Run lint-staged (to ESLint changed files)
2. Check for potential secrets using a grep pattern on staged files: look for patterns like SUPABASE_SERVICE_KEY, api_key=, password=, secret=, private_key in staged .js and .jsx files. If found, abort the commit with an error message.

Add lint-staged config to package.json:
"lint-staged": {
  "*.{js,jsx}": ["eslint --fix", "git add"],
  "*.{js,jsx,ts,tsx}": ["echo 'Checking for secrets...'"]
}

Also create a .husky/commit-msg hook that enforces conventional commit format: commits must start with one of: feat:, fix:, security:, chore:, docs:, test:, refactor:, ci:
```

---

### 7.5 — Vitest Testing Setup

```
Install Vitest and testing utilities:
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

Edit vite.config.js to add the test configuration:
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.js'],
}

Create src/test/setup.js that imports '@testing-library/jest-dom'.

Add test scripts to package.json:
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"

Then create the first three test files as a foundation:

1. src/lib/validate.test.js — test every function in validate.js. Import each validator and write at least 3 tests per function: one passing case, one failing case, one edge case.

2. src/lib/constants.test.js — test that WS_ICON_OPTIONS has no duplicate keys, that TASK_TYPES has valid color hex values, that STORY_POINTS is a valid Fibonacci sequence subset, that getWsIcon returns a fallback for unknown keys.

3. src/hooks/useFlash.test.js — test the flash/toast hook basic show and hide behavior using renderHook from @testing-library/react.

Run npm run test:run after creating these files and fix any failures before considering this done.
```

---

## PHASE 8 — CODE CLEANUP

---

### 8.1 — Delete Unused Scaffold Assets

```
Delete the following files that are default Vite scaffold assets and are not referenced anywhere in the application:
- src/assets/react.svg
- src/assets/vite.svg

Before deleting, run: grep -r "react.svg\|vite.svg" src/ to confirm they are not imported anywhere. If they are imported somewhere, fix the import first, then delete.

Also check if src/assets/hero.png is used: grep -r "hero.png" src/. If it is not used, delete it too. If it is used, leave it.
```

---

### 8.2 — Extract Shared Style Constants

```
Create a new file src/lib/styles.js.

Extract the most frequently repeated inline style objects from the codebase into named exports. Scan KanbanBoard.jsx, TodayPage.jsx, ProjectPage.jsx, and ReviewPage.jsx for style objects that appear 3+ times.

Likely candidates:
- cardStyle — the base Glass card container style
- badgeStyle(color) — function returning the colored pill badge style
- monoLabel — the muted uppercase monospace label style (fontSize:9/10, fontFamily:"var(--mono)", color:"var(--muted)", fontWeight:600)
- priorityDot(color) — the small circle priority indicator
- sectionHeader — the section heading style (fontFamily:"var(--heading)", fontSize:15, fontWeight:700, color:"var(--text)")

Export each as a const. Then do a search-and-replace in KanbanBoard.jsx and the pages listed above to use these shared styles where applicable.

Do not change the visual appearance of anything — this is a pure refactor. After the changes, run npm run build to verify nothing broke.
```

---

### 8.3 — Move PrivacyPolicy to Static Route

```
In App.jsx, check how PrivacyPolicy.jsx is currently rendered (look for the PrivacyPolicy import and where it's conditionally shown).

Move the PrivacyPolicy to only be accessible via a dedicated URL path (e.g., when window.location.pathname === '/privacy'). It should not be part of the main app routing state machine (the page state variable).

In the main app render, add a check at the top:
if (window.location.pathname === '/privacy') return <PrivacyPolicy />;

This keeps the policy accessible but removes it from the app's core state. Update vercel.json to ensure /privacy routes to index.html (it should already since you have SPA routing configured).
```

---

## REFERENCE — Page ID to Component Map

When App.jsx needs to route to new pages, use these page IDs:

| Page ID          | Component File                        | Phase |
|------------------|---------------------------------------|-------|
| `sprintBoard`    | pages/SprintBoardPage.jsx             | 5.4   |
| `backlog`        | pages/BacklogPage.jsx                 | 5.5   |
| `burndown`       | pages/BurndownPage.jsx                | 5.6   |
| `retrospective`  | pages/ReviewPage.jsx (reworked)       | 5.2   |
| `securityIssues` | pages/SecurityIssuesPage.jsx          | 6.1   |
| `auditLog`       | pages/AuditLogPage.jsx                | 6.2   |
| `vulnTracker`    | (extend SecurityIssuesPage with tab)  | —     |

---

## QUICK START ORDER

If you want to implement incrementally, do it in this sequence:

1. Run prompt **1.1** → **1.2** → **1.3** (schema foundation)
2. Run prompt **2.1** (constants + icons)
3. Run prompt **3.1** (sidebar navigation)
4. Run prompt **4.1** (Kanban story points + sprint grouping)
5. Run prompt **5.1** (TodayPage sprint banner)
6. Run prompt **5.4** (Sprint Board page — this gives the most immediate Scrum value)
7. Run prompts **7.1** → **7.3** → **7.5** (CI/CD + testing)
8. Everything else in order
