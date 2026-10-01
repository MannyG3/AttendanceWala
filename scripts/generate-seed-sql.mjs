import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const students = JSON.parse(
  readFileSync(join(__dirname, "students.json"), "utf-8")
);

const rows = students
  .map(
    (s) =>
      `  (${s.roll_no}, '${s.name.replace(/'/g, "''")}')`
  )
  .join(",\n");

const sql = `-- Seed TY class roster (94 students)
insert into students (roll_no, name) values
${rows}
on conflict (roll_no) do update set
  name = excluded.name,
  is_active = true;
`;

writeFileSync(join(__dirname, "..", "supabase", "seed-students.sql"), sql);
console.log(`Wrote ${students.length} students to supabase/seed-students.sql`);
