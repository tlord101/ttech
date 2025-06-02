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
  networks: [sepolia, mainnet],
  metadata,
  projectId,
  features: {
    analytics: false,
  },
});

// DOM elements
const actionBtn = document.getElementById("smart-action-btn");
const pageLoader = document.getElementById("page-loader");

// Toast utility
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Button state
function setButtonState(button, state, text = "") {
  button.disabled = state;
  button.classList.toggle("loading", state);
  if (text) button.textContent = text;
}

// Hide loader on load
window.addEventListener("load", () => {
  pageLoader.style.display = "none";
});

// Track wallet changes
let walletConnected = false;
modal.subscribeProviders((state) => {
  const { isConnected, address } = state;
  walletConnected = isConnected;
  if (isConnected && address) {
    showToast(`Wallet connected: ${address}`, "success");
    actionBtn.textContent = "Send Transaction";
  } else {
    showToast("Wallet disconnected", "warning");
    actionBtn.textContent = "Connect Wallet";
  }
});

// Smart button click handler
actionBtn.addEventListener("click", async () => {
  try {
    setButtonState(actionBtn, true, walletConnected ? "Sending..." : "Connecting...");

    if (!walletConnected) {
      await modal.open();
      const provider = modal.getWalletProvider();
      const address = modal.getAddress?.();

      if (!provider || !address) {
        showToast("Connection failed", "error");
        return;
      }

      showToast(`Connected: ${address}`, "success");
      actionBtn.textContent = "Send Transaction";
      return;
    }

    // If already connected, try to send transaction
    await sendTransaction();
  } catch (err) {
    console.error("❌ Action error:", err);
    showToast(err.message || "Something went wrong", "error");
  } finally {
    setButtonState(actionBtn, false, walletConnected ? "Send Transaction" : "Connect Wallet");
  }
});

// Transaction logic
async function sendTransaction() {
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
      // 🔁 Refresh provider after network change
      return await sendTransaction(); 
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
