import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { createPublicClient } from 'viem';

export const wagmiConfig = createConfig({
    chains: [baseSepolia, base], // default to Base Sepolia first for TRUST testing
    connectors: [injected({ shimDisconnect: true })],
    transports: {
        [baseSepolia.id]: http(),
        [base.id]: http(),
    },
});

export const makePublicClient = (useSepolia = true) =>
    createPublicClient({
        chain: useSepolia ? baseSepolia : base,
        transport: http(),
    });
