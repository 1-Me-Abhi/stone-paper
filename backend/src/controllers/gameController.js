const Game = require('../models/Game');
const Player = require('../models/Player');

class GameController {
  constructor() {
    this.games = new Map();
    this.players = new Map(); // playerId -> gameId mapping
    this.playerProfiles = new Map(); // playerId -> Player profile
  }

  createGame(playerId, playerName, playerAvatar) {
    const gameId = this.generateGameId();
    const avatar = playerAvatar || this.getPlayerAvatar(playerId);
    const game = new Game(gameId, playerId, playerName, avatar);
    this.games.set(gameId, game);
    this.players.set(playerId, gameId);
    
    return game;
  }

  joinGame(gameId, playerId, playerName, playerAvatar) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.status !== 'waiting') {
      throw new Error('Game is not available for joining');
    }
    
    const avatar = playerAvatar || this.getPlayerAvatar(playerId);
    game.addPlayer2(playerId, playerName, avatar);
    this.players.set(playerId, gameId);
    
    return game;
  }

  findAvailableGame() {
    for (const [gameId, game] of this.games) {
      if (game.status === 'waiting') {
        return game;
      }
    }
    return null;
  }

  makeMove(playerId, choice) {
    const gameId = this.players.get(playerId);
    if (!gameId) {
      throw new Error('Player not in any game');
    }
    
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    game.makeMove(playerId, choice);
    return game;
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  getPlayerGame(playerId) {
    const gameId = this.players.get(playerId);
    if (!gameId) {
      return null;
    }
    return this.games.get(gameId);
  }

  removePlayerFromGame(playerId) {
    const gameId = this.players.get(playerId);
    if (gameId) {
      this.players.delete(playerId);
      const game = this.games.get(gameId);
      if (game) {
        // If it's a waiting game, remove it entirely
        if (game.status === 'waiting') {
          this.games.delete(gameId);
        } else {
          // Mark the game as abandoned or handle disconnection
          game.status = 'abandoned';
        }
      }
    }
  }

  resetGame(gameId) {
    const game = this.games.get(gameId);
    if (game) {
      game.reset();
      return game;
    }
    throw new Error('Game not found');
  }

  generateGameId() {
    return Math.random().toString(36).substr(2, 9);
  }

  getGamesList() {
    const gamesList = [];
    for (const [gameId, game] of this.games) {
      gamesList.push({
        id: gameId,
        status: game.status,
        playersCount: game.player2 ? 2 : 1,
        round: game.round,
        createdAt: game.createdAt
      });
    }
    return gamesList;
  }

  cleanupFinishedGames() {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    for (const [gameId, game] of this.games) {
      if (game.status === 'finished' || game.status === 'abandoned') {
        if (now - game.createdAt > maxAge) {
          // Save game history before deleting
          if (game.status === 'finished') {
            this.saveGameToHistory(game);
          }
          
          this.games.delete(gameId);
          // Remove players from this game
          if (game.player1) this.players.delete(game.player1.id);
          if (game.player2) this.players.delete(game.player2.id);
        }
      }
    }
  }

  // Player Profile Methods
  getOrCreatePlayer(playerId, playerName, avatar = '🎮') {
    if (!this.playerProfiles.has(playerId)) {
      const player = new Player(playerId, playerName, avatar);
      this.playerProfiles.set(playerId, player);
    }
    return this.playerProfiles.get(playerId);
  }

  updatePlayerAvatar(playerId, avatar) {
    const player = this.playerProfiles.get(playerId);
    if (player) {
      player.updateAvatar(avatar);
      return player;
    }
    return null;
  }

  getPlayerAvatar(playerId) {
    const player = this.playerProfiles.get(playerId);
    return player ? player.avatar : '🎮';
  }

  getPlayerProfile(playerId) {
    const player = this.playerProfiles.get(playerId);
    return player ? player.getProfile() : null;
  }

  getPlayerHistory(playerId, limit = 10) {
    const player = this.playerProfiles.get(playerId);
    return player ? player.getGameHistory(limit) : [];
  }

  saveGameToHistory(game) {
    if (game.status === 'finished' && game.player1 && game.player2) {
      const gameHistory = game.getGameHistory();
      
      // Update both players' profiles
      const player1 = this.playerProfiles.get(game.player1.id);
      if (player1) {
        player1.addGameResult(gameHistory);
      }

      const player2 = this.playerProfiles.get(game.player2.id);
      if (player2) {
        player2.addGameResult(gameHistory);
      }
    }
  }
}

module.exports = GameController;