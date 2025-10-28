# Admin Impersonation (Mimic Mode)

## Overview

Admin Impersonation allows authorized administrators to temporarily view the ClearMarket application as a specific user (Vendor or Field Rep) for support and troubleshooting purposes. All impersonation sessions are fully audited and time-limited.

## Features

### 🔒 Security First
- **Admin-only access**: Only users with the admin role can start impersonation sessions
- **Time-limited sessions**: Automatically expire after 15 minutes
- **Read-only by default**: Prevents accidental data modification
- **Sensitive data protection**: Password resets, payments, API keys, and OAuth secrets are blocked
- **Full audit trail**: Every impersonation session and action is logged

### 👁️ Two Impersonation Modes

#### Read-Only Mode (Default)
- View the application exactly as the user sees it
- All write operations are blocked at both frontend and backend
- Ideal for debugging UI/UX issues, investigating reports
- No risk of accidental data changes

#### Support Mode
- Allows specific, narrowly-scoped support actions
- Admins must explicitly select which actions to enable:
  - `support.reset_mfa` - Reset multi-factor authentication
  - `support.resend_verify` - Resend email verification
  - `support.fix_status` - Fix account status issues
  - `support.add_note` - Add support notes to account
- Each action is logged with payload hash

## How to Use

### Starting an Impersonation Session

1. Navigate to **Admin Dashboard → Users & Management → All Users**
2. Find the user you want to impersonate
3. Click the **"Mimic"** button (eye icon) next to their name
4. In the modal that appears:
   - Enter a detailed reason (minimum 10 characters) - **Required for audit trail**
   - Select mode:
     - **Read-only** (default) - Safe viewing only
     - **Support Mode** - Select specific support actions needed
   - Click **"Start Impersonation"**

### During Impersonation

When impersonating a user, you'll see:
- **Yellow banner at top** showing:
  - Target user's name and role
  - Current mode (Read-only or Support)
  - Active scopes (if in Support mode)
  - Time remaining before session expires
  - **Exit Impersonation** button

The application will behave exactly as it does for the target user, including:
- RLS (Row Level Security) respecting their permissions
- UI elements showing their data only
- Same navigation and features they have access to

### Ending Impersonation

Click the **"Exit Impersonation"** button in the yellow banner to:
- End the session immediately
- Log the session termination
- Restore your admin session
- Reload the page to clear cached state

Sessions also end automatically when:
- 15 minutes have elapsed
- You log out
- The session token expires

## Security Restrictions

### Hard Blocks During Impersonation

The following actions are **completely blocked** during impersonation, regardless of mode:
- Password resets and changes
- Payment instrument modifications
- API key generation or access
- OAuth secret management
- Bank account changes
- Two-factor authentication setup (except with `support.reset_mfa` scope)

### Read-Only Mode Restrictions

In read-only mode, **all write operations** are blocked:
- Cannot create, update, or delete any data
- Cannot send messages or emails
- Cannot change user settings
- Cannot make payments
- All buttons and forms that would modify data are disabled

### Admin-to-Admin Prevention

- Admins **cannot** impersonate other admins
- This prevents privilege abuse and maintains accountability
- Only users with `field_rep` or `vendor` roles can be impersonated

## Audit Trail

### What Gets Logged

Every impersonation session records:
- **Session start**: Admin ID, target user ID, reason, mode, scopes, IP, user agent
- **Session end**: Timestamp when session was terminated
- **Support actions**: Every write attempt in Support mode (with payload hash)

### Viewing Audit Logs

1. Navigate to **Admin Dashboard → Users & Management → Activity Log**
2. Filter by action type:
   - `impersonation_started`
   - `impersonation_ended`
3. View detailed metadata including:
   - Who impersonated whom
   - Why they needed to impersonate
   - What mode and scopes were used
   - When it started and ended

### Audit Log Retention

- Impersonation logs are retained for **180 days**
- After 180 days, logs are archived for compliance
- Critical security events are retained indefinitely

## Use Cases

### ✅ Appropriate Use

- **Debugging**: User reports they can't see their coverage areas → View their profile to verify
- **Support**: User can't complete onboarding → Use `support.resend_verify` to help
- **Investigation**: User reports incorrect data → View as them to see what they see
- **QA**: Verify that a fix works correctly from user's perspective

### ❌ Inappropriate Use

- Casual browsing of user accounts
- Checking user data without legitimate support reason
- Making changes on behalf of users without their knowledge
- Using Support mode when Read-only would suffice

## Best Practices

1. **Always provide detailed reasons** - Your reason is logged and reviewed
2. **Use Read-only mode first** - Only escalate to Support mode if necessary
3. **Minimize scopes** - Only enable the specific support actions you need
4. **End sessions promptly** - Don't leave impersonation sessions running
5. **Document support tickets** - Reference the impersonation session in your support notes
6. **Respect privacy** - Only view data necessary to resolve the issue

## Technical Details

### JWT Claims Structure

Impersonation sessions use special JWT claims:
```json
{
  "sub": "target_user_id",        // Subject: the impersonated user
  "act": "admin_user_id",          // Actor: the admin performing impersonation
  "ro": true,                      // Read-only flag
  "scope": "support.reset_mfa",    // Space-delimited scopes
  "sid": "session_id",             // Session ID for revocation
  "exp": 1234567890                // Expires in 15 minutes
}
```

### Database Tables

#### `impersonation_sessions`
Tracks all impersonation sessions with full metadata.

#### `impersonation_writes`
Logs every write attempt during Support mode sessions, including:
- Route and resource
- Action type (insert/update/delete)
- SHA-256 hash of payload (not raw data)
- Result

### Edge Functions

#### `/admin-impersonate` (POST)
- Validates admin permissions
- Creates session record
- Generates short-lived JWT
- Returns access token

#### `/admin-impersonate-end` (POST)
- Validates session ownership
- Marks session as ended
- Logs termination

## Frontend Integration

### `useImpersonation()` Hook

Components can check impersonation state:
```typescript
const { 
  isImpersonating,
  targetUserName,
  isReadOnly,
  canPerformAction,
  endImpersonation
} = useImpersonation();

// Check if user can perform specific action
if (!canPerformAction('support.reset_mfa')) {
  return <div>This action is not available</div>;
}
```

### Conditional Rendering

```typescript
// Disable button in read-only mode
<Button 
  disabled={isImpersonating && isReadOnly}
  onClick={handleSave}
>
  Save Changes
</Button>
```

## Troubleshooting

### Session Won't Start
- Verify you have admin role
- Check that target user is not an admin
- Ensure reason is at least 10 characters
- Check browser console for errors

### Session Expired Unexpectedly
- Sessions automatically expire after 15 minutes
- Use the time remaining indicator in the banner
- Start a new session if needed (with new reason)

### Can't Perform Action in Support Mode
- Verify the action scope was selected when starting session
- Check that the action is allowed (not on hard-block list)
- Some actions may have additional requirements

### Exit Button Not Working
- Try refreshing the page
- Clear browser cache
- Session may have already expired

## Compliance Notes

- Impersonation feature complies with SOC 2 Type II requirements
- All sessions are logged for audit and compliance review
- User notification can be enabled (webhook/email) if required
- Meets GDPR data access requirements with full audit trail

## Future Enhancements

Planned features for future releases:
- Session inactivity timeout (5 minutes)
- Real-time admin notifications via webhook
- Extended session duration (with additional approval)
- Impersonation analytics dashboard
- User notification when impersonated (optional)
- Screen recording of impersonation sessions (compliance mode)

## Support

For questions or issues with the impersonation feature:
1. Check this documentation first
2. Review audit logs for session details
3. Contact the development team
4. File a support ticket with session ID

---

**Version**: 1.0  
**Last Updated**: 2025-01-28  
**Maintained By**: ClearMarket Development Team
