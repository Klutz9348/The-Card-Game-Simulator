import { TurnManager } from '@/engine/game';
import { CardState, GameConfig, GameState, PlayerState, TurnState } from '@/types/state';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useCardStore } from './useCardStore';
import { useZoneStore } from './useZoneStore';

type GameSlice = Pick<GameState, 'players' | 'config' | 'turn'>;

export interface GameStoreState extends GameSlice {
  initialize: (players: PlayerState[], config: GameConfig) => void;
  advancePhase: () => void;
  setCurrentPlayer: (playerId: string) => void;
  getCurrentPhase: () => string;
  getCurrentPlayerHand: () => CardState[];
}

const defaultConfig: GameConfig = {
  allowSpectators: true,
  maxPlayers: 2,
  phases: ['draw', 'main', 'end'],
  turnOrder: []
};

const defaultTurn: TurnState = {
  currentPlayerId: '',
  turnCount: 1,
  phaseIndex: 0
};

export const useGameStore = create<GameStoreState>()(
  subscribeWithSelector((set, get) => ({
    players: {},
    config: defaultConfig,
    turn: defaultTurn,
    initialize: (players, config) => {
      const playersMap = players.reduce<Record<string, PlayerState>>((acc, player) => {
        acc[player.id] = { ...player };
        return acc;
      }, {});
      const initialPlayer = config.turnOrder[0] ?? '';
      set({
        players: playersMap,
        config: { ...config },
        turn: {
          currentPlayerId: initialPlayer,
          phaseIndex: 0,
          turnCount: 1
        }
      });
    },
    advancePhase: () => {
      const state = get();
      if (!state.config.phases.length || !state.config.turnOrder.length) {
        return;
      }
      const manager = new TurnManager(state.config);
      const nextTurn = manager.advance(state.turn);
      set({ turn: nextTurn });
    },
    setCurrentPlayer: (playerId) => {
      const state = get();
      if (!state.config.turnOrder.length) {
        return;
      }
      const manager = new TurnManager(state.config);
      const nextTurn = manager.setCurrentPlayer(state.turn, playerId);
      set({ turn: nextTurn });
    },
    getCurrentPhase: () => {
      const state = get();
      return state.config.phases[state.turn.phaseIndex] ?? '';
    },
    getCurrentPlayerHand: () => {
      const cardState = useCardStore.getState();
      const zoneState = useZoneStore.getState();
      const currentPlayerId = get().turn.currentPlayerId;
      return Object.values(cardState.cards).filter((card) => {
        if (card.ownerId !== currentPlayerId || !card.zoneId) {
          return false;
        }
        const zone = zoneState.zones[card.zoneId];
        return zone?.type === 'hand';
      });
    }
  }))
);

export const currentPlayerSelector = (state: GameStoreState) =>
  state.players[state.turn.currentPlayerId];

export const currentPhaseSelector = (state: GameStoreState) => state.getCurrentPhase();
