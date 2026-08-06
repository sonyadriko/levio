import type { IconName } from "@/lib/nav";

const paths: Record<IconName, React.ReactNode> = {
  home: (
    <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />
  ),
  book: (
    <path d="M4 4h12a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm12 2h4v16h-4M8 8h6M8 12h6" />
  ),
  pen: (
    <path d="m4 20 4.5-.5L20.5 7.5a2 2 0 0 0 0-3l-.5-.5a2 2 0 0 0-3 0L5 15.5 4 20Z" />
  ),
  chart: (
    <path d="M3 3v18h18M7 17v-5M12 17V7M17 17v-8" />
  ),
  user: (
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 8a8 8 0 0 1 16 0" />
  ),
  dumbbell: (
    <path d="M6.5 6.5v11M3 9v6M17.5 6.5v11M21 9v6M6.5 12h11" />
  ),
  flame: (
    <path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .4-1.8.8-2.5C9.5 8 11 8 12 2Zm0 0c-1 3.5-4 5-4 8.5a4 4 0 0 0 8 0c0-2-1.5-3.5-2-5" />
  ),
  check: (
    <path d="m4 12 5 5L20 6" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: (
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4M8 4h8v6a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4" />
    </>
  ),
  star: (
    <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3Z" />
  ),
  volume: (
    <>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.4 5.6a8.5 8.5 0 0 1 0 12.8" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
    </>
  ),
  water: (
    <path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11Z" />
  ),
};

export function Icon({
  name,
  className = "h-6 w-6",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
