import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, sepolia} from "@reown/appkit/networks";
import { BrowserProvider, Contract, parseEther } from "ethers";

// 1. Get projectId from https://cloud.reown.com
const projectId = "fd6b27758d54dc8db988468aaa2c07db";

// 2. Create your application's metadata object
const metadata = {
  name: "AppKit",
  description: "AppKit Example",
  url: "https://reown.com/appkit", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 3. Create a AppKit instance
const modal = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, sepolia],
  metadata,
  projectId,
  features: {
    analytics: false, // Optional - defaults to your Cloud configuration
  },
});

const provider = await modal.subscribeProviders((state) => {
  return state["eip155"];
});

const addressFrom = await modal.subscribeAccount((state) => {
  return state;
});

if (!provider) throw Error("No provider found");
if (!addressFrom) throw Error("No address found");

function sendTransaction() {
  const tx = {
    from: addressFrom,
    to: "0x...", // any address
    value: parseEther("0.0001"),
  };
  const ethersProvider = new BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();
  const tx = await signer.sendTransaction(tx);
  console.log("transaction:", tx);
}
const openConnectModalBtn = document.getElementById("open-connect-modal");
openConnectModalBtn.addEventListener("click", () => modal.open());
