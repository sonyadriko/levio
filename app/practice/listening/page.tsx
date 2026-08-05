import { PageHeader } from "@/components/page-header";
import { ListeningPractice } from "@/components/listening-practice";
import { T } from "@/components/translate";

export default async function ListeningPage({
  searchParams,
}: PageProps<"/practice/listening">) {
  const { module: moduleId } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="flame"
        accent="bg-sky-600"
        title={<T id="listen.title" />}
        subtitle={<T id="listen.subtitle" />}
      />
      <ListeningPractice
        moduleId={typeof moduleId === "string" ? moduleId : undefined}
      />
    </div>
  );
}