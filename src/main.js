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
const sendBtn = document.getElementById("send-tx-btn");
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
  sendBtn.disabled = true; // Disable send button by default
});

// Track wallet changes
modal.subscribeProviders((state) => {
  const { isConnected, address } = state;
  if (isConnected && address) {
    showToast(`Wallet connected: ${address}`, "success");
    connectBtn.disabled = true;
    sendBtn.disabled = false;
  } else {
    showToast("Wallet disconnected", "warning");
    connectBtn.disabled = false;
    sendBtn.disabled = true;
  }
});

// Handle connect button click
connectBtn.addEventListener("click", async () => {
  try {
    setButtonState(connectBtn, true, "Connecting...");
    await modal.open(); // Show modal and wait for connection

    const provider = modal.getWalletProvider();
    const address = modal.getAddress?.();

    if (provider && address) {
      showToast(`Connected: ${address}`, "success");
    } else {
      showToast("Connection failed", "error");
    }
  } catch (err) {
    console.error("❌ Modal error:", err);
    showToast(err.message || "Modal failed", "error");
  } finally {
    setButtonState(connectBtn, false, "Connected");
    connectBtn.disabled = true;
    sendBtn.disabled = false;
  }
});

// Send transaction when Send button clicked
sendBtn.addEventListener("click", async () => {
  try {
    setButtonState(sendBtn, true, "Sending...");
    await sendTransaction();
  } catch (err) {
    console.error("❌ Send error:", err);
  } finally {
    setButtonState(sendBtn, false, "Send Transaction");
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

      // 🔁 Retry now on correct network
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

