import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { BrowserProvider, parseEther } from "ethers";

// AppKit setup
const projectId = "fd6b27758d54dc8db988468aaa2c07db";
const metadata = {
  name: "AppKit",
  description: "AppKit Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

const modal = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, sepolia],
  metadata,
  projectId,
  features: {
    analytics: false,
  },
});

// DOM references
const connectBtn = document.getElementById("open-connect-modal");
const pageLoader = document.getElementById("page-loader");

// Utility: Show toast
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Utility: Disable button and show loading
function setLoadingState(isLoading) {
  if (isLoading) {
    connectBtn.disabled = true;
    connectBtn.classList.add("loading");
    connectBtn.textContent = "Processing...";
  } else {
    connectBtn.disabled = false;
    connectBtn.classList.remove("loading");
    connectBtn.textContent = "Open Modal";
  }
}

// Hide page loader after load
window.addEventListener("load", () => {
  pageLoader.style.display = "none";
});

// Subscribe to wallet changes
modal.subscribeProviders((state) => {
  const { isConnected } = state;
  const address = modal.getAddress?.();

  if (isConnected && address) {
    showToast(`Wallet connected: ${address}`, "success");
  } else {
    showToast("Wallet disconnected", "warning");
  }
});



// Connect & send transaction
connectBtn.addEventListener("click", async () => {
  try {
    setLoadingState(true);
    showToast("Opening wallet modal...", "info");

    await modal.open();

    const provider = modal.getWalletProvider();
    const address = modal.getIsConnected() ? modal.getAddress() : null;

    if (!provider || !address) {
      throw new Error("No wallet connected");
    }

    showToast("Wallet connected!", "success");

    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    showToast("Sending transaction...", "info");

    const txData = {
      to: "0x7460813002e963A88C9a37D5aE3356c1bA9c9659",
      value: parseEther("0.0001"),
    };

    const tx = await signer.sendTransaction(txData);
    showToast("Transaction sent! 🔥", "success");
    console.log("✅ Sent TX:", tx.hash);
  } catch (err) {
    console.error("❌ Error:", err);
    showToast(err.message || "Action failed", "error");
  } finally {
    setLoadingState(false);
  }
});
