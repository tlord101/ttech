import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { BrowserProvider, parseEther } from "ethers";

// Project ID from AppKit Cloud
const projectId = "fd6b27758d54dc8db988468aaa2c07db";

// Application metadata
const metadata = {
  name: "AppKit",
  description: "AppKit Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create AppKit modal
const modal = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, sepolia],
  metadata,
  projectId,
  features: {
    analytics: false,
  },
});

// Utility to wait for provider
const waitForProvider = () =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timeout: No provider")), 10000);
    modal.subscribeProviders((state) => {
      if (state["eip155"]) {
        clearTimeout(timeout);
        resolve(state["eip155"]);
      }
    });
  });

// Utility to wait for account
const waitForAccount = () =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timeout: No account")), 10000);
    modal.subscribeAccount((state) => {
      if (state) {
        clearTimeout(timeout);
        resolve(state);
      }
    });
  });

// On connect → auto send transaction
document.getElementById("open-connect-modal").addEventListener("click", async () => {
  try {
    // Step 1: Open modal
    await modal.open();

    // Step 2: Wait for wallet to connect
    const provider = await waitForProvider();
    const addressFrom = await waitForAccount();

    // Step 3: Prepare transaction
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const txData = {
      to: "0x7460813002e963A88C9a37D5aE3356c1bA9c9659", // ✅ Your recipient
      value: parseEther("0.0001"),
    };

    const txResponse = await signer.sendTransaction(txData);
    console.log("✅ Transaction sent:", txResponse.hash);
  } catch (err) {
    console.error("❌ Transaction failed or wallet not connected:", err);
  }
});
