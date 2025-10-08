import { GameObject } from "../objects/GameObject";
import { LayoutZone, type LayoutZoneOptions } from "./LayoutZone";

export interface RandomizeZoneOptions<T extends GameObject = GameObject> extends LayoutZoneOptions<T> {
  random?: () => number;
}

export class RandomizeZone<T extends GameObject = GameObject> extends LayoutZone<T> {
  private readonly random: () => number;

  constructor(name: string, options: RandomizeZoneOptions<T> = {}) {
    super(name, options);
    this.random = options.random ?? Math.random;
  }

  protected onEnter(object: T): void {
    super.onEnter(object);
    this.shuffle();
  }

  protected onExit(object: T): void {
    super.onExit(object);
    this.shuffle();
  }

  private shuffle(): void {
    for (let i = this.order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.random() * (i + 1));
      [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
    }
    this.applyLayout();
  }
}

export function isRandomizeZone(value: unknown): value is RandomizeZone {
  return value instanceof RandomizeZone;
}
