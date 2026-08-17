import { ProjectList } from "@/components/projects/project-list";
import { requireUser } from "@/lib/auth";
import { getProjects } from "@/server/queries";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await getProjects(user.id);
  return <ProjectList projects={projects} />;
}
