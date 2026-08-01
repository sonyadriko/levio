export type IconName =
  | "home"
  | "book"
  | "pen"
  | "chart"
  | "user"
  | "dumbbell"
  | "flame"
  | "check"
  | "sun"
  | "moon"
  | "lock"
  | "trophy"
  | "star"
  | "volume";

export interface NavItem {
  labelKey: string;
  href: string;
  icon: IconName;
}

export const navItems: NavItem[] = [
  { labelKey: "nav.home", href: "/", icon: "home" },
  { labelKey: "nav.learn", href: "/learn", icon: "book" },
  { labelKey: "nav.gym", href: "/gym", icon: "dumbbell" },
  { labelKey: "nav.stats", href: "/stats", icon: "chart" },
  { labelKey: "nav.profile", href: "/profile", icon: "user" },
];
