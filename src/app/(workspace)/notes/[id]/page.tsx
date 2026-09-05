import { notFound } from "next/navigation";
import { NotesWorkspace } from "@/components/notes/notes-workspace";
import { requireUser } from "@/lib/auth";
import { getNote, getNotes, getProjectOptions } from "@/server/queries";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [note, notes, projects] = await Promise.all([
    getNote(user.id, id),
    getNotes(user.id, { archived: "all" }),
    getProjectOptions(user.id),
  ]);
  if (!note) notFound();
  return (
    <NotesWorkspace
      notes={notes}
      projects={projects}
      selected={note}
      variant="detail"
    />
  );
}
