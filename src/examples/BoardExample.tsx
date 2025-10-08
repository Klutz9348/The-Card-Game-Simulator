import { useEffect } from 'react';
import { Board } from '../ui/Board';
import type { CardModel, ZoneModel } from '../state/types';
import { useBoardStore } from '../state/useBoardStore';

const CARD_WIDTH = 120;
const CARD_HEIGHT = 168;

export const seedExampleState = (): { zones: ZoneModel[]; cards: CardModel[] } => {
  const tableZone: ZoneModel = {
    id: 'zone-table',
    name: 'Table',
    type: 'board',
    position: { x: 0, y: 0 },
    size: { width: 1920, height: 1080 },
    cards: ['card-1', 'card-2']
  };

  const handZone: ZoneModel = {
    id: 'zone-hand',
    name: 'Player Hand',
    type: 'hand',
    position: { x: 0, y: 0 },
    size: { width: 960, height: 220 },
    cards: ['card-3', 'card-4', 'card-5']
  };

  const discardZone: ZoneModel = {
    id: 'zone-discard',
    name: 'Discard',
    type: 'discard',
    position: { x: 80, y: 720 },
    size: { width: 200, height: 220 },
    cards: []
  };

  const cards: CardModel[] = [
    {
      id: 'card-1',
      name: 'Arcane Burst',
      description: 'Deal 3 damage to any target and draw a card.',
      faceUp: true,
      zoneId: tableZone.id,
      position: { x: 220, y: 160 },
      metadata: { cost: 2, attack: 3 }
    },
    {
      id: 'card-2',
      name: 'Stone Golem',
      description: 'A sturdy defender summoned from the earth.',
      faceUp: false,
      zoneId: tableZone.id,
      position: { x: 480, y: 360 },
      metadata: { attack: 4, defense: 6 }
    },
    {
      id: 'card-3',
      name: 'Mystic Shield',
      description: 'Prevent the next 3 damage to you.',
      faceUp: true,
      zoneId: handZone.id,
      position: { x: 0, y: 0 }
    },
    {
      id: 'card-4',
      name: 'Thunder Strike',
      description: 'Deal 4 damage to an enemy creature.',
      faceUp: true,
      zoneId: handZone.id,
      position: { x: 0, y: 0 }
    },
    {
      id: 'card-5',
      name: 'Forest Guardian',
      description: 'Summon a 2/2 creature token.',
      faceUp: true,
      zoneId: handZone.id,
      position: { x: 0, y: 0 }
    }
  ];

  return {
    zones: [tableZone, handZone, discardZone],
    cards
  };
};

export const BoardExample = () => {
  const initialize = useBoardStore((state) => state.actions.ensureExampleState);

  useEffect(() => {
    initialize(seedExampleState);
  }, [initialize]);

  return <Board cardSize={{ width: CARD_WIDTH, height: CARD_HEIGHT }} />;
};

export default BoardExample;
