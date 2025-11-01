# Task & Subtask Add Permissions

## Overview

Implemented role-based permission controls for adding tasks and subtasks, ensuring only users with appropriate permissions can create new tasks and subtasks.

## Permission Rules

### Add Task (Create New Parent Task)
User can create a new **parent task** if:
- ✅ User has `add: true` permission on **Tasks page**, **OR**
- ✅ User has **Admin** permission (access to Admin pages)

User **CANNOT** create a new parent task if:
- ❌ User does not have `add` permission on Tasks page
- ❌ User is not an admin

### Add Subtask (Create New Subtask)
User can create a new **subtask** if:
- ✅ User has `add: true` permission on **Tasks page**, **OR**
- ✅ User has **Admin** permission (access to Admin pages)

User **CANNOT** create a new subtask if:
- ❌ User does not have `add` permission on Tasks page
- ❌ User is not an admin

## Implementation Details

### Permission Check Hierarchy

```
For Adding Tasks/Subtasks:
  1. Check if user has "add" permission on Tasks page
  2. If not, check if user is admin
  3. Allow if either is true
  4. Otherwise deny with permission message
```

### New Function: updateSubtaskAddButtonVisibility()

**Location:** [Lines 5164-5189](index.html#L5164-L5189)

**Purpose:** Control visibility of subtask add button based on user permissions

**Logic:**
```javascript
const canAddSubtask = await canAdd('tasks');
const isAdmin = await hasPermission('admin', 'admin');
const canAddAnything = canAddSubtask || isAdmin;

// Show/hide and disable/enable all subtask buttons
subtaskButtons.forEach(btn => {
    btn.style.display = canAddAnything ? '' : 'none';
    btn.disabled = !canAddAnything;
});
```

### Updated Functions

#### 1. openModal() [Lines 10507-10535]

**Changes:**
- Added admin permission check alongside add permission
- Shows error message if user lacks both permissions
- Allows admins to create tasks even without explicit "add" permission

**Logic:**
```javascript
const canAddTask = await canAdd('tasks');
const isAdmin = await hasPermission('admin', 'admin');

if (!canAddTask && !isAdmin) {
    alert('You do not have permission to add tasks...');
    return;
}
```

#### 2. showInlineAddSubtask() [Lines 9475-9497]

**Changes:**
- Added permission check before showing inline subtask form
- Added admin permission check
- Shows error message if user lacks permissions
- Prevents unauthorized subtask creation

**Logic:**
```javascript
const canAddSubtask = await canAdd('tasks');
const isAdmin = await hasPermission('admin', 'admin');

if (!canAddSubtask && !isAdmin) {
    alert('You do not have permission to add subtasks...');
    return;
}
```

#### 3. renderTasks() [Lines 8294-8297]

**Changes:**
- Added call to `updateSubtaskAddButtonVisibility()` after rendering
- Ensures subtask buttons are hidden/shown based on permissions

```javascript
// Update subtask add button visibility based on permissions
updateSubtaskAddButtonVisibility(tasks).catch(err =>
    console.error('Error updating subtask add button visibility:', err)
);
```

## Console Logging

The implementation includes console logs for debugging:

```
🔘 Updating subtask add button visibility...
🔘 Subtask add button: visible ✅
✅ Subtask add button visibility updated

🚪 openModal() called
(Permission checks logged)

🔄 showInlineAddSubtask() called with index: 0
(Permission checks logged)
```

## User Interface Behavior

### User WITH Add Permission

| Element | Visibility | Status |
|---------|-----------|--------|
| Add Task Button | ✅ Visible | Enabled |
| Add Subtask Buttons | ✅ Visible | Enabled |
| Task Modal | ✅ Opens | Can create tasks |
| Inline Subtask Form | ✅ Opens | Can create subtasks |

### User WITHOUT Add Permission (Not Admin)

| Element | Visibility | Status |
|---------|-----------|--------|
| Add Task Button | ❌ Hidden | Disabled |
| Add Subtask Buttons | ❌ Hidden | Disabled |
| Task Modal | ❌ Alert shown | Permission denied |
| Inline Subtask Form | ❌ Alert shown | Permission denied |

### Admin User

| Element | Visibility | Status |
|---------|-----------|--------|
| Add Task Button | ✅ Visible | Enabled |
| Add Subtask Buttons | ✅ Visible | Enabled |
| Task Modal | ✅ Opens | Can create tasks |
| Inline Subtask Form | ✅ Opens | Can create subtasks |

## Scenarios

### Scenario 1: User with Task Add Permission

**Permissions:**
```
Tasks Page: show=true, add=true, edit=false, delete=false
Admin: none
```

**Result:**
```
✅ Can create new tasks
✅ Can create subtasks
❌ Cannot edit other's tasks
❌ Cannot delete tasks
```

### Scenario 2: User with Only Show Permission

**Permissions:**
```
Tasks Page: show=true, add=false, edit=false, delete=false
Admin: none
```

**Result:**
```
❌ Cannot create new tasks
❌ Cannot create subtasks
✅ Can view assigned tasks/subtasks
❌ Cannot edit tasks
❌ Cannot delete tasks
```

### Scenario 3: Admin User

**Permissions:**
```
Tasks Page: show=false, add=false, edit=false, delete=false
Admin: admin=true
```

**Result:**
```
✅ Can create new tasks
✅ Can create subtasks
✅ Can access all admin features
✅ Override permission for anything
```

## Error Messages

### When User Tries to Create Task Without Permission

```
You do not have permission to add tasks.
Only users with "add" permission or admin access can create new tasks.
```

### When User Tries to Create Subtask Without Permission

```
You do not have permission to add subtasks.
Only users with "add" permission or admin access can create subtasks.
```

## Testing Checklist

- [ ] User with add permission sees Add Task button
- [ ] User with add permission sees Add Subtask buttons
- [ ] User without add permission sees neither button (hidden)
- [ ] User without add permission gets alert when accessing modal directly
- [ ] Admin can create tasks without add permission
- [ ] Admin can create subtasks without add permission
- [ ] Console logs show correct permission checks
- [ ] Add Task button visibility updates on page load
- [ ] Add Subtask buttons visibility updates on page render
- [ ] Multiple users see correct buttons based on their permissions

## Files Modified

- `index.html`
  - Lines 5164-5189: New updateSubtaskAddButtonVisibility() function
  - Lines 10507-10535: Updated openModal() with permission checks
  - Lines 9475-9497: Updated showInlineAddSubtask() with permission checks
  - Lines 8294-8297: Added call to updateSubtaskAddButtonVisibility()

## Commit Information

**Hash:** d72a278
**Message:** "Implement: Add permission controls for task and subtask creation"

## Technical Details

### Permission Check Order

1. **Check add permission** on Tasks page first (specific to tasks)
2. **Check admin permission** as fallback (admins can do anything)
3. **Allow** if either permission is true
4. **Deny** if both are false

### Why This Order?

- Tasks page "add" permission is more specific
- Admin permission is a catch-all override
- Prevents premature denial before checking admin status

## Related Functions

- `canAdd(page)` - Check if user has add permission for a page
- `hasPermission(page, operation)` - Check specific permission
- `getCurrentUser()` - Get current logged-in user
- `updateEditDeleteButtonVisibility()` - Similar function for edit/delete buttons

## Future Enhancements

- Granular permissions (add task vs add subtask)
- Team lead can add for their team
- Assignee can add subtasks to their tasks
- Bulk task creation
- Task templates for quick creation

