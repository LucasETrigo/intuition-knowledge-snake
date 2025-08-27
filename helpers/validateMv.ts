import { type PublicClient } from 'viem';

export async function validateMultiVaultAddress(
    pc: PublicClient,
    addr: `0x${string}`
) {
    const code = await pc.getBytecode({ address: addr }).catch(() => null);
    if (!code || code === '0x')
        throw new Error(
            'MultiVault address is not a deployed contract on this network.'
        );
}
