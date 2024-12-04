// src/lib/config.ts
import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, base, bsc, sepolia} from '@reown/appkit/networks';

// Retrieve the project ID from the environment variables
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '<your-project-id>';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Define the networks to use
export const networks = [mainnet, base, bsc, sepolia ];

// Set up the WagmiAdapter configuration
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

// Export the configuration that will be used in the Reown setup
export const config = wagmiAdapter.wagmiConfig;
