import { SettingsForm } from "@/components/settings/settings-form";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireUser();
  return <SettingsForm user={user} />;
}
