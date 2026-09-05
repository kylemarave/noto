import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getProject, getProjectOptions } from "@/server/queries";
import { projectStatusLabel } from "@/lib/labels";
import { monoTint } from "@/lib/utils";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { NoteList } from "@/components/notes/note-list";
import { CalendarView } from "@/components/calendar/calendar-view";
import { ProjectActions } from "@/components/projects/project-actions";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [project, projects] = await Promise.all([
    getProject(user.id, id),
    getProjectOptions(user.id),
  ]);
  if (!project) notFound();

  const done = project.tasks.filter((task) => task.status === "DONE").length;

  return (
    <div className="flex w-full flex-col gap-10">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/projects"
            className="text-12 text-subtle transition-colors hover:text-text"
          >
            Projects
          </Link>
          <div className="flex items-center gap-2.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: monoTint(project.color) }}
            />
            <h2 className="text-24">{project.name}</h2>
            {project.favorite ? (
              <Star className="size-3.5 text-subtle" fill="currentColor" aria-label="Favorite" />
            ) : null}
          </div>
          <p className="max-w-2xl text-13 text-muted">
            {project.description || "No description"}
          </p>
          <p className="text-12 text-subtle">
            {projectStatusLabel(project.status)} · {done}/{project.tasks.length} tasks ·{" "}
            {project.notes.length} notes · {project.events.length} events
          </p>
        </div>
        <ProjectActions project={project} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-13 font-medium text-muted">Tasks</h3>
        <KanbanBoard
          tasks={project.tasks}
          projects={projects}
          defaultProjectId={project.id}
          fill={false}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-13 font-medium text-muted">Notes</h3>
        <NoteList notes={project.notes} projectId={project.id} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-13 font-medium text-muted">Calendar</h3>
        <CalendarView
          events={project.events}
          tasks={project.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
          }))}
          projects={projects}
          fill={false}
        />
      </section>
    </div>
  );
}
