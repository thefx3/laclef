 "use client";

import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import { APP_NAV, type AppKey } from "@/lib/apps";
import { Sidebar } from "lucide-react";
import { useSelectedLayoutSegments } from "next/navigation";


// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();

  const first = segments[0]; //"accueil", "flce", etc.

  const isAppKey = first && Object.prototype.hasOwnProperty.call(APP_NAV, first);
  const appKey = (isAppKey ? first : null) as AppKey | null;

  const links = appKey ? APP_NAV[appKey] : [];

    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">

        <NavBar links={links}/>

        <main className="flex flex-col w-full min-h-screen shadow-sm min-w-0">
          <Header />

          <div className="p-4 flex-1 min-w-0 bg-white">
            {children}
          </div>
          

        </main>
      </div>
    );
  }
  
