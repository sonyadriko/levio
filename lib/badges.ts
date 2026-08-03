import { allLanguageModules } from "./languages";
import type { LanguageModule } from "./languages/types";
import type { IconName } from "./nav";
import { unlockedFor, type ProgressState } from "./progress";

export interface BadgeStatus {
  id: string;
  icon: IconName;
  titleKey: string;
  descKey: string;
  titleVars?: Record<string, string | number>;
  descVars?: Record<string, string | number>;
  earned: boolean;
  current: number;
  target: number;
}

interface BadgeDef {
  id: string;
  icon: IconName;
  titleKey: string;
  descKey: string;
  titleVars?: Record<string, string | number>;
  descVars?: Record<string, string | number>;
  value: (progress: ProgressState) => number;
  target: number;
}

// Badge yang tidak terikat bahasa/modul tertentu.
const baseBadges: BadgeDef[] = [
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
    id: "tests-10",
    icon: "pen",
    titleKey: "badge.tests10",
    descKey: "badge.tests10Desc",
    value: (p) => p.completedTests,
    target: 10,
  },
];

function masteredInLevel(
  progress: ProgressState,
  module: LanguageModule,
  level: number,
): number {
  const prefix = module.wordIdPrefix(level);
  let count = 0;
  for (const [id, wp] of Object.entries(progress.words)) {
    if (id.startsWith(prefix) && wp.mastered) count += 1;
  }
  return count;
}

// Badge per modul × level: "master" = kuasai semua kosakata level; "graduate"
// = lulus tes kelulusan level 1 (membuka level 2). Digenerate dari registry
// modul sehingga otomatis mengikuti data & bahasa yang tersedia.
function languageBadges(): BadgeDef[] {
  const defs: BadgeDef[] = [];
  for (const languageModule of allLanguageModules()) {
    for (const meta of languageModule.levels()) {
      const total = languageModule.countWordsByLevel(meta.index);
      if (total <= 0) continue;
      const name = languageModule.levelName(meta.index);
      defs.push({
        id: `master-${languageModule.id}-${meta.index}`,
        icon: "book",
        titleKey: "badge.masterLevel",
        descKey: "badge.masterLevelDesc",
        titleVars: { level: name },
        descVars: { level: name },
        value: (p) => masteredInLevel(p, languageModule, meta.index),
        target: total,
      });
    }
    if (languageModule.totalWordCount() > 0) {
      defs.push({
        id: `graduate-${languageModule.id}-1`,
        icon: "trophy",
        titleKey: "badge.graduateLevel",
        descKey: "badge.graduateLevelDesc",
        titleVars: { level: languageModule.levelName(1) },
        descVars: { level: languageModule.levelName(1) },
        value: (p) => (unlockedFor(p, languageModule.id) > 1 ? 1 : 0),
        target: 1,
      });
    }
  }
  return defs;
}

const badges: BadgeDef[] = [...baseBadges, ...languageBadges()];

export function getBadges(progress: ProgressState): BadgeStatus[] {
  return badges.map((badge) => {
    const current = Math.min(badge.value(progress), badge.target);
    return {
      id: badge.id,
      icon: badge.icon,
      titleKey: badge.titleKey,
      descKey: badge.descKey,
      titleVars: badge.titleVars,
      descVars: badge.descVars,
      earned: current >= badge.target,
      current,
      target: badge.target,
    };
  });
}

export function countEarnedBadges(progress: ProgressState): number {
  return getBadges(progress).filter((badge) => badge.earned).length;
}
