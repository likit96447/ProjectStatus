# CLAUDE.md - AI Assistant Guide for ProjectFlow

**Version:** 1.0
**Last Updated:** 2025-11-25
**Codebase:** ProjectFlow - Project Management System

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Structure](#architecture--structure)
4. [Data Models](#data-models)
5. [Permission System](#permission-system)
6. [Development Patterns](#development-patterns)
7. [Key Features](#key-features)
8. [Git Workflow](#git-workflow)
9. [Best Practices](#best-practices)
10. [Common Tasks](#common-tasks)
11. [Security Considerations](#security-considerations)
12. [Testing Guidelines](#testing-guidelines)

---

## Overview

ProjectFlow is a single-page web application for project management built with vanilla JavaScript and Firebase. It provides comprehensive task tracking, team management, role-based permissions, and analytics.

### Key Characteristics
- **No Framework:** Pure HTML/CSS/JavaScript (no React, Vue, or Angular)
- **Single File Architecture:** Main application in `index.html` (17,749 lines)
- **Firebase Backend:** Firestore for data persistence, no Firebase Auth
- **Custom Authentication:** Session-based auth using sessionStorage
- **Role-Based Access Control:** Comprehensive permission system stored in Firebase
- **Real-time Sync:** Firestore `onSnapshot()` listeners for live updates

### Main Application Pages
| Page | Purpose | Permission Required |
|------|---------|-------------------|
| Dashboard | Overview with charts and stats | `show` on `dashboard` |
| Projects | Project management and SDLC tracking | `show` on `projectslist` |
| Tasks | Task and subtask management | `show` on `tasks` |
| Team | Team member and role management | `show` on `team` |
| Reports | Analytics and activity logs | `show` on `reports` |
| Activity Logs | Audit trail of all changes | `show` on `activityLogs` |
| Page Permissions | Configure role-based permissions | `admin` permission |
| Role Management | Create and manage roles | `admin` permission |
| Admin Rules | System settings and guest mode | `admin` permission |

---

## Technology Stack

### Frontend
- **HTML5** - Semantic markup with inline structure
- **CSS3** - Custom styles (~2,500 lines inline)
  - CSS Grid and Flexbox for layouts
  - Purple-violet gradient theme (#667eea to #764ba2)
  - Custom animations and transitions
- **JavaScript ES6+** - Vanilla JS with async/await patterns
- **Chart.js v4.4.0** - Dashboard visualizations
- **Day.js v1.11.10** - Date manipulation (with plugins: isBetween, advancedFormat, weekOfYear)

### Backend
- **Firebase SDK v9.22.0** (Compatibility version)
  - **Firestore** - Cloud NoSQL database for all data
  - **Field Value** - Server timestamps and array operations
  - **No Firebase Auth** - Custom session-based authentication

### Build & Deployment
- **No build process** - Direct HTML/CSS/JS deployment
- **No package.json** - All dependencies loaded via CDN
- **No transpilation** - Modern browser features only

### External Scripts
- Chart.js: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`
- Day.js: `https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js`
- Firebase: `https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js`

---

## Architecture & Structure

### File Structure

```
/home/user/ProjectStatus/
├── index.html                      # Main application (17,749 lines, 836KB)
├── login.html                      # Authentication page
├── ganttchart.html                 # Standalone Gantt chart view
├── gantt-integration.js            # Gantt chart logic (2,200+ lines)
├── update-passwords.html           # Password management utility
├── index copy[2,3].html            # Backup/version files
├── index.html.bak                  # Main file backup
├── .claude/                        # Claude AI configuration
├── .vscode/                        # VS Code settings
├── .git/                           # Git repository
└── [60+ Documentation Files].md   # Feature documentation
```

### Code Organization in index.html

The main file is organized into these sections:

1. **HTML Head** (lines 1-600)
   - Meta tags, title, Firebase SDK
   - Chart.js, Day.js libraries
   - Firebase configuration
   - CSS styles (~2,500 lines)

2. **HTML Body** (lines 600-4,600)
   - Navigation sidebar
   - Page containers (dashboard, projects, tasks, etc.)
   - Modal dialogs (add/edit forms)
   - Footer and utility elements

3. **JavaScript** (lines 4,600-17,749)
   - Firebase initialization
   - Authentication functions
   - Permission system (lines 4,700-5,100)
   - Data loading functions
   - Rendering functions
   - CRUD operations
   - Modal management
   - Event listeners
   - Utility functions

### Firebase Configuration

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA2My_zhJEfE_wfQ9wpu4W7o_cLKOI9PLQ",
  authDomain: "project-status-f7de8.firebaseapp.com",
  projectId: "project-status-f7de8",
  storageBucket: "project-status-f7de8.firebasestorage.app",
  messagingSenderId: "809576699201",
  appId: "1:809576699201:web:554f6cbf54200d08b6fdc0",
  measurementId: "G-61Z0HS88LR"
};
```

**Important:** Do not modify Firebase configuration without explicit permission.

---

## Data Models

All data is stored in Firebase Firestore collections. Below are the primary data models.

### Collection: `team_members`

User accounts and team member information.

```javascript
{
  id: string,                    // Firebase document ID
  name: string,                  // Full name
  email: string,                 // Unique, used for login
  role: string,                  // Role name (e.g., "Project Manager")
  roleId: string,                // Reference to roles collection
  department: string,            // Department name
  avatar: string,                // Initials for avatar
  status: "Active" | "Inactive", // Account status
  active: boolean,               // Is account active?
  skills: string[],              // Array of skills
  password: string,              // Base64 encoded (SECURITY NOTE: Not hashed)
  passwordUpdatedAt: timestamp,  // Last password change
  joinedAt: timestamp,           // Join date
  createdAt: timestamp,          // Creation timestamp
  updatedAt: timestamp           // Last update timestamp
}
```

### Collection: `tasks`

Main tasks in the system.

```javascript
{
  id: string,                    // Firebase document ID
  name: string,                  // Task name
  status: "blank" | "working" | "stuck" | "done",
  priority: "low" | "medium" | "high",
  person: string,                // Legacy: team member name
  personName: string,            // Team member name
  assignedTo: string,            // User ID or email
  assignedToNames: string[],     // Array of assignee names
  project: string,               // Project name
  projectId: string,             // Project document ID
  date: string,                  // Due date (YYYY-MM-DD)
  startDate: string,             // Start date (YYYY-MM-DD)
  timeline: string,              // Duration description
  workspace: string,             // Workspace name
  category: string,              // Task category
  tags: string[],                // Tags array
  createdBy: string,             // Creator email (for ownership)
  createdAt: timestamp,          // Creation timestamp
  updatedAt: timestamp,          // Last update timestamp
  progress: number,              // 0-100 percentage
  description: string            // Task description
}
```

### Collection: `subtasks`

Child tasks under main tasks.

```javascript
{
  id: string,                    // Firebase document ID
  name: string,                  // Subtask name
  status: "blank" | "working" | "stuck" | "done",
  priority: "low" | "medium" | "high",
  personName: string,            // Assignee name
  assignedTo: string,            // User ID or email
  taskName: string,              // Parent task name
  taskId: string,                // Parent task ID
  project: string,               // Project name
  projectId: string,             // Project ID
  date: string,                  // Due date
  startDate: string,             // Start date
  category: string,              // Category
  tags: string[],                // Tags array
  createdBy: string,             // Creator email
  createdAt: timestamp,          // Creation timestamp
  updatedAt: timestamp,          // Last update
  parentTaskIndex: number,       // Display order
  progress: number               // 0-100 percentage
}
```

### Collection: `projects`

Project records with SDLC tracking.

```javascript
{
  id: string,                    // Firebase document ID
  name: string,                  // Project name
  description: string,           // Project description
  status: "completed" | "in-progress" | "on-hold" | "planned",
  sdlc: string,                  // Software Development Lifecycle model
  priority: "high" | "medium" | "low",
  workspace: string,             // Workspace name
  projectCode: string,           // Unique project code
  epics: [{                      // Array of epic objects
    name: string,
    url: string
  }],
  issues: [{                     // Array of issue objects
    title: string,
    status: string,
    priority: string,
    assignee: string
  }],
  startDate: string,             // Start date (YYYY-MM-DD)
  endDate: string,               // End date (YYYY-MM-DD)
  progress: number,              // 0-100 percentage
  budget: number,                // Budget amount
  teamMembers: string[],         // Array of member names
  projectManager: string,        // PM name
  assignedTo: string,            // PM ID or email
  tags: string[],                // Tags array
  health: "healthy" | "at-risk" | "critical",
  createdAt: timestamp,          // Creation timestamp
  updatedAt: timestamp,          // Last update
  visibility: "public" | "private" // Visibility setting
}
```

### Collection: `roles`

Role definitions.

```javascript
{
  id: string,                    // Firebase document ID
  name: string,                  // Role name
  description: string,           // Role description
  active: boolean,               // Is role active? (default: true)
  createdAt: timestamp,          // Creation timestamp
  updatedAt: timestamp           // Last update timestamp
}
```

### Collection: `page_permissions`

Permission configuration (single document with ID "global").

```javascript
{
  id: "global",
  "RoleName": {                  // One object per role
    "dashboard": {
      show: boolean,             // Can view page
      add: boolean,              // Can create items
      edit: boolean,             // Can edit items
      delete: boolean            // Can delete items
    },
    "projectslist": { show, add, edit, delete },
    "tasks": { show, add, edit, delete },
    "team": { show, add, edit, delete },
    "reports": { show, add, edit, delete },
    "admin": {
      admin: boolean             // Admin access
    }
  }
}
```

### Collection: `admin_rules`

System configuration (single document with ID "global").

```javascript
{
  id: "global",
  allowGuest: boolean,           // Allow guest access
  guestModeEnabled: boolean,     // Enable guest mode
  defaultRole: string,           // Default role for new users
  // Other admin settings
}
```

### Collection: `workspaces`

Workspace organization.

```javascript
{
  id: string,                    // Firebase document ID
  name: string,                  // Workspace name
  icon: string,                  // Emoji icon
  color: string,                 // Hex color
  description: string,           // Description
  memberCount: number,           // Number of members
  taskCount: number,             // Number of tasks
  active: boolean,               // Is active
  createdAt: timestamp           // Creation timestamp
}
```

### Collection: `logs`

Activity audit trail.

```javascript
{
  id: string,                    // Firebase document ID
  timestamp: timestamp,          // When action occurred
  itemType: "task" | "subtask" | "project" | "team_member",
  itemId: string,                // ID of modified item
  itemName: string,              // Name of modified item
  action: "created" | "updated" | "deleted",
  changedFields: string[],       // Fields that changed
  changeDetails: object,         // Detailed change info
  user: string,                  // User email
  userName: string               // User name
}
```

---

## Permission System

**CRITICAL:** This application uses a comprehensive role-based access control (RBAC) system. All permissions are stored in Firebase, not hardcoded.

### Permission Hierarchy

```
User Login
  ↓
Load User from sessionStorage
  ↓
Get User Role
  ↓
Load Permissions from Firebase (page_permissions collection)
  ↓
Check [page][operation] permission
  ↓
Apply data filtering (ownership/assignment based)
  ↓
Show/hide UI elements and features
```

### Permission Types

1. **Page-Level Permissions**
   - `show` - User can view the page
   - `add` - User can create new records
   - `edit` - User can modify records
   - `delete` - User can remove records
   - `admin` - Special admin operations

2. **Data-Level Permissions** (Ownership-based)
   - `createdBy` field - User can see/edit data they created
   - `assignedTo` field - User can see/edit data assigned to them
   - `personName` field - Subtasks assigned to user
   - `projectManager` field - Users managing projects

### Core Permission Functions

**ALWAYS use these functions when checking permissions:**

```javascript
// Get current user info
const user = getCurrentUser();              // Returns: { id, email, name, role, ... }
const role = getCurrentUserRole();          // Returns: "Project Manager" | "Admin" | etc.

// Check permissions
await hasPermission(page, operation);       // Generic permission check
await canShow(page);                        // Can view page?
await canAdd(page);                         // Can create?
await canEdit(page);                        // Can modify?
await canDelete(page);                      // Can remove?
await canAdmin(page);                       // Admin access?

// Check specific item permissions
await canEditItem(item, page);              // Can edit this specific item?
await canDeleteItem(item, page);            // Can delete this specific item?
canEditSubtask(subtask, task);              // Can edit subtask?
canDeleteSubtask(subtask, task);            // Can delete subtask?

// Filter data by ownership
await filterDataByOwnership(dataArray, dataType); // Returns only data user can see

// Check ownership
isOwner(item);                              // Does user own this item?
isAdmin();                                  // Is user an admin?
```

### Permission Rules

1. **Admin Users** (`role === "Admin"`)
   - Bypass all permission checks
   - See all data regardless of ownership
   - Access all features and pages

2. **Non-Admin Task Creation**
   - Cannot create main tasks (add=false for tasks page)
   - CAN create subtasks within assigned tasks
   - Can edit/delete own subtasks

3. **Data Visibility Rules**
   - **Tasks:** Show if assigned to user OR created by user
   - **Subtasks:** Show if assigned to user OR created by user
   - **Projects:** Show if user is project manager OR team member
   - **Team members:** Always visible (public data)

4. **Guest Mode** (when enabled in admin_rules)
   - Grant all permissions to dashboard & projectslist
   - Mask project names (anonymous mode)
   - No login required

5. **Admin-Only Pages**
   - Page Permissions (`pagePermissions`)
   - Role Management (`roleManagement`)
   - Admin Rules (`adminRules`)
   - Requires: `permissions['admin']['admin'] === true`

### Enforcement Points

When adding/modifying features, enforce permissions at these points:

1. **Menu Visibility:** `updateMenuVisibility()`
   - Hide navigation tabs user cannot access
   - Called on page load

2. **Page Access:** `switchPage(pageName)`
   - Check permission before switching pages
   - Show alert if denied

3. **Button Visibility:** `updateEditDeleteButtonVisibility(page, items)`
   - Show/hide edit button if `canEditItem(item)`
   - Show/hide delete button if `canDeleteItem(item)`
   - Add button only if `canAdd(page)`

4. **Data Filtering:** `filterDataByOwnership(dataArray, dataType)`
   - Applied to tasks, subtasks, projects before rendering
   - Only shows data user can see

5. **Modal Prevention**
   - Cannot open edit modal if no edit permission
   - Cannot open delete modal if no delete permission
   - Shows alert and returns early

### Permission Storage

**IMPORTANT:** All permissions are stored in Firebase at `page_permissions/global`, NOT hardcoded.

```javascript
// ❌ NEVER DO THIS - Hardcoded permissions
if (user.role === "Developer") {
  // Grant specific permissions
}

// ✅ ALWAYS DO THIS - Check Firebase permissions
const canEdit = await hasPermission('tasks', 'edit');
if (canEdit) {
  // Allow edit
}
```

If a role/permission is not in Firebase, it defaults to `false` (deny access).

### Documentation Reference

See these files for complete permission system documentation:
- `PERMISSION_SYSTEM_IMPLEMENTATION.md` - Complete guide
- `PERMISSION_SYSTEM_QUICK_START.md` - Quick reference
- `COMPLETE_PERMISSION_SPECIFICATION_IMPLEMENTED.md` - Specification

---

## Development Patterns

### Naming Conventions

| Pattern | Examples | Usage |
|---------|----------|-------|
| **camelCase** | `loadTasksFromFirebase()`, `renderProjects()` | All JavaScript functions and variables |
| **snake_case** | `team_members`, `page_permissions`, `admin_rules` | Firebase collection names |
| **camelCase** | `startDate`, `projectId`, `assignedTo` | Document field names |
| **ALL_CAPS** | `GANTT.DAY_CELL_WIDTH`, `GANTT.ROW_HEIGHT` | Global constants |
| **Emoji prefixes** | `✅`, `❌`, `📊`, `🔄`, `🎫` | Console logging |
| **ID suffixes** | `#dashboardPage`, `#roleModal`, `tasksTableBody` | DOM element IDs |

### Function Patterns

#### 1. Async Data Loading Pattern

**ALWAYS use this pattern for Firebase operations:**

```javascript
async function loadTasksFromFirebase() {
  try {
    console.log('📊 Loading tasks from Firebase...');
    const snapshot = await db.collection('tasks').get();
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ Loaded ${tasks.length} tasks`);
    return tasks;
  } catch (error) {
    console.error('❌ Error loading tasks:', error);
    alert('Failed to load tasks. Please try again.');
    return [];
  }
}
```

#### 2. Firebase CRUD Pattern

```javascript
// CREATE
const docRef = await db.collection('tasks').add({
  name: taskName,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  createdBy: getCurrentUser().email
});

// READ
const doc = await db.collection('tasks').doc(taskId).get();
const data = doc.data();

// UPDATE
await db.collection('tasks').doc(taskId).update({
  status: newStatus,
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
});

// DELETE
await db.collection('tasks').doc(taskId).delete();
```

#### 3. Real-time Listener Pattern

```javascript
// Attach listener
const unsubscribe = db.collection('tasks').onSnapshot(snapshot => {
  snapshot.forEach(doc => {
    // Process each document
    console.log(`🔄 Task updated: ${doc.id}`);
  });
});

// IMPORTANT: Always unsubscribe when leaving page
function switchPage(newPage) {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  // Continue with page switch
}
```

#### 4. Permission Check Pattern

**ALWAYS check permissions before operations:**

```javascript
async function openEditTaskModal(taskId) {
  // Get the task
  const task = await getTask(taskId);

  // Check permission
  if (!await canEditItem(task, 'tasks')) {
    alert('❌ You do not have permission to edit this task');
    return;
  }

  // Proceed with edit
  populateEditModal(task);
  showModal('editTaskModal');
}

async function saveTask() {
  // Validate input
  if (!validateTaskInput()) {
    return;
  }

  // Check permission again before save
  if (!await canAdd('tasks')) {
    alert('❌ You do not have permission to add tasks');
    return;
  }

  // Save to Firebase
  await db.collection('tasks').add(taskData);

  // Refresh view
  await loadTasksFromFirebase();
  closeModal('addTaskModal');
}
```

#### 5. Modal Management Pattern

```javascript
async function openAddTaskModal() {
  // Check permission first
  if (!await canAdd('tasks')) {
    alert('❌ You do not have permission to add tasks');
    return;
  }

  // Populate dropdowns with fresh data
  await populateProjectDropdown();
  await populateAssignToDropdown();

  // Reset form
  document.getElementById('taskForm').reset();

  // Show modal
  document.getElementById('addTaskModal').style.display = 'block';
}

async function saveTaskModal() {
  // Validate input
  if (!validateTaskForm()) {
    return;
  }

  // Collect form data
  const taskData = {
    name: document.getElementById('taskName').value,
    status: document.getElementById('taskStatus').value,
    createdBy: getCurrentUser().email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    // Add to Firebase
    await db.collection('tasks').add(taskData);
    console.log('✅ Task added successfully');

    // Close modal
    closeModal('addTaskModal');

    // Refresh view
    await loadTasksFromFirebase();
  } catch (error) {
    console.error('❌ Error adding task:', error);
    alert('Failed to add task');
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}
```

#### 6. Inline Edit Pattern

```javascript
async function startInlineEdit(taskId, field, element) {
  const task = await getTask(taskId);

  // Check permission
  if (!await canEditItem(task, 'tasks')) {
    alert('❌ No permission to edit');
    return;
  }

  // Save original value
  const originalValue = element.textContent;

  // Replace with input
  element.innerHTML = `<input type="text" value="${originalValue}"
    onblur="saveInlineEdit('${taskId}', '${field}', this)"
    onkeypress="if(event.key==='Enter') this.blur()">`;
  element.querySelector('input').focus();
}

async function saveInlineEdit(taskId, field, inputElement) {
  const newValue = inputElement.value;

  try {
    // Update Firebase
    await db.collection('tasks').doc(taskId).update({
      [field]: newValue,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Updated ${field} to ${newValue}`);

    // Refresh display
    await loadTasksFromFirebase();
  } catch (error) {
    console.error('❌ Error updating:', error);
    alert('Failed to save changes');
  }
}
```

### State Management

#### Session Storage (Authentication)

```javascript
// User authentication state
const loggedInUser = sessionStorage.getItem('loggedInUser');
// Contains: { id, email, name, role, loginTime, lastActivity }

// Access via helper functions
const currentUser = getCurrentUser();      // Parsed object
const role = getCurrentUserRole();         // User's role string
```

#### Global Variables (Page State)

```javascript
let currentPage = 'dashboard';             // Current active page
let selectedProject = null;                // Selected project ID
let taskFilters = {                        // Task filtering state
  projects: [],
  status: [],
  priority: [],
  person: [],
  search: ''
};
let projectStatusFilter = [                // Project status filter (excludes completed by default)
  'in-progress', 'planned', 'on-hold'
];
```

#### Permission Cache

```javascript
let userPermissions = null;                // Cached user permissions
let userRoleCache = null;                  // Cached user role

// Clear cache when permissions change
function clearPermissionCache() {
  userPermissions = null;
  userRoleCache = null;
}
```

#### Data Cache

```javascript
// Loaded data stored in memory
let allTasks = [];
let allSubtasks = [];
let allProjects = [];
let allTeamMembers = [];
let allRoles = [];
let allWorkspaces = [];
let activityLogs = [];
```

### Error Handling

#### Try-Catch with User Feedback

```javascript
try {
  await db.collection('tasks').add(taskData);
  console.log('✅ Task added successfully');
  alert('✅ Task added successfully');
} catch (error) {
  console.error('❌ Error adding task:', error);
  alert('❌ Failed to add task. Please try again.');
}
```

#### Rollback on Failure

```javascript
async function toggleRoleActive(roleId, checkbox) {
  const newValue = checkbox.checked;

  try {
    await db.collection('roles').doc(roleId).update({
      active: newValue,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Role active status updated to ${newValue}`);
  } catch (error) {
    // Rollback checkbox on error
    checkbox.checked = !newValue;
    console.error('❌ Error updating role:', error);
    alert('Failed to update role status');
  }
}
```

### Console Logging Standards

**Use emoji prefixes for better log readability:**

```javascript
console.log('✅ Success message');          // Successful operation
console.error('❌ Error message');          // Error occurred
console.log('📊 Loading data...');          // Data operation
console.log('🔄 Updating...');              // Update operation
console.log('🎫 Task created');             // Task operation
console.log('⚠️ Warning message');          // Warning
console.log('🔍 Searching...');             // Search operation
```

---

## Key Features

### 1. Project Management

**Files:** `index.html` (Projects page section)

**Features:**
- Grid and table views
- Project codes and SDLC tracking
- Multiple epics per project
- Issue tracking within projects
- Progress tracking (0-100%)
- Team member assignment
- Status filtering (completed excluded by default)
- Health indicators (healthy/at-risk/critical)
- Export to Excel/CSV with filters

**Key Functions:**
- `loadProjectsFromFirebase()` - Load all projects
- `renderProjectsGrid()` - Display grid view
- `renderProjectsTable()` - Display table view
- `openAddProjectModal()` - Show add project form
- `saveProject()` - Save project to Firebase
- `deleteProject(projectId)` - Delete project
- `exportProjectsToCSV()` - Export filtered projects

### 2. Task Management

**Files:** `index.html` (Tasks page section)

**Features:**
- Main tasks and subtasks (hierarchical)
- Status: blank, working, stuck, done
- Priority levels: low, medium, high
- Inline editing for fields
- Task cloning with auto-assignment change
- Subtask modal management
- Tag-based organization
- Kanban board view
- Multiple task filtering (project, status, priority, person)
- Export capabilities

**Key Functions:**
- `loadTasksFromFirebase()` - Load all tasks
- `renderTasksTable()` - Display task list
- `renderKanbanBoard()` - Display kanban view
- `openAddTaskModal()` - Show add task form
- `saveTask()` - Save task to Firebase
- `cloneTask(taskId)` - Clone existing task
- `openSubtaskModal(taskId)` - Show subtask management
- `addSubtask()` - Create new subtask
- `startInlineEdit()` - Enable inline editing
- `saveInlineEdit()` - Save inline changes

**IMPORTANT:** Non-admin users can only create subtasks, not main tasks (enforced by permission system).

### 3. Team Management

**Files:** `index.html` (Team page section)

**Features:**
- Add/edit/delete team members
- Role assignment (active roles only shown)
- Department tracking
- Skills management
- Active/inactive status
- Password management (base64 encoded)
- Automatic default password ("1111") assignment

**Key Functions:**
- `loadTeamMembersFromFirebase()` - Load all members
- `renderTeamTable()` - Display team list
- `openAddMemberModal()` - Show add member form
- `saveMember()` - Save member to Firebase
- `openEditMemberModal(memberId)` - Edit member
- `deleteMember(memberId)` - Delete member
- `populateMemberRoleDropdown()` - Populate role dropdown with active roles only

### 4. Role Management

**Files:** `index.html` (Role Management section)

**Features:**
- Create/edit/delete roles
- Activation status (active/inactive)
- Only active roles appear in team member dropdown
- Inline toggle for activation
- Automatic sync with Page Permissions

**Key Functions:**
- `loadRolesFromFirebase()` - Load all roles
- `renderRolesTable()` - Display roles
- `openAddRoleModal()` - Show add role form
- `saveRole()` - Save role to Firebase
- `toggleRoleActive(roleId, checkbox)` - Toggle role activation
- `deleteRole(roleId)` - Delete role

### 5. Permission System

**Files:** `index.html` (Page Permissions section)

**Features:**
- Configure permissions per role per page
- Operations: show, add, edit, delete, admin
- Automatically syncs with roles collection
- Reset to defaults option
- Custom roles default to all permissions denied (secure)

**Key Functions:**
- `renderPagePermissionsTable()` - Display permission matrix
- `savePagePermissions()` - Save all permissions to Firebase
- `resetPagePermissionsToDefault()` - Reset to default permissions
- `hasPermission(page, operation)` - Check if user has permission
- `loadUserPermissions()` - Load and cache user permissions

### 6. Activity Logging

**Files:** `index.html` (Activity Logs section)

**Features:**
- Complete audit trail for all changes
- Tracks: tasks, subtasks, projects, team members
- Records: what changed, who changed it, when
- Detailed change history
- Searchable and filterable logs

**Key Functions:**
- `logActivity(itemType, itemId, itemName, action, changedFields, changeDetails)` - Log an activity
- `loadActivityLogs()` - Load all logs
- `renderActivityLogs()` - Display logs

**Usage:**
```javascript
// Log when creating a task
await logActivity(
  'task',
  taskId,
  taskName,
  'created',
  ['all'],
  { taskData }
);

// Log when updating a task
await logActivity(
  'task',
  taskId,
  taskName,
  'updated',
  ['status', 'priority'],
  { oldStatus: 'working', newStatus: 'done', oldPriority: 'low', newPriority: 'high' }
);
```

### 7. Gantt Chart

**Files:** `gantt-integration.js`, `ganttchart.html`

**Features:**
- Timeline visualization with drag-and-drop
- Multiple scales: Day, Week, Month
- Bar resizing for duration adjustment
- Today indicator line
- Real-time Firebase sync
- Full-screen timeline view

**Key Functions:**
- `GANTT.init()` - Initialize Gantt chart
- `GANTT.renderTimeline()` - Render timeline
- `GANTT.handleBarDrag()` - Handle drag operations
- `GANTT.updateTaskDates()` - Update dates in Firebase

### 8. Dashboard Analytics

**Files:** `index.html` (Dashboard section)

**Features:**
- Stat cards (active projects, tasks, team)
- Progress charts (Chart.js)
- Activity timeline
- At-risk project detection
- Status distribution
- Workload distribution across team
- User access filtering (shows only accessible data)

**Key Functions:**
- `renderDashboard()` - Render entire dashboard
- `updateDashboardStats()` - Update stat cards
- `renderCharts()` - Render Chart.js visualizations
- `updateActivityTimeline()` - Update activity feed

---

## Git Workflow

### Branch Strategy

**Current Branch:** `claude/claude-md-mie8fel72wnvezg2-01XDoqre6NcARz8G51bSajdV`

**IMPORTANT:**
- All development must be done on branches starting with `claude/`
- Branch names must end with matching session ID
- Push failures (403) indicate incorrect branch naming

### Git Commands

**Pushing Changes:**
```bash
# Always use -u flag with origin
git push -u origin claude/claude-md-mie8fel72wnvezg2-01XDoqre6NcARz8G51bSajdV

# Retry on network errors with exponential backoff
# Retry sequence: 2s, 4s, 8s, 16s (up to 4 retries)
```

**Fetching/Pulling:**
```bash
# Prefer specific branch fetch
git fetch origin claude/claude-md-mie8fel72wnvezg2-01XDoqre6NcARz8G51bSajdV

# Pull specific branch
git pull origin claude/claude-md-mie8fel72wnvezg2-01XDoqre6NcARz8G51bSajdV
```

### Commit Message Conventions

**Format:**
```
<type>: <short description>

<optional longer description>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `test` - Test additions or changes
- `chore` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat: Add role activation toggle feature"
git commit -m "fix: Correct permission check for task deletion"
git commit -m "refactor: Simplify permission caching logic"
git commit -m "docs: Update PERMISSION_SYSTEM_IMPLEMENTATION.md"
```

### Recent Commits (Reference)

```
3e4b77e - fix project see
b9e38f3 - add log project task subtask and team member and show only active project filter
85faf26 - Apply default status filter when navigating to project page
fd77b3e - Add multiple checkbox filter for project status with Completed excluded by default
db29426 - Add activity logging for project issues and epics changes
```

---

## Best Practices

### 1. Always Check Permissions

**Before ANY operation (read, create, update, delete):**

```javascript
// ❌ BAD: No permission check
async function deleteTask(taskId) {
  await db.collection('tasks').doc(taskId).delete();
}

// ✅ GOOD: Permission check first
async function deleteTask(taskId) {
  const task = await getTask(taskId);
  if (!await canDeleteItem(task, 'tasks')) {
    alert('❌ You do not have permission to delete this task');
    return;
  }
  await db.collection('tasks').doc(taskId).delete();
}
```

### 2. Always Use Try-Catch for Firebase Operations

```javascript
// ❌ BAD: No error handling
async function saveTask(taskData) {
  await db.collection('tasks').add(taskData);
}

// ✅ GOOD: Proper error handling
async function saveTask(taskData) {
  try {
    await db.collection('tasks').add(taskData);
    console.log('✅ Task saved successfully');
  } catch (error) {
    console.error('❌ Error saving task:', error);
    alert('Failed to save task. Please try again.');
  }
}
```

### 3. Always Add Timestamps

**All documents should have creation and update timestamps:**

```javascript
// ❌ BAD: No timestamps
const taskData = {
  name: 'New Task',
  status: 'working'
};

// ✅ GOOD: Include timestamps and creator
const taskData = {
  name: 'New Task',
  status: 'working',
  createdBy: getCurrentUser().email,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
};

// On update
await db.collection('tasks').doc(taskId).update({
  status: 'done',
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

### 4. Filter Data by Ownership

**Always filter data before displaying to non-admin users:**

```javascript
// ❌ BAD: Show all data
async function loadTasksFromFirebase() {
  const snapshot = await db.collection('tasks').get();
  const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderTasks(tasks);
}

// ✅ GOOD: Filter by ownership
async function loadTasksFromFirebase() {
  const snapshot = await db.collection('tasks').get();
  const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Filter based on user permissions
  const visibleTasks = await filterDataByOwnership(allTasks, 'tasks');
  renderTasks(visibleTasks);
}
```

### 5. Log Activities for Audit Trail

**Log all important changes:**

```javascript
async function updateTaskStatus(taskId, oldStatus, newStatus) {
  try {
    // Update task
    await db.collection('tasks').doc(taskId).update({
      status: newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Log activity
    await logActivity(
      'task',
      taskId,
      taskName,
      'updated',
      ['status'],
      { oldStatus, newStatus }
    );

    console.log('✅ Task status updated');
  } catch (error) {
    console.error('❌ Error updating task:', error);
  }
}
```

### 6. Unsubscribe from Listeners

**Always unsubscribe from real-time listeners when leaving a page:**

```javascript
let taskListener = null;

function attachTaskListener() {
  taskListener = db.collection('tasks').onSnapshot(snapshot => {
    // Handle updates
  });
}

function switchPage(newPage) {
  // Unsubscribe before leaving
  if (taskListener) {
    taskListener();
    taskListener = null;
  }
  // Continue with page switch
}
```

### 7. Validate User Input

**Always validate before saving to Firebase:**

```javascript
function validateTaskForm() {
  const taskName = document.getElementById('taskName').value.trim();

  if (!taskName) {
    alert('❌ Task name is required');
    return false;
  }

  if (taskName.length < 3) {
    alert('❌ Task name must be at least 3 characters');
    return false;
  }

  if (taskName.length > 200) {
    alert('❌ Task name must be less than 200 characters');
    return false;
  }

  return true;
}
```

### 8. Use Server Timestamps

**Always use server timestamps, never client timestamps:**

```javascript
// ❌ BAD: Client timestamp
createdAt: new Date().toISOString()

// ✅ GOOD: Server timestamp
createdAt: firebase.firestore.FieldValue.serverTimestamp()
```

### 9. Clear Permission Cache on Changes

**Clear cache when permissions or roles change:**

```javascript
async function savePagePermissions() {
  try {
    // Save permissions
    await db.collection('page_permissions').doc('global').set(permissionsData);

    // Clear cache so users get fresh permissions
    clearPermissionCache();

    console.log('✅ Permissions saved');
  } catch (error) {
    console.error('❌ Error saving permissions:', error);
  }
}
```

### 10. Consistent Emoji Logging

**Use consistent emoji prefixes for better log scanning:**

```javascript
console.log('✅ Success');                  // Successful operations
console.error('❌ Error');                  // Errors
console.log('📊 Loading');                  // Data operations
console.log('🔄 Updating');                 // Update operations
console.log('⚠️ Warning');                  // Warnings
console.log('🔍 Searching');                // Search operations
console.log('🎫 Task operation');           // Task-specific
console.log('👥 Team operation');           // Team-specific
console.log('📂 Project operation');        // Project-specific
```

---

## Common Tasks

### Task 1: Add a New Field to Tasks

**Steps:**

1. **Update the data model** (this documentation)
2. **Update Firebase collection** (add field to existing documents if needed)
3. **Update the add/edit modal** (add input field)
4. **Update save function** (include new field in save)
5. **Update render function** (display new field)
6. **Test permissions** (ensure field respects permissions)

**Example: Adding "estimatedHours" field**

```javascript
// 1. Update modal HTML (in index.html body section)
<div class="form-group">
  <label>Estimated Hours:</label>
  <input type="number" id="taskEstimatedHours" min="0" step="0.5">
</div>

// 2. Update saveTask() function
async function saveTask() {
  const taskData = {
    name: document.getElementById('taskName').value,
    status: document.getElementById('taskStatus').value,
    // ... other fields ...
    estimatedHours: parseFloat(document.getElementById('taskEstimatedHours').value) || 0,
    createdBy: getCurrentUser().email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('tasks').add(taskData);
}

// 3. Update renderTasksTable() to display new field
function renderTaskRow(task) {
  return `
    <tr>
      <td>${task.name}</td>
      <td>${task.status}</td>
      <td>${task.estimatedHours || 'N/A'} hours</td>
      <!-- other columns -->
    </tr>
  `;
}
```

### Task 2: Create a New Page

**Steps:**

1. **Add page container to HTML**
2. **Add navigation button**
3. **Add page to switchPage() function**
4. **Create load function**
5. **Create render function**
6. **Add to permission system**
7. **Update updateMenuVisibility()**

**Example: Adding "Calendar" page**

```javascript
// 1. Add to HTML body (around line 1500)
<div id="calendarPage" class="page-content" style="display: none;">
  <h2>Calendar</h2>
  <div id="calendarContainer"></div>
</div>

// 2. Add navigation button (around line 300)
<button id="calendarNavBtn" onclick="switchPage('calendar')">
  📅 Calendar
</button>

// 3. Add to switchPage() function
async function switchPage(pageName) {
  // Permission check
  if (pageName === 'calendar') {
    const canAccess = await hasPermission('calendar', 'show');
    if (!canAccess) {
      alert('❌ You do not have permission to access the Calendar page');
      return;
    }
  }

  // Hide all pages
  document.querySelectorAll('.page-content').forEach(page => {
    page.style.display = 'none';
  });

  // Show calendar page
  if (pageName === 'calendar') {
    document.getElementById('calendarPage').style.display = 'block';
    await renderCalendar();
  }

  currentPage = pageName;
}

// 4. Create load and render functions
async function renderCalendar() {
  console.log('📅 Rendering calendar...');

  // Check permission
  if (!await canShow('calendar')) {
    return;
  }

  // Load tasks
  const tasks = await loadTasksFromFirebase();

  // Render calendar with tasks
  // ... calendar rendering logic ...
}

// 5. Add to permission system (page_permissions in Firebase)
{
  "Project Manager": {
    "calendar": { show: true, add: true, edit: true, delete: true }
  }
}

// 6. Update updateMenuVisibility()
async function updateMenuVisibility() {
  // ... existing code ...

  const calendarBtn = document.getElementById('calendarNavBtn');
  if (await canShow('calendar')) {
    calendarBtn.style.display = 'inline-block';
  } else {
    calendarBtn.style.display = 'none';
  }
}
```

### Task 3: Add a New Role

**Steps:**

1. Go to Settings → Role Management
2. Click "New Role"
3. Enter role name and description
4. Click Save
5. Go to Settings → Page Permissions
6. Configure permissions for new role
7. Click Save

**Programmatically:**

```javascript
async function createNewRole(name, description) {
  try {
    // Create role
    const roleData = {
      name: name,
      description: description,
      active: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const roleRef = await db.collection('roles').add(roleData);
    console.log(`✅ Role created: ${name}`);

    // Add default permissions (all false for security)
    const permissions = {
      dashboard: { show: false, add: false, edit: false, delete: false },
      projectslist: { show: false, add: false, edit: false, delete: false },
      tasks: { show: false, add: false, edit: false, delete: false },
      team: { show: false, add: false, edit: false, delete: false },
      reports: { show: false, add: false, edit: false, delete: false },
      admin: { admin: false }
    };

    await db.collection('page_permissions').doc('global').update({
      [name]: permissions
    });

    console.log(`✅ Permissions initialized for ${name}`);

    return roleRef.id;
  } catch (error) {
    console.error('❌ Error creating role:', error);
  }
}
```

### Task 4: Debug Permission Issues

**Steps:**

1. **Check user's role:**
```javascript
const user = getCurrentUser();
const role = getCurrentUserRole();
console.log(`Current user: ${user.email}, Role: ${role}`);
```

2. **Check permissions for specific page:**
```javascript
const perms = await loadUserPermissions();
console.log('All permissions:', perms);

const canView = await hasPermission('tasks', 'show');
const canAdd = await hasPermission('tasks', 'add');
const canEdit = await hasPermission('tasks', 'edit');
const canDelete = await hasPermission('tasks', 'delete');

console.log(`Tasks permissions - Show: ${canView}, Add: ${canAdd}, Edit: ${canEdit}, Delete: ${canDelete}`);
```

3. **Check data ownership:**
```javascript
const task = await getTask(taskId);
const owns = isOwner(task);
console.log(`Task created by: ${task.createdBy}, Current user: ${getCurrentUser().email}, Owns: ${owns}`);
```

4. **Check permission cache:**
```javascript
console.log('Permission cache:', userPermissions);
console.log('Role cache:', userRoleCache);

// Clear and reload
clearPermissionCache();
const freshPerms = await loadUserPermissions();
console.log('Fresh permissions:', freshPerms);
```

5. **Check Firebase data:**
```javascript
// Check page_permissions collection
const permDoc = await db.collection('page_permissions').doc('global').get();
console.log('Firebase permissions:', permDoc.data());

// Check user's role document
const userDoc = await db.collection('team_members').doc(user.id).get();
console.log('User document:', userDoc.data());
```

### Task 5: Export Data with Filters

**Steps:**

1. **Get filtered data**
2. **Convert to CSV format**
3. **Trigger download**

**Example: Export filtered tasks**

```javascript
async function exportFilteredTasksToCSV() {
  try {
    console.log('📊 Exporting tasks to CSV...');

    // Get filtered tasks
    const allTasks = await loadTasksFromFirebase();
    const filteredTasks = applyTaskFilters(allTasks);

    // Check permission
    if (!await canShow('tasks')) {
      alert('❌ No permission to export tasks');
      return;
    }

    // Convert to CSV
    let csv = 'Name,Status,Priority,Assigned To,Project,Due Date,Progress\n';

    filteredTasks.forEach(task => {
      csv += `"${task.name}","${task.status}","${task.priority}","${task.personName}","${task.project}","${task.date}","${task.progress}%"\n`;
    });

    // Create blob and trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    console.log(`✅ Exported ${filteredTasks.length} tasks`);
  } catch (error) {
    console.error('❌ Error exporting tasks:', error);
  }
}
```

---

## Security Considerations

### Current Security Issues

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Password Storage:** Passwords are base64 encoded, NOT hashed
   - **Issue:** Base64 is encoding, not encryption - passwords can be easily decoded
   - **Recommendation:** Use bcrypt, Argon2, or PBKDF2 for password hashing
   - **Current Implementation:**
   ```javascript
   password: btoa(plainPassword)  // Base64 encoding (INSECURE)
   ```
   - **Recommended:**
   ```javascript
   // Use a library like bcrypt.js
   password: await bcrypt.hash(plainPassword, 10)
   ```

2. **Custom Authentication:** Using custom auth instead of Firebase Authentication
   - **Issue:** No built-in security features (rate limiting, brute force protection)
   - **Recommendation:** Migrate to Firebase Authentication
   - **Current:** Session-based with email/password query
   - **Recommended:** Use Firebase Auth SDK

3. **Client-Side Permission Checks:** All permission checks are client-side only
   - **Issue:** Can be bypassed by modifying client code
   - **Recommendation:** Implement Firebase Security Rules for server-side enforcement
   - **Example Security Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Tasks - users can only read/write their own or assigned tasks
       match /tasks/{taskId} {
         allow read: if request.auth != null &&
           (resource.data.createdBy == request.auth.token.email ||
            resource.data.assignedTo == request.auth.token.email);
         allow write: if request.auth != null;
       }
     }
   }
   ```

4. **Firebase Config Exposed:** Firebase configuration is hardcoded in HTML
   - **Issue:** API keys visible in source code
   - **Note:** Firebase API keys are meant to be public, but should be restricted
   - **Recommendation:** Configure Firebase API key restrictions in Firebase Console

5. **No Input Sanitization:** User input not sanitized before display
   - **Issue:** Potential XSS vulnerabilities
   - **Recommendation:** Sanitize user input and use textContent instead of innerHTML where possible

6. **No Rate Limiting:** No limits on login attempts or API calls
   - **Issue:** Vulnerable to brute force attacks
   - **Recommendation:** Implement rate limiting on sensitive operations

### Security Best Practices When Contributing

1. **Never log passwords or sensitive data:**
```javascript
// ❌ BAD
console.log('User data:', { email, password });

// ✅ GOOD
console.log('User data:', { email });
```

2. **Always validate and sanitize input:**
```javascript
function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}

const taskName = sanitizeInput(document.getElementById('taskName').value);
```

3. **Use textContent instead of innerHTML when possible:**
```javascript
// ❌ BAD - Vulnerable to XSS
element.innerHTML = userInput;

// ✅ GOOD - Safe from XSS
element.textContent = userInput;
```

4. **Don't expose sensitive information in error messages:**
```javascript
// ❌ BAD
catch (error) {
  alert(`Database error: ${error.message}`);
}

// ✅ GOOD
catch (error) {
  console.error('Error:', error);
  alert('An error occurred. Please try again.');
}
```

5. **Always check permissions before operations:**
```javascript
// Permissions must be checked for every sensitive operation
if (!await canDeleteItem(item, 'tasks')) {
  return;
}
```

### Recommended Security Improvements

**Priority 1 (Critical):**
1. Implement proper password hashing (bcrypt/Argon2)
2. Add Firebase Security Rules for server-side permission enforcement
3. Migrate to Firebase Authentication

**Priority 2 (High):**
1. Add input sanitization throughout the application
2. Implement rate limiting on login attempts
3. Add session timeout mechanism

**Priority 3 (Medium):**
1. Configure Firebase API key restrictions
2. Add HTTPS enforcement
3. Implement CORS headers
4. Add Content Security Policy headers

---

## Testing Guidelines

### Manual Testing Checklist

#### Permission Testing

- [ ] Login as each role and verify correct menu visibility
- [ ] Try accessing unauthorized pages manually
- [ ] Verify data filtering (users only see their own/assigned data)
- [ ] Test add/edit/delete buttons visibility per role
- [ ] Verify admin can see all data
- [ ] Test guest mode (if enabled)

#### CRUD Operations

- [ ] Create new task/project/team member
- [ ] Edit existing records
- [ ] Delete records (with permission)
- [ ] Verify timestamps are set correctly
- [ ] Check activity logging for all operations

#### Data Validation

- [ ] Try submitting empty forms
- [ ] Try submitting invalid data (negative numbers, etc.)
- [ ] Test maximum length limits
- [ ] Verify required fields are enforced

#### UI/UX Testing

- [ ] Test on different screen sizes (responsive design)
- [ ] Test all modals (open/close)
- [ ] Test inline editing
- [ ] Test filters and search
- [ ] Test data export

### Testing Workflow

1. **Test as Admin:**
   - Login as admin user
   - Verify all pages accessible
   - Verify all data visible
   - Test all CRUD operations

2. **Test as Non-Admin:**
   - Login as regular user (e.g., Developer)
   - Verify restricted menu
   - Verify filtered data (only owned/assigned)
   - Test permission denials

3. **Test Permission Changes:**
   - Change role permissions in Page Permissions
   - Logout and login again
   - Verify new permissions take effect

4. **Test Role Management:**
   - Create new role
   - Assign to team member
   - Configure permissions
   - Test with that user

### Console Testing Commands

**Test current user:**
```javascript
console.log('Current user:', getCurrentUser());
console.log('Current role:', getCurrentUserRole());
```

**Test permissions:**
```javascript
(async () => {
  console.log('Dashboard show:', await hasPermission('dashboard', 'show'));
  console.log('Tasks add:', await hasPermission('tasks', 'add'));
  console.log('Projects edit:', await hasPermission('projectslist', 'edit'));
  console.log('Admin access:', await hasPermission('admin', 'admin'));
})();
```

**Test data filtering:**
```javascript
(async () => {
  const allTasks = await loadTasksFromFirebase();
  const filtered = await filterDataByOwnership(allTasks, 'tasks');
  console.log(`Total tasks: ${allTasks.length}, Visible: ${filtered.length}`);
})();
```

**Clear caches:**
```javascript
clearPermissionCache();
sessionStorage.clear();
location.reload();
```

---

## Troubleshooting Common Issues

### Issue 1: "Permission denied" errors

**Symptoms:** User gets "You do not have permission" alerts

**Diagnosis:**
1. Check user's role: `console.log(getCurrentUserRole())`
2. Check permissions: `console.log(await loadUserPermissions())`
3. Verify role exists in page_permissions collection

**Solution:**
- Verify role permissions in Settings → Page Permissions
- Ensure role is active in Settings → Role Management
- Clear permission cache: `clearPermissionCache()`

### Issue 2: Data not showing up

**Symptoms:** Page loads but no data displayed

**Diagnosis:**
1. Check console for errors
2. Check if data exists in Firebase Console
3. Check data filtering:
```javascript
const allData = await db.collection('tasks').get();
console.log('Total documents:', allData.size);
```

**Solution:**
- Verify Firebase connection
- Check if user has `show` permission for that page
- Verify data ownership/assignment fields

### Issue 3: Changes not saving

**Symptoms:** Changes appear to save but don't persist

**Diagnosis:**
1. Check console for errors
2. Check network tab for failed requests
3. Verify Firebase permissions

**Solution:**
- Check for JavaScript errors in console
- Verify internet connection
- Check Firebase quotas (free tier limits)
- Verify correct collection/document ID

### Issue 4: Real-time updates not working

**Symptoms:** Data doesn't update automatically

**Diagnosis:**
1. Check if listener is attached
2. Check for console errors
3. Verify Firebase connection

**Solution:**
- Ensure `onSnapshot()` listener is properly attached
- Check that listener wasn't unsubscribed prematurely
- Refresh page to re-establish connection

### Issue 5: Modal not opening

**Symptoms:** Clicking button doesn't open modal

**Diagnosis:**
1. Check console for permission errors
2. Verify modal HTML exists
3. Check CSS display property

**Solution:**
- Verify user has permission for that operation
- Check modal ID matches JavaScript code
- Verify modal display style is being set to 'block'

---

## Additional Resources

### Documentation Files

This repository contains 60+ markdown documentation files. Key files include:

- `PERMISSION_SYSTEM_IMPLEMENTATION.md` - Complete permission system guide
- `IMPLEMENTATION_SUMMARY.md` - Role and permission integration
- `ROLE_ACTIVATION_FEATURE.md` - Role activation documentation
- `TASK_DELETE_PERMISSIONS.md` - Task deletion permission rules
- `CLONE_TASK_QUICK_REFERENCE.md` - Task cloning guide
- `ACTIVITY_LOGGING_*.md` - Activity logging documentation

### External References

- **Firebase Documentation:** https://firebase.google.com/docs/firestore
- **Chart.js Documentation:** https://www.chartjs.org/docs/latest/
- **Day.js Documentation:** https://day.js.org/docs/en/installation/installation

### Getting Help

If you need help or clarification:
1. Check this CLAUDE.md file first
2. Check the relevant markdown documentation files
3. Search the codebase for similar patterns
4. Check console logs for errors
5. Verify Firebase data in Firebase Console

---

## Quick Reference

### Essential Functions

```javascript
// User & Auth
getCurrentUser()                          // Get current user object
getCurrentUserRole()                      // Get current user's role
sessionStorage.getItem('loggedInUser')    // Get session data

// Permissions
await hasPermission(page, operation)      // Check permission
await canShow(page)                       // Can view page
await canAdd(page)                        // Can create
await canEdit(page)                       // Can modify
await canDelete(page)                     // Can remove
await canEditItem(item, page)             // Can edit specific item
await canDeleteItem(item, page)           // Can delete specific item
isOwner(item)                            // Does user own item
isAdmin()                                // Is user admin

// Data Operations
await loadTasksFromFirebase()            // Load tasks
await loadProjectsFromFirebase()         // Load projects
await loadTeamMembersFromFirebase()      // Load team members
await filterDataByOwnership(data, type)  // Filter by ownership

// UI Updates
switchPage(pageName)                     // Navigate to page
updateMenuVisibility()                   // Update menu based on permissions
```

### Essential Patterns

```javascript
// Standard CRUD pattern
async function createItem() {
  // 1. Check permission
  if (!await canAdd('collection')) return;

  // 2. Validate input
  if (!validate()) return;

  // 3. Save to Firebase
  await db.collection('collection').add({
    ...data,
    createdBy: getCurrentUser().email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  // 4. Log activity
  await logActivity('collection', id, name, 'created', ['all'], data);

  // 5. Refresh view
  await loadDataFromFirebase();
}
```

---

## Version History

**Version 1.0** (2025-11-25)
- Initial comprehensive documentation
- Complete codebase analysis
- Permission system documentation
- Development patterns and best practices
- Security considerations
- Testing guidelines

---

## Conclusion

This CLAUDE.md file provides comprehensive guidance for AI assistants working with the ProjectFlow codebase. Key takeaways:

1. **Permission-First Approach:** Always check permissions before operations
2. **Firebase-Centric:** All data in Firebase, use proper async patterns
3. **Consistency:** Follow established naming and code patterns
4. **Security:** Be aware of security limitations and best practices
5. **Documentation:** Extensive documentation available in 60+ markdown files

When in doubt, follow existing patterns in the codebase and refer to the permission system documentation. The codebase is well-organized and consistent, making it straightforward to extend and modify.

**Remember:** This is a vanilla JavaScript application with no build process. Changes to `index.html` are immediately reflected when the page is refreshed.
