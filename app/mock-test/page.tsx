import { MockTest } from "@/components/mock-test";
import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";

export default function MockTestPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="chart"
        accent="bg-teal-600"
        title={<T id="mock.title" />}
        subtitle={<T id="mock.subtitle" />}
      />

      <MockTest />
    </div>
  );
}
