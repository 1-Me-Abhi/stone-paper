const GameController = require('../controllers/gameController');
const { AVATARS } = require('../utils/constants');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.gameController = new GameController();
    this.setupSocketHandlers();
    
    // Cleanup finished games every 5 minutes
    setInterval(() => {
      this.gameController.cleanupFinishedGames();
    }, 5 * 60 * 1000);
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Player ${socket.id} connected`);

      // Player joins the lobby
      socket.on('join-lobby', (data) => {
        const playerName = typeof data === 'string' ? data : data.playerName;
        const avatar = data.avatar || '🎮';
        
        socket.playerName = playerName;
        socket.playerAvatar = avatar;
        
        // Create or get player profile
        this.gameController.getOrCreatePlayer(socket.id, playerName, avatar);
        
        socket.emit('joined-lobby', {
          playerId: socket.id,
          playerName: playerName,
          avatar: avatar
        });
        
        // Send available avatars
        socket.emit('available-avatars', AVATARS);
        
        // Send available games list
        const gamesList = this.gameController.getGamesList();
        socket.emit('games-list', gamesList);
      });

      // Create a new game
      socket.on('create-game', (data) => {
        try {
          const playerName = data.playerName || socket.playerName || 'Player';
          const avatar = data.avatar || socket.playerAvatar || '🎮';
          const game = this.gameController.createGame(socket.id, playerName, avatar);
          
          socket.join(game.id);
          socket.gameId = game.id;
          
          socket.emit('game-created', {
            gameId: game.id,
            gameState: game.getPlayerState(socket.id)
          });
          
          // Broadcast updated games list to all players in lobby
          this.io.emit('games-list', this.gameController.getGamesList());
          
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Join an existing game
      socket.on('join-game', (data) => {
        try {
          const { gameId } = data;
          const playerName = data.playerName || socket.playerName || 'Player';
          const avatar = data.avatar || socket.playerAvatar || '🎮';
          const game = this.gameController.joinGame(gameId, socket.id, playerName, avatar);
          
          socket.join(gameId);
          socket.gameId = gameId;
          
          // Notify both players that the game has started
          this.io.to(gameId).emit('game-started', {
            gameState: game.getGameState()
          });
          
          // Update games list for lobby
          this.io.emit('games-list', this.gameController.getGamesList());
          
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Quick join - find any available game or create a new one
      socket.on('quick-join', (data) => {
        try {
          const playerName = data.playerName || socket.playerName || 'Player';
          const avatar = data.avatar || socket.playerAvatar || '🎮';
          let game = this.gameController.findAvailableGame();
          
          if (game) {
            // Join existing game
            this.gameController.joinGame(game.id, socket.id, playerName, avatar);
            socket.join(game.id);
            socket.gameId = game.id;
            
            // Notify both players that the game has started
            this.io.to(game.id).emit('game-started', {
              gameState: game.getGameState()
            });
          } else {
            // Create new game
            game = this.gameController.createGame(socket.id, playerName, avatar);
            socket.join(game.id);
            socket.gameId = game.id;
            
            socket.emit('game-created', {
              gameId: game.id,
              gameState: game.getPlayerState(socket.id)
            });
          }
          
          // Update games list for lobby
          this.io.emit('games-list', this.gameController.getGamesList());
          
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Make a move
      socket.on('make-move', (data) => {
        try {
          const { choice } = data;
          console.log(`Player ${socket.id} made move: ${choice}`);
          const game = this.gameController.makeMove(socket.id, choice);
          console.log(`Game state after move - P1: ${game.player1.choice}, P2: ${game.player2?.choice}`);
          
          // Send updated game state to both players
          if (game.player1) {
            this.io.to(game.player1.id).emit('game-update', {
              gameState: game.getPlayerState(game.player1.id)
            });
          }
          if (game.player2) {
            this.io.to(game.player2.id).emit('game-update', {
              gameState: game.getPlayerState(game.player2.id)
            });
          }
          
          // If both players have made their moves, send round result
          if (game.player1.choice && game.player2.choice) {
            console.log(`Both players made moves! Winner: ${game.roundWinner}`);
            setTimeout(() => {
              this.io.to(game.id).emit('round-result', {
                gameState: game.getGameState(),
                roundWinner: game.roundWinner
              });
              console.log('Sent round-result to room:', game.id);
              
              // If game is finished, send final result
              if (game.status === 'finished') {
                // Save game to history
                this.gameController.saveGameToHistory(game);
                
                setTimeout(() => {
                  this.io.to(game.id).emit('game-finished', {
                    gameState: game.getGameState(),
                    winner: game.winner
                  });
                }, 2000);
              } else {
                // Send next round state after 3 seconds
                setTimeout(() => {
                  this.io.to(game.id).emit('game-update', {
                    gameState: game.getGameState()
                  });
                  console.log('Next round started for game:', game.id);
                }, 3000);
              }
            }, 1000);
          }
          
        } catch (error) {
          console.error('Error in make-move:', error);
          socket.emit('error', { message: error.message });
        }
      });

      // Reset game
      socket.on('reset-game', () => {
        try {
          const game = this.gameController.getPlayerGame(socket.id);
          if (game) {
            this.gameController.resetGame(game.id);
            this.io.to(game.id).emit('game-reset', {
              gameState: game.getGameState()
            });
          }
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Update avatar
      socket.on('update-avatar', (data) => {
        try {
          const { avatar } = data;
          socket.playerAvatar = avatar;
          const player = this.gameController.updatePlayerAvatar(socket.id, avatar);
          
          if (player) {
            socket.emit('avatar-updated', {
              avatar: avatar,
              profile: player.getProfile()
            });
          }
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Get player profile
      socket.on('get-profile', () => {
        try {
          const profile = this.gameController.getPlayerProfile(socket.id);
          socket.emit('profile-data', profile);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Get player game history
      socket.on('get-history', (data) => {
        try {
          const limit = data?.limit || 10;
          const history = this.gameController.getPlayerHistory(socket.id, limit);
          socket.emit('history-data', history);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Leave game
      socket.on('leave-game', () => {
        this.handlePlayerLeave(socket);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected`);
        this.handlePlayerLeave(socket);
      });
    });
  }

  handlePlayerLeave(socket) {
    if (socket.gameId) {
      const game = this.gameController.getGame(socket.gameId);
      if (game) {
        // Notify the other player
        socket.to(socket.gameId).emit('player-disconnected', {
          message: 'Your opponent has left the game'
        });
      }
      
      socket.leave(socket.gameId);
      this.gameController.removePlayerFromGame(socket.id);
      
      // Update games list for lobby
      this.io.emit('games-list', this.gameController.getGamesList());
    }
  }
}

module.exports = SocketHandler;