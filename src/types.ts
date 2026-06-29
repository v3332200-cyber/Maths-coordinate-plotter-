export interface Point {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

export interface LinearEquation {
  id: string;
  type: 'slope-intercept' | 'vertical';
  m: number;      // slope for y = mx + c
  c: number;      // y-intercept for y = mx + c
  xVal?: number;  // constant value for vertical line x = k
  color: string;
  visible: boolean;
  label: string;  // e.g. "y = 2x - 3" or "x = 5"
}

export type GridSnap = 'none' | 'half' | 'integer';

export interface GridSettings {
  range: number; // e.g. 10 means x and y go from -10 to +10
  snap: GridSnap;
  showAxes: boolean;
  showGridLines: boolean;
  showQuadrantLabels: boolean;
  showPolarGuidelines: boolean;
  connectPoints: boolean;
  fillShape: boolean;
}

export type ActiveTab = 'plotter' | 'challenges' | 'solver' | 'ganita-manjari';

export type ChallengeType = 'plot' | 'read' | 'shape';

export interface Challenge {
  id: string;
  type: ChallengeType;
  instructions: string;
  target?: { x: number; y: number }; // For plot challenge
  targetShape?: string; // e.g., 'square', 'right_triangle', 'rectangle'
  targetArea?: number; // For advanced shape construction
  pointsToIdentify?: { x: number; y: number }; // For read challenge
  difficulty: 'easy' | 'medium' | 'hard';
  pointsReward: number;
}
