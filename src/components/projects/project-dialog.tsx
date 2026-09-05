"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogActions, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { PROJECT_COLORS, PROJECT_STATUSES } from "@/lib/constants";
import { createProjectAction, updateProjectAction } from "@/server/actions/projects";
import { cn } from "@/lib/utils";
import type { ProjectListItem } from "@/server/queries";
import { useRouter } from "next/navigation";

export function ProjectDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Pick<ProjectListItem, "id" | "name" | "description" | "status" | "color"> | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [color, setColor] = useState("#FFFFFF");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setStatus(project?.status ?? "ACTIVE");
    setColor(project?.color ?? "#FFFFFF");
  }, [open, project]);

  async function save() {
    setSaving(true);
    try {
      const payload = {
        name,
        description,
        status: status as ProjectListItem["status"],
        color,
      };
      const result = project
        ? await updateProjectAction({ id: project.id, ...payload })
        : await createProjectAction(payload);
      if ("error" in result) return toast.error(result.error);
      toast.success(project ? "Project updated" : "Project created");
      onOpenChange(false);
      if (!project && "id" in result && result.id) router.push(`/projects/${result.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={project ? "Edit project" : "New project"}>
        <div className="flex flex-col gap-3">
          <Field label="Name">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          <Field label="Status">
            <Select
              value={status}
              onValueChange={setStatus}
              options={PROJECT_STATUSES.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
            />
          </Field>
          <Field label="Color">
            <div className="-ml-2.5 flex flex-wrap">
              {PROJECT_COLORS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-md"
                  aria-label={`Tone ${value}`}
                  aria-pressed={color === value}
                >
                  <span
                    className={cn(
                      "size-4 rounded-full transition-shadow",
                      color === value &&
                        "ring-2 ring-text ring-offset-2 ring-offset-surface",
                    )}
                    style={{ background: value }}
                  />
                </button>
              ))}
            </div>
          </Field>
          <DialogActions>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogActions>
        </div>
      </DialogContent>
    </Dialog>
  );
}
