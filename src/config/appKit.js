import { arbitrum, mainnet, optimism, polygon, sepolia } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'

const projectId = "fd6b27758d54dc8db988468aaa2c07db" // this is a public projectId only to use on localhost
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

export const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [arbitrum, mainnet, optimism, polygon, sepolia],
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#000000',
  },
  features: {
    analytics: true,
  },
})
