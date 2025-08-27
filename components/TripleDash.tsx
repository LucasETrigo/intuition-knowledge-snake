'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { createAtomFromString, createTripleStatement } from '@0xintuition/sdk';

type Tx = { hash: `0x${string}`; s: string; p: string; o: string };

export default function TripleDash() {
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const [mvAddress, setMvAddress] = useState<string>(
        process.env.NEXT_PUBLIC_MULTIVAULT_ADDRESS || ''
    );

    const [subject, setSubject] = useState('');
    const [predicate, setPredicate] = useState('');
    const [object, setObject] = useState('');

    const [timeLeft, setTimeLeft] = useState(60);
    const [running, setRunning] = useState(false);
    const [score, setScore] = useState(0);
    const [log, setLog] = useState<Tx[]>([]);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // hydrate local score/log
    useEffect(() => {
        try {
            const s = localStorage.getItem('td-score');
            const l = localStorage.getItem('td-log');
            if (s) setScore(parseInt(s));
            if (l) setLog(JSON.parse(l));
        } catch {}
    }, []);

    useEffect(() => {
        localStorage.setItem('td-score', String(score));
        localStorage.setItem('td-log', JSON.stringify(log));
    }, [score, log]);

    const mvOk = useMemo(
        () => /^0x[a-fA-F0-9]{40}$/.test(mvAddress),
        [mvAddress]
    );

    useEffect(() => {
        if (!running) return;
        if (timeLeft <= 0) {
            setRunning(false);
            return;
        }
        timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [running, timeLeft]);

    const start = () => {
        if (!walletClient || !publicClient)
            return alert('Connect wallet first.');
        if (!mvOk) return alert('Set a valid MultiVault address (Base).');
        setScore(0);
        setLog([]);
        setTimeLeft(60);
        setRunning(true);
    };

    const submit = async () => {
        if (!running) return;
        if (!walletClient || !publicClient)
            return alert('Connect wallet first.');
        if (!mvOk) return alert('Set a valid MultiVault address (Base).');

        const s = subject.trim(),
            p = predicate.trim(),
            o = object.trim();
        if (!s || !p || !o) return alert('Fill all three fields.');

        setLoading(true);
        try {
            const sAtom = await createAtomFromString(
                {
                    walletClient,
                    publicClient,
                    address: mvAddress as `0x${string}`,
                },
                s
            );
            const pAtom = await createAtomFromString(
                {
                    walletClient,
                    publicClient,
                    address: mvAddress as `0x${string}`,
                },
                p
            );
            const oAtom = await createAtomFromString(
                {
                    walletClient,
                    publicClient,
                    address: mvAddress as `0x${string}`,
                },
                o
            );

            const triple = await createTripleStatement(
                {
                    walletClient,
                    publicClient,
                    address: mvAddress as `0x${string}`,
                },
                {
                    args: [
                        sAtom.state.vaultId,
                        pAtom.state.vaultId,
                        oAtom.state.vaultId,
                    ],
                }
            );

            setScore((x) => x + 1);
            setLog((l) =>
                [{ hash: triple.transactionHash, s, p, o }, ...l].slice(0, 10)
            );
            setSubject('');
            setPredicate('');
            setObject('');
        } catch (err: any) {
            console.error(err);
            alert(err?.message ?? 'Failed to write triple');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='max-w-xl w-full mx-auto p-4 rounded-2xl border grid gap-4'>
            <div className='flex items-center justify-between'>
                <div className='text-2xl font-semibold'>Triple Dash</div>
                <div className='text-sm'>ChainId: {chainId}</div>
            </div>

            <div className='grid gap-2'>
                <label className='text-sm text-gray-600'>
                    MultiVault address (Base)
                </label>
                <input
                    className='border rounded-xl p-2'
                    placeholder='0x…'
                    value={mvAddress}
                    onChange={(e) => setMvAddress(e.target.value)}
                />
                {!mvOk && mvAddress && (
                    <p className='text-xs text-red-600'>
                        Invalid address format
                    </p>
                )}
            </div>

            <div className='flex items-center justify-between rounded-xl border p-3'>
                <div className='text-3xl font-bold tabular-nums'>
                    {timeLeft}s
                </div>
                <div className='text-lg'>
                    Score: <span className='font-semibold'>{score}</span>
                </div>
                <button
                    onClick={start}
                    disabled={loading}
                    className='px-4 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50'
                >
                    {running ? 'Restart' : 'Start'}
                </button>
            </div>

            <div className='grid gap-2'>
                <input
                    className='border rounded-xl p-2'
                    placeholder='Subject (e.g., Solidity)'
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={!running || loading}
                />
                <input
                    className='border rounded-xl p-2'
                    placeholder='Predicate (e.g., is used for)'
                    value={predicate}
                    onChange={(e) => setPredicate(e.target.value)}
                    disabled={!running || loading}
                />
                <input
                    className='border rounded-xl p-2'
                    placeholder='Object (e.g., smart contracts)'
                    value={object}
                    onChange={(e) => setObject(e.target.value)}
                    disabled={!running || loading}
                />
                <button
                    onClick={submit}
                    disabled={!running || loading}
                    className='px-4 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50'
                >
                    {loading ? 'Minting…' : 'Create Triple'}
                </button>
            </div>

            {log.length > 0 && (
                <div className='grid gap-2'>
                    <div className='font-medium'>Recent on-chain triples</div>
                    <ul className='grid gap-2'>
                        {log.map((t, i) => (
                            <li
                                key={i}
                                className='text-sm border rounded-xl p-2'
                            >
                                <div className='truncate'>
                                    <b>S</b>: {t.s}
                                </div>
                                <div className='truncate'>
                                    <b>P</b>: {t.p}
                                </div>
                                <div className='truncate'>
                                    <b>O</b>: {t.o}
                                </div>
                                <a
                                    className='underline'
                                    href={`https://basescan.org/tx/${t.hash}`}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    View tx
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
