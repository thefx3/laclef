import { FeaturedSidebarClient } from "@/components/page_layout/FeaturedSidebarClient";
import type { ReactNode } from "react";

export default function AccueilLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid lg:grid-cols-[1fr_16rem] gap-6 p-4 flex-1 min-w-0">
      <div className="w-full min-w-0">
        {children}
      </div>
      <div className="w-[16rem] shrink-0">
        <FeaturedSidebarClient />
      </div>
    </div>
  );
}

