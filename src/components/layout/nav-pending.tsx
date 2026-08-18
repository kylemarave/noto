"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

const NavPendingContext = createContext<{
  pendingHref: string | null;
  start: (href: string) => void;
}>({ pendingHref: null, start: () => {} });

export function NavPendingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <NavPendingContext.Provider value={{ pendingHref, start: setPendingHref }}>
      {children}
    </NavPendingContext.Provider>
  );
}

export function useNavPending() {
  return useContext(NavPendingContext);
}
