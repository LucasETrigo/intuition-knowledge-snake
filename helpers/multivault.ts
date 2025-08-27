// helpers/multivault.ts
import { type PublicClient } from 'viem';

export async function validateMultiVaultAddress(
    publicClient: PublicClient,
    address: `0x${string}`
) {
    // 1) must be a contract (has bytecode)
    const bytecode = await publicClient
        .getBytecode({ address })
        .catch(() => null);
    if (!bytecode || bytecode === '0x') {
        throw new Error(
            'That address is not a deployed contract on this network.'
        );
    }
}
