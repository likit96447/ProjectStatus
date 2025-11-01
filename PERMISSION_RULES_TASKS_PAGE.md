# Permission Rules for Tasks Page

## Overview
The Tasks page has a role-based permission system with 5 predefined roles. Each role has different levels of access to view, add, edit, and delete tasks.

**Configuration Location:** index.html, Lines 4224-4265

---

## Default Role Permissions

### 1. Project Manager
**Role Code:** `Project Manager`
**Access Level:** FULL ACCESS

```json
{
  "tasks": {
    "show": true,
    "add": true,
    "edit": true,
    "delete": true,
    "admin": true
  }
}
```

| Operation | Allowed | Button |
|-----------|---------|--------|
| View tasks | ✅ Yes | Tasks page visible |
| Add tasks | ✅ Yes | ➕ Add task button shown |
| Add subtasks | ✅ Yes | ➕ Add subtask button shown |
| Edit tasks | ✅ Yes | ✏️ Edit button shown |
| Clone tasks | ✅ Yes | 📋 Clone button shown |
| Delete tasks | ✅ Yes | 🗑️ Delete button shown |
| Admin access | ✅ Yes | Can access admin settings |

**Use Case:** Full control over all tasks, typically project leads/managers

---

### 2. Business Analyst
**Role Code:** `Business Analyst`
**Access Level:** HIGH ACCESS (Except no project/team management)

```json
{
  "tasks": {
    "show": true,
    "add": true,
    "edit": true,
    "delete": true,
    "admin": false
  }
}
```

| Operation | Allowed | Button |
|-----------|---------|--------|
| View tasks | ✅ Yes | Tasks page visible |
| Add tasks | ✅ Yes | ➕ Add task button shown |
| Add subtasks | ✅ Yes | ➕ Add subtask button shown |
| Edit tasks | ✅ Yes | ✏️ Edit button shown |
| Clone tasks | ✅ Yes | 📋 Clone button shown |
| Delete tasks | ✅ Yes | 🗑️ Delete button shown |
| Admin access | ❌ No | Cannot access admin settings |

**Restrictions:** Cannot access Projects or Team pages, no admin access

**Use Case:** Business/analysis team members who create and manage tasks

---

### 3. System Analyst
**Role Code:** `System Analyst`
**Access Level:** HIGH ACCESS (Except no project/team management)

```json
{
  "tasks": {
    "show": true,
    "add": true,
    "edit": true,
    "delete": true,
    "admin": false
  }
}
```

| Operation | Allowed | Button |
|-----------|---------|--------|
| View tasks | ✅ Yes | Tasks page visible |
| Add tasks | ✅ Yes | ➕ Add task button shown |
| Add subtasks | ✅ Yes | ➕ Add subtask button shown |
| Edit tasks | ✅ Yes | ✏️ Edit button shown |
| Clone tasks | ✅ Yes | 📋 Clone button shown |
| Delete tasks | ✅ Yes | 🗑️ Delete button shown |
| Admin access | ❌ No | Cannot access admin settings |

**Restrictions:** Cannot access Projects or Team pages, no admin access

**Use Case:** System/technical analysis team members

---

### 4. Developer
**Role Code:** `Developer`
**Access Level:** MEDIUM ACCESS (No task deletion)

```json
{
  "tasks": {
    "show": true,
    "add": true,
    "edit": true,
    "delete": false,
    "admin": false
  }
}
```

| Operation | Allowed | Button |
|-----------|---------|--------|
| View tasks | ✅ Yes | Tasks page visible |
| Add tasks | ✅ Yes | ➕ Add task button shown |
| Add subtasks | ✅ Yes | ➕ Add subtask button shown |
| Edit tasks | ✅ Yes | ✏️ Edit button shown |
| Clone tasks | ✅ Yes | 📋 Clone button shown |
| Delete tasks | ❌ No | 🗑️ Delete button HIDDEN |
| Admin access | ❌ No | Cannot access admin settings |

**Restrictions:**
- Cannot delete tasks
- Cannot access Projects or Team pages
- No admin access

**Use Case:** Development team members who work on assigned tasks

---

### 5. QA Lead
**Role Code:** `QA Lead`
**Access Level:** MEDIUM ACCESS (No task deletion)

```json
{
  "tasks": {
    "show": true,
    "add": true,
    "edit": true,
    "delete": false,
    "admin": false
  }
}
```

| Operation | Allowed | Button |
|-----------|---------|--------|
| View tasks | ✅ Yes | Tasks page visible |
| Add tasks | ✅ Yes | ➕ Add task button shown |
| Add subtasks | ✅ Yes | ➕ Add subtask button shown |
| Edit tasks | ✅ Yes | ✏️ Edit button shown |
| Clone tasks | ✅ Yes | 📋 Clone button shown |
| Delete tasks | ❌ No | 🗑️ Delete button HIDDEN |
| Admin access | ❌ No | Cannot access admin settings |

**Restrictions:**
- Cannot delete tasks
- Cannot access Projects or Team pages
- No admin access

**Use Case:** QA lead who manages test tasks

---

## Permission Operations

### Show (View)
**Definition:** User can see the Tasks page and view all tasks they're assigned to

**Affects:**
- Tasks page visibility in navigation
- Task list rendering
- Task details visibility

**Combined With:** Task assignment filtering
- Users see only tasks they're assigned to
- Private/unrelated tasks are hidden

---

### Add (Create)
**Definition:** User can create new tasks and add subtasks to existing tasks

**Affects:**
- ➕ Add Task button visibility (in top menu)
- ➕ Add Subtask button visibility (in task rows)

**Requirements:**
- Must have "add" permission
- Cannot create task without permission

**Note:** Admin users can override this

---

### Edit
**Definition:** User can modify task details (name, date, priority, status, assignment)

**Affects:**
- ✏️ Edit button visibility
- 📋 Clone button visibility (clone requires edit permission)
- Inline editing of task fields
- Task property modifications

**Edit Requirements:**
1. User has "edit" permission AND
2. User is task owner OR
3. User is assigned to the task

**Example:**
- Developer with edit permission can only edit tasks assigned to them
- Cannot edit tasks they're not assigned to (button hidden)

---

### Delete
**Definition:** User can permanently remove tasks

**Affects:**
- 🗑️ Delete button visibility

**Delete Requirements:**
1. User has "delete" permission AND
2. User is task owner OR
3. User is assigned to the task

**Example:**
- Developer has edit permission but NOT delete permission
- Delete button is HIDDEN on all tasks
- Can only edit, not delete

---

## Permission Loading Flow

```
1. User logs in
   ↓
2. getCurrentUserRole() - Get user's role
   ↓
3. loadUserPermissions() - Fetch from Firebase
   ↓
4. Cache: userPermissionsCache = permissions[userRole]
   ↓
5. hasPermission(page, operation) - Check specific permission
   ↓
6. Return boolean (true/false)
```

**Code Location:** Lines 4773-4823

```javascript
async function loadUserPermissions() {
    if (userPermissionsCache) return userPermissionsCache;

    const userRole = getCurrentUserRole();
    const doc = await db.collection('page_permissions').doc('global').get();
    const permissions = doc.exists ? doc.data() : {};
    userPermissionsCache = permissions[userRole] || {};

    return userPermissionsCache;
}

async function hasPermission(page, operation) {
    const permissions = await loadUserPermissions();
    return permissions[page]?.[operation] === true;
}
```

---

## Permission Usage in UI

### Page Navigation
```javascript
tasksBtn.style.display = (await canShow('tasks')) ? '' : 'none';
// Show Tasks button only if user has 'show' permission
```

### Add Task Button
```javascript
const canAddTask = await canAdd('tasks');
newTaskBtn.style.display = canAddTask ? '' : 'none';
// Show button only if user has 'add' permission
```

### Action Buttons in Task Row
```javascript
// Edit button
const canEditThis = canEdit('tasks') && (isOwner || isAssigned);
editBtn.style.display = canEditThis ? '' : 'none';

// Clone button (requires edit permission)
const canCloneThis = canEdit('tasks') && (isOwner || isAssigned);
cloneBtn.style.display = canCloneThis ? '' : 'none';

// Delete button
const canDeleteThis = canDelete('tasks') && (isOwner || isAssigned);
deleteBtn.style.display = canDeleteThis ? '' : 'none';

// Subtask button
const canAddSubtask = canAdd('tasks') || isAdmin();
subtaskBtn.style.display = canAddSubtask ? '' : 'none';
```

---

## Task Visibility with Assignment Filtering

### Rule 1: Show Permission Required
User must have `show` permission to access Tasks page

### Rule 2: Assignment Filtering
Even with `show` permission, user only sees:
- Tasks they are assigned to, OR
- Tasks where they have assigned subtasks

**Code Location:** Lines 4952-4987 (filterTasksByUserAssignment function)

```javascript
function filterTasksByUserAssignment(tasksArray, subtasksArray) {
    const currentUser = getCurrentUser();

    return tasksArray.filter(task => {
        // Show if user assigned to task
        if (task.assignedTo?.includes(currentUser.uid)) return true;

        // Show if user has subtasks on this task
        const userSubtasks = subtasksArray.filter(
            st => st.parentTaskId === task.id &&
                  st.personName === currentUser.name
        );

        return userSubtasks.length > 0;
    });
}
```

**Example:**
- Business Analyst with "show" permission
- Project has 20 tasks
- Business Analyst assigned to 5 tasks
- Has subtasks on 3 other tasks
- **Can see:** 8 tasks (5 assigned + 3 with subtasks)
- **Cannot see:** 12 tasks (not assigned, no subtasks)

---

## Detailed Permission Examples

### Example 1: Developer Looking at Tasks

**Developer Permissions:**
```
show: true, add: true, edit: true, delete: false
```

**Scenario:**
Developer is viewing Task #1 which they are assigned to

**What They See:**
```
Task #1 ➕ ✏️ 📋
```
- ➕ Add Subtask (has add permission)
- ✏️ Edit (has edit permission + assigned)
- 📋 Clone (has edit permission + assigned)
- (No delete button - lacks delete permission)

**When They Click:**
- ✅ Can add subtasks
- ✅ Can edit task details
- ✅ Can clone task
- ❌ Cannot delete task

---

### Example 2: Developer Looking at Unassigned Task

**Developer Permissions:**
```
show: true, add: true, edit: true, delete: false
```

**Scenario:**
Developer is looking at Task #5 (not assigned to them, no subtasks)

**What They See:**
- Task #5 is NOT visible in their task list
- filterTasksByUserAssignment filters it out
- They cannot see unassigned tasks

**Result:**
✅ Task visibility enforced at filtering level (cannot see)

---

### Example 3: QA Lead with Shared Task

**QA Lead Permissions:**
```
show: true, add: true, edit: true, delete: false
```

**Scenario:**
QA Lead and Developer are both assigned to Task #3

**What QA Lead Sees:**
```
Task #3 ➕ ✏️ 📋
```
- ➕ Add Subtask (can add)
- ✏️ Edit (assigned to task)
- 📋 Clone (assigned to task)
- (No delete button)

**Permissions:**
- ✅ Can modify task
- ✅ Can add subtasks
- ✅ Can clone
- ❌ Cannot delete

---

### Example 4: Business Analyst vs Developer

**Comparison on Same Task:**

| Operation | Business Analyst | Developer |
|-----------|-----------------|-----------|
| show | ✅ true | ✅ true |
| add | ✅ true | ✅ true |
| edit | ✅ true | ✅ true |
| delete | ✅ true | ❌ false |

**On Task They're Assigned To:**

Business Analyst sees:
```
Task #1 ➕ ✏️ 📋 🗑️
```

Developer sees:
```
Task #1 ➕ ✏️ 📋
```

Delete button is hidden for Developer (no permission)

---

## Admin Configuration

**Location:** Admin panel at `/admin` (requires admin permission)

**What Can Be Changed:**
- Edit existing role permissions
- Add new roles
- Reset to default permissions

**Saved Location:** Firebase Firestore
- Collection: `page_permissions`
- Document: `global`
- Structure: `{ [roleName]: { [page]: { [operation]: boolean } } }`

**Example Query:**
```
db.collection('page_permissions').doc('global').get()
→ Returns all permissions for all roles
```

---

## Key Functions and Locations

| Function | Location | Purpose |
|----------|----------|---------|
| canShow() | 4854-4856 | Check "show" permission |
| canAdd() | 4863-4865 | Check "add" permission |
| canEdit() | 4872-4874 | Check "edit" permission |
| canDelete() | 4881-4883 | Check "delete" permission |
| hasPermission() | 4801-4823 | Check any permission |
| loadUserPermissions() | 4773-4793 | Load from Firebase cache |
| updateEditDeleteButtonVisibility() | 5169-5239 | Hide/show action buttons |
| updateSubtaskAddButtonVisibility() | 5252-5271 | Hide/show subtask button |
| filterTasksByUserAssignment() | 4952-4987 | Filter tasks by assignment |

---

## Summary Table

| Role | Show | Add | Edit | Delete | Delete Button |
|------|------|-----|------|--------|----------------|
| Project Manager | ✅ | ✅ | ✅ | ✅ | Shown |
| Business Analyst | ✅ | ✅ | ✅ | ✅ | Shown |
| System Analyst | ✅ | ✅ | ✅ | ✅ | Shown |
| Developer | ✅ | ✅ | ✅ | ❌ | Hidden |
| QA Lead | ✅ | ✅ | ✅ | ❌ | Hidden |

---

## Permission Rules Summary

### Pages Visible
All roles can see Tasks page (show: true for all)

### Who Can Create Tasks
- Project Manager: ✅
- Business Analyst: ✅
- System Analyst: ✅
- Developer: ✅
- QA Lead: ✅

### Who Can Edit Tasks
- Must have "edit" permission (all roles have it)
- Must be task owner OR assigned to task

### Who Can Delete Tasks
- Project Manager: ✅ (if owner or assigned)
- Business Analyst: ✅ (if owner or assigned)
- System Analyst: ✅ (if owner or assigned)
- Developer: ❌ (permission denied)
- QA Lead: ❌ (permission denied)

### Who Can Clone Tasks
- Same as Edit permission
- Project Manager: ✅
- Business Analyst: ✅
- System Analyst: ✅
- Developer: ✅
- QA Lead: ✅

---

## Current Status

**Framework:** Role-Based Access Control (RBAC)
**Storage:** Firebase Firestore (page_permissions collection)
**Enforcement:** Client-side visibility + Task assignment filtering
**Security:** Server-side validation required for actual operations

All rules are currently active and enforced.
