export type ZoneType = 'deck' | 'hand' | 'discard' | 'battlefield' | 'custom';

export interface CardState {
  id: string;
  name: string;
  ownerId: string;
  zoneId: string | null;
  faceUp: boolean;
  metadata?: Record<string, unknown>;
}

export interface ZoneState {
  id: string;
  name: string;
  type: ZoneType;
  ownerId?: string;
  revealed: boolean;
  cards: string[];
}

export interface PlayerState {
  id: string;
  name: string;
  life: number;
}

export interface GameConfig {
  allowSpectators: boolean;
  maxPlayers: number;
  phases: string[];
  turnOrder: string[];
}

export interface TurnState {
  currentPlayerId: string;
  turnCount: number;
  phaseIndex: number;
}

export interface GameState {
  players: Record<string, PlayerState>;
  cards: Record<string, CardState>;
  zones: Record<string, ZoneState>;
  config: GameConfig;
  turn: TurnState;
}
