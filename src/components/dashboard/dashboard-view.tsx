"use client";

import Link from "next/link";
import { format } from "date-fns";
import { greeting } from "@/lib/utils";
import { formatDue, formatWhen } from "@/lib/dates";
import { taskStatusLabel } from "@/lib/labels";
import type { DashboardData, WorkspaceUser } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { useQuickAdd } from "@/components/quick-add/quick-add-context";

export function DashboardView({
  user,
  data,
}: {
  user: WorkspaceUser;
  data: DashboardData;
}) {
  const openQuickAdd = useQuickAdd();
  const completion =
    data.stats.total === 0 ? 0 : Math.round((data.stats.done / data.stats.total) * 100);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-24">{greeting()}, {user.name.split(" ")[0]}</h2>
          <p className="text-13 text-muted">
            {data.todayTasks.length} due today · {data.inboxCount} in inbox · {completion}% complete
          </p>
        </div>
        <Button onClick={openQuickAdd}>+ New</Button>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-14 font-medium">Today’s focus</h3>
        {data.todayTasks.length === 0 ? (
          <EmptyState
            title="Nothing due today."
            description="Pull something from the board, or capture a thought in Inbox."
            action={
              <Button asChild variant="outline">
                <Link href="/tasks">Open tasks</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border rounded-[10px] border border-border bg-surface">
            {data.todayTasks.map((task) => (
              <li key={task.id} className="flex min-h-11 items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-14">{task.title}</p>
                  <p className="text-12 text-subtle">
                    {taskStatusLabel(task.status)}
                    {task.project ? ` · ${task.project.name}` : ""}
                  </p>
                </div>
                <span className="text-12 text-muted">{formatDue(task.dueDate)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-3">
          <h3 className="text-14 font-medium">My tasks</h3>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-border bg-border sm:grid-cols-4">
            {[
              ["To do", data.stats.todo],
              ["In progress", data.stats.inProgress],
              ["Review", data.stats.review],
              ["Done", data.stats.done],
            ].map(([label, value]) => (
              <Link
                key={String(label)}
                href="/tasks"
                className="touch-row flex min-h-16 flex-col gap-1 bg-surface px-4 py-4 hover:bg-fill"
              >
                <span className="text-12 text-muted">{label}</span>
                <span className="text-24 tabular">{value}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-14 font-medium">Upcoming</h3>
          <div className="flex flex-col gap-0 rounded-[10px] border border-border bg-surface">
            {data.upcomingTasks.length === 0 && data.events.length === 0 ? (
              <p className="px-4 py-5 text-13 text-muted">No upcoming dates this week.</p>
            ) : (
              <>
                {data.events.map((event) => (
                  <Link
                    key={event.id}
                    href="/calendar"
                    className="flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-fill"
                  >
                    <span className="truncate text-14">{event.title}</span>
                    <span className="text-12 text-subtle">{formatWhen(event.startAt)}</span>
                  </Link>
                ))}
                {data.upcomingTasks.map((task) => (
                  <Link
                    key={task.id}
                    href="/tasks"
                    className="flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-fill"
                  >
                    <span className="truncate text-14">{task.title}</span>
                    <span className="text-12 text-subtle">{formatDue(task.dueDate)}</span>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-14 font-medium">Projects</h3>
          <Link href="/projects" className="text-13 text-muted hover:text-text">
            View all
          </Link>
        </div>
        {data.projects.length === 0 ? (
          <EmptyState
            title="No projects yet."
            description="A project ties tasks, notes, and dates together."
            action={
              <Button asChild>
                <Link href="/projects">Create project</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.projects.map((project) => {
              const done = project.tasks.filter((task) => task.status === "DONE").length;
              const total = project.tasks.length;
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="touch-row flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-4 hover:border-line"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: project.color }}
                    />
                    <p className="truncate text-14 font-medium">{project.name}</p>
                  </div>
                  <p className="line-clamp-2 text-13 text-muted">
                    {project.description || "No description"}
                  </p>
                  <p className="text-12 text-subtle">
                    {done}/{total} tasks · {project._count.notes} notes
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-14 font-medium">Recent notes</h3>
          <Link href="/notes" className="text-13 text-muted hover:text-text">
            View all
          </Link>
        </div>
        {data.notes.length === 0 ? (
          <EmptyState
            title="No notes yet."
            description="Write the things you need to remember."
            action={
              <Button asChild variant="outline">
                <Link href="/notes">Open notes</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="touch-row flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-4 hover:border-line"
              >
                <p className="text-14 font-medium">{note.title}</p>
                <p className="line-clamp-3 text-13 text-muted">
                  {note.content || "Empty note"}
                </p>
                <p className="text-12 text-subtle">
                  {format(note.updatedAt, "MMM d")}
                  {note.project ? ` · ${note.project.name}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
