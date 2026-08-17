"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProjectDialog } from "./project-dialog";
import {
  deleteProjectAction,
  toggleFavoriteAction,
} from "@/server/actions/projects";

export function ProjectActions({
  project,
}: {
  project: {
    id: string;
    name: string;
    description: string;
    status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
    color: string;
    favorite: { id: string } | null;
  };
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={async () => {
          const result = await toggleFavoriteAction(project.id);
          if (result && "error" in result) toast.error(result.error);
        }}
      >
        {project.favorite ? "Unfavorite" : "Favorite"}
      </Button>
      <Button variant="outline" onClick={() => setEditOpen(true)}>
        Edit
      </Button>
      <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
        Delete
      </Button>
      <ProjectDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this project?"
        description="Tasks and notes stay in your workspace, but this project will be removed."
        onConfirm={async () => {
          await deleteProjectAction(project.id);
        }}
      />
    </div>
  );
}
