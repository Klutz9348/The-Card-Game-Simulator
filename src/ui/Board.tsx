import {
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react';
import { snap, clampToZone } from '../lib/Table';
import { useGameStore } from '../state/useGameStore';
import type { CardModel, Vector2, ZoneModel } from '../state/types';
import { CardView, type CardSize } from './CardView';
import { Hand } from './Hand';
import { ZoneView } from './ZoneView';

export interface BoardProps {
  cardSize?: CardSize;
  gridSize?: number;
  background?: string;
}

const defaultBackground =
  'radial-gradient(circle at 20% 20%, rgba(29, 43, 76, 0.65), transparent 60%), radial-gradient(circle at 80% 20%, rgba(111, 27, 97, 0.55), transparent 55%), radial-gradient(circle at 50% 80%, rgba(36, 110, 160, 0.45), transparent 50%)';

export const Board = ({
  cardSize = { width: 120, height: 168 },
  gridSize = 40,
  background = defaultBackground
}: BoardProps) => {
  const zones = useGameStore((state) => state.zones);
  const cards = useGameStore((state) => state.cards);
  const draggingCardId = useGameStore((state) => state.draggingCardId);
  const snapPreview = useGameStore((state) => state.snapPreview);
  const { setDraggingCard, setHoveringZone, setSnapPreview, moveCard, flipCard } = useGameStore(
    (state) => state.actions
  );

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Vector2>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPointerPosition = useRef<Vector2 | null>(null);

  const zoneEntries = useMemo(() => Object.values(zones), [zones]);
  const previewZone = snapPreview ? zones[snapPreview.zoneId] : undefined;

  const draggingCard = draggingCardId ? cards[draggingCardId] : undefined;

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const cardId = String(event.active.id);
      setDraggingCard(cardId);
    },
    [setDraggingCard]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const cardId = String(event.active.id);
      const overZoneId = event.over?.data.current?.zoneId as string | undefined;
      setHoveringZone(overZoneId ?? null);

      if (!overZoneId) {
        setSnapPreview(null);
        return;
      }

      const zone = zones[overZoneId];
      const translatedRect = event.active.rect.current.translated;
      const overRect = event.over?.rect;
      if (!zone || !translatedRect || !overRect) {
        setSnapPreview(null);
        return;
      }

      const positionWithinZone = {
        x: (translatedRect.left - overRect.left) / scale,
        y: (translatedRect.top - overRect.top) / scale
      };

      const snapped = snap(positionWithinZone, { gridSize });
      const clamped = clampToZone(snapped, zone.size, cardSize);

      setSnapPreview({
        cardId,
        zoneId: overZoneId,
        position: clamped
      });
    },
    [cardSize, gridSize, scale, setHoveringZone, setSnapPreview, zones]
  );

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent) => {
      setDraggingCard(null);
      setHoveringZone(null);
      setSnapPreview(null);
    },
    [setDraggingCard, setHoveringZone, setSnapPreview]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const cardId = String(event.active.id);
      const overZoneId = event.over?.data.current?.zoneId as string | undefined;

      if (!overZoneId) {
        handleDragCancel(event);
        return;
      }

      const zone = zones[overZoneId];
      const translatedRect = event.active.rect.current.translated;
      const overRect = event.over?.rect;

      if (!zone || !translatedRect || !overRect) {
        handleDragCancel(event);
        return;
      }

      const positionWithinZone = {
        x: (translatedRect.left - overRect.left) / scale,
        y: (translatedRect.top - overRect.top) / scale
      };

      const snapped = snap(positionWithinZone, { gridSize });
      const clamped = clampToZone(snapped, zone.size, cardSize);

      moveCard(cardId, overZoneId, clamped);
    },
    [cardSize, gridSize, handleDragCancel, moveCard, scale, zones]
  );

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = useCallback((event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    setScale((previous) => {
      const next = Math.min(Math.max(previous + delta, 0.6), 2.2);
      return Number(next.toFixed(2));
    });
  }, []);

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback((event) => {
    if (event.button === 1 || event.button === 2 || event.shiftKey) {
      setIsPanning(true);
      lastPointerPosition.current = { x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }, []);

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (!isPanning || !lastPointerPosition.current) {
        return;
      }
      const deltaX = event.clientX - lastPointerPosition.current.x;
      const deltaY = event.clientY - lastPointerPosition.current.y;
      setOffset((previous) => ({ x: previous.x + deltaX, y: previous.y + deltaY }));
      lastPointerPosition.current = { x: event.clientX, y: event.clientY };
    },
    [isPanning]
  );

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = useCallback((event) => {
    if (isPanning) {
      setIsPanning(false);
      lastPointerPosition.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, [isPanning]);

  const boardContentStyle = useMemo<CSSProperties>(
    () => ({
      position: 'absolute',
      inset: 0,
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      transformOrigin: '0 0',
      background,
      backgroundSize: 'cover',
      borderRadius: 32,
      boxShadow: '0 30px 70px rgba(0, 0, 0, 0.45)',
      overflow: 'visible'
    }),
    [background, offset.x, offset.y, scale]
  );

  const boardGrid = useMemo<CSSProperties>(
    () => ({
      backgroundImage: `linear-gradient(transparent calc(${gridSize}px - 1px), rgba(255, 255, 255, 0.04) calc(${gridSize}px)), linear-gradient(90deg, transparent calc(${gridSize}px - 1px), rgba(255, 255, 255, 0.04) calc(${gridSize}px))`,
      backgroundSize: `${gridSize}px ${gridSize}px`
    }),
    [gridSize]
  );

  const renderZone = useCallback(
    (zone: ZoneModel) => {
      const zoneCards = zone.cards
        .map((id) => cards[id])
        .filter((card): card is CardModel => Boolean(card));

      if (zone.type === 'hand') {
        return (
          <Hand key={zone.id} zone={zone} cards={zoneCards} cardSize={cardSize} onFlipCard={flipCard} />
        );
      }

      return (
        <ZoneView
          key={zone.id}
          zone={zone}
          cards={zoneCards}
          cardSize={cardSize}
          onFlipCard={flipCard}
        />
      );
    },
    [cardSize, cards, flipCard]
  );

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#05070c',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setScale((value) => Number(Math.min(value + 0.1, 2.2).toFixed(2)))}
            style={controlButtonStyle}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setScale((value) => Number(Math.max(value - 0.1, 0.6).toFixed(2)))}
            style={controlButtonStyle}
          >
            −
          </button>
          <button type="button" onClick={() => setScale(1)} style={controlButtonStyle}>
            1:1
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setOffset({ x: 0, y: 0 })}
            style={controlButtonStyle}
          >
            Center
          </button>
        </div>
      </div>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <motion.div
          className="board-surface"
          style={{
            position: 'absolute',
            inset: 32,
            borderRadius: 32,
            overflow: 'hidden',
            cursor: isPanning ? 'grabbing' : 'default',
            background: 'rgba(4,9,16,0.9)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.55)'
          }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5, 11, 22, 0.7)'
            }}
          />
          <motion.div className="board-content" style={{ ...boardContentStyle, ...boardGrid }}>
            {snapPreview && previewZone ? (
              <motion.div
                layoutId="snap-preview"
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  left: previewZone.position.x + snapPreview.position.x,
                  top: previewZone.position.y + snapPreview.position.y,
                  width: cardSize.width,
                  height: cardSize.height,
                  borderRadius: 12,
                  border: '2px solid rgba(90, 245, 198, 0.65)',
                  background: 'rgba(90, 245, 198, 0.15)',
                  boxShadow: '0 0 0 3px rgba(90, 245, 198, 0.15)'
                }}
              />
            ) : null}
            {zoneEntries.map((zone) => renderZone(zone))}
          </motion.div>
        </motion.div>
        <DragOverlay adjustScale={false} dropAnimation={null}>
          {draggingCard ? (
            <CardView
              card={draggingCard}
              cardSize={cardSize}
              overlay
              draggable={false}
              style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

const controlButtonStyle: CSSProperties = {
  background: 'rgba(17, 23, 36, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 8,
  color: '#f5f7fa',
  padding: '6px 12px',
  cursor: 'pointer'
};

export default Board;
