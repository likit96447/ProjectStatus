# Task & Subtask Permission-Based Filtering

## Overview

Implemented role-based filtering for the Tasks page so users see only tasks and subtasks they are assigned to, based on their "show" permission for the Tasks page.

## User Visibility Rules

### Tasks Page Permission
- **show: true** = User can access the Tasks page and see filtered tasks

### Task Visibility
User sees a task if:
1. ✅ Task is assigned directly to the user, **OR**
2. ✅ Task has at least one subtask assigned to the user

User does **NOT** see a task if:
- ❌ Task is not assigned to user AND no subtasks are assigned to user

### Subtask Visibility
When displaying subtasks within a task:
- ✅ Show **ALL subtasks** if user is **directly assigned to the parent task**
- ✅ Show **ALL subtasks** if user has **any subtask assignment** in that task
- ❌ Show **ONLY their assigned subtasks** if user is not assigned to parent task

## Implementation

### New Functions Added

#### 1. filterTasksByUserAssignment() [Lines 4930-4965]

**Purpose:** Filter tasks based on direct assignment or subtask assignment

**Logic:**
```javascript
For each task:
  1. Check if task is assigned directly to current user
     - task.assignedTo === currentUser.email
     - task.assignedToNames includes currentUser.name/email
  2. If not directly assigned, check for subtasks
     - Find all subtasks where parentTaskId === task.id
     - Filter for subtasks assigned to current user
  3. Include task if either condition is true
  4. Otherwise hide task
```

**Behavior:**
- Returns array of tasks user should see
- Logs why each task is shown or hidden
- Considers both direct assignment and related subtasks

#### 2. filterSubtasksByUserAssignment() [Lines 4973-4983]

**Purpose:** Filter subtasks to show only those assigned to current user

**Logic:**
```javascript
For each subtask:
  - Show if subtask.assignedTo === currentUser.email
  - Show if subtask.personName === currentUser.name
  - Show if subtask.personName === currentUser.email
  - Otherwise hide
```

**Behavior:**
- Returns only subtasks assigned to the user
- Simple 1:1 person match

### Modified Functions

#### renderTasks() [Lines 8118-8266]

**Changes:**
```javascript
// OLD - Rendered ALL tasks
tableBody.innerHTML = tasks.map((task, index) => {

// NEW - Only render filtered tasks
const filteredTasks = filterTasksByUserAssignment(tasks, subtasks);
tableBody.innerHTML = filteredTasks.map((task, index) => {
    const originalIndex = tasks.indexOf(task);
```

**Key Updates:**
- Calls `filterTasksByUserAssignment()` to get user's visible tasks
- Maps over `filteredTasks` instead of all `tasks`
- Maintains `originalIndex` for event handlers to work with full array
- Row numbers use filtered position: `filteredTasks.indexOf(task) + 1`
- All event handlers (`onclick`, `data-index`) updated to use `originalIndex`

#### renderSubtasks() [Lines 9190-9205]

**Changes:**
```javascript
// OLD - No user-based filtering
let taskSubtasks = subtasks.filter(st => st.parentTaskId === task.id);

// NEW - Apply user-based filtering
if (taskFilters.assignedTo) {
    // Keep existing filter behavior
    taskSubtasks = taskSubtasks.filter(st => st.assignedTo === taskFilters.assignedTo);
} else {
    // Apply permission-based user filtering
    taskSubtasks = filterSubtasksByUserAssignment(taskSubtasks);
}
```

**Key Updates:**
- Only applies permission filtering when no manual filter is active
- Respects existing filter dropdown behavior
- Users see only their assigned subtasks

## Console Logging

The implementation includes detailed console logging for debugging:

### Task Filtering Logs
```
📋 Task "Website Redesign" shown (directly assigned to user)
📋 Task "Mobile App" shown (has 2 assigned subtask(s))
❌ Task "Database Migration" hidden (not assigned to user, no assigned subtasks)
🔍 Task Filtering: Showing 3 of 8 tasks
```

### Subtask Filtering Logs
```
✅ User assigned to task "Website Redesign" - showing all 5 subtasks
(User NOT assigned to task - filtering subtasks)
```

## Data Flow

```
1. User navigates to Tasks page
   ↓
2. renderTasks() is called
   ↓
3. filterTasksByUserAssignment(tasks, subtasks) filters tasks
   - Checks task.assignedTo
   - Checks for user's subtasks in each task
   ↓
4. Filtered tasks are rendered in UI
   ↓
5. renderSubtasks() iterates through displayed tasks
   ↓
6. For each task, check if user is assigned to parent task:

   IF user assigned to parent task:
     - Show ALL subtasks in that task

   ELSE:
     - Call filterSubtasksByUserAssignment()
     - Show only subtasks assigned to current user
   ↓
7. Subtasks rendered under their parent tasks
```

## Example Scenarios

### Scenario 1: User with Multiple Task Types

**Data:**
```
Tasks in System:
  ✅ Task A - Assigned to User
     - Subtask A1 - Assigned to User
     - Subtask A2 - Assigned to Other User
  ❌ Task B - Not assigned to User
     - Subtask B1 - Assigned to User  ← User has subtask!
     - Subtask B2 - Not assigned
  ❌ Task C - Not assigned to User
     - Subtask C1 - Not assigned
     - Subtask C2 - Not assigned
```

**Result:**
```
User sees:
  ✅ Task A (directly assigned)
     - Subtask A1 (user's subtask)
     - Subtask A2 (shown because user has A1 in same task)

  ✅ Task B (has user's subtask B1)
     - Subtask B1 (user's subtask)
     - Subtask B2 (shown because user has B1 in same task)

  ❌ Task C (not shown - not assigned, no user subtasks)
```

### Scenario 2: User with Only Direct Task Assignment

**Data:**
```
✅ Task X - Assigned to User
   - Subtask X1 - Not assigned to User
   - Subtask X2 - Not assigned to User

❌ Task Y - Not assigned to User
   - Subtask Y1 - Assigned to User
```

**Result:**
```
User sees:
  ✅ Task X (directly assigned to user)
     - Subtask X1 (shown because user assigned to Task X)
     - Subtask X2 (shown because user assigned to Task X)
     [ALL subtasks shown because user is assigned to parent task]

  ✅ Task Y (NOT assigned but has user's subtask)
     - Subtask Y1 (user's subtask - ONLY one shown)
     [Only user's subtasks shown because not assigned to parent task]
```

## Testing Checklist

- [ ] User with no task assignments sees empty task list
- [ ] User with direct task assignment sees that task
- [ ] User sees ALL subtasks when assigned to parent task
- [ ] User with only subtask assignments sees parent task + only their subtasks
- [ ] User sees correct subtasks when scrolling through task list
- [ ] Multiple users on same system see different tasks
- [ ] Active filter dropdown still works (overrides permission filtering)
- [ ] Task count shows correct filtered number
- [ ] Console logs show filtering decisions for debugging

## Files Modified

- `index.html`
  - Lines 4930-4983: New filtering functions
  - Lines 8118-8266: Updated renderTasks()
  - Lines 9190-9213: Updated renderSubtasks()

## Commit Information

**Hash 1:** 9d20c67
**Message:** "Implement task/subtask filtering by user assignment based on permissions"

**Hash 2:** 8406f1f
**Message:** "Fix: Show all subtasks when user is assigned to parent task"

## Edge Cases Handled

1. ✅ **No assigned tasks**: User sees empty task list
2. ✅ **Multiple assignees on task**: Works with both single and array format (assignedToNames)
3. ✅ **Subtasks without parent task**: Filtered out in renderSubtasks
4. ✅ **Task with no subtasks**: Shown if directly assigned to user
5. ✅ **User assigned to parent task**: ALL subtasks shown (not just their assigned ones)
6. ✅ **User NOT assigned to parent task**: Only their assigned subtasks shown
7. ✅ **Filter dropdown active**: Overrides permission filtering temporarily
8. ✅ **User data format variations**: Checks email and name fields

## Performance Considerations

- **Filter Functions**: O(n) complexity per filter call
- **Called once per page render**: Not on scroll/hover
- **Caches current user**: Uses `getCurrentUser()` which may be cached
- **Suitable for**: Apps with hundreds of tasks/subtasks

## Future Enhancements

- Add "shared with me" visibility option
- Allow managers to view team member tasks
- Add "view as" for debugging
- Bulk view mode for admins
- Task sharing/collaboration features

