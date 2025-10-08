import type { GameObjectData } from "../../types";
import { GameObject, type GameObjectOptions } from "./GameObject";

export interface DiceData {
  sides: number;
  value: number;
  [key: string]: unknown;
}

export interface DiceOptions extends GameObjectOptions<DiceData> {
  sides?: number;
  value?: number;
}

export class Dice extends GameObject<DiceData> {
  constructor(options: DiceOptions = { name: "Dice" }) {
    super({
      ...options,
      data: {
        sides: options.sides ?? (options.data?.sides as number | undefined) ?? 6,
        value: options.value ?? (options.data?.value as number | undefined) ?? 1,
        ...(options.data ?? {}),
      },
    });
  }

  get sides(): number {
    return this.data.sides as number;
  }

  get value(): number {
    return this.data.value as number;
  }

  roll(random: () => number = Math.random): number {
    const nextValue = Math.floor(random() * this.sides) + 1;
    this.updateData({ value: nextValue });
    return nextValue;
  }

  protected createInitialData(partial?: Partial<DiceData>): DiceData {
    return {
      sides: partial?.sides ?? 6,
      value: partial?.value ?? 1,
      ...(partial ?? {}),
    };
  }

  protected instantiate(data: GameObjectData<DiceData>): Dice {
    return new Dice({
      id: data.id,
      name: data.name,
      tags: data.tags,
      state: data.state,
      data: data.data,
    });
  }
}

export function isDice(value: unknown): value is Dice {
  return value instanceof Dice;
}
