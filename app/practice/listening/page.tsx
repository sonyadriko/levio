import { PageHeader } from "@/components/page-header";
import { ListeningPractice } from "@/components/listening-practice";
import { T } from "@/components/translate";

export default function ListeningPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="flame"
        accent="bg-sky-600"
        title={<T id="listen.title" />}
        subtitle={<T id="listen.subtitle" />}
      />
      <ListeningPractice />
    </div>
  );
}
