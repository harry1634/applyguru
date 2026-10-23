import { Sidebar }         from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { UserProvider }    from "@/lib/user-context";
import { SessionSync }     from "@/components/auth/session-sync";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <SessionSync />
      <div className="flex h-screen bg-[var(--muted)] overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {children}
            </div>
          </main>
        </div>

        <MobileBottomNav />
      </div>
    </UserProvider>
  );
}
