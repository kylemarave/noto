"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { TASK_COLUMNS, TASK_PRIORITIES } from "@/lib/constants";
import { formatDue, isOverdue } from "@/lib/dates";
import { priorityLabel, taskStatusLabel } from "@/lib/labels";
import { moveTaskAction } from "@/server/actions/tasks";
import type { ProjectOption, TaskWithRelations } from "@/server/queries";
import { TaskDialog } from "./task-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty";
import { PageFill, TextAction, Toolbar } from "@/components/layout/page";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "ALL", label: "All statuses" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
] as const;

export function KanbanBoard({
  tasks,
  projects,
  defaultProjectId,
  initialStatus,
  fill = true,
}: {
  tasks: TaskWithRelations[];
  projects: ProjectOption[];
  defaultProjectId?: string;
  initialStatus?: string;
  fill?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState(
    STATUS_FILTERS.some((item) => item.value === initialStatus)
      ? initialStatus!
      : "ALL",
  );
  const [items, setItems] = useState(tasks);

  useEffect(() => {
    setItems(tasks);
  }, [tasks]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<TaskWithRelations | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((task) => {
      const haystack = `${task.title} ${task.description} ${task.tags.map((item) => item.tag.name).join(" ")}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesPriority = priority === "ALL" || task.priority === priority;
      const matchesStatus =
        statusFilter === "ALL" ||
        task.status === statusFilter ||
        (statusFilter === "TODO" && task.status === "BACKLOG");
      return matchesQuery && matchesPriority && matchesStatus;
    });
  }, [items, query, priority, statusFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 12 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
  );

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const overId = String(over.id);
    const current = items.find((task) => task.id === taskId);
    if (!current) return;

    const overTask = items.find((task) => task.id === overId);
    const nextStatus = (TASK_COLUMNS.find((column) => column.id === overId)?.id ??
      overTask?.status ??
      current.status) as TaskWithRelations["status"];

    const columnTasks = items
      .filter((task) => (task.id === taskId ? nextStatus : task.status) === nextStatus && task.id !== taskId)
      .sort((a, b) => a.position - b.position);

    let nextIndex = columnTasks.findIndex((task) => task.id === overId);
    if (nextIndex < 0) nextIndex = columnTasks.length;
    const reordered = [...columnTasks];
    reordered.splice(nextIndex, 0, { ...current, status: nextStatus });

    const nextItems = items.map((task) => {
      if (task.id !== taskId && task.status !== nextStatus) return task;
      const index = reordered.findIndex((item) => item.id === task.id);
      if (index < 0) return task.id === taskId ? { ...task, status: nextStatus } : task;
      return { ...task, status: nextStatus, position: index + 1 };
    });
    setItems(nextItems);

    const moved = reordered.find((task) => task.id === taskId);
    const result = await moveTaskAction(taskId, nextStatus, moved?.position ?? 1);
    if (result && "error" in result) toast.error(result.error);
  }

  const activeTask = items.find((task) => task.id === activeId);

  const board = (
    <>
      <Toolbar>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tasks"
          className="w-full sm:max-w-xs"
          aria-label="Search tasks"
        />
        <Select
          className="w-full min-w-36 sm:w-auto"
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={STATUS_FILTERS.map((item) => ({
            value: item.value,
            label: item.label,
          }))}
        />
        <Select
          className="w-full min-w-36 sm:w-auto"
          value={priority}
          onValueChange={setPriority}
          options={[
            { value: "ALL", label: "All priorities" },
            ...TASK_PRIORITIES.map((item) => ({ value: item.id, label: item.label })),
          ]}
        />
      </Toolbar>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet."
          description="Create your first task to start organizing your work."
          action={
            <TextAction onClick={() => setCreateOpen(true)}>New task</TextAction>
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={(event) => void onDragEnd(event)}
        >
          <div
            className={cn(
              "-mx-4 flex gap-4 overflow-x-auto overscroll-x-contain px-4 pb-3 snap-x snap-mandatory scrollbar-thin md:mx-0 md:px-0 md:snap-none lg:overflow-x-visible",
              fill && "min-h-0 flex-1",
            )}
          >
            {(statusFilter === "ALL"
              ? TASK_COLUMNS
              : TASK_COLUMNS.filter(
                  (column) =>
                    column.id === statusFilter ||
                    (statusFilter === "TODO" && column.id === "BACKLOG"),
                )
            ).map((column) => {
              const columnTasks = filtered
                .filter((task) => task.status === column.id)
                .sort((a, b) => a.position - b.position);
              return (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  label={column.label}
                  count={columnTasks.length}
                  fill={fill}
                >
                  <SortableContext
                    items={columnTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setEditing(task)}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              );
            })}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projects={projects}
        defaultProjectId={defaultProjectId}
      />
      <TaskDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        task={editing}
        projects={projects}
      />
    </>
  );

  if (fill) {
    return <PageFill className="gap-5">{board}</PageFill>;
  }

  return <div className="flex w-full flex-col gap-5">{board}</div>;
}

function KanbanColumn({
  id,
  label,
  count,
  fill,
  children,
}: {
  id: string;
  label: string;
  count: number;
  fill?: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[min(272px,78vw)] shrink-0 snap-start flex-col gap-3 md:w-[248px] lg:w-auto lg:min-w-0 lg:flex-1 lg:shrink",
        fill ? "min-h-full" : "min-h-[min(360px,55dvh)]",
      )}
    >
      <div className="flex items-baseline gap-2 border-b border-border pb-2">
        <h2 className="text-13 font-medium text-muted">{label}</h2>
        <span className="tabular text-12 text-subtle">{count}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </section>
  );
}

export function TaskCard({
  task,
  onClick,
  overlay,
}: {
  task: TaskWithRelations;
  onClick?: () => void;
  overlay?: boolean;
}) {
  const sortable = useSortable({ id: task.id, disabled: overlay });
  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      };
  const done = task.subtasks.filter((item) => item.completed).length;

  return (
    <button
      type="button"
      ref={overlay ? undefined : sortable.setNodeRef}
      style={style}
      {...(overlay ? {} : sortable.attributes)}
      {...(overlay ? {} : sortable.listeners)}
      onClick={onClick}
      className={cn(
        "flex w-full min-h-11 cursor-pointer flex-col gap-2 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:border-line",
        overlay && "border-line shadow-[0_10px_28px_rgba(0,0,0,0.45)]",
      )}
    >
      <p className="text-13 leading-snug">{task.title}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-12 text-subtle">
        {task.priority === "URGENT" || task.priority === "HIGH" ? (
          <span
            className={cn(
              task.priority === "URGENT" ? "text-danger" : "text-muted font-medium",
            )}
          >
            {priorityLabel(task.priority)}
          </span>
        ) : null}
        {task.project ? <span className="truncate">{task.project.name}</span> : null}
        {formatDue(task.dueDate) ? (
          <span className={cn("tabular", isOverdue(task.dueDate) && "text-danger")}>
            {formatDue(task.dueDate)}
          </span>
        ) : null}
        {task.subtasks.length > 0 ? (
          <span className="tabular">
            {done}/{task.subtasks.length}
          </span>
        ) : null}
        {task.tags.map((item) => (
          <span key={item.tagId}>#{item.tag.name}</span>
        ))}
      </div>
      <span className="sr-only">{taskStatusLabel(task.status)}</span>
    </button>
  );
}
