# Anti-Money Laundering Simulator

A browser-based, real-time, text-first economic simulation game about building a profitable financial business while fighting adaptive illicit finance.

You play as the **Crime Stopper**. This version is intentionally bigger and less restrictive: you can choose a company type, launch revenue-generating operations, hire employees, and use the resulting funds to build an AML / CTF / CPF machine.

## What is included

- A slick tabbed command interface with sub-tabs for operations, products, staffing, and AML controls.
- Multiple playable company profiles, each with different starting budget, revenue, trust, risk multiplier, and unlocked business lines:
  - Community Bank
  - Neobank / Payments Fintech
  - Crypto Exchange
  - Global Trade Bank
  - Online Gaming & Marketplace
- Revenue-generating services, products, and operations such as digital wallets, instant payments, crypto on/off-ramps, trade finance, correspondent banking, gaming wallets, marketplace payouts, treasury yield, cash logistics, and API banking.
- Employee hiring across levels and specialisms:
  - Front-line analysts
  - Sanctions screeners
  - Investigators
  - Crypto forensics specialists
  - Trade-finance investigators
  - Data scientists
  - Compliance managers
  - MLRO / BSA Officer
  - Chief Risk Officer
- AML / CTF / CPF controls across prevention, detection, disruption, and governance.
- Expanded illicit activity map covering:
  - Structuring / smurfing
  - Trade-based money laundering
  - Real estate laundering
  - Cyber laundering and ransomware
  - Drug trafficking proceeds
  - Human trafficking
  - Modern slavery networks
  - Terrorist financing (TF)
  - Proliferation financing (PF)
  - Sanctions evasion
  - Corruption and bribery
  - Mule account networks
  - Front and shell companies
  - Tax crime and invoice fraud
- Adaptive AI that probes the weakest controls and grows more sophisticated as the business scales.
- Persistent browser save/load using `localStorage`.

## Where the game files are

- `index.html` — the tabbed browser UI.
- `game.js` — company profiles, operations, employees, controls, threat simulation, AI adaptation, save/load, and rendering logic.
- `styles.css` — the glassy neon dashboard styling.
- `README.md` — these instructions.

## Run locally

### Option 1: open the HTML file directly

Open `index.html` in a modern browser.

### Option 2: serve the folder locally

From the repository folder, run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## How to play

1. Open the **Company** tab and choose the institution you want to run.
2. Open **Operations** and launch services, products, and operations that generate income every tick.
3. Open **Workforce** and hire employees to increase coverage, seizure rates, trust, and revenue quality.
4. Open **AML Arsenal** and deploy preventive, detection, disruption, and governance controls.
5. Watch **Threat Intel** to see which illicit activity is spiking.
6. Use seized funds to reinvest in lawful growth and AML modernization.
7. Survive to Day 45 with a strong lawful economy, contained Fraud/ML, and public trust intact.

## Keyboard shortcuts

- `Space`: pause or resume the simulation.
- `S`: save the current game state.
- `L`: load the saved game state.

## Design notes

This simulator now forces the player to make the real strategic trade-off: every profitable business line is also an attack surface. You can outspend criminal networks only by building a company that earns enough to fund the controls, people, investigations, and governance required to survive.
