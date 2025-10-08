import { Card } from '@/engine/card';
import { CardState } from '@/types/state';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

type CardDictionary = Record<string, CardState>;

export interface CardStoreState {
  cards: CardDictionary;
  upsertCards: (cards: CardState[]) => void;
  flipCard: (cardId: string) => CardState | undefined;
  setCardZone: (cardId: string, zoneId: string | null) => CardState | undefined;
  removeCard: (cardId: string) => void;
}

const initialState: CardDictionary = {};

export const useCardStore = create<CardStoreState>()(
  subscribeWithSelector((set, get) => ({
    cards: initialState,
    upsertCards: (cards) =>
      set((state) => {
        const nextCards = { ...state.cards };
        cards.forEach((card) => {
          nextCards[card.id] = { ...card };
        });
        return { cards: nextCards };
      }),
    flipCard: (cardId) => {
      const target = get().cards[cardId];
      if (!target) {
        return undefined;
      }
      const engine = new Card({ ...target });
      engine.flip();
      const snapshot = engine.snapshot;
      set((state) => ({
        cards: {
          ...state.cards,
          [cardId]: { ...snapshot }
        }
      }));
      return get().cards[cardId];
    },
    setCardZone: (cardId, zoneId) => {
      const target = get().cards[cardId];
      if (!target) {
        return undefined;
      }
      const engine = new Card({ ...target });
      engine.moveToZone(zoneId);
      const snapshot = engine.snapshot;
      set((state) => ({
        cards: {
          ...state.cards,
          [cardId]: { ...snapshot }
        }
      }));
      return get().cards[cardId];
    },
    removeCard: (cardId) =>
      set((state) => {
        if (!state.cards[cardId]) {
          return state;
        }
        const nextCards = { ...state.cards };
        delete nextCards[cardId];
        return { cards: nextCards };
      })
  }))
);

export const cardsByZoneSelector = (zoneId: string) => (state: CardStoreState): CardState[] =>
  Object.values(state.cards).filter((card) => card.zoneId === zoneId);

export const cardsByOwnerSelector = (ownerId: string) => (state: CardStoreState): CardState[] =>
  Object.values(state.cards).filter((card) => card.ownerId === ownerId);
