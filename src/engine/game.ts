import { GameConfig, TurnState } from '@/types/state';

export class TurnManager {
  constructor(
    private readonly config: GameConfig,
    private readonly phases: string[] = config.phases
  ) {}

  advance(turn: TurnState): TurnState {
    const nextPhaseIndex = (turn.phaseIndex + 1) % this.phases.length;
    const wrapped = nextPhaseIndex === 0;
    const nextPlayerIndex = this.config.turnOrder.indexOf(turn.currentPlayerId) + (wrapped ? 1 : 0);
    const normalizedPlayerIndex = nextPlayerIndex % this.config.turnOrder.length;

    return {
      currentPlayerId: this.config.turnOrder[normalizedPlayerIndex],
      phaseIndex: nextPhaseIndex,
      turnCount: turn.turnCount + (wrapped ? 1 : 0)
    };
  }

  setCurrentPlayer(turn: TurnState, playerId: string): TurnState {
    if (!this.config.turnOrder.includes(playerId)) {
      throw new Error(`Player ${playerId} is not part of the turn order.`);
    }

    return {
      ...turn,
      currentPlayerId: playerId
    };
  }
}
