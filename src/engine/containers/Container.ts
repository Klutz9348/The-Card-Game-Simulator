import { GameObject } from "../objects/GameObject";

type InsertPosition = "top" | "bottom" | number;

export abstract class Container<T extends GameObject = GameObject> {
  protected readonly items: T[];

  protected constructor(items?: T[]) {
    this.items = [];
    if (items) {
      items.forEach((item) => this.put(item));
    }
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  protected insert(item: T, position: InsertPosition = "top"): void {
    if (!(item instanceof GameObject)) {
      throw new TypeError("Item must be a GameObject instance");
    }

    if (position === "top") {
      this.items.unshift(item);
      return;
    }

    if (position === "bottom") {
      this.items.push(item);
      return;
    }

    if (typeof position === "number") {
      const index = Math.max(0, Math.min(this.items.length, position));
      this.items.splice(index, 0, item);
      return;
    }

    throw new TypeError("Unsupported insertion position");
  }

  protected extract(position: InsertPosition = "top"): T | undefined {
    if (this.items.length === 0) {
      return undefined;
    }

    if (position === "top") {
      return this.items.shift();
    }

    if (position === "bottom") {
      return this.items.pop();
    }

    if (typeof position === "number") {
      const index = Math.max(0, Math.min(this.items.length - 1, position));
      const [item] = this.items.splice(index, 1);
      return item;
    }

    throw new TypeError("Unsupported extraction position");
  }

  abstract shuffle(): void;

  abstract draw(count?: number): T | T[] | undefined;

  abstract put(item: T | T[], position?: InsertPosition): void;

  abstract split(predicate: number | ((item: T, index: number) => boolean)): [Container<T>, Container<T>];

  toArray(): T[] {
    return [...this.items];
  }
}

export function isContainer(value: unknown): value is Container {
  return value instanceof Container;
}
