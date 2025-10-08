import { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { CardModel } from '../state/types';

export interface CardSize {
  width: number;
  height: number;
}

export interface CardViewProps {
  card: CardModel;
  cardSize: CardSize;
  draggable?: boolean;
  overlay?: boolean;
  className?: string;
  style?: CSSProperties;
  onFlip?: (cardId: string) => void;
  dragScale?: number;
}

const cardShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';

export const CardView = ({
  card,
  cardSize,
  draggable = true,
  overlay = false,
  className,
  style,
  onFlip,
  dragScale = 1
}: CardViewProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: !draggable || overlay,
    data: {
      type: 'card',
      cardId: card.id,
      zoneId: card.zoneId
    }
  });

  const dragStyle = useMemo(() => {
    if (!transform) {
      return undefined;
    }
    const { x, y } = transform;
    const scaleFactor = dragScale || 1;
    return {
      transform: `translate3d(${x / scaleFactor}px, ${y / scaleFactor}px, 0)`
    } satisfies CSSProperties;
  }, [dragScale, transform]);

  const mergedStyle: CSSProperties = {
    width: cardSize.width,
    height: cardSize.height,
    borderRadius: 12,
    position: 'relative',
    transformStyle: 'preserve-3d',
    cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
    boxShadow: card.faceUp ? cardShadow : 'none',
    ...style,
    ...(dragStyle ?? {})
  };

  return (
    <motion.div
      ref={setNodeRef}
      className={className}
      layout
      layoutId={card.id}
      style={mergedStyle}
      onDoubleClick={() => onFlip?.(card.id)}
      {...listeners}
      {...attributes}
    >
      <motion.div
        className="card-inner"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 12,
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          background: card.faceUp
            ? 'linear-gradient(135deg, rgba(35, 31, 64, 0.95), rgba(119, 42, 126, 0.95))'
            : 'linear-gradient(135deg, rgba(24, 28, 33, 0.95), rgba(55, 59, 68, 0.95))'
        }}
        animate={{ rotateY: card.faceUp ? 0 : 180 }}
        initial={false}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.div
          className="card-face card-face--front"
          style={{
            position: 'absolute',
            inset: 0,
            padding: '12px 14px',
            backfaceVisibility: 'hidden',
            color: '#fdfdff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.4 }}>{card.name}</div>
          <div style={{ fontSize: 12, lineHeight: 1.4, opacity: 0.9 }}>{card.description}</div>
          {card.metadata ? (
            <div
              style={{
                display: 'flex',
                gap: 8,
                fontSize: 11,
                opacity: 0.85,
                flexWrap: 'wrap'
              }}
            >
              {Object.entries(card.metadata).map(([key, value]) => (
                <span key={key}>
                  {key}: {String(value)}
                </span>
              ))}
            </div>
          ) : null}
        </motion.div>
        <motion.div
          className="card-face card-face--back"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 1,
            color: '#f0f0f0',
            background: 'linear-gradient(135deg, rgba(17, 84, 173, 0.9), rgba(17, 132, 179, 0.9))'
          }}
        >
          {card.name}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CardView;
