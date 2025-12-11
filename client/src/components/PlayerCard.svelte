<script>
  export let player;
  export let isMe = false;

  const getChoiceEmoji = (choice) => {
    const choices = {
      'rock': '🗿',
      'paper': '📄',
      'scissors': '✂️'
    };
    return choices[choice] || '❓';
  };
</script>

<div class="player-card" class:me={isMe} class:opponent={!isMe}>
  <div class="player-header">
    <h3 class="player-name">
      {isMe ? '👤 ' : '🤖 '}{player?.name || 'Unknown'}
      {#if isMe}<span class="you-indicator">(You)</span>{/if}
    </h3>
    <div class="player-score">
      Score: <span class="score-number">{player?.score || 0}</span>
    </div>
  </div>
  
  <div class="player-choice">
    {#if player?.choice}
      <div class="choice-display">
        <span class="choice-emoji">{getChoiceEmoji(player.choice)}</span>
        <span class="choice-name">{player.choice}</span>
      </div>
    {:else}
      <div class="waiting-choice">
        <span class="waiting-icon">🤔</span>
        <span class="waiting-text">Thinking...</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .player-card {
    background: var(--surface-2);
    border-radius: var(--radius-md);
    padding: 1.3rem;
    box-shadow: var(--shadow-1);
    border: 1px solid var(--muted);
    transition: all 0.2s ease;
    min-width: 200px;
    text-align: center;
    color: var(--text-primary);
  }

  .player-card.me {
    border-color: rgba(61, 220, 151, 0.35);
    background: linear-gradient(135deg, rgba(61, 220, 151, 0.08) 0%, transparent 100%);
  }

  .player-card.opponent {
    border-color: rgba(124, 136, 255, 0.35);
    background: linear-gradient(135deg, rgba(124, 136, 255, 0.08) 0%, transparent 100%);
  }

  .player-header {
    margin-bottom: 1rem;
  }

  .player-name {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  .you-indicator {
    font-size: 0.8rem;
    color: var(--success);
    font-weight: 600;
  }

  .player-score {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .score-number {
    font-weight: 800;
    color: var(--text-primary);
    font-size: 1.1rem;
  }

  .player-choice {
    padding: 1rem 0;
  }

  .choice-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .choice-emoji {
    font-size: 3rem;
    margin-bottom: 0.25rem;
  }

  .choice-name {
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: capitalize;
    font-size: 0.95rem;
  }

  .waiting-choice {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.7;
  }

  .waiting-icon {
    font-size: 3rem;
    animation: pulse 2s infinite;
  }

  .waiting-text {
    font-style: italic;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  @media (max-width: 768px) {
    .player-card {
      min-width: 150px;
      padding: 1rem;
    }

    .player-name {
      font-size: 1rem;
    }

    .choice-emoji {
      font-size: 2.5rem;
    }
  }
</style>