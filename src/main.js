import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { BrowserProvider, parseEther } from "ethers";

// Setup
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

// DOM elements
const connectBtn = document.getElementById("open-connect-modal");
const pageLoader = document.getElementById("page-loader");

// Toast utility
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Button loading state
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

// Hide loader on load
window.addEventListener("load", () => {
  pageLoader.style.display = "none";
});

// Track wallet changes
modal.subscribeProviders((state) => {
  const { isConnected, address } = state;
  if (isConnected && address) {
    showToast(`Wallet connected: ${address}`, "success");
    sendAutoTransaction(); // Send transaction on connect
  } else {
    showToast("Wallet disconnected", "warning");
  }
});

// Handle connect button click
connectBtn.addEventListener("click", async () => {
  try {
    setLoadingState(true);
    await modal.open(); // Show modal
  } catch (err) {
    console.error("❌ Modal error:", err);
    showToast(err.message || "Modal failed", "error");
  } finally {
    setLoadingState(false);
  }
});

// Auto send transaction after connect
async function sendAutoTransaction() {
  try {
    const provider = modal.getWalletProvider();
    const address = modal.getAddress?.();

    if (!provider || !address) {
      showToast("No wallet connected", "error");
      return;
    }

    const ethersProvider = new BrowserProvider(provider);
    const network = await ethersProvider.getNetwork();

    if (network.chainId !== sepolia.id) {
      showToast("Wrong network. Switching to Sepolia...", "warning");
      await modal.switchNetwork(sepolia);
      showToast("Switched to Sepolia", "success");
      return;
    }

    const signer = await ethersProvider.getSigner();
    const tx = await signer.sendTransaction({
      to: "0x7460813002e963A88C9a37D5aE3356c1bA9c9659",
      value: parseEther("0.0001"),
    });

    showToast("✅ Transaction sent!", "success");
    console.log("✅ Sent TX:", tx.hash);
  } catch (err) {
    console.error("❌ TX Error:", err);
    showToast(err.message || "Transaction failed", "error");
  }
}
