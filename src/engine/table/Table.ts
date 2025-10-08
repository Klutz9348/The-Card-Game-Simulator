import type { SnapPoint, Vector2 } from "../../types";
import { GameObject } from "../objects/GameObject";

export interface TableOptions {
  gridSize?: number;
  snapRadius?: number;
  enableGrid?: boolean;
}

export class Table {
  private gridSize: number;
  private snapRadius: number;
  private enableGrid: boolean;
  private readonly snapPoints = new Map<string, SnapPoint>();

  constructor(options: TableOptions = {}) {
    this.gridSize = options.gridSize ?? 1;
    this.snapRadius = options.snapRadius ?? this.gridSize / 2;
    this.enableGrid = options.enableGrid ?? true;
  }

  setGridSize(size: number): void {
    if (size <= 0) {
      throw new Error("Grid size must be positive");
    }
    this.gridSize = size;
  }

  setSnapRadius(radius: number): void {
    if (radius <= 0) {
      throw new Error("Snap radius must be positive");
    }
    this.snapRadius = radius;
  }

  toggleGrid(enabled: boolean): void {
    this.enableGrid = enabled;
  }

  addSnapPoint(point: SnapPoint): void {
    this.snapPoints.set(point.id, point);
  }

  removeSnapPoint(id: string): void {
    this.snapPoints.delete(id);
  }

  getSnapPoints(): SnapPoint[] {
    return Array.from(this.snapPoints.values());
  }

  place(object: GameObject, position: Vector2): Vector2 {
    const snapped = this.snapPosition(position);
    object.moveTo(snapped);
    return snapped;
  }

  snapPosition(position: Vector2): Vector2 {
    const customSnap = this.findSnapPoint(position);
    if (customSnap) {
      return customSnap.position;
    }

    if (!this.enableGrid) {
      return { ...position };
    }

    const snappedX = Math.round(position.x / this.gridSize) * this.gridSize;
    const snappedY = Math.round(position.y / this.gridSize) * this.gridSize;
    return { x: snappedX, y: snappedY };
  }

  private findSnapPoint(position: Vector2): SnapPoint | undefined {
    let closest: SnapPoint | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const point of this.snapPoints.values()) {
      const distance = this.distance(position, point.position);
      if (distance <= point.radius && distance < closestDistance) {
        closest = point;
        closestDistance = distance;
      }
    }

    if (!closest && this.snapRadius > 0) {
      for (const point of this.snapPoints.values()) {
        const distance = this.distance(position, point.position);
        if (distance <= this.snapRadius && distance < closestDistance) {
          closest = point;
          closestDistance = distance;
        }
      }
    }

    return closest;
  }

  private distance(a: Vector2, b: Vector2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }
}

export function isTable(value: unknown): value is Table {
  return value instanceof Table;
}
