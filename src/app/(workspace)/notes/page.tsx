import { NotesWorkspace } from "@/components/notes/notes-workspace";
import { requireUser } from "@/lib/auth";
import { getNotes, getProjectOptions } from "@/server/queries";

export default async function NotesPage() {
  const user = await requireUser();
  const [notes, projects] = await Promise.all([
    getNotes(user.id, { archived: "all" }),
    getProjectOptions(user.id),
  ]);
  const selected = notes.find((note) => !note.archived) ?? notes[0] ?? null;
  return (
    <NotesWorkspace notes={notes} projects={projects} selected={selected} />
  );
}
