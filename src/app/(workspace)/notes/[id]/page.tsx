import { notFound } from "next/navigation";
import { NoteEditor } from "@/components/notes/note-editor";
import { requireUser } from "@/lib/auth";
import { getNote, getProjectOptions } from "@/server/queries";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [note, projects] = await Promise.all([
    getNote(user.id, id),
    getProjectOptions(user.id),
  ]);
  if (!note) notFound();
  return <NoteEditor note={note} projects={projects} />;
}
