import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { CardModel, ZoneModel } from '../state/types';
import { CardView, type CardSize } from './CardView';

export interface HandProps {
  zone: ZoneModel;
  cards: CardModel[];
  cardSize: CardSize;
  onFlipCard: (cardId: string) => void;
}

export const Hand = ({ zone, cards, cardSize, onFlipCard }: HandProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: zone.id,
    data: {
      type: 'zone',
      zoneId: zone.id
    }
  });

  const spread = Math.min(18, Math.max(8, 32 - cards.length));
  const fanOrigin = (cards.length - 1) / 2;
  const handMaxWidth = `${zone.size.width}px`;

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className="hand-zone"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 32,
        width: 'calc(100% - 64px)',
        maxWidth: handMaxWidth,
        height: zone.size.height,
        margin: '0 auto',
        borderRadius: 24,
        border: `2px dashed ${isOver ? '#5af5c6' : 'rgba(255,255,255,0.08)'}`,
        background: 'linear-gradient(180deg, rgba(17, 28, 41, 0.85), rgba(10, 15, 24, 0.9))',
        boxShadow: isOver ? '0 0 0 4px rgba(90, 245, 198, 0.35)' : '0 8px 20px rgba(0,0,0,0.35)',
        padding: '48px 24px 24px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'visible',
        zIndex: 30
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 32,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          opacity: 0.8
        }}
      >
        {zone.name}
      </div>
      {cards.map((card, index) => {
        const offset = index - fanOrigin;
        const rotation = offset * (spread * 0.35);
        const translateX = offset * (cardSize.width * 0.45);
        const translateY = Math.abs(offset) * -10;
        return (
          <motion.div
            key={card.id}
            layout
            style={{
              position: 'relative',
              transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
              transformOrigin: 'bottom center',
              zIndex: index,
              margin: '0 -32px'
            }}
          >
            <CardView
              card={card}
              cardSize={cardSize}
              style={{}}
              onFlip={onFlipCard}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default Hand;
