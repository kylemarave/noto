"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty";
import { PageFill } from "@/components/layout/page";
import { INBOX_KINDS } from "@/lib/constants";
import { inboxKindLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  convertInboxItemAction,
  createInboxItemAction,
  deleteInboxItemAction,
} from "@/server/actions/inbox";
import type { InboxItemRecord, ProjectOption } from "@/server/queries";

const DESTINATIONS = [
  { id: "task", label: "Task", done: "Moved to tasks" },
  { id: "note", label: "Note", done: "Moved to notes" },
  { id: "event", label: "Event", done: "Moved to calendar" },
  { id: "project", label: "Project", done: "Moved to projects" },
] as const;

function suggestedDestination(kind: InboxItemRecord["kind"]) {
  if (kind === "NOTE") return "note";
  if (kind === "REMINDER") return "event";
  return "task";
}

export function InboxView({
  items,
  recent,
  projects,
}: {
  items: InboxItemRecord[];
  recent: InboxItemRecord[];
  projects: ProjectOption[];
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("IDEA");
  const [saving, setSaving] = useState(false);
  const [projectByItem, setProjectByItem] = useState<Record<string, string>>({});

  async function capture() {
    if (!title.trim()) return toast.error("Give it a title first.");
    setSaving(true);
    try {
      const result = await createInboxItemAction({
        title,
        body,
        kind: kind as InboxItemRecord["kind"],
      });
      if ("error" in result) return toast.error(result.error);
      toast.success("Captured");
      setTitle("");
      setBody("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageFill className="gap-8 lg:flex-row lg:items-stretch lg:gap-0">
      <section className="flex w-full shrink-0 flex-col gap-3 lg:w-80 lg:border-r lg:border-border lg:pr-8">
        <h2 className="text-13 font-medium text-muted">Capture</h2>
        <Field label="What’s on your mind">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Dump it here, organize later"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void capture();
              }
            }}
          />
        </Field>
        <Field label="Details">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
            className="min-h-32"
          />
        </Field>
        <div className="flex items-center gap-2">
          <Select
            className="w-36 shrink-0"
            value={kind}
            onValueChange={setKind}
            options={INBOX_KINDS.map((item) => ({
              value: item.id,
              label: item.label,
            }))}
          />
          <Button className="shrink-0" onClick={() => void capture()} disabled={saving}>
            {saving ? "Adding…" : "Add to inbox"}
          </Button>
        </div>
      </section>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-8 lg:pl-10">
        <section className="flex min-h-0 flex-1 flex-col gap-3">
          <h2 className="text-13 font-medium text-muted">
            Unsorted{items.length > 0 ? ` · ${items.length}` : ""}
          </h2>
          {items.length === 0 ? (
            <EmptyState
              title="Inbox is clear."
              description="Capture a task, idea, note, or reminder without filing it yet."
              className="border-t-0 px-0 py-2"
            />
          ) : (
            <ul className="-mx-2 min-h-0 flex-1 overflow-y-auto">
              {items.map((item) => (
                <InboxRow
                  key={item.id}
                  item={item}
                  projects={projects}
                  projectId={projectByItem[item.id] ?? ""}
                  onProjectChange={(value) =>
                    setProjectByItem((current) => ({ ...current, [item.id]: value }))
                  }
                />
              ))}
            </ul>
          )}
        </section>

        {recent.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-13 font-medium text-muted">Recently filed</h2>
            <ul className="-mx-2 flex flex-col">
              {recent.map((item) => (
                <li
                  key={item.id}
                  className="flex items-baseline justify-between gap-3 border-b border-border px-2 py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-14">{item.title}</p>
                    <p className="text-12 text-subtle">
                      {inboxKindLabel(item.kind)}
                      {item.body ? ` · ${item.body}` : ""}
                    </p>
                  </div>
                  <span className="tabular shrink-0 text-12 text-subtle">
                    {format(item.updatedAt, "MMM d")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </PageFill>
  );
}

function InboxRow({
  item,
  projects,
  projectId,
  onProjectChange,
}: {
  item: InboxItemRecord;
  projects: ProjectOption[];
  projectId: string;
  onProjectChange: (value: string) => void;
}) {
  const suggested = useMemo(() => suggestedDestination(item.kind), [item.kind]);
  const [busy, setBusy] = useState<string | null>(null);

  async function file(destination: (typeof DESTINATIONS)[number]["id"]) {
    setBusy(destination);
    try {
      const result = await convertInboxItemAction(
        item.id,
        destination,
        destination === "project" ? null : projectId || null,
      );
      if (result && "error" in result) toast.error(result.error);
      else {
        const dest = DESTINATIONS.find((entry) => entry.id === destination);
        toast.success(dest?.done ?? "Filed");
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="flex flex-col gap-2.5 border-b border-border py-4 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 flex-1 text-14 font-medium">{item.title}</p>
        <span className="shrink-0 text-12 text-subtle">
          {inboxKindLabel(item.kind)} · {format(item.createdAt, "MMM d")}
        </span>
      </div>
      {item.body ? <p className="text-13 text-muted">{item.body}</p> : null}
      {projects.length > 0 ? (
        <Select
          className="max-w-xs"
          value={projectId || "none"}
          onValueChange={(value) => onProjectChange(value === "none" ? "" : value)}
          options={[
            { value: "none", label: "No project" },
            ...projects.map((project) => ({
              value: project.id,
              label: project.name,
            })),
          ]}
        />
      ) : null}
      <div className="-ml-2 flex flex-wrap items-center gap-1">
        {DESTINATIONS.map((destination) => (
          <Button
            key={destination.id}
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy !== null}
            className={cn(
              destination.id === suggested ? "text-text" : "text-muted",
            )}
            onClick={() => void file(destination.id)}
          >
            {busy === destination.id ? "Filing…" : destination.label}
            {destination.id === suggested ? " · suggested" : ""}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy !== null}
          className="ml-auto text-subtle hover:text-danger"
          onClick={async () => {
            await deleteInboxItemAction(item.id);
            toast.success("Removed");
          }}
        >
          Dismiss
        </Button>
      </div>
    </li>
  );
}
