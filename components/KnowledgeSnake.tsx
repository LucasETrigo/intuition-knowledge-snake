'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    useAccount,
    useChainId,
    usePublicClient,
    useWalletClient,
} from 'wagmi';
import { MULTIVAULT } from '@/lib/intuition-addresses';
import { validateMultiVaultAddress } from '@/helpers/validateMv';
import { ArrowUpRight, Play, Square, RotateCcw } from 'lucide-react';
import { createAtomFromString, createTripleStatement } from '@0xintuition/sdk';

// Game configuration
const GRID = 22;
const INITIAL_SPEED = 140;
const SPEED_MIN = 70;
const FOODS_PER_LEVEL = 4;
const MAX_SCORE = 40;
const MAX_OBSTACLES = 20;

const WORDS: Record<string, string[]> = {
    Crypto: [
        'Ethereum',
        'Solidity',
        'DeFi',
        'Rollup',
        'MEV',
        'Bridge',
        'L2',
        'ZK',
        'OP',
        'Base',
        'Airdrop',
        'RPC',
        'Gas',
        'Wallet',
        'EVM',
        'ERC20',
        'ERC721',
        'Liquidity',
        'Stake',
        'Yield',
    ],
    AI: [
        'Transformer',
        'Token',
        'Prompt',
        'Embedding',
        'Diffusion',
        'LoRA',
        'RAG',
        'Agent',
        'Inference',
        'Latent',
        'RLHF',
        'Dataset',
        'GPU',
        'CUDA',
        'Batch',
        'LLM',
        'Context',
        'Vector',
        'Cache',
        'MoE',
    ],
    Memes: [
        'WAGMI',
        'HODL',
        'NGMI',
        'Rekt',
        'FOMO',
        'FUD',
        'Devs',
        'Ape',
        'Moon',
        'Degen',
        'Pump',
        'Dump',
        'Giga',
        'GM',
        'Ser',
        'CT',
        'Copium',
        'Based',
        'Pepe',
        'Doge',
    ],
};

/* -------------------------- types ------------------------------ */
type Vec = { x: number; y: number };
interface Cell extends Vec {}
interface TxInfo {
    label: string;
    hash: `0x${string}`;
}

/* -------------------- helpers: atoms/triples ------------------- */
const ZERO_HASH =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

/**
 * Ensure-or-fetch an atom for a given URI (idempotent) without relying on reader types.
 * If create reverts with EthMultiVault_AtomExists(..., atomId), reuse that atomId as vaultId.
 */
async function ensureAtomFromString(
    walletClient: any,
    publicClient: any,
    mvAddress: `0x${string}`,
    uri: string
) {
    try {
        const created = await createAtomFromString(
            { walletClient, publicClient, address: mvAddress },
            uri
        );
        // created has .transactionHash and .state.vaultId
        return created;
    } catch (err: any) {
        const msg: string = String(err?.message || err?.shortMessage || '');
        const m = msg.match(/AtomExists[^0-9]*(\d+)/i);
        if (!m) throw err;
        const atomId = BigInt(m[1]); // on MultiVault, vaultId === atomId
        return {
            uri,
            transactionHash: ZERO_HASH,
            state: {
                vaultId: atomId,
            },
        };
    }
}

export default function KnowledgeSnake() {
    const { address } = useAccount();
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const [theme, setTheme] = useState<keyof typeof WORDS>('Crypto');
    const [useWrap, setUseWrap] = useState(true);

    // MultiVault: auto-fill by chain, but keep editable
    const [mvAddress, setMvAddress] = useState<string>(
        process.env.NEXT_PUBLIC_MULTIVAULT_ADDRESS || ''
    );
    useEffect(() => {
        const auto = MULTIVAULT[chainId];
        if (auto) setMvAddress(auto);
    }, [chainId]);
    const mvOk = useMemo(
        () => /^0x[a-fA-F0-9]{40}$/.test(mvAddress),
        [mvAddress]
    );

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const [dir, setDir] = useState<Vec>({ x: 1, y: 0 });
    const [snake, setSnake] = useState<Cell[]>([
        { x: 4, y: 11 },
        { x: 3, y: 11 },
    ]);
    const [food, setFood] = useState<Cell>({ x: 10, y: 10 });
    const [obstacles, setObstacles] = useState<Cell[]>([]);
    const [word, setWord] = useState<string>('Ethereum');

    const [score, setScore] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);
    const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
    const [running, setRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const [lastRunWords, setLastRunWords] = useState<string[]>([]);
    const [txs, setTxs] = useState<TxInfo[]>([]);
    const [publishing, setPublishing] = useState(false);
    const [gameFocused, setGameFocused] = useState(false);

    // Fixed keyboard controls with proper event prevention
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Only handle arrow keys when game is focused and running
            if (!running || !gameFocused) return;

            const arrowKeys = [
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight',
            ];
            if (arrowKeys.includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();

                if (e.key === 'ArrowUp' && dir.y !== 1) setDir({ x: 0, y: -1 });
                if (e.key === 'ArrowDown' && dir.y !== -1)
                    setDir({ x: 0, y: 1 });
                if (e.key === 'ArrowLeft' && dir.x !== 1)
                    setDir({ x: -1, y: 0 });
                if (e.key === 'ArrowRight' && dir.x !== -1)
                    setDir({ x: 1, y: 0 });
            }
        };

        // Add event listener with capture to intercept before default handling
        document.addEventListener('keydown', onKey, { capture: true });
        return () =>
            document.removeEventListener('keydown', onKey, { capture: true });
    }, [running, dir, gameFocused]);

    // Focus management
    useEffect(() => {
        const container = gameContainerRef.current;
        if (!container) return;

        const handleFocus = () => setGameFocused(true);
        const handleBlur = () => setGameFocused(false);

        container.addEventListener('focus', handleFocus);
        container.addEventListener('blur', handleBlur);
        container.addEventListener('mouseenter', handleFocus);
        container.addEventListener('mouseleave', handleBlur);

        return () => {
            container.removeEventListener('focus', handleFocus);
            container.removeEventListener('blur', handleBlur);
            container.removeEventListener('mouseenter', handleFocus);
            container.removeEventListener('mouseleave', handleBlur);
        };
    }, []);

    // Auto-focus when game starts
    useEffect(() => {
        if (running && gameContainerRef.current) {
            gameContainerRef.current.focus();
            setGameFocused(true);
        }
    }, [running]);

    // Main game loop
    useEffect(() => {
        if (!running || gameOver || win) return;
        const id = setInterval(() => tick(), speed);
        return () => clearInterval(id);
    }, [running, snake, dir, food, gameOver, win, speed]);

    function start() {
        setSnake([
            { x: 4, y: 11 },
            { x: 3, y: 11 },
        ]);
        setDir({ x: 1, y: 0 });
        setFood(
            randFreeCell(
                [
                    { x: 4, y: 11 },
                    { x: 3, y: 11 },
                ],
                []
            )
        );
        setObstacles([]);
        setWord(randWord(WORDS[theme]));
        setScore(0);
        setLevel(1);
        setSpeed(INITIAL_SPEED);
        setRunning(true);
        setGameOver(false);
        setWin(false);
        setLastRunWords([]);
        setTxs([]);
    }

    function tick() {
        setSnake((currentSnake) => {
            const head = {
                x: currentSnake[0].x + dir.x,
                y: currentSnake[0].y + dir.y,
            };

            if (useWrap) {
                head.x = (head.x + GRID) % GRID;
                head.y = (head.y + GRID) % GRID;
            } else {
                if (
                    head.x < 0 ||
                    head.x >= GRID ||
                    head.y < 0 ||
                    head.y >= GRID
                ) {
                    setRunning(false);
                    setGameOver(true);
                    return currentSnake;
                }
            }

            // Self collision
            for (const seg of currentSnake) {
                if (seg.x === head.x && seg.y === head.y) {
                    setRunning(false);
                    setGameOver(true);
                    return currentSnake;
                }
            }

            // Obstacle collision
            for (const ob of obstacles) {
                if (ob.x === head.x && ob.y === head.y) {
                    setRunning(false);
                    setGameOver(true);
                    return currentSnake;
                }
            }

            const newSnake = [head, ...currentSnake];

            if (head.x === food.x && head.y === food.y) {
                setScore((s) => {
                    const newScore = s + 1;
                    setLastRunWords((ls) => [word, ...ls]);

                    if (newScore % FOODS_PER_LEVEL === 0) {
                        setLevel((lv) => lv + 1);
                        setSpeed((sp) => Math.max(SPEED_MIN, sp - 10));
                        setObstacles((obs) => {
                            const add = Math.random() < 0.5 ? 1 : 2;
                            const next: Cell[] = [];
                            for (let i = 0; i < add; i++)
                                next.push(randFreeCell(newSnake, obs));
                            return [...obs, ...next].slice(0, MAX_OBSTACLES);
                        });
                    }

                    if (newScore >= MAX_SCORE) {
                        setRunning(false);
                        setWin(true);
                    } else {
                        setFood(randFreeCell(newSnake, obstacles));
                        setWord(randWord(WORDS[theme]));
                    }

                    return newScore;
                });
                return newSnake;
            } else {
                newSnake.pop();
                return newSnake;
            }
        });
    }

    // Canvas setup and drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rendered = 480;
        canvas.style.width = `${rendered}px`;
        canvas.style.height = `${rendered}px`;
        canvas.width = rendered * dpr;
        canvas.height = rendered * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        draw(snake, food, obstacles);
    }, []);

    useEffect(() => {
        draw(snake, food, obstacles);
    }, [snake, food, obstacles]);

    function draw(snk: Cell[], fd: Cell, obs: Cell[]) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = canvas.width / (window.devicePixelRatio || 1) / GRID;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= GRID; i++) {
            ctx.beginPath();
            ctx.moveTo(i * size, 0);
            ctx.lineTo(i * size, GRID * size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * size);
            ctx.lineTo(GRID * size, i * size);
            ctx.stroke();
        }

        // Obstacles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (const o of obs) {
            ctx.fillRect(o.x * size + 2, o.y * size + 2, size - 4, size - 4);
        }

        // Snake
        ctx.fillStyle = 'white';
        if (snk.length > 0) {
            // Head
            ctx.fillRect(snk[0].x * size, snk[0].y * size, size, size);
            // Body
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            for (let i = 1; i < snk.length; i++) {
                ctx.fillRect(
                    snk[i].x * size + 1,
                    snk[i].y * size + 1,
                    size - 2,
                    size - 2
                );
            }
        }

        // Food
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(fd.x * size + 1, fd.y * size + 1, size - 2, size - 2);
    }

    /* ----------------------- on-chain publish -------------------- */
    async function publishScore() {
        if (!walletClient || !publicClient)
            return alert('Connect wallet first.');
        if (!mvOk) return alert('Set a valid MultiVault address.');
        if (!(gameOver || win)) return alert('Finish a run first.');

        setPublishing(true);
        setTxs([]);
        try {
            await validateMultiVaultAddress(
                publicClient,
                mvAddress as `0x${string}`
            );

            const playerUri = `player:${address ?? 'anonymous'}`;
            const predicateUri = 'has score';
            const summaryUri = `score:${score}|theme:${theme}|words:${
                lastRunWords.length
            }|ts:${new Date().toISOString()}|chain:${chainId}`;

            const aPlayer = await ensureAtomFromString(
                walletClient,
                publicClient,
                mvAddress as `0x${string}`,
                playerUri
            );
            setTxs((prev) => [
                ...prev,
                {
                    label: 'Player atom',
                    hash: (aPlayer.transactionHash ??
                        ZERO_HASH) as `0x${string}`,
                },
            ]);

            const aPred = await ensureAtomFromString(
                walletClient,
                publicClient,
                mvAddress as `0x${string}`,
                predicateUri
            );
            setTxs((prev) => [
                ...prev,
                {
                    label: 'Predicate atom',
                    hash: (aPred.transactionHash ?? ZERO_HASH) as `0x${string}`,
                },
            ]);

            // score is unique each run because of timestamp → should not collide
            const aScore = await createAtomFromString(
                {
                    walletClient,
                    publicClient,
                    address: mvAddress as `0x${string}`,
                },
                summaryUri
            );
            setTxs((prev) => [
                ...prev,
                {
                    label: 'Score atom',
                    hash: (aScore.transactionHash ??
                        ZERO_HASH) as `0x${string}`,
                },
            ]);

            const triple = await createTripleStatement(
                {
                    walletClient,
                    publicClient,
                    address: mvAddress as `0x${string}`,
                },
                {
                    args: [
                        aPlayer.state.vaultId,
                        aPred.state.vaultId,
                        aScore.state.vaultId,
                    ],
                }
            );
            setTxs((prev) => [
                ...prev,
                {
                    label: 'Triple: player — has score — score',
                    hash: (triple.transactionHash ??
                        ZERO_HASH) as `0x${string}`,
                },
            ]);

            // fast leaderboard row
            await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    address,
                    score,
                    theme,
                    words: lastRunWords.length,
                    chainId,
                    txHash: (triple.transactionHash ??
                        ZERO_HASH) as `0x${string}`,
                }),
            }).catch(() => {});

            alert('Score published 🎉');
        } catch (err: any) {
            console.error(err);
            alert(err?.message ?? 'Failed to publish');
        } finally {
            setPublishing(false);
        }
    }

    const explorer =
        chainId === 8453
            ? 'https://basescan.org'
            : 'https://sepolia.basescan.org';

    return (
        <div className='p-8 space-y-12 md:p-12'>
            {/* Game Configuration */}
            <div className='space-y-8'>
                <div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
                    <div className='space-y-2'>
                        <h3 className='text-lg font-light'>Game Parameters</h3>
                        <p className='text-sm font-light text-white/40'>
                            Configure your knowledge domain and gameplay
                            mechanics
                        </p>
                    </div>

                    <div className='flex items-center gap-6 text-sm font-light text-white/60'>
                        <div className='flex items-center gap-2'>
                            <span className='text-white/40'>Score</span>
                            <span className='font-mono text-white'>
                                {score}
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-white/40'>Level</span>
                            <span className='font-mono text-white'>
                                {level}
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-white/40'>Speed</span>
                            <span className='font-mono text-white'>
                                {speed}ms
                            </span>
                        </div>
                    </div>
                </div>

                <div className='grid gap-8 md:grid-cols-2'>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <label className='text-xs font-light tracking-wider uppercase text-white/40'>
                                Knowledge Domain
                            </label>
                            <select
                                value={theme}
                                onChange={(e) =>
                                    setTheme(
                                        e.target.value as keyof typeof WORDS
                                    )
                                }
                                className='w-full px-4 py-2 text-sm font-light text-white transition-colors bg-transparent border border-white/10 focus:border-white/20 focus:outline-none'
                            >
                                {Object.keys(WORDS).map((k) => (
                                    <option
                                        key={k}
                                        value={k}
                                        className='text-white bg-black'
                                    >
                                        {k}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='flex items-center gap-3'>
                            <input
                                type='checkbox'
                                id='wrap'
                                checked={useWrap}
                                onChange={(e) => setUseWrap(e.target.checked)}
                                className='w-4 h-4'
                            />
                            <label
                                htmlFor='wrap'
                                className='text-sm font-light text-white/80'
                            >
                                Enable wall wrapping
                            </label>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-xs font-light tracking-wider uppercase text-white/40'>
                            MultiVault Address
                        </label>
                        <input
                            className='w-full px-4 py-2 font-mono text-sm font-light text-white transition-colors bg-transparent border border-white/10 focus:border-white/20 focus:outline-none'
                            placeholder='0x...'
                            value={mvAddress}
                            onChange={(e) => setMvAddress(e.target.value)}
                        />
                        {!mvOk && mvAddress && (
                            <p className='text-xs font-light text-red-400'>
                                Invalid address format
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className='grid lg:grid-cols-[480px_1fr] gap-12'>
                {/* Canvas */}
                <div className='space-y-4'>
                    <div
                        ref={gameContainerRef}
                        className={`relative border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden cursor-crosshair focus:outline-none ${
                            gameFocused ? 'ring-1 ring-white/20' : ''
                        }`}
                        tabIndex={0}
                        onMouseEnter={() => setGameFocused(true)}
                        onMouseLeave={() => setGameFocused(false)}
                        onFocus={() => setGameFocused(true)}
                        onBlur={() => setGameFocused(false)}
                    >
                        <canvas ref={canvasRef} className='block' />

                        {/* Game State Overlay */}
                        {!running && (
                            <div className='absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
                                <div className='space-y-4 text-center'>
                                    {gameOver && (
                                        <div className='space-y-2'>
                                            <div className='text-2xl font-light text-white'>
                                                Game Over
                                            </div>
                                            <div className='text-sm text-white/60'>
                                                Final Score: {score}
                                            </div>
                                        </div>
                                    )}
                                    {win && (
                                        <div className='space-y-2'>
                                            <div className='text-2xl font-light text-white'>
                                                Victory
                                            </div>
                                            <div className='text-sm text-white/60'>
                                                Perfect Score: {score}
                                            </div>
                                        </div>
                                    )}
                                    {!gameOver && !win && (
                                        <div className='space-y-2'>
                                            <div className='text-xl font-light text-white'>
                                                Ready to Play
                                            </div>
                                            <div className='text-sm text-white/60'>
                                                Press start to begin
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Focus indicator */}
                        {gameFocused && running && (
                            <div className='absolute w-2 h-2 rounded-full top-2 right-2 bg-white/40 animate-pulse' />
                        )}
                    </div>

                    <button
                        onClick={start}
                        className='group w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-black font-light transition-all duration-300 hover:scale-[1.01]'
                    >
                        {running ? (
                            <>
                                <RotateCcw className='w-4 h-4' />
                                Restart Game
                            </>
                        ) : (
                            <>
                                <Play className='w-4 h-4' />
                                Start Game
                            </>
                        )}
                    </button>
                </div>

                {/* Side Panel */}
                <div className='space-y-8'>
                    {/* Current Objective */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <h4 className='text-sm font-light text-white/60'>
                                Current Target
                            </h4>
                            <div className='text-3xl font-light text-white'>
                                {word}
                            </div>
                        </div>
                        <div className='space-y-2 text-xs font-light leading-relaxed text-white/40'>
                            <p>
                                Use arrow keys to navigate. Consume knowledge
                                targets to grow.
                            </p>
                            <p>
                                {useWrap
                                    ? 'Walls wrap around edges.'
                                    : 'Avoid walls and obstacles.'}
                            </p>
                            <p>Reach {MAX_SCORE} points to achieve victory.</p>
                            {gameFocused && running && (
                                <p className='text-white/60'>
                                    Game is focused and ready for input.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Blockchain Publishing */}
                    <div className='pt-8 space-y-6 border-t border-white/5'>
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <h4 className='text-sm font-light text-white/80'>
                                    Blockchain Verification
                                </h4>
                                <div className='text-xs font-light text-white/40'>
                                    {gameOver && 'Game Over'}
                                    {win && 'Victory'}
                                    {running && 'Active'}
                                    {!running && !gameOver && !win && 'Waiting'}
                                </div>
                            </div>
                            <p className='text-xs font-light leading-relaxed text-white/40'>
                                Publish your achievement as semantic triples
                                on-chain for permanent verification
                            </p>
                        </div>

                        <button
                            onClick={publishScore}
                            disabled={!(gameOver || win) || publishing}
                            className='flex items-center justify-center w-full gap-3 px-6 py-3 font-light text-white transition-all duration-300 border group border-white/20 hover:border-white/40 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed'
                        >
                            {publishing ? (
                                <>
                                    <div className='w-4 h-4 border rounded-full border-white/40 border-t-white animate-spin' />
                                    Publishing to chain...
                                </>
                            ) : (
                                <>
                                    <Square className='w-4 h-4' />
                                    Record Achievement
                                </>
                            )}
                        </button>

                        {/* Transaction History */}
                        {txs.length > 0 && (
                            <div className='space-y-3'>
                                <h5 className='text-xs font-light tracking-wider uppercase text-white/60'>
                                    Transaction History
                                </h5>
                                <div className='space-y-2'>
                                    {txs.map((tx, i) => (
                                        <div
                                            key={i}
                                            className='flex items-center justify-between p-3 border border-white/5 bg-white/[0.01]'
                                        >
                                            <span className='text-xs font-light text-white/80'>
                                                {tx.label}
                                            </span>
                                            <a
                                                href={`${explorer}/tx/${tx.hash}`}
                                                target='_blank'
                                                rel='noreferrer'
                                                className='flex items-center gap-1 text-xs font-light transition-colors text-white/40 hover:text-white/60'
                                            >
                                                <span className='font-mono'>
                                                    {tx.hash.slice(0, 8)}...
                                                </span>
                                                <ArrowUpRight className='w-3 h-3' />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper functions
function randWord(list: string[]) {
    return list[Math.floor(Math.random() * list.length)];
}

function randFreeCell(snake: Cell[], obstacles: Cell[], tries = 200): Cell {
    for (let i = 0; i < tries; i++) {
        const c = {
            x: Math.floor(Math.random() * GRID),
            y: Math.floor(Math.random() * GRID),
        };
        if (
            !snake.some((s) => s.x === c.x && s.y === c.y) &&
            !obstacles.some((o) => o.x === c.x && o.y === c.y)
        )
            return c;
    }
    return { x: 1, y: 1 };
}
