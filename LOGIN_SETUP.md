# Login System Setup Guide

## Overview
A secure login system has been added to your Project Status Dashboard. Team members must now authenticate with their email and password before accessing any pages.

## Features
- **Email & Password Authentication** - Team members login using their registered email
- **Session Management** - Login state is maintained across page navigation
- **1-Hour Auto Logout** - Automatic logout after 1 hour of inactivity
- **Activity Tracking** - Session extends automatically with user interactions
- **Protected Pages** - All dashboard pages require authentication
- **Default Password** - All users start with password "1111"
- **Password Change** - Users can change their own passwords from team member cards
- **Base64 Encryption** - Passwords are encrypted with base64 encoding
- **Logout Functionality** - Users can logout from the header

## Files Added

### 1. `login.html`
The main login page with:
- Email and password input fields
- Form validation
- Error and success messages
- Automatic redirect after successful login
- Modern, responsive design

### 2. `update-passwords.html`
A utility page to add the password field to existing team members:
- **IMPORTANT**: Run this ONCE before first use
- Sets default password "1111" for all team members
- Provides detailed logging of the update process
- Skips members who already have passwords

## Setup Instructions

### Step 1: Add Passwords to Existing Team Members
1. Open `update-passwords.html` in your browser
2. Click the "Update All Passwords" button
3. Wait for the process to complete
4. Verify that all team members were updated successfully

### Step 2: Test the Login
1. Navigate to `index.html` in your browser
2. You will be automatically redirected to `login.html`
3. Login using any team member's email and password "1111"
4. You should be redirected to the dashboard

### Step 3: Normal Usage
- All users must login before accessing the dashboard
- The login session persists until logout, browser close, or 1 hour of inactivity
- Session automatically extends with any user activity (clicks, typing, scrolling)
- Users can logout using the "Logout" button in the header
- After 1 hour of inactivity, users will be automatically logged out

### Step 4: Change Password
1. Navigate to the **Team** page in the dashboard
2. Find your team member card
3. Click the "🔐 Change Password" button
4. Enter your current password (default: "1111")
5. Enter your new password (minimum 4 characters)
6. Re-enter the new password to confirm
7. Click "Change Password"
8. Your password will be updated and encrypted with base64

## How It Works

### Authentication Flow
```
User visits index.html
    ↓
Check if logged in?
    ↓ NO
Redirect to login.html
    ↓
User enters email & password
    ↓
Validate against Firestore
    ↓ SUCCESS
Store session in sessionStorage
    ↓
Redirect to index.html
    ↓
User can access dashboard
```

### Session Storage & Timeout
- User session is stored in `sessionStorage`
- Contains: user ID, email, name, role, login time, and last activity timestamp
- Automatically cleared on logout or browser close
- **Inactivity Timeout**: 1 hour (60 minutes)
- Activity tracking monitors: clicks, typing, scrolling, mouse movements, and touch events
- Session check runs every 60 seconds to verify activity
- If inactive for 1 hour, user is logged out with an alert message

### Protected Pages
The following pages are protected:
- `index.html` (main dashboard)
- `index copy.html`
- `index3.html`

## Team Member Collection Structure

Each team member document should have:
```javascript
{
  name: "John Doe",
  email: "john.doe@example.com",
  role: "Developer",
  password: "MTExMQ==",  // NEW FIELD - base64 encoded "1111"
  passwordUpdatedAt: "2025-01-15T10:30:00.000Z",  // OPTIONAL - timestamp of last password change
  active: true,
  status: "active",
  // ... other fields
}
```

## Default Credentials

All team members start with:
- **Username**: Their registered email address
- **Password**: `1111` (stored as `MTExMQ==` in base64)

**IMPORTANT**: Users should change their password after first login using the "Change Password" button on their team card.

## Security Notes

### Current Implementation
- Passwords are encrypted with base64 encoding in Firestore
- Authentication is done client-side
- Password change requires current password verification
- Sessions use sessionStorage (cleared on browser close)
- Minimum password length: 4 characters

### Recommendations for Production
If deploying to production, consider:
1. Use Firebase Authentication instead of custom auth
2. Hash passwords before storing
3. Implement password reset functionality
4. Add "Remember Me" option
5. Add password strength requirements
6. Implement rate limiting on login attempts
7. Add 2-factor authentication

## Troubleshooting

### Can't Login
- Verify the email address is correct (case-insensitive)
- Ensure password is exactly "1111"
- Check browser console for errors
- Verify Firebase connection is working

### Stuck on Login Page
- Clear browser cache and sessionStorage
- Check if `update-passwords.html` was run successfully
- Verify team member exists in Firestore with email field

### Automatically Logged Out
- Sessions are stored in sessionStorage (not localStorage)
- Closing the browser tab/window clears the session
- **Inactivity timeout**: You'll be logged out after 1 hour without activity
- Any interaction (clicking, typing, scrolling) resets the inactivity timer
- This is normal behavior for security

### How to Change Session Timeout
To modify the inactivity timeout period, find this line in each HTML file:
```javascript
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
```
Change the value:
- 30 minutes: `30 * 60 * 1000`
- 2 hours: `2 * 60 * 60 * 1000`
- 15 minutes: `15 * 60 * 1000`

## Password Change Feature

### How to Change Your Password
1. Login to the dashboard
2. Navigate to the **Team** tab
3. Find your team member card
4. Click the **"🔐 Change Password"** button
5. Fill in the form:
   - **Current Password**: Your existing password
   - **New Password**: Your desired new password (min 4 chars)
   - **Re-confirm New Password**: Same as new password
6. Click **"Change Password"**
7. Password will be updated and base64 encoded automatically

### Password Requirements
- Minimum 4 characters
- New password must match confirmation
- Must know current password to change

### Password Encryption
- All passwords are encoded with base64 before storage
- Decoding happens automatically during login
- The system handles both plain text (legacy) and base64 passwords

## Future Enhancements

Possible improvements:
- [ ] Password reset via email
- [ ] Remember me option (localStorage)
- [ ] User profile page
- [ ] Admin panel for user management
- [ ] Role-based access control
- [ ] Login activity logging
- [ ] Stronger password requirements (uppercase, numbers, symbols)
- [ ] 2-factor authentication
- [ ] Password expiry and rotation policy

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify Firebase configuration is correct
3. Ensure all team members have email addresses in Firestore
4. Run `update-passwords.html` if passwords are missing
