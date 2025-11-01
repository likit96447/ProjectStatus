# Task & Subtask Delete Permissions

## Overview

Implemented role-based permission controls for deleting tasks and subtasks with specific rules:
- **Subtasks**: Can be deleted if user has delete permission AND can see the subtask
- **Tasks**: Can be deleted ONLY if user is assigned to task AND task has NO subtasks

## Delete Permission Rules

### Delete Subtask
User can delete a **subtask** if:
- ✅ User has `delete: true` permission on **Tasks page**, AND
- ✅ User can see the subtask (visibility-based)
  - User is assigned to parent task, OR
  - User is assigned to the subtask itself

User **CANNOT** delete a subtask if:
- ❌ User does not have `delete` permission on Tasks page
- ❌ User cannot see the subtask

### Delete Task
User can delete a **task** if:
- ✅ User has `delete: true` permission on **Tasks page**, AND
- ✅ User is assigned to the task, AND
- ✅ Task has NO subtasks

User **CANNOT** delete a task if:
- ❌ User does not have `delete` permission on Tasks page
- ❌ User is not assigned to the task
- ❌ Task has any subtasks (must delete subtasks first)

## Implementation Details

### New Permission Check Hierarchy

```
For Deleting Subtasks:
  1. Check if user has "delete" permission on Tasks page
  2. Check if user can see this subtask
     - Is user assigned to parent task? → Can see all subtasks
     - Is user assigned to this subtask? → Can see this subtask
  3. Allow if BOTH checks pass
  4. Otherwise deny with specific error message

For Deleting Tasks:
  1. Check if user has "delete" permission on Tasks page
  2. Check if user is assigned to the task
  3. Check if task has any subtasks
  4. Allow ONLY if ALL checks pass
  5. Otherwise deny with specific error message
```

### Updated Function: deleteSubtask() [Lines 10173-10202]

**Location:** [index.html:10173-10202](index.html#L10173-L10202)

**Purpose:** Delete a subtask with visibility-based permissions

**Logic:**
```javascript
// 1. Find parent task
const parentTask = tasks.find(t => t.id === subtask.parentTaskId);
if (!parentTask) {
    alert('Error: Parent task not found');
    return;
}

// 2. Check delete permission
const hasDeletePermission = await canDelete('tasks');
if (!hasDeletePermission) {
    alert('You do not have permission to delete subtasks');
    return;
}

// 3. Check if user can see this subtask (using visibility logic)
const canDeleteThisSubtask = await canEditSubtask(subtask, parentTask);
if (!canDeleteThisSubtask) {
    alert('You can only delete subtasks you can see');
    return;
}

// 4. Show confirmation
if (!confirm(`Are you sure you want to delete this subtask "${subtask.name}"?`)) {
    return;
}

// 5. Delete from Firebase
await db.collection('subtasks').doc(subtaskId).delete();
```

**Key Points:**
- Uses `canEditSubtask()` to verify visibility (same as edit permissions)
- Checks both delete permission AND visibility
- Prevents deletion of subtasks user cannot see
- Clear alerts explain WHY deletion is blocked

### Updated Function: deleteTask() [Lines 10412-10441]

**Location:** [index.html:10412-10441](index.html#L10412-L10441)

**Purpose:** Delete a task with assignment and subtask existence checks

**Logic:**
```javascript
// 1. Check delete permission
const hasDeletePermission = await canDelete('tasks');
if (!hasDeletePermission) {
    alert('You do not have permission to delete tasks');
    return;
}

// 2. Check if user is assigned to task
const isTaskOwner = isOwner(task);
const isUserAssignedToTask = task.assignedTo === currentUser?.email ||
                            task.assignedToNames?.includes(currentUser?.name) ||
                            task.assignedToNames?.includes(currentUser?.email);

if (!isTaskOwner && !isUserAssignedToTask) {
    alert('You can only delete tasks you are assigned to');
    return;
}

// 3. Check if task has subtasks - CANNOT delete if it does
const taskSubtasks = subtasks.filter(st => st.parentTaskId === task.id);
if (taskSubtasks.length > 0) {
    alert(`Cannot delete task "${task.name}" because it has ${taskSubtasks.length} subtask(s). Please delete subtasks first.`);
    return;
}

// 4. Show confirmation
if (!confirm(`Are you sure you want to delete the task "${task.name}"?`)) {
    return;
}

// 5. Delete from Firebase (no cascade delete of subtasks)
await deleteTaskFromFirebase(task.id);
```

**Key Points:**
- Checks: permission → assignment → subtask existence
- Does NOT cascade delete subtasks (user must delete them first)
- Clear alerts explain why deletion is blocked
- Prevents data loss by refusing to delete parent tasks with active subtasks

## Console Logging

The implementation includes detailed console logs for debugging:

### Subtask Delete
```
✅ User can delete subtask "Design Database Schema"
🔒 User does not have delete permission for tasks
🔒 User cannot delete subtask "Design Database Schema" - not visible to them
✅ Subtask deleted: doc-id-123
```

### Task Delete
```
✅ User can delete task "Website Redesign" - assigned to task and has no subtasks
🔒 User does not have delete permission for tasks
🔒 User cannot delete task "Website Redesign" - not assigned to task
🔒 Cannot delete task "Website Redesign" - has 3 subtask(s)
```

## User Interface Behavior

### Subtask Delete

| Scenario | Permission | Can See | Result |
|----------|-----------|---------|--------|
| User has delete perm + assigned to parent | ✅ | ✅ | Can delete |
| User has delete perm + assigned to subtask | ✅ | ✅ | Can delete |
| User lacks delete permission | ❌ | ✅ | Alert shown |
| User cannot see subtask | ✅ | ❌ | Alert shown |

### Task Delete

| Scenario | Permission | Assigned | Subtasks | Result |
|----------|-----------|----------|----------|--------|
| User has all conditions | ✅ | ✅ | None | Can delete |
| User lacks delete perm | ❌ | ✅ | None | Alert: No permission |
| User not assigned | ✅ | ❌ | None | Alert: Not assigned |
| Task has subtasks | ✅ | ✅ | ✅ | Alert: Delete subtasks first |

## Scenarios

### Scenario 1: Deleting Subtask User Can See

**Permissions:**
```
Tasks Page: delete=true
User Assignment: Assigned to parent task "Website Redesign"
```

**Subtasks in parent task:**
```
✓ Design Database Schema (assigned to User)
✓ Create API Endpoints (assigned to Other User)
```

**Result:**
```
✅ User can delete "Design Database Schema" (can see it)
✅ User can delete "Create API Endpoints" (can see all parent task's subtasks)
```

### Scenario 2: Deleting Subtask User Cannot See

**Permissions:**
```
Tasks Page: delete=true
User Assignment: Not assigned to parent task, but assigned to one subtask
```

**Subtasks in parent task:**
```
✓ Design Database Schema (assigned to User)
✓ Create API Endpoints (assigned to Other User)
```

**Result:**
```
✅ User can delete "Design Database Schema" (assigned to it)
❌ User cannot delete "Create API Endpoints" (cannot see it - not assigned to parent or subtask)
Alert: "You can only delete subtasks you can see"
```

### Scenario 3: Deleting Task With Subtasks

**Permissions:**
```
Tasks Page: delete=true
User Assignment: Assigned to task "Website Redesign"
```

**Task structure:**
```
Task: "Website Redesign" (assigned to User)
  ├─ Subtask: "Design Homepage"
  ├─ Subtask: "Design Product Pages"
  └─ Subtask: "Setup Database"
```

**Result:**
```
❌ Cannot delete "Website Redesign"
Alert: "Cannot delete task because it has 3 subtask(s). Please delete subtasks first."
Steps to resolve:
1. Delete all 3 subtasks first
2. Then delete the parent task
```

### Scenario 4: Deleting Task Without Subtasks

**Permissions:**
```
Tasks Page: delete=true
User Assignment: Assigned to task "Bug Fix - Login Form"
```

**Task structure:**
```
Task: "Bug Fix - Login Form" (assigned to User)
  (No subtasks)
```

**Result:**
```
✅ User can delete "Bug Fix - Login Form"
1. Confirmation dialog appears
2. After confirmation, task is deleted
```

## Error Messages

### When User Tries to Delete Subtask Without Permission
```
You do not have permission to delete subtasks
```

### When User Tries to Delete Subtask They Cannot See
```
You can only delete subtasks you can see
```

### When User Tries to Delete Task Without Permission
```
You do not have permission to delete tasks
```

### When User Tries to Delete Task They're Not Assigned To
```
You can only delete tasks you are assigned to
```

### When User Tries to Delete Task With Subtasks
```
Cannot delete task "Website Redesign" because it has 3 subtask(s). Please delete subtasks first.
```

## Testing Checklist

- [ ] User with delete permission can delete subtasks they can see
- [ ] User with delete permission cannot delete subtasks they cannot see
- [ ] User without delete permission cannot delete subtasks (alert shown)
- [ ] User with delete permission can delete tasks without subtasks
- [ ] User with delete permission cannot delete tasks with subtasks (alert shown)
- [ ] User not assigned to task cannot delete it (alert shown)
- [ ] User without delete permission cannot delete tasks (alert shown)
- [ ] Subtasks must be deleted before parent task can be deleted
- [ ] Console logs show correct permission check flow
- [ ] Confirmation dialogs show correct task/subtask names
- [ ] Multiple users see correct delete capabilities based on their permissions

## Files Modified

- `index.html`
  - Lines 10173-10202: Updated deleteSubtask() with visibility-based permissions
  - Lines 10412-10441: Updated deleteTask() with assignment and subtask existence checks
  - Removed cascade delete logic (no longer deletes subtasks automatically)

## Commit Information

**Hash:** 6a09417
**Message:** "Implement: Delete permission rules - tasks with subtasks cannot be deleted, subtasks use visibility-based permissions"

## Technical Details

### Why This Approach?

**Visibility-Based Subtask Deletion:**
- Consistency: Same visibility rules as editing subtasks
- Security: Cannot delete what you cannot see
- Simplicity: Uses existing `canEditSubtask()` function

**Task Deletion With Subtask Check:**
- Data integrity: Prevents orphaned subtasks
- Transparency: User knows why deletion blocked
- Explicit action: User must consciously delete subtasks first
- No cascade delete: Safer approach, users control what gets deleted

### Why No Cascade Delete?

1. **Data Safety:** Prevents accidental deletion of multiple subtasks
2. **Visibility:** User sees what's being deleted
3. **Accountability:** User consciously deletes each subtask
4. **Recovery:** Easier to recover individual subtasks if needed
5. **User Intent:** Confirms user wants subtasks deleted

## Related Functions

- `deleteSubtask()` - Delete subtask with visibility checks
- `deleteTask()` - Delete task with subtask existence check
- `canDelete(page)` - Check if user has delete permission
- `canEditSubtask(subtask, parentTask)` - Check subtask visibility
- `isOwner(item)` - Check item ownership
- `getCurrentUser()` - Get current logged-in user

## Future Enhancements

- Option to delete task and all subtasks (with explicit confirmation)
- Archive tasks instead of delete (soft delete)
- Bulk delete subtasks dialog
- Delete history/audit log
- Recover recently deleted tasks/subtasks
- Notification when task deleted that has assigned subtasks

## Summary

✅ **Delete permission system fully implemented**

Two key rules now enforced:

1. **Subtasks:** Can be deleted if user has delete permission AND can see the subtask (visibility-based)
2. **Tasks:** Can be deleted ONLY if user assigned to task AND task has NO subtasks

All delete operations are permission-checked, user-visible, and include clear error messages explaining why deletion is blocked.
