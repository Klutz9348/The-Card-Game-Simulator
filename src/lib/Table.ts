import type { Vector2 } from '../state/types';

export interface SnapOptions {
  gridSize?: number;
}

export const snap = (position: Vector2, options: SnapOptions = {}): Vector2 => {
  const gridSize = options.gridSize ?? 40;
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
};

export const clampToZone = (
  position: Vector2,
  zoneSize: { width: number; height: number },
  cardSize: { width: number; height: number }
): Vector2 => {
  return {
    x: Math.min(Math.max(position.x, 0), Math.max(zoneSize.width - cardSize.width, 0)),
    y: Math.min(Math.max(position.y, 0), Math.max(zoneSize.height - cardSize.height, 0))
  };
};
