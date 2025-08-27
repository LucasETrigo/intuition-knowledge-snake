import { createConfig, http } from 'wagmi';
import { baseSepolia, mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { createPublicClient } from 'viem';

export const wagmiConfig = createConfig({
    chains: [baseSepolia, mainnet], // Add mainnet for better chain detection
    connectors: [injected({ shimDisconnect: true })],
    transports: {
        [baseSepolia.id]: http(),
        [mainnet.id]: http(),
    },
});

export const makePublicClient = (useSepolia = true) =>
    createPublicClient({
        chain: useSepolia ? baseSepolia : mainnet,
        transport: http(),
    });
