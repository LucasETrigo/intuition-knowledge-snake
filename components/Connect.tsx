'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function Connect() {
    const { address, isConnected } = useAccount();
    const { connect, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    if (isConnected) {
        return (
            <div className='flex items-center gap-6'>
                {/* Connected Status */}
                <div className='hidden sm:flex items-center gap-3 px-4 py-2 border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300'>
                    <div className='w-1.5 h-1.5 rounded-full bg-white' />
                    <span className='font-mono text-sm font-light tracking-wide text-white/90'>
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                </div>

                {/* Mobile Connected */}
                <div className='sm:hidden flex items-center gap-2 px-3 py-1.5 border border-white/[0.08]'>
                    <div className='w-1 h-1 bg-white rounded-full' />
                    <span className='font-mono text-xs text-white/90'>
                        {address?.slice(0, 4)}...{address?.slice(-2)}
                    </span>
                </div>

                {/* Disconnect */}
                <button
                    onClick={() => disconnect()}
                    className='text-xs font-light tracking-wide transition-colors duration-300 text-white/30 hover:text-white/60'
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => connect({ connector: injected() })}
            disabled={isPending}
            className='group relative overflow-hidden bg-white text-black px-6 py-2 text-sm font-light transition-all duration-500 hover:scale-[1.01] disabled:opacity-50 tracking-wide'
        >
            {/* Hover Effect */}
            <div className='absolute inset-0 transition-transform duration-500 origin-left scale-x-0 bg-white/95 group-hover:scale-x-100' />

            {/* Content */}
            <span className='relative z-10'>
                {isPending ? (
                    <span className='flex items-center gap-2'>
                        <div className='w-3 h-3 border rounded-full border-black/30 border-t-black animate-spin' />
                        Connecting
                    </span>
                ) : (
                    <span className='hidden sm:inline'>Connect Wallet</span>
                )}
                <span className='sm:hidden'>
                    {isPending ? '...' : 'Connect'}
                </span>
            </span>
        </button>
    );
}
