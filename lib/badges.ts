import { getWordsByLevel } from "./hsk";
import type { HskLevel } from "./hsk/types";
import type { IconName } from "./nav";
import type { ProgressState } from "./progress";

export interface BadgeStatus {
  id: string;
  icon: IconName;
  titleKey: string;
  descKey: string;
  earned: boolean;
  current: number;
  target: number;
}

interface BadgeDef {
  id: string;
  icon: IconName;
  titleKey: string;
  descKey: string;
  value: (progress: ProgressState) => number;
  target: number;
}

function masteredInLevel(progress: ProgressState, level: HskLevel): number {
  return getWordsByLevel(level).filter(
    (w) => progress.words[w.id]?.mastered,
  ).length;
}

const badges: BadgeDef[] = [
  {
    id: "first-steps",
    icon: "star",
    titleKey: "badge.firstSteps",
    descKey: "badge.firstStepsDesc",
    value: (p) => p.xp,
    target: 100,
  },
  {
    id: "streak-7",
    icon: "flame",
    titleKey: "badge.streak7",
    descKey: "badge.streak7Desc",
    value: (p) => p.streak,
    target: 7,
  },
  {
    id: "streak-30",
    icon: "flame",
    titleKey: "badge.streak30",
    descKey: "badge.streak30Desc",
    value: (p) => p.streak,
    target: 30,
  },
  {
    id: "xp-1000",
    icon: "chart",
    titleKey: "badge.xp1000",
    descKey: "badge.xp1000Desc",
    value: (p) => p.xp,
    target: 1000,
  },
  {
    id: "xp-5000",
    icon: "chart",
    titleKey: "badge.xp5000",
    descKey: "badge.xp5000Desc",
    value: (p) => p.xp,
    target: 5000,
  },
  {
    id: "words-100",
    icon: "book",
    titleKey: "badge.words100",
    descKey: "badge.words100Desc",
    value: (p) => Object.keys(p.words).length,
    target: 100,
  },
  {
    id: "master-hsk1",
    icon: "book",
    titleKey: "badge.masterHsk1",
    descKey: "badge.masterHsk1Desc",
    value: (p) => masteredInLevel(p, 1),
    target: getWordsByLevel(1).length,
  },
  {
    id: "master-hsk2",
    icon: "book",
    titleKey: "badge.masterHsk2",
    descKey: "badge.masterHsk2Desc",
    value: (p) => masteredInLevel(p, 2),
    target: getWordsByLevel(2).length,
  },
  {
    id: "graduate-1",
    icon: "trophy",
    titleKey: "badge.graduate1",
    descKey: "badge.graduate1Desc",
    value: (p) => (p.unlockedUpTo > 1 ? 1 : 0),
    target: 1,
  },
  {
    id: "tests-10",
    icon: "pen",
    titleKey: "badge.tests10",
    descKey: "badge.tests10Desc",
    value: (p) => p.completedTests,
    target: 10,
  },
];

export function getBadges(progress: ProgressState): BadgeStatus[] {
  return badges.map((badge) => {
    const current = Math.min(badge.value(progress), badge.target);
    return {
      id: badge.id,
      icon: badge.icon,
      titleKey: badge.titleKey,
      descKey: badge.descKey,
      earned: current >= badge.target,
      current,
      target: badge.target,
    };
  });
}

export function countEarnedBadges(progress: ProgressState): number {
  return getBadges(progress).filter((badge) => badge.earned).length;
}
