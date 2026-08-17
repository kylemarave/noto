"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { INBOX_KINDS } from "@/lib/constants";
import { inboxKindLabel } from "@/lib/labels";
import {
  convertInboxItemAction,
  createInboxItemAction,
  deleteInboxItemAction,
} from "@/server/actions/inbox";
import type { InboxItemRecord } from "@/server/queries";

export function InboxView({ items }: { items: InboxItemRecord[] }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("IDEA");

  async function capture() {
    const result = await createInboxItemAction({
      title,
      body,
      kind: kind as InboxItemRecord["kind"],
    });
    if ("error" in result) return toast.error(result.error);
    toast.success("Captured");
    setTitle("");
    setBody("");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-4">
        <h2 className="text-14 font-medium">Capture</h2>
        <p className="text-13 text-muted">
          Dump it here. Organize it later.
        </p>
        <Field label="What’s on your mind">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="Details">
          <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} />
        </Field>
        <div className="flex items-center gap-2">
          <Select
            className="max-w-40"
            value={kind}
            onValueChange={setKind}
            options={INBOX_KINDS.map((item) => ({ value: item.id, label: item.label }))}
          />
          <Button onClick={() => void capture()}>Add to inbox</Button>
        </div>
      </section>

      {items.length === 0 ? (
        <EmptyState
          title="Inbox is clear."
          description="Capture a task, idea, note, or reminder without filing it yet."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-14 font-medium">{item.title}</p>
                  {item.body ? (
                    <p className="mt-1 text-13 text-muted">{item.body}</p>
                  ) : null}
                </div>
                <Badge>{inboxKindLabel(item.kind)}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-auto text-12 text-subtle">
                  {format(item.createdAt, "MMM d, h:mm a")}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const result = await convertInboxItemAction(item.id, "task");
                    if (result && "error" in result) toast.error(result.error);
                    else toast.success("Moved to tasks");
                  }}
                >
                  Task
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const result = await convertInboxItemAction(item.id, "note");
                    if (result && "error" in result) toast.error(result.error);
                    else toast.success("Moved to notes");
                  }}
                >
                  Note
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const result = await convertInboxItemAction(item.id, "event");
                    if (result && "error" in result) toast.error(result.error);
                    else toast.success("Moved to calendar");
                  }}
                >
                  Event
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const result = await convertInboxItemAction(item.id, "project");
                    if (result && "error" in result) toast.error(result.error);
                    else toast.success("Moved to projects");
                  }}
                >
                  Project
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await deleteInboxItemAction(item.id);
                    toast.success("Removed");
                  }}
                >
                  Dismiss
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
