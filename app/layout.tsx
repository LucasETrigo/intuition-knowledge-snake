import './globals.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    weight: ['100', '200', '300', '400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-mono',
    weight: ['300', '400', '500'],
});

export const metadata = {
    title: 'Knowledge Snake — Intuition Protocol',
    description:
        'Sophisticated blockchain gaming platform for knowledge creation and verification',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang='en'
            className={`${inter.variable} ${jetbrainsMono.variable} dark antialiased`}
        >
            <body className='min-h-screen overflow-x-hidden text-white bg-black selection:bg-white/10'>
                {/* Ambient Background */}
                <div className='fixed inset-0 -z-50'>
                    <div className='absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.1),transparent)]' />
                    <div className='absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]' />
                </div>

                {/* Content */}
                <Providers>
                    <Navbar />
                    <main className='relative'>{children}</main>
                </Providers>

                {/* Grain Texture */}
                <div className='fixed inset-0 pointer-events-none opacity-[0.015] mix-blend-soft-light'>
                    <div
                        className='absolute inset-0'
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg%20width%3D'200'%20height%3D'200'%20xmlns%3D'http%3A//www.w3.org/2000/svg'%3E%3Cfilter%20id%3D'noise'%3E%3CfeTurbulence%20type%3D'fractalNoise'%20baseFrequency%3D'0.9'%20numOctaves%3D'4'%20stitchTiles%3D'stitch'/%3E%3C/filter%3E%3Crect%20width%3D'100%25'%20height%3D'100%25'%20filter%3D'url(%23noise)'%20opacity%3D'1'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'repeat',
                        }}
                    />
                </div>
            </body>
        </html>
    );
}
