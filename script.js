// ================================
// SAFE DOM HELPER
// ================================
function safeSet(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

// ================================
// LOAD DASHBOARD (REAL → DEMO FALLBACK)
// ================================
async function loadDashboard() {
  // ---- SOL PRICE (always works) ----
  try {
    const priceRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    );
    const priceData = await priceRes.json();
    safeSet("solPrice", `$${priceData.solana.usd}`);
  } catch {
    safeSet("solPrice", "$—");
  }

  // ---- TRY REAL SOLANA DATA ----
  try {
    const { Connection, clusterApiUrl } = solanaWeb3;
    const connection = new Connection(clusterApiUrl("mainnet-beta"));

    const supply = await connection.getSupply();
    safeSet(
      "totalSupply",
      Number(supply.value.total / 1e9).toLocaleString() + " SOL"
    );

    const slot = await connection.getSlot();
    safeSet("currentSlot", slot.toLocaleString());

    const epoch = await connection.getEpochInfo();
    safeSet("epoch", epoch.epoch);

    const perf = await connection.getRecentPerformanceSamples(1);
    if (perf.length) {
      const tps = Math.round(
        perf[0].numTransactions / perf[0].samplePeriodSecs
      );
      safeSet("tps", `${tps} TPS`);
    } else {
      throw new Error("No perf data");
    }

    return; // ✅ real data loaded, stop here
  } catch (err) {
    console.warn("RPC blocked — using demo data");
  }

  // ---- DEMO FALLBACK (ALWAYS SHOWS DATA) ----
  safeSet("totalSupply", "589,000,000 SOL");
  safeSet("currentSlot", "256,814,902");
  safeSet("epoch", "621");
  safeSet("tps", "3,200 TPS");

  // Optional demo hint
  const hint = document.createElement("div");
  hint.style.fontSize = "12px";
  hint.style.color = "#9ca3af";
  hint.style.marginTop = "8px";
  hint.innerText =
    "Demo data shown due to browser RPC limitations.";
  document
    .getElementById("tps")
    ?.parentElement.appendChild(hint);
}

// ================================
// RUN AFTER PAGE LOAD
// ================================
window.addEventListener("load", () => {
  loadDashboard();
});let wallet = null;

const connectBtn = document.getElementById("connectBtn");

if (connectBtn) {
  connectBtn.onclick = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      alert("Phantom Wallet not found. Install Phantom first.");
      return;
    }

    try {
      const resp = await window.solana.connect();
      wallet = resp.publicKey.toString();
      connectBtn.innerText = wallet.slice(0, 4) + "..." + wallet.slice(-4);
    } catch (err) {
      console.error(err);
    }
  };
}