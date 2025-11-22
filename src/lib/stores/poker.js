import { writable } from 'svelte/store';

const initialState = {
  gameState: 'betting', // betting, pre-flop, flop, turn, river, showdown
  pot: 0,
  communityCards: [],
  players: [],
  currentPlayerIndex: 0,
  dealerIndex: 0,
  smallBlind: 10,
  bigBlind: 20,
  minBet: 20,
};

const { subscribe, set, update } = writable(initialState);

const pokerActions = {
  deal: () => {
    // Implement dealing logic
  },
  bet: (amount) => {
    // Implement betting logic
  },
  fold: () => {
    // Implement folding logic
  },
  check: () => {
    // Implement checking logic
  },
  call: () => {
    // Implement calling logic
  },
  raise: (amount) => {
    // Implement raising logic
  },
  resetGame: () => set(initialState),
};

export const pokerStore = {
  subscribe,
};

export { pokerActions };
