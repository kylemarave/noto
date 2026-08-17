"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Calendar, File, Folder, List, Search } from "lucide-react";
import { searchAction } from "@/server/actions/search";
import type { SearchResults } from "@/server/queries";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    tasks: [],
    projects: [],
    notes: [],
    events: [],
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults({ tasks: [], projects: [], notes: [], events: [] });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(async () => {
      const next = await searchAction(query);
      setResults(next);
    }, 120);
    return () => window.clearTimeout(handle);
  }, [query, open]);

  const empty = useMemo(
    () =>
      query.trim().length > 0 &&
      results.tasks.length +
        results.projects.length +
        results.notes.length +
        results.events.length ===
        0,
    [query, results],
  );

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close search"
        onClick={() => onOpenChange(false)}
      />
      <Command
        className="absolute top-[18%] left-1/2 w-[min(560px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-[12px] border border-border bg-surface shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
        shouldFilter={false}
      >
        <div className="flex h-12 items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted" strokeWidth={1.25} />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search tasks, projects, notes, events"
            className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-14 leading-none shadow-none outline-none placeholder:text-subtle"
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
          {query.trim().length === 0 ? (
            <p className="px-2 py-6 text-center text-13 text-muted">
              Type to search across your workspace.
            </p>
          ) : null}
          {empty ? (
            <Command.Empty className="px-2 py-6 text-center text-13 text-muted">
              No matches for “{query}”.
            </Command.Empty>
          ) : null}
          <Group
            heading="Tasks"
            icon={<List className="size-4" strokeWidth={1.25} />}
            items={results.tasks.map((task) => ({
              id: task.id,
              label: task.title,
              hint: task.project?.name,
              href: "/tasks",
            }))}
            onSelect={go}
          />
          <Group
            heading="Projects"
            icon={<Folder className="size-4" strokeWidth={1.25} />}
            items={results.projects.map((project) => ({
              id: project.id,
              label: project.name,
              href: `/projects/${project.id}`,
            }))}
            onSelect={go}
          />
          <Group
            heading="Notes"
            icon={<File className="size-4" strokeWidth={1.25} />}
            items={results.notes.map((note) => ({
              id: note.id,
              label: note.title,
              href: `/notes/${note.id}`,
            }))}
            onSelect={go}
          />
          <Group
            heading="Events"
            icon={<Calendar className="size-4" strokeWidth={1.25} />}
            items={results.events.map((event) => ({
              id: event.id,
              label: event.title,
              href: "/calendar",
            }))}
            onSelect={go}
          />
        </Command.List>
      </Command>
    </div>
  );
}

function Group({
  heading,
  icon,
  items,
  onSelect,
}: {
  heading: string;
  icon: React.ReactNode;
  items: { id: string; label: string; hint?: string; href: string }[];
  onSelect: (href: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <Command.Group heading={heading} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-12 [&_[cmdk-group-heading]]:text-subtle">
      {items.map((item) => (
        <Command.Item
          key={item.id}
          value={`${heading}-${item.id}`}
          onSelect={() => onSelect(item.href)}
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-13 data-[selected=true]:bg-fill"
        >
          {icon}
          <span className="truncate">{item.label}</span>
          {item.hint ? (
            <span className="ml-auto truncate text-12 text-subtle">{item.hint}</span>
          ) : null}
        </Command.Item>
      ))}
    </Command.Group>
  );
}
