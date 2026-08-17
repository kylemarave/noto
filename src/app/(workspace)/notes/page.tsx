import { NoteList } from "@/components/notes/note-list";
import { requireUser } from "@/lib/auth";
import { getNotes } from "@/server/queries";

export default async function NotesPage() {
  const user = await requireUser();
  const notes = await getNotes(user.id);
  return <NoteList notes={notes} />;
}
