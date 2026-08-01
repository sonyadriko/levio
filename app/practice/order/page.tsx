import { PageHeader } from "@/components/page-header";
import { SentenceBuilder } from "@/components/sentence-builder";
import { T } from "@/components/translate";

export default function OrderPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="pen"
        accent="bg-amber-600"
        title={<T id="builder.title" />}
        subtitle={<T id="builder.subtitle" />}
      />
      <SentenceBuilder />
    </div>
  );
}
