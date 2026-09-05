"use client";

import Link from "next/link";
import { format } from "date-fns";
import { greeting, monoTint } from "@/lib/utils";
import { formatDue, formatWhen, isOverdue } from "@/lib/dates";
import { inboxKindLabel, taskStatusLabel } from "@/lib/labels";
import type { DashboardData, WorkspaceUser } from "@/server/queries";
import { useQuickAdd } from "@/components/quick-add/quick-add-context";
import {
  InlineEmpty,
  List,
  Page,
  Row,
  Section,
  StatStrip,
  TextAction,
} from "@/components/layout/page";

const BOARD_COUNTS = [
  { label: "To do", key: "todo" as const, href: "/tasks?status=TODO" },
  { label: "In progress", key: "inProgress" as const, href: "/tasks?status=IN_PROGRESS" },
  { label: "Review", key: "review" as const, href: "/tasks?status=REVIEW" },
  { label: "Done", key: "done" as const, href: "/tasks?status=DONE" },
];

export function DashboardView({
  user,
  data,
}: {
  user: WorkspaceUser;
  data: DashboardData;
}) {
  const openQuickAdd = useQuickAdd();
  const open = data.stats.total - data.stats.done;
  const firstName = user.name.split(" ")[0];

  return (
    <Page>
      <header className="flex flex-col gap-1">
        <h2 className="text-24">
          {greeting()}, {firstName}
        </h2>
        <p className="text-13 text-subtle">
          {open === 0
            ? "Everything is closed out."
            : "What needs you today, then the rest of the workspace."}
        </p>
      </header>

      <StatStrip
        items={[
          { label: "Open", value: open, href: "/tasks" },
          {
            label: "Overdue",
            value: data.overdueTasks.length,
            href: "/tasks?status=TODO",
            alert: true,
          },
          { label: "Due today", value: data.todayTasks.length, href: "/tasks" },
          { label: "Inbox", value: data.inboxCount, href: "/inbox" },
        ]}
      />

      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          {data.overdueTasks.length > 0 ? (
            <Section
              title={`Overdue · ${data.overdueTasks.length}`}
              action={{ href: "/tasks?status=TODO", label: "Open board" }}
              tone="alert"
            >
              <List>
                {data.overdueTasks.map((task) => (
                  <Row
                    key={task.id}
                    href="/tasks?status=TODO"
                    title={task.title}
                    meta={`${taskStatusLabel(task.status)}${task.project ? ` · ${task.project.name}` : ""}`}
                    trailing={formatDue(task.dueDate)}
                    alert
                  />
                ))}
              </List>
            </Section>
          ) : null}

          <Section title="Today" tone="emphasis">
            {data.todayTasks.length === 0 ? (
              <InlineEmpty>
                Nothing is due today. Capture something in{" "}
                <Link
                  href="/inbox"
                  className="text-text underline-offset-4 hover:underline"
                >
                  Inbox
                </Link>{" "}
                or open the{" "}
                <Link
                  href="/tasks"
                  className="text-text underline-offset-4 hover:underline"
                >
                  board
                </Link>
                .
              </InlineEmpty>
            ) : (
              <List>
                {data.todayTasks.map((task) => (
                  <Row
                    key={task.id}
                    href="/tasks"
                    title={task.title}
                    meta={`${taskStatusLabel(task.status)}${task.project ? ` · ${task.project.name}` : ""}`}
                    trailing={formatDue(task.dueDate)}
                    alert={isOverdue(task.dueDate)}
                  />
                ))}
              </List>
            )}
          </Section>

          <Section title="Upcoming">
            {data.upcomingTasks.length === 0 && data.events.length === 0 ? (
              <InlineEmpty>No dates in the next seven days.</InlineEmpty>
            ) : (
              <List>
                {data.events.map((event) => (
                  <Row
                    key={event.id}
                    href="/calendar"
                    title={event.title}
                    meta={event.project?.name}
                    trailing={formatWhen(event.startAt)}
                  />
                ))}
                {data.upcomingTasks.map((task) => (
                  <Row
                    key={task.id}
                    href="/tasks"
                    title={task.title}
                    meta={task.project?.name}
                    trailing={formatDue(task.dueDate)}
                  />
                ))}
              </List>
            )}
          </Section>

          <Section title="Unscheduled">
            {data.unscheduledTasks.length === 0 ? (
              <InlineEmpty>Every open task has a date.</InlineEmpty>
            ) : (
              <List>
                {data.unscheduledTasks.map((task) => (
                  <Row
                    key={task.id}
                    href="/tasks"
                    title={task.title}
                    meta={`${taskStatusLabel(task.status)}${task.project ? ` · ${task.project.name}` : ""}`}
                    trailing="No date"
                  />
                ))}
              </List>
            )}
          </Section>

          <Section title="Board" action={{ href: "/tasks", label: "Open board" }}>
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {BOARD_COUNTS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-baseline gap-2 rounded-md py-1 transition-colors hover:opacity-80"
                >
                  <dd className="tabular text-14 font-medium">{data.stats[item.key]}</dd>
                  <dt className="text-13 text-subtle">{item.label}</dt>
                </Link>
              ))}
            </dl>
          </Section>
        </div>

        <div className="flex min-w-0 flex-col gap-8">
          <Section
            title={data.inboxCount > 0 ? `Inbox · ${data.inboxCount}` : "Inbox"}
            action={{ href: "/inbox", label: "Open inbox" }}
            tone={data.inboxCount > 0 ? "emphasis" : "default"}
          >
            {data.inboxPreview.length === 0 ? (
              <InlineEmpty>Inbox is clear.</InlineEmpty>
            ) : (
              <List>
                {data.inboxPreview.map((item) => (
                  <Row
                    key={item.id}
                    href="/inbox"
                    title={item.title}
                    meta={item.body || inboxKindLabel(item.kind)}
                    trailing="File"
                  />
                ))}
              </List>
            )}
          </Section>

          <Section
            title="Projects"
            action={{ href: "/projects", label: "All projects" }}
          >
            {data.projects.length === 0 ? (
              <InlineEmpty>
                A project ties tasks, notes, and dates together.{" "}
                <TextAction onClick={openQuickAdd}>Create one</TextAction>.
              </InlineEmpty>
            ) : (
              <List>
                {data.projects.map((project) => {
                  const done = project.tasks.filter(
                    (task) => task.status === "DONE",
                  ).length;
                  return (
                    <Row
                      key={project.id}
                      href={`/projects/${project.id}`}
                      title={project.name}
                      meta={project.description || undefined}
                      trailing={`${done}/${project.tasks.length}`}
                      leading={
                        <span
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ background: monoTint(project.color) }}
                        />
                      }
                    />
                  );
                })}
              </List>
            )}
          </Section>

          <Section title="Notes" action={{ href: "/notes", label: "All notes" }}>
            {data.notes.length === 0 ? (
              <InlineEmpty>Write the things you need to remember.</InlineEmpty>
            ) : (
              <List>
                {data.notes.map((note) => (
                  <Row
                    key={note.id}
                    href={`/notes/${note.id}`}
                    title={note.title}
                    meta={note.content || "Empty note"}
                    trailing={format(note.updatedAt, "MMM d")}
                  />
                ))}
              </List>
            )}
          </Section>
        </div>
      </div>
    </Page>
  );
}
