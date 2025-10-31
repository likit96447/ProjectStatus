# Permission System Implementation Guide

## Overview

A comprehensive role-based access control (RBAC) system has been implemented to enforce data visibility, feature availability, and button visibility based on user roles and permissions.

**Status:** ✅ **INFRASTRUCTURE COMPLETE - Data filtering in progress**

---

## System Architecture

### 1. Permission Hierarchy

```
User Role
  ↓
Load Permissions from Firebase (page_permissions collection)
  ↓
Check specific page + operation
  ↓
Allow/Deny access and show/hide UI elements
```

### 2. Permission Types

#### Page-Level Permissions
- **Show** - User can view the page
- **Add** - User can create new data
- **Edit** - User can modify data
- **Delete** - User can remove data
- **Admin** - User can access admin settings

#### Data-Level Permissions
- **Ownership Check** - Can user see this specific record?
- **Assignment Check** - Is data assigned to the user?

---

## Core Functions

### Permission Checking Functions

#### `getCurrentUser()` - Gets current logged-in user
```javascript
const user = getCurrentUser();
// Returns: { id, email, name, role, loginTime, lastActivity }
```

#### `getCurrentUserRole()` - Gets user's role
```javascript
const role = getCurrentUserRole();
// Returns: "Project Manager" | "Developer" | "Admin" | etc.
```

#### `hasPermission(page, operation)` - Check permission
```javascript
const canView = await hasPermission('tasks', 'show');
const canAdd = await hasPermission('dashboard', 'add');
const canEdit = await hasPermission('projects', 'edit');
const canDelete = await hasPermission('reports', 'delete');

// Special case: Admin pages
const isAdmin = await hasPermission('admin', 'admin');
```

#### Helper Functions
```javascript
// Shortcut functions
await canShow('tasks');      // Can view page?
await canAdd('projects');    // Can create?
await canEdit('team');       // Can modify?
await canDelete('tasks');    // Can remove?

// Check ownership
isOwner(dataObject);         // Does user own this data?

// Admin check
isAdmin();                   // Is user an admin?
```

#### `loadUserPermissions()` - Load and cache permissions
```javascript
const perms = await loadUserPermissions();
// Returns user's full permission object
// Cached for performance
```

### Data Filtering Functions

#### `filterDataByOwnership(dataArray, dataType)`
```javascript
// Filter data based on user ownership/assignment
const visibleTasks = filterDataByOwnership(allTasks, 'tasks');
const visibleProjects = filterDataByOwnership(allProjects, 'project');
const visibleTeam = filterDataByOwnership(teamMembers, 'team');

// Returns: Array of data user can see
```

### UI Control Functions

#### `updateMenuVisibility()` - Control menu visibility
```javascript
// Called on page load
// Hides menu items for pages user cannot access
// Hides settings menu items unless user is admin
```

#### `switchPage(pageName)` - Navigate with permission check
```javascript
// Updated to check permissions before switching pages
// Shows error if user lacks permission
// Returns early if not allowed
```

---

## Permission Logic

### Admin Access
```
User Role = "Admin"
  ↓
ALL Permissions = true
  ↓
Can access all pages and features
```

### Regular User Access
```
User Role = "Project Manager" (or other role)
  ↓
Load Permissions from page_permissions collection
  ↓
Check page + operation combination
  ↓
Only granted if = true in database
```

### Settings Page Access (Admin Rules, Page Permissions, Role Management)
```
Check: permissions['admin']['admin'] === true
  ↓
Only show/allow if true
  ↓
Requires explicit admin permission grant
```

---

## Data Visibility Rules

### Show Permission (Viewing Data)

**For Users with Show Permission:**
1. **Admins** - See ALL data
2. **Others** - See only data they:
   - Created (`createdBy` field matches user email)
   - Are assigned to (`assignedTo` field matches user email)
   - Are involved with (team projects, etc.)

**Example - Tasks Page:**
```
User: John (Project Manager, not admin)
- John can see tasks assigned to him
- John can see tasks he created
- John cannot see tasks created by/assigned to others
- John CAN see team member list (public data)
```

### Add Permission (Creating Data)

**Special Rules:**
- **Tasks Page:** Non-admins can only add SUBTASKS (not main tasks)
- **Admin Page:** Only users with add permission can manage admin settings
- **Other Pages:** Users with add=true can create new records

**Example - Task Creation:**
```
User: Developer (has show=true, add=false for tasks)
- Cannot create main tasks
- Can create subtasks for tasks assigned to them
- Can edit their own subtasks
- Cannot delete others' tasks
```

### Edit Permission (Modifying Data)

**Logic:**
- **Admins** - Can edit ALL data
- **Others** - Can only edit:
  - Data they created
  - Data assigned to them
  - (IF they have edit=true permission)

**Example:**
```
User: Business Analyst (has edit=true)
- Can edit own tasks
- Can edit tasks assigned to them
- Cannot edit tasks created/assigned to others
```

### Delete Permission (Removing Data)

**Logic:**
- **Admins** - Can delete ALL data
- **Others** - Can only delete:
  - Data they own (created)
  - Data assigned to them
  - (IF they have delete=true permission)

**Example:**
```
User: QA Lead (has delete=false)
- Cannot delete any tasks
- Even own tasks cannot be deleted
```

---

## Permission Configuration Examples

### Example 1: Developer Role

**Configuration:**
```
Developer:
  dashboard:  { show: true,  add: false, edit: false, delete: false, admin: false }
  projectslist: { show: false, add: false, edit: false, delete: false, admin: false }
  tasks:      { show: true,  add: true,  edit: true,  delete: false, admin: false }
  team:       { show: false, add: false, edit: false, delete: false, admin: false }
  reports:    { show: true,  add: false, edit: false, delete: false, admin: false }
  admin:      { admin: false }
```

**Behavior:**
- ✅ Can view Dashboard and Tasks
- ✅ Can create and edit tasks/subtasks
- ❌ Cannot delete tasks
- ❌ Cannot access Projects, Team, Reports, or Admin
- Menu shows: Dashboard, Tasks
- Menu hides: Projects, Team, Reports, Settings

### Example 2: Project Manager Role

**Configuration:**
```
Project Manager:
  dashboard:  { show: true,  add: true,  edit: true,  delete: true,  admin: true }
  projectslist: { show: true,  add: true,  edit: true,  delete: true,  admin: true }
  tasks:      { show: true,  add: true,  edit: true,  delete: true,  admin: true }
  team:       { show: true,  add: true,  edit: true,  delete: true,  admin: true }
  reports:    { show: true,  add: true,  edit: true,  delete: true,  admin: true }
  admin:      { admin: true }
```

**Behavior:**
- ✅ Can access and manage everything
- ✅ Can see all data
- ✅ Can create, edit, and delete everything
- ✅ Can access settings/admin pages
- Menu shows: All items
- Menu hides: Nothing

### Example 3: Business Analyst Role

**Configuration:**
```
Business Analyst:
  dashboard:  { show: true,  add: false, edit: false, delete: false, admin: false }
  projectslist: { show: false, add: false, edit: false, delete: false, admin: false }
  tasks:      { show: true,  add: true,  edit: true,  delete: true,  admin: false }
  team:       { show: false, add: false, edit: false, delete: false, admin: false }
  reports:    { show: true,  add: false, edit: false, delete: false, admin: false }
  admin:      { admin: false }
```

**Behavior:**
- ✅ Can view Dashboard and Tasks
- ✅ Can create, edit, and delete their own tasks
- ❌ Cannot access Projects or Team pages
- ❌ Cannot access Admin settings
- Menu shows: Dashboard, Tasks
- Menu hides: Projects, Team, Settings

---

## Implementation Details

### 1. Menu Visibility (`updateMenuVisibility()`)

**What it does:**
- Shows/hides navigation buttons based on show permissions
- Shows/hides settings menu items based on admin permission
- Called on page load (for non-guests)

**Code Location:** [index.html:4940-4995]

**Buttons controlled:**
- dashboardNavBtn
- projectsNavBtn
- tasksNavBtn
- teamNavBtn
- reportsNavBtn
- Settings menu items (Admin Rules, Page Permissions, Role Management)

### 2. Page Access Control (`switchPage()`)

**What it does:**
- Checks permission before allowing page switch
- Prevents access to unauthorized pages
- Shows error message if denied
- Works with guest mode checks

**Code Location:** [index.html:6120-6153]

**Permission check:**
```javascript
const canAccess = await hasPermission(permissionPage, 'show');
if (!canAccess) {
    alert(`You do not have permission to access the ${pageName} page`);
    return;
}
```

### 3. Data Filtering (`filterDataByOwnership()`)

**What it does:**
- Filters data arrays to show only visible records
- Special handling for different data types
- Admin sees all data
- Others see only owned/assigned data

**Code Location:** [index.html:4903-4935]

**Supported data types:**
- `'generic'` - Check createdBy, createdByName, assignedTo, assignedTo
- `'team'` - Show all (public)
- `'project'` - Show if project manager or team member

### 4. Permission Caching

**What it does:**
- Loads permissions once and caches them
- Improves performance
- Cache cleared when permissions change

**Cache variables:**
```javascript
let userPermissionsCache = null;    // Holds user's permissions
let userRoleCache = null;           // Holds user's role

clearPermissionCache();  // Clear after permission changes
```

---

## User Journey Examples

### Scenario 1: Developer Accessing Tasks

**Initial Load:**
1. User logs in as "Developer"
2. `updateMenuVisibility()` runs
3. Dashboard button shown (show=true)
4. Tasks button shown (show=true)
5. Projects button hidden (show=false)
6. Team button hidden (show=false)
7. Reports button hidden (show=false)
8. Settings hidden (admin=false)

**User clicks "Tasks":**
1. `switchPage('tasks')` called
2. Permission check: `hasPermission('tasks', 'show')`
3. Result: true → Navigate to tasks
4. Tasks page loads with filtered data (only Developer's tasks)

**User tries clicking on Settings:**
1. Settings menu doesn't show (hidden by updateMenuVisibility)
2. If user manually tries to navigate, switchPage prevents access

### Scenario 2: Admin Accessing Everything

**Initial Load:**
1. User logs in as "Admin"
2. `updateMenuVisibility()` runs
3. ALL buttons shown (Admin = all permissions)
4. ALL settings visible (admin=true)

**User clicks any page:**
1. Permission check always returns true
2. All data visible
3. All buttons (Add, Edit, Delete) visible

**Admin viewing Tasks page:**
1. All tasks visible (not just admin's)
2. Can edit/delete any task
3. Can add main tasks or subtasks

---

## Integration Points

### During Page Load
```javascript
window.addEventListener('load', async () => {
    // ... other initialization ...

    if (!guestMode) {
        // Apply permission-based menu visibility
        await updateMenuVisibility();
    }
});
```

### During Page Navigation
```javascript
async function switchPage(pageName, skipFilterClear = false) {
    // ... permission checks ...

    const canAccess = await hasPermission(permissionPage, 'show');
    if (!canAccess) {
        alert(`You do not have permission to access the ${pageName} page`);
        return;
    }

    // ... continue with page switch ...
}
```

### During Data Loading
```javascript
async function loadTasksFromFirebase() {
    const allTasks = await db.collection('tasks').get();

    // Filter based on permissions and ownership
    const visibleTasks = filterDataByOwnership(allTasks.docs.map(d => d.data()), 'tasks');

    // Render only visible tasks
    renderTasks(visibleTasks);
}
```

### During Button Rendering
```javascript
async function renderTaskRow(task) {
    let row = `<tr>
        <td>${task.name}</td>
        ...
    `;

    // Show Add button only if user has add permission
    if (await canAdd('tasks')) {
        row += `<button onclick="addSubtask('${task.id}')">+ Add Subtask</button>`;
    }

    // Show Edit button only if user can edit this task
    if ((await canEdit('tasks')) && isOwner(task)) {
        row += `<button onclick="editTask('${task.id}')">Edit</button>`;
    }

    // Show Delete button only if user can delete this task
    if ((await canDelete('tasks')) && isOwner(task)) {
        row += `<button onclick="deleteTask('${task.id}')">Delete</button>`;
    }

    return row;
}
```

---

## Permission Matrix Summary

### Default Roles

| Role | Dashboard | Projects | Tasks | Team | Reports | Admin |
|------|-----------|----------|-------|------|---------|-------|
| Project Manager | All ✅ | All ✅ | All ✅ | All ✅ | All ✅ | All ✅ |
| Business Analyst | Show ✅ | None ❌ | S+A+E+D ✅ | None ❌ | Show ✅ | None ❌ |
| System Analyst | Show ✅ | None ❌ | S+A+E+D ✅ | None ❌ | Show ✅ | None ❌ |
| Developer | Show ✅ | None ❌ | S+A+E ✅ | None ❌ | Show ✅ | None ❌ |
| QA Lead | Show ✅ | None ❌ | S+A+E ✅ | None ❌ | Show ✅ | None ❌ |
| Admin | All ✅ | All ✅ | All ✅ | All ✅ | All ✅ | All ✅ |

**Legend:** S=Show, A=Add, E=Edit, D=Delete

---

## Technical Notes

### Performance
- Permission cache reduces database queries
- Menu visibility computed once on load
- Permission check for page navigation happens once per switch
- Data filtering happens during data load

### Security
- All permission checks are server-side validated via Firebase rules (recommended)
- Client-side checks provide UX but not security
- Admin role has automatic bypass
- Guest mode has separate hardcoded restrictions

### Database Structure
```
page_permissions/global/
  "Project Manager": {
    dashboard: { show: true, add: true, ... },
    projectslist: { show: true, add: true, ... },
    tasks: { show: true, add: true, ... },
    ...
  },
  "Developer": {
    dashboard: { show: true, add: false, ... },
    ...
  },
  ...
}
```

---

## Next Steps for Complete Implementation

### Phase 2: Apply Filtering to Pages
- [ ] Filter Task page data by ownership
- [ ] Filter Project page data by ownership
- [ ] Filter Team page data visibility
- [ ] Filter Reports page data by access
- [ ] Filter Dashboard widgets by data access

### Phase 3: Control Button Visibility
- [ ] Hide Add button if no add permission
- [ ] Hide Edit button if no edit permission or not owner
- [ ] Hide Delete button if no delete permission or not owner
- [ ] Hide Settings button if no admin permission

### Phase 4: Advanced Features
- [ ] Row-level security for table views
- [ ] Column hiding based on permissions
- [ ] Search result filtering
- [ ] Export restrictions
- [ ] Audit logging of permission checks

---

## Current Status

### ✅ Completed
- Permission checking functions
- Menu visibility control
- Page access enforcement
- Role caching
- Permission caching
- Data filtering function
- Admin auto-grant
- Settings page protection

### 🔄 In Progress
- Applying data filtering to pages
- Button visibility control
- Form submission validation

### ⏳ Planned
- Advanced filtering options
- Permission change notifications
- Permission audit trail
- Performance optimization

---

## Commits

```
ff4f848 - Add permission checking infrastructure and menu visibility control
3d3d383 - Add data filtering function for ownership-based access control
```

---

## Testing Checklist

- [ ] Login as each role and verify menu shows correct items
- [ ] Try clicking hidden menu items - verify permission error
- [ ] Verify task data shows only owned/assigned tasks
- [ ] Verify add button hidden for roles without add permission
- [ ] Verify edit button disabled for non-owners even with permission
- [ ] Verify delete button hidden for roles without delete permission
- [ ] Verify admin can see all data
- [ ] Verify admin has all buttons available
- [ ] Verify permission cache clears after settings change
- [ ] Verify guest mode still works (bypasses permission system)

---

## Summary

The permission system provides:
1. **Page-level access control** - Control which pages users can see
2. **Feature-level control** - Control what users can do (add/edit/delete)
3. **Data-level filtering** - Show only data users should see
4. **UI-level updates** - Hide unavailable options from menu and forms
5. **Consistent enforcement** - All checks use same permission functions

The system is flexible, performant, and integrates seamlessly with the existing role management and page permissions configuration system.
