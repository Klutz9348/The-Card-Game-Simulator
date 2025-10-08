import { create } from 'zustand';
import type {
  CardModel,
  GameStoreActions,
  GameStoreState,
  SnapPreview,
  Vector2,
  ZoneModel
} from './types';

const buildRecord = <T extends { id: string }>(items: T[]): Record<string, T> =>
  items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

export const useGameStore = create<GameStoreState>((set, get) => ({
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

export type UseGameStore = typeof useGameStore;
import { TurnManager } from '@/engine/game';
import { CardState, GameConfig, GameState, PlayerState, TurnState } from '@/types/state';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useCardStore } from './useCardStore';
import { useZoneStore } from './useZoneStore';

type GameSlice = Pick<GameState, 'players' | 'config' | 'turn'>;

export interface GameStoreState extends GameSlice {
  initialize: (players: PlayerState[], config: GameConfig) => void;
  advancePhase: () => void;
  setCurrentPlayer: (playerId: string) => void;
  getCurrentPhase: () => string;
  getCurrentPlayerHand: () => CardState[];
}

const defaultConfig: GameConfig = {
  allowSpectators: true,
  maxPlayers: 2,
  phases: ['draw', 'main', 'end'],
  turnOrder: []
};

const defaultTurn: TurnState = {
  currentPlayerId: '',
  turnCount: 1,
  phaseIndex: 0
};

export const useGameStore = create<GameStoreState>()(
  subscribeWithSelector((set, get) => ({
    players: {},
    config: defaultConfig,
    turn: defaultTurn,
    initialize: (players, config) => {
      const playersMap = players.reduce<Record<string, PlayerState>>((acc, player) => {
        acc[player.id] = { ...player };
        return acc;
      }, {});
      const initialPlayer = config.turnOrder[0] ?? '';
      set({
        players: playersMap,
        config: { ...config },
        turn: {
          currentPlayerId: initialPlayer,
          phaseIndex: 0,
          turnCount: 1
        }
      });
    },
    advancePhase: () => {
      const state = get();
      if (!state.config.phases.length || !state.config.turnOrder.length) {
        return;
      }
      const manager = new TurnManager(state.config);
      const nextTurn = manager.advance(state.turn);
      set({ turn: nextTurn });
    },
    setCurrentPlayer: (playerId) => {
      const state = get();
      if (!state.config.turnOrder.length) {
        return;
      }
      const manager = new TurnManager(state.config);
      const nextTurn = manager.setCurrentPlayer(state.turn, playerId);
      set({ turn: nextTurn });
    },
    getCurrentPhase: () => {
      const state = get();
      return state.config.phases[state.turn.phaseIndex] ?? '';
    },
    getCurrentPlayerHand: () => {
      const cardState = useCardStore.getState();
      const zoneState = useZoneStore.getState();
      const currentPlayerId = get().turn.currentPlayerId;
      return Object.values(cardState.cards).filter((card) => {
        if (card.ownerId !== currentPlayerId || !card.zoneId) {
          return false;
        }
        const zone = zoneState.zones[card.zoneId];
        return zone?.type === 'hand';
      });
    }
  }))
);

export const currentPlayerSelector = (state: GameStoreState) =>
  state.players[state.turn.currentPlayerId];

export const currentPhaseSelector = (state: GameStoreState) => state.getCurrentPhase();
