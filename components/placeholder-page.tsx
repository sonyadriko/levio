import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";
import type { IconName } from "@/lib/nav";

export function PlaceholderPage({
  titleKey,
  descriptionKey,
  icon,
  itemKeys,
}: {
  titleKey: string;
  descriptionKey: string;
  icon: IconName;
  itemKeys: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={icon}
        title={<T id={titleKey} />}
        subtitle={<T id={descriptionKey} />}
      />

      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-950">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
          <T id="placeholder.inProgress" />
        </p>
        <ul className="mx-auto mt-4 flex max-w-md flex-col gap-2 text-left">
          {itemKeys.map((key) => (
            <li
              key={key}
              className="flex items-start gap-2 rounded-lg bg-stone-50 px-3 py-2 text-sm dark:bg-stone-900"
            >
              <Icon
                name="check"
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
              />
              <T id={key} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
