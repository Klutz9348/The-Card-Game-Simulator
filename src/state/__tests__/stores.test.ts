import { describe, expect, it, beforeEach } from 'vitest';
import { useCardStore } from '@/state/useCardStore';
import { useZoneStore } from '@/state/useZoneStore';
import { useGameStore } from '@/state/useGameStore';
import { CardState, GameConfig, PlayerState, ZoneState } from '@/types/state';

const baseConfig: GameConfig = {
  allowSpectators: false,
  maxPlayers: 2,
  phases: ['draw', 'main', 'end'],
  turnOrder: ['p1', 'p2']
};

const deckZone: ZoneState = {
  id: 'z-deck',
  name: 'Player Deck',
  type: 'deck',
  ownerId: 'p1',
  revealed: false,
  cards: []
};

const handZone: ZoneState = {
  id: 'z-hand',
  name: 'Player Hand',
  type: 'hand',
  ownerId: 'p1',
  revealed: true,
  cards: []
};

const playerOne: PlayerState = {
  id: 'p1',
  name: 'Player One',
  life: 20
};

const playerTwo: PlayerState = {
  id: 'p2',
  name: 'Player Two',
  life: 20
};

const createCard = (id: string, zoneId: string | null, faceUp = false): CardState => ({
  id,
  name: `Card ${id}`,
  ownerId: 'p1',
  zoneId,
  faceUp
});

beforeEach(() => {
  useCardStore.setState({ cards: {} });
  useZoneStore.setState({ zones: {} });
  useGameStore.setState({
    players: {},
    config: { ...baseConfig, turnOrder: [] },
    turn: { currentPlayerId: '', phaseIndex: 0, turnCount: 1 }
  });
});

describe('useCardStore', () => {
  it('flips cards using the engine and notifies subscribers', () => {
    const card = createCard('c1', 'z-hand', false);
    useCardStore.getState().upsertCards([card]);

    const received: boolean[] = [];
    const unsubscribe = useCardStore.subscribe(
      (state) => state.cards['c1']?.faceUp ?? false,
      (faceUp) => {
        received.push(faceUp);
      }
    );

    useCardStore.getState().flipCard('c1');
    useCardStore.getState().flipCard('c1');

    unsubscribe();

    expect(received).toEqual([true, false]);
    expect(useCardStore.getState().cards['c1']?.faceUp).toBe(false);
  });
});

describe('useZoneStore', () => {
  it('moves a card between zones using zone hooks', () => {
    const card = createCard('c-move', 'z-deck');
    const deck = { ...deckZone, cards: [card.id] };
    useCardStore.getState().upsertCards([card]);
    useZoneStore.getState().upsertZones([deck, { ...handZone }]);

    useZoneStore.getState().moveCardToZone(card.id, handZone.id);

    const zoneState = useZoneStore.getState().zones;
    expect(zoneState[deck.id].cards).not.toContain(card.id);
    expect(zoneState[handZone.id].cards).toContain(card.id);
    expect(useCardStore.getState().cards[card.id]?.zoneId).toBe(handZone.id);
  });

  it('draws and shuffles cards via deck engine', () => {
    const cards = [createCard('c1', deckZone.id), createCard('c2', deckZone.id), createCard('c3', deckZone.id)];
    useCardStore.getState().upsertCards(cards);
    useZoneStore.getState().upsertZones([{ ...deckZone, cards: cards.map((card) => card.id) }]);

    useZoneStore.getState().shuffleDeck(deckZone.id, (() => {
      const sequence = [0.9, 0.1];
      return () => sequence.shift() ?? 0;
    })());

    expect(useZoneStore.getState().zones[deckZone.id].cards).toEqual(['c2', 'c1', 'c3']);

    const drawn = useZoneStore.getState().drawCard(deckZone.id);

    expect(drawn?.id).toBe('c2');
    expect(useZoneStore.getState().zones[deckZone.id].cards).toEqual(['c1', 'c3']);
    expect(useCardStore.getState().cards['c2']?.zoneId).toBeNull();
  });
});

describe('useGameStore', () => {
  it('advances the phase and derives current hand cards', () => {
    const handCard = createCard('hand-1', handZone.id, true);
    const deckCard = createCard('deck-1', deckZone.id, false);
    useCardStore.getState().upsertCards([handCard, deckCard]);
    useZoneStore.getState().upsertZones([
      { ...handZone, cards: [handCard.id] },
      { ...deckZone, cards: [deckCard.id] }
    ]);

    useGameStore.getState().initialize([playerOne, playerTwo], baseConfig);

    const received: number[] = [];
    const unsubscribe = useGameStore.subscribe(
      (state) => state.turn.phaseIndex,
      (phaseIndex) => {
        received.push(phaseIndex);
      }
    );

    useGameStore.getState().advancePhase();
    useGameStore.getState().advancePhase();

    unsubscribe();

    expect(received).toEqual([1, 2]);
    expect(useGameStore.getState().getCurrentPhase()).toBe('end');

    const currentHand = useGameStore.getState().getCurrentPlayerHand();
    expect(currentHand.map((card) => card.id)).toEqual([handCard.id]);
  });
});
