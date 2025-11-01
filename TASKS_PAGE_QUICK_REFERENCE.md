# Tasks Page Permissions - Quick Reference

## Current Permission Structure

### 🔐 Permissions File Location
**index.html, Lines 4224-4265**

---

## 5 Roles & Their Task Permissions

### 1. 👨‍💼 Project Manager
```
Tasks: show=✅ add=✅ edit=✅ delete=✅
```
**Full access to everything**

---

### 2. 📊 Business Analyst
```
Tasks: show=✅ add=✅ edit=✅ delete=✅
```
**Full task management** (no project/team access)

---

### 3. 🔧 System Analyst
```
Tasks: show=✅ add=✅ edit=✅ delete=✅
```
**Full task management** (no project/team access)

---

### 4. 👨‍💻 Developer
```
Tasks: show=✅ add=✅ edit=✅ delete=❌
```
**Can create and edit, but NOT delete**

---

### 5. 🧪 QA Lead
```
Tasks: show=✅ add=✅ edit=✅ delete=❌
```
**Can create and edit, but NOT delete**

---

## What Each Permission Means

| Permission | Show Button | Allows |
|-----------|-----------|--------|
| **show** | N/A | See Tasks page & tasks assigned to you |
| **add** | ➕ Add Subtask | Create new tasks & subtasks |
| **edit** | ✏️ Edit + 📋 Clone | Modify task details & clone |
| **delete** | 🗑️ Delete | Remove tasks permanently |

---

## Button Visibility Rules

### If User Has Permission & Ownership
```
Task Name | ➕ | ✏️ | 📋 | 🗑️
```
(All buttons visible)

### If User Has Permission but NOT Assigned
```
Task Name |   |   |   |
```
(All buttons hidden - not owner/assigned)

### If User NOT Assigned + Has Add Permission Only
```
Task Name | ➕ |   |   |
```
(Only add subtask visible)

### If Developer (No Delete Permission) & Assigned
```
Task Name | ➕ | ✏️ | 📋 |
```
(Delete button hidden)

---

## Two-Level Permission System

### Level 1: Role Permissions
- Checked when permission function is called
- Stored in Firebase: `page_permissions/global`
- Determines if user CAN perform action globally

### Level 2: Task Assignment
- Checked for edit/delete buttons
- User must be owner OR assigned to task
- Prevents unauthorized modifications

**Example:**
```
User = Developer (has edit permission)
Task = "System Upgrade" (assigned to QA Lead)

Result: Edit button HIDDEN
Reason: Developer not assigned + not owner
```

---

## Button Implementation

### Subtask Button (➕)
```javascript
Show if: canAdd('tasks') === true
Hide if: canAdd('tasks') === false
```
**Example:**
- QA Lead with add=true → Button shows
- QA Lead with add=false → Button hides

---

### Edit Button (✏️)
```javascript
Show if: canEdit('tasks') && (isOwner || isAssigned)
Hide if: !canEdit || (!isOwner && !isAssigned)
```
**Example:**
- Developer with edit=true, assigned to task → Shows
- Developer with edit=true, not assigned → Hides
- Developer with edit=false → Hides

---

### Clone Button (📋)
```javascript
Show if: canEdit('tasks') && (isOwner || isAssigned)
Hide if: !canEdit || (!isOwner && !isAssigned)
```
**Note:** Clone requires EDIT permission (creates new task)

---

### Delete Button (🗑️)
```javascript
Show if: canDelete('tasks') && (isOwner || isAssigned)
Hide if: !canDelete || (!isOwner && !isAssigned)
```
**Example:**
- Project Manager assigned to task → Delete shows
- Developer assigned to task → Delete hides (no permission)
- Business Analyst NOT assigned → Delete hides (not owner)

---

## Real-World Scenarios

### Scenario 1: New Developer Starts
- Role: Developer
- Permissions: show=✅ add=✅ edit=✅ delete=❌
- Assigned tasks: 5
- Result: Can create/edit/clone own tasks, but cannot delete

**Buttons on assigned task:**
```
Task #10 | ➕ | ✏️ | 📋 |
```

**Buttons on unassigned task:**
```
Task #7 | (not visible - task filtered out)
```

---

### Scenario 2: QA Lead Reviews Task
- Role: QA Lead
- Permissions: show=✅ add=✅ edit=✅ delete=❌
- Assigned to: Test Task #1
- Result: Can modify test task, but cannot delete

**Buttons:**
```
Test Task #1 | ➕ | ✏️ | 📋 |
```

---

### Scenario 3: Project Manager Cleanup
- Role: Project Manager
- Permissions: show=✅ add=✅ edit=✅ delete=✅
- Can delete any task they own or are assigned to
- Result: Full control

**Buttons on assigned task:**
```
Any Task | ➕ | ✏️ | 📋 | 🗑️
```

---

### Scenario 4: Multiple Users on Same Task
- Task #5 assigned to: Developer, QA Lead, Business Analyst

**Developer sees:**
```
Task #5 | ➕ | ✏️ | 📋 |
```
(Can edit but not delete)

**QA Lead sees:**
```
Task #5 | ➕ | ✏️ | 📋 |
```
(Can edit but not delete)

**Business Analyst sees:**
```
Task #5 | ➕ | ✏️ | 📋 | 🗑️
```
(Can edit AND delete)

---

## Permission Checking Flow

```
User clicks Edit button on Task #1
         ↓
Check: canEdit('tasks') = true?
         ↓
Check: isOwner || isAssigned?
         ↓
All true → Show button & enable click
All true → Hide button & disable click
```

---

## Firebase Structure

**Collection:** `page_permissions`
**Document:** `global`

**Example Data:**
```json
{
  "Project Manager": {
    "tasks": {
      "show": true,
      "add": true,
      "edit": true,
      "delete": true,
      "admin": true
    }
  },
  "Developer": {
    "tasks": {
      "show": true,
      "add": true,
      "edit": true,
      "delete": false,
      "admin": false
    }
  }
}
```

---

## How to Change Permissions

### Option 1: Admin Panel
- Go to Admin page
- Edit role permissions
- Save changes

**Location:** Admin → Role Management → Tasks permissions

### Option 2: Direct Firebase
- Edit `page_permissions` document
- Update role permissions
- Changes apply immediately

---

## Summary

**All 5 Roles Have Task Access:**
- ✅ Show (view tasks)
- ✅ Add (create tasks)
- ✅ Edit (modify tasks)

**Delete Access:**
- ✅ Project Manager, Business Analyst, System Analyst
- ❌ Developer, QA Lead

**Task Visibility:**
- Users only see tasks they're assigned to
- Or tasks where they have subtasks assigned

**Button Hiding:**
- Buttons hidden (display:none) when no permission
- Not just disabled (better UX)
