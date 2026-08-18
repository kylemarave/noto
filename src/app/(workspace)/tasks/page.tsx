import { KanbanBoard } from "@/components/tasks/kanban-board";
import { requireUser } from "@/lib/auth";
import { getProjectOptions, getTasks } from "@/server/queries";

export default async function TasksPage() {
  const user = await requireUser();
  const [tasks, projects] = await Promise.all([
    getTasks(user.id),
    getProjectOptions(user.id),
  ]);
  return <KanbanBoard tasks={tasks} projects={projects} />;
}
