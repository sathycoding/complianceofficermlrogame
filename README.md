# Anti-Money Laundering Simulator

A browser-based, real-time, text-first economic simulation game for learning how anti-money laundering (AML), fraud prevention, and financial-crime controls interact inside a dynamic economy.

You play as the **Crime Stopper** responsible for protecting legitimate revenue while an adaptive AI adversary attempts to launder funds through multiple typologies. The objective is to keep the **Fraud/ML** metric as close to zero as possible, seize illicit funds, and reinvest recovered value into the legitimate economy.

## What is included

- A continuous real-time simulation clock that advances the economy every second.
- Economic metrics for legitimate revenue, operating budget, Fraud/ML, illicit funds, seized funds, public trust, and AI sophistication.
- Adaptive AI pressure that pivots toward the least-protected laundering typology.
- Educational typologies:
  - Structuring / smurfing
  - Trade-based money laundering (TBML)
  - Real estate laundering
  - Cyber laundering
- Deployable countermeasures:
  - Digital transaction monitoring
  - Stricter KYC / enhanced due diligence
  - Financial intelligence task force
  - Trade anomaly analytics
  - Beneficial ownership registry checks
  - Cybercrime disruption unit
  - Research & development lab
  - Public awareness campaign
  - Reinvestment of seized funds
- Persistent browser save/load using `localStorage`.
- Keyboard shortcuts for fast text-based play.

## Where the game files are

The playable game is in this repository folder:

- `index.html` — the browser page and semantic UI structure.
- `game.js` — simulation data, game loop, AI adaptation, state persistence, and rendering logic.
- `styles.css` — the polished dark dashboard styling.
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

1. Click **Start simulation**.
2. Watch the command center: legitimate revenue and budget should grow while Fraud/ML should stay contained.
3. Review **Active laundering typologies** to identify the highest risk and weakest control coverage.
4. Deploy countermeasures from the action panel. Each control has a cost, deployment time, effectiveness, and target typology.
5. Use seized funds to reinvest in legitimate economic capacity.
6. Survive to Day 30 with Fraud/ML below crisis level and public trust intact.

## Keyboard shortcuts

- `1`–`9`: deploy the matching countermeasure card.
- `Space`: pause or resume the simulation.
- `S`: save the current game state.
- `L`: load the saved game state.

## Design notes

The simulator emphasizes AML learning through systems thinking:

- **Prevention** reduces the probability and impact of illicit activity.
- **Detection** increases the chance of disrupting typologies before funds are integrated.
- **Task forces** improve seizures and rapid disruption.
- **R&D** improves intelligence and strengthens deployed controls.
- **AI adaptation** punishes single-control strategies by shifting pressure toward less-protected typologies.
