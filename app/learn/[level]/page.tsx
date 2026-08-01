import { notFound, redirect } from "next/navigation";

export default async function LegacyLevelRedirect({
  params,
}: PageProps<"/learn/[level]">) {
  const { level } = await params;
  const n = Number(level);
  if (!Number.isInteger(n) || n < 1 || n > 6) notFound();
  redirect(`/learn/hsk/${n}`);
}
