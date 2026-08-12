// Populates the database with realistic-looking DEMO content in Spanish, so
// a student sees a populated app the moment they log in -- no need to click
// a real verification email first.
//
// Run it with:
//   npm run db:seed
//
// WARNING (read before running): this script FIRST DELETES the demo user.
// Thanks to the "on delete cascade" foreign keys defined in schema.ts
// (tasks -> lists -> users), deleting that one user row also deletes every
// list and task that belongs to them. This is done on purpose so the script
// is safe to re-run over and over without piling up duplicate demo data --
// but it means you should never point DATABASE_URL at a database with real
// user data you care about when running this script.

import { config } from "dotenv";

// tsx runs this file directly with `node`, not through Next.js, so (just
// like drizzle.config.ts) we have to load ".env.local" ourselves to get
// DATABASE_URL into process.env before "./index" reads it.
config({ path: ".env.local" });

import { eq } from "drizzle-orm";

import { db } from "./index";
import { lists, tasks, users } from "./schema";
import { hashPassword } from "../lib/password";

const DEMO_EMAIL = "demo@taskflow.dev";
const DEMO_PASSWORD = "demo1234";

// Builds a "YYYY-MM-DD" due date relative to today (negative offset = in the
// past / overdue, positive = upcoming). Using an offset instead of a fixed
// date keeps the demo data looking current no matter when this is run.
function daysFromToday(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

async function main() {
  console.log("Seeding demo data...");

  // 1. Delete any previous demo user (cascades to their lists and tasks --
  // see the WARNING at the top of this file).
  const existingDemoUser = await db.query.users.findFirst({
    where: eq(users.email, DEMO_EMAIL),
  });
  if (existingDemoUser) {
    await db.delete(users).where(eq(users.id, existingDemoUser.id));
    console.log(`  - Removed previous demo user (id ${existingDemoUser.id}) and their data.`);
  }

  // 2. Create the demo user, already verified so the student can log in
  // right away without going through the real email-verification flow.
  const hashedPassword = await hashPassword(DEMO_PASSWORD);
  const [demoUser] = await db
    .insert(users)
    .values({
      name: "Usuario Demo",
      email: DEMO_EMAIL,
      hashedPassword,
      isVerified: true,
    })
    .returning();

  // 3. Create a handful of believable lists for a student's life.
  const [estudios, trabajo, casa, ocio] = await db
    .insert(lists)
    .values([
      {
        name: "Estudios",
        color: "#2563eb",
        description: "Asignaturas, trabajos y exámenes del cuatrimestre",
        userId: demoUser.id,
      },
      {
        name: "Trabajo",
        color: "#16a34a",
        description: "Tareas del trabajo a tiempo parcial",
        userId: demoUser.id,
      },
      {
        name: "Casa",
        color: "#dc2626",
        description: "Tareas domésticas y recados",
        userId: demoUser.id,
      },
      {
        name: "Ocio",
        color: "#9333ea",
        description: "Planes y actividades para el tiempo libre",
        userId: demoUser.id,
      },
    ])
    .returning();

  // 4. Create tasks spread across those lists: a mix of priorities, some
  // with a due date (past = overdue, future = upcoming) and some without,
  // and a mix of completed / pending.
  await db.insert(tasks).values([
    // --- Estudios ---
    {
      title: "Terminar el TFG",
      description: "Redactar el capítulo de resultados y revisar la bibliografía",
      listId: estudios.id,
      priority: "high",
      dueDate: daysFromToday(5),
      completed: false,
    },
    {
      title: "Repasar el tema 3 antes del examen",
      listId: estudios.id,
      priority: "high",
      dueDate: daysFromToday(2),
      completed: false,
    },
    {
      title: "Entregar la práctica de Bases de Datos",
      listId: estudios.id,
      priority: "medium",
      dueDate: daysFromToday(-1), // overdue
      completed: false,
    },
    {
      title: "Apuntarse a la tutoría de Estadística",
      listId: estudios.id,
      priority: "low",
      completed: true,
    },
    // --- Trabajo ---
    {
      title: "Enviar el informe semanal",
      listId: trabajo.id,
      priority: "high",
      dueDate: daysFromToday(1),
      completed: false,
    },
    {
      title: "Actualizar el CV",
      listId: trabajo.id,
      priority: "low",
      completed: false,
    },
    {
      title: "Preparar la presentación para el jefe",
      description: "Incluir los resultados del último trimestre",
      listId: trabajo.id,
      priority: "medium",
      dueDate: daysFromToday(7),
      completed: false,
    },
    {
      title: "Responder los correos pendientes",
      listId: trabajo.id,
      priority: "medium",
      dueDate: daysFromToday(-2), // overdue, but already handled
      completed: true,
    },
    // --- Casa ---
    {
      title: "Hacer la compra semanal",
      listId: casa.id,
      priority: "medium",
      dueDate: daysFromToday(1),
      completed: false,
    },
    {
      title: "Pagar la factura de la luz",
      listId: casa.id,
      priority: "high",
      dueDate: daysFromToday(-3), // overdue
      completed: false,
    },
    {
      title: "Poner una lavadora",
      listId: casa.id,
      priority: "low",
      completed: true,
    },
    {
      title: "Limpiar el frigorífico",
      listId: casa.id,
      priority: "low",
      completed: false,
    },
    // --- Ocio ---
    {
      title: "Quedar con Marta para tomar un café",
      listId: ocio.id,
      priority: "low",
      dueDate: daysFromToday(3),
      completed: false,
    },
    {
      title: "Ver el nuevo capítulo de la serie",
      listId: ocio.id,
      priority: "low",
      completed: true,
    },
  ]);

  console.log("Demo data created successfully.\n");
  console.log("You can log in with:");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
