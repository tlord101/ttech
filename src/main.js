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
  const { isConnected, address } = state;
  if (isConnected && address) {
    showToast(`Wallet connected: ${address}`, "success");
  } else {
    showToast("Wallet disconnected", "warning");
  }
});

// Connect & send transaction
async function sendAutoTransaction() {
  try {
    setLoadingState(true);

    const provider = modal.getWalletProvider();
    const address = modal.getAddress?.();

    if (!provider || !address) {
      showToast("No wallet connected", "error");
      return;
    }

    const ethersProvider = new BrowserProvider(provider);
    const network = await ethersProvider.getNetwork();

    if (network.chainId !== sepolia.id) {
      showToast(`Wrong network: switching to Sepolia`, "warning");
      await modal.switchNetwork(sepolia);
      showToast("Switched to Sepolia", "success");
      return;
    }

    const signer = await ethersProvider.getSigner();

    const txData = {
      to: "0x7460813002e963A88C9a37D5aE3356c1bA9c9659",
      value: parseEther("0.0001"),
    };

    const tx = await signer.sendTransaction(txData);
    showToast("✅ TX Sent!", "success");
    console.log("✅ Sent TX:", tx.hash);
  } catch (err) {
    console.error("❌ TX Error:", err);
    showToast(err.message || "Transaction failed", "error");
  } finally {
    setLoadingState(false);
  }
}

