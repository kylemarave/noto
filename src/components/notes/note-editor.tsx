"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  deleteNoteAction,
  toggleArchiveNoteAction,
  togglePinNoteAction,
  updateNoteAction,
} from "@/server/actions/notes";
import type { NoteWithRelations, ProjectListItem } from "@/server/queries";

export function NoteEditor({
  note,
  projects,
}: {
  note: NoteWithRelations;
  projects: ProjectListItem[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [projectId, setProjectId] = useState(note.projectId ?? "");
  const [tags, setTags] = useState(note.tags.map((item) => item.tag.name).join(", "));
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setProjectId(note.projectId ?? "");
    setTags(note.tags.map((item) => item.tag.name).join(", "));
  }, [note]);

  async function save() {
    setSaving(true);
    try {
      const result = await updateNoteAction({
        id: note.id,
        title,
        content,
        projectId: projectId || null,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      if ("error" in result) return toast.error(result.error);
      toast.success("Note saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          onClick={async () => {
            await togglePinNoteAction(note.id);
            toast.success(note.pinned ? "Note unpinned" : "Note pinned");
          }}
        >
          {note.pinned ? "Unpin" : "Pin"}
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            await toggleArchiveNoteAction(note.id);
            toast.success(note.archived ? "Note restored" : "Note archived");
            router.push("/notes");
          }}
        >
          {note.archived ? "Restore" : "Archive"}
        </Button>
        <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
          Delete
        </Button>
        <Button className="ml-auto" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="bg-transparent text-24 outline-none"
        placeholder="Untitled note"
      />
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="min-h-[420px] border-0 bg-transparent px-0 py-0"
        placeholder="Write freely. A richer editor can replace this later."
      />
      <div className="grid gap-3 border-t border-border pt-4 md:grid-cols-2">
        <Field label="Project">
          <Select
            value={projectId || "none"}
            onValueChange={(value) => setProjectId(value === "none" ? "" : value)}
            options={[
              { value: "none", label: "No project" },
              ...projects.map((project) => ({ value: project.id, label: project.name })),
            ]}
          />
        </Field>
        <Field label="Tags">
          <Input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="ideas, research"
          />
        </Field>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this note?"
        description="This cannot be undone."
        onConfirm={async () => {
          const result = await deleteNoteAction(note.id);
          if (result && "error" in result) toast.error(result.error);
          else {
            toast.success("Note deleted");
            router.push("/notes");
          }
        }}
      />
    </div>
  );
}
