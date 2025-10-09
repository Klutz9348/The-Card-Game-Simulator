import { useCallback, useMemo, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { CardModel } from '../state/types';
import { useBoardStore } from '../state/useBoardStore';
import rotateIcon from '../assets/旋转.svg';

type RotationCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

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
}

const cardShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';

const normalizeRotation = (value: number): number => {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const snapRotation = (value: number): number => {
  const step = 15;
  return Math.round(value / step) * step;
};

export const CardView = ({
  card,
  cardSize,
  draggable = true,
  overlay = false,
  className,
  style,
  onFlip
}: CardViewProps) => {
  const recentlyMovedCardId = useBoardStore((state) => state.recentlyMovedCardId);
  const rotateCard = useBoardStore((state) => state.actions.rotateCard);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: !draggable || overlay,
    data: {
      type: 'card',
      cardId: card.id,
      zoneId: card.zoneId
    }
  });

  const draggableRef = useRef<HTMLDivElement | null>(null);
  const rotationContainerRef = useRef<HTMLDivElement | null>(null);
  const rotationSession = useRef<{
    pointerId: number | null;
    startAngle: number;
    startRotation: number;
  }>({
    pointerId: null,
    startAngle: 0,
    startRotation: 0
  });
  const [hoveredCorner, setHoveredCorner] = useState<RotationCorner | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  const handleNodeRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      draggableRef.current = node;
    },
    [setNodeRef]
  );

  const rotationDegrees = card.rotation ?? 0;

  const transformStyle = useMemo(() => {
    if (!transform) {
      return undefined;
    }
    const { x, y } = transform;
    return {
      transform: `translate3d(${x}px, ${y}px, 0)`
    } satisfies CSSProperties;
  }, [transform]);

  const isRecentlyMoved = !overlay && recentlyMovedCardId === card.id;
  const effectiveShadow = card.faceUp ? cardShadow : null;

  const mergedStyle: CSSProperties = {
    width: cardSize.width,
    height: cardSize.height,
    borderRadius: 12,
    position: 'relative',
    transformStyle: 'preserve-3d',
    cursor: isRotating ? 'grabbing' : draggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
    opacity: isDragging ? 0 : 1,
    filter: isRecentlyMoved ? 'brightness(1.08)' : 'none',
    transition: 'filter 0.25s ease',
    ...style,
    ...(transformStyle ?? {})
  };

  const handlePointerEnter = useCallback(
    (corner: RotationCorner) => () => {
      if (!overlay) {
        setHoveredCorner(corner);
      }
    },
    [overlay]
  );

  const handlePointerLeave = useCallback(() => {
    if (!isRotating) {
      setHoveredCorner(null);
    }
  }, [isRotating]);

  const beginRotation = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, corner: RotationCorner) => {
      if (overlay) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      const element = rotationContainerRef.current ?? draggableRef.current;
      if (!element) {
        return;
      }
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      rotationSession.current = {
        pointerId: event.pointerId,
        startAngle,
        startRotation: rotationDegrees
      };
      setIsRotating(true);
      setHoveredCorner(corner);
      (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    },
    [overlay, rotationDegrees]
  );

  const updateRotation = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isRotating || rotationSession.current.pointerId !== event.pointerId) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      const element = rotationContainerRef.current ?? draggableRef.current;
      if (!element) {
        return;
      }
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const currentAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      const deltaRadians = currentAngle - rotationSession.current.startAngle;
      const deltaDegrees = (deltaRadians * 180) / Math.PI;
      const rawRotation = rotationSession.current.startRotation + deltaDegrees;
      const snapped = snapRotation(rawRotation);
      const nextRotation = normalizeRotation(snapped);
      rotateCard(card.id, nextRotation);
    },
    [card.id, isRotating, rotateCard]
  );

  const endRotation = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (rotationSession.current.pointerId !== event.pointerId) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    (event.currentTarget as HTMLDivElement).releasePointerCapture(event.pointerId);
    rotationSession.current = { pointerId: null, startAngle: 0, startRotation: 0 };
    setIsRotating(false);
  }, []);

  const rotationHandles = useMemo<
    Array<{
      corner: RotationCorner;
      style: CSSProperties;
      iconTransform: string;
    }>
  >(
    () => [
      { corner: 'top-left', style: { top: -24, left: -24 }, iconTransform: 'scale(-1, -1)' },
      { corner: 'top-right', style: { top: -24, right: -24 }, iconTransform: 'scale(1, -1)' },
      { corner: 'bottom-left', style: { bottom: -24, left: -24 }, iconTransform: 'scale(-1, 1)' },
      { corner: 'bottom-right', style: { bottom: -24, right: -24 }, iconTransform: 'scale(1, 1)' }
    ],
    []
  );

  const rotationWrapperStyle = useMemo<CSSProperties>(
    () => ({
      width: '100%',
      height: '100%',
      position: 'relative',
      transform: `rotate(${rotationDegrees}deg)`,
      transformOrigin: '50% 50%',
      borderRadius: 12,
      boxSizing: 'border-box',
      border: isRecentlyMoved ? '3px solid rgba(90, 245, 198, 0.6)' : '3px solid transparent',
      boxShadow: [
        effectiveShadow,
        isRecentlyMoved ? '0 0 0 4px rgba(90, 245, 198, 0.25)' : null
      ]
        .filter(Boolean)
        .join(', ') || undefined,
      transition: 'box-shadow 0.25s ease'
    }),
    [effectiveShadow, isRecentlyMoved, rotationDegrees]
  );

  return (
    <motion.div
      ref={handleNodeRef}
      className={className}
      layout
      layoutId={card.id}
      data-card-interactive={overlay ? undefined : 'true'}
      style={mergedStyle}
      onDoubleClick={() => onFlip?.(card.id)}
      {...listeners}
      {...attributes}
    >
      <div
        ref={rotationContainerRef}
        style={rotationWrapperStyle}
        onPointerLeave={handlePointerLeave}
        data-card-rotation-wrapper
      >
        {!overlay
          ? rotationHandles.map(({ corner, style: cornerStyle, iconTransform }) => {
              const isActive = hoveredCorner === corner;
              return (
                <div
                  key={corner}
                  onPointerEnter={handlePointerEnter(corner)}
                  onPointerLeave={handlePointerLeave}
                  style={{
                    position: 'absolute',
                    width: 48,
                    height: 48,
                    pointerEvents: overlay ? 'none' : 'auto',
                    ...cornerStyle
                  }}
                  >
                    <div
                      data-card-interactive="true"
                      onPointerDown={(event) => beginRotation(event, corner)}
                      onPointerMove={updateRotation}
                    onPointerUp={endRotation}
                    onPointerCancel={endRotation}
                      style={{
                        width: 32,
                        height: 32,
                        margin: 8,
                        borderRadius: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(14, 20, 30, 0.86)',
                        border: '1px solid transparent',
                        boxShadow: '0 6px 14px rgba(0, 0, 0, 0.35)',
                        cursor: isRotating ? 'grabbing' : 'grab',
                        opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scale(1)' : 'scale(0.82)',
                      transition: 'opacity 0.15s ease, transform 0.15s ease',
                      zIndex: 3,
                      pointerEvents: overlay ? 'none' : 'auto'
                    }}
                  >
                    <img
                      src={rotateIcon}
                      alt="Rotate card"
                      style={{
                        width: 18,
                        height: 18,
                        pointerEvents: 'none',
                        transform: iconTransform
                      }}
                    />
                  </div>
                </div>
              );
            })
          : null}
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
      </div>
    </motion.div>
  );
};

export default CardView;
