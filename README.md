# Compliance Officer / MLRO Simulator

A browser-based, text-first management and investigation simulator where the player starts as a junior compliance analyst and progresses through a full compliance/MLRO career.

## What is included

- A career ladder from Junior Compliance Analyst to Compliance Officer, Deputy MLRO, MLRO, Head of Compliance, CCO, Group MLRO, Regulator, and Compliance Consultancy Owner.
- Institution selection across Retail Bank, Crypto Exchange, Investment Firm, Money Service Business, FinTech, and Casino, each with different revenue, budget, risk, and typology pressure.
- A daily management loop: alerts, customer reviews, investigations, employee management, regulatory requests, controls, board reporting, end day, and KPI review.
- A customer database review system with customer profiles, source of wealth, source of funds, corporate structures, linked entities, adverse media, and hidden risk variables.
- Investigation-board gameplay using evidence chips for passports, corporate registries, blockchain wallets, adverse media, transaction patterns, and regulator requests.
- Transaction monitoring and MLRO decision scenarios covering structuring, PEP changes, missed SARs, sanctions updates, crypto mixers, fraud victims, correspondent banking, laundering networks, and board pressure.
- Employee management with hiring, team skills, traits, morale, stress, training courses, certifications, and workload effects.
- Technology and budget decisions for advanced screening, AI alert triage, blockchain analytics, case management, and automated KYC.
- KPI dashboard, risk heat map, regulator trust, reputation, revenue, risk exposure, customer satisfaction, employee morale, board confidence, SARs, findings, and achievements.
- A hidden financial-crime ecosystem that grows with risk, revenue, institution type, backlogs, and control maturity.

## Where the game files are

The playable game is in this repository folder. You should see these files in the project root:

- `index.html` — the page you open in a browser.
- `game.js` — the scenarios, choices, scoring, career progression, employees, controls, and game logic.
- `styles.css` — the visual styling.
- `README.md` — these instructions.

If your GitHub page or local folder looks empty, check that you are viewing the branch that contains the latest commit, not an empty/default branch. From a terminal inside the repository, run:

```bash
git log --oneline -5
git status --short
find . -maxdepth 1 -type f -not -path './.git/*' -print
```

## Run locally

### Option 1: open the HTML file directly

Open `index.html` in a browser. This is the quickest way to play.

### Option 2: serve the folder locally

From the repository folder, run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## How to play

1. Click **Start new career**.
2. Choose an institution type. This changes the starting budget, revenue, risk exposure, and typology pressure.
3. Pass the interview by choosing how you will balance growth and controls.
4. Use the daily command briefing to open cases, manage employees, buy controls, review customer files, or end the day.
5. In cases, read the scenario, inspect the investigation-board evidence, review the training concepts, and choose a decision.
6. Watch the KPI dashboard, risk heat map, queues, team roster, controls, achievements, and career log update after every decision.
7. Every fifth day, complete monthly board reporting.
8. Progress through the career ladder by gaining XP from good investigations, training, governance, reporting, and strategic decisions.
9. Replay with a different institution or risk appetite to discover different outcomes.
