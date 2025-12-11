class Player {
  constructor(id, name, avatar = '🎮') {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.stats = {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      totalRoundsWon: 0,
      totalRoundsLost: 0,
      winRate: 0
    };
    this.gameHistory = []; // Array of game history objects
    this.createdAt = new Date();
    this.lastActive = new Date();
  }

  updateAvatar(newAvatar) {
    this.avatar = newAvatar;
  }

  addGameResult(gameHistory) {
    // Add to history
    this.gameHistory.unshift(gameHistory); // Add to beginning
    
    // Keep only last 20 games
    if (this.gameHistory.length > 20) {
      this.gameHistory = this.gameHistory.slice(0, 20);
    }

    // Update stats
    this.stats.gamesPlayed++;
    
    const isPlayer1 = gameHistory.player1.id === this.id;
    const myScore = isPlayer1 ? gameHistory.player1.score : gameHistory.player2.score;
    const opponentScore = isPlayer1 ? gameHistory.player2.score : gameHistory.player1.score;

    if (gameHistory.winner === (isPlayer1 ? 'player1' : 'player2')) {
      this.stats.wins++;
    } else if (gameHistory.winner === 'tie') {
      this.stats.ties++;
    } else {
      this.stats.losses++;
    }

    this.stats.totalRoundsWon += myScore;
    this.stats.totalRoundsLost += opponentScore;

    // Calculate win rate
    const totalDecisiveGames = this.stats.wins + this.stats.losses;
    this.stats.winRate = totalDecisiveGames > 0 
      ? Math.round((this.stats.wins / totalDecisiveGames) * 100) 
      : 0;

    this.lastActive = new Date();
  }

  getProfile() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      stats: this.stats,
      createdAt: this.createdAt,
      lastActive: this.lastActive
    };
  }

  getGameHistory(limit = 10) {
    return this.gameHistory.slice(0, limit);
  }
}

module.exports = Player;
