'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, RotateCcw } from 'lucide-react';

type Entry = {
    address: string;
    score: number;
    theme: string;
    words: number;
    chainId: number;
    txHash: `0x${string}`;
    createdAt: string;
};

export default function Leaderboard() {
    const [rows, setRows] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/leaderboard', { cache: 'no-store' });
            const data = (await res.json()) as Entry[];
            setRows(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const explorerFor = (cid: number) =>
        cid === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org';

    return (
        <div className='p-8 space-y-12 md:p-12'>
            {/* Header */}
            <div className='flex items-end justify-between'>
                <div className='space-y-2'>
                    <h3 className='text-lg font-light'>Achievement Records</h3>
                    <p className='max-w-md text-sm font-light text-white/40'>
                        Blockchain-verified performance rankings with immutable
                        transaction records
                    </p>
                </div>

                <button
                    onClick={load}
                    disabled={loading}
                    className='flex items-center gap-2 text-xs font-light transition-colors duration-300 group text-white/40 hover:text-white/60 disabled:opacity-30'
                >
                    <RotateCcw
                        className={`w-3 h-3 transition-transform duration-500 ${
                            loading ? 'animate-spin' : 'group-hover:rotate-180'
                        }`}
                    />
                    Update
                </button>
            </div>

            {/* Rankings Table */}
            <div className='space-y-0'>
                {/* Header Row */}
                <div className='hidden gap-8 py-4 text-xs font-light tracking-wide border-b md:grid md:grid-cols-6 border-white/5 text-white/40'>
                    <div>Position</div>
                    <div>Participant</div>
                    <div>Achievement</div>
                    <div>Network</div>
                    <div>Verification</div>
                    <div>Timestamp</div>
                </div>

                {/* Data Rows */}
                <div className='space-y-0'>
                    {loading && rows.length === 0 && (
                        <div className='flex items-center justify-center py-24'>
                            <div className='flex items-center gap-3 text-white/40'>
                                <RotateCcw className='w-4 h-4 animate-spin' />
                                <span className='text-sm font-light'>
                                    Loading records...
                                </span>
                            </div>
                        </div>
                    )}

                    {!loading && rows.length === 0 && (
                        <div className='flex flex-col items-center justify-center py-24 space-y-4'>
                            <div className='flex items-center justify-center w-8 h-8 border border-white/10'>
                                <div className='w-2 h-2 bg-white/20' />
                            </div>
                            <div className='space-y-1 text-center'>
                                <div className='text-sm font-light text-white/60'>
                                    No records established
                                </div>
                                <div className='text-xs text-white/40'>
                                    Pioneer the leaderboard
                                </div>
                            </div>
                        </div>
                    )}

                    {rows.map((entry, index) => {
                        const rank = index + 1;
                        const isTopThree = rank <= 3;

                        return (
                            <div
                                key={entry.txHash}
                                className={`group transition-all duration-300 border-b border-white/5 hover:bg-white/[0.01] ${
                                    isTopThree ? 'bg-white/[0.008]' : ''
                                }`}
                            >
                                {/* Desktop Layout */}
                                <div className='items-center hidden gap-8 py-6 md:grid md:grid-cols-6'>
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`w-6 h-6 flex items-center justify-center text-xs font-light ${
                                                rank === 1
                                                    ? 'text-white'
                                                    : rank === 2
                                                    ? 'text-white/80'
                                                    : rank === 3
                                                    ? 'text-white/60'
                                                    : 'text-white/40'
                                            }`}
                                        >
                                            {rank.toString().padStart(2, '0')}
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-3'>
                                        <div className='flex items-center justify-center w-6 h-6 border border-white/10'>
                                            <div className='w-2 h-2 bg-white/40' />
                                        </div>
                                        <span className='font-mono text-sm font-light text-white/80'>
                                            {short(entry.address)}
                                        </span>
                                    </div>

                                    <div className='space-y-1'>
                                        <div className='text-sm font-light text-white tabular-nums'>
                                            {entry.score.toLocaleString()}
                                        </div>
                                        <div className='text-xs text-white/40'>
                                            {entry.words} constructs
                                        </div>
                                    </div>

                                    <div className='text-sm font-light text-white/60'>
                                        {entry.chainId === 8453
                                            ? 'Base'
                                            : entry.chainId === 84532
                                            ? 'Base Sepolia'
                                            : `Chain ${entry.chainId}`}
                                    </div>

                                    <div>
                                        <a
                                            href={`${explorerFor(
                                                entry.chainId
                                            )}/tx/${entry.txHash}`}
                                            target='_blank'
                                            rel='noreferrer'
                                            className='group/link flex items-center gap-1.5 text-xs font-light text-white/40 hover:text-white/60 transition-colors duration-300'
                                        >
                                            <span>Verify</span>
                                            <ArrowUpRight className='w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300' />
                                        </a>
                                    </div>

                                    <div className='font-mono text-xs font-light text-white/40'>
                                        {formatDate(entry.createdAt)}
                                    </div>
                                </div>

                                {/* Mobile Layout */}
                                <div className='p-6 space-y-4 md:hidden'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className='text-sm font-light text-white/60'>
                                                #
                                                {rank
                                                    .toString()
                                                    .padStart(2, '0')}
                                            </div>
                                            <div className='flex items-center justify-center w-4 h-4 border border-white/10'>
                                                <div className='w-1.5 h-1.5 bg-white/40' />
                                            </div>
                                            <span className='font-mono text-sm font-light'>
                                                {short(entry.address)}
                                            </span>
                                        </div>
                                        <div className='text-right'>
                                            <div className='text-sm font-light text-white tabular-nums'>
                                                {entry.score.toLocaleString()}
                                            </div>
                                            <div className='text-xs text-white/40'>
                                                {entry.words} constructs
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex items-center justify-between text-xs text-white/40'>
                                        <div className='flex items-center gap-4'>
                                            <span>
                                                {entry.chainId === 8453
                                                    ? 'Base'
                                                    : 'Base Sepolia'}
                                            </span>
                                            <span className='font-mono'>
                                                {formatDate(entry.createdAt)}
                                            </span>
                                        </div>
                                        <a
                                            href={`${explorerFor(
                                                entry.chainId
                                            )}/tx/${entry.txHash}`}
                                            target='_blank'
                                            rel='noreferrer'
                                            className='flex items-center gap-1 transition-colors duration-300 hover:text-white/60'
                                        >
                                            <span>Verify</span>
                                            <ArrowUpRight className='w-3 h-3' />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            {rows.length > 0 && (
                <div className='pt-8 border-t border-white/5'>
                    <p className='text-xs font-light text-center text-white/30'>
                        Performance data cached for optimal experience •
                        Blockchain verification maintained
                    </p>
                </div>
            )}
        </div>
    );
}

function short(address?: string) {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—';
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
    });
}
