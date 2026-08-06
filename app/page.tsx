import Link from "next/link";
import { DailyChecklist } from "@/components/daily-checklist";
import { Greeting } from "@/components/greeting";
import { HomeStats } from "@/components/home-stats";
import { WaterTracker } from "@/components/water/water-tracker";
import { Icon } from "@/components/icons";
import { T } from "@/components/translate";

const quickActions = [
  {
    titleKey: "home.action.learn.title",
    descKey: "home.action.learn.desc",
    href: "/learn",
    icon: "book",
    accent: "bg-teal-700",
  },
  {
    titleKey: "home.action.practice.title",
    descKey: "home.action.practice.desc",
    href: "/practice",
    icon: "pen",
    accent: "bg-emerald-600",
  },
  {
    titleKey: "home.action.gym.title",
    descKey: "home.action.gym.desc",
    href: "/gym",
    icon: "dumbbell",
    accent: "bg-orange-700",
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          <Greeting />
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-500">
          <T id="home.subtitle" />
        </p>
      </header>

      <HomeStats />

      <DailyChecklist />

      <WaterTracker />

      <section>
        <h2 className="mb-3 text-base font-semibold">
          <T id="home.quickStart" />
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-transform hover:-translate-y-0.5 active:scale-[0.98] dark:border-stone-800 dark:bg-stone-950"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${action.accent}`}
              >
                <Icon name={action.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  <T id={action.titleKey} />
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-500">
                  <T id={action.descKey} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
