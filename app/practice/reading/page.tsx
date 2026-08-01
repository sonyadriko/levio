import { PageHeader } from "@/components/page-header";
import { ReadingPractice } from "@/components/reading-practice";
import { T } from "@/components/translate";

export default function ReadingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="book"
        accent="bg-violet-600"
        title={<T id="read.title" />}
        subtitle={<T id="read.subtitle" />}
      />
      <ReadingPractice />
    </div>
  );
}
