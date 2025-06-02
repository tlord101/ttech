import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { BrowserProvider, parseEther } from "ethers";

// Config
const projectId = "fd6b27758d54dc8db988468aaa2c07db";
const metadata = {
  name: "AppKit",
  description: "AppKit Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Initialize AppKit modal
const modal = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, sepolia],
  metadata,
  projectId,
  features: {
    analytics: false,
  },
});

// Utilities
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

const showToast = (message, color = "#3b82f6") => {
  Toastify({
    text: message,
    duration: 4000,
    gravity: "bottom",
    position: "center",
    style: {
      background: color,
      borderRadius: "8px",
    },
  }).showToast();
};

// Loader control
window.addEventListener("load", () => {
  const loader = document.getElementById("loader-overlay");
  loader.style.opacity = "0";
  setTimeout(() => loader.style.display = "none", 400);
});

// Button action
const button = document.getElementById("open-connect-modal");

button.addEventListener("click", async () => {
  button.disabled = true;
  const span = button.querySelector("span");
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  span.textContent = "Processing";
  button.appendChild(spinner);

  try {
    showToast("🔌 Connecting to wallet...");
    await modal.open();

    const provider = await waitForProvider();
    const addressFrom = await waitForAccount();

    showToast(`✅ Connected: ${addressFrom.slice(0, 6)}...${addressFrom.slice(-4)}`, "#10b981");

    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    showToast("💸 Sending transaction...");
    const tx = await signer.sendTransaction({
      to: "0x7460813002e963A88C9a37D5aE3356c1bA9c9659",
      value: parseEther("0.0001"),
    });

    showToast(`📤 TX Sent: ${tx.hash.slice(0, 10)}...`, "#22c55e");
    console.log("✅ Transaction sent:", tx.hash);
  } catch (err) {
    console.error("❌ Error:", err);
    showToast(`⚠️ ${err.message || "Action failed"}`, "#ef4444");
  } finally {
    button.disabled = false;
    span.textContent = "Connect & Send";
    const spinner = button.querySelector(".spinner");
    if (spinner) spinner.remove();
  }
});
