import type { ReactNode } from "react";

export default function FLCELayout({ children }: { children: ReactNode }) {
  return (
    <div className="gap-6 p-4 flex-1 min-w-0">
      {children}
    </div>
  );
}
