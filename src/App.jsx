import React, { useState, useEffect } from 'react';

// Main App component
export default function App() {
  // Setup States
  const [gameMode, setGameMode] = useState(null); // '2P' or 'AI'
  const [playerNames, setPlayerNames] = useState({ p1: '', p2: '' });
  const [gameStarted, setGameStarted] = useState(false);

  // Game States
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('tictactoe_scores');
    return saved ? JSON.parse(saved) : { X: 0, O: 0, Draws: 0 };
  });
  const [winner, setWinner] = useState(null); // 'X', 'O', 'Draw'
  const [winningLine, setWinningLine] = useState([]);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (gameStarted) {
      localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
    }
  }, [scores, gameStarted]);

  // AI Move Effect
  useEffect(() => {
    if (gameStarted && gameMode === 'AI' && !xIsNext && !winner) {
      const timer = setTimeout(() => {
        makeAiMove();
      }, 600); // 600ms delay for a more natural feel
      return () => clearTimeout(timer);
    }
  }, [xIsNext, gameStarted, gameMode, winner, board]);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (!squares.includes(null)) {
      return { winner: 'Draw', line: [] };
    }
    return null;
  };

  // Minimax Algorithm
  const minimax = (newBoard, depth, isMaximizing) => {
    const result = checkWinner(newBoard);
    if (result) {
      if (result.winner === 'O') return 10 - depth;
      if (result.winner === 'X') return depth - 10;
      return 0; // Draw
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (newBoard[i] === null) {
          newBoard[i] = 'O';
          let score = minimax(newBoard, depth + 1, false);
          newBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (newBoard[i] === null) {
          newBoard[i] = 'X';
          let score = minimax(newBoard, depth + 1, true);
          newBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const makeAiMove = () => {
    let bestScore = -Infinity;
    let move = -1;
    let newBoard = [...board];
    
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === null) {
        newBoard[i] = 'O';
        let score = minimax(newBoard, 0, false);
        newBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    if (move !== -1) {
      handleClick(move, true);
    }
  };

  const handleClick = (i, isAi = false) => {
    if (board[i] || winner) return;
    if (gameMode === 'AI' && !xIsNext && !isAi) return; // Prevent human click during AI turn

    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      
      const newScores = { ...scores };
      if (result.winner === 'X') newScores.X += 1;
      else if (result.winner === 'O') newScores.O += 1;
      else newScores.Draws += 1;
      setScores(newScores);

      if (result.winner !== 'Draw') {
        triggerConfetti();
      }
    } else {
      setXIsNext(!xIsNext);
    }
  };

  const triggerConfetti = () => {
    const particles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80, 
      y: -20 - Math.random() * 30, 
      color: ['#ff007f', '#00ffff', '#ffffff', '#ffea00'][Math.floor(Math.random() * 4)],
      size: Math.random() * 10 + 5,
      delay: Math.random() * 0.2,
      duration: Math.random() * 1.5 + 1.5,
      rotation: Math.random() * 360,
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 4000);
  };

  const nextRound = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setXIsNext(true); 
  };

  const resetAll = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setXIsNext(true);
    setScores({ X: 0, O: 0, Draws: 0 });
    localStorage.removeItem('tictactoe_scores');
    setPlayerNames({ p1: '', p2: '' });
    setGameMode(null); // Return all the way to Mode Select
    setGameStarted(false);
  };

  // Render Mode Selection
  if (!gameMode) {
    return (
      <div className="space-game">
        <StarBackground />
        <div className="setup-container">
          <h1 className="title">COSMIC TIC TAC TOE</h1>
          <h2 className="neon-text" style={{marginBottom: '20px', color: '#fff'}}>SELECT GAME MODE</h2>
          
          <button 
            className="btn btn-mode" 
            onClick={() => setGameMode('2P')}
          >
            2 PLAYER MODE
          </button>
          
          <button 
            className="btn btn-mode ai-btn" 
            onClick={() => setGameMode('AI')}
          >
            VS AI (MINIMAX)
          </button>
        </div>
        <div className="footer">© 2026 SpaceGame by Rajneesh Chaubey. All rights reserved.</div>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </div>
    );
  }

  // Render Name Input Screen
  if (!gameStarted) {
    return (
      <div className="space-game">
        <StarBackground />
        <div className="setup-container">
          <h1 className="title">COSMIC TIC TAC TOE</h1>
          
          <div className="input-group">
            <label className="neon-text pink">Player 1 (X) Name</label>
            <input 
              type="text" 
              className="name-input pink-input" 
              value={playerNames.p1} 
              onChange={(e) => setPlayerNames({...playerNames, p1: e.target.value})} 
              placeholder="Enter name..."
              maxLength={15}
            />
          </div>

          {gameMode === '2P' && (
            <div className="input-group">
              <label className="neon-text cyan">Player 2 (O) Name</label>
              <input 
                type="text" 
                className="name-input cyan-input" 
                value={playerNames.p2} 
                onChange={(e) => setPlayerNames({...playerNames, p2: e.target.value})} 
                placeholder="Enter name..."
                maxLength={15}
              />
            </div>
          )}

          <button 
            className="btn btn-start" 
            onClick={() => {
              if (gameMode === 'AI') {
                if (playerNames.p1.trim()) {
                  setPlayerNames(prev => ({ ...prev, p2: 'AI' }));
                  setGameStarted(true);
                }
              } else {
                if (playerNames.p1.trim() && playerNames.p2.trim()) {
                  setGameStarted(true);
                }
              }
            }}
            disabled={!playerNames.p1.trim() || (gameMode === '2P' && !playerNames.p2.trim())}
          >
            START GAME
          </button>
          
          <button 
            className="btn btn-back" 
            onClick={() => setGameMode(null)}
          >
            Back to Mode Select
          </button>
        </div>
        <div className="footer">© 2026 SpaceGame by Rajneesh Chaubey. All rights reserved.</div>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </div>
    );
  }

  // Render Main Game
  return (
    <div className="space-game">
      <StarBackground />
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti-particle"
          style={{
            left: `${c.x}vw`,
            top: `${c.y}vh`,
            backgroundColor: c.color,
            width: `${c.size}px`,
            height: `${c.size}px`,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            transform: `rotate(${c.rotation}deg)`,
          }}
        />
      ))}

      <div className="game-container">
        <h1 className="title">COSMIC TIC TAC TOE</h1>

        <div className="score-board">
          <div className={`score-card p1 ${xIsNext && !winner ? 'active' : ''}`}>
            <span className="player-name">{playerNames.p1} (X)</span>
            <span className="score-value">{scores.X}</span>
          </div>
          <div className="score-card draws">
            <span className="player-name">Draws</span>
            <span className="score-value">{scores.Draws}</span>
          </div>
          <div className={`score-card p2 ${!xIsNext && !winner ? 'active' : ''}`}>
            <span className="player-name">{playerNames.p2} (O)</span>
            <span className="score-value">{scores.O}</span>
          </div>
        </div>

        <div className="status-bar">
          {winner ? (
            winner === 'Draw' ? "IT'S A DRAW!" : `${winner === 'X' ? playerNames.p1 : playerNames.p2} (${winner}) WINS!`
          ) : (
            `TURN: ${xIsNext ? playerNames.p1 + ' (X)' : playerNames.p2 + ' (O)'}`
          )}
        </div>

        <div className="board">
          {board.map((cell, i) => (
            <div
              key={i}
              className={`cell ${winningLine.includes(i) ? 'winning-cell' : ''} ${cell ? 'filled' : ''}`}
              onClick={() => handleClick(i)}
            >
              {cell && (
                <span className={`mark ${cell === 'X' ? 'mark-x' : 'mark-o'}`}>
                  {cell}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="controls">
          {winner && <button className="btn btn-next" onClick={nextRound}>Next Round</button>}
          <button className="btn btn-reset" onClick={resetAll}>Reset All</button>
        </div>
      </div>

      <div className="footer">© 2026 SpaceGame by Rajneesh Chaubey. All rights reserved.</div>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
    </div>
  );
}

const StarBackground = () => {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const newStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="star-background">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}vw`,
            top: `${s.y}vh`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap');

:root {
  --bg-color: #050510;
  --neon-pink: #ff007f;
  --neon-pink-glow: rgba(255, 0, 127, 0.5);
  --neon-cyan: #00ffff;
  --neon-cyan-glow: rgba(0, 255, 255, 0.5);
  --grid-color: rgba(255, 255, 255, 0.1);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body, html {
  width: 100%;
  height: 100%;
  background-color: var(--bg-color);
  color: var(--text-primary);
  font-family: 'Orbitron', sans-serif;
  overflow: hidden;
}

#root {
  width: 100%;
  height: 100%;
}

.space-game {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Star Background */
.star-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  background-color: #fff;
  border-radius: 50%;
  opacity: 0;
  animation: twinkle linear infinite;
}

@keyframes twinkle {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px #fff; }
  100% { opacity: 0; transform: scale(0.5); }
}

/* Confetti */
.confetti-particle {
  position: absolute;
  z-index: 100;
  pointer-events: none;
  animation: fall linear forwards;
}

@keyframes fall {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(120vh) rotate(720deg) scale(0.5); opacity: 0; }
}

/* Setup Container */
.setup-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  background: rgba(10, 10, 25, 0.6);
  padding: 50px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.05);
  width: 90%;
  max-width: 450px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.neon-text {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.neon-text.pink { color: var(--neon-pink); text-shadow: 0 0 10px var(--neon-pink-glow); }
.neon-text.cyan { color: var(--neon-cyan); text-shadow: 0 0 10px var(--neon-cyan-glow); }

.name-input {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 10px;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
  outline: none;
  transition: all 0.3s ease;
  width: 100%;
}

.name-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.name-input.pink-input:focus {
  border-color: var(--neon-pink);
  box-shadow: 0 0 15px var(--neon-pink-glow);
  background: rgba(255, 0, 127, 0.1);
}

.name-input.cyan-input:focus {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px var(--neon-cyan-glow);
  background: rgba(0, 255, 255, 0.1);
}

.btn-mode {
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  border-color: var(--neon-pink);
  color: var(--neon-pink);
}

.btn-mode:hover {
  background: rgba(255, 0, 127, 0.15);
  box-shadow: 0 0 20px var(--neon-pink-glow);
}

.btn-mode.ai-btn {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}
.btn-mode.ai-btn:hover {
  background: rgba(0, 255, 255, 0.15);
  box-shadow: 0 0 20px var(--neon-cyan-glow);
}

.btn-start {
  margin-top: 15px;
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
  letter-spacing: 2px;
}

.btn-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-start:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  border-color: #fff;
  transform: translateY(-2px);
}

.btn-back {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.6);
  font-size: 0.9rem;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 10px;
  transition: color 0.3s;
}
.btn-back:hover {
  color: #fff;
}

/* Game Container */
.game-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  background: rgba(10, 10, 25, 0.6);
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.05);
}

.title {
  font-size: 2.8rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 5px;
  text-transform: uppercase;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(255,255,255,0.1);
  letter-spacing: 3px;
}

/* Score Board */
.score-board {
  display: flex;
  gap: 30px;
  width: 100%;
  justify-content: center;
  margin-bottom: 10px;
}

.score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 12px 25px;
  border-radius: 12px;
  border: 2px solid rgba(255,255,255,0.05);
  transition: all 0.3s ease;
  min-width: 120px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
}

.score-card.p1 { color: var(--neon-pink); }
.score-card.p2 { color: var(--neon-cyan); }
.score-card.draws { color: var(--text-secondary); }

.score-card.p1.active {
  border-color: var(--neon-pink);
  box-shadow: 0 0 20px var(--neon-pink-glow);
  transform: translateY(-5px);
  background: rgba(255, 0, 127, 0.1);
}

.score-card.p2.active {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 20px var(--neon-cyan-glow);
  transform: translateY(-5px);
  background: rgba(0, 255, 255, 0.1);
}

.player-name {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  opacity: 0.8;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-value {
  font-size: 1.8rem;
  font-weight: 700;
}

/* Status Bar */
.status-bar {
  font-size: 1.3rem;
  font-weight: 700;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 10px rgba(255,255,255,0.4);
  letter-spacing: 2px;
  color: #fff;
  text-transform: uppercase;
}

/* Board */
.board {
  display: grid;
  grid-template-columns: repeat(3, 110px);
  grid-template-rows: repeat(3, 110px);
  gap: 12px;
  margin: 10px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 15px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
}

.cell {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.cell:hover:not(.filled) {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.4);
}

.cell:active:not(.filled) {
  transform: scale(0.95);
}

.mark {
  font-size: 4.5rem;
  font-weight: 700;
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.mark-x {
  color: var(--neon-pink);
  text-shadow: 0 0 15px var(--neon-pink-glow), 0 0 30px var(--neon-pink);
}

.mark-o {
  color: var(--neon-cyan);
  text-shadow: 0 0 15px var(--neon-cyan-glow), 0 0 30px var(--neon-cyan);
}

/* Winning Animation */
.winning-cell {
  animation: pulseWin 1.5s infinite alternate;
  z-index: 2;
  border-color: rgba(255,255,255,0.5);
}

@keyframes pulseWin {
  0% { background: rgba(255, 255, 255, 0.1); box-shadow: 0 0 15px rgba(255,255,255,0.3); transform: scale(1); }
  100% { background: rgba(255, 255, 255, 0.25); box-shadow: 0 0 30px rgba(255,255,255,0.8); transform: scale(1.05); }
}

/* Controls */
.controls {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  height: 45px;
  align-items: center;
  justify-content: center;
}

.btn {
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 12px 25px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.btn:hover {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.btn:active {
  transform: scale(0.95) translateY(0);
}

.btn-next {
  border-color: #ffd700;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.05);
}
.btn-next:hover {
  background: rgba(255, 215, 0, 0.15);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.btn-reset {
  border-color: rgba(255, 255, 255, 0.4);
}
.btn-reset:hover {
  background: rgba(255, 0, 0, 0.15);
  border-color: #ff2a2a;
  color: #ff2a2a;
  box-shadow: 0 0 20px rgba(255, 42, 42, 0.6);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .game-container, .setup-container {
    padding: 20px;
    width: 90%;
  }
  .title {
    font-size: 2rem;
  }
  .board {
    grid-template-columns: repeat(3, 80px);
    grid-template-rows: repeat(3, 80px);
    gap: 8px;
  }
  .mark {
    font-size: 3.5rem;
  }
  .score-board {
    gap: 15px;
  }
  .score-card {
    min-width: 80px;
    padding: 8px 15px;
  }
  .score-value {
    font-size: 1.4rem;
  }
  .player-name {
    font-size: 0.7rem;
    max-width: 70px;
  }
}

.footer {
  position: absolute;
  bottom: 15px;
  width: 100%;
  text-align: center;
  font-size: 0.75rem;
  color: var(--neon-cyan);
  opacity: 0.7;
  text-shadow: 0 0 5px var(--neon-cyan-glow);
  letter-spacing: 1px;
  z-index: 10;
  padding: 0 20px;
}
`;
