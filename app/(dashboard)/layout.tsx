import Header from "@/components/Header"
import NavBar from "@/components/NavBar";

// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
        <NavBar />

        <main className="flex flex-col w-full min-h-screen shadow-sm min-w-0">
          <Header />

          <div className="p-4 flex-1 min-w-0 bg-white">
            {children}
          </div>
          

        </main>
      </div>
    );
  }
  