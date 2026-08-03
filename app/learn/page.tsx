import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";
import { ModuleHubCard } from "@/components/module-hub-card";
import { allLanguageModules } from "@/lib/languages";

export default function LearnPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="book"
        title={<T id="learn.hubTitle" />}
        subtitle={<T id="learn.hubSubtitle" />}
      />

      <section className="flex flex-col gap-3">
        {allLanguageModules().map((module) => (
          <ModuleHubCard key={module.id} module={module} />
        ))}
      </section>
    </div>
  );
}
