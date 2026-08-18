import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { getFavorites, getInboxCount, getProjectOptions } from "@/server/queries";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [favorites, inboxCount, projects] = await Promise.all([
    getFavorites(user.id),
    getInboxCount(user.id),
    getProjectOptions(user.id),
  ]);

  return (
    <AppShell
      user={user}
      favorites={favorites}
      inboxCount={inboxCount}
      projects={projects}
    >
      {children}
    </AppShell>
  );
}
