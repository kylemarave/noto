import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireUser } from "@/lib/auth";
import { getDashboard } from "@/server/queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboard(user.id);
  return <DashboardView user={user} data={data} />;
}
