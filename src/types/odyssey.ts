/**
 * ATF VAKTHA: Phase S - Type Definitions
 */

export interface MissionProtocol {
  minScore: number;
  maxFillers: number;
  targetWPM: string;
  tone: string;
  duration: string;
}

export interface Mission {
  id: string;
  title: string;
  objective: string;
  trainingFocus: string;
  aiFocus: string;
  duration: string;
  protocol: MissionProtocol;
}

export interface AscendanceTier {
  id: string;
  title: string;
  objective: string;
  coreSkill: string;
  missions: Mission[];
}

export interface Odyssey {
  id: string;
  title: string;
  motto: string;
  description: string;
  focusArea: string;
  targetUsers: string;
  outcome: string;
  tiers: AscendanceTier[];
}

export interface UserMastery {
  userId: string;
  odysseyId: string;
  currentTier: number;
  completedMissions: string[];
  identity: string;
  updatedAt: any;
}