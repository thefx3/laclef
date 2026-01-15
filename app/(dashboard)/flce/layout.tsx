import type { ReactNode } from "react";

export default function FLCELayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid lg:grid-cols-[1fr_16rem] gap-6 p-4 flex-1 min-w-0">
      {children}
    </div>
  );
}
