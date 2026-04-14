import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronDown, ChevronLeft, ChevronRight, RotateCw, Home } from "lucide-react";

const COLS = 10;
const ROWS = 20;
const CELL = 28;

type Board = (string | null)[][];
type Piece = { shape: number[][]; color: string };

const TETROMINOES: Piece[] = [
  { shape: [[1,1,1,1]], color: "#00d4ff" },                         // I
  { shape: [[1,1],[1,1]], color: "#ffd600" },                       // O
  { shape: [[0,1,0],[1,1,1]], color: "#aa00ff" },                   // T
  { shape: [[1,1,0],[0,1,1]], color: "#00c853" },                   // S
  { shape: [[0,1,1],[1,1,0]], color: "#ff1744" },                   // Z
  { shape: [[1,0,0],[1,1,1]], color: "#0d47a1" },                   // J
  { shape: [[0,0,1],[1,1,1]], color: "#ff6d00" },                   // L
];

const emptyBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const randomPiece = () => TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];

function rotate(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
}

function isValid(board: Board, shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nr = y + r;
      const nc = x + c;
      if (nr >= ROWS || nc < 0 || nc >= COLS) return false;
      if (nr >= 0 && board[nr][nc]) return false;
    }
  }
  return true;
}

function merge(board: Board, shape: number[][], x: number, y: number, color: string): Board {
  const next = board.map(r => [...r]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] && y + r >= 0) {
        next[y + r][x + c] = color;
      }
    }
  }
  return next;
}

function clearLines(board: Board): { board: Board; lines: number } {
  const remaining = board.filter(row => row.some(cell => !cell));
  const cleared = ROWS - remaining.length;
  const newBoard = [
    ...Array.from({ length: cleared }, () => Array(COLS).fill(null)),
    ...remaining,
  ];
  return { board: newBoard, lines: cleared };
}

const SCORES = [0, 100, 300, 500, 800];

interface TetrisGameProps {
  open: boolean;
  onClose: () => void;
}

export function TetrisGame({ open, onClose }: TetrisGameProps) {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [current, setCurrent] = useState<Piece>(randomPiece);
  const [next, setNext] = useState<Piece>(randomPiece);
  const [pos, setPos] = useState({ x: 3, y: -2 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    const p = randomPiece();
    const n = randomPiece();
    setBoard(emptyBoard());
    setCurrent(p);
    setNext(n);
    setPos({ x: 3, y: -2 });
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setStarted(true);
    setPaused(false);
  }, []);

  const lockPiece = useCallback((b: Board, shape: number[][], x: number, y: number, color: string) => {
    const merged = merge(b, shape, x, y, color);
    const { board: cleared, lines: linesCleared } = clearLines(merged);
    const newLines = lines + linesCleared;
    const newScore = score + SCORES[linesCleared] * level;
    const newLevel = Math.floor(newLines / 10) + 1;
    setBoard(cleared);
    setLines(newLines);
    setScore(newScore);
    setLevel(newLevel);
    const np = next;
    const nn = randomPiece();
    const startX = 3;
    const startY = -2;
    if (!isValid(cleared, np.shape, startX, startY)) {
      setGameOver(true);
      setStarted(false);
    } else {
      setCurrent(np);
      setNext(nn);
      setPos({ x: startX, y: startY });
    }
  }, [board, lines, score, level, next]);

  const moveDown = useCallback(() => {
    const { x, y } = pos;
    if (isValid(board, current.shape, x, y + 1)) {
      setPos(p => ({ ...p, y: p.y + 1 }));
    } else {
      lockPiece(board, current.shape, x, y, current.color);
    }
  }, [pos, board, current, lockPiece]);

  const moveLeft = useCallback(() => {
    if (isValid(board, current.shape, pos.x - 1, pos.y))
      setPos(p => ({ ...p, x: p.x - 1 }));
  }, [pos, board, current]);

  const moveRight = useCallback(() => {
    if (isValid(board, current.shape, pos.x + 1, pos.y))
      setPos(p => ({ ...p, x: p.x + 1 }));
  }, [pos, board, current]);

  const rotatePiece = useCallback(() => {
    const rotated = rotate(current.shape);
    let { x } = pos;
    if (!isValid(board, rotated, x, pos.y)) {
      if (isValid(board, rotated, x + 1, pos.y)) x += 1;
      else if (isValid(board, rotated, x - 1, pos.y)) x -= 1;
      else return;
    }
    setCurrent(c => ({ ...c, shape: rotated }));
    setPos(p => ({ ...p, x }));
  }, [current, pos, board]);

  const hardDrop = useCallback(() => {
    let { y } = pos;
    while (isValid(board, current.shape, pos.x, y + 1)) y++;
    lockPiece(board, current.shape, pos.x, y, current.color);
  }, [pos, board, current, lockPiece]);

  useEffect(() => {
    if (!started || gameOver || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const speed = Math.max(100, 800 - (level - 1) * 70);
    intervalRef.current = setInterval(moveDown, speed);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [started, gameOver, paused, level, moveDown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!started || gameOver || paused) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); moveLeft(); }
      if (e.key === "ArrowRight") { e.preventDefault(); moveRight(); }
      if (e.key === "ArrowDown") { e.preventDefault(); moveDown(); }
      if (e.key === "ArrowUp") { e.preventDefault(); rotatePiece(); }
      if (e.key === " ") { e.preventDefault(); hardDrop(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, started, gameOver, paused, moveLeft, moveRight, moveDown, rotatePiece, hardDrop]);

  const ghostY = (() => {
    let gy = pos.y;
    while (isValid(board, current.shape, pos.x, gy + 1)) gy++;
    return gy;
  })();

  const renderCell = (color: string | null, ghost = false) => (
    <div
      style={{
        width: CELL,
        height: CELL,
        backgroundColor: ghost ? "rgba(255,255,255,0.08)" : color || "rgba(255,255,255,0.03)",
        border: ghost ? "1px solid rgba(255,255,255,0.15)" : color ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.05)",
        borderRadius: 3,
        boxShadow: color && !ghost ? `inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3)` : "none",
      }}
    />
  );

  const renderBoard = () => {
    const display: (string | null | "ghost")[][] = board.map(r => [...r]);
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (!current.shape[r][c]) continue;
        const gy = ghostY + r;
        if (gy >= 0 && gy < ROWS && !display[gy][pos.x + c]) {
          display[gy][pos.x + c] = "ghost";
        }
      }
    }
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (!current.shape[r][c]) continue;
        const nr = pos.y + r;
        const nc = pos.x + c;
        if (nr >= 0 && nr < ROWS) display[nr][nc] = current.color;
      }
    }
    return display.map((row, ri) => (
      <div key={ri} style={{ display: "flex" }}>
        {row.map((cell, ci) => (
          <div key={ci}>{renderCell(cell === "ghost" ? null : cell, cell === "ghost")}</div>
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    const size = 4;
    const grid = Array.from({ length: size }, () => Array(size).fill(null));
    const offR = Math.floor((size - next.shape.length) / 2);
    const offC = Math.floor((size - next.shape[0].length) / 2);
    next.shape.forEach((row, r) => row.forEach((cell, c) => {
      if (cell) grid[offR + r][offC + c] = next.color;
    }));
    return grid.map((row, ri) => (
      <div key={ri} style={{ display: "flex" }}>
        {row.map((cell, ci) => (
          <div key={ci} style={{ width: 18, height: 18, backgroundColor: cell || "transparent", border: cell ? "1px solid rgba(255,255,255,0.2)" : "none", borderRadius: 2, boxShadow: cell ? "inset 0 1px 2px rgba(255,255,255,0.3)" : "none" }} />
        ))}
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent
        className="max-w-sm p-0 overflow-hidden border-slate-700"
        style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 100%)" }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-white text-center text-lg tracking-widest font-mono">TETRIS</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center pb-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs flex items-center gap-1.5"
          >
            <Home className="h-3.5 w-3.5" />
            Return to home
          </Button>
        </div>

        <div className="flex gap-3 px-4 pb-4">
          {/* Board */}
          <div style={{ border: "2px solid rgba(255,255,255,0.15)", borderRadius: 4, overflow: "hidden", background: "rgba(0,0,0,0.4)" }}>
            {renderBoard()}
          </div>

          {/* Side Panel */}
          <div className="flex flex-col gap-3 min-w-[90px]">
            <div className="text-center">
              <p className="text-slate-400 text-xs font-mono mb-1">NEXT</p>
              <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: 6 }}>
                {renderNextPiece()}
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: 8 }}>
              <p className="text-slate-400 text-xs font-mono">SCORE</p>
              <p className="text-white text-sm font-mono font-bold">{score.toLocaleString()}</p>
              <p className="text-slate-400 text-xs font-mono mt-2">LINES</p>
              <p className="text-white text-sm font-mono font-bold">{lines}</p>
              <p className="text-slate-400 text-xs font-mono mt-2">LEVEL</p>
              <p className="text-white text-sm font-mono font-bold">{level}</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-1.5 mt-auto">
              {!started && !gameOver && (
                <Button size="sm" onClick={start} className="w-full text-xs font-mono bg-blue-600 hover:bg-blue-500 text-white">
                  START
                </Button>
              )}
              {gameOver && (
                <>
                  <p className="text-red-400 text-xs font-mono text-center">GAME OVER</p>
                  <Button size="sm" onClick={start} className="w-full text-xs font-mono bg-blue-600 hover:bg-blue-500 text-white">
                    RETRY
                  </Button>
                </>
              )}
              {started && !gameOver && (
                <Button size="sm" onClick={() => setPaused(p => !p)} className="w-full text-xs font-mono bg-slate-700 hover:bg-slate-600 text-white">
                  {paused ? "RESUME" : "PAUSE"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="px-4 pb-4 grid grid-cols-3 gap-2">
          <Button variant="ghost" size="sm" onClick={rotatePiece} disabled={!started || gameOver || paused} className="text-white border border-slate-700 col-start-2">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={moveLeft} disabled={!started || gameOver || paused} className="text-white border border-slate-700 col-start-1 row-start-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={hardDrop} disabled={!started || gameOver || paused} className="text-white border border-slate-700 col-start-2 row-start-2">
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={moveRight} disabled={!started || gameOver || paused} className="text-white border border-slate-700 col-start-3 row-start-2">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-slate-600 text-xs font-mono text-center pb-3">
          ← → move &nbsp;↑ rotate &nbsp;↓ drop &nbsp;space hard drop
        </p>
      </DialogContent>
    </Dialog>
  );
}
