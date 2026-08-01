import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { SyncBanner } from "@/components/sync-banner";
import { DailyReminder } from "@/components/daily-reminder";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-stone-50 dark:bg-stone-950">
      <DailyReminder />
      <Sidebar />
      <div className="flex min-h-svh flex-col lg:pl-64">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10 lg:pt-8">
          <SyncBanner />
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
