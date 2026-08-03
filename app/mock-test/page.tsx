import { MockTest } from "@/components/mock-test";
import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";
import { getLanguageModule, defaultModule } from "@/lib/languages";

export default async function MockTestPage({
  searchParams,
}: PageProps<"/mock-test">) {
  const { module: moduleId } = await searchParams;
  const languageModule =
    getLanguageModule(typeof moduleId === "string" ? moduleId : "") ??
    defaultModule();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="chart"
        accent="bg-teal-600"
        title={<T id="mock.title" />}
        subtitle={<T id="mock.subtitle" />}
      />

      <MockTest moduleId={languageModule.id} />
    </div>
  );
}
