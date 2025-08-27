'use client';
import Link from 'next/link';
import { useChainId } from 'wagmi';
import Connect from '@/components/Connect';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
    const chainId = useChainId();
    const networkLabel =
        chainId === 8453
            ? 'Base'
            : chainId === 84532
            ? 'Base Sepolia'
            : `Chain ${chainId}`;

    return (
        <header className='fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/[0.02]'>
            <div className='flex items-center justify-between h-16 px-6 mx-auto max-w-7xl md:px-12 lg:px-24'>
                {/* Left Side */}
                <div className='flex items-center gap-16'>
                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='w-auto h-auto p-1 border-0 lg:hidden hover:bg-transparent'
                            >
                                <Menu className='w-4 h-4 text-white/60' />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side='left'
                            className='bg-black/95 backdrop-blur-xl border-r border-white/[0.02] w-72'
                        >
                            <nav className='grid gap-1 pt-20'>
                                <Link
                                    href='/'
                                    className='px-1 py-3 text-sm font-light transition-colors duration-300 text-white/80 hover:text-white'
                                >
                                    Experience
                                </Link>

                                <a
                                    href='#rankings'
                                    className='px-1 py-3 text-sm font-light transition-colors duration-300 text-white/80 hover:text-white'
                                >
                                    Rankings
                                </a>

                                <a
                                    href='https://basescan.org'
                                    target='_blank'
                                    className='flex items-center justify-between px-1 py-3 text-sm font-light transition-colors duration-300 text-white/80 hover:text-white'
                                >
                                    <span>Verification</span>
                                    <ArrowUpRight className='w-3 h-3 opacity-40' />
                                </a>
                            </nav>
                        </SheetContent>
                    </Sheet>

                    {/* Logo */}
                    <Link href='/' className='flex items-center gap-3 group'>
                        <div className='w-5 h-5 transition-opacity duration-300 bg-white opacity-90 group-hover:opacity-100' />
                        <div className='hidden sm:block'>
                            <div className='text-sm font-light tracking-tight text-white'>
                                Knowledge Snake
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Center Navigation */}
                <nav className='items-center hidden gap-12 lg:flex'>
                    <Link
                        href='/'
                        className='relative py-1 text-sm font-light transition-colors duration-300 text-white/50 hover:text-white group'
                    >
                        Experience
                        <div className='absolute left-0 w-0 h-px transition-all duration-300 -bottom-3 bg-white/60 group-hover:w-full' />
                    </Link>

                    <a
                        href='#rankings'
                        className='relative py-1 text-sm font-light transition-colors duration-300 text-white/50 hover:text-white group'
                    >
                        Rankings
                        <div className='absolute left-0 w-0 h-px transition-all duration-300 -bottom-3 bg-white/60 group-hover:w-full' />
                    </a>

                    <a
                        href='https://basescan.org'
                        target='_blank'
                        className='relative flex items-center gap-1 py-1 text-sm font-light transition-colors duration-300 text-white/50 hover:text-white group'
                    >
                        <span>Verification</span>
                        <ArrowUpRight className='w-3 h-3 transition-opacity duration-300 opacity-40 group-hover:opacity-60' />
                        <div className='absolute left-0 w-0 h-px transition-all duration-300 -bottom-3 bg-white/60 group-hover:w-full' />
                    </a>
                </nav>

                {/* Right Side */}
                <div className='flex items-center gap-8'>
                    {/* Network Status */}
                    <div className='items-center hidden gap-2 text-xs font-light md:flex text-white/30'>
                        <div className='w-1 h-1 rounded-full bg-white/50' />
                        <span className='font-mono tracking-wide'>
                            {networkLabel}
                        </span>
                    </div>

                    {/* Connect */}
                    <Connect />
                </div>
            </div>
        </header>
    );
}
