import { InboxView } from "@/components/inbox/inbox-view";
import { requireUser } from "@/lib/auth";
import { getInbox } from "@/server/queries";

export default async function InboxPage() {
  const user = await requireUser();
  const items = await getInbox(user.id);
  return <InboxView items={items} />;
}
