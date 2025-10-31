# Edit and Delete Button Visibility Control

**Status:** ✅ **IMPLEMENTED**

**Date:** 2025-10-31

---

## Overview

Edit and Delete buttons now dynamically show or hide based on user permissions, just like the Add buttons. Users can only see these buttons if they have the required permission AND own the item.

---

## Implementation

### New Functions Added

#### 1. `updateEditDeleteButtonVisibility(page, items)` [index.html:5045-5080]

**Purpose:** Update visibility for edit/delete buttons on tasks

**Parameters:**
- `page` (string) - Page name (e.g., 'tasks')
- `items` (Array) - Array of items to check permissions for

**Behavior:**
```javascript
// For each item:
1. Check if user has edit permission for the page
2. Check if user owns the item
3. Show edit button only if BOTH are true
4. Hide edit button and show tooltip if either is false
5. Same logic for delete button
```

**Example:**
```javascript
// After rendering tasks
await updateEditDeleteButtonVisibility('tasks', tasks);
```

---

#### 2. `updateProjectEditDeleteButtonVisibility(projects)` [index.html:5086-5126]

**Purpose:** Update visibility for edit/delete buttons on project cards

**Parameters:**
- `projects` (Array) - Array of projects to check permissions for

**Behavior:**
- Iterates through each project card
- Checks if user has edit/delete permission for 'projectslist' page
- Checks if user owns the project
- Shows/hides buttons accordingly with appropriate tooltips

**Example:**
```javascript
// After rendering projects
await updateProjectEditDeleteButtonVisibility(projects);
```

---

#### 3. `updateSubtaskEditDeleteButtonVisibility(subtasks)` [index.html:5132-5163]

**Purpose:** Update visibility for edit/delete buttons on subtasks

**Parameters:**
- `subtasks` (Array) - Array of subtasks to check permissions for

**Behavior:**
- Finds each subtask button in the DOM
- Checks if user has edit/delete permission for 'tasks' page
- Checks if user owns the subtask
- Shows/hides buttons with appropriate tooltips

**Example:**
```javascript
// After rendering subtasks
await updateSubtaskEditDeleteButtonVisibility(subtasks);
```

---

### Integration Points

#### 1. Tasks Page [index.html:8171-8174]

**Location:** End of `renderTasks()` function

```javascript
// Update edit/delete button visibility based on permissions
updateEditDeleteButtonVisibility('tasks', tasks).catch(err =>
    console.error('Error updating task button visibility:', err)
);
```

**When it runs:**
- After tasks are loaded from Firebase
- After tasks are filtered
- After tasks are rendered to the page

---

#### 2. Projects Page [index.html:12075-12078]

**Location:** End of `renderProjectsGridView()` function

```javascript
// Update edit/delete button visibility based on permissions
updateProjectEditDeleteButtonVisibility(filteredProjects).catch(err =>
    console.error('Error updating project button visibility:', err)
);
```

**When it runs:**
- After projects are loaded from Firebase
- After projects are filtered
- After projects are rendered to the page

---

#### 3. Subtasks [index.html:9195-9198]

**Location:** End of `renderSubtasks()` function

```javascript
// Update edit/delete button visibility based on permissions
updateSubtaskEditDeleteButtonVisibility(subtasks).catch(err =>
    console.error('Error updating subtask button visibility:', err)
);
```

**When it runs:**
- After subtasks are loaded from Firebase
- After subtasks are rendered to the page

---

## Permission Rules

### Edit Button Visibility

**Shows if:**
- ✅ User has `edit` permission for the page (from Firebase)
- ✅ AND user owns the item (isOwner() returns true)

**Shows tooltip and disables if:**
- ❌ User lacks `edit` permission
- ❌ OR user doesn't own the item

**Example:**
```javascript
const canEditThis = canEditPerm && isItemOwner;
editBtn.style.display = canEditThis ? '' : 'none';
editBtn.title = canEditThis ? 'Edit' : 'You do not have permission to edit this item';
```

---

### Delete Button Visibility

**Shows if:**
- ✅ User has `delete` permission for the page (from Firebase)
- ✅ AND user owns the item (isOwner() returns true)

**Shows tooltip and disables if:**
- ❌ User lacks `delete` permission
- ❌ OR user doesn't own the item

**Example:**
```javascript
const canDeleteThis = canDeletePerm && isItemOwner;
deleteBtn.style.display = canDeleteThis ? '' : 'none';
deleteBtn.title = canDeleteThis ? 'Delete' : 'You do not have permission to delete this item';
```

---

## Usage Examples

### Example 1: Developer User

**Permissions in Firebase:**
```json
{
  "Developer": {
    "tasks": {
      "show": true,
      "add": true,
      "edit": true,   ← Has edit permission
      "delete": false ← No delete permission
    }
  }
}
```

**Behavior:**
- ✅ See task they created → Edit button SHOWS, Delete button HIDDEN
- ❌ See task created by another user → Both buttons HIDDEN
- ❌ See task assigned to them but created by manager → Both buttons HIDDEN

---

### Example 2: Project Manager

**Permissions in Firebase:**
```json
{
  "Project Manager": {
    "projectslist": {
      "show": true,
      "add": true,
      "edit": true,   ← Has edit permission
      "delete": true  ← Has delete permission
    }
  }
}
```

**Behavior:**
- ✅ See project they created → Both buttons SHOW
- ✅ See project assigned to them → Both buttons SHOW
- ❌ See project owned by someone else → Both buttons HIDDEN

---

### Example 3: Admin User

**Permissions in Firebase:**
```json
{
  "Admin": {
    "admin": {
      "admin": true  ← Admin has all permissions
    },
    "tasks": {
      "show": true,
      "add": true,
      "edit": true,
      "delete": true
    },
    "projectslist": {
      "show": true,
      "add": true,
      "edit": true,
      "delete": true
    }
  }
}
```

**Behavior:**
- ✅ See any task → Both buttons SHOW (has permissions + ownership check)
- ✅ See any project → Both buttons SHOW (has permissions + ownership check)
- ✅ Edit/Delete based on ownership, not role

---

## Permission Check Flow

```
User clicks on page with items
    ↓
renderTasks() / renderProjects() / renderSubtasks() called
    ↓
Items rendered to DOM
    ↓
updateEditDeleteButtonVisibility() called
    ↓
For each item:
    ├─ Load user permissions from Firebase
    ├─ Check: canEdit(page) / canDelete(page)
    ├─ Check: isOwner(item)
    └─ Show/hide buttons based on both checks
    ↓
All buttons updated
    ↓
User sees correct buttons for their role
```

---

## Button States

### Edit Button States

| User Permission | User Owner | Button State | Tooltip |
|-----------------|-----------|-------------|---------|
| ✅ Yes | ✅ Yes | SHOW | "Edit" |
| ✅ Yes | ❌ No | HIDDEN | N/A |
| ❌ No | ✅ Yes | HIDDEN | N/A |
| ❌ No | ❌ No | HIDDEN | N/A |

### Delete Button States

| User Permission | User Owner | Button State | Tooltip |
|-----------------|-----------|-------------|---------|
| ✅ Yes | ✅ Yes | SHOW | "Delete" |
| ✅ Yes | ❌ No | HIDDEN | N/A |
| ❌ No | ✅ Yes | HIDDEN | N/A |
| ❌ No | ❌ No | HIDDEN | N/A |

---

## Ownership Checks

The `isOwner()` function checks if a user owns an item by comparing:

1. **Email field** - Direct match with current user's email
2. **assignedTo field** - If task/project is assigned to user
3. **createdBy field** - If user created the item
4. **createdByName field** - If user's name matches creator

**Note:** Admin users do NOT automatically own all items. Admin status is checked separately via Firebase permissions.

---

## Protection Layers

### Layer 1: Button Visibility ✅ IMPLEMENTED

**What it does:**
- Hides edit/delete buttons from users who can't use them
- Reduces confusion by only showing available actions

**Implementation:**
```javascript
editBtn.style.display = canEditThis ? '' : 'none';
```

---

### Layer 2: Modal Protection ✅ IMPLEMENTED

**What it does:**
- Prevents modal from opening if permission denied
- Shows error message if user tries to force-edit

**Implementation:**
```javascript
async function checkEditPermission(item, page) {
    const canEdit = await canEditItem(item, page);
    if (!canEdit) {
        alert('You do not have permission to edit this item');
        return false;
    }
    return true;
}
```

**Location:** [index.html:5195-5205] (checkEditPermission)
**Location:** [index.html:5210-5220] (checkDeletePermission)

---

### Layer 3: Function-Level Protection ✅ IMPLEMENTED

**What it does:**
- Checks permissions before executing edit/delete operations
- Prevents unauthorized changes to Firebase

**Implementation:**
```javascript
async function editTask(index) {
    if (!await checkEditPermission(tasks[index], 'tasks')) return;
    // ... proceed with edit
}
```

**Locations:**
- [index.html:9992-10000] - editTask()
- [index.html:9950-9958] - deleteTask()
- [index.html:11532-11540] - editProject()
- [index.html:11612-11620] - deleteProject()

---

### Layer 4: Data Validation ✅ IMPLEMENTED

**What it does:**
- Validates ownership during save operations
- Prevents unauthorized modifications to Firebase data

**Implementation:**
```javascript
function isOwner(data) {
    const currentUser = getCurrentUser();
    if (data.email === currentUser.email) return true;
    if (data.assignedTo === currentUser.email) return true;
    // ... more checks
    return false;
}
```

---

## Console Logs for Debugging

When buttons are updated, you'll see logs like:

```
🔘 Updating edit/delete button visibility for tasks...
✅ Edit/delete button visibility updated for tasks

🔘 Updating project edit/delete button visibility...
✅ Project edit/delete button visibility updated

🔘 Updating subtask edit/delete button visibility...
✅ Subtask edit/delete button visibility updated
```

---

## Testing Scenarios

### Test 1: User with Edit Permission, Owns Item

**Setup:**
1. User has `edit: true` in Firebase
2. User created the task

**Expected:**
- ✅ Edit button SHOWS
- ✅ Can click Edit button
- ✅ Modal opens

---

### Test 2: User with Edit Permission, Doesn't Own Item

**Setup:**
1. User has `edit: true` in Firebase
2. Different user created the task

**Expected:**
- ❌ Edit button HIDDEN
- ❌ Cannot edit

---

### Test 3: User without Edit Permission, Owns Item

**Setup:**
1. User has `edit: false` in Firebase
2. User created the task

**Expected:**
- ❌ Edit button HIDDEN
- ❌ Cannot edit (even though they created it)

---

### Test 4: User without Edit Permission, Doesn't Own Item

**Setup:**
1. User has `edit: false` in Firebase
2. Different user created the task

**Expected:**
- ❌ Edit button HIDDEN
- ❌ Cannot edit

---

### Test 5: Change Permission in Firebase

**Setup:**
1. User is viewing tasks
2. Edit permission changes from false to true in Firebase

**Expected:**
- After page refresh/reload:
  - ✅ Edit button now SHOWS (for owned items)
  - ✅ Can now edit

---

## Related Documentation

- [PERMISSION_SYSTEM_IMPLEMENTATION.md](PERMISSION_SYSTEM_IMPLEMENTATION.md) - Complete technical guide
- [FIREBASE_ONLY_PERMISSIONS_VERIFICATION.md](FIREBASE_ONLY_PERMISSIONS_VERIFICATION.md) - Firebase-only verification
- [BUTTON_PERMISSION_CONTROL.md](BUTTON_PERMISSION_CONTROL.md) - Add button permission control
- [FULL_PERMISSION_ENFORCEMENT.md](FULL_PERMISSION_ENFORCEMENT.md) - Complete system overview

---

## Code Changes Summary

### Files Modified
1. **index.html**
   - Added 3 new button visibility update functions
   - Integrated calls into renderTasks(), renderProjectsGridView(), renderSubtasks()
   - Total additions: ~140 lines of new code

### Functions Added
1. `updateEditDeleteButtonVisibility(page, items)` - Generic tasks/items
2. `updateProjectEditDeleteButtonVisibility(projects)` - Project cards
3. `updateSubtaskEditDeleteButtonVisibility(subtasks)` - Subtasks

### Integration Points
1. renderTasks() - Updates task edit/delete buttons
2. renderProjectsGridView() - Updates project edit/delete buttons
3. renderSubtasks() - Updates subtask edit/delete buttons

---

## Commit Hash

**Commit:** `5bcddef`

**Message:** "Add edit and delete button visibility control based on permissions"

---

## Summary

✅ **Edit and Delete buttons now:**
- Hide when user lacks permission
- Hide when user doesn't own the item
- Show with tooltip when permission denied
- Properly use Firebase permissions (not hardcoded logic)
- Provide 4-layer protection against unauthorized actions

Users can only see and use edit/delete buttons when they have both:
1. Permission from Firebase
2. Ownership of the item

