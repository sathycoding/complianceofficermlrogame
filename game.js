const SAVE_KEY = 'aml-simulator-state-v1';
const TICK_MS = 1000;
const HOURS_PER_TICK = 2;
const WIN_DAY = 30;
const LOSS_FRAUD_THRESHOLD = 100;

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
    name: 'Cyber Laundering',
    description: 'Crypto rails, mule accounts, online games, and digital platforms obscure source and movement of funds.',
    basePressure: 1.2,
    growth: 0.08,
    impact: 1.35,
    detection: 22,
    counteredBy: ['cyberUnit', 'monitoring', 'rd']
  }
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
  countermeasureTemplate: document.querySelector('#countermeasure-template')
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
    if (!level || !countermeasure.targets.includes(typologyId)) return sum;
    const levelMultiplier = 1 + (level - 1) * 0.35 + globalBoost;
    return sum + countermeasure.effectiveness * levelMultiplier;
  }, 0);
}

function addLog(message) {
  const stamp = `Day ${getDay()} ${String(getHour()).padStart(2, '0')}:00`;
  state.log.unshift(`${stamp} — ${message}`);
  state.log = state.log.slice(0, 14);
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

function tick() {
  if (!state.running || state.ended) return;

  state.elapsedHours += HOURS_PER_TICK;
  completeDeployments();
  adaptAi();

  const revenueRate = 820 * (1 - calculateRevenueDrag()) * (state.trust / 100);
  const safeRevenueRate = Math.max(120, revenueRate);
  state.legitimateRevenue += safeRevenueRate;
  state.budget += safeRevenueRate * 0.18;

  typologies.forEach(typology => {
    state.typologyPressure[typology.id] += typology.growth * state.aiSophistication;
    resolveTypology(typology);
  });

  state.fraudMl = clamp(state.fraudMl - Object.values(state.controls).reduce((sum, level) => sum + level, 0) * 0.025, 0, 150);

  if (state.fraudMl >= LOSS_FRAUD_THRESHOLD || state.trust <= 5) {
    endGame(false);
  } else if (getDay() > WIN_DAY && state.fraudMl < 35 && state.trust >= 45) {
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
    ? 'Victory: Day 30 reached with fraud contained and public trust intact.'
    : 'Crisis: Fraud/ML overwhelmed the economy and public trust collapsed.');
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
  state.running = true;
  addLog('Simulation clock started. Revenue, threats, and controls now update continuously.');
  if (!loopId) loopId = setInterval(tick, TICK_MS);
  render();
}

function pauseSimulation() {
  state.running = !state.running;
  addLog(state.running ? 'Simulation resumed.' : 'Simulation paused for strategic review.');
  if (state.running && !loopId) loopId = setInterval(tick, TICK_MS);
  render();
}

function resetSimulation() {
  clearInterval(loopId);
  loopId = null;
  state = structuredClone(initialState);
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

  elements.clockLabel.textContent = `Day ${day} · ${String(hour).padStart(2, '0')}:00`;
  elements.statusLabel.textContent = state.ended ? 'Ended' : state.running ? 'Live' : 'Paused';
  elements.threatLabel.textContent = `AI pressure: ${threat > 35 ? 'High' : threat > 20 ? 'Medium' : 'Low'}`;
  elements.budgetLabel.textContent = `Budget ${formatMoney(state.budget)}`;
  elements.startButton.disabled = state.running && !state.ended;
  elements.pauseButton.textContent = state.running ? 'Pause' : 'Resume';

  renderMetrics();
  renderTypologies();
  renderCountermeasures();
  renderBrief();
  renderLog();
}

function handleKeyboard(event) {
  if (event.code === 'Space') {
    event.preventDefault();
    pauseSimulation();
    return;
  }

  if (event.key.toLowerCase() === 's') saveSimulation();
  if (event.key.toLowerCase() === 'l') loadSimulation();

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
document.addEventListener('keydown', handleKeyboard);
render();
