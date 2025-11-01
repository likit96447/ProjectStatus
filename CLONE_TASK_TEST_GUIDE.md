# Clone Task Test Guide

**Date:** November 1, 2024
**Version:** 1.0
**Status:** Ready for Testing

---

## Overview

This guide will help you verify that the clone task fix is working correctly. The fix ensures that cloned tasks appear in the UI immediately after creation.

---

## Prerequisites

- Project Status Dashboard application loaded
- User logged in with proper permissions
- At least one existing task assigned to the current user
- Browser console open for monitoring (optional but helpful)

---

## Test Case 1: Basic Clone Task

**Objective:** Verify cloned task appears in task list

### Steps:

1. ✅ Navigate to **Tasks** page
2. ✅ Find a task assigned to you
3. ✅ Click the **Clone** (📋) button on the task
4. ✅ Verify in console: `✅ Task cloned successfully with ID: [taskId]` message appears
5. ✅ Verify UI: The cloned task appears in the task list
6. ✅ Verify the cloned task has name like "**Original Task Name (Copy)**"

### Expected Result:
```
✅ PASS - Cloned task appears immediately in the task list
```

---

## Test Case 2: Clone Task with Same Assignment

**Objective:** Verify cloned task is assigned to the same user

### Steps:

1. ✅ Clone a task (following Test Case 1)
2. ✅ Verify the cloned task shows in your task list
3. ✅ Open the cloned task details
4. ✅ Verify **Assigned To** field shows the same person as original task

### Expected Result:
```
✅ PASS - Cloned task has same assignment as original
```

---

## Test Case 3: Clone Task Preserves All Fields

**Objective:** Verify cloned task has all the same field values

### Steps:

1. ✅ Clone a task with:
   - Status: "In Progress"
   - Priority: "High"
   - Start Date: "2025/11/03"
   - Due Date: "2025/11/07"

2. ✅ Verify cloned task has:
   - Status: "In Progress" (same as original)
   - Priority: "High" (same as original)
   - Start Date: "2025/11/03" (same as original)
   - Due Date: "2025/11/07" (same as original)

### Expected Result:
```
✅ PASS - All fields are copied correctly
```

---

## Test Case 4: Multiple User Scenario

**Objective:** Verify cloned task with multi-user assignment

### Steps:

1. ✅ Login as User A (e.g., Developer role)
2. ✅ Create a task assigned to User A
3. ✅ Clone the task
4. ✅ Verify cloned task appears in User A's list
5. ✅ (Optional) Login as User B
6. ✅ (Optional) Verify cloned task does NOT appear in User B's list (they're not assigned)

### Expected Result:
```
✅ PASS - Cloned task filtering works correctly by assignment
```

---

## Test Case 5: Permission-Based Clone

**Objective:** Verify clone button visibility based on add permission

### Steps:

1. ✅ Login as Developer (has add permission)
2. ✅ Navigate to Tasks page
3. ✅ Verify Clone button shows on tasks
4. ✅ Clone a task - should work
5. ✅ (Optional) Login as User with no add permission
6. ✅ (Optional) Verify Clone button hidden

### Expected Result:
```
✅ PASS - Clone button respects permission levels
```

---

## Test Case 6: Console Logging Verification

**Objective:** Verify console shows proper debugging logs

### Steps:

1. ✅ Open Browser Console (F12 → Console tab)
2. ✅ Clone a task
3. ✅ Look for these messages in order:

```
📤 Adding cloned task to Firebase... {clonedTask object}
✅ Task cloned successfully with ID: [taskId]
🔄 Reloading tasks from Firebase...
✅ Tasks and subtasks reloaded
```

4. ✅ Verify NO error messages appear

### Expected Result:
```
✅ PASS - All console messages appear without errors
```

---

## Test Case 7: Subtask Cloning (if applicable)

**Objective:** Verify cloned task includes all subtasks

### Steps:

1. ✅ Find a task with subtasks
2. ✅ Clone the task
3. ✅ Open the cloned task details
4. ✅ Verify subtasks section is empty (subtasks not cloned, only parent task)

### Expected Result:
```
✅ PASS - Parent task cloned, subtasks not cloned (expected)
```

---

## Test Case 8: Real-time Listener Behavior

**Objective:** Verify real-time listener doesn't create duplicates

### Steps:

1. ✅ Clone a task
2. ✅ Wait 5 seconds (for real-time listener to re-enable)
3. ✅ Verify task appears only ONCE in the list (no duplicates)

### Expected Result:
```
✅ PASS - No duplicate tasks appear
```

---

## Browser Console Monitoring

When testing, watch for these console messages:

### ✅ SUCCESS MESSAGES:
```
✅ Task cloned successfully with ID: [docId]
✅ Tasks and subtasks reloaded
✅ Real-time listener re-enabled
```

### ⚠️ WARNING MESSAGES (Expected):
```
📤 Adding cloned task to Firebase...
🔄 Reloading tasks from Firebase...
```

### ❌ ERROR MESSAGES (Problematic):
```
❌ Error cloning task: [error message]
❌ Database connection not available
❌ Error adding task to Firebase: [error message]
```

---

## Troubleshooting

### Issue: Cloned task doesn't appear after cloning

**Possible Causes:**
1. Permission issue - User lacks add permission
2. Assignment mismatch - Check if task is assigned by UID
3. Filtering issue - Check if cloned task matches assignment

**Solution:**
1. Verify user has "add" permission for Tasks page
2. Check console for error messages
3. Refresh page and check if cloned task appears
4. Check Firebase Firestore to confirm task was created

---

### Issue: Clone button is hidden

**Possible Causes:**
1. User lacks add permission
2. User is not assigned to the task
3. Task has edit permission disabled

**Solution:**
1. Check Page Permissions in Settings
2. Verify user role has add permission for tasks
3. Verify user is assigned to the original task

---

### Issue: Console shows "Database connection not available"

**Possible Causes:**
1. Firebase not initialized
2. Network connectivity issue
3. Session expired

**Solution:**
1. Refresh the page
2. Check network connection
3. Re-login if session expired

---

## Expected Performance

⏱️ **Clone operation should take:**
- 2-3 seconds for task to appear in UI
- 5 seconds for real-time listener to re-enable

---

## Verification Checklist

After running all tests, verify:

- [ ] Test Case 1: Basic Clone - PASS
- [ ] Test Case 2: Same Assignment - PASS
- [ ] Test Case 3: Field Preservation - PASS
- [ ] Test Case 4: Multi-user - PASS
- [ ] Test Case 5: Permissions - PASS
- [ ] Test Case 6: Console Logs - PASS
- [ ] Test Case 7: Subtasks - PASS
- [ ] Test Case 8: Real-time - PASS

---

## Sign-Off

- **Tested By:** [Your Name]
- **Date Tested:** [Date]
- **Result:** ✅ PASS / ❌ FAIL

If any test fails, please:
1. Document the failure
2. Check browser console for error messages
3. Report issue with console output and steps to reproduce

---

## Related Documentation

- [Clone Task Fix Summary](./CLONE_TASK_FIX_SUMMARY.md)
- [Permission Rules - Tasks Page](./PERMISSION_RULES_TASKS_PAGE.md)
- [Implementation Complete Summary](./IMPLEMENTATION_COMPLETE_SUMMARY.md)

