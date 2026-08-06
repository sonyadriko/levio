"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { Icon } from "@/components/icons";
import { useLanguage } from "@/components/language-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90 lg:hidden">
      {navItems.slice(0, 5).map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors active:scale-[0.96] ${
              isActive
                ? "text-teal-700 dark:text-teal-600"
                : "text-stone-500 dark:text-stone-500"
            }`}
          >
            <Icon name={item.icon} className="h-6 w-6" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
