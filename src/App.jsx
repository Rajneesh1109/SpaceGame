import React, { useState, useEffect } from 'react';

// Main App component
export default function App() {
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
    localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
  }, [scores]);

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

  const handleClick = (i) => {
    if (board[i] || winner) return;

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
      x: 10 + Math.random() * 80, // spread across width
      y: -20 - Math.random() * 30, // start above screen
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
    setXIsNext(true); // Or keep alternating
  };

  const resetAll = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setXIsNext(true);
    setScores({ X: 0, O: 0, Draws: 0 });
    localStorage.removeItem('tictactoe_scores');
  };

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
            <span className="player-name">Player 1 (X)</span>
            <span className="score-value">{scores.X}</span>
          </div>
          <div className="score-card draws">
            <span className="player-name">Draws</span>
            <span className="score-value">{scores.Draws}</span>
          </div>
          <div className={`score-card p2 ${!xIsNext && !winner ? 'active' : ''}`}>
            <span className="player-name">Player 2 (O)</span>
            <span className="score-value">{scores.O}</span>
          </div>
        </div>

        <div className="status-bar">
          {winner ? (
            winner === 'Draw' ? "IT'S A DRAW!" : `PLAYER ${winner === 'X' ? '1' : '2'} (${winner}) WINS!`
          ) : (
            `TURN: PLAYER ${xIsNext ? '1 (X)' : '2 (O)'}`
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

/* Game Container */
.game-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
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
  margin-bottom: 10px;
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

.score-card.p1 {
  color: var(--neon-pink);
}

.score-card.p2 {
  color: var(--neon-cyan);
}

.score-card.draws {
  color: var(--text-secondary);
}

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
  .game-container {
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
  }
}
`;
