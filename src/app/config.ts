import { 
    createConfig, 
    http, 
    cookieStorage,
    createStorage 
  } from 'wagmi'
  import { mainnet, sepolia, bsc, base } from 'wagmi/chains'
  
  export function getConfig() {
    return createConfig({
      chains: [mainnet, sepolia, bsc, base],
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [base.id]: http(),
        [bsc.id]: http()
      },
    })
  }