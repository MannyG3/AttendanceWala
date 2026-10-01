# RIT Polytechnic — Attendance Management System

A production-quality, mobile-first, period-based attendance management system built for **RIT Polytechnic**.

---

## 🌟 Core Features

- **Session-Based Attendance Engine**: Attendance is recorded per period/session (never per day). Subject-wise, daily, weekly, and monthly numbers are derived by dynamic aggregation queries.
- **Ultra-Fast Mobile Faculty Marking UI**: Defaults all enrolled students to `PRESENT` so faculty only tap absentees — completing attendance for 48 students in under 10 seconds.
- **Practical Batches**: Supports practical lab slots assigned to specific student batches (e.g. `A1`, `A2`).
- **24-Hour Edit Lock & Audit Trail**: Sessions lock automatically 24 hours after completion. Any edit before lock or after HOD/Admin unlock writes an immutable `AuditLog` entry.
- **Role-Based Portals**:
  - 👑 **Admin**: Full CRUD for Divisions, Batches, Students (Bulk Excel import), Faculty, Subjects, Timetable Slots, Academic Calendar (Holidays/Exam weeks), and Rule Settings.
  - 🎓 **HOD**: Defaulter monitoring (<75%), pending leave approval, session unlocking, audit log trail.
  - 👨‍🏫 **Faculty**: Mobile-first session marking, substitution takeover, cancelled session toggles.
  - 🧑‍🎓 **Student**: Subject-wise percentage cards (Green ≥75%, Yellow 70–74.9%, Red <70%), Shortage Calculator ("How many more lectures to attend for 75%"), Leave & OD application submission.
- **Comprehensive Reports**: Export period-wise, daily, weekly, monthly defaulter, and present-day reports to styled **Excel (.xlsx)** and formatted **PDF (.pdf)** documents.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Credentials Provider with BCrypt password hashing & RBAC)
- **Styling**: Tailwind CSS + custom glassmorphic components
- **Validations & Exports**: Zod, `exceljs`, `pdf-lib`
- **Testing**: Vitest (`npm test`)

---

## 🚀 Environment Variables setup (`.env.local`)

Copy `.env.local.example` to `.env.local`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/rit_attendance?schema=public"
NEXTAUTH_SECRET="rit-polytechnic-attendance-secret-key-2026"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 💻 Local Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Prisma Migrations & Generate Client**:
   ```bash
   npx prisma generate
   ```

3. **Seed Database with Sample Data**:
   ```bash
   npm run seed
   ```
   *Seeds division `TYAIML-A`, batches `A1`/`A2`, 48 sample students (`31001` to `31048`), 6 subjects, weekly timetable, and demo users.*

4. **Run Unit Tests**:
   ```bash
   npm test
   ```

5. **Start Local Development Server**:
   ```bash
   npm run dev
   ```

---

## 🔑 Demo Account Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@ritpolytechnic.edu.in` | `password123` |
| **HOD** | `hod@ritpolytechnic.edu.in` | `password123` |
| **Faculty** | `patil@ritpolytechnic.edu.in` | `password123` |
| **Student** | `student31001@ritpolytechnic.edu.in` | `password123` |

---

## ☁️ Deployment Instructions (Vercel + Neon DB)

1. **Database Setup (Neon PostgreSQL)**:
   - Create a free PostgreSQL database project at [neon.tech](https://neon.tech).
   - Copy the Connection String `DATABASE_URL`.

2. **Deploy to Vercel**:
   - Push repository to GitHub.
   - Import project in Vercel.
   - Set Environment Variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
   - Vercel automatically runs `npx prisma generate` during `npm run build`.
