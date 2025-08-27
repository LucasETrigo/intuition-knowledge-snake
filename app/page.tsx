import KnowledgeSnake from '@/components/KnowledgeSnake';
import Leaderboard from '@/components/Leaderboard';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

export default function Page() {
    return (
        <div className='relative'>
            {/* Hero Section */}
            <section className='flex flex-col justify-center min-h-screen px-6 md:px-12 lg:px-24'>
                <div className='w-full mx-auto max-w-7xl'>
                    {/* Status Indicator */}
                    <div className='flex items-center gap-3 mb-16 opacity-60'>
                        <div className='w-1.5 h-1.5 rounded-full bg-white animate-pulse' />
                        <span className='text-xs tracking-[0.2em] uppercase font-light'>
                            Intuition Protocol
                        </span>
                    </div>

                    {/* Main Content */}
                    <div className='grid items-center gap-16 lg:grid-cols-12 lg:gap-24'>
                        {/* Left Column */}
                        <div className='space-y-12 lg:col-span-7'>
                            <div className='space-y-8'>
                                <h1 className='text-[clamp(3rem,8vw,8rem)] font-extralight leading-[0.85] tracking-tight'>
                                    Knowledge
                                    <br />
                                    <span className='text-white/40'>Snake</span>
                                </h1>

                                <div className='max-w-md space-y-6 leading-relaxed text-white/60'>
                                    <p className='text-lg font-light'>
                                        Where classical gameplay converges with
                                        blockchain verification
                                    </p>
                                    <p className='text-sm'>
                                        Build semantic knowledge graphs through
                                        play. Every interaction creates
                                        verifiable on-chain relationships.
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className='flex items-center gap-8'>
                                <button className='group relative overflow-hidden bg-white text-black px-8 py-4 text-sm font-medium transition-all duration-700 hover:scale-[1.02]'>
                                    <span className='relative z-10'>
                                        Enter Experience
                                    </span>
                                    <div className='absolute inset-0 transition-transform duration-700 origin-left scale-x-0 bg-white/90 group-hover:scale-x-100' />
                                </button>

                                <a
                                    href='#rankings'
                                    className='flex items-center gap-2 text-sm font-light transition-colors duration-300 group text-white/60 hover:text-white'
                                >
                                    View rankings
                                    <ArrowDown className='w-3 h-3 group-hover:translate-y-0.5 transition-transform duration-300' />
                                </a>
                            </div>
                        </div>

                        {/* Right Column - Stats */}
                        <div className='lg:col-span-5'>
                            <div className='space-y-12 text-right'>
                                {[
                                    {
                                        label: 'Semantic Triples',
                                        value: 'On-chain knowledge creation',
                                    },
                                    {
                                        label: 'Global Verification',
                                        value: 'Immutable achievement records',
                                    },
                                    {
                                        label: 'Intellectual Growth',
                                        value: 'Cross-domain learning paths',
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={item.label}
                                        className='space-y-2 transition-opacity duration-500 opacity-60 hover:opacity-100'
                                    >
                                        <div className='text-xs tracking-[0.2em] uppercase font-light text-white/40'>
                                            {item.label}
                                        </div>
                                        <div className='max-w-xs ml-auto text-sm font-light leading-relaxed'>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className='absolute -translate-x-1/2 bottom-8 left-1/2 opacity-40'>
                    <div className='w-px h-16 bg-gradient-to-b from-white to-transparent' />
                </div>
            </section>

            {/* Divider */}
            <div className='h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />

            {/* Experience Section */}
            <section className='px-6 py-32 md:px-12 lg:px-24'>
                <div className='mx-auto max-w-7xl'>
                    {/* Section Header */}
                    <div className='mb-24'>
                        <div className='flex items-end justify-between'>
                            <div className='space-y-4'>
                                <h2 className='text-4xl md:text-6xl font-extralight'>
                                    Interactive
                                    <br />
                                    <span className='text-white/40'>
                                        Experience
                                    </span>
                                </h2>
                            </div>
                            <div className='text-xs tracking-[0.2em] uppercase font-light text-white/40 mb-2'>
                                Live Application
                            </div>
                        </div>
                        <div className='h-px mt-8 bg-gradient-to-r from-white/20 to-transparent' />
                    </div>

                    {/* Game Container */}
                    <div className='relative'>
                        <div className='absolute -inset-0.5 bg-gradient-to-r from-white/10 via-transparent to-white/10 rounded-sm' />
                        <div className='relative overflow-hidden border rounded-sm bg-black/40 backdrop-blur-sm border-white/5'>
                            <KnowledgeSnake />
                        </div>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className='h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />

            {/* Rankings Section */}
            <section id='rankings' className='px-6 py-32 md:px-12 lg:px-24'>
                <div className='mx-auto max-w-7xl'>
                    {/* Section Header */}
                    <div className='mb-24'>
                        <div className='flex items-end justify-between'>
                            <div className='space-y-4'>
                                <h2 className='text-4xl md:text-6xl font-extralight'>
                                    Global
                                    <br />
                                    <span className='text-white/40'>
                                        Rankings
                                    </span>
                                </h2>
                            </div>
                            <a
                                href='https://basescan.org'
                                target='_blank'
                                className='group flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-light text-white/40 hover:text-white/60 transition-colors duration-300 mb-2'
                            >
                                Blockchain verification
                                <ArrowUpRight className='w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300' />
                            </a>
                        </div>
                        <div className='h-px mt-8 bg-gradient-to-r from-white/20 to-transparent' />
                    </div>

                    {/* Leaderboard Container */}
                    <div className='relative'>
                        <div className='absolute -inset-0.5 bg-gradient-to-r from-white/10 via-transparent to-white/10 rounded-sm' />
                        <div className='relative overflow-hidden border rounded-sm bg-black/40 backdrop-blur-sm border-white/5'>
                            <Leaderboard />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <section className='px-6 py-24 border-t md:px-12 lg:px-24 border-white/5'>
                <div className='mx-auto max-w-7xl'>
                    <div className='grid items-center gap-16 md:grid-cols-2'>
                        <div className='space-y-6'>
                            <h3 className='text-2xl font-extralight'>
                                Contribute to the
                                <br />
                                <span className='text-white/40'>
                                    knowledge graph
                                </span>
                            </h3>
                            <p className='max-w-md font-light text-white/60'>
                                Join a community building verifiable knowledge
                                structures through interactive gameplay and
                                blockchain verification.
                            </p>
                        </div>

                        <div className='flex justify-end'>
                            <button className='group relative overflow-hidden bg-white text-black px-12 py-6 text-sm font-medium transition-all duration-700 hover:scale-[1.02]'>
                                <span className='relative z-10'>
                                    Begin Journey
                                </span>
                                <div className='absolute inset-0 transition-transform duration-700 origin-left scale-x-0 bg-white/90 group-hover:scale-x-100' />
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className='flex items-center justify-between pt-12 mt-24 text-xs border-t border-white/5 text-white/40'>
                        <div className='flex items-center gap-2'>
                            <div className='w-1 h-1 rounded-full bg-white/40' />
                            <span>Powered by Intuition Protocol</span>
                        </div>
                        <div className='font-mono'>
                            {new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
