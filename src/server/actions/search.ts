"use server";

import { requireUser } from "@/lib/auth";
import { searchWorkspace } from "@/server/queries";

export async function searchAction(query: string) {
  const user = await requireUser();
  return searchWorkspace(user.id, query);
}
