import { InboxView } from "@/components/inbox/inbox-view";
import { requireUser } from "@/lib/auth";
import { getInbox, getProjectOptions, getRecentInbox } from "@/server/queries";

export default async function InboxPage() {
  const user = await requireUser();
  const [items, recent, projects] = await Promise.all([
    getInbox(user.id),
    getRecentInbox(user.id),
    getProjectOptions(user.id),
  ]);
  return <InboxView items={items} recent={recent} projects={projects} />;
}
