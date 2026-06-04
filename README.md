# FinShield MLRO: Compliance Officer Training Game

A browser-based, text-first training game that walks players through the life-cycle of a compliance officer and Money Laundering Reporting Officer (MLRO) at a fintech, bank, or financial institution.

## What is included

- A pre-employment interview with compliance Q/A decision points.
- A role hierarchy from candidate to Compliance Analyst, Compliance Officer, Deputy MLRO, MLRO, and Chief Compliance Officer.
- Scenario-based duties covering onboarding, KYC/CDD/EDD, sanctions, transaction monitoring, suspicious activity reporting, training, governance, regulator engagement, and crisis response.
- Decision consequences across integrity, risk control, regulator trust, morale, and budget.
- A regulator inspection scenario requiring evidence, candour, board oversight, and remediation planning.
- A final career outcome that changes based on the player scorecard.

## Where the game files are

The playable game is in this repository folder. You should see these files in the project root:

- `index.html` — the page you open in a browser.
- `game.js` — the scenarios, choices, scoring, role hierarchy, and game logic.
- `styles.css` — the visual styling.
- `README.md` — these instructions.

If your GitHub page or local folder looks empty, check that you are viewing the branch that contains the latest commit, not an empty/default branch. From a terminal inside the repository, run:

```bash
git log --oneline -5
git status --short
find . -maxdepth 1 -type f -not -path './.git/*' -print
```

You should see a commit named `Create FinShield MLRO compliance training web game` and the files above.

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
2. Read the scenario and the **Duties in focus** training notes.
3. Choose one of the decision cards.
4. Watch your role hierarchy, decision scorecard, and career log update.
5. Continue through the interview, onboarding, KYC/EDD, monitoring, SAR/STR, training, regulator, and crisis scenarios.
6. Replay with a different risk appetite to see a different career outcome.
