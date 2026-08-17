"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TASK_COLUMNS, TASK_PRIORITIES } from "@/lib/constants";
import { toDateInput } from "@/lib/dates";
import { createTaskAction, deleteTaskAction, updateTaskAction } from "@/server/actions/tasks";
import type { ProjectListItem, TaskWithRelations } from "@/server/queries";

export function TaskDialog({
  open,
  onOpenChange,
  task,
  projects,
  defaultStatus,
  defaultProjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithRelations | null;
  projects: ProjectListItem[];
  defaultStatus?: string;
  defaultProjectId?: string;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(defaultStatus ?? "TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [tags, setTags] = useState("");
  const [subtasks, setSubtasks] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setStatus(task?.status ?? defaultStatus ?? "TODO");
    setPriority(task?.priority ?? "MEDIUM");
    setDueDate(toDateInput(task?.dueDate));
    setProjectId(task?.projectId ?? defaultProjectId ?? "");
    setTags(task?.tags.map((item) => item.tag.name).join(", ") ?? "");
    setSubtasks(task?.subtasks.map((item) => item.title).join("\n") ?? "");
  }, [open, task, defaultStatus, defaultProjectId]);

  async function save() {
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        status: status as TaskWithRelations["status"],
        priority: priority as TaskWithRelations["priority"],
        dueDate: dueDate || null,
        projectId: projectId || null,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        subtasks: task
          ? subtasks
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, index) => ({
                title: line,
                completed: task.subtasks[index]?.completed ?? false,
              }))
          : subtasks.split("\n"),
      };
      const result = task
        ? await updateTaskAction({ id: task.id, ...payload, subtasks: payload.subtasks as { title: string; completed: boolean }[] })
        : await createTaskAction({
            ...payload,
            subtasks: payload.subtasks as string[],
          });
      if ("error" in result) return toast.error(result.error);
      toast.success(task ? "Task updated" : "Task created");
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          title={task ? "Edit task" : "New task"}
          description="Keep it specific enough to start."
        >
          <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin">
            <Field label="Title">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </Field>
            <Field label="Description">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <Select
                  value={status}
                  onValueChange={setStatus}
                  options={TASK_COLUMNS.map((column) => ({
                    value: column.id,
                    label: column.label,
                  }))}
                />
              </Field>
              <Field label="Priority">
                <Select
                  value={priority}
                  onValueChange={setPriority}
                  options={TASK_PRIORITIES.map((item) => ({
                    value: item.id,
                    label: item.label,
                  }))}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Due date">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </Field>
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
            </div>
            <Field label="Tags">
              <Input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="design, launch"
              />
            </Field>
            <Field label="Subtasks">
              <Textarea
                value={subtasks}
                onChange={(event) => setSubtasks(event.target.value)}
                placeholder="One per line"
              />
            </Field>
            <div className="flex items-center justify-between pt-1">
              {task ? (
                <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
                  Delete
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={() => void save()} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this task?"
        description="This cannot be undone."
        onConfirm={async () => {
          if (!task) return;
          const result = await deleteTaskAction(task.id);
          if (result && "error" in result) toast.error(result.error);
          else toast.success("Task deleted");
          setConfirmOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
