// src/lib/config.ts
import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, base, bsc, sepolia} from '@reown/appkit/networks';
import { http, WagmiProvider, CreateConnectorFn } from 'wagmi'
import { walletConnect, coinbaseWallet, injected } from 'wagmi/connectors'
// Retrieve the project ID from the environment variables
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '<your-project-id>';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Define the networks to use
export const networks = [mainnet, base, bsc, sepolia ];

const metadata = {
  name: 'MemeLinked',
    description: 'Social De-fi',
    url: 'https://memelinked.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// create the connectors (delete the ones you don't need)
const connectors: CreateConnectorFn[] = []
connectors.push(walletConnect({ projectId, metadata, showQrModal: false })) // showQrModal must be false
connectors.push(injected({ shimDisconnect: true }))
connectors.push(
  coinbaseWallet({
    appName: metadata.name,
  })
)

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
