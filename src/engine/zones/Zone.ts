import { GameObject } from "../objects/GameObject";

export interface ZoneOptions {
  capacity?: number;
  id?: string;
}

export type ZoneHook<T extends GameObject> = (object: T, zone: Zone<T>) => void;

export class Zone<T extends GameObject = GameObject> {
  readonly id: string;
  readonly name: string;
  readonly capacity?: number;

  protected readonly objects: Map<string, T> = new Map();
  protected readonly order: T[] = [];

  private readonly enterHooks: Set<ZoneHook<T>> = new Set();
  private readonly exitHooks: Set<ZoneHook<T>> = new Set();

  constructor(name: string, options: ZoneOptions = {}, id: string = options.id ?? Zone.generateId()) {
    this.name = name;
    this.capacity = options.capacity;
    this.id = id;
  }

  size(): number {
    return this.order.length;
  }

  contains(object: T): boolean {
    return this.objects.has(object.getId());
  }

  add(object: T): void {
    if (this.contains(object)) {
      return;
    }

    if (this.capacity !== undefined && this.size() >= this.capacity) {
      throw new Error(`Zone "${this.name}" is at capacity`);
    }

    this.objects.set(object.getId(), object);
    this.order.push(object);
    this.onEnter(object);
    this.enterHooks.forEach((hook) => hook(object, this));
  }

  remove(object: T): void {
    if (!this.contains(object)) {
      return;
    }

    this.objects.delete(object.getId());
    const index = this.order.indexOf(object);
    if (index >= 0) {
      this.order.splice(index, 1);
    }
    this.onExit(object);
    this.exitHooks.forEach((hook) => hook(object, this));
  }

  clear(): void {
    [...this.order].forEach((object) => this.remove(object));
  }

  getObjects(): T[] {
    return [...this.order];
  }

  on(event: "enter" | "exit", hook: ZoneHook<T>): void {
    if (event === "enter") {
      this.enterHooks.add(hook);
    } else {
      this.exitHooks.add(hook);
    }
  }

  off(event: "enter" | "exit", hook: ZoneHook<T>): void {
    if (event === "enter") {
      this.enterHooks.delete(hook);
    } else {
      this.exitHooks.delete(hook);
    }
  }

  protected onEnter(_object: T): void {
    // Default implementation does nothing.
  }

  protected onExit(_object: T): void {
    // Default implementation does nothing.
  }
}

export namespace Zone {
  export function generateId(): string {
    const random = Math.random().toString(36).slice(2);
    const timestamp = Date.now().toString(36);
    return `zone-${timestamp}-${random}`;
  }
}

export function isZone(value: unknown): value is Zone {
  return value instanceof Zone;
}
