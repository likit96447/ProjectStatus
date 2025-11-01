# Task & Subtask Edit Permissions

## Overview

Implemented granular edit permission controls for tasks and subtasks based on parent task assignment and user ownership.

## Permission Rules

### Edit Task (Parent Task)

User can **edit their own task** if:
- ✅ User has `edit: true` permission on **Tasks page**, **AND**
- ✅ User is the owner of the task (created it or assigned to themselves)

User can **NOT edit** a task if:
- ❌ User does not have `edit` permission on Tasks page
- ❌ User is not the owner of the task

### Edit Subtask (Based on Parent Task Assignment)

**If user IS assigned to parent task:**
- ✅ Can edit **ALL subtasks** under that task (if they have edit permission)
- ✅ Can edit subtasks even if not assigned to them
- ✅ Full access to parent task's subtasks

**If user is NOT assigned to parent task:**
- ✅ Can edit **ONLY their own subtasks** (if they have edit permission)
- ❌ Cannot edit other user's subtasks
- ❌ Cannot edit parent task

**Edit permission requirement:**
- Must have `edit: true` permission on **Tasks page**

## Implementation Details

### New Function: canEditSubtask()

**Location:** [Lines 5293-5326](index.html#L5293-L5326)

**Purpose:** Determine if user can edit a specific subtask based on parent task assignment

**Logic:**
```javascript
// Must have edit permission on tasks page
const hasEditPermission = await canEdit('tasks');
if (!hasEditPermission) return false;

// Check if user is assigned to parent task
const isUserAssignedToParent = parentTask.assignedTo === currentUser.email ||
                              parentTask.assignedToNames?.includes(currentUser.name);

if (isUserAssignedToParent) {
    // User assigned to parent task can edit ALL subtasks
    return true;
}

// User NOT assigned to parent task can only edit their own subtasks
const isSubtaskOwner = isOwner(subtask);
return isSubtaskOwner;
```

**Decision Tree:**
```
Can edit subtask?
  ├─ Has edit permission? NO → false
  ├─ User assigned to parent task? YES → true (edit all)
  └─ User owns subtask? YES → true (edit own), NO → false
```

### Updated Function: updateSubtaskEditDeleteButtonVisibility()

**Location:** [Lines 5242-5280](index.html#L5242-L5280)

**Changes:**
- Now uses new `canEditSubtask()` function
- Finds parent task for each subtask
- Checks assignment to parent task
- Uses promises to handle async permission check

```javascript
// Find parent task for this subtask
const parentTask = tasks.find(t => t.id === subtask.parentTaskId);

// Use new canEditSubtask function
canEditSubtask(subtask, parentTask).then(canEditThis => {
    editBtn.style.display = canEditThis ? '' : 'none';
    editBtn.disabled = !canEditThis;
});
```

### Updated Function: updateEditDeleteButtonVisibility()

**Location:** [Lines 5127-5169](index.html#L5127-L5169)

**Changes:**
- Added detailed logging for task edit permissions
- Shows reason why edit is allowed/denied
- Only logs for tasks page

```javascript
// Debug logging
if (page === 'tasks') {
    const logMsg = canEditThis ? '✅' : '❌';
    const reason = !canEditPerm ? 'no edit permission' : !isItemOwner ? 'not owner' : 'can edit';
    console.log(`${logMsg} Task "${item.name}" - Edit button: ${canEditThis ? 'visible' : 'hidden'}`);
}
```

## Console Logging

The implementation includes detailed console logs for debugging:

### Task Edit Permission Logs
```
✅ Task "Website Redesign" - Edit button: visible (can edit)
❌ Task "Mobile App" - Edit button: hidden (not owner)
❌ Task "API Dev" - Edit button: hidden (no edit permission)
```

### Subtask Edit Permission Logs
```
✅ Subtask "Design mockups" - User assigned to parent task, can edit all subtasks
✅ Subtask "Write tests" - User owns subtask, can edit own subtasks
❌ Subtask "Setup database" - User not assigned to parent and doesn't own subtask
```

## User Interface Behavior

### User with Edit Permission - Assigned to Task

| Item | Can Edit | Reason |
|------|----------|--------|
| Parent Task | ✅ Yes | Own task + edit permission |
| Subtask A (own) | ✅ Yes | Assigned to parent task |
| Subtask B (other) | ✅ Yes | Assigned to parent task |
| Subtask C (other) | ✅ Yes | Assigned to parent task |

### User with Edit Permission - NOT Assigned to Task

| Item | Can Edit | Reason |
|------|----------|--------|
| Parent Task | ❌ No | Not owner |
| Subtask A (own) | ✅ Yes | Own subtask |
| Subtask B (other) | ❌ No | Not owner, not parent assignee |
| Subtask C (other) | ❌ No | Not owner, not parent assignee |

### User WITHOUT Edit Permission

| Item | Can Edit | Reason |
|------|----------|--------|
| Parent Task | ❌ No | No edit permission |
| Subtask A (own) | ❌ No | No edit permission |
| Subtask B (other) | ❌ No | No edit permission |
| All Items | ❌ No | No edit permission |

## Scenarios

### Scenario 1: User Assigned to Task, With Edit Permission

**Setup:**
```
Tasks Page Permission: edit = true
Task A: Assigned to User
  - Subtask A1: Assigned to User
  - Subtask A2: Assigned to Other User
Task B: Assigned to Other User
  - Subtask B1: Assigned to User
  - Subtask B2: Assigned to Other User
```

**Result:**
```
✅ Can edit Task A (own task + edit permission)
✅ Can edit Subtask A1 (parent task assignee)
✅ Can edit Subtask A2 (parent task assignee)

❌ Cannot edit Task B (not owner)
❌ Cannot edit Subtask B1 (not parent assignee, own subtask doesn't matter)
❌ Cannot edit Subtask B2 (not parent assignee)
```

### Scenario 2: User NOT Assigned to Task, With Edit Permission

**Setup:**
```
Tasks Page Permission: edit = true
Task X: Assigned to Other User
  - Subtask X1: Assigned to User
  - Subtask X2: Assigned to Other User
Task Y: Assigned to User
  - Subtask Y1: Not assigned
  - Subtask Y2: Assigned to User
```

**Result:**
```
❌ Cannot edit Task X (not owner)
✅ Can edit Subtask X1 (owns subtask)
❌ Cannot edit Subtask X2 (not owner, not parent assignee)

✅ Can edit Task Y (own task)
✅ Can edit Subtask Y1 (parent task assignee)
✅ Can edit Subtask Y2 (parent task assignee)
```

### Scenario 3: User WITHOUT Edit Permission

**Setup:**
```
Tasks Page Permission: edit = false
(All tasks and subtasks)
```

**Result:**
```
❌ Cannot edit anything
- All edit buttons hidden
- Edit permission is the first check
```

## Technical Details

### Permission Check Order for Subtasks

```
1. Check if user has edit permission on tasks page
   ├─ NO → Cannot edit (return false)
   └─ YES → Continue

2. Check if user is assigned to parent task
   ├─ YES → Can edit all subtasks (return true)
   └─ NO → Continue

3. Check if user owns the subtask
   ├─ YES → Can edit own subtask (return true)
   └─ NO → Cannot edit (return false)
```

### Why This Order?

1. **Edit permission first** - No point checking ownership if no permission
2. **Parent assignment second** - Gives full task access to assignee
3. **Ownership last** - Fallback for users with specific subtask assignment

## Testing Checklist

- [ ] User with edit permission can edit their own tasks
- [ ] User without edit permission cannot edit tasks
- [ ] User assigned to task can edit ALL subtasks
- [ ] User NOT assigned to task can edit only their own subtasks
- [ ] User NOT assigned to task cannot edit other's subtasks
- [ ] Edit buttons hidden for users without permission
- [ ] Edit buttons disabled with appropriate titles
- [ ] Console logs show correct reason for edit/no-edit
- [ ] Multiple users see different edit options
- [ ] Subtask parent task lookup works correctly

## Files Modified

- `index.html`
  - Lines 5293-5326: New canEditSubtask() function
  - Lines 5242-5280: Updated updateSubtaskEditDeleteButtonVisibility()
  - Lines 5149-5154: Added debug logging to updateEditDeleteButtonVisibility()

## Commit Information

**Hash:** 3b82415
**Message:** "Implement: Granular edit permissions for tasks and subtasks based on parent task assignment"

## Related Functions

- `canEdit(page)` - Check if user has edit permission for a page
- `isOwner(item)` - Check if user created/owns an item
- `getCurrentUser()` - Get current logged-in user
- `updateEditDeleteButtonVisibility()` - Update task button visibility
- `updateSubtaskEditDeleteButtonVisibility()` - Update subtask button visibility

## Edge Cases Handled

1. ✅ **No parent task found** - Logs warning, skips button update
2. ✅ **Multiple assignees** - Checks both email and name fields
3. ✅ **Mixed ownership** - Some tasks owned, some not
4. ✅ **Async permission check** - Uses promises for canEditSubtask
5. ✅ **Button not found** - Skips if button element doesn't exist

## Future Enhancements

- Granular subtask permissions (separate from parent)
- Team lead can edit team member's tasks
- Manager override for team task editing
- Audit logging of who edited what
- Edit history tracking
- Collaborative editing for tasks
- Permission hierarchy visualization

