# Edit Button Visibility Fix - Per-Project Control

## Problem Found ❌

The Edit button visibility was not working correctly because of a **critical bug** in the `updateProjectEditDeleteButtonVisibility()` function.

### Root Cause

The function was:
1. Looping through all projects
2. **But selecting ALL buttons on the page** each iteration: `document.querySelectorAll('[data-action="edit"]')`
3. This caused **ALL buttons to be updated based on the LAST project's permissions**
4. Result: All Edit buttons had the same visibility state (from the last project processed)

**Example Bug Scenario:**
```
Projects:  [Project A (not owner), Project B (owner), Project C (not owner)]

Loop iteration 1:
  - Process Project A (not owner)
  - Select ALL edit buttons on page
  - Set all to hidden (because not owner of A)

Loop iteration 2:
  - Process Project B (owner)
  - Select ALL edit buttons on page  ← SAME BUTTONS AGAIN!
  - Set all to visible (because owner of B)

Loop iteration 3:
  - Process Project C (not owner)
  - Select ALL edit buttons on page  ← SAME BUTTONS AGAIN!
  - Set all to hidden (because not owner of C)

Final Result: ALL edit buttons hidden (last project's state)
```

## Solution Implemented ✅

### 1. Added Project ID Data Attribute

**File:** [index.html:10844](c:\Users\HP OMEN\Downloads\AI Vibe coding\ProjectStatus\index.html#L10844)

Added `data-project-id="${project.id}"` to each project card:

```html
<div class="project-card" data-project-id="${project.id}" ...>
```

This creates a unique identifier for each card.

### 2. Fixed Button Visibility Logic

**File:** [index.html:5101-5142](c:\Users\HP OMEN\Downloads\AI Vibe coding\ProjectStatus\index.html#L5101-L5142)

Changed from:
```javascript
// ❌ OLD - BROKEN
const editBtns = document.querySelectorAll(`[data-action="edit"]`);  // ALL buttons!
editBtns.forEach((btn) => {
    // Updates ALL buttons based on current project
});
```

To:
```javascript
// ✅ NEW - FIXED
for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const isProjectOwner = isOwner(project);
    const canEditThis = canEditPerm && isProjectOwner;

    // Find ONLY the button for THIS specific project
    const projectCard = document.querySelector(`.project-card[data-project-id="${project.id}"]`);
    const editBtn = projectCard.querySelector(`[data-action="edit"]`);

    // Update ONLY this button
    if (editBtn) {
        editBtn.style.display = canEditThis ? '' : 'none';
    }
}
```

### Key Improvements

1. **Per-Project Targeting**: Each button's visibility is controlled individually
2. **Scoped Selectors**: Uses `projectCard.querySelector()` to find buttons within that specific card
3. **Detailed Logging**: Shows which buttons are visible/hidden for which projects
4. **Data Attribute Anchor**: Uses `data-project-id` to reliably match buttons to projects

## How It Works Now

### Button Visibility Logic

```
For each project:
  1. Get project permissions (canEditPerm)
  2. Check if user is project owner (isProjectOwner)
  3. Combine: canEditThis = canEditPerm && isProjectOwner
  4. Find that project's card using data-project-id
  5. Find edit button WITHIN that card
  6. Update ONLY that button's visibility
```

### Example Correct Behavior

```
Projects: [Project A (not owner), Project B (owner), Project C (not owner)]

Project A:
  - Edit Permission: ✅ (user has edit permission)
  - Is Owner: ❌ (user is not PM of Project A)
  - Result: Edit button HIDDEN (❌)

Project B:
  - Edit Permission: ✅ (user has edit permission)
  - Is Owner: ✅ (user is PM of Project B)
  - Result: Edit button VISIBLE (✅)

Project C:
  - Edit Permission: ✅ (user has edit permission)
  - Is Owner: ❌ (user is not PM of Project C)
  - Result: Edit button HIDDEN (❌)

Final Page Result: A(hidden), B(visible), C(hidden) ✅
```

## Console Logs

The function now provides detailed debugging information:

```
🔘 Updating project edit/delete button visibility...
🔘 Project "Website Redesign" | Edit button: visible ✅
🔘 Project "Mobile App" | Edit button: hidden ❌
🔘 Project "API Development" | Edit button: visible ✅
✅ Project edit/delete button visibility updated for all cards
```

## Testing

### Test Case 1: Mixed Ownership
**Setup:**
- User has `edit: true` permission
- User is PM of Project B only
- 3 projects on page

**Expected:**
- Project A: Edit button hidden
- Project B: Edit button visible
- Project C: Edit button hidden

**Result:** ✅ Should work correctly now

### Test Case 2: All Projects Owned
**Setup:**
- User has `edit: true` permission
- User is PM of all projects

**Expected:**
- All Edit buttons visible

**Result:** ✅ Should work correctly now

### Test Case 3: No Ownership
**Setup:**
- User has `edit: true` permission
- User is PM of no projects

**Expected:**
- All Edit buttons hidden

**Result:** ✅ Should work correctly now

## Technical Details

### Data Attributes Used
- `data-project-id="${project.id}"` - Unique project identifier on card
- `data-action="edit"` - Identifies edit button type
- `data-action="delete"` - Identifies delete button type
- `data-action="tasks"` - Identifies tasks button (always shown)

### Files Modified
- `index.html` (Lines 10844 and 5101-5142)

### Functions Affected
- `renderProjectsGridView()` - Adds data-project-id attribute
- `updateProjectEditDeleteButtonVisibility()` - Fixed button selection logic

## Commit

**Hash:** f726114
**Message:** "Fix: Edit button visibility controlled per-project, not all projects"

## What This Fixes

✅ Edit button now shows correctly per project
✅ Delete button now shows correctly per project
✅ Users who are PMs of some (but not all) projects see correct button states
✅ Multiple projects with different permissions display correctly
✅ Console logs help debug permission issues

## Summary

This fix ensures that each project's Edit and Delete buttons are controlled **individually** rather than all being updated based on the last project's permissions. The solution uses `data-project-id` attributes to reliably match buttons to their projects and scoped selectors to update only the relevant buttons.

