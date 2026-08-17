import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { addDays, setHours } from "date-fns";

const db = new PrismaClient();

async function main() {
  const email = "demo@noto.app";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Demo user already exists.");
    return;
  }

  const user = await db.user.create({
    data: {
      name: "Kyle",
      email,
      passwordHash: await hash("noto-demo", 10),
    },
  });

  const project = await db.project.create({
    data: {
      userId: user.id,
      name: "Website Redesign",
      description: "Rebuild the public site around a clearer offer and faster pages.",
      color: "#7C9CBF",
    },
  });

  await db.favorite.create({
    data: { userId: user.id, projectId: project.id },
  });

  const design = await db.tag.create({
    data: { userId: user.id, name: "design" },
  });
  const launch = await db.tag.create({
    data: { userId: user.id, name: "launch" },
  });

  const today = new Date();
  const tasks = await Promise.all([
    db.task.create({
      data: {
        userId: user.id,
        projectId: project.id,
        title: "Create wireframes",
        description: "Home, pricing, and workspace screens.",
        status: "DONE",
        priority: "HIGH",
        position: 1,
        dueDate: addDays(today, -2),
        tags: { create: [{ tagId: design.id }] },
      },
    }),
    db.task.create({
      data: {
        userId: user.id,
        projectId: project.id,
        title: "Build landing page",
        description: "Ship the first public page with the new type system.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        position: 1,
        dueDate: today,
        tags: { create: [{ tagId: design.id }] },
        subtasks: {
          create: [
            { title: "Hero copy", position: 1, completed: true },
            { title: "Feature sections", position: 2, completed: false },
          ],
        },
      },
    }),
    db.task.create({
      data: {
        userId: user.id,
        projectId: project.id,
        title: "Implement authentication",
        status: "TODO",
        priority: "MEDIUM",
        position: 1,
        dueDate: addDays(today, 3),
      },
    }),
    db.task.create({
      data: {
        userId: user.id,
        projectId: project.id,
        title: "Deploy website",
        status: "BACKLOG",
        priority: "MEDIUM",
        position: 1,
        dueDate: addDays(today, 10),
        tags: { create: [{ tagId: launch.id }] },
      },
    }),
  ]);

  await db.note.createMany({
    data: [
      {
        userId: user.id,
        projectId: project.id,
        title: "Design ideas",
        content:
          "Keep the UI quiet. White pills for active states. No extra accent color on every card.",
        pinned: true,
      },
      {
        userId: user.id,
        projectId: project.id,
        title: "Requirements",
        content: "Projects must connect tasks, notes, and calendar events.",
      },
      {
        userId: user.id,
        projectId: project.id,
        title: "Meeting notes",
        content: "Launch review next Thursday. Decide on the homepage headline.",
      },
    ],
  });

  await db.calendarEvent.createMany({
    data: [
      {
        userId: user.id,
        projectId: project.id,
        title: "Design review",
        description: "Walk through wireframes with the team.",
        startAt: setHours(addDays(today, 2), 14),
        endAt: setHours(addDays(today, 2), 15),
      },
      {
        userId: user.id,
        projectId: project.id,
        taskId: tasks[3].id,
        title: "Launch date",
        startAt: setHours(addDays(today, 10), 9),
        endAt: setHours(addDays(today, 10), 10),
        allDay: true,
      },
    ],
  });

  await db.inboxItem.create({
    data: {
      userId: user.id,
      kind: "IDEA",
      title: "Add a weekly review template",
      body: "Capture later — don’t build it in v1.",
    },
  });

  console.log("Seeded demo workspace for demo@noto.app / noto-demo");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
