"use client";

import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import { projectStatusLabel } from "@/lib/labels";
import type { ProjectListItem } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { ProjectDialog } from "./project-dialog";
import { toggleFavoriteAction } from "@/server/actions/projects";
import { toast } from "sonner";

export function ProjectList({ projects }: { projects: ProjectListItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-13 text-muted">Projects connect tasks, notes, and dates.</p>
        <Button onClick={() => setOpen(true)}>New project</Button>
      </div>
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet."
          description="Create a project to keep related work in one place."
          action={<Button onClick={() => setOpen(true)}>+ Create project</Button>}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const done = project.tasks.filter((task) => task.status === "DONE").length;
            return (
              <article
                key={project.id}
                className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/projects/${project.id}`} className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: project.color }}
                      />
                      <h2 className="truncate text-14 font-medium">{project.name}</h2>
                    </div>
                  </Link>
                  <button
                    type="button"
                    className="cursor-pointer text-muted hover:text-text"
                    aria-label="Favorite"
                    onClick={async () => {
                      const result = await toggleFavoriteAction(project.id);
                      if (result && "error" in result) toast.error(result.error);
                    }}
                  >
                    <Star
                      className="size-3.5"
                      strokeWidth={1.25}
                      fill={project.favorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <p className="line-clamp-2 text-13 text-muted">
                  {project.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <Badge>{projectStatusLabel(project.status)}</Badge>
                  <p className="text-12 text-subtle">
                    {done}/{project._count.tasks} tasks · {project._count.notes} notes
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <ProjectDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
