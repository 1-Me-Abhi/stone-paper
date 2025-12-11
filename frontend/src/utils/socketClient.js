import { io } from 'socket.io-client';
import { writable } from 'svelte/store';

// Use environment variable or fallback to relative URL in production
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 
                   (import.meta.env.PROD ? window.location.origin : 'http://localhost:3001');

class SocketClient {
  constructor() {
    this.socket = null;
    this.connected = writable(false);
    this.error = writable(null);
    this.gameState = writable(null);
    this.playerInfo = writable(null);
    this.gamesList = writable([]);
    this.roundResult = writable(null);
    this.gameFinished = writable(null);
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected.set(true);
      this.error.set(null);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected.set(false);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      this.error.set('Failed to connect to server');
      this.connected.set(false);
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.error.set(data.message || 'An error occurred');
    });

    this.socket.on('joined-lobby', (data) => {
      this.playerInfo.set(data);
      console.log('Joined lobby:', data);
    });

    this.socket.on('games-list', (games) => {
      this.gamesList.set(games);
    });

    this.socket.on('game-created', (data) => {
      this.gameState.set(data.gameState);
      console.log('Game created:', data);
    });

    this.socket.on('game-started', (data) => {
      this.gameState.set(data.gameState);
      console.log('Game started:', data);
    });

    this.socket.on('game-update', (data) => {
      this.gameState.set(data.gameState);
      console.log('Game update:', data);
    });

    this.socket.on('round-result', (data) => {
      this.roundResult.set(data);
      this.gameState.set(data.gameState);
      console.log('Round result:', data);
      
      // Clear round result after 3 seconds
      setTimeout(() => {
        this.roundResult.set(null);
      }, 3000);
    });

    this.socket.on('game-finished', (data) => {
      this.gameFinished.set(data);
      this.gameState.set(data.gameState);
      console.log('Game finished:', data);
    });

    this.socket.on('game-reset', (data) => {
      this.gameState.set(data.gameState);
      this.gameFinished.set(null);
      this.roundResult.set(null);
      console.log('Game reset:', data);
    });

    this.socket.on('player-disconnected', (data) => {
      this.error.set(data.message);
      console.log('Player disconnected:', data);
    });
  }

  joinLobby(playerName) {
    if (this.socket) {
      this.socket.emit('join-lobby', playerName);
    }
  }

  createGame(playerName) {
    if (this.socket) {
      this.socket.emit('create-game', { playerName });
    }
  }

  joinGame(gameId, playerName) {
    if (this.socket) {
      this.socket.emit('join-game', { gameId, playerName });
    }
  }

  quickJoin(playerName) {
    if (this.socket) {
      this.socket.emit('quick-join', { playerName });
    }
  }

  makeMove(choice) {
    if (this.socket) {
      this.socket.emit('make-move', { choice });
    }
  }

  resetGame() {
    if (this.socket) {
      this.socket.emit('reset-game');
    }
  }

  leaveGame() {
    if (this.socket) {
      this.socket.emit('leave-game');
      this.gameState.set(null);
      this.gameFinished.set(null);
      this.roundResult.set(null);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected.set(false);
      this.gameState.set(null);
      this.playerInfo.set(null);
      this.gamesList.set([]);
      this.roundResult.set(null);
      this.gameFinished.set(null);
    }
  }

  // Store getters for reactive subscriptions
  get stores() {
    return {
      connected: this.connected,
      error: this.error,
      gameState: this.gameState,
      playerInfo: this.playerInfo,
      gamesList: this.gamesList,
      roundResult: this.roundResult,
      gameFinished: this.gameFinished
    };
  }
}

export default new SocketClient();