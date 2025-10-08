import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { CardModel, ZoneModel } from '../state/types';
import { CardView, type CardSize } from './CardView';

export interface ZoneViewProps {
  zone: ZoneModel;
  cards: CardModel[];
  cardSize: CardSize;
  onFlipCard: (cardId: string) => void;
  dragScale?: number;
}

export const ZoneView = ({ zone, cards, cardSize, onFlipCard, dragScale = 1 }: ZoneViewProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: zone.id,
    data: {
      type: 'zone',
      zoneId: zone.id
    }
  });

  const stacked = zone.stacked ?? false;

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className="zone-view"
      style={{
        position: 'absolute',
        left: zone.position.x,
        top: zone.position.y,
        width: zone.size.width,
        height: zone.size.height,
        borderRadius: 16,
        border: `2px dashed ${isOver ? '#4dd5ff' : 'rgba(255,255,255,0.1)'}`,
        background: 'rgba(18, 21, 28, 0.6)',
        boxShadow: isOver ? '0 0 0 4px rgba(77, 213, 255, 0.35)' : '0 8px 30px rgba(0, 0, 0, 0.2)',
        transition: 'box-shadow 0.2s ease, border 0.2s ease',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 16,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          opacity: 0.8
        }}
      >
        {zone.name}
      </div>
      <div style={{ position: 'absolute', inset: 0 }}>
        {cards.map((card, index) => {
          const positionStyle = stacked
            ? {
                left: 20 + index * 3,
                top: 40 + index * 3
              }
            : {
                left: card.position.x,
                top: card.position.y
              };

          return (
            <CardView
              key={card.id}
              card={card}
              cardSize={cardSize}
              style={{
                position: 'absolute',
                ...positionStyle
              }}
              dragScale={dragScale}
              onFlip={onFlipCard}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default ZoneView;
