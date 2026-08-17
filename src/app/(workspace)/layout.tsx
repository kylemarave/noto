import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { getFavorites, getInbox, getProjects } from "@/server/queries";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [favorites, inbox, projects] = await Promise.all([
    getFavorites(user.id),
    getInbox(user.id),
    getProjects(user.id),
  ]);

  return (
    <AppShell
      user={user}
      favorites={favorites}
      inboxCount={inbox.length}
      projects={projects}
    >
      {children}
    </AppShell>
  );
}
