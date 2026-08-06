export function Pill({
  selected,
  onClick,
  disabled,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`btn-squish h-9 rounded-lg px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? "animate-pop bg-teal-700 text-white"
          : "border border-stone-200 bg-white text-stone-600 hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-500 dark:hover:border-teal-700"
      }`}
    >
      {children}
    </button>
  );
}
