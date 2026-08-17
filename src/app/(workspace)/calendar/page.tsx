import { CalendarView } from "@/components/calendar/calendar-view";
import { requireUser } from "@/lib/auth";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";
import { getEvents, getProjects, getTasks } from "@/server/queries";

export default async function CalendarPage() {
  const user = await requireUser();
  const from = startOfMonth(addMonths(new Date(), -1));
  const to = endOfMonth(addMonths(new Date(), 2));
  const [events, tasks, projects] = await Promise.all([
    getEvents(user.id, { from, to }),
    getTasks(user.id),
    getProjects(user.id),
  ]);
  return <CalendarView events={events} tasks={tasks} projects={projects} />;
}
