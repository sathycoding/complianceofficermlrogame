const SAVE_KEY = 'aml-simulator-state-v2';
let TICK_MS = 1000;
const HOURS_PER_TICK = 2;
const WIN_DAY = 45;
const LEGACY_LOSS_THRESHOLD = 160;
const LOSS_FRAUD_THRESHOLD = LEGACY_LOSS_THRESHOLD;

const typologies = [
  {
    id: 'structuring',
    name: 'Structuring (Smurfing)',
    description: 'Cash or transfer values are broken into small transactions to avoid reporting thresholds.',
    basePressure: 1.4,
    growth: 0.05,
    impact: 1.1,
    detection: 30,
    counteredBy: ['monitoring', 'kyc', 'fiu']
  },
  {
    id: 'tbml',
    name: 'Trade-Based Money Laundering',
    description: 'Criminal proceeds move through over-invoicing, under-invoicing, phantom shipments, or mismatched goods.',
    basePressure: 1.0,
    growth: 0.065,
    impact: 1.45,
    detection: 24,
    counteredBy: ['tradeAnalytics', 'fiu', 'rd']
  },
  {
    id: 'realEstate',
    name: 'Real Estate Laundering',
    description: 'Illicit funds are integrated through property purchases, shell companies, nominees, and rapid resales.',
    basePressure: 0.85,
    growth: 0.075,
    impact: 1.6,
    detection: 18,
    counteredBy: ['beneficialOwnership', 'kyc', 'fiu']
  },
  {
    id: 'cyber',
    short: 'Cyber',
    name: 'Cyber Laundering',
    description: 'Crypto rails, mule accounts, online games, and digital platforms obscure source and movement of funds.',
    basePressure: 1.2,
    growth: 0.08,
    impact: 1.35,
    detection: 22,
    counteredBy: ['cyberUnit', 'monitoring', 'rd']
  }
  ,{
    id: 'muleNetworks', short: 'Mules', name: 'Mule Networks', description: 'Recruiters use customers and students as pass-through accounts for scam proceeds.', basePressure: 0.35, growth: 0.018, impact: 0.7, detection: 28, counteredBy: ['monitoring', 'kyc', 'awareness']
  },
  { id: 'sanctionsEvasion', short: 'Sanctions', name: 'Sanctions Evasion', description: 'Restricted parties obscure ownership, routes, and payments to bypass sanctions screening.', basePressure: 0.28, growth: 0.014, impact: 0.9, detection: 21, counteredBy: ['beneficialOwnership', 'tradeAnalytics', 'fiu'] },
  { id: 'proliferationFinancing', short: 'PF', name: 'Proliferation Financing', description: 'Dual-use goods and correspondent channels are abused to finance restricted programmes.', basePressure: 0.22, growth: 0.013, impact: 1.0, detection: 18, counteredBy: ['tradeAnalytics', 'beneficialOwnership', 'fiu'] },
  { id: 'terroristFinancing', short: 'TF', name: 'Terrorist Financing', description: 'Low-value fundraising and charity abuse move funds to violent extremist networks.', basePressure: 0.24, growth: 0.014, impact: 0.95, detection: 23, counteredBy: ['monitoring', 'kyc', 'fiu'] },
  { id: 'humanTrafficking', short: 'HT', name: 'Human Trafficking', description: 'Exploiters launder illicit proceeds through cash-intensive and gig-economy activity.', basePressure: 0.26, growth: 0.016, impact: 0.85, detection: 20, counteredBy: ['monitoring', 'fiu', 'awareness'] },
  { id: 'corruption', short: 'Corruption', name: 'Corruption & Bribery', description: 'Bribe proceeds are layered through PEP associates, shell entities, and luxury assets.', basePressure: 0.25, growth: 0.015, impact: 0.9, detection: 19, counteredBy: ['beneficialOwnership', 'kyc', 'fiu'] },
  { id: 'taxEvasion', short: 'Tax', name: 'Tax Evasion', description: 'Undeclared income is hidden through nominees, offshore structures, and trade mispricing.', basePressure: 0.25, growth: 0.015, impact: 0.75, detection: 25, counteredBy: ['tradeAnalytics', 'beneficialOwnership', 'kyc'] },
  { id: 'predicateFraud', short: 'Fraud', name: 'Predicate Fraud', description: 'Authorised push payment fraud, scams, and identity crime feed laundering pipelines.', basePressure: 0.32, growth: 0.018, impact: 0.82, detection: 26, counteredBy: ['monitoring', 'cyberUnit', 'awareness'] },
  { id: 'cashCourier', short: 'Cash', name: 'Cash Couriers', description: 'Physical cash is moved across borders and reintroduced through deposits or exchanges.', basePressure: 0.22, growth: 0.012, impact: 0.7, detection: 27, counteredBy: ['monitoring', 'kyc', 'fiu'] },
  { id: 'governanceFailure', short: 'Governance', name: 'Governance Failure', description: 'Weak governance, poor escalation, and stale controls let multiple typologies compound.', basePressure: 0.18, growth: 0.011, impact: 0.8, detection: 24, counteredBy: ['rd', 'fiu', 'kyc'] },
  { id: 'hawala', short: 'Hawala', name: 'Informal Value Transfer / Hawala', description: 'Informal brokers net obligations outside formal banking records.', basePressure: 0.24, growth: 0.014, impact: 0.78, detection: 20, counteredBy: ['kyc', 'monitoring', 'fiu'] }

];

const countermeasures = [
  {
    id: 'monitoring',
    title: 'Digital transaction monitoring',
    type: 'Preventive measure',
    detail: 'Rules, scenarios, and anomaly models tuned to velocity, thresholds, and linked accounts.',
    cost: 6500,
    deploymentHours: 8,
    effectiveness: 16,
    targets: ['structuring', 'cyber'],
    revenueDrag: 0.02
  },
  {
    id: 'kyc',
    title: 'Stricter KYC / EDD program',
    type: 'Preventive measure',
    detail: 'Risk-tiered onboarding, source-of-funds checks, adverse media, and periodic reviews.',
    cost: 5200,
    deploymentHours: 6,
    effectiveness: 14,
    targets: ['structuring', 'realEstate'],
    revenueDrag: 0.035
  },
  {
    id: 'fiu',
    title: 'Financial intelligence task force',
    type: 'Task force',
    detail: 'Investigators triage alerts, connect networks, file reports, and seize suspect funds.',
    cost: 7800,
    deploymentHours: 10,
    effectiveness: 18,
    targets: ['structuring', 'tbml', 'realEstate'],
    seizureBoost: 0.2
  },
  {
    id: 'tradeAnalytics',
    title: 'Trade anomaly analytics',
    type: 'Preventive measure',
    detail: 'Compares invoices, routes, goods, and pricing against trade and customs intelligence.',
    cost: 7200,
    deploymentHours: 9,
    effectiveness: 20,
    targets: ['tbml'],
    revenueDrag: 0.015
  },
  {
    id: 'beneficialOwnership',
    title: 'Beneficial ownership registry checks',
    type: 'Preventive measure',
    detail: 'Maps shell companies, nominees, PEP links, and property holding structures.',
    cost: 6100,
    deploymentHours: 7,
    effectiveness: 17,
    targets: ['realEstate'],
    revenueDrag: 0.015
  },
  {
    id: 'cyberUnit',
    title: 'Cybercrime disruption unit',
    type: 'Task force',
    detail: 'Specialists trace wallets, mule networks, compromised accounts, and platform abuse.',
    cost: 8300,
    deploymentHours: 8,
    effectiveness: 21,
    targets: ['cyber'],
    seizureBoost: 0.25
  },
  {
    id: 'rd',
    title: 'Research & development lab',
    type: 'R&D',
    detail: 'Unlocks typology intelligence and improves every deployed control over time.',
    cost: 9500,
    deploymentHours: 12,
    effectiveness: 8,
    targets: ['tbml', 'cyber'],
    globalBoost: 0.08
  },
  {
    id: 'awareness',
    title: 'Public awareness campaign',
    type: 'Preventive measure',
    detail: 'Educates customers and staff about mule recruitment, scams, and reporting red flags.',
    cost: 3600,
    deploymentHours: 4,
    effectiveness: 9,
    targets: ['structuring', 'cyber'],
    revenueDrag: 0.005
  },
  {
    id: 'reinvest',
    title: 'Reinvest seized funds',
    type: 'Capital allocation',
    detail: 'Return recovered money into legitimate programs and increase productive revenue.',
    cost: 0,
    deploymentHours: 2,
    effectiveness: 0,
    targets: [],
    requiresSeizedFunds: true
  }
];

const metricDefinitions = [
  ['legitimateRevenue', 'Legitimate revenue', 'Productive economic output and source of operating budget.'],
  ['budget', 'Budget', 'Available funds for controls, investigations, and R&D.'],
  ['fraudMl', 'Fraud/ML', 'Current illicit activity pressure. Target: zero.'],
  ['illicitFunds', 'Illicit funds', 'Total laundered value that strengthens adversary capability.'],
  ['seizedFunds', 'Seized funds', 'Recovered illicit value available for reinvestment.'],
  ['trust', 'Public trust', 'Confidence in the financial system and your institution.']
];

const initialState = {
  running: false,
  ended: false,
  speed: Number(localStorage.getItem('aml-preferred-speed') || 0.5),
  dailyBriefings: true,
  negativeBudgetDays: 0,
  escapedFunds: 0,
  regulatorRelationship: 62,
  filedStrs: 0,
  lateStrs: 0,
  activeStr: null,
  employees: {},
  elapsedHours: 0,
  legitimateRevenue: 50000,
  budget: 18000,
  fraudMl: 10,
  illicitFunds: 0,
  seizedFunds: 0,
  trust: 72,
  aiSophistication: 1,
  deployments: [],
  controls: {},
  typologyPressure: Object.fromEntries(typologies.map(typology => [typology.id, typology.basePressure])),
  log: ['Welcome, Crime Stopper. Start the simulation to begin real-time monitoring.']
};

let state = structuredClone(initialState);
let loopId = null;

const elements = {
  startButton: document.querySelector('#start-button'),
  pauseButton: document.querySelector('#pause-button'),
  saveButton: document.querySelector('#save-button'),
  loadButton: document.querySelector('#load-button'),
  restartButton: document.querySelector('#restart-button'),
  clockLabel: document.querySelector('#clock-label'),
  statusLabel: document.querySelector('#status-label'),
  threatLabel: document.querySelector('#threat-label'),
  budgetLabel: document.querySelector('#budget-label'),
  metricsGrid: document.querySelector('#metrics-grid'),
  typologyList: document.querySelector('#typology-list'),
  countermeasureList: document.querySelector('#countermeasure-list'),
  intelligenceBrief: document.querySelector('#intelligence-brief'),
  operationsLog: document.querySelector('#operations-log'),
  metricTemplate: document.querySelector('#metric-template'),
  typologyTemplate: document.querySelector('#typology-template'),
  countermeasureTemplate: document.querySelector('#countermeasure-template'),
  modalRoot: document.querySelector('#modal-root'),
  speedSelect: document.querySelector('#speed-select'),
  learnPanel: document.querySelector('#learn-panel')
};

function formatMoney(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatNumber(value) {
  return Math.round(value).toLocaleString();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getDay() {
  return Math.floor(state.elapsedHours / 24) + 1;
}

function getHour() {
  return 8 + (state.elapsedHours % 24);
}

function getActiveControlsFor(typologyId) {
  const globalBoost = state.controls.rd ? state.controls.rd * 0.08 : 0;
  return countermeasures.reduce((sum, countermeasure) => {
    const level = state.controls[countermeasure.id] || 0;
    const typology = typologies.find(item => item.id === typologyId);
    if (!level || (!countermeasure.targets.includes(typologyId) && !typology?.counteredBy.includes(countermeasure.id))) return sum;
    const levelMultiplier = 1 + (level - 1) * 0.35 + globalBoost;
    return sum + countermeasure.effectiveness * levelMultiplier;
  }, 0);
}

function addLog(message, toastType) {
  const stamp = `Day ${getDay()} ${String(getHour()).padStart(2, '0')}:00`;
  state.log.unshift(`${stamp} — ${message}`);
  state.log = state.log.slice(0, 40);
  if (toastType) toast(message, toastType);
}

function ensureLoop() {
  clearInterval(loopId);
  loopId = null;
  if (state.running && !state.ended) loopId = setInterval(tick, TICK_MS / state.speed);
}

function toast(message, type = 'info') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  stack.prepend(el);
  [...stack.children].slice(4).forEach(n => n.remove());
  setTimeout(() => el.remove(), 5000);
}

function showModal(html) {
  state.running = false;
  ensureLoop();
  elements.modalRoot.innerHTML = `<div class="modal-card">${html}</div>`;
  elements.modalRoot.classList.remove('hidden');
}

function hideModal() {
  elements.modalRoot.classList.add('hidden');
  elements.modalRoot.classList.remove('full-screen-modal');
  elements.modalRoot.innerHTML = '';
}

function getTypologyRisk(typology) {
  if (!typology) return 0;
  return clamp((state.typologyPressure[typology.id] || 0) * state.aiSophistication * 7 - getActiveControlsFor(typology.id) * 0.5, 0, 120);
}

function getRegulatorTier() {
  if (state.regulatorRelationship >= 65) return 'Collaborative';
  if (state.regulatorRelationship >= 45) return 'Supervised';
  if (state.regulatorRelationship >= 25) return 'Watchlist';
  return 'Enforcement';
}

function controlsCount() {
  return Object.values(state.controls).reduce((sum, level) => sum + level, 0);
}

function isCorrespondentActive() {
  return true;
}

function calculateThreat() {
  return typologies.reduce((sum, typology) => sum + state.typologyPressure[typology.id], 0) * state.aiSophistication;
}

function calculateRevenueDrag() {
  return countermeasures.reduce((drag, countermeasure) => {
    const level = state.controls[countermeasure.id] || 0;
    return drag + (countermeasure.revenueDrag || 0) * level;
  }, 0);
}

function completeDeployments() {
  state.deployments.forEach(deployment => {
    deployment.remainingHours -= HOURS_PER_TICK;
  });

  const completed = state.deployments.filter(deployment => deployment.remainingHours <= 0);
  state.deployments = state.deployments.filter(deployment => deployment.remainingHours > 0);

  completed.forEach(deployment => {
    const countermeasure = countermeasures.find(item => item.id === deployment.id);
    if (!countermeasure) return;

    if (countermeasure.id === 'reinvest') {
      const amount = deployment.reinvested || 0;
      state.legitimateRevenue += amount * 0.9;
      state.budget += amount * 0.25;
      addLog(`Reinvested ${formatMoney(amount)} in legitimate economic programs.`);
      return;
    }

    state.controls[countermeasure.id] = (state.controls[countermeasure.id] || 0) + 1;
    addLog(`${countermeasure.title} is operational at level ${state.controls[countermeasure.id]}.`);
  });
}

function adaptAi() {
  const leastProtected = typologies
    .map(typology => ({ typology, protection: getActiveControlsFor(typology.id) }))
    .sort((a, b) => a.protection - b.protection)[0];

  if (!leastProtected) return;
  state.typologyPressure[leastProtected.typology.id] += 0.15 * state.aiSophistication;

  if (state.elapsedHours % 24 === 0) {
    state.aiSophistication += 0.05 + state.illicitFunds / 10000000;
    addLog(`Adversaries pivot toward ${leastProtected.typology.name}, the least protected channel.`);
  }
}

function resolveTypology(typology) {
  const pressure = state.typologyPressure[typology.id];
  const controls = getActiveControlsFor(typology.id);
  const detectionChance = clamp((typology.detection + controls - state.aiSophistication * 6) / 100, 0.05, 0.88);
  const attackValue = pressure * typology.impact * state.aiSophistication * 220;

  if (Math.random() < detectionChance) {
    const seizureRate = 0.22 + controls / 500 + getSeizureBoost();
    const seized = attackValue * clamp(seizureRate, 0.12, 0.72);
    state.fraudMl = clamp(state.fraudMl - 0.45 - controls / 70, 0, LOSS_FRAUD_THRESHOLD);
    state.seizedFunds += seized;
    state.trust = clamp(state.trust + 0.08, 0, 100);

    if (Math.random() < 0.18) {
      addLog(`Detected ${typology.name}; seized ${formatMoney(seized)} and disrupted linked accounts.`);
    }
  } else {
    state.fraudMl = clamp(state.fraudMl + pressure * typology.impact * 0.28, 0, 150);
    state.illicitFunds += attackValue;
    state.escapedFunds += attackValue;
    state.legitimateRevenue = Math.max(0, state.legitimateRevenue - attackValue * 0.09);
    state.trust = clamp(state.trust - pressure * 0.04, 0, 100);

    if (Math.random() < 0.16) {
      addLog(`${typology.name} scheme succeeded, adding ${formatMoney(attackValue)} to illicit flows.`);
    }
  }
}

function getSeizureBoost() {
  return countermeasures.reduce((boost, countermeasure) => {
    const level = state.controls[countermeasure.id] || 0;
    return boost + (countermeasure.seizureBoost || 0) * level;
  }, 0);
}


function maybeTriggerStr() {
  if (state.activeStr || state.ended || state.elapsedHours < 12 || !elements.modalRoot.classList.contains('hidden')) return;
  if (state.fraudMl > 35 && Math.random() < 0.025) {
    const top = typologies.map(t => ({ t, risk: getTypologyRisk(t) })).sort((a, b) => b.risk - a.risk)[0].t;
    state.activeStr = { typologyId: top.id, dueHour: state.elapsedHours + 24 };
    showStrModal(top);
  }
}

function showStrModal(typology) {
  showModal(`<h2>STR/SAR Filing Decision</h2><p>Suspicious activity linked to <strong>${typology.name}</strong> requires MLRO review.</p><label><input type="checkbox" class="str-check" /> Customer activity is unusual for expected profile</label><label><input type="checkbox" class="str-check" /> Source or destination appears suspicious</label><label><input type="checkbox" class="str-check" /> Escalation rationale is documented</label><div class="modal-actions"><button type="button" id="file-str-confirm" disabled>File STR/SAR</button><button type="button" id="defer-str">Defer</button></div>`);
  const update = () => { const checks = [...document.querySelectorAll('.str-check')]; document.getElementById('file-str-confirm').disabled = !checks.every(c => c.checked); };
  setTimeout(() => {
    document.querySelectorAll('.str-check').forEach(c => c.addEventListener('change', update));
    document.getElementById('file-str-confirm')?.addEventListener('click', () => fileStr(false));
    document.getElementById('defer-str')?.addEventListener('click', () => { hideModal(); state.running = true; ensureLoop(); render(); });
  }, 0);
}

function fileStr(late) {
  state.filedStrs += 1;
  if (late) state.lateStrs += 1;
  state.trust = clamp(state.trust + 1.5, 0, 100);
  state.regulatorRelationship = clamp(state.regulatorRelationship + (late ? -1 : 2), 0, 100);
  addLog(`STR/SAR filed${late ? ' late' : ''}; regulator notified.`, late ? 'warning' : 'success');
  state.activeStr = null;
  hideModal();
  state.running = true;
  ensureLoop();
  render();
}

function processStrClock() {
  if (state.activeStr && state.elapsedHours >= state.activeStr.dueHour) fileStr(true);
}

function tick() {
  if (!state.running || state.ended) return;

  state.elapsedHours += HOURS_PER_TICK;
  completeDeployments();
  adaptAi();

  const revenueRate = 820 * (1 - calculateRevenueDrag()) * (state.trust / 100);
  const safeRevenueRate = Math.max(120, revenueRate);
  state.legitimateRevenue += safeRevenueRate;
  state.budget += safeRevenueRate * 0.18;
  state.negativeBudgetDays = state.budget < 0 ? state.negativeBudgetDays + HOURS_PER_TICK / 24 : 0;
  dailyBriefing();

  typologies.forEach(typology => {
    state.typologyPressure[typology.id] += typology.growth * state.aiSophistication;
    resolveTypology(typology);
  });
  maybeTriggerStr();
  processStrClock();

  state.fraudMl = clamp(state.fraudMl - Object.values(state.controls).reduce((sum, level) => sum + level, 0) * 0.025, 0, 150);

  if (state.fraudMl >= LOSS_FRAUD_THRESHOLD || state.trust <= 15) {
    endGame(false);
  } else if (getDay() > WIN_DAY && state.fraudMl < 55 && state.trust >= 35 && state.regulatorRelationship >= 25) {
    endGame(true);
  }

  render();
}

function endGame(won) {
  state.running = false;
  state.ended = true;
  clearInterval(loopId);
  loopId = null;
  addLog(won
    ? `Victory: Day ${WIN_DAY} reached with fraud contained and public trust intact.`
    : 'Crisis: Fraud/ML overwhelmed the economy and public trust collapsed.', won ? 'success' : 'critical');
  showScorecard(won);
}

function showScorecard(won) {
  document.body.dataset.endWon = String(won);
  elements.modalRoot.classList.add('full-screen-modal');
  const controls = Object.keys(state.controls).length;
  const stars = won ? Math.min(5, Math.max(3, controls)) : Math.max(1, Math.min(3, controls));
  showModal(`
    <section class="scorecard-${won ? 'won' : 'lost'}">
      <h2>${won ? '✅ Supervisory Cycle Survived' : '🚨 Supervisory Failure'}</h2>
      <p>${won ? 'Fraud/ML remained contained through the cycle.' : 'A loss threshold was reached. Review the final metrics before replaying.'}</p>
      <div class="score-stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</div>
      <table class="score-table"><tr><th>Metric</th><th>Final</th></tr><tr><td>Fraud/ML</td><td>${Math.round(state.fraudMl)} / ${LEGACY_LOSS_THRESHOLD}</td></tr><tr><td>Trust</td><td>${Math.round(state.trust)} / 100</td></tr><tr><td>Budget</td><td>${formatMoney(state.budget)}</td></tr><tr><td>Seized funds</td><td>${formatMoney(state.seizedFunds)}</td></tr></table>
      <div class="modal-actions"><button type="button" id="play-again-button">Play Again</button><button type="button" id="replay-seed-button" class="secondary">Replay with same seed</button></div>
    </section>`);
  setTimeout(() => {
    document.getElementById('play-again-button')?.addEventListener('click', () => { hideModal(); resetSimulation(); });
    document.getElementById('replay-seed-button')?.addEventListener('click', () => { const seed = state.seed || 'aml-2026'; hideModal(); resetSimulation(); document.getElementById('seed-input').value = seed; });
  }, 0);
}

function deployCountermeasure(countermeasure) {
  if (state.ended) return;

  if (countermeasure.requiresSeizedFunds) {
    if (state.seizedFunds < 1000) {
      addLog('Not enough seized funds are available to reinvest.');
      render();
      return;
    }
    const reinvested = Math.min(state.seizedFunds, 6000);
    state.seizedFunds -= reinvested;
    state.deployments.push({ id: countermeasure.id, remainingHours: countermeasure.deploymentHours, reinvested });
    addLog(`Approved reinvestment of ${formatMoney(reinvested)} in legitimate revenue capacity.`);
    render();
    return;
  }

  const currentLevel = state.controls[countermeasure.id] || 0;
  const scaledCost = countermeasure.cost * (1 + currentLevel * 0.45);

  if (state.budget < scaledCost) {
    addLog(`${countermeasure.title} requires ${formatMoney(scaledCost)}, but the budget is only ${formatMoney(state.budget)}.`);
    render();
    return;
  }

  state.budget -= scaledCost;
  state.deployments.push({ id: countermeasure.id, remainingHours: countermeasure.deploymentHours });
  addLog(`Deployment started: ${countermeasure.title} (${countermeasure.deploymentHours} in-game hours).`);
  render();
}

function startSimulation() {
  if (state.ended) state = structuredClone(initialState);
  state.seed = document.getElementById('seed-input')?.value || 'aml-2026';
  state.running = true;
  addLog('Simulation clock started. Revenue, threats, and controls now update continuously.', 'info');
  const savedSpeed = localStorage.getItem('aml-preferred-speed');
  if (savedSpeed) state.speed = Number(savedSpeed);
  ensureLoop();
  render();
}

function pauseSimulation() {
  if (state.ended) return;
  state.running = !state.running;
  addLog(state.running ? 'Simulation resumed.' : 'Simulation paused for strategic review.');
  ensureLoop();
  render();
}

function resetSimulation() {
  clearInterval(loopId);
  loopId = null;
  state = structuredClone(initialState);
  document.body.removeAttribute('data-end-won');
  localStorage.removeItem(SAVE_KEY);
  render();
}

function saveSimulation() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  addLog('Game state saved locally.');
  render();
}

function loadSimulation() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    addLog('No saved game found.');
    render();
    return;
  }

  state = { ...structuredClone(initialState), ...JSON.parse(raw), running: false };
  clearInterval(loopId);
  loopId = null;
  addLog('Saved game loaded and paused.');
  render();
}

function renderMetrics() {
  elements.metricsGrid.innerHTML = '';
  metricDefinitions.forEach(([key, label, help]) => {
    const clone = elements.metricTemplate.content.cloneNode(true);
    clone.querySelector('.metric-label').textContent = label;
    clone.querySelector('.metric-value').textContent = key.includes('Revenue') || key.includes('Funds') || key === 'budget'
      ? formatMoney(state[key])
      : formatNumber(state[key]);
    clone.querySelector('.metric-help').textContent = help;
    elements.metricsGrid.appendChild(clone);
  });
}

function renderTypologies() {
  elements.typologyList.innerHTML = '';
  typologies.forEach(typology => {
    const pressure = state.typologyPressure[typology.id];
    const protection = getActiveControlsFor(typology.id);
    const risk = clamp(pressure * state.aiSophistication * 7 - protection * 0.5, 0, 100);
    const clone = elements.typologyTemplate.content.cloneNode(true);
    clone.querySelector('h3').textContent = typology.name;
    clone.querySelector('.risk-badge').textContent = `${Math.round(risk)} risk`;
    clone.querySelector('.risk-badge').className = `risk-badge ${risk > 65 ? 'danger' : risk > 35 ? 'warning' : 'good'}`;
    clone.querySelector('.typology-description').textContent = typology.description;
    clone.querySelector('.bar span').style.width = `${risk}%`;
    clone.querySelector('dl').innerHTML = `
      <div><dt>AI pressure</dt><dd>${pressure.toFixed(1)}</dd></div>
      <div><dt>Control coverage</dt><dd>${Math.round(protection)}%</dd></div>
      <div><dt>Best counters</dt><dd>${typology.counteredBy.map(formatCounterName).join(', ')}</dd></div>`;
    elements.typologyList.appendChild(clone);
  });
}

function formatCounterName(id) {
  return countermeasures.find(countermeasure => countermeasure.id === id)?.title || id;
}

function renderCountermeasures() {
  elements.countermeasureList.innerHTML = '';
  countermeasures.forEach((countermeasure, index) => {
    const level = state.controls[countermeasure.id] || 0;
    const scaledCost = countermeasure.requiresSeizedFunds ? 0 : countermeasure.cost * (1 + level * 0.45);
    const clone = elements.countermeasureTemplate.content.cloneNode(true);
    const button = clone.querySelector('button');
    clone.querySelector('.countermeasure-title').textContent = `${index + 1}. ${countermeasure.title}`;
    clone.querySelector('.countermeasure-detail').textContent = `${countermeasure.type}: ${countermeasure.detail}`;
    clone.querySelector('.countermeasure-meta').textContent = countermeasure.requiresSeizedFunds
      ? `Uses seized funds · ${countermeasure.deploymentHours}h deployment`
      : `${formatMoney(scaledCost)} · ${countermeasure.deploymentHours}h deployment · Level ${level}`;
    button.disabled = state.ended || (!countermeasure.requiresSeizedFunds && state.budget < scaledCost);
    button.addEventListener('click', () => deployCountermeasure(countermeasure));
    elements.countermeasureList.appendChild(clone);
  });
}

function renderBrief() {
  const leastProtected = typologies
    .map(typology => ({ typology, protection: getActiveControlsFor(typology.id), pressure: state.typologyPressure[typology.id] }))
    .sort((a, b) => b.pressure * state.aiSophistication - b.protection - (a.pressure * state.aiSophistication - a.protection))[0];
  const activeDeployments = state.deployments.length
    ? `<ul>${state.deployments.map(deployment => {
        const countermeasure = countermeasures.find(item => item.id === deployment.id);
        return `<li>${countermeasure.title}: ${Math.max(0, deployment.remainingHours)}h remaining</li>`;
      }).join('')}</ul>`
    : '<p>No deployments are currently in progress.</p>';

  elements.intelligenceBrief.innerHTML = `
    <p><strong>AI adaptation:</strong> Criminal networks exploit the weakest typology coverage and grow more sophisticated each day. Current sophistication is <strong>${state.aiSophistication.toFixed(2)}x</strong>.</p>
    <p><strong>Priority risk:</strong> ${leastProtected.typology.name}. Increase relevant controls or deploy a specialist task force before pressure converts into illicit funds.</p>
    <p><strong>Deployments in progress:</strong></p>
    ${activeDeployments}
    <p class="training-note">Education note: effective AML programs combine prevention (KYC, monitoring), detection (analytics, investigations), disruption (SAR/STR and task forces), and feedback loops (R&D and governance).</p>`;
}


function dailyBriefing() {
  if (!state.dailyBriefings || state.elapsedHours % 24 !== 0 || state.elapsedHours === 0) return;
  state.running = false;
  ensureLoop();
  const top = typologies.map(t => ({ t, risk: getTypologyRisk(t) })).sort((a, b) => b.risk - a.risk).slice(0, 3);
  const recommendation = top[0].t.counteredBy.map(formatCounterName).join(', ');
  const budgetHealth = state.budget < 5000 ? '🔴 Critical' : state.budget < 14000 ? '🟡 Tight' : '🟢 Stable';
  const fraudTrend = state.fraudMl > 80 ? '▲ High — act immediately' : state.fraudMl > 40 ? '→ Moderate — monitor' : '▼ Contained';
  const daysLeft = Math.max(0, WIN_DAY - getDay());
  const winTarget = state.fraudMl < 55 ? '✅ On track' : `❌ Need Fraud/ML below 55 (currently ${Math.round(state.fraudMl)})`;
  showModal(`
    <div class="briefing-card">
      <h2>📋 Daily Briefing — Day ${getDay()} of ${WIN_DAY}</h2>
      <div class="briefing-grid">
        <div class="briefing-stat"><span>Days remaining</span><strong>${daysLeft}</strong></div>
        <div class="briefing-stat"><span>Fraud/ML trend</span><strong>${fraudTrend}</strong></div>
        <div class="briefing-stat"><span>Budget health</span><strong>${budgetHealth}</strong></div>
        <div class="briefing-stat"><span>Win condition</span><strong>${winTarget}</strong></div>
      </div>
      <h3>Top 3 active threats today</h3>
      <ol>${top.map(x => `<li><strong>${x.t.name}</strong> — risk score ${Math.round(x.risk)}</li>`).join('')}</ol>
      <p><strong>Recommended action:</strong> reinforce <em>${top[0].t.name}</em> with ${recommendation}.</p>
      <p><strong>Regulator posture:</strong> ${getRegulatorTier()} (${Math.round(state.regulatorRelationship)}/100)</p>
      <div class="modal-actions"><button type="button" id="resume-briefing">▶ Resume supervision</button><button type="button" id="skip-briefings" class="secondary">Skip future briefings</button></div>
    </div>`);
  setTimeout(() => {
    document.getElementById('resume-briefing')?.addEventListener('click', () => { hideModal(); state.running = true; ensureLoop(); render(); });
    document.getElementById('skip-briefings')?.addEventListener('click', () => { state.dailyBriefings = false; hideModal(); state.running = true; ensureLoop(); render(); });
  }, 0);
}

function renderProgressBars() {
  const fraudPct = Math.min(100, (state.fraudMl / LEGACY_LOSS_THRESHOLD) * 100);
  const trustPct = Math.min(100, state.trust);
  const dayPct = Math.min(100, ((getDay() - 1) / WIN_DAY) * 100);
  const fraudBar = document.getElementById('fraud-ml-bar');
  const trustBar = document.getElementById('trust-bar');
  const dayBar = document.getElementById('day-bar');
  const fraudText = document.getElementById('fraud-ml-text');
  const trustText = document.getElementById('trust-text');
  const dayText = document.getElementById('day-text');
  const fraudItem = document.getElementById('fraud-progress-item');
  if (fraudBar) fraudBar.style.width = fraudPct + '%';
  if (trustBar) trustBar.style.width = trustPct + '%';
  if (dayBar) dayBar.style.width = dayPct + '%';
  if (fraudText) fraudText.textContent = `${Math.round(state.fraudMl)} / ${LEGACY_LOSS_THRESHOLD}`;
  if (trustText) trustText.textContent = `${Math.round(state.trust)} / 100`;
  if (dayText) dayText.textContent = `${getDay()} / ${WIN_DAY}`;
  if (fraudItem) fraudItem.classList.toggle('critical-pulse', state.fraudMl > LEGACY_LOSS_THRESHOLD * 0.75);
}

function renderLossWarnings() {
  const banner = document.getElementById('loss-warning-banner');
  if (!banner) return;
  const warnings = [];
  if (state.fraudMl > LEGACY_LOSS_THRESHOLD * 0.75) warnings.push(`⚠ FRAUD/ML CRITICAL: ${Math.round(state.fraudMl)} / ${LEGACY_LOSS_THRESHOLD} — Deploy controls now`);
  if (state.trust < 20 && getDay() > 20) warnings.push(`⚠ TRUST COLLAPSE IMMINENT: ${Math.round(state.trust)} / 15 threshold`);
  if (state.negativeBudgetDays > 2) warnings.push(`⚠ INSOLVENCY RISK: Budget negative ${state.negativeBudgetDays.toFixed(1)} days`);
  const pfRisk = getTypologyRisk(typologies.find(t => t.id === 'proliferationFinancing'));
  if (pfRisk > 96 && isCorrespondentActive()) warnings.push(`⚠ PF CATASTROPHE RISK: PF risk ${Math.round(pfRisk)} / 120`);
  banner.classList.toggle('hidden', warnings.length === 0);
  banner.textContent = warnings.join('  ·  ');
}

function renderAlertQueue() {
  const el = document.getElementById('alert-queue-panel');
  if (!el) return;
  const pressure = calculateThreat();
  const analysts = Object.values(state.employees).reduce((sum, e) => sum + (e.count || 0), 0) + 1;
  const coverage = Math.max(1, controlsCount() * 10 + analysts * 8);
  const queueTotal = Math.round((pressure * 4) / (analysts + coverage / 30));
  const criticalClass = queueTotal > 150 ? 'danger' : queueTotal > 50 ? 'warning' : '';
  el.innerHTML = `<p>Current queue: <strong class="${criticalClass}">${queueTotal} alerts</strong></p><p>Analysts: ${analysts} · Coverage index: ${Math.round(coverage)}</p><div class="alert-bars">${typologies.map(t => { const risk = getTypologyRisk(t); const pct = Math.min(100, risk); const cls = risk > 65 ? 'danger-fill' : risk > 35 ? 'warning-fill' : 'good-fill'; return `<div class="alert-row"><span>${t.short || t.name}</span><div><i class="${cls}" style="width:${pct}%"></i></div><b>${Math.round(risk)}</b></div>`; }).join('')}</div>${queueTotal > 150 ? '<p class="danger">⚠ BACKLOG CRITICAL — hire staff or deploy controls</p>' : ''}`;
}

function renderRegulatorTrajectory() {
  const el = document.getElementById('regulator-trajectory');
  if (!el) return;
  const tier = getRegulatorTier();
  const downgradeRisk = state.fraudMl > 80 ? 'High' : state.fraudMl > 40 ? 'Moderate' : 'Low';
  el.innerHTML = `<p>Current posture: <strong>${tier}</strong> (${Math.round(state.regulatorRelationship)}/100)</p><p>Downgrade risk: <strong>${downgradeRisk}</strong></p><div class="tier-steps">${['Enforcement','Watchlist','Supervised','Collaborative'].map(t => `<span class="${t === tier ? 'active' : ''}">${t}</span>`).join('')}</div><p class="muted">Collaborative ≥ 65 · Supervised 45–64 · Watchlist 25–44 · Enforcement &lt; 25</p>`;
}

function renderStrTracker() {
  const el = document.getElementById('str-tracker');
  if (!el) return;
  const lateRate = state.filedStrs > 0 ? Math.round((state.lateStrs / state.filedStrs) * 100) : 0;
  const clockRemaining = state.activeStr ? Math.max(0, state.activeStr.dueHour - state.elapsedHours) : null;
  el.innerHTML = `<p>Filed: <strong>${state.filedStrs}</strong> · Late: <strong>${state.lateStrs}</strong> · Late rate: <strong>${lateRate}%</strong></p>${clockRemaining !== null ? `<p class="warning">⏱ STR CLOCK ACTIVE — ${clockRemaining}h remaining</p>` : '<p class="muted">No active STR clock.</p>'}`;
}

function renderSeizureSummary() {
  const el = document.getElementById('seizure-summary');
  if (!el) return;
  const total = state.seizedFunds + state.escapedFunds;
  const rate = total > 0 ? Math.round((state.seizedFunds / total) * 100) : 0;
  el.innerHTML = `<p>Seized: <strong class="good-text">${formatMoney(state.seizedFunds)}</strong></p><p>Escaped: <strong class="danger-text">${formatMoney(state.escapedFunds)}</strong></p><p>Recovery rate: <strong>${rate}%</strong>${rate > 60 ? ' 🏆' : ''}</p><div class="split-bar"><span style="width:${rate}%"></span><i style="width:${100-rate}%"></i></div>`;
}

function renderSupportingPanels() {
  const riskProfile = document.getElementById('risk-profile');
  if (riskProfile) riskProfile.innerHTML = `<p>Fraud/ML ${Math.round(state.fraudMl)} / ${LEGACY_LOSS_THRESHOLD}; AI sophistication ${state.aiSophistication.toFixed(2)}x.</p>`;
  document.getElementById('risk-appetite').innerHTML = '<p>Risk appetite: keep Fraud/ML below 55 by cycle end.</p>';
  document.getElementById('customer-book').innerHTML = '<p>Customer book: retail, digital assets, trade, property, and correspondent activity.</p>';
  document.getElementById('peer-benchmark').innerHTML = '<p>Peer benchmark: stable peers keep Fraud/ML below 45 and trust above 65.</p>';
  document.getElementById('budget-forecast').innerHTML = `<p>Budget ${formatMoney(state.budget)}. Revenue drag ${(calculateRevenueDrag() * 100).toFixed(1)}%.</p>`;
  document.getElementById('plan-panel').innerHTML = '<ol><li>Deploy controls for the top risk typology.</li><li>Preserve trust and budget.</li><li>Reinvest seized funds when available.</li></ol>';
  document.getElementById('case-room').innerHTML = `<article class="case-card"><h3>Priority typology review</h3><p>${Math.round(calculateThreat() * 2)} alerts awaiting triage.</p><button type="button">Assign analyst</button></article>`;
  document.getElementById('technology-panel').innerHTML = '<p>Technology upgrades are represented by transaction monitoring, analytics, cyber unit, and R&D controls.</p>';
  document.getElementById('staff-panel').innerHTML = '<p>Staff capacity is abstracted into the FIU and specialist controls in this training build.</p>';
  document.getElementById('regulatory-banner').innerHTML = `<p>Regulator posture: <strong>${getRegulatorTier()}</strong></p>`;
  document.getElementById('money-flow').innerHTML = `<p>Illicit escaped ${formatMoney(state.escapedFunds)} · Seized ${formatMoney(state.seizedFunds)}</p>`;
  document.getElementById('stage-flow').innerHTML = '<p>Placement → Layering → Integration: controls reduce pressure before integration succeeds.</p>';
  document.getElementById('incident-feed').innerHTML = state.log.slice(0, 8).map(x => `<li>${x}</li>`).join('');
  document.getElementById('actor-profiles').innerHTML = typologies.slice(0, 6).map(t => `<article class="learn-card"><h3>${t.name}</h3><p>${t.description}</p></article>`).join('');
  document.getElementById('darkweb-feed').innerHTML = typologies.slice(0, 5).map(t => `<article class="learn-card"><p>████ chatter indicates ${t.name} pressure.</p></article>`).join('');
  document.getElementById('history-chart').innerHTML = '<p>History chart begins after the simulation has run.</p>';
  document.getElementById('predicate-map').innerHTML = '<p>Predicate offences link fraud, corruption, trafficking, tax evasion, sanctions, and terror financing to laundering typologies.</p>';
  document.getElementById('predicate-map-learn').innerHTML = document.getElementById('predicate-map').innerHTML;
  document.getElementById('world-map').innerHTML = '<p>Geopolitical risk: trade, correspondent, sanctions, and informal value transfer corridors.</p>';
  document.getElementById('corridor-tracker').innerHTML = '<p>Corridors monitored: Gulf-Europe, US-Europe, cash courier routes, and informal value transfer networks.</p>';
  document.getElementById('correspondent-registry').innerHTML = '<p>Correspondent registry active; proliferation financing warnings use this exposure.</p>';
  document.getElementById('govern-actions').innerHTML = '<p>Board escalation, QA review, and policy refreshes support regulator confidence.</p>';
  document.getElementById('compliance-calendar').innerHTML = `<p>Day ${getDay()} of ${WIN_DAY}; next daily briefing at 08:00.</p>`;
  document.getElementById('policy-library').innerHTML = '<p>KYC, monitoring, STR escalation, sanctions/PF, and FIU policies.</p>';
  document.getElementById('policy-library-full').innerHTML = document.getElementById('policy-library').innerHTML;
  document.getElementById('leaderboard').innerHTML = '<p>Training leaderboard persists locally.</p>';
  document.getElementById('competitive-board').innerHTML = '<p>Your institution is benchmarked against a stable peer profile.</p>';
  document.getElementById('career-panel').innerHTML = '<p>Save completed runs to build career statistics.</p>';
}

function renderLearn() {
  const query = (document.getElementById('learn-search-input')?.value || '').toLowerCase();
  const filtered = query ? typologies.filter(t => (t.name + t.description + (t.short || '')).toLowerCase().includes(query)) : typologies;
  elements.learnPanel.innerHTML = filtered.map(t => `<article class="learn-card"><h3>${t.name}</h3><p><strong>What it is:</strong> ${t.description}</p><p><strong>Best controls:</strong> ${t.counteredBy.map(formatCounterName).join(', ')}</p></article>`).join('') || '<p>No typologies match that search.</p>';
}

function renderSpeedDock() {
  document.querySelectorAll('.speed-btn[data-speed]').forEach(btn => btn.classList.toggle('active', Number(btn.dataset.speed) === state.speed));
  const pauseBtn = document.getElementById('dock-pause-btn');
  if (pauseBtn) pauseBtn.textContent = state.running ? '⏸' : '▶';
  if (elements.speedSelect) elements.speedSelect.value = String(state.speed);
}

function renderLog() {

  elements.operationsLog.innerHTML = '';
  state.log.forEach(entry => {
    const item = document.createElement('li');
    item.textContent = entry;
    elements.operationsLog.appendChild(item);
  });
}

function render() {
  const day = getDay();
  const hour = getHour() % 24;
  const threat = calculateThreat();

  elements.clockLabel.textContent = `Day ${day} of ${WIN_DAY} · ${String(hour).padStart(2, '0')}:00`;
  elements.statusLabel.textContent = state.ended ? 'Ended' : state.running ? 'Live' : 'Paused';
  elements.threatLabel.textContent = `AI pressure: ${threat > 35 ? 'High' : threat > 20 ? 'Medium' : 'Low'}`;
  elements.budgetLabel.textContent = `Budget ${formatMoney(state.budget)}`;
  elements.startButton.disabled = state.running && !state.ended;
  elements.pauseButton.textContent = state.running ? 'Pause' : 'Resume';

  renderProgressBars();
  renderLossWarnings();
  renderSpeedDock();
  renderMetrics();
  renderTypologies();
  renderCountermeasures();
  renderBrief();
  renderAlertQueue();
  renderRegulatorTrajectory();
  renderStrTracker();
  renderSeizureSummary();
  renderSupportingPanels();
  renderLearn();
  renderLog();
}

function showShortcutsModal() {
  showModal(`<h2>Keyboard Shortcuts</h2><table class="shortcut-table"><tr><td>Space / A</td><td>Pause / Analysis Mode</td></tr><tr><td>S / L</td><td>Save / Load</td></tr><tr><td>1–9</td><td>Deploy countermeasure</td></tr><tr><td>C/T/I/W/G</td><td>Jump tabs</td></tr><tr><td>?</td><td>This panel</td></tr></table><div class="modal-actions"><button type="button" onclick="hideModal()">Close</button></div>`);
}

function activateTab(tabName) {
  document.querySelectorAll('.tab,.tab-panel').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  document.querySelector(`#tab-${tabName}`)?.classList.add('active');
}

function handleKeyboard(event) {
  if (event.code === 'Space') {
    event.preventDefault();
    pauseSimulation();
    return;
  }

  if (event.target.matches('input,select,textarea')) return;
  if (event.key.toLowerCase() === 'a') { pauseSimulation(); return; }
  if (event.key.toLowerCase() === 's') { saveSimulation(); return; }
  if (event.key.toLowerCase() === 'l') { loadSimulation(); return; }
  if (event.key === '?') { showShortcutsModal(); return; }
  const tabJumps = { c: 'command', t: 'threats', i: 'intel', w: 'world', g: 'govern' };
  const jumpTab = tabJumps[event.key.toLowerCase()];
  if (jumpTab) { activateTab(jumpTab); return; }

  const index = Number(event.key) - 1;
  if (Number.isInteger(index) && countermeasures[index]) {
    deployCountermeasure(countermeasures[index]);
  }
}

elements.startButton.addEventListener('click', startSimulation);
elements.pauseButton.addEventListener('click', pauseSimulation);
elements.saveButton.addEventListener('click', saveSimulation);
elements.loadButton.addEventListener('click', loadSimulation);
elements.restartButton.addEventListener('click', resetSimulation);
elements.speedSelect?.addEventListener('change', () => { state.speed = Number(elements.speedSelect.value); localStorage.setItem('aml-preferred-speed', String(state.speed)); ensureLoop(); renderSpeedDock(); });
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => activateTab(tab.dataset.tab)));
document.querySelectorAll('.subtab').forEach(tab => tab.addEventListener('click', () => {
  const container = tab.closest('.tab-panel');
  container.querySelectorAll('.subtab,.subtab-panel').forEach(el => el.classList.remove('active'));
  tab.classList.add('active');
  container.querySelector(`#subtab-${tab.dataset.subtab}`)?.classList.add('active');
}));
document.querySelectorAll('.speed-btn[data-speed]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.speed = Number(btn.dataset.speed);
    localStorage.setItem('aml-preferred-speed', String(state.speed));
    if (elements.speedSelect) elements.speedSelect.value = String(state.speed);
    ensureLoop();
    renderSpeedDock();
  });
});
document.getElementById('dock-pause-btn')?.addEventListener('click', pauseSimulation);
document.getElementById('learn-search-input')?.addEventListener('input', renderLearn);
document.addEventListener('keydown', handleKeyboard);
render();
