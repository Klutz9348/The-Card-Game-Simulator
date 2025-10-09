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
import { useBoardStore } from '../state/useBoardStore';
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
  gridSize = 16,
  background = defaultBackground
}: BoardProps) => {
  const zones = useBoardStore((state) => state.zones);
  const cards = useBoardStore((state) => state.cards);
  const draggingCardId = useBoardStore((state) => state.draggingCardId);
  const { setDraggingCard, setHoveringZone, moveCard, flipCard } = useBoardStore(
    (state) => state.actions
  );

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Vector2>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPointerPosition = useRef<Vector2 | null>(null);

  const zoneEntries = useMemo(() => Object.values(zones), [zones]);
  const handZones = useMemo(() => zoneEntries.filter((zone) => zone.type === 'hand'), [zoneEntries]);
  const boardZones = useMemo(() => zoneEntries.filter((zone) => zone.type !== 'hand'), [zoneEntries]);

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
        return;
      }

      const zone = zones[overZoneId];
      if (!zone) {
        return;
      }

      const initialRect = event.active.rect.current.initial;
      if (!initialRect) {
        return;
      }

      const currentLeft = initialRect.left + event.delta.x;
      const currentTop = initialRect.top + event.delta.y;

      if (zone.type === 'hand') {
        return;
      }

      const overRect = event.over?.rect;
      if (!overRect) {
        return;
      }

      const positionWithinZone = {
        x: (currentLeft - overRect.left) / scale,
        y: (currentTop - overRect.top) / scale
      };

      const snapped = snap(positionWithinZone, { gridSize });
      const clamped = clampToZone(snapped, zone.size, cardSize);

    },
    [cardSize, gridSize, scale, setHoveringZone, zones]
  );

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent) => {
      setDraggingCard(null);
      setHoveringZone(null);
    },
    [setDraggingCard, setHoveringZone]
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
      const overRect = event.over?.rect;

      if (!zone || !overRect) {
        handleDragCancel(event);
        return;
      }

      const initialRect = event.active.rect.current.initial;
      if (!initialRect) {
        handleDragCancel(event);
        return;
      }

      const currentLeft = initialRect.left + event.delta.x;
      const currentTop = initialRect.top + event.delta.y;

      if (zone.type === 'hand') {
        moveCard(
          cardId,
          overZoneId,
          {
            x: (zone.size.width - cardSize.width) / 2,
            y: zone.size.height - cardSize.height - 16
          }
        );
        return;
      }

      const positionWithinZone = {
        x: (currentLeft - overRect.left) / scale,
        y: (currentTop - overRect.top) / scale
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
    const target = event.target;
    const targetElement = target instanceof HTMLElement ? target : null;
    const isCardInteraction = targetElement?.closest('[data-card-interactive="true"]');

    if (isCardInteraction) {
      return;
    }

    const isPrimaryButton = event.button === 0;
    const isAuxiliaryButton = event.button === 1 || event.button === 2;
    const shouldPan = isPrimaryButton || isAuxiliaryButton || event.shiftKey;

    if (!shouldPan) {
      return;
    }

    setIsPanning(true);
    lastPointerPosition.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
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
      borderRadius: 0,
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55)',
      overflow: 'visible'
    }),
    [background, offset.x, offset.y, scale]
  );

  const GRID_EXTENT = 4096;

  const gridOverlayStyle = useMemo<CSSProperties>(
    () => ({
      position: 'absolute',
      top: -GRID_EXTENT,
      right: -GRID_EXTENT,
      bottom: -GRID_EXTENT,
      left: -GRID_EXTENT,
      backgroundColor: 'rgba(8, 14, 24, 0.9)',
      backgroundImage: `
        linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
        linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
      `,
      backgroundSize: `
        ${gridSize}px ${gridSize}px,
        ${gridSize}px ${gridSize}px,
        ${gridSize * 5}px ${gridSize * 5}px,
        ${gridSize * 5}px ${gridSize * 5}px
      `,
      backgroundPosition: '0 0',
      opacity: 0.9,
      pointerEvents: 'none'
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
    [cardSize, cards, flipCard, scale]
  );

  const draggingCard = draggingCardId ? cards[draggingCardId] : null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
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
            inset: 0,
            borderRadius: 0,
            overflow: 'hidden',
            cursor: isPanning ? 'grabbing' : 'default',
            background: 'rgba(4,9,16,0.85)'
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
          <motion.div className="board-content" style={boardContentStyle}>
            <div style={gridOverlayStyle} />
            {boardZones.map((zone) => renderZone(zone))}
          </motion.div>
        </motion.div>
        {handZones.map((zone) => {
          const zoneCards = zone.cards
            .map((id) => cards[id])
            .filter((card): card is CardModel => Boolean(card));
          return (
            <Hand key={zone.id} zone={zone} cards={zoneCards} cardSize={cardSize} onFlipCard={flipCard} />
          );
        })}
        <DragOverlay dropAnimation={null}>
          {draggingCard ? (
            <CardView
              card={draggingCard}
              cardSize={cardSize}
              draggable={false}
              overlay
              style={{ pointerEvents: 'none' }}
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
