import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getProject, getProjects } from "@/server/queries";
import { projectStatusLabel } from "@/lib/labels";
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
    getProjects(user.id),
  ]);
  if (!project) notFound();

  const done = project.tasks.filter((task) => task.status === "DONE").length;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link href="/projects" className="text-12 text-muted hover:text-text">
            Projects
          </Link>
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ background: project.color }}
            />
            <h2 className="text-24">{project.name}</h2>
            {project.favorite ? <Star className="size-4" fill="currentColor" /> : null}
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
        <h3 className="text-14 font-medium">Tasks</h3>
        <KanbanBoard
          tasks={project.tasks}
          projects={projects}
          defaultProjectId={project.id}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-14 font-medium">Notes</h3>
        <NoteList notes={project.notes} projectId={project.id} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-14 font-medium">Calendar</h3>
        <CalendarView
          events={project.events}
          tasks={project.tasks}
          projects={projects}
        />
      </section>
    </div>
  );
}
