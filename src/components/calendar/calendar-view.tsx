"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  startOfDay,
} from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageFill, Toolbar } from "@/components/layout/page";
import { Dialog, DialogActions, DialogContent } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toDateTimeInput } from "@/lib/dates";
import {
  createEventAction,
  deleteEventAction,
  updateEventAction,
} from "@/server/actions/events";
import type { CalendarTask, EventRecord, ProjectOption } from "@/server/queries";
import { cn } from "@/lib/utils";

type View = "month" | "week" | "day";
type CalendarItem = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  kind: "event" | "task";
  event?: EventRecord;
};

export function CalendarView({
  events,
  tasks,
  projects,
  fill = true,
}: {
  events: EventRecord[];
  tasks: CalendarTask[];
  projects: ProjectOption[];
  fill?: boolean;
}) {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventRecord | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items = useMemo<CalendarItem[]>(() => {
    const eventItems: CalendarItem[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      startAt: event.startAt,
      endAt: event.endAt,
      kind: "event",
      event,
    }));
    const taskItems: CalendarItem[] = tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        startAt: task.dueDate as Date,
        endAt: task.dueDate as Date,
        kind: "task",
      }));
    return [...eventItems, ...taskItems];
  }, [events, tasks]);

  const days = useMemo(() => {
    if (view === "day") return [startOfDay(cursor)];
    if (view === "week") {
      const start = startOfWeek(cursor, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end: endOfWeek(cursor, { weekStartsOn: 1 }) });
    }
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor, view]);

  function shift(direction: number) {
    if (view === "month") setCursor(addMonths(cursor, direction));
    else if (view === "week") setCursor(addDays(cursor, direction * 7));
    else setCursor(addDays(cursor, direction));
  }

  const calendar = (
    <>
      <Toolbar>
        <p className="w-full text-24 sm:mr-auto sm:w-auto">
          {format(cursor, view === "month" ? "MMMM yyyy" : "MMM d, yyyy")}
        </p>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" onClick={() => shift(-1)} aria-label="Previous">
            Prev
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={() => shift(1)} aria-label="Next">
            Next
          </Button>
        </div>
        <div className="flex gap-0.5 rounded-md bg-fill p-0.5">
          {(["month", "week", "day"] as View[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              aria-pressed={view === item}
              className={cn(
                "h-8 cursor-pointer rounded-sm px-3 text-12 font-medium capitalize transition-colors",
                view === item ? "inverse" : "text-muted hover:text-text",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </Toolbar>

      <div className="min-h-0 flex-1 overflow-x-auto overscroll-x-contain rounded-lg scrollbar-thin">
        <div
          className={cn(
            "grid h-full min-h-[28rem] min-w-[36rem] gap-px overflow-hidden rounded-lg border border-border bg-border md:min-w-0",
            view === "month"
              ? "grid-cols-7 grid-rows-[auto_repeat(6,minmax(4.5rem,1fr))]"
              : view === "week"
                ? "grid-cols-7 grid-rows-[auto_minmax(12rem,1fr)]"
                : "grid-cols-1",
          )}
        >
        {view !== "day"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="bg-surface px-3 py-2 text-12 text-subtle">
                {day}
              </div>
            ))
          : null}
        {days.map((day) => {
          const dayItems = items.filter((item) => isSameDay(item.startAt, day));
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => {
                setCursor(day);
                setEditing(null);
                setOpen(true);
              }}
              className={cn(
                "flex min-h-0 cursor-pointer flex-col gap-1 bg-surface p-2 text-left transition-colors hover:bg-fill",
                view === "month" && !isSameMonth(day, cursor) && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "tabular flex size-5 items-center justify-center rounded-full text-12",
                  isSameDay(day, new Date()) ? "inverse font-medium" : "text-subtle",
                )}
              >
                {format(day, "d")}
              </span>
              {dayItems.slice(0, view === "month" ? 3 : 8).map((item) => (
                <span
                  key={item.id}
                  className={cn(
                    "truncate rounded-sm px-1.5 py-1 text-12",
                    item.kind === "task"
                      ? "text-subtle ring-1 ring-border ring-inset"
                      : "bg-fill-strong text-text",
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (item.event) {
                      setEditing(item.event);
                      setOpen(true);
                    }
                  }}
                >
                  {item.kind === "task" ? "Due · " : ""}
                  {item.title}
                </span>
              ))}
              {dayItems.length > (view === "month" ? 3 : 8) ? (
                <span className="px-1.5 text-12 text-subtle">
                  +{dayItems.length - (view === "month" ? 3 : 8)} more
                </span>
              ) : null}
            </button>
          );
        })}
        </div>
      </div>

      <EventDialog
        open={open}
        onOpenChange={setOpen}
        event={editing}
        projects={projects}
        tasks={tasks}
        defaultStart={cursor}
        onDelete={() => setConfirmOpen(true)}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this event?"
        description="This cannot be undone."
        onConfirm={async () => {
          if (!editing) return;
          const result = await deleteEventAction(editing.id);
          if (result && "error" in result) toast.error(result.error);
          else toast.success("Event deleted");
          setConfirmOpen(false);
          setOpen(false);
        }}
      />
    </>
  );

  if (fill) {
    return <PageFill className="gap-4">{calendar}</PageFill>;
  }

  return <div className="flex min-h-[28rem] flex-col gap-4">{calendar}</div>;
}

function EventDialog({
  open,
  onOpenChange,
  event,
  projects,
  tasks,
  defaultStart,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventRecord | null;
  projects: ProjectOption[];
  tasks: CalendarTask[];
  defaultStart: Date;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fallbackEnd = new Date(defaultStart);
    fallbackEnd.setHours(defaultStart.getHours() + 1);
    setTitle(event?.title ?? "");
    setDescription(event?.description ?? "");
    setStartAt(toDateTimeInput(event?.startAt ?? defaultStart));
    setEndAt(toDateTimeInput(event?.endAt ?? fallbackEnd));
    setProjectId(event?.projectId ?? "");
    setTaskId(event?.taskId ?? "");
  }, [open, event, defaultStart]);

  async function save() {
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        projectId: projectId || null,
        taskId: taskId || null,
      };
      const result = event
        ? await updateEventAction({ id: event.id, ...payload })
        : await createEventAction(payload);
      if ("error" in result) return toast.error(result.error);
      toast.success(event ? "Event updated" : "Event created");
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={event ? "Edit event" : "New event"}>
        <div className="flex flex-col gap-3">
          <Field label="Title">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Starts">
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
              />
            </Field>
            <Field label="Ends">
              <Input
                type="datetime-local"
                value={endAt}
                onChange={(event) => setEndAt(event.target.value)}
              />
            </Field>
          </div>
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
          <Field label="Related task">
            <Select
              value={taskId || "none"}
              onValueChange={(value) => setTaskId(value === "none" ? "" : value)}
              options={[
                { value: "none", label: "None" },
                ...tasks.map((task) => ({ value: task.id, label: task.title })),
              ]}
            />
          </Field>
          <DialogActions
            leading={
              event ? (
                <Button variant="ghost" onClick={onDelete}>
                  Delete
                </Button>
              ) : undefined
            }
          >
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
