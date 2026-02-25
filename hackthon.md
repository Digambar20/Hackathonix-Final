# HACKTHONIX 2.0

**Presented by Coding Club, K.D.K. College of Engineering, Nagpur**
*(An Autonomous Institute | Accredited by NAAC and NBA)*

## 🚀 Event Overview
**10-HOUR INNOVATION SPRINT**
*Build from Zero | Ship before Sunset | Outperform the Rest*

- **Date:** 10th March 2026
- **Reporting Time:** 7:00 AM
- **Venue:** KDKCE (Block-B), Dept. of CSE
- **Target Audience:** College students, professionals, and coding enthusiasts

---

## 📅 Schedule & Structure
### Rounds
1. **Round 1:** Actual Prototype Development (Simulated as 10-Hour Sprint)
2. **Round 2:** Problem Statement Presentation

### Rules & Format
- **Duration:** The event is branded as a 10-Hour Sprint ("Ship before Sunset"), though the technical platform is designed to handle up to 24 hours if needed.
- **Team Size:** 2-4 Members
- **Problem Statements:** 12 Problem Statements available in a grid layout.
- **Selection Rule:** Teams select One PS. 10-minute window to change selection, then permanently locked.

---

## 🏆 Prizes & Registration
### Prize Pool
- **Winner:** ₹10,000
- **2nd Runner Up:** ₹7,500
- **3rd Runner Up:** ₹5,000

### Registration Fee
- **Early Bird:** ₹110/- Per Person *(Ends: 28th February 2026)*
- **Regular Fee:** ₹150/- Per Person

### Registration & Contact
- **Scan to Register:** (QR Code on Flyer)
- **Website:** [www.kdkce.edu.in](http://www.kdkce.edu.in)
- **Instagram:** [@codingclub_kdk](https://instagram.com/codingclub_kdk)
- **Contact:** Coding Club Organizers

---

## ⚖️ Judging Criteria
Teams will be evaluated by judges on 4 key criteria (0-25 points each):
1.  **Commit Frequency:** Consistency of work and activity pattern (tracked via GitHub).
2.  **Code Quality:** Structure, readability, and best practices.
3.  **Problem Relevance:** Accuracy of the solution to the problem statement.
4.  **Final Submission:** Completeness and innovation of the prototype.

*Note: Scores are averaged across all judges.*

---

## 💻 Platform Features & Workflow (For Participants)
### 1. Registration & Login
- Team login with Team Name and Member details (Email, Name, Contact).
- No password required for participants (streamlined access).

### 2. Problem Statement Selection
- Dashboard shows 12 Problem Statements (Title, Difficulty, Tags).
- Once selected, you have **10 minutes** to finalize or change. After that, it is locked.

### 3. Development Tracking
- Teams must submit a **GitHub Repository URL**.
- System tracks commits every **5 minutes**.
- Keep committing regular updates to score well on "Commit Frequency".

### 4. Dashboard
- Real-time countdown timer.
- View selected Problem Statement.
- Track GitHub sync status.

---

## 🛠 Platform Specifications (For Developers/Admins)
*Based on Requirements Document*

### User Roles
- **Team:** Register, Select PS, Submit Repo.
- **Judge:** View teams, Score (0-25 per criteria), View Commit History.
- **Admin:** Manage Teams/PS, Override locks, On-spot registration, Final Result declaration.

### Technical Stack
- **Frontend:** Next.js 14.2 (App Router), Tailwind CSS, Shadcn UI.
- **Backend:** Node.js 20, Express, TypeScript.
- **Database:** PostgreSQL (Prisma ORM), Redis (Caching/Sessions).
- **Auth:** NextAuth.js (JWT).
- **External:** GitHub API v3 (for tracking activity).

### Security
- Role-based middleware.
- Zod validation for inputs.
- Rate limiting on APIs.
