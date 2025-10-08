import { GameObject } from "../objects/GameObject";
import { Zone, type ZoneOptions } from "./Zone";

export interface HiddenZoneOptions extends ZoneOptions {
  preserveState?: boolean;
}

export class HiddenZone<T extends GameObject = GameObject> extends Zone<T> {
  private readonly preserveState: boolean;
  private readonly faceCache = new Map<string, boolean>();

  constructor(name: string, options: HiddenZoneOptions = {}) {
    super(name, options);
    this.preserveState = options.preserveState ?? true;
  }

  protected onEnter(object: T): void {
    if (this.preserveState) {
      this.faceCache.set(object.getId(), object.isFaceUp());
    }
    object.setFaceUp(false);
  }

  protected onExit(object: T): void {
    const cached = this.faceCache.get(object.getId());
    if (cached !== undefined) {
      object.setFaceUp(cached);
      this.faceCache.delete(object.getId());
    } else {
      object.setFaceUp(true);
    }
  }
}

export function isHiddenZone(value: unknown): value is HiddenZone {
  return value instanceof HiddenZone;
}
