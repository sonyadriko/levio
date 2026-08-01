import { Icon } from "@/components/icons";
import type { IconName } from "@/lib/nav";

export function PageHeader({
  icon,
  accent = "bg-teal-700",
  title,
  subtitle,
}: {
  icon: IconName;
  accent?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <header className="flex items-center gap-3">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${accent}`}
      >
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
