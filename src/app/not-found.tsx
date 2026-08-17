import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-start justify-center gap-3 px-6">
      <h1 className="text-24">Page not found</h1>
      <p className="text-13 text-muted">That route is not part of this workspace.</p>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
