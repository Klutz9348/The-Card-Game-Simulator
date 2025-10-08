import type { GameObjectData } from "../../types";
import { GameObject, type GameObjectOptions } from "./GameObject";

export interface TileData {
  kind: string;
  value?: number;
  [key: string]: unknown;
}

export interface TileOptions extends GameObjectOptions<TileData> {
  kind?: string;
  value?: number;
}

export class Tile extends GameObject<TileData> {
  constructor(options: TileOptions) {
    super({
      ...options,
      data: {
        kind: options.kind ?? (options.data?.kind as string | undefined) ?? "tile",
        value: options.value ?? (options.data?.value as number | undefined),
        ...(options.data ?? {}),
      },
    });
  }

  get kind(): string {
    return this.data.kind as string;
  }

  get value(): number | undefined {
    return this.data.value as number | undefined;
  }

  rotateClockwise(steps = 1): void {
    const normalized = ((this.rotation + steps * 90) % 360 + 360) % 360;
    this.updateState({
      orientation: {
        ...this.getState().orientation,
        rotation: normalized,
      },
    });
  }

  protected createInitialData(partial?: Partial<TileData>): TileData {
    return {
      kind: partial?.kind ?? "tile",
      value: partial?.value,
      ...(partial ?? {}),
    };
  }

  protected instantiate(data: GameObjectData<TileData>): Tile {
    return new Tile({
      id: data.id,
      name: data.name,
      tags: data.tags,
      state: data.state,
      data: data.data,
    });
  }
}

export function isTile(value: unknown): value is Tile {
  return value instanceof Tile;
}
