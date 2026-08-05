import { PageHeader } from "@/components/page-header";
import { Leaderboard } from "@/components/leaderboard";
import { T } from "@/components/translate";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="trophy"
        accent="bg-amber-600"
        title={<T id="leaderboard.title" />}
        subtitle={<T id="leaderboard.subtitle" />}
      />
      <Leaderboard />
    </div>
  );
}
