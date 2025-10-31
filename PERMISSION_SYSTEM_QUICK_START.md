# Permission System - Quick Start Guide

## What Was Done

A complete role-based access control (RBAC) system has been implemented to control what users can see and do in the application.

## Key Features

### 1. ✅ Page-Level Access Control
- Show/hide pages based on role permissions
- Menu automatically updates
- Prevents navigation to unauthorized pages

### 2. ✅ Permission Checking Functions
- Simple functions to check permissions
- Cached for performance
- Admin role auto-grants all permissions

### 3. ✅ Data Visibility Filtering
- Admin sees all data
- Other users see only:
  - Data they created
  - Data assigned to them
  - Public data (team members)

### 4. ✅ Menu Visibility
- Automatically hides menu items user cannot access
- Settings menu hidden unless user is admin
- Runs on page load

### 5. ✅ Page Access Enforcement
- Checks permission when switching pages
- Shows error if user lacks permission
- Prevents unauthorized access

## Using the Permission Functions

### Check if user has permission
```javascript
// Quick checks
const canViewTasks = await canShow('tasks');
const canAddProject = await canAdd('projectslist');
const canEditTask = await canEdit('tasks');
const canDeleteTask = await canDelete('tasks');

// Direct permission check
const hasPermission = await hasPermission('dashboard', 'show');

// Check multiple permissions (must have ALL)
const canManage = await hasAllPermissions([
    { page: 'tasks', operation: 'show' },
    { page: 'tasks', operation: 'edit' },
    { page: 'tasks', operation: 'delete' }
]);
```

### Get user info
```javascript
const user = getCurrentUser();
// Returns: { id, email, name, role, loginTime, lastActivity }

const role = getCurrentUserRole();
// Returns: "Project Manager" | "Developer" | "Admin" | etc.

const isUserAdmin = isAdmin();
// Returns: true | false
```

### Check data ownership
```javascript
const ownsThisTask = isOwner(taskData);
// Returns true if user created/is assigned to task
```

### Filter data by ownership
```javascript
const visibleTasks = filterDataByOwnership(allTasks, 'tasks');
// Returns only tasks user can see
```

### Clear permission cache
```javascript
clearPermissionCache();
// Call after user permissions are updated
```

## Permission Levels

### Admin
- Can access everything
- Can see all data
- Can do all operations

### Role-Based (Developer, Project Manager, etc.)
- Permissions defined in Page Permissions settings
- Can only access what's allowed
- Can only see data they own/are assigned to
- Can only perform allowed operations

### Guest
- Limited to Dashboard and Projects only
- Bypasses permission system

## How Permissions Work

### 1. On Page Load
```
User logs in → updateMenuVisibility() →
Hide menu items for pages without permission
```

### 2. When Navigating to Page
```
User clicks menu item → switchPage() →
Check hasPermission(page, 'show') →
Allow or deny access
```

### 3. When Loading Data
```
Load all data from Firebase →
Filter by ownership/assignment →
Display only visible data
```

### 4. When Rendering Buttons
```
Check hasPermission(page, 'add') → Show Add button?
Check hasPermission(page, 'edit') + isOwner() → Show Edit button?
Check hasPermission(page, 'delete') + isOwner() → Show Delete button?
```

## Configuring Permissions

### Step 1: Go to Page Permissions
1. Click Settings ⚙️
2. Click "Page Permissions"
3. Find the role

### Step 2: Set Permissions
- Check = Allow (✅)
- Uncheck = Deny (❌)

### Step 3: Save
- Click "Save Changes"
- Permissions take effect immediately

## Example: Giving Developer Add Permission for Tasks

**Before:**
```
Developer role for Tasks page:
show: ✅ (can see)
add: ❌ (cannot create)
edit: ✅ (can modify)
delete: ❌ (cannot remove)
```

**Steps:**
1. Go to Page Permissions
2. Find Developer row
3. Check "add" box in Tasks columns
4. Click "Save Changes"

**After:**
```
Developer role for Tasks page:
show: ✅ (can see)
add: ✅ (can create)  ← Now allowed!
edit: ✅ (can modify)
delete: ❌ (cannot remove)
```

## Console Logs

### Permission Loading
```
✅ Loaded permissions for role: Developer
✅ Permission cache cleared
```

### Menu Updates
```
🔒 Updating menu visibility based on permissions...
✅ Menu visibility updated
```

### Page Access
```
🔒 User does not have permission to access: adminRules
```

## Common Scenarios

### Scenario 1: New Role with Minimal Permissions
```
1. Create role "Viewer" in Role Management
2. Go to Page Permissions
3. Find "Viewer" (shows all unchecked)
4. Check only:
   - Dashboard: show
   - Reports: show
5. Save

Result: Viewer can only see Dashboard and Reports (read-only)
```

### Scenario 2: Promoting Developer to Team Lead
```
1. Go to Page Permissions
2. Find Developer row
3. Check:
   - team: show, add, edit
   - dashboard: add, edit, delete (if needed)
4. Save

Result: Developer now has more permissions
```

### Scenario 3: Restricting Admin Access
```
1. Go to Page Permissions
2. Find Admin role row
3. Uncheck the "admin" checkbox in Admin columns
4. Click "Save Changes"

Result: Even Admin role users won't see settings pages
(To prevent accidental changes)
```

## Data Visibility Rules

### Task Data
- **Admin:** Sees all tasks
- **Owner:** Sees tasks they created/assigned to them
- **Others:** Don't see tasks unless created/assigned to them

### Project Data
- **Admin:** Sees all projects
- **Manager:** Sees all projects
- **Others:** See only projects they're assigned to

### Team Data
- **Everyone:** Sees all team members (public)

### Report Data
- **Admin:** Sees all reports
- **Others:** See only reports they created

## Button Visibility Rules

### Add Button
Shows if: User has `add` permission for the page

### Edit Button
Shows if: User has `edit` permission AND owns the data

### Delete Button
Shows if: User has `delete` permission AND owns the data

### Settings Menu
Shows if: User has `admin` permission

## Quick Troubleshooting

### "You do not have permission to access..."
- You don't have `show` permission for that page
- Contact admin to update permissions
- Use Page Permissions to grant access

### Menu item disappeared
- Permission was removed
- Check Page Permissions settings
- Contact admin if this is unexpected

### Can't see certain data
- You don't own/are not assigned to it
- Admins see all data
- Talk to data owner or admin

### Can't click Add/Edit/Delete buttons
- Permission not granted for that operation
- Check Page Permissions
- Contact admin to request permission

## API Reference

### Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getCurrentUser()` | Get current user data | object |
| `getCurrentUserRole()` | Get user's role name | string |
| `hasPermission(page, op)` | Check specific permission | Promise<boolean> |
| `canShow(page)` | Can user view page? | Promise<boolean> |
| `canAdd(page)` | Can user create? | Promise<boolean> |
| `canEdit(page)` | Can user modify? | Promise<boolean> |
| `canDelete(page)` | Can user remove? | Promise<boolean> |
| `isAdmin()` | Is user admin? | boolean |
| `isOwner(data)` | User owns this data? | boolean |
| `loadUserPermissions()` | Load permissions | Promise<object> |
| `filterDataByOwnership(arr, type)` | Filter array | array |
| `updateMenuVisibility()` | Update menu | Promise<void> |
| `clearPermissionCache()` | Clear cache | void |

## Current Implementation Status

✅ **Complete:**
- Permission checking functions
- Menu visibility control
- Page access enforcement
- Admin auto-grant
- Data filtering function

🔄 **In Progress:**
- Applying data filtering to pages
- Button visibility control
- Form validation

⏳ **Upcoming:**
- Advanced filtering
- Audit logging
- Performance optimization

## Summary

The permission system provides complete control over:
1. **What pages users see** - Menu and navigation control
2. **What features available** - Add/edit/delete buttons
3. **What data visible** - Show only user's data
4. **What operations allowed** - Enforce role permissions

All controlled through the Page Permissions settings page with no code changes needed.
