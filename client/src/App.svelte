<script>
  import { onMount, onDestroy } from 'svelte';
  import { gameStore, gameActions, connected, error, gameState, playerInfo, gamesList } from './stores/gameStore.js';
  import GameBoard from './components/GameBoard.svelte';
  import PlayerCard from './components/PlayerCard.svelte';
  import GameResult from './components/GameResult.svelte';

  let playerName = '';
  let currentView = 'login';
  let errorMessage = '';
  let connectionStatus = 'disconnected';

  // Subscribe to stores
  const unsubscribe = [
    gameStore.subscribe(store => {
      currentView = store.currentView;
      playerName = store.playerName;
      connectionStatus = store.connectionStatus;
    }),
    error.subscribe(err => {
      errorMessage = err || '';
    })
  ];

  onMount(() => {
    // Auto-connect to server when app loads
    gameActions.connectToServer();
  });

  onDestroy(() => {
    unsubscribe.forEach(fn => fn());
    gameActions.disconnect();
  });

  function handleLogin() {
    if (playerName.trim()) {
      gameActions.joinLobby(playerName.trim());
    }
  }

  function handleCreateGame() {
    gameActions.createGame();
  }

  function handleQuickJoin() {
    gameActions.quickJoin();
  }

  function handleJoinGame(gameId) {
    gameActions.joinGame(gameId);
  }

  function handleLeaveGame() {
    gameActions.leaveGame();
  }
</script>

<main class="app">
  <header class="header">
    <h1>🗿📄✂️ Stone Paper Scissors</h1>
    <div class="header-actions">
      <button class="theme-toggle" on:click={() => {
        const root = document.documentElement;
        const isLight = root.getAttribute('data-theme') === 'light';
        root.setAttribute('data-theme', isLight ? 'dark' : 'light');
      }}>
        🌓 Theme
      </button>
      <div class="connection-status {connectionStatus}">
      {connectionStatus === 'connected' ? '🟢 Connected' : 
       connectionStatus === 'connecting' ? '🟡 Connecting...' : 
       '🔴 Disconnected'}
      </div>
    </div>
  </header>

  {#if errorMessage}
    <div class="error-message">
      <span>⚠️ {errorMessage}</span>
      <button on:click={() => errorMessage = ''}>×</button>
    </div>
  {/if}

  <div class="container">
    {#if currentView === 'login'}
      <div class="login-screen">
        <div class="login-card">
          <h2>Welcome to Stone Paper Scissors!</h2>
          <p>Enter your name to start playing</p>
          <form on:submit|preventDefault={handleLogin}>
            <input 
              type="text" 
              placeholder="Your name" 
              bind:value={playerName}
              maxlength="20"
              required
            />
            <button type="submit" disabled={!playerName.trim() || connectionStatus !== 'connected'}>
              {connectionStatus === 'connected' ? 'Join Game' : 'Connecting...'}
            </button>
          </form>
        </div>
      </div>

    {:else if currentView === 'lobby'}
      <div class="lobby">
        <div class="lobby-header">
          <h2>Game Lobby</h2>
          <p>Welcome, <strong>{playerName}</strong>!</p>
        </div>
        
        <div class="lobby-actions">
          <button class="primary" on:click={handleCreateGame}>
            🎮 Create New Game
          </button>
          <button class="secondary" on:click={handleQuickJoin}>
            ⚡ Quick Join
          </button>
        </div>

        <div class="games-list">
          <h3>Available Games</h3>
          {#if $gamesList && $gamesList.length > 0}
            <div class="games-grid">
              {#each $gamesList as game}
                {#if game.status === 'waiting'}
                  <div class="game-card">
                    <div class="game-info">
                      <span class="game-id">Game #{game.id}</span>
                      <span class="players-count">{game.playersCount}/2 players</span>
                    </div>
                    <button on:click={() => handleJoinGame(game.id)}>
                      Join Game
                    </button>
                  </div>
                {/if}
              {/each}
            </div>
          {:else}
            <p class="no-games">No games available. Create one!</p>
          {/if}
        </div>
      </div>

    {:else if currentView === 'waiting'}
      <div class="waiting-screen">
        <div class="waiting-card">
          <h2>🎮 Game Created!</h2>
          <p>Waiting for another player to join...</p>
          <div class="spinner"></div>
          <button class="secondary" on:click={handleLeaveGame}>
            Cancel
          </button>
        </div>
      </div>

    {:else if currentView === 'game'}
      <GameBoard />
    {/if}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    min-height: 100vh;
    background: var(--bg-accent);
    color: var(--text-primary);
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0)) ;
    backdrop-filter: blur(12px);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .header h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.6rem;
    letter-spacing: 0.3px;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .theme-toggle {
    background: var(--surface-2);
    color: var(--text-primary);
    border: 1px solid var(--muted);
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .theme-toggle:hover {
    border-color: var(--primary);
    box-shadow: 0 0 0 6px var(--ring);
  }

  .connection-status {
    background: var(--surface-2);
    border: 1px solid var(--muted);
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .connection-status.connected {
    color: var(--success);
    border-color: rgba(61, 220, 151, 0.35);
  }

  .connection-status.connecting {
    color: var(--warning);
    border-color: rgba(246, 192, 73, 0.35);
  }

  .connection-status.disconnected {
    color: var(--danger);
    border-color: rgba(255, 107, 107, 0.35);
  }

  .container {
    flex: 1;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .login-screen, .waiting-screen {
    width: 100%;
    max-width: 400px;
  }

  .login-card, .waiting-card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    padding: 2rem;
    box-shadow: var(--shadow-1);
    border: 1px solid var(--muted);
    text-align: center;
  }

  .login-card h2, .waiting-card h2 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .login-card p, .waiting-card p {
    margin: 0 0 2rem 0;
    color: var(--text-secondary);
  }

  .login-card input {
    width: 100%;
    padding: 0.9rem 1rem;
    border: 1px solid var(--muted);
    background: var(--surface-2);
    color: var(--text-primary);
    border-radius: var(--radius-md);
    font-size: 1rem;
    margin-bottom: 1rem;
    box-sizing: border-box;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .login-card input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 6px var(--ring);
  }

  .lobby {
    width: 100%;
    max-width: 900px;
    background: var(--surface);
    border-radius: var(--radius-lg);
    padding: 2rem;
    box-shadow: var(--shadow-1);
    border: 1px solid var(--muted);
  }

  .lobby-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .lobby-header h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }

  .lobby-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .games-list h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .game-card {
    background: var(--surface-2);
    border-radius: var(--radius-md);
    border: 1px solid var(--muted);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .game-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .game-id {
    font-weight: 600;
    color: var(--text-primary);
  }

  .players-count {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .no-games {
    text-align: center;
    color: var(--text-secondary);
    font-style: italic;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 1rem auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  button {
    background: var(--primary);
    color: var(--text-primary);
    border: 1px solid transparent;
    padding: 0.7rem 1.4rem;
    border-radius: 999px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 600;
  }

  button:hover {
    background: var(--primary-700);
    transform: translateY(-2px);
    box-shadow: 0 0 0 6px var(--ring);
  }

  button:disabled {
    background: #666b;
    color: #aaa;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  button.secondary {
    background: var(--surface-2);
    color: var(--text-primary);
    border-color: var(--muted);
  }

  button.secondary:hover {
    background: var(--surface);
  }

  .error-message {
    background: rgba(227, 75, 75, 0.12);
    border: 1px solid rgba(227, 75, 75, 0.35);
    color: var(--danger);
    padding: 1rem;
    border-radius: var(--radius-md);
    margin: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .error-message button {
    background: none;
    color: var(--danger);
    border: none;
    font-size: 1.2rem;
    padding: 0;
    min-width: auto;
  }
</style>