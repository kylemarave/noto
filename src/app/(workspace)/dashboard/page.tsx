import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireUser } from "@/lib/auth";
import { getDashboard, getProjects } from "@/server/queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const [data, projects] = await Promise.all([
    getDashboard(user.id),
    getProjects(user.id),
  ]);

  return <DashboardView user={user} data={data} projects={projects} />;
}
