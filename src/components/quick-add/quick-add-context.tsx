"use client";

import { createContext, useContext } from "react";

export const QuickAddContext = createContext<() => void>(() => {});

export function useQuickAdd() {
  return useContext(QuickAddContext);
}
