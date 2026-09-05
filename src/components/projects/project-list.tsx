"use client";

import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { projectStatusLabel } from "@/lib/labels";
import { monoTint } from "@/lib/utils";
import type { ProjectListItem } from "@/server/queries";
import { EmptyState } from "@/components/ui/empty";
import { Page, TextAction } from "@/components/layout/page";
import { ProjectDialog } from "./project-dialog";
import { toggleFavoriteAction } from "@/server/actions/projects";

export function ProjectList({ projects }: { projects: ProjectListItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Page className="gap-6">
      <p className="text-13 text-subtle">
        Projects connect tasks, notes, and dates.
      </p>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet."
          description="Create a project to keep related work in one place."
          action={
            <TextAction onClick={() => setOpen(true)}>New project</TextAction>
          }
        />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {projects.map((project) => {
            const done = project.tasks.filter((task) => task.status === "DONE").length;
            return (
              <li
                key={project.id}
                className="flex items-center gap-1 border-b border-border last:border-b-0"
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="touch-row grid min-w-0 flex-1 items-center gap-x-6 gap-y-1 rounded-md px-2 py-3 transition-colors hover:bg-fill sm:grid-cols-[minmax(0,1fr)_10rem_6.5rem]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: monoTint(project.color) }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-14 font-medium">
                        {project.name}
                      </span>
                      <span className="mt-0.5 block truncate text-12 text-subtle">
                        {project.description || "No description"}
                      </span>
                      <span className="mt-0.5 block text-12 text-subtle sm:hidden">
                        {projectStatusLabel(project.status)}
                      </span>
                    </span>
                  </span>
                  <span className="tabular hidden text-12 text-subtle sm:block">
                    {done}/{project._count.tasks} tasks · {project._count.notes} notes
                  </span>
                  <span className="hidden text-12 text-subtle sm:block">
                    {projectStatusLabel(project.status)}
                  </span>
                </Link>
                <button
                  type="button"
                  className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-subtle transition-colors hover:bg-fill hover:text-text"
                  aria-label={
                    project.favorite
                      ? `Remove ${project.name} from favorites`
                      : `Add ${project.name} to favorites`
                  }
                  aria-pressed={Boolean(project.favorite)}
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
              </li>
            );
          })}
        </ul>
      )}
      <ProjectDialog open={open} onOpenChange={setOpen} />
    </Page>
  );
}
