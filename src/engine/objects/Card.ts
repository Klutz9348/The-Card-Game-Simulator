import type { GameObjectData } from "../../types";
import { GameObject, type GameObjectOptions } from "./GameObject";

export interface CardData {
  suit?: string;
  rank?: string | number;
  value?: number;
  [key: string]: unknown;
}

export interface CardOptions extends GameObjectOptions<CardData> {
  suit?: string;
  rank?: string | number;
  value?: number;
}

export class Card extends GameObject<CardData> {
  constructor(options: CardOptions) {
    super({
      ...options,
      data: {
        suit: options.suit,
        rank: options.rank,
        value: options.value,
        ...(options.data ?? {}),
      },
    });
  }

  get suit(): string | undefined {
    return this.data.suit as string | undefined;
  }

  get rank(): string | number | undefined {
    return this.data.rank as string | number | undefined;
  }

  get value(): number | undefined {
    return this.data.value as number | undefined;
  }

  matches(criteria: Partial<CardData>): boolean {
    return Object.entries(criteria).every(([key, value]) => this.data[key] === value);
  }

  protected createInitialData(partial?: Partial<CardData>): CardData {
    return {
      suit: partial?.suit,
      rank: partial?.rank,
      value: partial?.value,
      ...(partial ?? {}),
    };
  }

  protected instantiate(data: GameObjectData<CardData>): Card {
    return new Card({
      id: data.id,
      name: data.name,
      tags: data.tags,
      state: data.state,
      data: data.data,
    });
  }
}

export function isCard(value: unknown): value is Card {
  return value instanceof Card;
}
