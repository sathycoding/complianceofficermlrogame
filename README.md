# Compliance Empire

A browser-based, text-first strategy-management game about Compliance, AML, Risk, Governance, Fraud, and Financial Crime. It is designed to be fun first and educational second: the player is not choosing a single correct training answer, but surviving pressure from criminals, regulators, executives, investors, customers, employees, media, and the board.

## What is included

- A career ladder from Junior Compliance Analyst to Compliance Officer, Deputy MLRO, MLRO, Head of Compliance, CCO, Group MLRO, Regulator, and Compliance Consultancy Owner.
- Institution selection across Retail Bank, Crypto Exchange, Investment Firm, Money Service Business, FinTech, and Casino, each with different revenue, budget, risk, and typology pressure.
- A strategy loop where information creates decisions, decisions change hidden systems, hidden systems create future events, and future events reference old decisions.
- A long-term memory engine that stores major investigations, onboarding decisions, SAR choices, board reports, CPD, expansion moves, employee events, and delayed consequences.
- A dynamic consequence engine covering regulatory trust, board confidence, employee morale, financial performance, customer satisfaction, operational efficiency, crime exposure, reputation, backlog, findings, and whistleblower risk.
- Mini investigation gameplay: review transactions, review KYC, review source of wealth, interview relationship managers, request documentation, then decide whether to close, escalate, freeze, file SAR, remediate, or compromise.
- Criminal adaptation across structuring, trade-based money laundering, sanctions evasion, crypto mixing, mule networks, shell companies, terrorist financing, human trafficking, corruption, and bribery.
- Individual employee characters with skill, productivity, stress, morale, traits, burnout, resignation, and whistleblower-style events.
- Board politics with directors who have different personalities: growth-oriented CEO, aggressive investor, former regulator, former banker, and audit committee chair.
- Global jurisdiction expansion for the United States, United Kingdom, European Union, UAE, Bahrain, Singapore, and Hong Kong, each adding local reporting and sanctions complexity.
- CPD, certification, conference, and knowledge-tree systems across AML, Fraud, Compliance, Risk, Governance, Crypto, and Sanctions branches that unlock actual strategic capability.
- Technology and budget decisions for advanced screening, AI alert triage, blockchain analytics, case management, and automated KYC.
- KPI dashboard, risk heat map, regulator trust, reputation, revenue, risk exposure, customer satisfaction, employee morale, board confidence, SARs, findings, media pressure, achievements, and historical memory.

## Design philosophy

The game should create stories like:

> “I approved a customer in 2026, ignored an analyst warning in 2027, lost an investigator in 2028, received a whistleblower complaint in 2029, and faced enforcement in 2030 because of decisions I made years ago.”

No action is universally correct. Rejecting a risky client may improve regulatory trust and reduce crime exposure, but it can damage revenue, customer growth, and board support. Approving growth may save the quarter and create a scandal years later.

## Where the game files are

The playable game is in this repository folder. You should see these files in the project root:

- `index.html` — the page you open in a browser.
- `game.js` — the strategy systems, scenarios, state, hidden memory, criminal adaptation, employees, board politics, jurisdictions, CPD, choices, scoring, and rendering.
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
2. Choose an institution type. This changes starting budget, revenue, risk exposure, and criminal typology pressure.
3. Pass the interview by choosing how you will balance growth, controls, and independence.
4. Use the command briefing to open investigations, manage employees, buy controls, review customers, manage board/global strategy, end the day, or complete monthly board reporting.
5. In investigations, collect evidence first if you want a more defensible decision. Each action costs time, budget, and capacity.
6. Watch hidden and visible systems evolve: risk heat map, criminal adaptation, employees, board relationships, media, delayed consequences, and long-term memory.
7. Attend conferences and training to maintain CPD, unlock certifications, and grow knowledge-tree capabilities.
8. Expand into new jurisdictions only when you can handle extra regulatory complexity.
9. Replay with a different institution or risk appetite to generate a different compliance empire story.
