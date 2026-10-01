import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sampleNames = [
  "Aarav Sharma", "Ananya Deshmukh", "Rohan Patil", "Isha Kulkarni", "Aditya Shinde",
  "Priya More", "Sahil Joshi", "Siddhi Pawar", "Omkar Chougule", "Tanvi Jadhav",
  "Yash Gaikwad", "Sanika Bhosale", "Pranav Mane", "Neha Kamble", "Atharva Kadam",
  "Rutuja Salunkhe", "Varun Sawant", "Shruti Thorat", "Parth Naik", "Gauri Chavan",
  "Siddharth Bhandari", "Radhika Mahajan", "Kunal Ingale", "Meera Kulkarni", "Sanket Mote",
  "Sayali Wagh", "Harshwardhan Jagtap", "Bhakti Nikam", "Tejas Khot", "Shraddha Gavali",
  "Digvijay Nalawade", "Vaishnavi Sutar", "Abhishek Parit", "Aarya Gurav", "Karthik Shete",
  "Sakshi Mule", "Soham Doke", "Prachi Ghode", "Mayur Phadatare", "Pooja Lendave",
  "Ritesh Shripane", "Snehal Kumbhar", "Sourabh Powar", "Purva Shirodkar", "Manish Badave",
  "Anusha Devkar", "Vedant Suryawanshi", "Riya Shelke"
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.session.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.division.deleteMany();
  await prisma.user.deleteMany();
  await prisma.academicCalendar.deleteMany();
  await prisma.systemSettings.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create System Settings
  await prisma.systemSettings.create({
    data: {
      id: "default",
      lateWeight: 1.0,
      odWeight: 1.0,
      presentDayThresholdPercent: 50.0,
      editingLockHours: 24,
    },
  });

  // 2. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@ritpolytechnic.edu.in",
      password: hashedPassword,
      name: "System Admin",
      role: "ADMIN",
    },
  });

  const hodUser = await prisma.user.create({
    data: {
      email: "hod@ritpolytechnic.edu.in",
      password: hashedPassword,
      name: "Dr. A. B. Thorat (HOD AI&ML)",
      role: "HOD",
    },
  });

  const faculty1User = await prisma.user.create({
    data: {
      email: "patil@ritpolytechnic.edu.in",
      password: hashedPassword,
      name: "Prof. S. A. Patil",
      role: "FACULTY",
    },
  });

  const faculty2User = await prisma.user.create({
    data: {
      email: "kulkarni@ritpolytechnic.edu.in",
      password: hashedPassword,
      name: "Prof. R. M. Kulkarni",
      role: "FACULTY",
    },
  });

  const faculty3User = await prisma.user.create({
    data: {
      email: "shinde@ritpolytechnic.edu.in",
      password: hashedPassword,
      name: "Prof. V. N. Shinde",
      role: "FACULTY",
    },
  });

  // 3. Create Faculty Records
  const faculty1 = await prisma.faculty.create({
    data: {
      employeeId: "FAC001",
      name: "Prof. S. A. Patil",
      department: "Artificial Intelligence & Machine Learning",
      userId: faculty1User.id,
    },
  });

  const faculty2 = await prisma.faculty.create({
    data: {
      employeeId: "FAC002",
      name: "Prof. R. M. Kulkarni",
      department: "Artificial Intelligence & Machine Learning",
      userId: faculty2User.id,
    },
  });

  const faculty3 = await prisma.faculty.create({
    data: {
      employeeId: "FAC003",
      name: "Prof. V. N. Shinde",
      department: "Artificial Intelligence & Machine Learning",
      userId: faculty3User.id,
    },
  });

  // 4. Create Division & Batches
  const division = await prisma.division.create({
    data: {
      name: "TYAIML-A",
      department: "Artificial Intelligence & Machine Learning",
      academicYear: "2026-2027",
    },
  });

  const batchA1 = await prisma.batch.create({
    data: {
      name: "A1",
      divisionId: division.id,
    },
  });

  const batchA2 = await prisma.batch.create({
    data: {
      name: "A2",
      divisionId: division.id,
    },
  });

  // 5. Create 48 Sample Students (31001 to 31048)
  console.log("Creating 48 students (31001 - 31048)...");
  for (let i = 0; i < 48; i++) {
    const rollNo = 31001 + i;
    const name = sampleNames[i] || `Student ${rollNo}`;
    const batchId = i < 24 ? batchA1.id : batchA2.id;
    const email = `student${rollNo}@ritpolytechnic.edu.in`;

    const studentUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "STUDENT",
      },
    });

    await prisma.student.create({
      data: {
        rollNo,
        name,
        divisionId: division.id,
        batchId,
        userId: studentUser.id,
      },
    });
  }

  // 6. Create 6 Subjects
  console.log("Creating 6 subjects...");
  const subPython = await prisma.subject.create({
    data: {
      code: "22616",
      name: "Programming with Python",
      type: "THEORY",
      divisionId: division.id,
    },
  });

  const subMAD = await prisma.subject.create({
    data: {
      code: "22617",
      name: "Mobile Application Development",
      type: "THEORY",
      divisionId: division.id,
    },
  });

  const subET = await prisma.subject.create({
    data: {
      code: "22618",
      name: "Emerging Technologies in AI",
      type: "THEORY",
      divisionId: division.id,
    },
  });

  const subSE = await prisma.subject.create({
    data: {
      code: "22619",
      name: "Software Engineering",
      type: "THEORY",
      divisionId: division.id,
    },
  });

  const subPyLab = await prisma.subject.create({
    data: {
      code: "22620",
      name: "Python Lab",
      type: "PRACTICAL",
      divisionId: division.id,
    },
  });

  const subMADLab = await prisma.subject.create({
    data: {
      code: "22621",
      name: "MAD Lab",
      type: "PRACTICAL",
      divisionId: division.id,
    },
  });

  // 7. Create Timetable Slots (Mon - Fri)
  console.log("Creating timetable slots...");
  const slotData = [
    // Monday (weekday 1)
    { weekday: 1, periodNo: 1, startTime: "09:00", endTime: "10:00", subjectId: subPython.id, facultyId: faculty1.id, batchId: null, room: "LH-101" },
    { weekday: 1, periodNo: 2, startTime: "10:00", endTime: "11:00", subjectId: subMAD.id, facultyId: faculty2.id, batchId: null, room: "LH-101" },
    { weekday: 1, periodNo: 3, startTime: "11:15", endTime: "12:15", subjectId: subSE.id, facultyId: faculty3.id, batchId: null, room: "LH-101" },
    { weekday: 1, periodNo: 4, startTime: "13:00", endTime: "15:00", subjectId: subPyLab.id, facultyId: faculty1.id, batchId: batchA1.id, room: "Lab-1" },
    { weekday: 1, periodNo: 4, startTime: "13:00", endTime: "15:00", subjectId: subMADLab.id, facultyId: faculty2.id, batchId: batchA2.id, room: "Lab-2" },

    // Tuesday (weekday 2)
    { weekday: 2, periodNo: 1, startTime: "09:00", endTime: "10:00", subjectId: subET.id, facultyId: faculty1.id, batchId: null, room: "LH-101" },
    { weekday: 2, periodNo: 2, startTime: "10:00", endTime: "11:00", subjectId: subSE.id, facultyId: faculty3.id, batchId: null, room: "LH-101" },
    { weekday: 2, periodNo: 3, startTime: "11:15", endTime: "12:15", subjectId: subPython.id, facultyId: faculty1.id, batchId: null, room: "LH-101" },
    { weekday: 2, periodNo: 4, startTime: "13:00", endTime: "15:00", subjectId: subMADLab.id, facultyId: faculty2.id, batchId: batchA1.id, room: "Lab-2" },
    { weekday: 2, periodNo: 4, startTime: "13:00", endTime: "15:00", subjectId: subPyLab.id, facultyId: faculty1.id, batchId: batchA2.id, room: "Lab-1" },

    // Wednesday (weekday 3)
    { weekday: 3, periodNo: 1, startTime: "09:00", endTime: "10:00", subjectId: subMAD.id, facultyId: faculty2.id, batchId: null, room: "LH-101" },
    { weekday: 3, periodNo: 2, startTime: "10:00", endTime: "11:00", subjectId: subET.id, facultyId: faculty1.id, batchId: null, room: "LH-101" },
    { weekday: 3, periodNo: 3, startTime: "11:15", endTime: "12:15", subjectId: subSE.id, facultyId: faculty3.id, batchId: null, room: "LH-101" },

    // Thursday (weekday 4)
    { weekday: 4, periodNo: 1, startTime: "09:00", endTime: "10:00", subjectId: subPython.id, facultyId: faculty1.id, batchId: null, room: "LH-101" },
    { weekday: 4, periodNo: 2, startTime: "10:00", endTime: "11:00", subjectId: subMAD.id, facultyId: faculty2.id, batchId: null, room: "LH-101" },
    { weekday: 4, periodNo: 3, startTime: "11:15", endTime: "12:15", subjectId: subET.id, facultyId: faculty1.id, batchId: null, room: "LH-101" },

    // Friday (weekday 5)
    { weekday: 5, periodNo: 1, startTime: "09:00", endTime: "10:00", subjectId: subSE.id, facultyId: faculty3.id, batchId: null, room: "LH-101" },
    { weekday: 5, periodNo: 2, startTime: "10:00", endTime: "11:00", subjectId: subPython.id, facultyId: faculty1.id, batchId: null, room: "LH-101" },
    { weekday: 5, periodNo: 3, startTime: "11:15", endTime: "12:15", subjectId: subMAD.id, facultyId: faculty2.id, batchId: null, room: "LH-101" },
  ];

  for (const slot of slotData) {
    await prisma.timetableSlot.create({
      data: {
        divisionId: division.id,
        ...slot,
      },
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log("Credentials:");
  console.log("  Admin:    admin@ritpolytechnic.edu.in / password123");
  console.log("  HOD:      hod@ritpolytechnic.edu.in / password123");
  console.log("  Faculty:  patil@ritpolytechnic.edu.in / password123");
  console.log("  Student:  student31001@ritpolytechnic.edu.in / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
