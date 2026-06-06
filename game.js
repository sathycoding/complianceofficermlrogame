const SAVE_KEY = 'aml-simulator-state-v2';
const TICK_MS = 1000;
const HOURS_PER_TICK = 2;
const WIN_DAY = 45;
const LOSS_FRAUD_THRESHOLD = 160;

const companyProfiles = [
  {
    id: 'communityBank',
    name: 'Community Bank',
    kicker: 'Deposits · lending · branches',
    detail: 'Stable public trust and branch deposits, but exposed to cash, lending fraud, elder exploitation, and local organized crime.',
    budget: 32000,
    revenue: 65000,
    trust: 78,
    riskMultiplier: 0.88,
    incomeMultiplier: 0.95,
    unlocks: ['deposits', 'lending', 'branchNetwork', 'wealth', 'cards', 'cashOps']
  },
  {
    id: 'neobank',
    name: 'Neobank / Payments Fintech',
    kicker: 'Wallets · cards · instant payments',
    detail: 'Explosive growth, fast onboarding, high mule-account pressure, cyber scams, sanctions-screening load, and social-engineering fraud.',
    budget: 42000,
    revenue: 58000,
    trust: 70,
    riskMultiplier: 1.15,
    incomeMultiplier: 1.18,
    unlocks: ['wallets', 'cards', 'instantPayments', 'merchantAcquiring', 'cryptoGateway', 'apiBanking']
  },
  {
    id: 'cryptoExchange',
    name: 'Crypto Exchange',
    kicker: 'Crypto · DeFi · custody',
    detail: 'High upside and high danger: ransomware cash-outs, mixers, sanctions evasion, chain-hopping, darknet markets, and terrorist financing.',
    budget: 52000,
    revenue: 72000,
    trust: 62,
    riskMultiplier: 1.38,
    incomeMultiplier: 1.34,
    unlocks: ['cryptoGateway', 'custody', 'defiDesk', 'stablecoins', 'apiBanking', 'merchantAcquiring']
  },
  {
    id: 'tradeBank',
    name: 'Global Trade Bank',
    kicker: 'Trade finance · FX · correspondent banking',
    detail: 'Deep pockets and serious exposure to TBML, sanctions evasion, proliferation financing, corruption, and complex ownership structures.',
    budget: 66000,
    revenue: 92000,
    trust: 74,
    riskMultiplier: 1.22,
    incomeMultiplier: 1.42,
    unlocks: ['tradeFinance', 'fx', 'correspondent', 'wealth', 'lending', 'treasury']
  },
  {
    id: 'gamingPlatform',
    name: 'Online Gaming & Marketplace',
    kicker: 'Skins · wallets · creators',
    detail: 'A slick digital platform where criminals can exploit prepaid value, synthetic identities, youth safety, mule accounts, and trafficking signals.',
    budget: 36000,
    revenue: 61000,
    trust: 68,
    riskMultiplier: 1.18,
    incomeMultiplier: 1.24,
    unlocks: ['gamingWallets', 'marketplace', 'creatorPayouts', 'instantPayments', 'cards', 'apiBanking']
  }
];

const ventures = [
  { id: 'deposits', category: 'services', title: 'Retail deposit accounts', kicker: 'Core service', detail: 'Low-margin deposits generate reliable funding and alert volume.', cost: 8000, income: 1050, risk: { structuring: 0.12, drugTrafficking: 0.06 }, complianceNeed: 0.05 },
  { id: 'wallets', category: 'services', title: 'Digital wallets', kicker: 'Core service', detail: 'Fast wallet onboarding produces scale and mule-account risk.', cost: 9500, income: 1600, risk: { muleNetworks: 0.18, cyberFraud: 0.12, humanTrafficking: 0.04 }, complianceNeed: 0.08 },
  { id: 'cards', category: 'products', title: 'Prepaid & debit cards', kicker: 'Product', detail: 'Card velocity creates interchange revenue and placement/layering typologies.', cost: 7600, income: 1250, risk: { structuring: 0.1, drugTrafficking: 0.08, muleNetworks: 0.08 }, complianceNeed: 0.06 },
  { id: 'instantPayments', category: 'products', title: 'Instant payments rail', kicker: 'Product', detail: 'Real-time payments excite customers and fraudsters equally.', cost: 11000, income: 2100, risk: { cyberFraud: 0.2, muleNetworks: 0.16, terroristFinancing: 0.04 }, complianceNeed: 0.1 },
  { id: 'merchantAcquiring', category: 'services', title: 'Merchant acquiring', kicker: 'Service', detail: 'Onboard merchants, capture fees, and detect front businesses.', cost: 13000, income: 2400, risk: { frontCompanies: 0.18, taxCrime: 0.08, humanTrafficking: 0.04 }, complianceNeed: 0.1 },
  { id: 'cryptoGateway', category: 'products', title: 'Crypto on/off-ramp', kicker: 'Product', detail: 'High growth, high volatility: ransomware, sanctions, darknet, mixers, and scams.', cost: 17000, income: 3300, risk: { cyberFraud: 0.18, sanctionsEvasion: 0.16, terroristFinancing: 0.08, drugTrafficking: 0.08 }, complianceNeed: 0.16 },
  { id: 'custody', category: 'services', title: 'Digital asset custody', kicker: 'Premium service', detail: 'Custody attracts institutions and high-value bad actors hiding beneficial ownership.', cost: 14500, income: 2600, risk: { sanctionsEvasion: 0.12, corruption: 0.08, cyberFraud: 0.06 }, complianceNeed: 0.12 },
  { id: 'defiDesk', category: 'products', title: 'DeFi access desk', kicker: 'Frontier product', detail: 'Lucrative access to protocols with chain-hopping and mixer exposure.', cost: 22000, income: 4300, risk: { cyberFraud: 0.18, sanctionsEvasion: 0.14, terroristFinancing: 0.07 }, complianceNeed: 0.18 },
  { id: 'stablecoins', category: 'products', title: 'Stablecoin settlement', kicker: 'Product', detail: 'Global 24/7 settlement creates big revenue and cross-border typology pressure.', cost: 18000, income: 3600, risk: { sanctionsEvasion: 0.16, proliferationFinancing: 0.08, terroristFinancing: 0.08 }, complianceNeed: 0.16 },
  { id: 'tradeFinance', category: 'services', title: 'Trade finance desk', kicker: 'Service', detail: 'Letters of credit and invoices can hide over/under-invoicing and dual-use goods.', cost: 20000, income: 3900, risk: { tbml: 0.24, proliferationFinancing: 0.12, corruption: 0.08 }, complianceNeed: 0.18 },
  { id: 'fx', category: 'products', title: 'Cross-border FX', kicker: 'Product', detail: 'FX spreads generate funds but enable layering across currencies and corridors.', cost: 12500, income: 2500, risk: { sanctionsEvasion: 0.1, terroristFinancing: 0.05, corruption: 0.06 }, complianceNeed: 0.11 },
  { id: 'correspondent', category: 'services', title: 'Correspondent banking', kicker: 'Premium service', detail: 'Serve other banks and inherit nested risk, shell banks, sanctions, and PF exposure.', cost: 26000, income: 5200, risk: { sanctionsEvasion: 0.22, proliferationFinancing: 0.18, corruption: 0.1 }, complianceNeed: 0.22 },
  { id: 'wealth', category: 'services', title: 'Private wealth desk', kicker: 'Service', detail: 'High-net-worth clients bring fees, PEPs, corruption proceeds, and real-estate links.', cost: 15500, income: 3000, risk: { corruption: 0.18, realEstate: 0.13, taxCrime: 0.1 }, complianceNeed: 0.13 },
  { id: 'lending', category: 'products', title: 'SME lending', kicker: 'Product', detail: 'Grow interest income while watching synthetic businesses and loan fraud.', cost: 12000, income: 2300, risk: { frontCompanies: 0.1, taxCrime: 0.08, corruption: 0.04 }, complianceNeed: 0.08 },
  { id: 'treasury', category: 'ops', title: 'Treasury yield program', kicker: 'Operation', detail: 'Deploy surplus capital to safe yields and increase recurring budget generation.', cost: 14000, income: 2700, risk: { corruption: 0.03 }, complianceNeed: 0.04 },
  { id: 'branchNetwork', category: 'ops', title: 'Branch network expansion', kicker: 'Operation', detail: 'Branches grow deposits and local trust but increase cash and exploitation exposure.', cost: 16000, income: 2850, risk: { structuring: 0.14, drugTrafficking: 0.1, slaveryTrafficking: 0.05 }, complianceNeed: 0.09 },
  { id: 'cashOps', category: 'ops', title: 'Cash logistics operation', kicker: 'Operation', detail: 'Cash-heavy services are profitable and dangerous without strong source-of-funds controls.', cost: 10500, income: 1900, risk: { structuring: 0.18, drugTrafficking: 0.14 }, complianceNeed: 0.11 },
  { id: 'apiBanking', category: 'ops', title: 'API banking platform', kicker: 'Operation', detail: 'Let partners embed financial services; earn platform fees and third-party risk.', cost: 21000, income: 4100, risk: { muleNetworks: 0.15, cyberFraud: 0.12, frontCompanies: 0.08 }, complianceNeed: 0.15 },
  { id: 'gamingWallets', category: 'products', title: 'Gaming wallets', kicker: 'Product', detail: 'Stored value inside games can mask mule accounts, exploitation, and stolen funds.', cost: 10500, income: 2050, risk: { muleNetworks: 0.16, humanTrafficking: 0.08, cyberFraud: 0.08 }, complianceNeed: 0.11 },
  { id: 'marketplace', category: 'services', title: 'Player marketplace', kicker: 'Service', detail: 'User-to-user trade generates fees and opens value-transfer typologies.', cost: 13000, income: 2700, risk: { cyberFraud: 0.12, slaveryTrafficking: 0.06, muleNetworks: 0.08 }, complianceNeed: 0.12 },
  { id: 'creatorPayouts', category: 'ops', title: 'Creator payout operation', kicker: 'Operation', detail: 'Creator payments increase growth and require sanctions and trafficking red-flag monitoring.', cost: 9000, income: 1750, risk: { humanTrafficking: 0.07, sanctionsEvasion: 0.05, taxCrime: 0.08 }, complianceNeed: 0.09 }
];

const employees = [
  { id: 'kycAnalyst', category: 'frontline', title: 'KYC Analyst', kicker: 'Level 1', detail: 'Clears onboarding, verifies ownership, and reduces identity/control gaps.', cost: 2800, payroll: 360, coverage: { structuring: 2.5, realEstate: 2, frontCompanies: 2 }, revenueBoost: 0.01 },
  { id: 'alertAnalyst', category: 'frontline', title: 'Transaction Monitoring Analyst', kicker: 'Level 1', detail: 'Works alerts, mule patterns, thresholds, and unusual activity queues.', cost: 3100, payroll: 390, coverage: { structuring: 2.5, muleNetworks: 2.5, cyberFraud: 1.8 }, revenueBoost: 0.005 },
  { id: 'sanctionsScreener', category: 'frontline', title: 'Sanctions Screener', kicker: 'Level 1', detail: 'Resolves names, vessels, geography, and list screening hits.', cost: 3300, payroll: 410, coverage: { sanctionsEvasion: 3, terroristFinancing: 1.6, proliferationFinancing: 1.8 }, revenueBoost: 0.004 },
  { id: 'investigator', category: 'specialist', title: 'Financial Crime Investigator', kicker: 'Level 2', detail: 'Connects cases, prepares SAR/STR narratives, and lifts seizure rates.', cost: 6500, payroll: 780, coverage: { drugTrafficking: 3, humanTrafficking: 3, slaveryTrafficking: 3, corruption: 2 }, seizureBoost: 0.035 },
  { id: 'cryptoForensics', category: 'specialist', title: 'Crypto Forensics Specialist', kicker: 'Level 2', detail: 'Traces wallets, mixers, bridges, ransomware, and darknet exposure.', cost: 8200, payroll: 980, coverage: { cyberFraud: 4, sanctionsEvasion: 2.5, terroristFinancing: 2 }, seizureBoost: 0.045 },
  { id: 'tradeExpert', category: 'specialist', title: 'Trade Finance Investigator', kicker: 'Level 2', detail: 'Spots dual-use goods, invoice manipulation, shipping anomalies, and TBML.', cost: 7800, payroll: 920, coverage: { tbml: 4, proliferationFinancing: 3.5, corruption: 2 }, seizureBoost: 0.035 },
  { id: 'dataScientist', category: 'specialist', title: 'AML Data Scientist', kicker: 'Level 2', detail: 'Improves detection models and reduces false positives across typologies.', cost: 9000, payroll: 1100, coverage: { muleNetworks: 2, cyberFraud: 2, structuring: 2, frontCompanies: 2 }, globalBoost: 0.015 },
  { id: 'complianceManager', category: 'leadership', title: 'Compliance Manager', kicker: 'Level 3', detail: 'Scales QA, policy execution, escalations, and team productivity.', cost: 11500, payroll: 1400, coverage: { frontCompanies: 2.5, taxCrime: 2.5, realEstate: 2.5 }, globalBoost: 0.02 },
  { id: 'mlro', category: 'leadership', title: 'MLRO / BSA Officer', kicker: 'Level 4', detail: 'Owns reporting, board escalation, regulator confidence, and final SAR/STR quality.', cost: 18000, payroll: 2200, coverage: { terroristFinancing: 3, proliferationFinancing: 3, corruption: 3, sanctionsEvasion: 3 }, trustBoost: 0.35, globalBoost: 0.025 },
  { id: 'chiefRisk', category: 'leadership', title: 'Chief Risk Officer', kicker: 'Executive', detail: 'Turns AML into strategy: risk appetite, investment discipline, and crisis response.', cost: 26000, payroll: 3200, coverage: { tbml: 2, sanctionsEvasion: 2, humanTrafficking: 2, drugTrafficking: 2 }, trustBoost: 0.45, revenueBoost: 0.025, globalBoost: 0.03 }
];

const controls = [
  { id: 'dynamicKyc', category: 'prevent', title: 'Dynamic KYC / EDD', kicker: 'Prevention', detail: 'Risk-tiered onboarding, PEP/adverse media, source-of-funds, and periodic reviews.', cost: 8500, upkeep: 320, effectiveness: 13, targets: ['structuring', 'realEstate', 'frontCompanies', 'corruption'], revenueDrag: 0.008 },
  { id: 'beneficialOwnership', category: 'prevent', title: 'Beneficial ownership graph', kicker: 'Prevention', detail: 'Maps UBOs, nominees, shell companies, trusts, and PEP relationships.', cost: 10000, upkeep: 380, effectiveness: 16, targets: ['realEstate', 'frontCompanies', 'corruption', 'taxCrime'], revenueDrag: 0.004 },
  { id: 'sanctionsGeo', category: 'prevent', title: 'Sanctions & geo-fencing stack', kicker: 'Prevention', detail: 'Screens names, countries, wallets, vessels, goods, and risky corridors.', cost: 12000, upkeep: 500, effectiveness: 18, targets: ['sanctionsEvasion', 'terroristFinancing', 'proliferationFinancing'], revenueDrag: 0.006 },
  { id: 'customerEducation', category: 'prevent', title: 'Customer safety campaign', kicker: 'Prevention', detail: 'Warns against mule recruitment, scams, exploitation, and suspicious job offers.', cost: 4200, upkeep: 110, effectiveness: 8, targets: ['muleNetworks', 'cyberFraud', 'humanTrafficking', 'slaveryTrafficking'], trustGain: 0.2 },
  { id: 'transactionMonitoring', category: 'detect', title: 'Scenario monitoring grid', kicker: 'Detection', detail: 'Threshold, velocity, behavior, corridor, and network rules across products.', cost: 11000, upkeep: 460, effectiveness: 17, targets: ['structuring', 'muleNetworks', 'drugTrafficking', 'terroristFinancing', 'taxCrime'] },
  { id: 'aiAnomaly', category: 'detect', title: 'AI anomaly engine', kicker: 'Detection', detail: 'Machine-learning models find hidden clusters and typology drift in real time.', cost: 17500, upkeep: 740, effectiveness: 20, targets: ['cyberFraud', 'muleNetworks', 'frontCompanies', 'humanTrafficking', 'slaveryTrafficking'], globalBoost: 0.02 },
  { id: 'tradeAnalytics', category: 'detect', title: 'Trade & dual-use analytics', kicker: 'Detection', detail: 'Compares invoices, shipping routes, goods, HS codes, and market prices.', cost: 15000, upkeep: 650, effectiveness: 22, targets: ['tbml', 'proliferationFinancing', 'sanctionsEvasion', 'corruption'] },
  { id: 'chainAnalytics', category: 'detect', title: 'Blockchain analytics suite', kicker: 'Detection', detail: 'Traces wallets, bridges, mixers, darknet markets, ransomware, and sanctioned addresses.', cost: 16000, upkeep: 700, effectiveness: 23, targets: ['cyberFraud', 'sanctionsEvasion', 'terroristFinancing', 'drugTrafficking'] },
  { id: 'fiuTaskforce', category: 'disrupt', title: 'Financial intelligence task force', kicker: 'Disruption', detail: 'Investigations squad connects networks, files reports, and drives seizures.', cost: 14500, upkeep: 800, effectiveness: 18, targets: ['drugTrafficking', 'humanTrafficking', 'slaveryTrafficking', 'muleNetworks', 'corruption'], seizureBoost: 0.12 },
  { id: 'lawEnforcementLiaison', category: 'disrupt', title: 'Law-enforcement liaison cell', kicker: 'Disruption', detail: 'Coordinates freezing orders, production orders, victim safeguarding, and arrests.', cost: 13000, upkeep: 620, effectiveness: 15, targets: ['drugTrafficking', 'humanTrafficking', 'slaveryTrafficking', 'terroristFinancing'], seizureBoost: 0.1, trustGain: 0.25 },
  { id: 'assetRecovery', category: 'disrupt', title: 'Asset recovery unit', kicker: 'Disruption', detail: 'Converts successful detections into recovered value that can fund the mission.', cost: 15500, upkeep: 760, effectiveness: 12, targets: ['realEstate', 'corruption', 'taxCrime', 'cyberFraud'], seizureBoost: 0.18 },
  { id: 'tfPfDesk', category: 'disrupt', title: 'TF/PF red-team desk', kicker: 'Disruption', detail: 'Specialists investigate terrorist financing and proliferation financing networks.', cost: 16500, upkeep: 820, effectiveness: 24, targets: ['terroristFinancing', 'proliferationFinancing', 'sanctionsEvasion'], seizureBoost: 0.08, trustGain: 0.3 },
  { id: 'rdLab', category: 'govern', title: 'Typology R&D lab', kicker: 'Governance', detail: 'Researches emerging laundering methods and improves every deployed control.', cost: 15000, upkeep: 540, effectiveness: 9, targets: ['cyberFraud', 'tbml', 'muleNetworks', 'sanctionsEvasion'], globalBoost: 0.03 },
  { id: 'qaAudit', category: 'govern', title: 'QA & audit command', kicker: 'Governance', detail: 'Tests controls, fixes alert quality, and protects regulator credibility.', cost: 12000, upkeep: 430, effectiveness: 10, targets: ['frontCompanies', 'taxCrime', 'structuring', 'corruption'], trustGain: 0.22 },
  { id: 'boardWarRoom', category: 'govern', title: 'Board risk war room', kicker: 'Governance', detail: 'Unlocks strategic funding, crisis prioritisation, and executive accountability.', cost: 20000, upkeep: 900, effectiveness: 10, targets: ['terroristFinancing', 'proliferationFinancing', 'sanctionsEvasion', 'humanTrafficking'], trustGain: 0.4, budgetBoost: 0.025 },
  { id: 'reinvest', category: 'govern', title: 'Reinvest seized funds', kicker: 'Capital allocation', detail: 'Deploy recovered money into safe operations and AML modernization.', cost: 0, upkeep: 0, effectiveness: 0, targets: [], requiresSeizedFunds: true }
];

const threats = [
  { id: 'structuring', name: 'Structuring / Smurfing', detail: 'Fragmented deposits and transfers avoid reporting thresholds.', base: 5, growth: 0.055, harm: 1.0 },
  { id: 'tbml', name: 'Trade-Based ML', detail: 'Invoice manipulation, phantom shipments, and dual-use goods.', base: 4, growth: 0.07, harm: 1.35 },
  { id: 'realEstate', name: 'Real Estate Laundering', detail: 'Shell-company property purchases, nominees, and rapid flips.', base: 3.5, growth: 0.06, harm: 1.3 },
  { id: 'cyberFraud', name: 'Cyber Laundering & Ransomware', detail: 'Wallet hops, mixers, account takeover, ransomware cash-outs, and scams.', base: 5.5, growth: 0.09, harm: 1.45 },
  { id: 'drugTrafficking', name: 'Drug Trafficking Proceeds', detail: 'Cash-intensive placement, cross-border movement, and cartel layering.', base: 4.2, growth: 0.065, harm: 1.5 },
  { id: 'humanTrafficking', name: 'Human Trafficking', detail: 'Exploitation rings use transport, lodging, online adverts, and payment patterns.', base: 3.4, growth: 0.075, harm: 1.7 },
  { id: 'slaveryTrafficking', name: 'Modern Slavery Networks', detail: 'Forced labour payments, wage control, debt bondage, and recruitment fees.', base: 3.0, growth: 0.07, harm: 1.65 },
  { id: 'terroristFinancing', name: 'Terrorist Financing (TF)', detail: 'Small-value flows, charities, crypto, conflict corridors, and procurement cells.', base: 3.2, growth: 0.08, harm: 1.8 },
  { id: 'proliferationFinancing', name: 'Proliferation Financing (PF)', detail: 'Dual-use goods, procurement networks, front companies, and sanctions evasion.', base: 2.8, growth: 0.085, harm: 1.9 },
  { id: 'sanctionsEvasion', name: 'Sanctions Evasion', detail: 'Cut-outs, nested entities, obfuscated ownership, and restricted jurisdictions.', base: 4.0, growth: 0.08, harm: 1.75 },
  { id: 'corruption', name: 'Corruption & Bribery', detail: 'PEPs, kickbacks, procurement fraud, and high-value asset integration.', base: 3.6, growth: 0.06, harm: 1.4 },
  { id: 'muleNetworks', name: 'Mule Account Networks', detail: 'Recruitment funnels move scam, trafficking, and cybercrime proceeds at speed.', base: 4.6, growth: 0.085, harm: 1.25 },
  { id: 'frontCompanies', name: 'Front & Shell Companies', detail: 'Fake businesses and professional enablers disguise beneficial ownership.', base: 3.7, growth: 0.065, harm: 1.3 },
  { id: 'taxCrime', name: 'Tax Crime & Invoice Fraud', detail: 'False invoices, payroll abuse, carousel fraud, and hidden beneficial owners.', base: 3.4, growth: 0.055, harm: 1.15 }
];

const metricDefinitions = [
  ['legitimateRevenue', 'Legitimate revenue', 'Total productive economic value.'],
  ['budget', 'AML budget', 'Spendable funds for staff, controls, and operations.'],
  ['incomePerTick', 'Income/tick', 'Net funds generated every simulation pulse.'],
  ['fraudMl', 'Fraud/ML', 'Live illicit pressure. Keep this below crisis level.'],
  ['illicitFunds', 'Illicit funds', 'Total criminal value that escaped controls.'],
  ['seizedFunds', 'Seized funds', 'Recovered value available for reinvestment.'],
  ['trust', 'Public trust', 'Market and regulator confidence.'],
  ['coverage', 'Control coverage', 'Average protection across threats.']
];

const defaultCompany = companyProfiles[1];
const initialState = {
  running: false,
  ended: false,
  elapsedHours: 0,
  companyId: defaultCompany.id,
  legitimateRevenue: defaultCompany.revenue,
  budget: defaultCompany.budget,
  fraudMl: 18,
  illicitFunds: 0,
  seizedFunds: 0,
  trust: defaultCompany.trust,
  aiSophistication: 1,
  selectedTab: 'command',
  subtabs: { operations: 'services', workforce: 'frontline', aml: 'prevent' },
  ventures: {},
  employees: {},
  controls: {},
  deployments: [],
  threatPressure: Object.fromEntries(threats.map(threat => [threat.id, threat.base])),
  log: ['Choose a company, launch operations, hire people, and start the clock. This time, growth funds the fight.']
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
  companyLabel: document.querySelector('#company-label'),
  statusLabel: document.querySelector('#status-label'),
  threatLabel: document.querySelector('#threat-label'),
  runwayLabel: document.querySelector('#runway-label'),
  heatLabel: document.querySelector('#heat-label'),
  incomeLabel: document.querySelector('#income-label'),
  staffLabel: document.querySelector('#staff-label'),
  budgetLabel: document.querySelector('#budget-label'),
  metricsGrid: document.querySelector('#metrics-grid'),
  intelligenceBrief: document.querySelector('#intelligence-brief'),
  operationsLog: document.querySelector('#operations-log'),
  companyList: document.querySelector('#company-list'),
  serviceList: document.querySelector('#service-list'),
  productList: document.querySelector('#product-list'),
  operationList: document.querySelector('#operation-list'),
  frontlineStaffList: document.querySelector('#frontline-staff-list'),
  specialistStaffList: document.querySelector('#specialist-staff-list'),
  leadershipStaffList: document.querySelector('#leadership-staff-list'),
  preventControlList: document.querySelector('#prevent-control-list'),
  detectControlList: document.querySelector('#detect-control-list'),
  disruptControlList: document.querySelector('#disrupt-control-list'),
  governControlList: document.querySelector('#govern-control-list'),
  threatList: document.querySelector('#threat-list'),
  metricTemplate: document.querySelector('#metric-template'),
  actionTemplate: document.querySelector('#action-template'),
  threatTemplate: document.querySelector('#threat-template')
};

function getCompany() {
  return companyProfiles.find(company => company.id === state.companyId) || defaultCompany;
}

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
  return (8 + state.elapsedHours) % 24;
}

function sumLevels(collection) {
  return Object.values(collection).reduce((sum, value) => sum + value, 0);
}

function addLog(message) {
  const stamp = `Day ${getDay()} ${String(getHour()).padStart(2, '0')}:00`;
  state.log.unshift(`${stamp} — ${message}`);
  state.log = state.log.slice(0, 18);
}

function isUnlocked(item) {
  return getCompany().unlocks.includes(item.id);
}

function getVentureRisk(threatId) {
  return ventures.reduce((risk, venture) => risk + (state.ventures[venture.id] || 0) * (venture.risk[threatId] || 0), 0);
}

function getControlCoverage(threatId) {
  const globalBoost = getGlobalBoost();
  const controlCoverage = controls.reduce((sum, control) => {
    const level = state.controls[control.id] || 0;
    if (!level || !control.targets.includes(threatId)) return sum;
    return sum + control.effectiveness * level * (1 + globalBoost + (level - 1) * 0.18);
  }, 0);

  const employeeCoverage = employees.reduce((sum, employee) => {
    const count = state.employees[employee.id] || 0;
    return sum + count * (employee.coverage[threatId] || 0) * (1 + globalBoost * 0.5);
  }, 0);

  return controlCoverage + employeeCoverage;
}

function getGlobalBoost() {
  const controlBoost = controls.reduce((boost, control) => boost + (state.controls[control.id] || 0) * (control.globalBoost || 0), 0);
  const employeeBoost = employees.reduce((boost, employee) => boost + (state.employees[employee.id] || 0) * (employee.globalBoost || 0), 0);
  return controlBoost + employeeBoost;
}

function getSeizureBoost() {
  const controlBoost = controls.reduce((boost, control) => boost + (state.controls[control.id] || 0) * (control.seizureBoost || 0), 0);
  const employeeBoost = employees.reduce((boost, employee) => boost + (state.employees[employee.id] || 0) * (employee.seizureBoost || 0), 0);
  return controlBoost + employeeBoost;
}

function getTrustBoost() {
  const controlBoost = controls.reduce((boost, control) => boost + (state.controls[control.id] || 0) * (control.trustGain || 0), 0);
  const employeeBoost = employees.reduce((boost, employee) => boost + (state.employees[employee.id] || 0) * (employee.trustBoost || 0), 0);
  return controlBoost + employeeBoost;
}

function getBudgetBoost() {
  return controls.reduce((boost, control) => boost + (state.controls[control.id] || 0) * (control.budgetBoost || 0), 0);
}

function getPayroll() {
  return employees.reduce((payroll, employee) => payroll + (state.employees[employee.id] || 0) * employee.payroll, 0);
}

function getUpkeep() {
  return controls.reduce((upkeep, control) => upkeep + (state.controls[control.id] || 0) * control.upkeep, 0);
}

function getRevenueDrag() {
  return controls.reduce((drag, control) => drag + (state.controls[control.id] || 0) * (control.revenueDrag || 0), 0);
}

function getRevenueBoost() {
  return employees.reduce((boost, employee) => boost + (state.employees[employee.id] || 0) * (employee.revenueBoost || 0), 0);
}

function getGrossIncomePerTick() {
  const company = getCompany();
  const ventureIncome = ventures.reduce((income, venture) => income + (state.ventures[venture.id] || 0) * venture.income, 0);
  const baseline = 1650 * company.incomeMultiplier;
  return (baseline + ventureIncome) * (state.trust / 100) * (1 + getRevenueBoost()) * (1 - getRevenueDrag());
}

function getIncomePerTick() {
  return Math.max(-12000, getGrossIncomePerTick() - getPayroll() - getUpkeep());
}

function getAverageCoverage() {
  const total = threats.reduce((sum, threat) => sum + clamp(getControlCoverage(threat.id), 0, 100), 0);
  return total / threats.length;
}

function getThreatRisk(threat) {
  const company = getCompany();
  const pressure = state.threatPressure[threat.id] + getVentureRisk(threat.id) * 16;
  const coverage = getControlCoverage(threat.id);
  return clamp(pressure * company.riskMultiplier * state.aiSophistication * 4.7 - coverage * 0.42, 0, 100);
}

function getEconomicHeat() {
  const avgThreat = threats.reduce((sum, threat) => sum + getThreatRisk(threat), 0) / threats.length;
  return clamp((avgThreat + state.fraudMl) / 2, 0, 100);
}

function applyDeployments() {
  state.deployments.forEach(deployment => {
    deployment.remainingHours -= HOURS_PER_TICK;
  });

  const completed = state.deployments.filter(deployment => deployment.remainingHours <= 0);
  state.deployments = state.deployments.filter(deployment => deployment.remainingHours > 0);

  completed.forEach(deployment => {
    if (deployment.kind === 'venture') {
      state.ventures[deployment.id] = (state.ventures[deployment.id] || 0) + 1;
      addLog(`${findItem(ventures, deployment.id).title} is generating revenue at level ${state.ventures[deployment.id]}.`);
    }

    if (deployment.kind === 'employee') {
      state.employees[deployment.id] = (state.employees[deployment.id] || 0) + 1;
      addLog(`${findItem(employees, deployment.id).title} joined the team.`);
    }

    if (deployment.kind === 'control') {
      if (deployment.id === 'reinvest') {
        state.legitimateRevenue += deployment.amount * 0.85;
        state.budget += deployment.amount * 0.55;
        addLog(`Reinvested ${formatMoney(deployment.amount)} of recovered criminal value into the lawful economy.`);
      } else {
        state.controls[deployment.id] = (state.controls[deployment.id] || 0) + 1;
        addLog(`${findItem(controls, deployment.id).title} is live at level ${state.controls[deployment.id]}.`);
      }
    }
  });
}

function findItem(items, id) {
  return items.find(item => item.id === id);
}

function adaptAi() {
  const weakest = threats
    .map(threat => ({ threat, score: getThreatRisk(threat) - getControlCoverage(threat.id) * 0.2 }))
    .sort((a, b) => b.score - a.score)[0];

  if (!weakest) return;
  state.threatPressure[weakest.threat.id] += 0.18 * state.aiSophistication;

  if (state.elapsedHours % 24 === 0) {
    state.aiSophistication += 0.035 + state.illicitFunds / 45000000 + sumLevels(state.ventures) * 0.002;
    addLog(`Criminal networks adapt: ${weakest.threat.name} is now probing your weakest seam.`);
  }
}

function resolveThreat(threat) {
  const company = getCompany();
  const pressure = state.threatPressure[threat.id] + getVentureRisk(threat.id) * 18;
  const coverage = getControlCoverage(threat.id);
  const detectionChance = clamp((22 + coverage - state.aiSophistication * 5.5) / 100, 0.04, 0.9);
  const attackValue = pressure * threat.harm * company.riskMultiplier * state.aiSophistication * 155;

  if (Math.random() < detectionChance) {
    const seized = attackValue * clamp(0.14 + coverage / 420 + getSeizureBoost(), 0.08, 0.82);
    state.seizedFunds += seized;
    state.fraudMl = clamp(state.fraudMl - 0.35 - coverage / 95, 0, LOSS_FRAUD_THRESHOLD);
    state.trust = clamp(state.trust + 0.04 + getTrustBoost() * 0.01, 0, 100);

    if (Math.random() < 0.12) {
      addLog(`Disrupted ${threat.name}; ${formatMoney(seized)} frozen or recovered.`);
    }
  } else {
    state.illicitFunds += attackValue;
    state.fraudMl = clamp(state.fraudMl + pressure * threat.harm * 0.1, 0, 220);
    state.legitimateRevenue = Math.max(0, state.legitimateRevenue - attackValue * 0.055);
    state.trust = clamp(state.trust - threat.harm * 0.035, 0, 100);

    if (Math.random() < 0.1) {
      addLog(`${threat.name} slipped through, moving ${formatMoney(attackValue)} in dirty value.`);
    }
  }
}

function tick() {
  if (!state.running || state.ended) return;

  state.elapsedHours += HOURS_PER_TICK;
  applyDeployments();
  adaptAi();

  const income = getIncomePerTick();
  state.legitimateRevenue = Math.max(0, state.legitimateRevenue + income);
  state.budget = Math.max(0, state.budget + income * (0.28 + getBudgetBoost()));

  threats.forEach(threat => {
    state.threatPressure[threat.id] += threat.growth * state.aiSophistication + getVentureRisk(threat.id) * 0.07;
    resolveThreat(threat);
  });

  state.fraudMl = clamp(state.fraudMl - getAverageCoverage() * 0.018, 0, 220);
  state.trust = clamp(state.trust + getTrustBoost() * 0.012 - Math.max(0, state.fraudMl - 55) * 0.002, 0, 100);

  if (state.fraudMl >= LOSS_FRAUD_THRESHOLD || state.trust <= 4) {
    endGame(false);
  } else if (getDay() > WIN_DAY && state.fraudMl < 55 && state.trust >= 45 && state.legitimateRevenue > 200000) {
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
    ? 'Victory: you built a funded, adaptive AML institution that survived criminal escalation.'
    : 'System shock: illicit finance overwhelmed trust. Rebuild with earlier revenue operations and deeper staffing.');
}

function selectCompany(company) {
  const wasRunning = state.running;
  clearInterval(loopId);
  loopId = null;
  state = structuredClone(initialState);
  state.companyId = company.id;
  state.legitimateRevenue = company.revenue;
  state.budget = company.budget;
  state.trust = company.trust;
  state.running = wasRunning;
  addLog(`${company.name} selected. Available operations and risk profile changed.`);
  if (state.running) loopId = setInterval(tick, TICK_MS);
  render();
}

function getScaledCost(item, collection) {
  const level = collection[item.id] || 0;
  return item.cost * (1 + level * 0.42);
}

function deployVenture(venture) {
  if (state.ended || !isUnlocked(venture)) return;
  const cost = getScaledCost(venture, state.ventures);
  if (state.budget < cost) {
    addLog(`${venture.title} needs ${formatMoney(cost)}. Launch more revenue or wait for budget to build.`);
    render();
    return;
  }
  state.budget -= cost;
  state.deployments.push({ kind: 'venture', id: venture.id, remainingHours: 6 + (state.ventures[venture.id] || 0) * 2 });
  addLog(`Expansion approved: ${venture.title}. It will soon generate ${formatMoney(venture.income)} per tick before risk and cost effects.`);
  render();
}

function hireEmployee(employee) {
  if (state.ended) return;
  const cost = getScaledCost(employee, state.employees);
  if (state.budget < cost) {
    addLog(`${employee.title} hiring needs ${formatMoney(cost)}. Grow operations or reinvest seizures.`);
    render();
    return;
  }
  state.budget -= cost;
  state.deployments.push({ kind: 'employee', id: employee.id, remainingHours: 4 });
  addLog(`Offer sent: ${employee.title}. Payroll will increase by ${formatMoney(employee.payroll)} per tick.`);
  render();
}

function deployControl(control) {
  if (state.ended) return;

  if (control.requiresSeizedFunds) {
    if (state.seizedFunds < 1000) {
      addLog('No meaningful seized funds to reinvest yet. Disrupt criminal networks first.');
      render();
      return;
    }
    const amount = Math.min(state.seizedFunds, 18000);
    state.seizedFunds -= amount;
    state.deployments.push({ kind: 'control', id: control.id, remainingHours: 2, amount });
    addLog(`Reinvestment order queued for ${formatMoney(amount)} in recovered illicit value.`);
    render();
    return;
  }

  const cost = getScaledCost(control, state.controls);
  if (state.budget < cost) {
    addLog(`${control.title} requires ${formatMoney(cost)}. Build revenue operations or wait for budget.`);
    render();
    return;
  }
  state.budget -= cost;
  state.deployments.push({ kind: 'control', id: control.id, remainingHours: 5 + (state.controls[control.id] || 0) * 2 });
  addLog(`AML deployment started: ${control.title}.`);
  render();
}

function startSimulation() {
  if (state.ended) state = structuredClone(initialState);
  state.running = true;
  addLog('Simulation started. Operations generate funds; criminals adapt every tick.');
  if (!loopId) loopId = setInterval(tick, TICK_MS);
  render();
}

function pauseSimulation() {
  if (state.ended) return;
  state.running = !state.running;
  addLog(state.running ? 'Simulation resumed.' : 'Simulation paused. Use tabs to plan the next shockwave.');
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
  addLog('Game saved locally.');
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

function setTab(tab) {
  state.selectedTab = tab;
  renderTabs();
}

function setSubtab(group, subtab) {
  state.subtabs[group] = subtab;
  renderSubtabs();
}

function renderMetrics() {
  elements.metricsGrid.innerHTML = '';
  const derived = {
    ...state,
    incomePerTick: getIncomePerTick(),
    coverage: getAverageCoverage()
  };

  metricDefinitions.forEach(([key, label, help]) => {
    const clone = elements.metricTemplate.content.cloneNode(true);
    clone.querySelector('.metric-label').textContent = label;
    clone.querySelector('.metric-value').textContent = ['legitimateRevenue', 'budget', 'incomePerTick', 'illicitFunds', 'seizedFunds'].includes(key)
      ? formatMoney(derived[key])
      : `${formatNumber(derived[key])}${key === 'coverage' ? '%' : ''}`;
    clone.querySelector('.metric-help').textContent = help;
    elements.metricsGrid.appendChild(clone);
  });
}

function renderActionList(container, items, deploy, collection, emptyText) {
  container.innerHTML = '';
  const visible = items.filter(item => !item.category || item.category === container.dataset.category || isUnlocked(item) || !ventures.includes(item));

  if (!visible.length) {
    container.innerHTML = `<p class="empty-note">${emptyText}</p>`;
    return;
  }

  visible.forEach((item, index) => {
    const level = collection[item.id] || 0;
    const cost = item.requiresSeizedFunds ? 0 : getScaledCost(item, collection);
    const clone = elements.actionTemplate.content.cloneNode(true);
    const button = clone.querySelector('button');
    clone.querySelector('.action-kicker').textContent = item.kicker || item.category;
    clone.querySelector('.action-title').textContent = `${index + 1}. ${item.title}`;
    clone.querySelector('.action-detail').textContent = item.detail;
    const income = item.income ? ` · +${formatMoney(item.income)}/tick` : '';
    const payroll = item.payroll ? ` · ${formatMoney(item.payroll)} payroll/tick` : '';
    const upkeep = item.upkeep ? ` · ${formatMoney(item.upkeep)} upkeep/tick` : '';
    clone.querySelector('.action-meta').textContent = item.requiresSeizedFunds
      ? `Uses seized funds · Level ${level}`
      : `${formatMoney(cost)}${income}${payroll}${upkeep} · Level ${level}`;
    button.disabled = state.ended || (!item.requiresSeizedFunds && state.budget < cost);
    button.addEventListener('click', () => deploy(item));
    container.appendChild(clone);
  });
}

function renderCompanies() {
  elements.companyList.innerHTML = '';
  companyProfiles.forEach(company => {
    const clone = elements.actionTemplate.content.cloneNode(true);
    const button = clone.querySelector('button');
    button.classList.toggle('selected', company.id === state.companyId);
    clone.querySelector('.action-kicker').textContent = company.kicker;
    clone.querySelector('.action-title').textContent = company.name;
    clone.querySelector('.action-detail').textContent = company.detail;
    clone.querySelector('.action-meta').textContent = `${formatMoney(company.budget)} start budget · ${formatMoney(company.revenue)} revenue · ${Math.round(company.riskMultiplier * 100)}% risk multiplier`;
    button.addEventListener('click', () => selectCompany(company));
    elements.companyList.appendChild(clone);
  });
}

function renderVentures() {
  renderActionList(elements.serviceList, ventures.filter(item => item.category === 'services' && isUnlocked(item)), deployVenture, state.ventures, 'This company has no service expansions in this category.');
  renderActionList(elements.productList, ventures.filter(item => item.category === 'products' && isUnlocked(item)), deployVenture, state.ventures, 'This company has no product launches in this category.');
  renderActionList(elements.operationList, ventures.filter(item => item.category === 'ops' && isUnlocked(item)), deployVenture, state.ventures, 'This company has no operating expansions in this category.');
}

function renderEmployees() {
  renderActionList(elements.frontlineStaffList, employees.filter(item => item.category === 'frontline'), hireEmployee, state.employees, 'No frontline roles available.');
  renderActionList(elements.specialistStaffList, employees.filter(item => item.category === 'specialist'), hireEmployee, state.employees, 'No specialist roles available.');
  renderActionList(elements.leadershipStaffList, employees.filter(item => item.category === 'leadership'), hireEmployee, state.employees, 'No leadership roles available.');
}

function renderControls() {
  renderActionList(elements.preventControlList, controls.filter(item => item.category === 'prevent'), deployControl, state.controls, 'No preventive controls available.');
  renderActionList(elements.detectControlList, controls.filter(item => item.category === 'detect'), deployControl, state.controls, 'No detection controls available.');
  renderActionList(elements.disruptControlList, controls.filter(item => item.category === 'disrupt'), deployControl, state.controls, 'No disruption controls available.');
  renderActionList(elements.governControlList, controls.filter(item => item.category === 'govern'), deployControl, state.controls, 'No governance controls available.');
}

function renderThreats() {
  elements.threatList.innerHTML = '';
  threats.forEach(threat => {
    const risk = getThreatRisk(threat);
    const coverage = getControlCoverage(threat.id);
    const clone = elements.threatTemplate.content.cloneNode(true);
    clone.querySelector('h3').textContent = threat.name;
    clone.querySelector('.risk-badge').textContent = `${Math.round(risk)} risk`;
    clone.querySelector('.risk-badge').className = `risk-badge ${risk > 70 ? 'danger' : risk > 38 ? 'warning' : 'good'}`;
    clone.querySelector('.threat-description').textContent = threat.detail;
    clone.querySelector('.bar span').style.width = `${risk}%`;
    clone.querySelector('dl').innerHTML = `
      <div><dt>Pressure</dt><dd>${state.threatPressure[threat.id].toFixed(1)}</dd></div>
      <div><dt>Coverage</dt><dd>${Math.round(coverage)}%</dd></div>
      <div><dt>Business exposure</dt><dd>${getVentureRisk(threat.id).toFixed(2)}</dd></div>`;
    elements.threatList.appendChild(clone);
  });
}

function renderBrief() {
  const topThreats = threats
    .map(threat => ({ threat, risk: getThreatRisk(threat), coverage: getControlCoverage(threat.id) }))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 3);
  const deployments = state.deployments.length
    ? `<ul>${state.deployments.map(deployment => `<li>${deployment.kind.toUpperCase()} · ${findDeploymentName(deployment)} · ${Math.max(0, deployment.remainingHours)}h remaining</li>`).join('')}</ul>`
    : '<p>No deployments in progress. Launch operations first if the budget feels tight.</p>';

  elements.intelligenceBrief.innerHTML = `
    <p><strong>${getCompany().name}</strong> is operating with <strong>${sumLevels(state.ventures)}</strong> revenue expansions, <strong>${sumLevels(state.employees)}</strong> employees, and <strong>${sumLevels(state.controls)}</strong> AML control levels.</p>
    <p><strong>Top shocks:</strong> ${topThreats.map(item => `${item.threat.name} (${Math.round(item.risk)} risk / ${Math.round(item.coverage)}% coverage)`).join(' · ')}.</p>
    <p><strong>Strategy:</strong> If you cannot afford controls, open the Operations tab and scale services/products. If risk spikes, hire specialists and deploy targeted AML/CTF/CPF controls.</p>
    <p><strong>Current deployments:</strong></p>${deployments}
    <p class="training-note">Let it be shook: growth is no longer decoration. Every service is a money printer and a crime surface. Build a machine that can pay for its own defenses.</p>`;
}

function findDeploymentName(deployment) {
  return findItem(ventures, deployment.id)?.title || findItem(employees, deployment.id)?.title || findItem(controls, deployment.id)?.title || deployment.id;
}

function renderLog() {
  elements.operationsLog.innerHTML = '';
  state.log.forEach(entry => {
    const item = document.createElement('li');
    item.textContent = entry;
    elements.operationsLog.appendChild(item);
  });
}

function renderTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === state.selectedTab);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === state.selectedTab);
  });
}

function renderSubtabs() {
  document.querySelectorAll('.subtab').forEach(tab => {
    tab.classList.toggle('active', state.subtabs[tab.dataset.subtabGroup] === tab.dataset.subtab);
  });
  document.querySelectorAll('.subtab-panel').forEach(panel => {
    const [group, subtab] = panel.dataset.subtabPanel.split(':');
    panel.classList.toggle('active', state.subtabs[group] === subtab);
  });
}

function renderChrome() {
  const heat = getEconomicHeat();
  const income = getIncomePerTick();
  const staffCount = sumLevels(state.employees);
  const payroll = getPayroll();
  const runway = state.budget > Math.max(1, payroll + getUpkeep()) * 12 ? 'Stable' : state.budget > 0 ? 'Tight' : 'Critical';
  elements.clockLabel.textContent = `Day ${getDay()} · ${String(getHour()).padStart(2, '0')}:00`;
  elements.companyLabel.textContent = getCompany().name;
  elements.statusLabel.textContent = state.ended ? 'Ended' : state.running ? 'Live' : 'Paused';
  elements.threatLabel.textContent = `AI pressure: ${state.aiSophistication.toFixed(2)}x`;
  elements.runwayLabel.textContent = `Runway: ${runway}`;
  elements.heatLabel.textContent = `Economic heat: ${Math.round(heat)}%`;
  elements.incomeLabel.textContent = `Income/tick ${formatMoney(income)}`;
  elements.staffLabel.textContent = `${staffCount} staff · ${formatMoney(payroll)} payroll/tick`;
  elements.budgetLabel.textContent = `Budget ${formatMoney(state.budget)}`;
  elements.startButton.disabled = state.running && !state.ended;
  elements.pauseButton.textContent = state.running ? 'Pause' : 'Resume';
}

function render() {
  renderChrome();
  renderTabs();
  renderSubtabs();
  renderMetrics();
  renderCompanies();
  renderVentures();
  renderEmployees();
  renderControls();
  renderThreats();
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
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => setTab(tab.dataset.tab)));
document.querySelectorAll('.subtab').forEach(tab => tab.addEventListener('click', () => setSubtab(tab.dataset.subtabGroup, tab.dataset.subtab)));
elements.startButton.addEventListener('click', startSimulation);
elements.pauseButton.addEventListener('click', pauseSimulation);
elements.saveButton.addEventListener('click', saveSimulation);
elements.loadButton.addEventListener('click', loadSimulation);
elements.restartButton.addEventListener('click', resetSimulation);
document.addEventListener('keydown', handleKeyboard);
render();
