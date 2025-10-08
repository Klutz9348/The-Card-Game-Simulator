export interface Vector2 {
  x: number;
  y: number;
}

export interface Orientation {
  rotation: number;
  faceUp: boolean;
}

export interface GameObjectState {
  position: Vector2;
  orientation: Orientation;
  [key: string]: unknown;
}

export interface GameObjectData<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  name: string;
  tags: string[];
  state: GameObjectState;
  data: T;
}

export type ZoneEventType = "enter" | "exit";

export interface SnapPoint {
  id: string;
  position: Vector2;
  radius: number;
}

export type RuleCondition = Record<string, unknown>;

export interface RuleConfig {
  events: {
    [eventName: string]: RuleDefinition[];
  };
}

export interface RuleDefinition {
  action: string;
  condition?: RuleCondition;
  once?: boolean;
}

export type RuleHandler<T = unknown> = (payload: T) => void | Promise<void>;

export interface SerializedRuleEngine {
  events: Record<string, RuleDefinition[]>;
}
