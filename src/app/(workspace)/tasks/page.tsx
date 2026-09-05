import { KanbanBoard } from "@/components/tasks/kanban-board";
import { requireUser } from "@/lib/auth";
import { getProjectOptions, getTasks } from "@/server/queries";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const { status } = await searchParams;
  const [tasks, projects] = await Promise.all([
    getTasks(user.id),
    getProjectOptions(user.id),
  ]);
  return (
    <KanbanBoard
      tasks={tasks}
      projects={projects}
      initialStatus={status}
    />
  );
}
