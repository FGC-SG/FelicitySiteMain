import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

const COLS = 8;
const ROWS = 8;
const CELL = 44;
const COLORS = [
  { bg: "#ff3b3b", border: "#cc0000", shine: "#ff9999", label: "R" },
  { bg: "#ff8c00", border: "#cc5500", shine: "#ffcc88", label: "O" },
  { bg: "#ffd700", border: "#cc9900", shine: "#ffee88", label: "Y" },
  { bg: "#2ecc40", border: "#1a8a2a", shine: "#88ee99", label: "G" },
  { bg: "#0088ff", border: "#0055cc", shine: "#88ccff", label: "B" },
  { bg: "#cc44cc", border: "#881188", shine: "#ee99ee", label: "P" },
];

type Board = (number | null)[][];

function randomBoard(): Board {
  let board: Board;
  let attempts = 0;
  do {
    board = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => Math.floor(Math.random() * COLORS.length))
    );
    attempts++;
  } while (findMatches(board).size > 0 && attempts < 20);
  return board;
}

function findMatches(board: Board): Set<string> {
  const matched = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 2; c++) {
      const v = board[r][c];
      if (v !== null && v === board[r][c + 1] && v === board[r][c + 2]) {
        let len = 3;
        while (c + len < COLS && board[r][c + len] === v) len++;
        for (let i = 0; i < len; i++) matched.add(`${r},${c + i}`);
      }
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 2; r++) {
      const v = board[r][c];
      if (v !== null && v === board[r + 1][c] && v === board[r + 2][c]) {
        let len = 3;
        while (r + len < ROWS && board[r + len][c] === v) len++;
        for (let i = 0; i < len; i++) matched.add(`${r + i},${c}`);
      }
    }
  }
  return matched;
}

function applyGravity(board: Board): Board {
  const next = board.map(r => [...r]);
  for (let c = 0; c < COLS; c++) {
    const col = next.map(r => r[c]).filter(v => v !== null) as number[];
    const pad = ROWS - col.length;
    const filled = [
      ...Array.from({ length: pad }, () => Math.floor(Math.random() * COLORS.length)),
      ...col,
    ];
    for (let r = 0; r < ROWS; r++) next[r][c] = filled[r];
  }
  return next;
}

function removeMatches(board: Board, matches: Set<string>): Board {
  const next = board.map(r => [...r]);
  for (const key of matches) {
    const [r, c] = key.split(",").map(Number);
    next[r][c] = null;
  }
  return next;
}

function swapCells(board: Board, a: [number, number], b: [number, number]): Board {
  const next = board.map(r => [...r]);
  const tmp = next[a[0]][a[1]];
  next[a[0]][a[1]] = next[b[0]][b[1]];
  next[b[0]][b[1]] = tmp;
  return next;
}

function isAdjacent(a: [number, number], b: [number, number]) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

function hasMoves(board: Board): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= ROWS || nc >= COLS) continue;
        const swapped = swapCells(board, [r, c], [nr, nc]);
        if (findMatches(swapped).size > 0) return true;
      }
    }
  }
  return false;
}

interface Props { open: boolean; onClose: () => void; }

export function CandyCrushGame({ open, onClose }: Props) {
  const [board, setBoard] = useState<Board>(randomBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [flashCells, setFlashCells] = useState<Set<string>>(new Set());
  const [noMoves, setNoMoves] = useState(false);
  const processingRef = useRef(false);

  const restart = useCallback(() => {
    setBoard(randomBoard());
    setSelected(null);
    setScore(0);
    setMoves(30);
    setGameOver(false);
    setAnimating(false);
    setFlashCells(new Set());
    setNoMoves(false);
    processingRef.current = false;
  }, []);

  const cascade = useCallback(async (b: Board): Promise<{ board: Board; gained: number }> => {
    let current = b;
    let gained = 0;
    while (true) {
      const matches = findMatches(current);
      if (matches.size === 0) break;
      gained += matches.size * 10;
      setFlashCells(new Set(matches));
      await new Promise(r => setTimeout(r, 220));
      current = removeMatches(current, matches);
      setBoard([...current]);
      await new Promise(r => setTimeout(r, 120));
      current = applyGravity(current);
      setBoard([...current]);
      setFlashCells(new Set());
      await new Promise(r => setTimeout(r, 150));
    }
    return { board: current, gained };
  }, []);

  const handleCell = useCallback(async (r: number, c: number) => {
    if (animating || gameOver || processingRef.current) return;
    if (selected === null) {
      setSelected([r, c]);
      return;
    }
    const [sr, sc] = selected;
    if (sr === r && sc === c) { setSelected(null); return; }
    if (!isAdjacent([sr, sc], [r, c])) { setSelected([r, c]); return; }

    processingRef.current = true;
    setAnimating(true);
    setSelected(null);

    const swapped = swapCells(board, [sr, sc], [r, c]);
    const preMatches = findMatches(swapped);
    if (preMatches.size === 0) {
      setBoard(swapped);
      await new Promise(res => setTimeout(res, 180));
      setBoard(board);
      setAnimating(false);
      processingRef.current = false;
      return;
    }

    setBoard(swapped);
    const newMoves = moves - 1;
    setMoves(newMoves);
    await new Promise(res => setTimeout(res, 100));

    const { board: final, gained } = await cascade(swapped);
    setScore(s => s + gained);

    if (newMoves <= 0) {
      setGameOver(true);
    } else if (!hasMoves(final)) {
      setNoMoves(true);
      await new Promise(res => setTimeout(res, 800));
      const fresh = randomBoard();
      setBoard(fresh);
      setNoMoves(false);
    }

    setAnimating(false);
    processingRef.current = false;
  }, [animating, gameOver, selected, board, moves, cascade]);

  const renderCandy = (value: number | null, r: number, c: number) => {
    const key = `${r},${c}`;
    const isSelected = selected && selected[0] === r && selected[1] === c;
    const isFlashing = flashCells.has(key);
    const color = value !== null ? COLORS[value] : null;

    return (
      <div
        key={c}
        onClick={() => value !== null && handleCell(r, c)}
        style={{
          width: CELL,
          height: CELL,
          cursor: value !== null ? "pointer" : "default",
          padding: 3,
          transition: "transform 0.12s ease, opacity 0.15s ease",
          transform: isSelected ? "scale(1.18)" : isFlashing ? "scale(1.25)" : "scale(1)",
          opacity: isFlashing ? 0.4 : 1,
        }}
      >
        {color && (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 30%, ${color.shine}, ${color.bg} 55%, ${color.border})`,
              border: isSelected ? `3px solid white` : `2px solid ${color.border}`,
              boxShadow: isSelected
                ? `0 0 10px white, 0 2px 6px rgba(0,0,0,0.5)`
                : `inset 0 3px 6px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.4)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            {["🍎","🍊","⭐","🍀","💎","🌸"][value]}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden border-pink-600 [&>button]:text-white [&>button]:opacity-60 [&>button:hover]:opacity-100"
        style={{ background: "linear-gradient(135deg, #1a0030 0%, #2d0050 50%, #1a002a 100%)" }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-4 pt-4 pb-1">
          <DialogTitle className="text-white text-center text-lg tracking-widest font-bold"
            style={{ textShadow: "0 0 12px #ff88ff, 0 0 24px #cc44cc" }}>
            🍬 CANDY CRUSH
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center pb-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-pink-400 hover:text-white text-xs flex items-center gap-1.5"
          >
            <Home className="h-3.5 w-3.5" />
            Return to home
          </Button>
        </div>

        {/* Score bar */}
        <div className="flex justify-between items-center px-5 pb-2">
          <div className="text-center">
            <p className="text-pink-300 text-xs font-bold tracking-widest">SCORE</p>
            <p className="text-white text-xl font-bold">{score.toLocaleString()}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={restart}
            className="text-pink-300 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-pink-300 text-xs font-bold tracking-widest">MOVES</p>
            <p className={`text-xl font-bold ${moves <= 5 ? "text-red-400" : "text-white"}`}>{moves}</p>
          </div>
        </div>

        {/* Board */}
        <div className="px-3 pb-3">
          <div
            style={{
              display: "inline-block",
              background: "rgba(0,0,0,0.4)",
              border: "2px solid rgba(255,100,255,0.3)",
              borderRadius: 12,
              padding: 4,
              boxShadow: "0 0 20px rgba(200,0,200,0.3)",
            }}
          >
            {board.map((row, r) => (
              <div key={r} style={{ display: "flex" }}>
                {row.map((cell, c) => renderCandy(cell, r, c))}
              </div>
            ))}
          </div>
        </div>

        {/* Status messages */}
        {noMoves && (
          <p className="text-yellow-300 text-xs text-center pb-2 animate-pulse">
            No moves left — shuffling board...
          </p>
        )}
        {gameOver && (
          <div className="px-4 pb-4 text-center">
            <p className="text-pink-300 text-base font-bold mb-1">Game Over!</p>
            <p className="text-white text-sm mb-3">Final Score: {score.toLocaleString()}</p>
            <Button onClick={restart} className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-6">
              Play Again
            </Button>
          </div>
        )}

        <p className="text-pink-300 text-xs text-center pb-3 opacity-60">
          Click a candy, then click an adjacent one to swap
        </p>
      </DialogContent>
    </Dialog>
  );
}
