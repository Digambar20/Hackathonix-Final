# Registration System - Pre-Launch Checklist

## 🚀 Launch Date: February 26, 2026, 7:00 AM

---

## ✅ Code Changes Completed

### Components Created
- [x] `src/components/registration/CountdownTimer.tsx` - Live countdown display
- [x] `src/components/registration/RegistrationStats.tsx` - Registration counter and progress bar

### API Endpoints
- [x] `src/app/api/registration/stats/route.ts` - NEW endpoint for stats
- [x] `src/app/api/teams/route.ts` - UPDATED with registration window and 90-team limit

### Form Updates
- [x] `src/components/auth/RegisterForm.tsx` - UPDATED with countdown timer and stats

### Configuration
- [x] Registration window: Feb 26, 7 AM - Mar 6, 12 AM
- [x] Registration limit: 90 teams
- [x] Error messages for window violations
- [x] Real-time stat updates (10 second intervals)

---

## 📋 Pre-Launch Verification (Do 1 day before launch)

### Database Check
- [ ] Run `npx prisma db push` to sync schema
- [ ] Verify `dev.db` exists in web folder
- [ ] Confirm Team table exists and is empty (or counts existing teams)

### Build Check
- [ ] Run `npm run build` in web folder
- [ ] Verify no build errors
- [ ] Check all TypeScript compilation passes

### Server Start Check
- [ ] Run `npm run dev` in web folder
- [ ] Verify server starts on port 3000
- [ ] No console errors during startup

### Frontend Tests
- [ ] Navigate to `http://localhost:3000/register`
- [ ] Verify countdown timer displays
- [ ] Verify stats display with "0/90 teams"
- [ ] Verify form displays correctly

### API Tests (Before Feb 26, 7 AM)
- [ ] Try to register team (should fail: "not started yet")
- [ ] Get `/api/registration/stats` - should show `registrationNotStarted: true`

---

## 🎯 Launch Day (February 26, 2026)

### 6:50 AM - Final Checks
- [ ] Development server is running (`npm run dev`)
- [ ] Database is accessible
- [ ] No errors in console
- [ ] Verify time on server matches system time

### 6:55 AM - Monitor Ready
- [ ] Admin dashboard open to monitor registrations
- [ ] Notification system ready (if applicable)
- [ ] Support team on standby

### 7:00 AM - Launch!
- [ ] Registration window opens automatically
- [ ] Countdown timer shows "NOW OPEN"
- [ ] Stats show "0/90"
- [ ] Form is fully functional

### 7:00 AM - 12:00 AM Daily Tasks
- [ ] Monitor registration count
- [ ] Check for errors in logs
- [ ] Verify payment integration works (if applicable)

---

## ⚠️ Common Issues & Solutions

### Issue: Countdown shows wrong time
**Solution:** Check server timezone and system clock
```powershell
[System.TimeZone]::CurrentTimeZone.StandardName
Get-Date
```

### Issue: Stats endpoint returns 0 teams but we have registrations
**Solution:** Check database connectivity
```bash
npx prisma studio  # Check Prisma Studio
```

### Issue: Registration doesn't submit
**Solution:** Check browser console for errors and verify server is responding
```bash
npm run dev  # Restart server
```

### Issue: Countdown timer not updating
**Solution:** Check that `setInterval` is running in browser DevTools
```javascript
// Test in browser console:
console.log(new Date(2026, 1, 26, 7, 0, 0))  // Should show Feb 26
```

---

## 📊 Monitoring During Registration

### Metrics to Track
1. **Registration Rate:** Teams per hour
   - Target: Steady increase toward 90
   
2. **Error Rate:** Failed registrations
   - Target: < 1% of attempts
   
3. **Response Time:** API response speed
   - Target: < 500ms per request
   
4. **Database:** Team count growth
   - Expected: ~10-15 teams per hour

### Dashboard View
- Navigate to `/admin/teams` to see:
  - Total registrations
  - Team list with member counts
  - Payment status
  - Registration approval status

---

## 🔔 Critical Timestamps

| Event | Date & Time | Action |
|-------|------------|--------|
| Pre-Launch Review | Feb 25, 6 PM | Final verification |
| Final Server Start | Feb 26, 6:50 AM | Confirm running |
| **REGISTRATION OPENS** | **Feb 26, 7:00 AM** | **LIVE** ✅ |
| Check-in #1 | Feb 26, 7:30 AM | Monitor first 30 min |
| Check-in #2 | Feb 26, 12:00 PM | Midday status |
| Check-in #3 | Feb 26, 6:00 PM | Evening status |
| **REGISTRATION CLOSES** | **Mar 6, 12:00 AM** | **CLOSED** ❌ |
| Final Report | Mar 6, 12:30 AM | Generate stats |

---

## 📱 Mobile Testing

- [ ] Test registration form on mobile (iOS)
- [ ] Test registration form on mobile (Android)
- [ ] Verify countdown timer responsive on mobile
- [ ] Check text sizes on small screens
- [ ] Verify progress bar displays properly

---

## 🔒 Security Checklist

- [ ] `.env.local` is NOT committed to git
- [ ] DATABASE_URL uses local SQLite (not exposed)
- [ ] AUTH_SECRET is secure and different from default
- [ ] API endpoints validate all inputs
- [ ] Rate limiting enabled (if applicable)

---

## 📞 Support Contacts

### If Issues Arise During Registration
1. **Server Down:** Restart with `npm run dev`
2. **Database Issues:** Check `dev.db` file exists
3. **API Errors:** Check terminal logs for errors
4. **Timer Wrong:** Verify system time

### Post-Launch Reporting
After registration closes (Mar 6, 12 AM):
- [ ] Generate registration report
- [ ] Export team list
- [ ] Download registration analytics
- [ ] Archive registration data

---

## 📝 Documentation Updates

After launch completion, update:
- [ ] Final registration stats
- [ ] Actual vs projected registration rates
- [ ] Any issues encountered and solutions
- [ ] Recommendations for next event

---

## ✨ Success Criteria

✅ Registration system is **LIVE** and accepting teams  
✅ Countdown timer displays correctly  
✅ Registration counter updates in real-time  
✅ All 90 spots are tracked accurately  
✅ Teams receive Team IDs successfully  
✅ No critical errors in logs  

---

**Checklist Version:** 1.0  
**Last Updated:** February 25, 2026  
**Status:** Ready for Launch ✅
