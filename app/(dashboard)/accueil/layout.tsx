import { FeaturedSidebarClient } from "@/components/page_layout/FeaturedSidebarClient";
import type { ReactNode } from "react";

export default function AccueilLayout({ children }: { children: ReactNode }) {

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:justify-between gap-6 p-4 flex-1 min-w-0">
      
      <div className="w-full min-w-0">
          {children}
      </div>
      <div className="w-full min-w-0">
        <FeaturedSidebarClient />
      </div>

    </div>    
  )
}
