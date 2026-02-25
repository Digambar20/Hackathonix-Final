# Registration System - Live Configuration

## Timeline
- **Registration Opens:** February 26, 2026 at 07:00 AM
- **Registration Closes:** March 6, 2026 at 12:00 AM (Midnight)
- **Total Duration:** 9 days, 5 hours
- **Registration Limit:** 90 teams

---

## Features Implemented

### 1. Countdown Timer
**Location:** Displayed above registration form  
**Updates:** Every 1 second  
**Duration:** 9 days, 5 hours

**States:**
- **Before Opening:** Shows "Registration Opens In" with countdown
- **During Registration:** Shows "Registration Open - Closes In" with countdown in green
- **After Closing:** Shows "Registration Closed" message in red

**Display Format:**
```
DD:HH:MM:SS
00 Days 05 Hours 30 Minutes 45 Seconds
```

### 2. Live Registration Counter
**Location:** Below countdown timer  
**Updates:** Every 10 seconds  
**Shows:**

- **Total Registered Teams** (out of 90)
- **Spots Remaining** (color-coded)
- **Progress Bar** with percentage
- **Status Indicator:**
  - 🟢 Green when spots available
  - 🟡 Amber when < 11 spots left
  - 🔴 Red when full (0 spots)

**Progress Bar Colors:**
- Green: 0-75% full
- Amber: 75-90% full
- Red: 90-100% full

### 3. Registration Window Enforcement
**API Validation:**

```typescript
// Registration Window: Feb 26, 7 AM - Mar 6, 12 AM
if (now < registrationStart) {
  // NOT STARTED - Show error
  "Registration has not started yet. Opens on February 26, 2026 at 7:00 AM"
}

if (now >= registrationEnd) {
  // CLOSED - Show error
  "Registration period has ended. Thank you for your interest!"
}
```

### 4. Registration Limit (90 Teams)
**API Validation:**

```typescript
const totalRegistered = await prisma.team.count();
if (totalRegistered >= 90) {
  // FULL - Show error
  "Registration limit (90 teams) has been reached. Thank you for your interest!"
}
```

---

## Response Messages

### Success (HTTP 201)
```json
{
  "success": true,
  "team": {
    "id": "team-uuid",
    "name": "Team Name"
  },
  "message": "Team registered! Use your email and Team ID \"team-uuid\" to login."
}
```

### Not Started (HTTP 403)
```json
{
  "error": "Registration has not started yet. Opens on February 26, 2026 at 7:00 AM"
}
```

### Registration Closed (HTTP 403)
```json
{
  "error": "Registration period has ended. Thank you for your interest!"
}
```

### Registration Full (HTTP 409)
```json
{
  "error": "Registration limit (90 teams) has been reached. Thank you for your interest!"
}
```

### Team Name Taken (HTTP 409)
```json
{
  "error": "Team name already taken"
}
```

---

## Registration Stats Endpoint

**Endpoint:** `GET /api/registration/stats`

**Response:**
```json
{
  "totalRegistered": 45,
  "registrationLimit": 90,
  "spotsRemaining": 45,
  "registrationClosed": false,
  "registrationNotStarted": false,
  "registrationStart": "2026-02-26T07:00:00.000Z",
  "registrationEnd": "2026-03-06T00:00:00.000Z"
}
```

---

## Registration Form Layout

```
┌─────────────────────────────────────────┐
│  📋 COUNTDOWN TIMER                      │
│  Registration Open - Closes In           │
│  09:05:30:45 (Days:Hours:Minutes:Secs)  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📊 LIVE REGISTRATION COUNT              │
│  Teams Registered: 45 | Spots Left: 45  │
│  Progress: 50% [████████░░░░░░░░░░]     │
│  Closes Mar 6, 2026 at 12:00 AM         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🚀 REGISTER TEAM                        │
│                                          │
│  Team Name: [________________]           │
│                                          │
│  Members (2-4):                          │
│  Member 1: [____] [____@____]  [❌]     │
│  Member 2: [____] [____@____]  [❌]     │
│  [+ Add Member]                          │
│                                          │
│  [INITIATE REGISTRATION]                │
│                                          │
│  Already registered? Login here          │
└─────────────────────────────────────────┘
```

---

## API Endpoints Modified

### 1. POST `/api/teams` (Registration)
**Changes:**
- Added registration window validation
- Added 90-team limit enforcement
- Returns appropriate error codes for different scenarios

**Timeline Checking:**
```javascript
const now = new Date();
const registrationStart = new Date(2026, 1, 26, 7, 0, 0);
const registrationEnd = new Date(2026, 2, 6, 0, 0, 0);
```

### 2. GET `/api/registration/stats` (NEW)
**Purpose:** Fetch live registration statistics  
**Called From:** Registration form (every 10 seconds)  
**Returns:**
- Total registrations
- Spots remaining
- Registration period status
- Dates and limits

---

## Component Files Created

### 1. `CountdownTimer.tsx`
- Tracks registration period
- Updates every second
- Shows different states based on timeline
- Responsive grid layout

### 2. `RegistrationStats.tsx`
- Fetches stats endpoint
- Displays counter with progress bar
- Shows warning when spots < 11
- Updates every 10 seconds
- Color-coded indicators

---

## Database Schema

**Team Table (Existing):**
```prisma
model Team {
  id                  String      @id @default(cuid())
  name                String      @unique
  registrationApproved Boolean    @default(false)
  paymentVerified     Boolean     @default(false)
  // ... other fields
}
```

**Query for Registration Count:**
```typescript
const totalRegistered = await prisma.team.count();
// Returns: number of teams
```

---

## Testing the System

### Test 1: Before Registration Opens
**Current Time:** Feb 25, 2026, 6 PM  
**Action:** Try to register  
**Expected:** Show "Registration Opens In" countdown

### Test 2: During Registration
**Current Time:** Feb 26, 2026, 7 AM - Mar 6, 2026, 12 AM  
**Action:** Register team  
**Expected:** Success, Team ID returned

### Test 3: Registration Full
**Current Time:** During registration window  
**Condition:** 90 teams already registered  
**Action:** Try to register  
**Expected:** Error "Registration limit reached"

### Test 4: Registration Closed
**Current Time:** Mar 6, 2026, 12 AM onwards  
**Action:** Try to register  
**Expected:** Error "Registration closed"

---

## Monitoring & Analytics

### Key Metrics to Track
1. **Registration Rate:** Teams per hour
2. **Spots Remaining:** Real-time capacity
3. **Peak Hours:** When most teams register
4. **Errors:** Registration failures

### Live Dashboard (Admin)
Location: `/admin/teams`

Shows:
- Total registered teams
- Registration progress bar
- Current status
- Member details per team

---

## User Experience Flow

```
1. LANDING PAGE
   └─ Sees "Registration Opens in: 1 day 5 hours"

2. REGISTRATION PAGE (Feb 26, 7 AM)
   ├─ Countdown: "9 days 5 hours remaining"
   ├─ Stats: "45/90 teams registered"
   └─ Form: Ready to register

3. SUBMIT REGISTRATION
   ├─ Success: Shows Team ID on screen
   └─ Save Team ID prompt

4. LATE REGISTRATION (Mar 5, 11 PM)
   ├─ Countdown: "1 hour remaining"
   ├─ Stats: "88/90 teams registered"
   └─ Form available if spots left

5. AFTER CLOSING (Mar 6, 12 AM)
   ├─ Countdown: "REGISTRATION CLOSED"
   ├─ Stats: "90/90 teams registered"
   └─ Form: Disabled, cannot register
```

---

## Configuration Notes

### Dates in Code
```javascript
// Start: Feb 26, 2026, 7:00 AM
new Date(2026, 1, 26, 7, 0, 0)
// Note: Month is 0-indexed (1 = Feb)

// End: Mar 6, 2026, 12:00 AM (midnight)
new Date(2026, 2, 6, 0, 0, 0)
// Note: 12 AM = 00:00 (start of new day)
```

### Registration Limit
```javascript
const registrationLimit = 90; // Can be changed in two places:
// 1. web/src/app/api/teams/route.ts (line 10)
// 2. web/src/app/api/registration/stats/route.ts (line 9)
```

---

## Cleanup Checklist Before Launch

- [ ] Verify timezone is correct for your region
- [ ] Test countdown timer accuracy
- [ ] Test registration with 89 teams (should work)
- [ ] Test registration with 90 teams (should fail)
- [ ] Verify stats endpoint updates correctly
- [ ] Test error messages display properly
- [ ] Check countdown timer with browser dev tools
- [ ] Test on mobile devices
- [ ] Verify no console errors
- [ ] Test before and after registration window dates

---

**System Status:** ✅ READY FOR LIVE LAUNCH  
**Last Updated:** February 25, 2026  
**Next Review:** February 26, 2026 (Registration goes live)
