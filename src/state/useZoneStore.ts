import { Deck } from '@/engine/deck';
import { Zone } from '@/engine/zone';
import { CardState, ZoneState } from '@/types/state';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useCardStore } from './useCardStore';

type ZoneDictionary = Record<string, ZoneState>;

export interface ZoneStoreState {
  zones: ZoneDictionary;
  upsertZones: (zones: ZoneState[]) => void;
  moveCardToZone: (cardId: string, targetZoneId: string | null) => void;
  drawCard: (zoneId: string, destinationZoneId?: string) => CardState | undefined;
  shuffleDeck: (zoneId: string, random?: () => number) => void;
}

const initialState: ZoneDictionary = {};

export const useZoneStore = create<ZoneStoreState>()(
  subscribeWithSelector((set, get) => ({
    zones: initialState,
    upsertZones: (zones) =>
      set((state) => {
        const nextZones = { ...state.zones };
        zones.forEach((zone) => {
          nextZones[zone.id] = { ...zone };
        });
        return { zones: nextZones };
      }),
    moveCardToZone: (cardId, targetZoneId) => {
      const card = useCardStore.getState().cards[cardId];
      if (!card) {
        return;
      }

      const previousZoneId = card.zoneId;
      const zonesToUpdate: string[] = [];

      set((state) => {
        const nextZones = { ...state.zones };
        if (previousZoneId && nextZones[previousZoneId]) {
          const engine = new Zone(nextZones[previousZoneId]);
          nextZones[previousZoneId] = engine.onLeave(card);
          zonesToUpdate.push(previousZoneId);
        }
        if (targetZoneId) {
          const target = nextZones[targetZoneId];
          if (!target) {
            throw new Error(`Zone ${targetZoneId} does not exist.`);
          }
          const engine = new Zone(target);
          nextZones[targetZoneId] = engine.onEnter({ ...card, zoneId: targetZoneId });
          zonesToUpdate.push(targetZoneId);
        }
        return { zones: nextZones };
      });

      useCardStore.getState().setCardZone(cardId, targetZoneId);
    },
    drawCard: (zoneId, destinationZoneId) => {
      const zone = get().zones[zoneId];
      if (!zone) {
        throw new Error(`Zone ${zoneId} does not exist.`);
      }
      if (zone.type !== 'deck') {
        throw new Error(`Zone ${zoneId} is not a deck.`);
      }

      const cardMap = useCardStore.getState().cards;
      const deck = Deck.fromZone(zone, cardMap);
      const drawn = deck.draw();
      const updatedZone = deck.toZone(zone);

      set((state) => ({
        zones: {
          ...state.zones,
          [zoneId]: updatedZone
        }
      }));

      if (drawn) {
        useCardStore.getState().setCardZone(drawn.id, null);
        if (destinationZoneId) {
          get().moveCardToZone(drawn.id, destinationZoneId);
        }
      }

      return drawn;
    },
    shuffleDeck: (zoneId, random) => {
      const zone = get().zones[zoneId];
      if (!zone) {
        throw new Error(`Zone ${zoneId} does not exist.`);
      }
      if (zone.type !== 'deck') {
        throw new Error(`Zone ${zoneId} is not a deck.`);
      }

      const cardMap = useCardStore.getState().cards;
      const deck = Deck.fromZone(zone, cardMap);
      deck.shuffle(random);
      const updatedZone = deck.toZone(zone);

      set((state) => ({
        zones: {
          ...state.zones,
          [zoneId]: updatedZone
        }
      }));
    }
  }))
);

export const zoneByIdSelector = (zoneId: string) => (state: ZoneStoreState): ZoneState | undefined =>
  state.zones[zoneId];
