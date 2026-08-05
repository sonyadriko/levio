import { PageHeader } from "@/components/page-header";
import { GrammarPractice } from "@/components/grammar-practice";
import { T } from "@/components/translate";

export default async function GrammarPage({
  searchParams,
}: PageProps<"/practice/grammar">) {
  const { module: moduleId } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="pen"
        accent="bg-amber-600"
        title={<T id="grammar.title" />}
        subtitle={<T id="grammar.subtitle" />}
      />
      <GrammarPractice
        moduleId={typeof moduleId === "string" ? moduleId : undefined}
      />
    </div>
  );
}
