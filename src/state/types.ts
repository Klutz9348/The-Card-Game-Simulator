export type Vector2 = {
  x: number;
  y: number;
};

export interface CardModel {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  faceUp: boolean;
  zoneId: string;
  position: Vector2;
  rotation: number;
  metadata?: Record<string, unknown>;
}

export type ZoneType = 'board' | 'hand' | 'discard' | 'deck';

export interface ZoneModel {
  id: string;
  name: string;
  type: ZoneType;
  position: Vector2;
  size: {
    width: number;
    height: number;
  };
  cards: string[];
  accepts?: ZoneType[];
  stacked?: boolean;
  faceDown?: boolean;
}

export interface SnapPreview {
  cardId: string;
  zoneId: string;
  position: Vector2;
}

export interface BoardStoreState {
  cards: Record<string, CardModel>;
  zones: Record<string, ZoneModel>;
  draggingCardId: string | null;
  hoveringZoneId: string | null;
  snapPreview: SnapPreview | null;
  recentlyMovedCardId: string | null;
  actions: BoardStoreActions;
}

export interface BoardStoreActions {
  upsertZones: (zones: ZoneModel[]) => void;
  upsertCards: (cards: CardModel[]) => void;
  moveCard: (cardId: string, zoneId: string, position: Vector2) => void;
  rotateCard: (cardId: string, rotation: number) => void;
  flipCard: (cardId: string) => void;
  setDraggingCard: (cardId: string | null) => void;
  setHoveringZone: (zoneId: string | null) => void;
  setSnapPreview: (preview: SnapPreview | null) => void;
  clearRecentlyMovedCard: () => void;
  ensureExampleState: (seed: () => { zones: ZoneModel[]; cards: CardModel[] }) => void;
}
