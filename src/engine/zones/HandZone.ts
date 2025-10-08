import { GameObject } from "../objects/GameObject";
import { LayoutZone, type LayoutZoneOptions } from "./LayoutZone";

export interface HandZoneOptions<T extends GameObject = GameObject> extends LayoutZoneOptions<T> {
  revealOnEnter?: boolean;
}

export class HandZone<T extends GameObject = GameObject> extends LayoutZone<T> {
  private readonly revealOnEnter: boolean;

  constructor(name: string, options: HandZoneOptions<T> = {}) {
    super(name, {
      spacing: { x: 1.5, y: 0 },
      ...options,
    });
    this.revealOnEnter = options.revealOnEnter ?? true;
  }

  protected onEnter(object: T): void {
    if (this.revealOnEnter) {
      object.setFaceUp(true);
    }
    super.onEnter(object);
  }

  sort(comparator: (a: T, b: T) => number): void {
    this.order.sort(comparator);
    this.applyLayout();
  }
}
