import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Home, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const CELL = 18;
const COLS = 19;
const ROWS = 21;
const TUNNEL_ROW = 9;
const PAC_MS = 280;
const GHOST_MS = 350;
const POWER_MS = 8000;

type Dir = "U" | "D" | "L" | "R" | null;

const W = 0, D = 1, P = 2, E = 3;

function initMaze(): number[][] {
  return [
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
    [W,D,D,D,D,D,D,D,D,W,D,D,D,D,D,D,D,D,W],
    [W,D,W,W,D,W,W,W,D,W,D,W,W,W,D,W,W,D,W],
    [W,P,W,W,D,W,W,W,D,W,D,W,W,W,D,W,W,P,W],
    [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
    [W,D,W,W,D,W,D,W,W,W,W,W,W,W,D,W,D,D,W],
    [W,D,D,D,D,W,D,D,D,W,D,D,D,W,D,D,D,D,W],
    [W,W,W,W,D,W,W,W,D,W,D,W,W,W,D,W,W,W,W],
    [W,W,W,W,D,W,E,E,E,E,E,E,E,W,D,W,W,W,W],
    [E,E,E,E,D,E,E,E,E,E,E,E,E,E,D,E,E,E,E],
    [W,W,W,W,D,W,E,E,E,E,E,E,E,W,D,W,W,W,W],
    [W,W,W,W,D,W,W,W,E,E,W,E,E,W,D,W,W,W,W],
    [W,W,W,W,D,W,D,D,D,D,W,D,D,D,D,W,D,W,W],
    [W,D,D,D,D,D,D,D,D,W,D,W,D,D,D,D,D,D,W],
    [W,D,W,W,D,W,W,W,D,W,D,W,D,W,W,W,D,D,W],
    [W,D,D,W,D,D,D,D,D,D,E,D,D,D,D,D,D,D,W],
    [W,W,D,W,D,W,D,W,W,W,W,W,W,W,D,W,D,W,W],
    [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
    [W,D,W,W,W,W,W,W,D,W,D,W,W,W,W,W,W,D,W],
    [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  ];
}

interface GhostState {
  r: number; c: number; dir: Dir;
  color: string; scared: boolean; dead: boolean;
}

interface GameState {
  maze: number[][];
  pacR: number; pacC: number; pacDir: Dir; pacNext: Dir;
  ghosts: GhostState[];
  score: number; lives: number;
  powerTimer: number;
  totalDots: number; dotsEaten: number;
  phase: "idle" | "playing" | "pausing" | "gameover" | "won";
  mouthOpen: boolean; mouthTick: number;
  pacTimer: number; ghostTimer: number;
  lastTs: number;
}

const GHOST_COLORS = ["#ff0000", "#ffb8ff", "#00ffff"];
const OPP: Record<string, Dir> = { U: "D", D: "U", L: "R", R: "L" };

function countDots(maze: number[][]) {
  let n = 0;
  for (const row of maze) for (const cell of row) if (cell === D || cell === P) n++;
  return n;
}

function nextCell(r: number, c: number, dir: Dir): [number, number] {
  if (dir === "U") return [r - 1, c];
  if (dir === "D") return [r + 1, c];
  if (dir === "L") {
    const nc = r === TUNNEL_ROW && c === 0 ? COLS - 1 : c - 1;
    return [r, nc];
  }
  if (dir === "R") {
    const nc = r === TUNNEL_ROW && c === COLS - 1 ? 0 : c + 1;
    return [r, nc];
  }
  return [r, c];
}

function canStep(maze: number[][], r: number, c: number, dir: Dir): boolean {
  const [nr, nc] = nextCell(r, c, dir);
  if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
  return maze[nr][nc] !== W;
}

function makeInitState(): GameState {
  const maze = initMaze();
  return {
    maze,
    pacR: 15, pacC: 10, pacDir: null, pacNext: null,
    ghosts: [
      { r: 9, c: 9, dir: "L", color: GHOST_COLORS[0], scared: false, dead: false },
      { r: 8, c: 9, dir: "U", color: GHOST_COLORS[1], scared: false, dead: false },
      { r: 10, c: 9, dir: "D", color: GHOST_COLORS[2], scared: false, dead: false },
    ],
    score: 0, lives: 3,
    powerTimer: 0,
    totalDots: countDots(maze), dotsEaten: 0,
    phase: "idle",
    mouthOpen: true, mouthTick: 0,
    pacTimer: 0, ghostTimer: 0, lastTs: 0,
  };
}

export function PacmanGame({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gs = useRef<GameState>(makeInitState());
  const rafRef = useRef<number>();

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [phase, setPhase] = useState<GameState["phase"]>("idle");

  const syncDisplay = useCallback(() => {
    setScore(gs.current.score);
    setLives(gs.current.lives);
    setPhase(gs.current.phase);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = gs.current;

    ctx.fillStyle = "#000014";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * CELL, y = r * CELL, cell = s.maze[r][c];
        if (cell === W) {
          ctx.fillStyle = "#001a8c";
          ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = "#0044ff";
          ctx.lineWidth = 0.8;
          ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
        } else if (cell === D) {
          ctx.fillStyle = "#ffcca0";
          ctx.beginPath();
          ctx.arc(x + CELL / 2, y + CELL / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === P) {
          const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 250);
          ctx.fillStyle = `rgba(255,255,255,${pulse})`;
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x + CELL / 2, y + CELL / 2, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    const px = s.pacC * CELL + CELL / 2;
    const py = s.pacR * CELL + CELL / 2;
    const m = s.mouthOpen ? 0.22 : 0.04;
    let sa = m * Math.PI, ea = (2 - m) * Math.PI;
    if (s.pacDir === "L") { sa = (1 + m) * Math.PI; ea = (1 - m) * Math.PI; }
    else if (s.pacDir === "U") { sa = (1.5 + m) * Math.PI; ea = (1.5 - m) * Math.PI; }
    else if (s.pacDir === "D") { sa = (0.5 + m) * Math.PI; ea = (0.5 - m) * Math.PI; }

    ctx.fillStyle = "#ffee00";
    ctx.shadowColor = "#ffee00";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, CELL / 2 - 1, sa, ea);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    const now = Date.now();
    for (const g of s.ghosts) {
      if (g.dead) continue;
      const gx = g.c * CELL + CELL / 2;
      const gy = g.r * CELL + CELL / 2;
      const flashing = s.powerTimer > 0 && s.powerTimer < 2500 && Math.floor(now / 280) % 2 === 0;
      const gCol = g.scared ? (flashing ? "#ffffff" : "#2244ff") : g.color;

      ctx.fillStyle = gCol;
      ctx.shadowColor = gCol;
      ctx.shadowBlur = 4;
      const rad = CELL / 2 - 2;

      ctx.beginPath();
      ctx.arc(gx, gy - 1, rad, Math.PI, 0);
      const bottom = gy + rad - 1;
      ctx.lineTo(gx + rad, bottom);
      const segs = 3, segW = (rad * 2) / segs;
      for (let i = segs; i >= 0; i--) {
        const bx = gx - rad + i * segW;
        const by = bottom - (i % 2 === 0 ? 3 : 0);
        ctx.lineTo(bx, by);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(gx - 3, gy - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(gx + 3, gy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      if (!g.scared) {
        ctx.fillStyle = "#0000cc";
        ctx.beginPath();
        ctx.arc(gx - 3, gy - 2, 1.2, 0, Math.PI * 2);
        ctx.arc(gx + 3, gy - 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (s.phase === "idle") {
      ctx.fillStyle = "rgba(0,0,20,0.55)";
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffee00";
      ctx.font = "bold 18px monospace";
      ctx.fillText("DOT MUNCHER", COLS * CELL / 2, ROWS * CELL / 2 - 14);
      ctx.fillStyle = "#aaaaff";
      ctx.font = "11px monospace";
      ctx.fillText("Press START to play", COLS * CELL / 2, ROWS * CELL / 2 + 6);
    } else if (s.phase === "pausing") {
      ctx.fillStyle = "rgba(80,0,0,0.5)";
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.textAlign = "center";
      ctx.fillStyle = "#ff4444";
      ctx.font = "bold 15px monospace";
      ctx.fillText("CAUGHT!", COLS * CELL / 2, ROWS * CELL / 2);
    } else if (s.phase === "gameover") {
      ctx.fillStyle = "rgba(60,0,0,0.7)";
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.textAlign = "center";
      ctx.fillStyle = "#ff2222";
      ctx.font = "bold 20px monospace";
      ctx.fillText("GAME OVER", COLS * CELL / 2, ROWS * CELL / 2 - 10);
      ctx.fillStyle = "#ffaa00";
      ctx.font = "12px monospace";
      ctx.fillText(`Score: ${s.score}`, COLS * CELL / 2, ROWS * CELL / 2 + 12);
    } else if (s.phase === "won") {
      ctx.fillStyle = "rgba(0,30,0,0.7)";
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.textAlign = "center";
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 20px monospace";
      ctx.fillText("YOU WIN!", COLS * CELL / 2, ROWS * CELL / 2 - 10);
      ctx.fillStyle = "#ffaa00";
      ctx.font = "12px monospace";
      ctx.fillText(`Score: ${s.score}`, COLS * CELL / 2, ROWS * CELL / 2 + 12);
    }
  }, []);

  const tick = useCallback((ts: number) => {
    const s = gs.current;
    if (s.phase !== "playing") {
      draw();
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const dt = s.lastTs ? Math.min(ts - s.lastTs, 100) : 0;
    s.lastTs = ts;
    s.pacTimer += dt;
    s.ghostTimer += dt;

    let needSync = false;

    if (s.pacTimer >= PAC_MS) {
      s.pacTimer -= PAC_MS;
      s.mouthTick++;
      if (s.mouthTick % 4 === 0) s.mouthOpen = !s.mouthOpen;

      for (const dir of [s.pacNext, s.pacDir] as Dir[]) {
        if (!dir) continue;
        if (canStep(s.maze, s.pacR, s.pacC, dir)) {
          const [nr, nc] = nextCell(s.pacR, s.pacC, dir);
          s.pacR = nr; s.pacC = nc; s.pacDir = dir;
          break;
        }
      }

      const cell = s.maze[s.pacR][s.pacC];
      if (cell === D) {
        s.maze[s.pacR][s.pacC] = E;
        s.score += 10; s.dotsEaten++;
        needSync = true;
      } else if (cell === P) {
        s.maze[s.pacR][s.pacC] = E;
        s.score += 50; s.dotsEaten++;
        s.powerTimer = POWER_MS;
        s.ghosts.forEach(g => { if (!g.dead) { g.scared = true; g.dir = g.dir ? OPP[g.dir] : null; } });
        needSync = true;
      }

      if (s.powerTimer > 0) {
        s.powerTimer -= PAC_MS;
        if (s.powerTimer <= 0) {
          s.powerTimer = 0;
          s.ghosts.forEach(g => { g.scared = false; });
        }
      }

      if (s.dotsEaten >= s.totalDots) {
        s.phase = "won"; needSync = true;
      }
    }

    if (s.ghostTimer >= GHOST_MS && s.phase === "playing") {
      s.ghostTimer -= GHOST_MS;
      const dirs: Dir[] = ["U", "D", "L", "R"];

      for (const g of s.ghosts) {
        if (g.dead) continue;
        const tryDirs: Dir[] = [];

        if (!g.scared && Math.random() < 0.65) {
          const dr = s.pacR - g.r, dc = s.pacC - g.c;
          if (Math.abs(dr) > Math.abs(dc)) { tryDirs.push(dr > 0 ? "D" : "U"); tryDirs.push(dc > 0 ? "R" : "L"); }
          else { tryDirs.push(dc > 0 ? "R" : "L"); tryDirs.push(dr > 0 ? "D" : "U"); }
        } else {
          tryDirs.push(...[...dirs].sort(() => Math.random() - 0.5));
        }
        const rest = [...dirs].sort(() => Math.random() - 0.5);
        const all = [...tryDirs, ...rest];
        const noReverse = all.filter(d => d !== (g.dir ? OPP[g.dir] : null));
        const candidates = noReverse.length > 0 ? noReverse : all;

        for (const dir of candidates) {
          if (canStep(s.maze, g.r, g.c, dir)) {
            const [nr, nc] = nextCell(g.r, g.c, dir);
            g.r = nr; g.c = nc; g.dir = dir;
            break;
          }
        }
      }
    }

    for (const g of s.ghosts) {
      if (g.dead) continue;
      if (g.r === s.pacR && g.c === s.pacC) {
        if (g.scared) {
          g.dead = true; g.scared = false;
          s.score += 200; needSync = true;
          const gRef = g;
          setTimeout(() => {
            gRef.dead = false;
            gRef.r = 9; gRef.c = 9; gRef.dir = null;
          }, 3000);
        } else if (s.phase === "playing") {
          s.lives--;
          if (s.lives <= 0) {
            s.phase = "gameover"; needSync = true;
          } else {
            s.phase = "pausing"; needSync = true;
            setTimeout(() => {
              s.pacR = 15; s.pacC = 10; s.pacDir = null; s.pacNext = null;
              s.ghosts.forEach((gh, i) => {
                gh.r = [9, 8, 10][i]; gh.c = 9; gh.dir = null; gh.scared = false; gh.dead = false;
              });
              s.powerTimer = 0;
              s.phase = "playing";
              setPhase("playing");
            }, 1600);
          }
        }
      }
    }

    if (needSync) syncDisplay();
    draw();
    rafRef.current = requestAnimationFrame(tick);
  }, [draw, syncDisplay]);

  useEffect(() => {
    if (!open) return;
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [open, tick]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = { ArrowUp: "U", ArrowDown: "D", ArrowLeft: "L", ArrowRight: "R" };
      if (map[e.key]) { gs.current.pacNext = map[e.key]; e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const setDir = (d: Dir) => { gs.current.pacNext = d; };

  const startGame = () => {
    gs.current = makeInitState();
    gs.current.phase = "playing";
    gs.current.lastTs = 0;
    syncDisplay();
  };

  const btnStyle = {
    color: "#ffee00",
    border: "1px solid rgba(255,238,0,0.4)",
    boxShadow: "0 0 5px rgba(255,238,0,0.15)",
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent
        className="max-w-fit p-0 overflow-y-auto [&>button]:text-yellow-300 [&>button]:opacity-70 [&>button:hover]:opacity-100"
        style={{
          background: "linear-gradient(160deg, #000014 0%, #00001e 100%)",
          border: "2px solid #ffee00",
          boxShadow: "0 0 28px rgba(255,238,0,0.35), 0 0 60px rgba(200,140,0,0.15)",
          maxHeight: "calc(100dvh - 2rem)",
        }}
        onPointerDownOutside={e => e.preventDefault()}
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogHeader className="px-4 pt-4 pb-1">
          <DialogTitle
            className="text-center text-xl tracking-[0.3em] font-mono font-bold"
            style={{ color: "#ffee00", textShadow: "0 0 10px #ffee00, 0 0 22px #ffaa00, 0 0 40px #ff6600" }}
          >
            DOT MUNCHER
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center px-4 pb-1">
          <Button size="sm" variant="ghost" onClick={onClose}
            className="text-yellow-400 hover:text-white text-xs flex items-center gap-1.5 hover:bg-yellow-900/20">
            <Home className="h-3.5 w-3.5" />
            Return to home
          </Button>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span style={{ color: "#ffcc44" }}>
              SCORE <span className="text-white font-bold ml-1">{score}</span>
            </span>
            <span style={{ color: "#ffcc44" }}>
              {"●".repeat(lives)}
            </span>
          </div>
        </div>

        <div className="px-4 pb-1 flex justify-center">
          <canvas
            ref={canvasRef}
            width={COLS * CELL}
            height={ROWS * CELL}
            style={{ display: "block", imageRendering: "pixelated" }}
          />
        </div>

        <div className="px-4 pb-2 grid grid-cols-3 gap-1.5 w-[144px] mx-auto">
          <Button variant="ghost" size="sm" onClick={() => setDir("U")}
            className="col-start-2 disabled:opacity-20" style={btnStyle}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDir("L")}
            className="col-start-1 row-start-2 disabled:opacity-20" style={btnStyle}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDir("D")}
            className="col-start-2 row-start-2 disabled:opacity-20" style={btnStyle}>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDir("R")}
            className="col-start-3 row-start-2 disabled:opacity-20" style={btnStyle}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {(phase === "idle" || phase === "gameover" || phase === "won") && (
          <div className="pb-4 text-center">
            <Button
              onClick={startGame}
              className="font-mono font-bold text-black px-8"
              style={{
                background: "linear-gradient(135deg, #ffee00, #ffaa00)",
                boxShadow: "0 0 12px rgba(255,238,0,0.5)",
              }}
            >
              {phase === "idle" ? "START" : "PLAY AGAIN"}
            </Button>
          </div>
        )}

        <p className="text-xs font-mono text-center pb-3 opacity-40" style={{ color: "#ffcc44" }}>
          Arrow keys or D-pad to move
        </p>
      </DialogContent>
    </Dialog>
  );
}
