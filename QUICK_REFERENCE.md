# 🚀 QUICK REFERENCE - Registration Launch

---

## ⚡ Fast Start (2 minutes)

```bash
cd web
npm run dev
```

Then visit: `http://localhost:3000/register`

---

## 📋 Key Information

| Item | Details |
|------|---------|
| **Launch Date** | February 26, 2026 |
| **Launch Time** | 7:00 AM |
| **Close Date** | March 6, 2026 |
| **Close Time** | 12:00 AM (Midnight) |
| **Registration Limit** | 90 teams |
| **URLs** | `/register`, `/login`, `/admin/teams` |

---

## 🎯 What Users See

### Before Launch
```
📋 Registration Opens In: 1 day 5 hours
❌ Form disabled - Cannot register yet
```

### During Launch
```
📋 Registration Open - Closes In: 9 days 5 hours
👥 45 Teams Registered / 90 Limit
✅ Form active - Can register
```

### After Closing
```
📋 Registration Closed
❌ Form disabled - Cannot register
```

---

## 🔍 Verification

**Run:** `.\verify-registration.ps1`

**Expected Output:** ✅ All 9 checks PASSED

---

## 🌐 Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/register` | GET | Registration form |
| `/api/teams` | POST | Create team |
| `/api/teams` | GET | Get team data |
| `/api/registration/stats` | GET | Get registration stats |

---

## 📊 Live Stats Example

```json
{
  "totalRegistered": 45,
  "registrationLimit": 90,
  "spotsRemaining": 45,
  "registrationClosed": false,
  "registrationNotStarted": false
}
```

---

## ✅ Pre-Launch Checklist (Do 1 hour before)

- [ ] Code is committed
- [ ] Server starts without errors: `npm run dev`
- [ ] `/register` page loads
- [ ] Countdown timer displays
- [ ] Stats counter displays "0/90"
- [ ] Database file exists: `dev.db`
- [ ] `.env.local` configured
- [ ] No console errors
- [ ] Mobile responsive (test on phone)
- [ ] Admin dashboard accessible: `/admin/teams`

---

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| Page shows "Not Started" | Verify system date is Feb 26+ |
| Stats show wrong count | Restart server: `npm run dev` |
| Error 500 | Check logs in terminal |
| Form not submitting | Open DevTools console, check errors |
| Timer not updating | Refresh page (F5) |

---

## 📊 Monitor These

### Real-Time During Launch
1. **Registration Rate** - How many teams/hour
2. **Error Rate** - Any failed registrations
3. **API Response Time** - Should be < 500ms
4. **Database** - Team count growing

### Check Points
- 7:30 AM - First check (verify first teams register)
- 12:00 PM - Midday check
- 6:00 PM - Evening check
- Daily - Morning check of stats

---

## 🔧 If Status Code Errors

| Code | Meaning | Solution |
|------|---------|----------|
| 201 | ✅ Success | Team registered |
| 400 | ❌ Bad data | Invalid form data |
| 403 | ❌ Window closed | Outside registration period |
| 409 | ❌ Full/Duplicate | Limit reached or name taken |
| 500 | ❌ Server error | Restart server |

---

## 📁 Important Files

```
web/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── RegisterForm.tsx (UPDATED)
│   │   └── registration/
│   │       ├── CountdownTimer.tsx (NEW)
│   │       └── RegistrationStats.tsx (NEW)
│   └── app/api/
│       ├── teams/route.ts (UPDATED)
│       └── registration/stats/route.ts (NEW)
├── dev.db (Database)
└── .env.local (Config)
```

---

## 🎯 Success Criteria

✅ System launches on time (Feb 26, 7 AM)  
✅ Countdown timer displays correctly  
✅ Stats update every 10 seconds  
✅ Teams can register successfully  
✅ Registration stops at Mar 6, 12 AM  
✅ No critical errors  
✅ 90 team limit enforced  

---

## 📞 Emergency Contacts

**If Server Down:**
1. Check terminal for errors
2. Restart: `npm run dev`
3. Check database file exists

**If Database Issues:**
1. Check `dev.db` file exists in `web/`
2. Run: `npx prisma db push`
3. Restart server

**If Limit Not Working:**
1. Verify `registrationLimit = 90` in code
2. Restart server
3. Check database count

---

## 🚀 Launch Timeline

```
6:50 AM  → Server running, ready
6:55 AM  → Final checks complete
7:00 AM  → REGISTRATION OPENS! 🎉
          Timer displays GREEN
          Stats show "0/90"
          Form is ACTIVE

Mar 6,   → Registration closes
12:00 AM   Timer displays RED
          Form is DISABLED
          Final count saved
```

---

## 📝 Documentation

- **REGISTRATION_SYSTEM_GO_LIVE_SUMMARY.md** - Full system overview
- **REGISTRATION_LIVE_CONFIG.md** - Detailed configuration
- **LAUNCH_CHECKLIST.md** - Complete launch checklist
- **verify-registration.ps1** - Verification script

---

**Status:** ✅ READY TO LAUNCH  
**Last Updated:** February 25, 2026  
**System Verified:** 9/9 Checks PASSED

---

## 🎓 How It Works

1. User visits `/register`
2. Sees countdown timer (updates every second)
3. Sees registration counter (updates every 10 seconds)
4. Fills registration form
5. Clicks submit
6. API checks:
   - Is registration window open? (Feb 26 7 AM - Mar 6 12 AM)
   - Have 90 teams registered? (if yes, reject)
   - Is data valid? (if no, reject)
7. If all checks pass → Team created, Team ID returned
8. User can login with Team ID

---

**Everything is ready! You're good to go! 🚀**
