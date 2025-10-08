import { create } from 'zustand';
import type {
  BoardStoreState,
  CardModel,
  SnapPreview,
  Vector2,
  ZoneModel
} from './types';

const buildRecord = <T extends { id: string }>(items: T[]): Record<string, T> =>
  items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

export const useBoardStore = create<BoardStoreState>((set, get) => ({
  cards: {},
  zones: {},
  draggingCardId: null,
  hoveringZoneId: null,
  snapPreview: null,
  actions: {
    upsertZones: (zones: ZoneModel[]) => {
      set((state) => {
        const updated = { ...state.zones };
        zones.forEach((zone) => {
          const existing = updated[zone.id];
          updated[zone.id] = {
            ...zone,
            cards: zone.cards ?? existing?.cards ?? []
          };
        });
        return { zones: updated };
      });
    },
    upsertCards: (cards: CardModel[]) => {
      set((state) => {
        const zones = { ...state.zones };
        const nextCards = { ...state.cards };
        cards.forEach((card) => {
          nextCards[card.id] = card;
          const zone = zones[card.zoneId];
          if (zone) {
            if (!zone.cards.includes(card.id)) {
              zones[card.zoneId] = {
                ...zone,
                cards: [...zone.cards, card.id]
              };
            }
          } else {
            zones[card.zoneId] = {
              id: card.zoneId,
              name: card.zoneId,
              type: 'board',
              position: { x: 0, y: 0 },
              size: { width: 200, height: 280 },
              cards: [card.id]
            };
          }
        });
        return { cards: nextCards, zones };
      });
    },
    moveCard: (cardId: string, zoneId: string, position: Vector2) => {
      set((state) => {
        const card = state.cards[cardId];
        if (!card) {
          return state;
        }

        const updatedCards = {
          ...state.cards,
          [cardId]: {
            ...card,
            zoneId,
            position
          }
        };

        const zones = { ...state.zones };
        const previousZone = zones[card.zoneId];
        if (previousZone) {
          zones[card.zoneId] = {
            ...previousZone,
            cards: previousZone.cards.filter((id) => id !== cardId)
          };
        }

        const targetZone = zones[zoneId];
        if (targetZone) {
          zones[zoneId] = {
            ...targetZone,
            cards: targetZone.cards.includes(cardId)
              ? targetZone.cards
              : [...targetZone.cards, cardId]
          };
        }

        return {
          cards: updatedCards,
          zones,
          draggingCardId: null,
          hoveringZoneId: null,
          snapPreview: null
        };
      });
    },
    flipCard: (cardId: string) => {
      set((state) => {
        const card = state.cards[cardId];
        if (!card) {
          return state;
        }
        return {
          cards: {
            ...state.cards,
            [cardId]: {
              ...card,
              faceUp: !card.faceUp
            }
          }
        };
      });
    },
    setDraggingCard: (cardId: string | null) => {
      set({ draggingCardId: cardId });
    },
    setHoveringZone: (zoneId: string | null) => {
      set({ hoveringZoneId: zoneId });
    },
    setSnapPreview: (preview: SnapPreview | null) => {
      set({ snapPreview: preview });
    },
    ensureExampleState: (seed) => {
      const { zones } = get();
      if (Object.keys(zones).length > 0) {
        return;
      }
      const { zones: seedZones, cards: seedCards } = seed();
      set({
        zones: buildRecord(seedZones),
        cards: buildRecord(seedCards)
      });
    }
  }
}));
