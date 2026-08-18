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
import { TASK_COLUMNS } from "@/lib/constants";
import { formatDue } from "@/lib/dates";
import { priorityLabel, taskStatusLabel } from "@/lib/labels";
import { moveTaskAction } from "@/server/actions/tasks";
import type { ProjectOption, TaskWithRelations } from "@/server/queries";
import { TaskDialog } from "./task-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export function KanbanBoard({
  tasks,
  projects,
  defaultProjectId,
}: {
  tasks: TaskWithRelations[];
  projects: ProjectOption[];
  defaultProjectId?: string;
}) {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("ALL");
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
      return matchesQuery && matchesPriority;
    });
  }, [items, query, priority]);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tasks"
          className="max-w-xs min-h-11"
        />
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="h-11 min-w-36 rounded-[10px] border border-border bg-fill px-3 text-13"
        >
          <option value="ALL">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <Button className="ml-auto" onClick={() => setCreateOpen(true)}>
          New task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet."
          description="Create your first task to start organizing your work."
          action={<Button onClick={() => setCreateOpen(true)}>+ Create Task</Button>}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={(event) => void onDragEnd(event)}
        >
          <div className="-mx-4 flex gap-3 overflow-x-auto overscroll-x-contain px-4 pb-3 snap-x snap-mandatory scrollbar-thin md:mx-0 md:px-0 md:snap-none">
            {TASK_COLUMNS.map((column) => {
              const columnTasks = filtered
                .filter((task) => task.status === column.id)
                .sort((a, b) => a.position - b.position);
              return (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  label={column.label}
                  count={columnTasks.length}
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
    </div>
  );
}

function KanbanColumn({
  id,
  label,
  count,
  children,
}: {
  id: string;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <section
      ref={setNodeRef}
      className="flex min-h-[min(420px,70dvh)] w-[min(280px,78vw)] shrink-0 snap-start flex-col gap-2 rounded-[10px] border border-border bg-surface p-3 md:w-[260px]"
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-13 font-medium">{label}</h2>
        <span className="text-12 text-subtle tabular">{count}</span>
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
        "flex w-full min-h-11 cursor-pointer flex-col gap-2 rounded-[10px] border border-border bg-bg p-3 text-left hover:border-line",
        overlay && "shadow-[0_12px_24px_rgba(0,0,0,0.35)]",
      )}
    >
      <p className="text-14 font-medium">{task.title}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          tone={
            task.priority === "URGENT"
              ? "danger"
              : task.priority === "HIGH"
                ? "warning"
                : "neutral"
          }
        >
          {priorityLabel(task.priority)}
        </Badge>
        {task.project ? (
          <span className="text-12 text-muted">{task.project.name}</span>
        ) : null}
        {formatDue(task.dueDate) ? (
          <span className="text-12 text-subtle">{formatDue(task.dueDate)}</span>
        ) : null}
      </div>
      {task.subtasks.length > 0 ? (
        <p className="text-12 text-subtle">
          {done}/{task.subtasks.length} subtasks
        </p>
      ) : null}
      {task.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((item) => (
            <span key={item.tagId} className="text-12 text-subtle">
              #{item.tag.name}
            </span>
          ))}
        </div>
      ) : null}
      <span className="sr-only">{taskStatusLabel(task.status)}</span>
    </button>
  );
}
