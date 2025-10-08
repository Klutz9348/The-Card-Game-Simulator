import type { Vector2 } from "../../types";
import { GameObject } from "../objects/GameObject";
import { Zone, type ZoneOptions } from "./Zone";

export type LayoutStrategy<T extends GameObject> = (object: T, index: number, zone: LayoutZone<T>) => Vector2;

export interface LayoutZoneOptions<T extends GameObject = GameObject> extends ZoneOptions {
  origin?: Vector2;
  spacing?: Vector2;
  columns?: number;
  strategy?: LayoutStrategy<T>;
}

export class LayoutZone<T extends GameObject = GameObject> extends Zone<T> {
  private strategy: LayoutStrategy<T>;
  private origin: Vector2;
  private spacing: Vector2;
  private columns?: number;

  constructor(name: string, options: LayoutZoneOptions<T> = {}) {
    super(name, options);
    this.origin = options.origin ?? { x: 0, y: 0 };
    this.spacing = options.spacing ?? { x: 1, y: 1 };
    this.columns = options.columns;
    this.strategy = options.strategy ?? ((object, index) => this.defaultStrategy(object, index));
  }

  setStrategy(strategy: LayoutStrategy<T>): void {
    this.strategy = strategy;
    this.applyLayout();
  }

  setOrigin(origin: Vector2): void {
    this.origin = { ...origin };
    this.applyLayout();
  }

  setSpacing(spacing: Vector2): void {
    this.spacing = { ...spacing };
    this.applyLayout();
  }

  setColumns(columns?: number): void {
    this.columns = columns;
    this.applyLayout();
  }

  protected onEnter(object: T): void {
    super.onEnter(object);
    this.applyLayout();
  }

  protected onExit(object: T): void {
    super.onExit(object);
    this.applyLayout();
  }

  protected applyLayout(): void {
    this.getObjects().forEach((object, index) => {
      const target = this.strategy(object, index, this);
      object.moveTo(target);
    });
  }

  private defaultStrategy(_object: T, index: number): Vector2 {
    if (!this.columns || this.columns <= 0) {
      return {
        x: this.origin.x + this.spacing.x * index,
        y: this.origin.y,
      };
    }

    const column = index % this.columns;
    const row = Math.floor(index / this.columns);
    return {
      x: this.origin.x + this.spacing.x * column,
      y: this.origin.y + this.spacing.y * row,
    };
  }
}

export function isLayoutZone(value: unknown): value is LayoutZone {
  return value instanceof LayoutZone;
}
