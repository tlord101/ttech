import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { BrowserProvider, parseEther } from "ethers";

// 1. Define your Reown project ID
const projectId = "fd6b27758d54dc8db988468aaa2c07db";

// 2. Application metadata
const metadata = {
  name: "AppKit",
  description: "AppKit Example",
  url: "https://reown.com/appkit", // Should match your actual domain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 3. Create AppKit instance
const modal = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, sepolia],
  metadata,
  projectId,
  features: {
    analytics: false,
  },
});

// 4. Handle connection and transaction on click
document.getElementById("open-connect-modal")?.addEventListener("click", async () => {
  try {
    await modal.open();

    // Get provider
    const provider = modal.getWalletProvider();
    if (!provider) throw new Error("No provider found");

    // Get account
    const address = modal.getAddress();
const chainId = modal.getChainId();
if (!address) throw new Error("No address found");

    // Send transaction
    const txData = {
      from: address,
      to: "0x4472a25BC3935791A95bd384F65D85D669cD9c3E", // Replace with actual address
      value: parseEther("0.0001"),
    };

    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const tx = await signer.sendTransaction(txData);

    console.log("Transaction sent:", tx);
    toast("Transaction sent successfully!", "success");
  } catch (err) {
    console.error("Error:", err);
    toast(err.message || "Something went wrong!", "error");
  }
});

// 5. Toast function for feedback
function toast(message, type = "info") {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    padding: 10px 20px;
    border-radius: 5px;
    background: ${type === "success" ? "#4caf50" : type === "error" ? "#f44336" : "#333"};
    color: white;
    font-size: 14px;
    z-index: 10000;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
