import type { RuleConfig, RuleDefinition, RuleHandler, SerializedRuleEngine } from "../../types";

interface RegisteredHandler<T = unknown> {
  handler: RuleHandler<T>;
  once: boolean;
}

export class RuleEngine {
  private readonly handlers = new Map<string, RegisteredHandler[]>();
  private readonly ruleDefinitions = new Map<string, RuleDefinition[]>();
  private readonly actions = new Map<string, RuleHandler>();

  on<T>(event: string, handler: RuleHandler<T>): void {
    this.addHandler(event, handler, false);
  }

  once<T>(event: string, handler: RuleHandler<T>): void {
    this.addHandler(event, handler, true);
  }

  off<T>(event: string, handler: RuleHandler<T>): void {
    const handlers = this.handlers.get(event);
    if (!handlers) {
      return;
    }
    this.handlers.set(
      event,
      handlers.filter((entry) => entry.handler !== handler)
    );
  }

  registerAction<T>(name: string, handler: RuleHandler<T>): void {
    this.actions.set(name, handler as RuleHandler);
  }

  loadRules(config: RuleConfig): void {
    Object.entries(config.events).forEach(([event, definitions]) => {
      const existing = this.ruleDefinitions.get(event) ?? [];
      this.ruleDefinitions.set(event, [...existing, ...definitions.map((definition) => ({ ...definition }))]);
    });
  }

  clear(): void {
    this.handlers.clear();
    this.ruleDefinitions.clear();
    this.actions.clear();
  }

  async emit<T>(event: string, payload: T): Promise<void> {
    await this.executeRules(event, payload);
    const handlers = this.handlers.get(event);
    if (!handlers) {
      return;
    }

    for (const entry of [...handlers]) {
      await entry.handler(payload);
      if (entry.once) {
        this.off(event, entry.handler);
      }
    }
  }

  serialize(): SerializedRuleEngine {
    const events: Record<string, RuleDefinition[]> = {};
    this.ruleDefinitions.forEach((definitions, event) => {
      events[event] = definitions.map((definition) => ({ ...definition }));
    });
    return { events };
  }

  private addHandler<T>(event: string, handler: RuleHandler<T>, once: boolean): void {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push({ handler: handler as RuleHandler, once });
    this.handlers.set(event, handlers);
  }

  private async executeRules<T>(event: string, payload: T): Promise<void> {
    const definitions = this.ruleDefinitions.get(event);
    if (!definitions || definitions.length === 0) {
      return;
    }

    const remaining: RuleDefinition[] = [];
    for (const definition of definitions) {
      const matches = !definition.condition || this.matchesCondition(definition.condition, payload);
      if (!matches) {
        remaining.push(definition);
        continue;
      }

      const action = this.actions.get(definition.action);
      if (!action) {
        throw new Error(`Unknown rule action: ${definition.action}`);
      }

      await action(payload);

      if (!definition.once) {
        remaining.push(definition);
      }
    }

    this.ruleDefinitions.set(event, remaining);
  }

  private matchesCondition<T>(condition: RuleDefinition["condition"], payload: T): boolean {
    if (!condition) {
      return true;
    }

    return Object.entries(condition).every(([key, value]) => this.resolveProperty(payload, key) === value);
  }

  private resolveProperty<T>(payload: T, path: string): unknown {
    if (path.includes(".")) {
      return path.split(".").reduce<unknown>((current, key) => {
        if (current && typeof current === "object" && key in current) {
          return (current as Record<string, unknown>)[key];
        }
        return undefined;
      }, payload);
    }

    if (payload && typeof payload === "object" && path in payload) {
      return (payload as Record<string, unknown>)[path];
    }

    return undefined;
  }
}

export function isRuleEngine(value: unknown): value is RuleEngine {
  return value instanceof RuleEngine;
}
