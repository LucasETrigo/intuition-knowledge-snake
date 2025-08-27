import { NextRequest, NextResponse } from 'next/server';

// In-memory store; swap to a DB for persistence
let ENTRIES: {
    address: string;
    score: number;
    theme: string;
    words: number;
    chainId: number;
    txHash: string;
    createdAt: string;
}[] = [];

export async function GET() {
    const top = ENTRIES.slice()
        .sort(
            (a, b) => b.score - a.score || (a.createdAt < b.createdAt ? 1 : -1)
        )
        .slice(0, 100);
    return NextResponse.json(top);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address, score, theme, words, chainId, txHash } = body || {};
        if (
            !address ||
            typeof score !== 'number' ||
            !txHash ||
            typeof chainId !== 'number'
        ) {
            return NextResponse.json(
                { error: 'invalid payload' },
                { status: 400 }
            );
        }
        ENTRIES.push({
            address,
            score,
            theme: theme ?? 'Unknown',
            words: words ?? 0,
            chainId,
            txHash,
            createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'bad request' }, { status: 400 });
    }
}
