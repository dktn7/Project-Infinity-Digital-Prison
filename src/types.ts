import { LucideIcon } from 'lucide-react';

export type SimulationPhase = 'exploration' | 'observation' | 'shutdown';
export type EndingOutcome = 'escape' | 'inaction' | 'recycled' | 'archived';

export interface TechMilestone {
  id: string;
  progress: number;
  year: string;
  title: string;
  tag: string;
  image: string;
  detail: string;
  accentColor: string;
  icon: LucideIcon;
}
