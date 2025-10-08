import type { GameObjectData, GameObjectState, Vector2 } from "../../types";

export interface GameObjectOptions<T extends Record<string, unknown>> {
  id?: string;
  name: string;
  tags?: string[];
  state?: Partial<GameObjectState>;
  data?: Partial<T>;
}

export abstract class GameObject<T extends Record<string, unknown> = Record<string, unknown>> {
  private readonly id: string;
  private name: string;
  protected readonly tags: Set<string>;
  protected readonly data: T;
  protected readonly state: GameObjectState;

  constructor(options: GameObjectOptions<T>) {
    const { id, name, tags = [], state, data } = options;

    this.id = id ?? GameObject.generateId();
    this.name = name;
    this.tags = new Set(tags);
    this.state = {
      position: state?.position ?? { x: 0, y: 0 },
      orientation: state?.orientation ?? { rotation: 0, faceUp: true },
      ...state,
    } as GameObjectState;
    this.data = this.createInitialData(data);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  get position(): Vector2 {
    return { ...this.state.position };
  }

  moveTo(position: Vector2): void {
    this.state.position = { ...position };
  }

  translate(vector: Vector2): void {
    this.state.position = {
      x: this.state.position.x + vector.x,
      y: this.state.position.y + vector.y,
    };
  }

  get rotation(): number {
    return this.state.orientation.rotation;
  }

  rotate(angle: number): void {
    this.state.orientation.rotation = (this.state.orientation.rotation + angle) % 360;
  }

  isFaceUp(): boolean {
    return this.state.orientation.faceUp;
  }

  setFaceUp(faceUp: boolean): void {
    this.state.orientation.faceUp = faceUp;
  }

  flip(): void {
    this.state.orientation.faceUp = !this.state.orientation.faceUp;
  }

  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  addTag(tag: string): void {
    this.tags.add(tag);
  }

  removeTag(tag: string): void {
    this.tags.delete(tag);
  }

  getTags(): string[] {
    return Array.from(this.tags);
  }

  getState(): GameObjectState {
    return {
      ...this.state,
      position: { ...this.state.position },
      orientation: { ...this.state.orientation },
    };
  }

  updateState(partial: Partial<GameObjectState>): void {
    if (partial.position) {
      this.moveTo(partial.position);
    }

    if (partial.orientation) {
      this.state.orientation = {
        ...this.state.orientation,
        ...partial.orientation,
      };
    }

    const reserved = new Set(["position", "orientation"]);
    Object.entries(partial).forEach(([key, value]) => {
      if (!reserved.has(key)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.state as Record<string, unknown>)[key] = value as any;
      }
    });
  }

  updateData(partial: Partial<T>): void {
    Object.assign(this.data, partial);
  }

  toJSON(): GameObjectData<T> {
    return {
      id: this.id,
      name: this.name,
      tags: this.getTags(),
      state: this.getState(),
      data: this.cloneData(),
    };
  }

  clone(): this {
    const instance = this.instantiate(this.toJSON());
    return instance as this;
  }

  protected abstract instantiate(data: GameObjectData<T>): GameObject<T>;

  protected abstract createInitialData(partial?: Partial<T>): T;

  protected cloneData(): T {
    return JSON.parse(JSON.stringify(this.data)) as T;
  }
}

export namespace GameObject {
  export function generateId(): string {
    const random = Math.random().toString(36).slice(2);
    const timestamp = Date.now().toString(36);
    return `obj-${timestamp}-${random}`;
  }
}

export function isGameObject(value: unknown): value is GameObject {
  return value instanceof GameObject;
}
