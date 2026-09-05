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
import type { NoteWithRelations, ProjectOption } from "@/server/queries";

export function NoteEditor({
  note,
  projects,
}: {
  note: NoteWithRelations;
  projects: ProjectOption[];
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
    <div className="flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-5">
      <div className="-ml-2.5 flex flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await togglePinNoteAction(note.id);
            toast.success(note.pinned ? "Note unpinned" : "Note pinned");
          }}
        >
          {note.pinned ? "Unpin" : "Pin"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await toggleArchiveNoteAction(note.id);
            toast.success(note.archived ? "Note restored" : "Note archived");
            router.push("/notes");
          }}
        >
          {note.archived ? "Restore" : "Archive"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
          Delete
        </Button>
        <Button size="sm" className="ml-auto" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="min-h-11 w-full bg-transparent text-24 outline-none placeholder:text-subtle"
        placeholder="Untitled note"
        aria-label="Note title"
      />
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="min-h-48 resize-y bg-transparent px-0 py-0 text-14 leading-relaxed hover:bg-transparent"
        placeholder="Start writing."
        aria-label="Note body"
        rows={10}
      />
      <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <Field label="Project">
          <Select
            className="w-48"
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
            className="w-48"
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
