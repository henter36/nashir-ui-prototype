# Workspace Team + Roles + Activity Source Gate — UI-Safe Minimal Patch

## Goal

Prevent workspace members, roles, permissions, comments, and activity log entries from becoming separate local entities across:

- SystemAdminPage
- TeamCollaborationPage
- SettingsPage

## Internal Ownership

| Entity | Owner | UI wording |
|---|---|---|
| workspace members | SystemAdminPage | الأعضاء |
| workspace roles | SystemAdminPage | الأدوار والصلاحيات |
| collaboration comments | TeamCollaborationPage | التعليقات والقرارات |
| activity log | Shared internal store | سجل النشاط |
| settings audit | SettingsPage only | سجل الإعدادات |

## Internal stores

```txt
nashir_mock_workspace_members
nashir_mock_workspace_roles
nashir_mock_activity_log
nashir_mock_collaboration_comments
```

## UI-Safe Rule

Do not show these as user-facing text:

```txt
مصدر الحقيقة
مصدر مشترك
الشاشة المالكة
memberId
roleId
permissionId
activityId
commentId
sourceSurface
SystemAdminPage
TeamCollaborationPage
SettingsPage as ownership wording
```

Allowed user-facing wording:

```txt
عضو نشط
مراجع
محرر
صلاحية متاحة
تعليق مفتوح
قرار معتمد
سجل نشاط
سجل إعدادات
```

## Scope

Allowed files:

```txt
src/utils/teamAccessStore.js
src/pages/SystemAdminPage.jsx
src/pages/TeamCollaborationPage.jsx
src/pages/SettingsPage.jsx
```

Do not edit App.jsx, Sidebar.jsx, routes, or global styles unless build fails.

## Required patch

### 1. Create helper

Create:

```txt
src/utils/teamAccessStore.js
```

Use the provided helper.

### 2. SystemAdminPage.jsx

SystemAdmin owns workspace members and roles.

- Import useEffect if missing.
- Import:
  - readWorkspaceMembers
  - upsertWorkspaceMember
  - deleteWorkspaceMember
  - readWorkspaceRoles
  - upsertWorkspaceRole
  - deleteWorkspaceRole
  - readActivityLog
  - addActivity
  - getWorkspaceTeamSummary

- Replace local `users`/members state with `readWorkspaceMembers(users)`.
- Replace local roles/workspaces if applicable with `readWorkspaceRoles(role seed)`.
- Any user/member status update must persist through `upsertWorkspaceMember`.
- Any role/permission update must persist through `upsertWorkspaceRole`.
- Any admin action should add an activity through `addActivity`.

### 3. TeamCollaborationPage.jsx

TeamCollaboration consumes members/roles and owns collaboration comments.

- Import useEffect if missing.
- Import:
  - readWorkspaceMembers
  - readWorkspaceRoles
  - upsertWorkspaceMember
  - readCollaborationComments
  - upsertCollaborationComment
  - readActivityLog
  - addActivity
  - getWorkspaceTeamSummary

- Replace local `members` initialization with `readWorkspaceMembers(INITIAL_MEMBERS)`.
- Replace local `comments` initialization with `readCollaborationComments(INITIAL_COMMENTS)`.
- Use roles from `readWorkspaceRoles(ROLE_OPTIONS)`.
- Inviting/updating/suspending members may remain in TeamCollaboration as UX shortcut, but must write to the shared member store.
- Adding/resolving/reopening comments must write to `collaboration_comments`.
- Audit/activity additions must write to `activity_log`.
- Do not display internal IDs.

### 4. SettingsPage.jsx

Settings must not own workspace members/roles.

- Import:
  - getWorkspaceTeamSummary
- Use it only for summary metrics if needed.
- Keep `auditLog` as settings-specific audit only.
- Do not add role/member editing in Settings.
- Do not show internal IDs.

## Verification

```bash
npm run build

grep -RIn \
  "مصدر الحقيقة\|مصدر مشترك\|الشاشة المالكة\|memberId\|roleId\|permissionId\|activityId\|commentId\|sourceSurface\|SystemAdminPage\|TeamCollaborationPage\|SettingsPage" \
  src/pages src/components
```

Acceptable:
- imports
- component function names
- internal code identifiers not rendered

Not acceptable:
- visible JSX strings exposing internal architecture.

## Commit

```bash
git add src/utils/teamAccessStore.js src/pages/SystemAdminPage.jsx src/pages/TeamCollaborationPage.jsx src/pages/SettingsPage.jsx docs/patch-guides/team-access-source-gate-ui-safe.md
git commit -m "ui: share workspace team and activity state safely"
git push origin main
```
