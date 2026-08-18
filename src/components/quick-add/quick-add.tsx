"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createTaskAction } from "@/server/actions/tasks";
import { createNoteAction } from "@/server/actions/notes";
import { createEventAction } from "@/server/actions/events";
import { createProjectAction } from "@/server/actions/projects";
import { createInboxItemAction } from "@/server/actions/inbox";
import type { ProjectOption } from "@/server/queries";
import { actionId, showActionError } from "@/lib/action-result";

const TYPES = [
  { value: "task", label: "Task" },
  { value: "note", label: "Note" },
  { value: "event", label: "Event" },
  { value: "project", label: "Project" },
  { value: "inbox", label: "Inbox capture" },
];

export function QuickAdd({
  open,
  onOpenChange,
  projects,
  defaultType = "task",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectOption[];
  defaultType?: string;
}) {
  const router = useRouter();
  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      if (type === "task") {
        const result = await createTaskAction({
          title,
          description: body,
          projectId: projectId || null,
        });
        if (showActionError(result)) return;
        toast.success("Task created");
        router.push("/tasks");
      } else if (type === "note") {
        const result = await createNoteAction({
          title,
          content: body,
          projectId: projectId || null,
        });
        if (showActionError(result)) return;
        toast.success("Note saved");
        const noteId = actionId(result);
        if (noteId) router.push(`/notes/${noteId}`);
      } else if (type === "project") {
        const result = await createProjectAction({ name: title, description: body });
        if (showActionError(result)) return;
        toast.success("Project created");
        const projectIdCreated = actionId(result);
        if (projectIdCreated) router.push(`/projects/${projectIdCreated}`);
      } else if (type === "event") {
        const start = new Date();
        start.setMinutes(0, 0, 0);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);
        const result = await createEventAction({
          title,
          description: body,
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          projectId: projectId || null,
        });
        if (showActionError(result)) return;
        toast.success("Event created");
        router.push("/calendar");
      } else {
        const result = await createInboxItemAction({ title, body });
        if (showActionError(result)) return;
        toast.success("Captured in Inbox");
        router.push("/inbox");
      }
      setTitle("");
      setBody("");
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) setType(defaultType);
      }}
    >
      <DialogContent title="Quick add" description="Create without leaving this page.">
        <div className="flex flex-col gap-3">
          <Field label="Type">
            <Select value={type} onValueChange={setType} options={TYPES} />
          </Field>
          <Field label="Title">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={type === "inbox" ? "Dump a thought" : "Name it"}
              autoFocus
            />
          </Field>
          {type !== "project" ? (
            <Field label={type === "note" ? "Body" : "Details"}>
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
              />
            </Field>
          ) : (
            <Field label="Description">
              <Textarea value={body} onChange={(event) => setBody(event.target.value)} />
            </Field>
          )}
          {type !== "project" && type !== "inbox" ? (
            <Field label="Project">
              <Select
                value={projectId || "none"}
                onValueChange={(value) => setProjectId(value === "none" ? "" : value)}
                options={[
                  { value: "none", label: "No project" },
                  ...projects.map((project) => ({
                    value: project.id,
                    label: project.name,
                  })),
                ]}
              />
            </Field>
          ) : null}
          <div className="mt-1 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={saving}>
              {saving ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
