import { writable, derived } from 'svelte/store';
import socketClient from '../utils/socketClient.js';

// Game store combining socket client stores with additional game logic
export const gameStore = writable({
  currentView: 'login', // 'login', 'lobby', 'game', 'waiting'
  playerName: '',
  isInGame: false,
  selectedChoice: null,
  hasSubmittedChoice: false,
  showResult: false,
  connectionStatus: 'disconnected' // 'disconnected', 'connecting', 'connected'
});

// Reactive stores from socket client
export const connected = socketClient.stores.connected;
export const error = socketClient.stores.error;
export const gameState = socketClient.stores.gameState;
export const playerInfo = socketClient.stores.playerInfo;
export const gamesList = socketClient.stores.gamesList;
export const roundResult = socketClient.stores.roundResult;
export const gameFinished = socketClient.stores.gameFinished;

// Derived stores for computed values
export const isMyTurn = derived(
  [gameState, playerInfo],
  ([$gameState, $playerInfo]) => {
    if (!$gameState || !$playerInfo || $gameState.status !== 'playing') {
      return false;
    }
    
    const myChoice = $gameState.player1?.id === $playerInfo.playerId 
      ? $gameState.player1.choice 
      : $gameState.player2?.choice;
    
    return myChoice === null;
  }
);

export const opponent = derived(
  [gameState, playerInfo],
  ([$gameState, $playerInfo]) => {
    if (!$gameState || !$playerInfo) {
      return null;
    }
    
    return $gameState.player1?.id === $playerInfo.playerId 
      ? $gameState.player2 
      : $gameState.player1;
  }
);

export const myPlayer = derived(
  [gameState, playerInfo],
  ([$gameState, $playerInfo]) => {
    if (!$gameState || !$playerInfo) {
      return null;
    }
    
    return $gameState.player1?.id === $playerInfo.playerId 
      ? $gameState.player1 
      : $gameState.player2;
  }
);

export const canMakeMove = derived(
  [gameState, isMyTurn, gameStore],
  ([$gameState, $isMyTurn, $gameStore]) => {
    return $gameState?.status === 'playing' && 
           $isMyTurn && 
           !$gameStore.hasSubmittedChoice;
  }
);

// Game actions
export const gameActions = {
  setPlayerName: (name) => {
    gameStore.update(store => ({ ...store, playerName: name }));
  },
  
  setCurrentView: (view) => {
    gameStore.update(store => ({ ...store, currentView: view }));
  },
  
  connectToServer: () => {
    gameStore.update(store => ({ ...store, connectionStatus: 'connecting' }));
    socketClient.connect();
  },
  
  joinLobby: (playerName) => {
    socketClient.joinLobby(playerName);
    gameStore.update(store => ({ 
      ...store, 
      playerName,
      currentView: 'lobby' 
    }));
  },
  
  createGame: () => {
    gameStore.update(store => {
      socketClient.createGame(store.playerName);
      return { 
        ...store, 
        currentView: 'waiting',
        isInGame: true 
      };
    });
  },
  
  joinGame: (gameId) => {
    gameStore.update(store => {
      socketClient.joinGame(gameId, store.playerName);
      return { 
        ...store, 
        currentView: 'game',
        isInGame: true 
      };
    });
  },
  
  quickJoin: () => {
    gameStore.update(store => {
      socketClient.quickJoin(store.playerName);
      return { 
        ...store, 
        currentView: 'waiting',
        isInGame: true 
      };
    });
  },
  
  makeMove: (choice) => {
    gameStore.update(store => {
      if (store.hasSubmittedChoice) return store;
      
      socketClient.makeMove(choice);
      return { 
        ...store, 
        selectedChoice: choice,
        hasSubmittedChoice: true
      };
    });
  },
  
  resetGame: () => {
    socketClient.resetGame();
    gameStore.update(store => ({ 
      ...store, 
      selectedChoice: null,
      hasSubmittedChoice: false,
      showResult: false
    }));
  },
  
  leaveGame: () => {
    socketClient.leaveGame();
    gameStore.update(store => ({ 
      ...store, 
      currentView: 'lobby',
      isInGame: false,
      selectedChoice: null,
      hasSubmittedChoice: false,
      showResult: false
    }));
  },
  
  clearChoice: () => {
    gameStore.update(store => ({ 
      ...store, 
      selectedChoice: null,
      hasSubmittedChoice: false
    }));
  },
  
  disconnect: () => {
    socketClient.disconnect();
    gameStore.update(store => ({ 
      ...store, 
      currentView: 'lobby',
      isInGame: false,
      selectedChoice: null,
      hasSubmittedChoice: false,
      showResult: false,
      connectionStatus: 'disconnected'
    }));
  }
};

// Subscribe to connection status
connected.subscribe(isConnected => {
  gameStore.update(store => ({ 
    ...store, 
    connectionStatus: isConnected ? 'connected' : 'disconnected' 
  }));
});

// Subscribe to game state changes to reset choice state for new rounds
gameState.subscribe($gameState => {
  if ($gameState) {
    gameStore.update(store => {
      let updates = {};
      
      // When game starts (both players joined), switch to game view
      if ($gameState.status === 'playing' && store.currentView === 'waiting') {
        updates.currentView = 'game';
      }
      
      // Reset choices for new rounds
      if ($gameState.status === 'playing') {
        // If both players have null choices, it's a new round
        if ((!$gameState.player1.choice && !$gameState.player2?.choice) || 
            ($gameState.round > 1 && !store.hasSubmittedChoice)) {
          updates.selectedChoice = null;
          updates.hasSubmittedChoice = false;
          updates.showResult = false;
        }
      }
      
      // If game is waiting for players, ensure we're in waiting view
      if ($gameState.status === 'waiting' && store.isInGame) {
        updates.currentView = 'waiting';
      }
      
      return Object.keys(updates).length > 0 ? { ...store, ...updates } : store;
    });
  }
});

// Subscribe to round results
roundResult.subscribe($roundResult => {
  if ($roundResult) {
    gameStore.update(store => ({ ...store, showResult: true }));
  } else {
    // When round result is cleared, reset choices for next round
    gameStore.update(store => ({ 
      ...store, 
      showResult: false,
      selectedChoice: null,
      hasSubmittedChoice: false
    }));
  }
});