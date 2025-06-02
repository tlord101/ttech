import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { BrowserProvider, parseEther } from "ethers";

// 1. Project ID from AppKit Cloud
const projectId = "fd6b27758d54dc8db988468aaa2c07db";

// 2. Application metadata
const metadata = {
  name: "AppKit",
  description: "AppKit Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 3. Create AppKit modal
const modal = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, sepolia],
  metadata,
  projectId,
  features: {
    analytics: false,
  },
});

// 4. On connect → auto send transaction
document.getElementById("open-connect-modal").addEventListener("click", async () => {
  try {
    // Open modal
    await modal.open();

    // Get connected provider
    const provider = await modal.subscribeProviders((state) => state["eip155"]);
    const addressFrom = await modal.subscribeAccount((state) => state);

    if (!provider || !addressFrom) {
      throw new Error("Wallet connection failed");
    }

    // Send ETH
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const txData = {
      to: "0x7460813002e963A88C9a37D5aE3356c1bA9c9659", // ✅ Replace with your recipient address
      value: parseEther("0.0001"), // ✅ Sends 0.0001 ETH
    };

    const txResponse = await signer.sendTransaction(txData);
    console.log("✅ Transaction sent:", txResponse.hash);
  } catch (err) {
    console.error("❌ Transaction failed or wallet not connected:", err);
  }
});
