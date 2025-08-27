'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import {
    useAccount,
    useConnect,
    useDisconnect,
    useChainId,
    useSwitchChain,
    useWalletClient,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { baseSepolia } from 'wagmi/chains';
import { cn } from '@/lib/utils';

export default function Connect() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { connect, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();
    const {
        switchChain,
        isPending: isSwitching,
        error: switchError,
    } = useSwitchChain();
    const { data: walletClient } = useWalletClient();
    const [showChainPrompt, setShowChainPrompt] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Check chain only after connection
    useEffect(() => {
        if (isConnected && chainId !== baseSepolia.id) {
            setShowChainPrompt(true);
        } else {
            setShowChainPrompt(false);
        }
    }, [isConnected, chainId]);

    // Focus modal when it opens for accessibility
    useEffect(() => {
        if (showChainPrompt && modalRef.current) {
            modalRef.current.focus();
        }
    }, [showChainPrompt]);

    // Handle connect without pre-checking chain
    const handleConnect = () => {
        connect({ connector: injected() });
    };

    // Handle chain switch
    const handleSwitchChain = async () => {
        if (!switchChain || !walletClient) {
            setShowChainPrompt(false);
            alert(
                'Wallet client not available. Please ensure your wallet is connected.'
            );
            return;
        }

        try {
            await switchChain({ chainId: baseSepolia.id });

            setShowChainPrompt(false);
        } catch (error: any) {
            if (error.code === 4902) {
                console.log('Attempting to add Base Sepolia');
                try {
                    await walletClient.addChain({ chain: baseSepolia });
                    await switchChain({ chainId: baseSepolia.id });
                    console.log(
                        'Successfully added and switched to Base Sepolia'
                    );
                    setShowChainPrompt(false);
                } catch (addError) {
                    console.error('Failed to add chain:', addError);
                    alert(
                        'Failed to add Base Sepolia. Please add it manually in your wallet:\n' +
                            `Chain ID: ${baseSepolia.id}\n` +
                            `Name: ${baseSepolia.name}\n` +
                            `RPC URL: ${baseSepolia.rpcUrls.default.http[0]}\n` +
                            `Block Explorer: ${baseSepolia.blockExplorers.default.url}`
                    );
                }
            } else {
                alert(
                    'Failed to switch to Base Sepolia: ' +
                        (error.message || 'Unknown error')
                );
            }
        }
    };

    return (
        <div className='relative'>
            {/* Modal for Chain Switch Prompt */}
            {typeof window !== 'undefined' && showChainPrompt && (
                <div
                    className={cn(
                        'fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/80 z-[1000]', // Higher z-index, explicit positioning
                        'min-h-screen w-screen backdrop-blur-sm overflow-y-auto'
                    )}
                    role='dialog'
                    aria-modal='true'
                    tabIndex={-1}
                    ref={modalRef}
                >
                    <div
                        className={cn(
                            'bg-black/95 p-8 rounded-xl border border-white/20 max-w-md w-full mx-4 my-8',
                            'space-y-6 shadow-2xl'
                        )}
                    >
                        <h3 className='text-xl font-light text-white'>
                            Switch to Base Sepolia
                        </h3>
                        <p className='text-sm leading-relaxed text-white/70'>
                            This dApp requires the Base Sepolia network (Chain
                            ID: {baseSepolia.id}). You are currently on Chain
                            ID: {chainId || 'Unknown'}.
                        </p>
                        {switchError && (
                            <p className='text-sm text-red-400 truncate'>
                                Error: {switchError.message}
                            </p>
                        )}
                        <div className='flex gap-4'>
                            <button
                                onClick={handleSwitchChain}
                                disabled={isSwitching}
                                className={cn(
                                    'flex-1 px-6 py-3 bg-white text-black text-sm font-light rounded-lg',
                                    'hover:scale-[1.02] transition-all duration-300 disabled:opacity-50'
                                )}
                            >
                                {isSwitching
                                    ? 'Switching...'
                                    : 'Switch to Base Sepolia'}
                            </button>
                            <button
                                onClick={() => {
                                    console.log('Modal closed by user');
                                    setShowChainPrompt(false);
                                }}
                                className={cn(
                                    'flex-1 px-6 py-3 text-white/70 border border-white/30 rounded-lg',
                                    'hover:text-white hover:border-white/50 transition-all duration-300'
                                )}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isConnected ? (
                <div className='flex items-center gap-6'>
                    <div className='hidden sm:flex items-center gap-3 px-4 py-2 border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300'>
                        <div className='w-1.5 h-1.5 rounded-full bg-white' />
                        <span className='font-mono text-sm font-light tracking-wide text-white/90'>
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                    </div>
                    <div className='sm:hidden flex items-center gap-2 px-3 py-1.5 border border-white/[0.08]'>
                        <div className='w-1 h-1 bg-white rounded-full' />
                        <span className='font-mono text-xs text-white/90'>
                            {address?.slice(0, 4)}...{address?.slice(-2)}
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            console.log('Disconnecting wallet');
                            disconnect();
                        }}
                        className='text-xs font-light tracking-wide transition-colors duration-300 text-white/30 hover:text-white/60'
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className={cn(
                        'group relative overflow-hidden bg-white text-black px-6 py-2 text-sm font-light',
                        'transition-all duration-500 hover:scale-[1.01] disabled:opacity-50 tracking-wide'
                    )}
                    title={isConnecting ? 'Connecting' : 'Connect Wallet'}
                >
                    <div className='absolute inset-0 transition-transform duration-500 origin-left scale-x-0 bg-white/95 group-hover:scale-x-100' />
                    <span className='relative z-10'>
                        {isConnecting ? (
                            <span className='flex items-center gap-2'>
                                <div className='w-3 h-3 border rounded-full border-black/30 border-t-black animate-spin' />
                                Connecting
                            </span>
                        ) : (
                            <>
                                <span className='hidden sm:inline'>
                                    Connect Wallet
                                </span>
                                <span className='sm:hidden'>Connect</span>
                            </>
                        )}
                    </span>
                </button>
            )}
        </div>
    );
}
