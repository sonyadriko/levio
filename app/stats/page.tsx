import { PageHeader } from "@/components/page-header";
import { StatsDashboard } from "@/components/stats-dashboard";
import { T } from "@/components/translate";

export default function StatsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="chart"
        accent="bg-teal-600"
        title={<T id="stats.title" />}
        subtitle={<T id="stats.subtitle" />}
      />

      <StatsDashboard />
    </div>
  );
}
