const SAVE_KEY = 'aml-simulator-state-v2';
const CAREER_KEY = 'aml-simulator-career-v1';
const TICK_MS = 1000;
const HOURS_PER_TICK = 2;
const WIN_DAY = 45;
const LEGACY_LOSS_THRESHOLD = 160;

function makePRNG(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

let rngEngine = makePRNG(1);
function generateSeed() {
  if (globalThis.crypto?.getRandomValues) {
    const data = new Uint32Array(1);
    globalThis.crypto.getRandomValues(data);
    return data[0] || 1;
  }
  return (Date.now() ^ performance.now() * 1000000) >>> 0;
}
function resetRng() {
  rngEngine = makePRNG(state.seed || 1);
  for (let i = 0; i < (state.rngCallCount || 0); i += 1) rngEngine();
}
function rng() {
  state.rngCallCount = (state.rngCallCount || 0) + 1;
  return rngEngine();
}
function randBetween(min, max) { return min + rng() * (max - min); }
function randInt(min, max) { return Math.floor(randBetween(min, max + 1)); }
function pick(list) { return list[Math.floor(rng() * list.length)]; }
function roll(sides) { return Math.floor(rng() * sides) + 1; }
function randNormal(mean, stdDev) {
  const u1 = Math.max(rng(), 1e-9), u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

const glossary = {
  AML: 'Anti-Money Laundering: controls to prevent, detect, and report criminal proceeds moving through finance.',
  CTF: 'Counter-Terrorist Financing: controls to identify and disrupt funds used to support terrorist activity.',
  CPF: 'Counter-Proliferation Financing: controls to stop financing for weapons proliferation networks.',
  KYC: 'Know Your Customer: identity, risk, and relationship checks at onboarding and during periodic reviews.',
  EDD: 'Enhanced Due Diligence: deeper scrutiny for higher-risk customers, geographies, products, or behaviours.',
  STR: 'Suspicious Transaction Report: a formal report to the FIU/regulator when transactions appear suspicious.',
  SAR: 'Suspicious Activity Report: the US-style suspicious reporting obligation; late reporting can itself be a violation.',
  UBO: 'Ultimate Beneficial Owner: the natural person who ultimately owns or controls a customer or legal entity.',
  PEP: 'Politically Exposed Person: a person whose public role creates heightened bribery or corruption risk.',
  TF: 'Terrorist Financing: raising, moving, or storing funds for terrorist organisations or acts.',
  PF: 'Proliferation Financing: raising, moving, or storing value for weapons proliferation networks.',
  TBML: 'Trade-Based Money Laundering: using trade documents, pricing, or goods movement to disguise illicit value.',
  MLRO: 'Money Laundering Reporting Officer: the accountable senior compliance lead for suspicious reporting and AML governance.',
  BSA: 'Bank Secrecy Act: the US framework requiring recordkeeping, monitoring, and SAR filing by financial institutions.',
  FATF: 'Financial Action Task Force: the global standard setter for AML, CTF, and CPF controls.',
  Egmont: 'Egmont Group: a network of Financial Intelligence Units that supports lawful information sharing.'
};

const companies = [
  { id: 'communityBank', name: 'Community Bank', budget: 18000, revenue: 50000, appetite: 45, income: 1, risk: 0.95, ventures: ['Retail Branches', 'Local Wires'] },
  { id: 'cryptoExchange', name: 'Crypto Exchange', budget: 22000, revenue: 62000, appetite: 55, income: 1.15, risk: 1.2, ventures: ['Crypto Gateway', 'Wallet Custody'] },
  { id: 'correspondentBank', name: 'Correspondent Bank', budget: 26000, revenue: 70000, appetite: 50, income: 1.1, risk: 1.25, ventures: ['Correspondent Banking', 'Trade Finance'] },
  { id: 'neobank', name: 'Neobank', budget: 20000, revenue: 66000, appetite: 52, income: 1.18, risk: 1.15, ventures: ['Digital Onboarding', 'Instant Payments'] }
];

const jurisdictions = [
  { id: 'bahrain', name: 'Bahrain (CBB)', flavour: 'Moderate risk environment with strong focus on crypto, Islamic finance AML, and CBB sanctions expectations.', trust: 5, regulator: 60, income: 1, pressure: { cyber: 1.08, sanctionsEvasion: 1.05 } },
  { id: 'uae', name: 'UAE (CBUAE / VARA)', flavour: 'High-growth, high-risk market. Revenue is higher, but sanctions evasion and structuring begin elevated.', trust: 0, regulator: 55, income: 1.1, pressure: { sanctionsEvasion: 1.2, structuring: 1.16 } },
  { id: 'uk', name: 'UK (FCA)', flavour: 'Mature market with heavy governance requirements. Board risk discipline is expected from Day 1.', trust: 0, regulator: 50, income: 1, pressure: { governanceFailure: 1.18, fraudRings: 1.08 } },
  { id: 'us', name: 'US (FinCEN / OCC)', flavour: 'Most complex BSA/SAR environment. Revenue is highest, but compliance costs and reporting pressure are highest.', trust: 0, regulator: 55, income: 1.18, pressure: { structuring: 1.14, cyber: 1.14, sanctionsEvasion: 1.1 }, mandatorySar: true, cost: 1.12 }
];

const difficulties = [
  { id: 'standard', name: 'Standard', risk: 1, budget: 1 },
  { id: 'hard', name: 'Hard', risk: 1.18, budget: 0.82 },
  { id: 'crisis', name: 'Crisis Mode', risk: 1.38, budget: 0.68 }
];

const typologies = [
  { id: 'structuring', name: 'Structuring', short: 'Structuring', description: 'Values are split into small transactions to avoid reporting thresholds.', basePressure: 1.4, growth: 0.05, volatility: 0.25, impact: 1.1, detection: 30, required: 'KYC Analyst', controls: ['monitoring', 'kyc', 'fiu'], ventures: ['Retail Branches', 'Instant Payments'], redFlag: 'Many cash or transfer deposits just below a reporting threshold.', example: 'A cash-intensive network used repeated low-value deposits across branches before consolidating funds.', fatf: 'https://www.fatf-gafi.org/en/publications.html' },
  { id: 'muleNetworks', name: 'Mule Networks', short: 'Mules', description: 'Recruited account holders move scam, cyber, and fraud proceeds through personal accounts.', basePressure: 1.15, growth: 0.06, volatility: 0.3, impact: 1.25, detection: 26, required: 'Fraud Investigator', controls: ['monitoring', 'awareness', 'fiu'], ventures: ['Instant Payments', 'Digital Onboarding'], redFlag: 'New accounts rapidly receive and forward third-party funds.', example: 'Students were recruited online to receive scam proceeds and forward them to handlers.', fatf: 'https://www.fatf-gafi.org/en/publications.html' },
  { id: 'tbml', name: 'Trade-Based ML', short: 'TBML', description: 'Trade documents, goods, and pricing are manipulated to disguise illicit value.', basePressure: 1.0, growth: 0.065, volatility: 0.32, impact: 1.45, detection: 24, required: 'Trade Finance Specialist', controls: ['tradeAnalytics', 'fiu', 'rd'], ventures: ['Trade Finance', 'Correspondent Banking'], redFlag: 'Invoice value is inconsistent with commodity type, route, or customs data.', example: 'A shell importer over-invoiced commodity shipments to move value offshore.', fatf: 'https://www.fatf-gafi.org/en/publications/Methodsandtrends/Trade-basedmoneylaundering.html' },
  { id: 'realEstate', name: 'Real Estate Laundering', short: 'Real Estate', description: 'Property, shell companies, nominees, and rapid resale integrate criminal proceeds.', basePressure: 0.85, growth: 0.075, volatility: 0.28, impact: 1.6, detection: 18, required: 'UBO Investigator', controls: ['beneficialOwnership', 'kyc', 'fiu'], ventures: ['Wealth Desk'], redFlag: 'Opaque ownership and unexplained source of wealth in property purchase.', example: 'Layered companies purchased luxury property with funds from unrelated foreign accounts.', fatf: 'https://www.fatf-gafi.org/en/publications.html' },
  { id: 'cyber', name: 'Cyber Fraud & Ransomware', short: 'Cyber', description: 'Wallets, mule accounts, and compromised platforms obscure proceeds from cybercrime.', basePressure: 1.2, growth: 0.08, volatility: 0.4, impact: 1.35, detection: 22, required: 'Crypto Forensics Specialist', controls: ['cyberUnit', 'monitoring', 'rd'], ventures: ['Crypto Gateway', 'Wallet Custody'], redFlag: 'Funds touch known ransomware wallets or newly created mule accounts.', example: 'Ransomware proceeds were peeled through multiple wallets and converted through exchanges.', fatf: 'https://www.fatf-gafi.org/en/publications/Virtualassets/virtual-assets.html' },
  { id: 'sanctionsEvasion', name: 'Sanctions Evasion', short: 'Sanctions', description: 'Listed actors use intermediaries, geography, and obfuscation to access financial services.', basePressure: 1.05, growth: 0.07, volatility: 0.35, impact: 1.5, detection: 25, required: 'Sanctions Officer', controls: ['sanctionsStack', 'ppp', 'rd'], ventures: ['Correspondent Banking', 'Crypto Gateway'], redFlag: 'Payment chains include high-risk corridors, aliases, or wallet clusters.', example: 'A procurement network routed payments through front companies to conceal a listed party.', fatf: 'https://www.fatf-gafi.org/en/topics/fatfrecommendations.html' },
  { id: 'proliferationFinancing', name: 'Proliferation Financing', short: 'PF', description: 'Value moves to support weapons proliferation procurement or controlled goods.', basePressure: 0.75, growth: 0.06, volatility: 0.3, impact: 1.8, detection: 20, required: 'Sanctions Officer', controls: ['sanctionsStack', 'tradeAnalytics', 'ppp'], ventures: ['Correspondent Banking', 'Trade Finance'], redFlag: 'Dual-use goods, unusual shipping routes, or opaque end users.', example: 'Dual-use goods were purchased through a chain of small suppliers and transshipped.', fatf: 'https://www.fatf-gafi.org/en/publications/Financingofproliferation.html' },
  { id: 'terroristFinancing', name: 'Terrorist Financing', short: 'TF', description: 'Small-value fundraising and movement of funds for extremist actors.', basePressure: 0.95, growth: 0.055, volatility: 0.4, impact: 1.55, detection: 23, required: 'KYC Analyst', controls: ['kyc', 'fiu', 'ppp'], ventures: ['Retail Branches', 'Digital Onboarding'], redFlag: 'Small payments to high-risk geographies or charity-like fronts.', example: 'Low-value transfers were collected from sympathisers and sent to conflict-adjacent areas.', fatf: 'https://www.fatf-gafi.org/en/topics/Terroristfinancing.html' },
  { id: 'humanTrafficking', name: 'Human Trafficking', short: 'Trafficking', description: 'Exploitation networks use accounts and remittances to move proceeds.', basePressure: 0.9, growth: 0.052, volatility: 0.3, impact: 1.35, detection: 24, required: 'Fraud Investigator', controls: ['monitoring', 'kyc', 'fiu'], ventures: ['Retail Branches', 'Instant Payments'], redFlag: 'Multiple victims share contact details, addresses, or controlled spending patterns.', example: 'Accounts receiving wages were controlled by a third party and funds were rapidly withdrawn.', fatf: 'https://www.fatf-gafi.org/en/publications.html' },
  { id: 'corruption', name: 'Corruption & PEP Abuse', short: 'Corruption', description: 'Bribery and public corruption proceeds move through relatives, companies, and assets.', basePressure: 0.82, growth: 0.058, volatility: 0.28, impact: 1.5, detection: 21, required: 'UBO Investigator', controls: ['beneficialOwnership', 'kyc', 'governance'], ventures: ['Wealth Desk', 'Trade Finance'], redFlag: 'PEP-linked funds lack a plausible source of wealth.', example: 'Public contracts were followed by payments to companies linked to an official’s relatives.', fatf: 'https://www.fatf-gafi.org/en/publications.html' },
  { id: 'taxEvasion', name: 'Tax Evasion', short: 'Tax', description: 'Hidden ownership, false invoices, and offshore movement reduce tax visibility.', basePressure: 0.8, growth: 0.05, volatility: 0.25, impact: 1.25, detection: 22, required: 'UBO Investigator', controls: ['beneficialOwnership', 'tradeAnalytics', 'kyc'], ventures: ['Wealth Desk', 'Trade Finance'], redFlag: 'Circular transfers between related entities without business rationale.', example: 'A network used fake consulting invoices to shift income to low-tax entities.', fatf: 'https://www.fatf-gafi.org/en/publications.html' },
  { id: 'predicateFraud', name: 'Scam & Predicate Fraud', short: 'Fraud', description: 'Fraud rings generate proceeds that need rapid movement and cash-out.', basePressure: 1.1, growth: 0.062, impact: 1.35, detection: 26, required: 'Fraud Investigator', controls: ['monitoring', 'awareness', 'cyberUnit'], ventures: ['Instant Payments', 'Digital Onboarding'], redFlag: 'High complaint volumes and rapid onward payments after credit.', example: 'Invoice scam proceeds were spread through many newly opened accounts.', fatf: 'https://www.fatf-gafi.org/en/publications.html' },
  { id: 'cashCourier', name: 'Cash Courier Networks', short: 'Couriers', description: 'Physical cash is collected, transported, and placed into the formal system.', basePressure: 0.88, growth: 0.047, volatility: 0.25, impact: 1.2, detection: 28, required: 'KYC Analyst', controls: ['monitoring', 'awareness', 'kyc'], ventures: ['Retail Branches'], redFlag: 'Repeat deposits by unrelated customers with shared phone numbers or routes.', example: 'Cash couriers made structured deposits at branches before funds were wired onward.', fatf: 'https://www.fatf-gafi.org/en/publications.html' },
  { id: 'governanceFailure', name: 'Governance Failure', short: 'Governance', description: 'Weak board oversight, QA, and escalation allow all risks to compound.', basePressure: 0.7, growth: 0.05, volatility: 0.25, impact: 1.4, detection: 20, required: 'MLRO', controls: ['governance', 'qaAudit', 'rd'], ventures: ['All Ventures'], redFlag: 'Alerts are closed without rationale and QA exceptions are ignored.', example: 'A high-growth institution delayed remediation despite repeated audit findings.', fatf: 'https://www.fatf-gafi.org/en/topics/fatfrecommendations.html' },
  { id: 'hawala', name: 'Informal Value Transfer', short: 'Hawala', description: 'Unregistered hawala or underground banking can obscure source of funds while moving value across borders.', basePressure: 3.8, growth: 0.07, volatility: 0.35, impact: 1.45, detection: 18, required: 'Hawala Network Analyst', controls: ['kyc', 'tradeAnalytics', 'lawEnforcement'], ventures: ['FX Corridors', 'Trade Finance', 'Correspondent Banking'], redFlag: 'Settlement activity lacks commercial rationale and is mirrored by informal brokers.', example: 'An unregistered broker network settled value through trade payments and cash couriers.', fatf: 'https://www.fatf-gafi.org/en/publications.html' }
];

const countermeasures = [
  { id: 'monitoring', title: 'Basic transaction monitoring', type: 'Tier 1 technology', detail: 'Rules, scenarios, and thresholds tuned to velocity and linked accounts.', cost: 6500, deploymentHours: 8, effectiveness: 16, targets: ['structuring', 'muleNetworks', 'cyber', 'humanTrafficking', 'predicateFraud', 'cashCourier'], revenueDrag: 0.02, techTier: 1 },
  { id: 'kyc', title: 'KYC / EDD program', type: 'Prevent', detail: 'Risk-tiered onboarding, source-of-funds checks, adverse media, and periodic reviews.', cost: 5200, deploymentHours: 6, effectiveness: 14, targets: ['structuring', 'realEstate', 'terroristFinancing', 'humanTrafficking', 'corruption', 'taxEvasion', 'cashCourier'], revenueDrag: 0.03 },
  { id: 'fiu', title: 'Financial intelligence task force', type: 'Disrupt', detail: 'Investigators triage alerts, connect networks, file STR/SARs, and seize suspect funds.', cost: 7800, deploymentHours: 10, effectiveness: 18, targets: ['structuring', 'muleNetworks', 'tbml', 'realEstate', 'terroristFinancing', 'humanTrafficking'], seizureBoost: 0.2 },
  { id: 'tradeAnalytics', title: 'Trade anomaly analytics', type: 'Detect', detail: 'Compares invoices, routes, goods, and pricing against customs intelligence.', cost: 7200, deploymentHours: 9, effectiveness: 20, targets: ['tbml', 'proliferationFinancing', 'taxEvasion'], revenueDrag: 0.015 },
  { id: 'beneficialOwnership', title: 'UBO registry checks', type: 'Prevent', detail: 'Maps shell companies, nominees, PEP links, and opaque property structures.', cost: 6100, deploymentHours: 7, effectiveness: 17, targets: ['realEstate', 'corruption', 'taxEvasion'], revenueDrag: 0.015 },
  { id: 'cyberUnit', title: 'Crypto forensics unit', type: 'Disrupt', detail: 'Specialists trace wallets, mule networks, compromised accounts, and platform abuse.', cost: 8300, deploymentHours: 8, effectiveness: 21, targets: ['cyber', 'predicateFraud'], seizureBoost: 0.25 },
  { id: 'sanctionsStack', title: 'Sanctions & geo-fencing stack', type: 'Prevent', detail: 'Screens parties, wallets, corridors, aliases, and sanctions list updates.', cost: 8000, deploymentHours: 8, effectiveness: 20, targets: ['sanctionsEvasion', 'proliferationFinancing'], revenueDrag: 0.018 },
  { id: 'qaAudit', title: 'QA & Audit control', type: 'Govern', detail: 'Tests alert quality, STR timeliness, model tuning, and control effectiveness decay.', cost: 7000, deploymentHours: 8, effectiveness: 13, targets: ['governanceFailure'], governanceBoost: 8 },
  { id: 'governance', title: 'Board risk war room', type: 'Govern', detail: 'Board-level risk appetite, escalation discipline, and remediation oversight.', cost: 6800, deploymentHours: 6, effectiveness: 14, targets: ['governanceFailure', 'corruption'], governanceBoost: 10 },
  { id: 'awareness', title: 'Customer safety campaign', type: 'Prevent', detail: 'Educates customers and staff about scams, mule recruitment, and reporting red flags.', cost: 3600, deploymentHours: 4, effectiveness: 9, targets: ['muleNetworks', 'predicateFraud', 'cashCourier'], revenueDrag: 0.005, complaintReduction: 0.5 },
  { id: 'ppp', title: 'Public-Private Partnership', type: 'Intelligence', detail: 'Egmont/FIU-style intelligence sharing provides periodic sector bulletins.', cost: 6200, deploymentHours: 6, effectiveness: 10, targets: ['sanctionsEvasion', 'proliferationFinancing', 'terroristFinancing'], upkeep: 65 },
  { id: 'aiAnomaly', title: 'AI anomaly engine', type: 'Tier 2 technology', detail: 'Machine-learning scenarios over transaction, customer, and network features.', cost: 9000, deploymentHours: 10, effectiveness: 19, targets: ['structuring', 'muleNetworks', 'cyber', 'predicateFraud'], revenueDrag: 0.012, techTier: 2, requires: 'monitoring' },
  { id: 'federatedIntel', title: 'Federated intelligence network', type: 'Tier 3 technology', detail: 'Shares typology signals with peer institutions for a global coverage lift.', cost: 10500, deploymentHours: 12, effectiveness: 12, targets: typologies.map(t => t.id), governanceBoost: 5, techTier: 3, requires: 'aiAnomaly' },
  { id: 'rd', title: 'Typology R&D Lab', type: 'Detect', detail: 'Research lab reveals actor psychology and improves typology intelligence across advanced threats.', cost: 9500, deploymentHours: 12, effectiveness: 8, targets: ['tbml', 'cyber', 'sanctionsEvasion', 'governanceFailure'], revenueDrag: 0.006 },
  { id: 'lawEnforcement', title: 'Law Enforcement Liaison', type: 'Disrupt', detail: 'Formal liaison pathway for FIU, police, and cross-border case escalation.', cost: 7400, deploymentHours: 8, effectiveness: 15, targets: ['hawala', 'terroristFinancing', 'muleNetworks', 'predicateFraud'], seizureBoost: 0.18 },
  { id: 'whistleblowerHotline', title: 'Anonymous Whistleblower Hotline', type: 'Govern', detail: 'Protected speak-up channel for staff tips about misconduct, clients, and control gaps.', cost: 4200, deploymentHours: 5, effectiveness: 8, targets: ['governanceFailure', 'corruption'], governanceBoost: 6 },
  { id: 'amlInsurance', title: 'AML Insurance Policy', type: 'Govern', detail: 'Risk-transfer product absorbing part of budget shocks when controls remain maintained.', cost: 3000, deploymentHours: 3, effectiveness: 0, targets: [], governanceBoost: 2 },
  { id: 'blockchainAnalytics', title: 'Blockchain Analytics Suite', type: 'Detect', detail: 'Wallet clustering, darknet exposure, and ransomware tracing for crypto activity.', cost: 8600, deploymentHours: 8, effectiveness: 18, targets: ['cyber', 'sanctionsEvasion', 'hawala'], revenueDrag: 0.01 },
  { id: 'predictiveRisk', title: 'Predictive risk scoring', type: 'Tier 4 technology', detail: 'Reduces threat pressure growth across all typologies by 20%.', cost: 12500, deploymentHours: 12, effectiveness: 8, targets: typologies.map(t => t.id), techTier: 4, requires: 'federatedIntel' },
  { id: 'reinvest', title: 'Reinvest seized funds', type: 'Capital allocation', detail: 'Return recovered money into legitimate programs and increase productive revenue.', cost: 0, deploymentHours: 2, effectiveness: 0, targets: [], requiresSeizedFunds: true }
];

const employees = [
  { id: 'kycAnalyst', title: 'KYC Analyst', role: 'KYC Analyst', cost: 3600, payroll: 75, coverage: 5, targets: ['structuring', 'terroristFinancing', 'cashCourier'] },
  { id: 'fraudInvestigator', title: 'Fraud Investigator', role: 'Fraud Investigator', cost: 4200, payroll: 90, coverage: 6, targets: ['muleNetworks', 'predicateFraud', 'humanTrafficking'] },
  { id: 'cryptoSpecialist', title: 'Crypto Forensics Specialist', role: 'Crypto Forensics Specialist', cost: 5400, payroll: 110, coverage: 7, targets: ['cyber', 'sanctionsEvasion'] },
  { id: 'tradeSpecialist', title: 'Trade Finance Specialist', role: 'Trade Finance Specialist', cost: 5000, payroll: 105, coverage: 7, targets: ['tbml', 'proliferationFinancing'] },
  { id: 'uboInvestigator', title: 'UBO Investigator', role: 'UBO Investigator', cost: 4600, payroll: 95, coverage: 6, targets: ['realEstate', 'corruption', 'taxEvasion'] },
  { id: 'sanctionsOfficer', title: 'Sanctions Officer', role: 'Sanctions Officer', cost: 5200, payroll: 105, coverage: 7, targets: ['sanctionsEvasion', 'proliferationFinancing'] },
  { id: 'hawalaAnalyst', title: 'Hawala Network Analyst', role: 'Hawala Network Analyst', cost: 7200, payroll: 860, coverage: 11, targets: ['hawala', 'tbml'] },
  { id: 'mlro', title: 'MLRO', role: 'MLRO', cost: 7600, payroll: 140, coverage: 8, targets: ['governanceFailure'], governanceBoost: 12 }
];

const metricDefinitions = [
  ['legitimateRevenue', 'Legitimate revenue', 'Productive economic output and source of operating budget.'],
  ['budget', 'Budget', 'Available funds for controls, investigations, and technology.'],
  ['fraudMl', 'Fraud/ML', 'Current illicit activity pressure. Target: zero.'],
  ['trust', 'Public trust', 'Confidence in the institution and financial system.'],
  ['regulatorRelationship', 'Regulator relationship', 'Collaborative >65 · Watchlist <45 · Enforcement <25.'],
  ['complianceCulture', 'Compliance culture', 'Staff confidence, escalation discipline, and speak-up culture.'],
  ['seizedFunds', 'Seized funds', 'Recovered illicit value available for reinvestment.']
];

const eventTypes = [
  { id: 'inspection', name: 'Regulatory Inspection', duration: 24, detail: 'Surprise supervisory audit. Raise QA/audit or governance coverage before the clock expires.', action: 'Prepare audit pack' },
  { id: 'industryAlert', name: 'Industry-Wide FATF Alert', duration: 48, detail: 'Sector typology alert temporarily raises pressure on an affected threat.', action: 'Issue typology bulletin' },
  { id: 'whistleblower', name: 'Whistleblower Report', duration: 24, detail: 'Internal tip reaches the regulator. Strong governance contains the issue.', action: 'Escalate to board' },
  { id: 'correspondentSuspension', name: 'Correspondent Bank Suspension', duration: 36, detail: 'A partner bank is blacklisted. Correspondent exposure creates income and trust drag.', action: 'De-risk partner' },
  { id: 'fatfList', name: 'FATF Grey/Black List', duration: 9999, detail: 'A corridor jurisdiction is listed. Sanctions and PF risk spike for the remainder of the game.', action: 'Update country risk' }
];

const campaignChapters = [
  { chapter: 1, title: 'KYC Analyst: Cash Patterns', allowed: ['structuring'], condition: 'Contain structuring below 40 risk for 5 consecutive days.' },
  { chapter: 2, title: 'Mule Ring', allowed: ['structuring', 'muleNetworks'], condition: 'Contain mules and structuring below 45 risk.' },
  { chapter: 3, title: 'Ransomware Wallet', allowed: ['structuring', 'muleNetworks', 'cyber'], condition: 'File an STR and resolve one cyber case.' },
  { chapter: 4, title: 'TF Corridor', allowed: ['structuring', 'muleNetworks', 'cyber', 'terroristFinancing'], condition: 'Keep TF below 50 and trust above 50.' },
  { chapter: 5, title: 'Full Threat Map', allowed: typologies.map(t => t.id), condition: 'Survive a full supervisory cycle.' }
];



const marketConditions = [
  { id: 'bull', name: 'Bull Market', detail: 'Income +12% through Day 15.', className: 'good' },
  { id: 'crackdown', name: 'Regulatory Crackdown', detail: 'Regulator starts wary, but FATF listing pressure is lower.', className: 'warning' },
  { id: 'crimeWave', name: 'Crime Wave', detail: 'All threat base pressure +15% from Day 1.', className: 'danger' },
  { id: 'talentShortage', name: 'Talent Shortage', detail: 'Employee hire costs +20%.', className: 'warning' }
];

const scenarios = {
  bahrainBrief: { name: 'The Bahrain Brief', seed: 20260601, companyId: 'neobank', jurisdictionId: 'bahrain', difficultyId: 'standard', flavour: 'CBB framework, Islamic finance nuance, and crypto onboarding pressure.' },
  sandstorm: { name: 'Operation Sandstorm', seed: 20260602, companyId: 'cryptoExchange', jurisdictionId: 'uae', difficultyId: 'hard', flavour: 'VARA oversight and sanctions pressure from Day 1.' },
  londonStandard: { name: 'The London Standard', seed: 20260603, companyId: 'correspondentBank', jurisdictionId: 'uk', difficultyId: 'crisis', flavour: 'FCA governance expectations, press scrutiny, and correspondent exposure.' },
  fincenFiles: { name: 'FinCEN Files', seed: 20260604, companyId: 'correspondentBank', jurisdictionId: 'us', difficultyId: 'crisis', flavour: 'BSA/SAR discipline with congressional scrutiny on Day 30.' }
};

const corridors = [
  { id: 'middleEast', name: 'Middle East', x: 330, y: 150, risk: 42, typologies: ['sanctionsEvasion', 'terroristFinancing', 'hawala'], ventures: ['Correspondent Banking', 'Trade Finance'] },
  { id: 'seAsia', name: 'Southeast Asia', x: 500, y: 210, risk: 38, typologies: ['muleNetworks', 'cyber', 'tbml'], ventures: ['Trade Finance', 'Instant Payments'] },
  { id: 'eEurope', name: 'Eastern Europe', x: 285, y: 105, risk: 46, typologies: ['cyber', 'sanctionsEvasion'], ventures: ['Crypto Gateway', 'Wallet Custody'] },
  { id: 'wAfrica', name: 'West Africa', x: 235, y: 220, risk: 36, typologies: ['predicateFraud', 'corruption', 'hawala'], ventures: ['Retail Branches', 'Local Wires'] },
  { id: 'latinAmerica', name: 'Latin America', x: 110, y: 250, risk: 40, typologies: ['cashCourier', 'structuring', 'muleNetworks'], ventures: ['Retail Branches'] },
  { id: 'gulf', name: 'Gulf Corridor', x: 350, y: 180, risk: 44, typologies: ['hawala', 'sanctionsEvasion', 'proliferationFinancing'], ventures: ['FX Corridors', 'Correspondent Banking'] },
  { id: 'northAmerica', name: 'North America', x: 95, y: 120, risk: 30, typologies: ['structuring', 'predicateFraud', 'cyber'], ventures: ['Digital Onboarding'] },
  { id: 'ukEu', name: 'UK/EU', x: 255, y: 110, risk: 34, typologies: ['corruption', 'taxEvasion', 'realEstate'], ventures: ['Wealth Desk'] },
  { id: 'southAsia', name: 'South Asia', x: 420, y: 190, risk: 43, typologies: ['hawala', 'cashCourier', 'tbml'], ventures: ['Trade Finance'] },
  { id: 'centralAsia', name: 'Central Asia', x: 380, y: 120, risk: 45, typologies: ['proliferationFinancing', 'sanctionsEvasion'], ventures: ['Correspondent Banking'] },
  { id: 'oceania', name: 'Oceania', x: 555, y: 285, risk: 26, typologies: ['taxEvasion', 'realEstate'], ventures: ['Wealth Desk'] },
  { id: 'northAfrica', name: 'North Africa', x: 280, y: 190, risk: 39, typologies: ['terroristFinancing', 'cashCourier'], ventures: ['Local Wires'] }
];

const realWorldHeadlines = [
  'FATF issues new guidance on virtual assets and wallet risk indicators.',
  'Wolfsberg Group updates correspondent banking principles for high-risk corridors.',
  'Global financial crime costs estimated at 2–5% of GDP in training brief.',
  'Regulators remind boards that AML culture is a senior management responsibility.',
  'FIUs highlight mule account recruitment across social platforms.',
  'Sanctions agencies warn firms to monitor vessel, wallet, and ownership changes.',
  'ACAMS training bulletin focuses on alert fatigue and QA remediation.',
  'Basel AML Index methodology used by banks to compare country exposure.',
  'Supervisors stress timely SAR filing and complete transaction narratives.',
  'Public-private partnerships credited with disrupting ransomware proceeds.'
];

const transactionScenarios = [
  { amount: 87000, origin: 'new wallet with darknet exposure', destination: 'off-ramp exchange', data: ['Customer onboarded yesterday', 'Device shared with mule accounts', 'Wallet cluster is sanctioned'], answer: 'Block' },
  { amount: 9400, origin: 'retail account', destination: 'cash withdrawal', data: ['Nine deposits under threshold', 'No salary history', 'Funds leave within one hour'], answer: 'Escalate' },
  { amount: 24000, origin: 'established SME', destination: 'known supplier', data: ['Invoice matches past pattern', 'No sanctions hit', 'Beneficial owner verified'], answer: 'Allow' },
  { amount: 152000, origin: 'offshore company', destination: 'dual-use goods exporter', data: ['Opaque UBO', 'High-risk corridor', 'Goods inconsistent with customer profile'], answer: 'Block' }
];

const initialState = createInitialState();
let state = structuredClone(initialState);
let loopId = null;
let headlineId = null;

const elements = {
  startButton: document.querySelector('#start-button'), pauseButton: document.querySelector('#pause-button'), analysisButton: document.querySelector('#analysis-button'),
  saveButton: document.querySelector('#save-button'), loadButton: document.querySelector('#load-button'), restartButton: document.querySelector('#restart-button'),
  companySelect: document.querySelector('#company-select'), jurisdictionSelect: document.querySelector('#jurisdiction-select'), difficultySelect: document.querySelector('#difficulty-select'), modeSelect: document.querySelector('#mode-select'), briefingSelect: document.querySelector('#briefing-select'), speedSelect: document.querySelector('#speed-select'), seedInput: document.querySelector('#seed-input'), scenarioSelect: document.querySelector('#scenario-select'), trainingSelect: document.querySelector('#training-select'), newsSelect: document.querySelector('#news-select'), setupFlavour: document.querySelector('#setup-flavour'),
  clockLabel: document.querySelector('#clock-label'), statusLabel: document.querySelector('#status-label'), speedLabel: document.querySelector('#speed-label'), seedLabel: document.querySelector('#seed-label'), marketLabel: document.querySelector('#market-label'), cultureLabel: document.querySelector('#culture-label'), complaintsLabel: document.querySelector('#complaints-label'), alertQueueLabel: document.querySelector('#alert-queue-label'), threatLabel: document.querySelector('#threat-label'), budgetLabel: document.querySelector('#budget-label'), campaignLabel: document.querySelector('#campaign-label'),
  metricsGrid: document.querySelector('#metrics-grid'), headlineTicker: document.querySelector('#headline-ticker'), riskProfile: document.querySelector('#risk-profile'), riskAppetite: document.querySelector('#risk-appetite'), customerBook: document.querySelector('#customer-book'), peerBenchmark: document.querySelector('#peer-benchmark'), budgetForecast: document.querySelector('#budget-forecast'), planPanel: document.querySelector('#plan-panel'), caseRoom: document.querySelector('#case-room'), countermeasureList: document.querySelector('#countermeasure-list'), technologyTree: document.querySelector('#technology-tree'), employeeList: document.querySelector('#employee-list'), typologyList: document.querySelector('#typology-list'), typologyDetail: document.querySelector('#typology-detail'), intelligenceBrief: document.querySelector('#intelligence-brief'), actorProfiles: document.querySelector('#actor-profiles'), darkwebFeed: document.querySelector('#darkweb-feed'), historyChart: document.querySelector('#history-chart'), moneyFlow: document.querySelector('#money-flow'), stageFlow: document.querySelector('#stage-flow'), worldMap: document.querySelector('#world-map'), corridorTracker: document.querySelector('#corridor-tracker'), correspondentRegistry: document.querySelector('#correspondent-registry'), governActions: document.querySelector('#govern-actions'), complianceCalendar: document.querySelector('#compliance-calendar'), policyLibrary: document.querySelector('#policy-library'), leaderboard: document.querySelector('#leaderboard'), competitiveBoard: document.querySelector('#competitive-board'), predicateMap: document.querySelector('#predicate-map'), regulatoryBanner: document.querySelector('#regulatory-banner'), incidentFeed: document.querySelector('#incident-feed'), operationsLog: document.querySelector('#operations-log'), careerScreen: document.querySelector('#career-screen'), learnPanel: document.querySelector('#learn-panel'), modalRoot: document.querySelector('#modal-root'), metricTemplate: document.querySelector('#metric-template'), countermeasureTemplate: document.querySelector('#countermeasure-template')
};

function createInitialState() {
  return {
    running: false, ended: false, pausedForModal: false, analysisMode: false, elapsedHours: 0,
    companyId: 'communityBank', jurisdictionId: 'bahrain', difficultyId: 'standard', mode: 'freeplay', campaignChapter: 1,
    legitimateRevenue: 50000, budget: 18000, fraudMl: 10, illicitFunds: 0, escapedFunds: 0, seizedFunds: 0, trust: 72, regulatorRelationship: 60, complianceCulture: 50,
    aiSophistication: 1, speed: 1, seed: 0, rngCallCount: 0, manualSeed: '', marketCondition: null, scenarioId: 'custom', trainingMode: false, realWorldNews: false, dailyBriefings: true, complaints: 0, alertQueue: 0, burnoutDays: 0, burnout: 0, negativeBudgetDays: 0,
    deployments: [], controls: {}, controlAge: {}, suspendedControls: {}, employees: {}, employeeAwards: {}, activeEvents: [], nextRegEventDay: 7, nextSanctionsDay: 8, nextInnovationDay: 11, nextWindfallDay: 7, nextCollaborationDay: 14, nextHotlineDay: 9, nextInstitutionCollabDay: 10, budgetShockDays: [], budgetShocksFired: 0,
    activeStr: null, filedStrs: 0, lateStrs: 0, rogueEmployeeDay: 0, rogueEmployeeDone: false, misconductWarning: null, criminalInnovations: [], threatCollaborations: [], windfalls: [], darkwebIntel: [], corridorRisks: {}, selectedCorridor: 'middleEast', typologyHistory: {}, mutations: {}, mutationTimers: {}, neutralised: {}, neutraliseTimers: {}, pressureAuctions: [], cascadeDays: 0, cascadeEvent: null, cases: [], casesResolved: 0, regulatoryEventsSurvived: 0, incidentFeed: [], actorProfiles: [], pppBulletins: [], correspondentChallenge: null,
    selectedTypology: 'structuring', selectedPredicate: '', lastHeadline: '', peerBenchmark: null, calendarMarks: [], activeCorrespondents: [], corridorPauses: {}, disclosed: false, insuranceClaims: 0, insurancePremiumRate: 0.05, advisorUsed: false, adversaryProfile: null, interceptedIntel: null, interceptRolled: false, onboardingDone: false, ventureRiskAdjustments: {}, endReason: '', endDetails: null,
    typologyPressure: Object.fromEntries(typologies.map(typology => [typology.id, typology.basePressure])),
    lastRiskBreakdown: {}, log: ['Welcome, MLRO. Configure your institution, jurisdiction, and training mode, then start the simulation.']
  };
}

function formatMoney(value) { return `$${Math.round(value).toLocaleString()}`; }
function formatNumber(value) { return Math.round(value).toLocaleString(); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function getDay() { return Math.floor(state.elapsedHours / 24) + 1; }
function getHour() { return 8 + (state.elapsedHours % 24); }
function currentCompany() { return companies.find(c => c.id === state.companyId) || companies[0]; }
function currentJurisdiction() { return jurisdictions.find(j => j.id === state.jurisdictionId) || jurisdictions[0]; }
function currentDifficulty() { return difficulties.find(d => d.id === state.difficultyId) || difficulties[0]; }
function formatCounterName(id) { return countermeasures.find(countermeasure => countermeasure.id === id)?.title || id; }
function controlsCount() { return Object.values(state.controls).reduce((sum, level) => sum + level, 0); }
function employeeCount(role) { return Object.values(state.employees).filter(e => e.role === role).reduce((sum, e) => sum + e.count, 0); }
function hasControl(id) { return (state.controls[id] || 0) > 0; }
function getRegulatorTier() { return state.regulatorRelationship > 65 ? 'Collaborative' : state.regulatorRelationship < 25 ? 'Enforcement' : state.regulatorRelationship < 45 ? 'Watchlist' : 'Supervised'; }
function isCorrespondentActive() { return currentCompany().ventures.includes('Correspondent Banking') || hasControl('correspondentBanking'); }

function addLog(message) {
  const stamp = `Day ${getDay()} ${String(getHour() % 24).padStart(2, '0')}:00`;
  state.log.unshift(`${stamp} — ${message}`);
  state.log = state.log.slice(0, 40);
}

function addIncident(message) {
  const stamp = `D${getDay()} ${String(getHour() % 24).padStart(2, '0')}:00`;
  state.incidentFeed.unshift(`${stamp} · ${message}`);
  state.incidentFeed = state.incidentFeed.slice(0, 25);
}

function getTypologyRisk(typology) {
  const pressure = state.typologyPressure[typology.id] || typology.basePressure;
  const exposure = getBusinessExposure(typology);
  const coverage = getActiveControlsFor(typology.id);
  const risk = clamp(pressure * state.aiSophistication * exposure * 7 - coverage * 0.48, 0, 160);
  state.lastRiskBreakdown[typology.id] = { base: typology.basePressure, growth: pressure - typology.basePressure, exposure, coverage, risk };
  return risk;
}

function getBusinessExposure(typology) {
  const company = currentCompany();
  const match = typology.ventures.filter(v => company.ventures.includes(v) || v === 'All Ventures').length;
  const jurisdictionMultiplier = currentJurisdiction().pressure?.[typology.id] || 1;
  const ventureAdjustment = Object.values(state.ventureRiskAdjustments || {}).reduce((sum, value) => sum + value, 0);
  const corridorAdjustment = corridors.filter(c => (state.corridorRisks[c.id] || c.risk) > 65 && c.typologies.includes(typology.id)).length * 0.08;
  return (company.risk + match * 0.12 + ventureAdjustment + corridorAdjustment) * currentDifficulty().risk * jurisdictionMultiplier;
}

function getControlEfficiency(countermeasure) {
  const age = state.controlAge[countermeasure.id] || 0;
  const decayRate = hasControl('qaAudit') && countermeasure.id !== 'qaAudit' ? 0.01 : 0.02;
  return clamp(1 - Math.floor(age / 240) * decayRate, 0.65, 1.05);
}

function getActiveControlsFor(typologyId) {
  const globalBoost = hasControl('federatedIntel') ? 0.08 : 0;
  const partnershipBoost = state.pppBulletins.filter(b => b.typologyIds.includes(typologyId) && b.expiresHour > state.elapsedHours).reduce((sum, b) => sum + (b.boost || 0.1), 0);
  const darkwebBoost = state.darkwebIntel.some(i => i.typologyId === typologyId && i.expiresHour > state.elapsedHours) && (hasControl('blockchainAnalytics') || hasControl('aiAnomaly')) ? 0.05 : 0;
  const cultureBoost = state.complianceCulture > 70 ? 0.1 : 0;
  const collaboration = state.threatCollaborations.find(c => c.expiresHour > state.elapsedHours && c.typologyIds.includes(typologyId));
  const collaborationPenalty = collaboration && !hasDualTargetControl(collaboration.typologyIds) ? 0.8 : 1;
  const obfuscationPenalty = state.criminalInnovations.some(i => i.typologyId === typologyId && i.tactic === 'Obfuscation Screen' && i.expiresHour > state.elapsedHours) ? 0.7 : 1;
  const employeeCoverage = employees.reduce((sum, employee) => {
    const hired = state.employees[employee.id]?.count || 0;
    if (!hired || !employee.targets.includes(typologyId)) return sum;
    const burnoutMultiplier = employee.role.includes('Analyst') || employee.role.includes('Investigator') ? (1 - state.burnout / 100) : 1;
    const award = state.employeeAwards[employee.id] ? 1.2 : 1;
    return sum + (state.employees[employee.id]?.coverage || employee.coverage) * hired * burnoutMultiplier * award * (1 + cultureBoost);
  }, 0);
  return countermeasures.reduce((sum, countermeasure) => {
    const level = state.controls[countermeasure.id] || 0;
    if (!level || !countermeasure.targets.includes(typologyId) || state.suspendedControls[countermeasure.id] > state.elapsedHours) return sum;
    if (state.criminalInnovations.some(i => i.typologyId === typologyId && i.tactic === 'Layering Leap' && i.controlId === countermeasure.id && i.expiresHour > state.elapsedHours)) return sum;
    const mutationPenalty = state.mutations.cyber === 'AI-Generated Deepfake Fraud' && typologyId === 'cyber' && countermeasure.id === 'kyc' ? 0.6 : 1;
    const hawalaPenalty = typologyId === 'hawala' && countermeasure.id === 'monitoring' ? 0.6 : 1;
    const levelMultiplier = 1 + (level - 1) * 0.35 + globalBoost + partnershipBoost + darkwebBoost + cultureBoost;
    return sum + countermeasure.effectiveness * levelMultiplier * getControlEfficiency(countermeasure) * mutationPenalty * hawalaPenalty;
  }, employeeCoverage) * collaborationPenalty * obfuscationPenalty;
}

function hasDualTargetControl(typologyIds) {
  return countermeasures.some(control => hasControl(control.id) && typologyIds.every(id => control.targets.includes(id)));
}

function calculateThreat() { return typologies.reduce((sum, typology) => sum + state.typologyPressure[typology.id], 0) * state.aiSophistication; }
function calculateRevenueDrag() { return countermeasures.reduce((drag, c) => drag + (c.revenueDrag || 0) * (state.controls[c.id] || 0), 0); }
function getPayroll() { return Object.values(state.employees).reduce((sum, e) => sum + e.payroll * e.count, 0); }
function getUpkeep() {
  const discount = getRegulatorTier() === 'Collaborative' ? 0.9 : 1;
  return countermeasures.reduce((sum, c) => sum + (c.upkeep || c.cost * 0.006) * (state.controls[c.id] || 0), 0) * discount;
}
function getSeizureBoost() { return countermeasures.reduce((boost, c) => boost + (c.seizureBoost || 0) * (state.controls[c.id] || 0), 0); }

function configureRun() {
  applyScenario();
  const manual = String(elements.seedInput.value || '').trim();
  state.seed = Number.isFinite(Number(manual)) && manual !== '' ? Number(manual) >>> 0 : (state.seed || generateSeed());
  state.rngCallCount = 0;
  resetRng();
  state.marketCondition = state.marketCondition || pick(marketConditions).id;
  state.adversaryProfile = state.adversaryProfile || pickAdversaryProfile();
  const company = currentCompany();
  const jurisdiction = currentJurisdiction();
  const difficulty = currentDifficulty();
  state.legitimateRevenue = company.revenue;
  state.budget = Math.round(company.budget * difficulty.budget);
  state.trust = clamp(72 + jurisdiction.trust, 0, 100);
  state.regulatorRelationship = state.marketCondition === 'crackdown' ? 35 : jurisdiction.regulator;
  const marketPressure = state.marketCondition === 'crimeWave' ? 1.15 : 1;
  const fatfRelief = state.marketCondition === 'crackdown' ? { sanctionsEvasion: 0.9, proliferationFinancing: 0.9 } : {};
  state.typologyPressure = Object.fromEntries(typologies.map(t => [t.id, t.basePressure * marketPressure * company.risk * difficulty.risk * (jurisdiction.pressure?.[t.id] || 1) * (fatfRelief[t.id] || 1)]));
  state.nextRegEventDay = randInt(7, 12);
  state.nextSanctionsDay = randInt(8, 10);
  state.nextInnovationDay = randInt(9, 14);
  state.nextWindfallDay = randInt(6, 10);
  state.nextCollaborationDay = randInt(12, 18);
  state.nextHotlineDay = randInt(8, 10);
  state.nextInstitutionCollabDay = randInt(10, 15);
  state.rogueEmployeeDay = randInt(11, 32);
  state.budgetShockDays = [...new Set([randInt(6, 16), randInt(17, 31), randInt(32, 43)])].sort((a, b) => a - b);
  state.peerBenchmark = { fraudMl: Math.round(55 * randBetween(0.9, 1.1)), trust: Math.round(65 * randBetween(0.9, 1.1)) };
  state.corridorRisks = Object.fromEntries(corridors.map(c => [c.id, clamp(c.risk + randInt(-8, 12), 5, 95)]));
  state.typologyHistory = Object.fromEntries(typologies.map(t => [t.id, []]));
  if (state.mode === 'campaign') {
    state.companyId = 'communityBank';
    state.employees.kycAnalyst = { ...employees[0], count: 1, hiredHour: 0, upgraded: false };
    state.log.unshift('Campaign mode: Chapter 1 begins with a KYC Analyst and structuring-only focus.');
  }
  addLog(`Seed ${state.seed} initialised. Market condition: ${marketConditions.find(m => m.id === state.marketCondition)?.name}. Adversary: ${state.adversaryProfile.name}.`);
}

function applyScenario() {
  const scenario = scenarios[state.scenarioId];
  if (!scenario || state.elapsedHours > 0) return;
  state.companyId = scenario.companyId;
  state.jurisdictionId = scenario.jurisdictionId;
  state.difficultyId = scenario.difficultyId;
  state.seed = scenario.seed;
  addLog(`Named scenario loaded: ${scenario.name}. ${scenario.flavour}`);
}

function pickAdversaryProfile() {
  return pick([
    { id: 'architect', name: 'The Architect', focus: ['tbml', 'realEstate', 'corruption'], growth: 0.9, detection: -0.04 },
    { id: 'opportunist', name: 'The Opportunist', focus: ['structuring', 'muleNetworks', 'predicateFraud'], growth: 1.16, detection: 0.02 },
    { id: 'ghost', name: 'The Ghost', focus: ['cyber', 'sanctionsEvasion'], growth: 1, detection: -0.02 },
    { id: 'cartel', name: 'The Cartel', focus: ['muleNetworks', 'cashCourier', 'structuring'], growth: 1.2, detection: 0 },
    { id: 'stateActor', name: 'The State Actor', focus: ['sanctionsEvasion', 'proliferationFinancing'], growth: 0.95, detection: -0.05 },
    { id: 'broker', name: 'The Broker', focus: ['hawala', 'tbml'], growth: 1.05, detection: -0.02 },
    { id: 'forger', name: 'The Forger', focus: ['taxEvasion', 'realEstate'], growth: 1, detection: -0.01 },
    { id: 'swarm', name: 'The Swarm', focus: ['predicateFraud', 'cyber', 'muleNetworks'], growth: 1.18, detection: 0.01 }
  ]);
}

function completeDeployments() {
  state.deployments.forEach(deployment => { deployment.remainingHours -= HOURS_PER_TICK; });
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
    state.controlAge[countermeasure.id] = 0;
    if (countermeasure.id === 'governance' || countermeasure.id === 'qaAudit') state.regulatorRelationship = clamp(state.regulatorRelationship + 4, 0, 100);
    if (['awareness', 'qaAudit', 'whistleblowerHotline'].includes(countermeasure.id)) state.complianceCulture = clamp(state.complianceCulture + 6, 0, 100);
    addLog(`${countermeasure.title} is operational at level ${state.controls[countermeasure.id]}.`);
  });
}

function refreshControl(id) {
  const countermeasure = countermeasures.find(c => c.id === id);
  if (!countermeasure) return;
  const cost = countermeasure.cost * 0.3;
  if (state.budget < cost) return addLog(`${countermeasure.title} refresh needs ${formatMoney(cost)}.`), render();
  state.budget -= cost;
  state.controlAge[id] = 0;
  state.regulatorRelationship = clamp(state.regulatorRelationship + 1.2, 0, 100);
  addLog(`Continuous improvement refresh completed for ${countermeasure.title}.`);
  render();
}

function hireEmployee(employee) {
  const hireCost = employee.cost * (state.marketCondition === 'talentShortage' ? 1.2 : 1);
  if (state.ended || state.budget < hireCost) return addLog(`${employee.title} hire requires ${formatMoney(hireCost)}.`), render();
  state.budget -= hireCost;
  state.employees[employee.id] = state.employees[employee.id] || { ...employee, count: 0, hiredHour: state.elapsedHours, upgraded: false };
  state.employees[employee.id].count += 1; state.employees[employee.id].hiredHour = state.employees[employee.id].hiredHour ?? state.elapsedHours;
  state.burnout = clamp(state.burnout - 12, 0, 100);
  if (employee.id === 'mlro') {
    state.regulatorRelationship = clamp(state.regulatorRelationship + 8, 0, 100);
    generateHeadline(`MLRO appointed at ${currentCompany().name} — analysts cautiously optimistic.`);
  }
  addLog(`${employee.title} hired. Payroll increased but alert-handling capacity improved.`);
  render();
}

function adaptAi() {
  const leastProtected = typologies.map(t => ({ typology: t, protection: getActiveControlsFor(t.id) })).sort((a, b) => a.protection - b.protection)[0];
  if (!leastProtected) return;
  const predictive = hasControl('predictiveRisk') ? 0.8 : 1;
  state.typologyPressure[leastProtected.typology.id] += 0.15 * state.aiSophistication * predictive * (state.adversaryProfile?.growth || 1);
  if (state.elapsedHours % 24 === 0) {
    state.aiSophistication += (getDay() >= 35 ? 0.1 : 0.05) + state.illicitFunds / 10000000;
    addLog(`Adversaries pivot toward ${leastProtected.typology.name}, the least protected channel.`);
  }
}


function getSeasonalModifier(typologyId) {
  const day = getDay();
  if (day <= 5 && typologyId === 'muleNetworks') return 1.15;
  if (day >= 10 && day <= 15 && ['taxEvasion', 'structuring'].includes(typologyId)) return 1.1;
  if (day >= 20 && day <= 25 && typologyId === 'cyber') return 1.15;
  return 1;
}

function resolveTypology(typology) {
  if (state.mode === 'campaign' && !campaignChapters[state.campaignChapter - 1].allowed.includes(typology.id)) return;
  const pressure = state.typologyPressure[typology.id];
  const controls = getActiveControlsFor(typology.id);
  const risk = getTypologyRisk(typology);
  const detectionChance = clamp((typology.detection + controls - state.aiSophistication * 6) / 100 + (state.adversaryProfile?.detection || 0), 0.05, 0.9);
  const attackValue = pressure * typology.impact * state.aiSophistication * getBusinessExposure(typology) * 220;

  if (risk > 60) maybeTriggerStr(typology, risk);
  if (risk > 60) maybeCreateActorProfile(typology, attackValue, risk);

  if (rng() < detectionChance) {
    const seizureRate = 0.22 + controls / 500 + getSeizureBoost() + (state.activeStr?.typologyId === typology.id ? 0.08 : 0);
    const seized = attackValue * clamp(seizureRate, 0.12, 0.78);
    state.fraudMl = clamp(state.fraudMl - 0.45 - controls / 70, 0, LEGACY_LOSS_THRESHOLD);
    state.seizedFunds += seized;
    state.trust = clamp(state.trust + 0.08, 0, 100);
    if (rng() < 0.16) addLog(`Detected ${typology.name}; seized ${formatMoney(seized)} and disrupted linked accounts.`);
  } else {
    const previous = state.fraudMl;
    state.fraudMl = clamp(state.fraudMl + pressure * typology.impact * 0.28, 0, 190);
    const escaped = attackValue;
    state.illicitFunds += escaped;
    state.escapedFunds += escaped;
    state.legitimateRevenue = Math.max(0, state.legitimateRevenue - escaped * 0.09);
    state.trust = clamp(state.trust - pressure * 0.04, 0, 100);
    if (state.fraudMl > 70 && state.fraudMl - previous > 0.8) registerComplaint();
    if (rng() < 0.16) addLog(`${typology.name} scheme succeeded, adding ${formatMoney(escaped)} to illicit flows.`);
    if (rng() < 0.12 || risk > 70) createCase(typology, escaped, risk);
  }
}

function maybeTriggerStr(typology, risk) {
  if (state.activeStr || state.filedStrs > 0 && rng() > 0.06) return;
  state.activeStr = { typologyId: typology.id, openedHour: state.elapsedHours, dueHour: state.elapsedHours + 24, risk };
  state.running = false;
  addLog(`Suspicious reporting clock started for ${typology.name}.`);
  showStrModal();
}

function showStrModal() {
  const typology = typologies.find(t => t.id === state.activeStr?.typologyId);
  if (!typology) return;
  showModal(`
    <div class="modal-card">
      <h2>STR / SAR Filing Decision</h2>
      <p>A case linked to <strong>${typology.name}</strong> has breached risk ${Math.round(state.activeStr.risk)}. Investigators see exposure through ${currentCompany().ventures.join(', ')} and pressure is rising.</p>
      <label><input type="checkbox" class="str-check"> Subject identified</label>
      <label><input type="checkbox" class="str-check"> Transaction chain documented</label>
      <label><input type="checkbox" class="str-check"> Supervisory sign-off</label>
      <div class="modal-actions"><button id="file-str">File STR/SAR</button><button class="secondary" id="defer-str">Defer</button></div>
    </div>`);
  document.querySelector('#file-str').addEventListener('click', fileStr);
  document.querySelector('#defer-str').addEventListener('click', () => { hideModal(); state.running = true; ensureLoop(); render(); });
}

function fileStr() {
  const checked = [...document.querySelectorAll('.str-check')].filter(c => c.checked).length;
  if (checked < 3) return;
  const early = state.elapsedHours - state.activeStr.openedHour <= 12;
  const typology = typologies.find(t => t.id === state.activeStr.typologyId);
  state.filedStrs += 1;
  if (!early) state.lateStrs += 1;
  state.seizedFunds += early ? 1800 : 850;
  state.trust = clamp(state.trust + (early ? 3 : 1), 0, 100);
  state.regulatorRelationship = clamp(state.regulatorRelationship + (early ? 5 : 2), 0, 100);
  addLog(`${early ? 'Timely' : 'Late'} STR/SAR filed for ${typology.name}; reporting obligations satisfied and seizure odds improved.`);
  state.activeStr = null;
  hideModal(); state.running = true; ensureLoop(); render();
}

function processStrClock() {
  if (!state.activeStr || state.elapsedHours <= state.activeStr.dueHour) return;
  const typology = typologies.find(t => t.id === state.activeStr.typologyId);
  state.regulatorRelationship = clamp(state.regulatorRelationship - 8, 0, 100);
  state.typologyPressure[typology.id] += 0.7;
  addLog(`Missed STR/SAR deadline for ${typology.name}. Regulator relationship deteriorated and threat pressure increased.`);
  state.activeStr = null;
}

function createCase(typology, value, risk) {
  if (state.cases.some(c => c.typologyId === typology.id && c.status === 'open')) return;
  const code = `${typology.short.toUpperCase()}-${randInt(100, 999)}`;
  state.cases.unshift({ id: `case-${state.elapsedHours}-${randInt(100000, 999999)}`, name: `Case ${code}`, typologyId: typology.id, value: Math.round(value * (1 + risk / 100)), dueHour: state.elapsedHours + 48, required: typology.required, status: 'open' });
  state.cases = state.cases.slice(0, 12);
  addIncident(`${typology.name} spike opened ${code}; ${formatMoney(value)} estimated at stake.`);
}

function assignCase(id) {
  const openCase = state.cases.find(c => c.id === id);
  if (!openCase) return;
  if (!employeeCount(openCase.required)) return addLog(`No ${openCase.required} available for ${openCase.name}.`), render();
  const typology = typologies.find(t => t.id === openCase.typologyId);
  const die = roll(20);
  const specialistMod = employeeCount(openCase.required) * 3;
  const controlMod = typology.controls.some(hasControl) ? 2 : 0;
  const burnoutMod = state.burnout > 20 ? -4 : 0;
  const aiMod = state.aiSophistication > 2 ? -3 : 0;
  const total = die + specialistMod + controlMod + burnoutMod + aiMod;
  let seized = 0, result = 'failure';
  if (die === 20) { seized = openCase.value * 1.1; state.trust += 5; result = 'critical success — landmark case'; }
  else if (total >= 16) { seized = openCase.value * 0.55; state.trust += 1.8; result = 'success'; }
  else if (total >= 9) { seized = openCase.value * 0.25; result = 'partial'; }
  else if (die === 1) { state.aiSophistication += hasControl('amlInsurance') ? 0.075 : 0.15; state.typologyPressure[openCase.typologyId] *= 1.1; result = 'critical failure'; }
  else { state.typologyPressure[openCase.typologyId] *= 1.1; result = 'failure'; }
  state.seizedFunds += seized;
  state.regulatorRelationship = clamp(state.regulatorRelationship + (seized ? 1.5 : -1), 0, 100);
  state.casesResolved += 1;
  openCase.status = 'resolved';
  const breakdown = `d20 ${die} + specialist ${specialistMod} + control ${controlMod} + burnout ${burnoutMod} + AI ${aiMod} = ${total}`;
  addLog(`${openCase.name} resolved as ${result}. ${breakdown}. Seized ${formatMoney(seized)}.`);
  showModal(`<div class="modal-card"><h2>Case Resolution Roll</h2><p><strong>${openCase.name}</strong>: ${result}</p><p>${breakdown}</p><p>Seizure: ${formatMoney(seized)}</p><div class="modal-actions"><button id="close-roll">Continue</button></div></div>`);
  document.querySelector('#close-roll').addEventListener('click', () => { hideModal(); render(); });
  render();
}

function expireCases() {
  state.cases.filter(c => c.status === 'open' && c.dueHour <= state.elapsedHours).forEach(c => {
    c.status = 'expired';
    state.escapedFunds += c.value;
    state.illicitFunds += c.value;
    state.trust = clamp(state.trust - 1.2, 0, 100);
    addLog(`${c.name} expired unresolved. Illicit funds accumulated and staff learned from the missed case.`);
  });
}

function maybeCreateActorProfile(typology, value, risk) {
  if (state.actorProfiles.some(a => a.typologyId === typology.id)) return;
  const colours = ['AMBER', 'OBSIDIAN', 'CIPHER', 'NOMAD', 'VECTOR', 'SABLE'];
  state.actorProfiles.unshift({ typologyId: typology.id, code: `NETWORK ${colours[Math.floor(rng() * colours.length)]}`, value: Math.round(value * 18), priority: risk > 75, modus: `Inferred ${typology.name.toLowerCase()} network exploiting ${currentCompany().ventures.join(' and ')} with layered movement and weak-control arbitrage.` });
}

function triggerRegulatoryEvent() {
  const eventType = pick(eventTypes);
  const event = { ...eventType, id: `${eventType.id}-${state.elapsedHours}`, typologyId: pick(typologies).id, expiresHour: state.elapsedHours + eventType.duration, responded: false };
  if (eventType.id === 'fatfList') {
    state.typologyPressure.sanctionsEvasion *= 1.3; state.typologyPressure.proliferationFinancing *= 1.3;
  }
  if (eventType.id === 'industryAlert') state.typologyPressure[event.typologyId] *= 1.25;
  if (eventType.id === 'correspondentSuspension' && isCorrespondentActive()) { state.trust -= 4; state.budget -= 1400; }
  state.activeEvents.push(event);
  state.nextRegEventDay = getDay() + randInt(7, 12);
  addLog(`${eventType.name}: ${eventType.detail}`);
}

function respondEvent(id) {
  const event = state.activeEvents.find(e => e.id === id);
  if (!event || event.responded) return;
  event.responded = true;
  const governance = getActiveControlsFor('governanceFailure') + (hasControl('qaAudit') ? 12 : 0);
  if (event.id.startsWith('inspection') && governance < 24) { state.trust -= 3; state.regulatorRelationship -= 4; addLog('Audit pack was thin; regulator noted QA remediation gaps.'); }
  else { state.regulatorRelationship = clamp(state.regulatorRelationship + 4, 0, 100); state.trust = clamp(state.trust + 1, 0, 100); state.complianceCulture = clamp(state.complianceCulture + 2, 0, 100); state.regulatoryEventsSurvived += 1; addLog(`${event.name} response accepted; regulator relationship improved.`); }
  render();
}

function expireRegEvents() {
  state.activeEvents.filter(e => !e.responded && e.expiresHour <= state.elapsedHours).forEach(e => {
    e.responded = true;
    if (e.good) { addLog(`${e.name} windfall window closed.`); return; }
    state.trust = clamp(state.trust - 4, 0, 100);
    state.regulatorRelationship = clamp(state.regulatorRelationship - 6, 0, 100); state.complianceCulture = clamp(state.complianceCulture - 4, 0, 100);
    addLog(`${e.name} went unanswered. Trust dropped and supervisory posture hardened.`);
  });
}

function triggerSanctionsUpdate() {
  state.nextSanctionsDay = getDay() + randInt(8, 10);
  if (hasControl('sanctionsStack')) {
    state.trust = clamp(state.trust + 1.5, 0, 100);
    state.regulatorRelationship = clamp(state.regulatorRelationship + 1.2, 0, 100);
    addLog('Sanctions List Update auto-absorbed by screening stack; wallet/entity clusters refreshed.');
  } else {
    state.typologyPressure.sanctionsEvasion *= 1.2;
    addLog('Sanctions List Update missed: sanctions evasion pressure spiked 20% pending screening stack deployment.');
  }
}

function maybePppBulletin() {
  if (!hasControl('ppp') || state.elapsedHours % 120 !== 0) return;
  const surging = typologies.map(t => ({ t, risk: getTypologyRisk(t) })).sort((a, b) => b.risk - a.risk).slice(0, 2).map(x => x.t);
  state.pppBulletins.push({ typologyIds: surging.map(t => t.id), expiresHour: state.elapsedHours + 120 });
  addLog(`Public-private intelligence bulletin: sector surge in ${surging.map(t => t.name).join(' and ')}. Temporary coverage bonus applied.`);
}

function maybeCorrespondentChallenge() {
  if (!isCorrespondentActive() || state.correspondentChallenge || state.elapsedHours % 168 !== 0 || getDay() < 5) return;
  const high = rng() < 0.55;
  state.correspondentChallenge = { high, revealed: false, dueHour: state.elapsedHours + 24, name: high ? 'Noble Silk Bank' : 'Harbour Mutual Bank', jurisdiction: high ? 'recently grey-listed corridor' : 'stable OECD market', ownership: high ? 'layered offshore nominees' : 'transparent regulated parent', sanctions: high ? 'historic exposure to blocked vessels' : 'no direct matches' };
  state.running = false;
  showCorrespondentModal();
}

function showCorrespondentModal() {
  const c = state.correspondentChallenge; if (!c) return;
  showModal(`<div class="modal-card"><h2>Correspondent Due Diligence</h2><p><strong>${c.name}</strong> seeks access. Jurisdiction: ${c.jurisdiction}. Ownership: ${c.revealed ? c.ownership : 'not yet fully verified'}. Sanctions exposure: ${c.revealed ? c.sanctions : 'screening incomplete'}.</p><div class="modal-actions"><button id="accept-cor">Accept</button><button id="reject-cor">Reject</button><button class="secondary" id="rfi-cor">Request more information</button></div></div>`);
  document.querySelector('#accept-cor').addEventListener('click', () => decideCorrespondent('accept'));
  document.querySelector('#reject-cor').addEventListener('click', () => decideCorrespondent('reject'));
  document.querySelector('#rfi-cor').addEventListener('click', () => decideCorrespondent('rfi'));
}

function decideCorrespondent(decision) {
  const c = state.correspondentChallenge;
  if (decision === 'rfi') { c.revealed = true; c.dueHour += 24; return showCorrespondentModal(); }
  if (decision === 'accept' && c.high) { state.typologyPressure.sanctionsEvasion += 0.8; state.typologyPressure.proliferationFinancing += 0.7; state.regulatorRelationship -= 5; addLog(`Accepted high-risk ${c.name}; sanctions/PF pressure spiked.`); }
  if (decision === 'reject' && c.high) { state.regulatorRelationship += 4; addLog(`Rejected high-risk ${c.name}; due diligence decision impressed the regulator.`); }
  if (decision === 'reject' && !c.high) { state.legitimateRevenue -= 900; addLog(`Rejected low-risk ${c.name}; income opportunity lost.`); }
  if (decision === 'accept' && !c.high) { state.regulatorRelationship += 2; state.legitimateRevenue += 1200; addLog(`Accepted low-risk ${c.name}; relationship revenue improved.`); }
  state.correspondentChallenge = null; hideModal(); state.running = true; ensureLoop(); render();
}

function registerComplaint() {
  const reduction = hasControl('awareness') ? 0.5 : 1;
  if (rng() > reduction) return;
  state.complaints += 1;
  if (state.complaints >= 10) {
    state.complaints = 0;
    state.trust = clamp(state.trust - 5, 0, 100);
    state.regulatorRelationship = clamp(state.regulatorRelationship - 4, 0, 100);
    addLog('Consumer Protection Review opened after complaint spike. Trust and regulator relationship dropped.');
  }
}

function updateAlertQueueAndBurnout() {
  const pressure = calculateThreat();
  const exposure = typologies.reduce((sum, t) => sum + getBusinessExposure(t), 0) / typologies.length;
  const analysts = Object.values(state.employees).reduce((sum, e) => sum + e.count, 0) + 1;
  const coverage = Math.max(1, controlsCount() * 10 + analysts * 8);
  state.alertQueue = Math.round((pressure * exposure * 28) / (analysts + coverage / 30));
  if (state.fraudMl > 80 || state.alertQueue > 150) state.burnoutDays += HOURS_PER_TICK / 24; else state.burnoutDays = Math.max(0, state.burnoutDays - 0.25);
  if (state.burnoutDays > 6) {
    state.burnout = clamp(state.burnout + 15 * (HOURS_PER_TICK / 24), 0, 100);
    if (rng() < 0.04) addLog('Alert queue backlog is unsustainable. Staff morale declining.');
  }
  if (state.complianceCulture < 30 && state.elapsedHours % 240 === 0) poachEmployee();
  if (state.burnout >= 100) {
    const frontline = Object.keys(state.employees).find(id => state.employees[id].count > 0 && id !== 'mlro');
    if (frontline) { state.employees[frontline].count -= 1; state.burnout = 45; addLog(`${state.employees[frontline].title} resigned due to sustained alert fatigue.`); }
  }
}

function dailyBriefing() {
  if (!state.dailyBriefings || state.elapsedHours % 24 !== 0 || state.elapsedHours === 0) return;
  state.running = false;
  const top = typologies.map(t => ({ t, risk: getTypologyRisk(t) })).sort((a, b) => b.risk - a.risk).slice(0, 3);
  const recommendation = top[0].t.controls.map(formatCounterName).join(', ');
  const budgetHealth = state.budget < 5000 ? 'critical' : state.budget < 14000 ? 'tight' : 'stable';
  showModal(`<div class="modal-card"><h2>Daily Briefing · Day ${getDay()}</h2><p><strong>Top 3 threats today:</strong> ${top.map(x => `${x.t.name} (${Math.round(x.risk)})`).join(', ')}.</p><p><strong>Recommended action:</strong> reinforce ${top[0].t.name} with ${recommendation}.</p><p><strong>Budget health:</strong> ${budgetHealth}. <strong>Regulator temperature:</strong> ${getRegulatorTier()}.</p><div class="modal-actions"><button id="ack-briefing">Acknowledge & Resume</button></div></div>`);
  document.querySelector('#ack-briefing').addEventListener('click', () => { hideModal(); state.running = true; ensureLoop(); render(); });
}

function generateIncident() {
  const top = typologies.map(t => ({ t, risk: getTypologyRisk(t) })).sort((a, b) => b.risk - a.risk)[0];
  const amount = formatMoney(randBetween(8000, 188000));
  const templates = [
    `Wire transfer of ${amount} received from high-risk jurisdiction — sanctions screening queued.`,
    `Structuring pattern detected: ${randInt(6, 13)} deposits below threshold across ${randInt(2, 5)} branches.`,
    `Ransomware wallet flagged by blockchain analytics — ${top.t.name} case opened for triage.`,
    `New account velocity anomaly linked to ${top.t.short}; analyst queue priority raised.`,
    `Adverse media hit on UBO connected to ${currentCompany().ventures[0]} exposure.`
  ];
  if (rng() < 0.45) addIncident(pick(templates));
}

function seededIndex(length, salt = 0) {
  if (!length) return 0;
  return Math.abs(((state.seed || 1) + salt * 2654435761 + Math.floor(state.elapsedHours / 24) * 97) | 0) % length;
}

function generateHeadline(forced) {
  if (forced) { state.lastHeadline = forced; return; }
  if (state.realWorldNews && state.elapsedHours % 2 === 0) { state.lastHeadline = realWorldHeadlines[seededIndex(realWorldHeadlines.length, 7)]; return; }
  const company = currentCompany();
  const risks = Object.fromEntries(typologies.map(t => [t.id, getTypologyRisk(t)]));
  const headlines = [
    `Central Bank of Bahrain issues AML guidance to neobanks following rising mule account cases`,
    `${company.name} faces regulator scrutiny over ransomware proceeds`,
    `FATF typology alert warns institutions about sanctions and PF corridor abuse`,
    `Consumer groups warn of scam losses as alert queues grow across digital banks`,
    `Public-private intelligence bulletin highlights TBML and mule account convergence`,
    `${company.name} board reviews MLRO report as regulator relationship turns ${getRegulatorTier()}`
  ];
  if (company.id === 'cryptoExchange' && risks.cyber > 40) state.lastHeadline = headlines[1];
  else if (risks.muleNetworks > 40) state.lastHeadline = headlines[0];
  else state.lastHeadline = headlines[seededIndex(headlines.length, 13)];
}

function processEconomics() {
  const company = currentCompany(); const jurisdiction = currentJurisdiction();
  const bullBoost = state.marketCondition === 'bull' && getDay() <= 15 ? 1.12 : 1;
  const partnershipBoost = state.windfalls.some(w => w.incomeBoost && w.expiresHour > state.elapsedHours) ? 1.08 : 1;
  const revenueRate = 820 * company.income * jurisdiction.income * bullBoost * partnershipBoost * (1 - calculateRevenueDrag()) * (state.trust / 100);
  const safeRevenueRate = Math.max(120, revenueRate);
  state.legitimateRevenue += safeRevenueRate;
  const enforcementFine = getRegulatorTier() === 'Enforcement' ? Math.max(0, 45 - averageCoverage()) * 8 : 0;
  const insurancePremium = hasControl('amlInsurance') && controlsCount() >= 3 ? getUpkeep() * state.insurancePremiumRate : 0;
  state.budget += safeRevenueRate * 0.18 - getPayroll() - getUpkeep() - enforcementFine - insurancePremium;
  if (enforcementFine) addIncident(`Enforcement fine applied: ${formatMoney(enforcementFine)} for coverage gap against expected controls.`);
  if (state.budget < 0 && state.elapsedHours % 24 === 0) state.negativeBudgetDays += 1;
  if (state.budget >= 0) state.negativeBudgetDays = 0;
}

function averageCoverage() { return typologies.reduce((sum, t) => sum + getActiveControlsFor(t.id), 0) / typologies.length; }



function processCorridorRisk() {
  if (state.elapsedHours % 168 !== 0 || getDay() < 2) return;
  const corridor = pick(corridors);
  state.corridorRisks[corridor.id] = clamp((state.corridorRisks[corridor.id] ?? corridor.risk) + randInt(-8, 22), 5, 95);
  if (state.corridorRisks[corridor.id] > 65) {
    corridor.typologies.forEach(id => { state.typologyPressure[id] *= 1.2; });
    addLog(`${corridor.name} corridor turned red; linked typologies received a 20% pressure boost.`);
    markCalendar('red', `${corridor.name} red`);
  }
}

function processCriminalInnovation() {
  if (getDay() < state.nextInnovationDay) return;
  const typology = pick(typologies);
  const tactic = pick(['Layering Leap', 'Corridor Shift', 'Velocity Burst', 'Obfuscation Screen']);
  const innovation = { id: `innovation-${state.elapsedHours}-${randInt(100,999)}`, typologyId: typology.id, tactic, expiresHour: state.elapsedHours + (tactic === 'Obfuscation Screen' ? 36 : 48), controlId: pick(typology.controls || ['monitoring']) };
  if (tactic === 'Corridor Shift') innovation.venture = pick(currentCompany().ventures);
  if (tactic === 'Velocity Burst') state.typologyPressure[typology.id] *= 2;
  state.criminalInnovations.push(innovation);
  state.activeEvents.push({ id: innovation.id, name: `Criminal Innovation: ${tactic}`, detail: `${typology.name} has adopted ${tactic}.`, expiresHour: innovation.expiresHour, responded: false, action: 'Review controls', good: false });
  state.nextInnovationDay = getDay() + randInt(9, 14);
  addLog(`Criminal innovation: ${typology.name} adopted ${tactic}.`);
  markCalendar('red', `Innovation: ${typology.short}`);
  maybeTeach('mutation', 'Criminal networks innovate when controls become predictable. FATF Recommendations expect ongoing monitoring, tuning, and typology learning rather than static scenarios.');
}


function processInstitutionCollab() {
  if (getDay() < state.nextInstitutionCollabDay) return;
  state.nextInstitutionCollabDay = getDay() + randInt(10, 15);
  const typology = pick(typologies);
  state.running = false;
  showModal(`<div class="modal-card"><h2>Inter-Institutional Collaboration</h2><p>FinTech Alliance requests joint typology data-sharing on <strong>${typology.name}</strong>. Sharing gives a temporary coverage boost but may reveal weak controls if your coverage is thin.</p><div class="modal-actions"><button id="share-collab">Share data</button><button class="secondary" id="refuse-collab">Refuse</button></div></div>`);
  document.querySelector('#share-collab').addEventListener('click', () => { const boost = hasControl('ppp') ? 0.3 : 0.15; state.pppBulletins.push({ typologyIds: [typology.id], expiresHour: state.elapsedHours + 168, boost }); if (getActiveControlsFor(typology.id) < 20) state.trust -= 1; addLog(`Shared sector intelligence on ${typology.name}; temporary coverage boost applied.`); hideModal(); state.running = true; ensureLoop(); render(); });
  document.querySelector('#refuse-collab').addEventListener('click', () => { addLog(`Declined collaboration request on ${typology.name}.`); hideModal(); state.running = true; ensureLoop(); render(); });
}

function processWindfall() {
  if (getDay() < state.nextWindfallDay) return;
  const type = pick(['Regulatory Award', 'Asset Forfeiture Dividend', 'Strategic Partnership', 'Staff Recognition', 'Grant Funding']);
  if (type === 'Regulatory Award') { state.trust = clamp(state.trust + 8, 0, 100); state.regulatorRelationship = clamp(state.regulatorRelationship + 10, 0, 100); }
  if (type === 'Asset Forfeiture Dividend') state.budget += state.budget * randBetween(0.05, 0.15);
  if (type === 'Strategic Partnership') state.windfalls.push({ type, expiresHour: state.elapsedHours + 240, incomeBoost: 0.08 });
  if (type === 'Staff Recognition') { const hired = Object.keys(state.employees).filter(id => state.employees[id].count > 0); if (hired.length) state.employeeAwards[pick(hired)] = true; }
  if (type === 'Grant Funding') state.budget += randInt(8000, 18000);
  state.activeEvents.push({ id: `windfall-${state.elapsedHours}`, name: type, detail: 'Positive sector development improves resilience.', expiresHour: state.elapsedHours + 48, responded: false, good: true, action: 'Acknowledge' });
  state.nextWindfallDay = getDay() + randInt(6, 10);
  state.complianceCulture = clamp(state.complianceCulture + 2, 0, 100);
  addLog(`Windfall event: ${type}.`);
  markCalendar('green', type);
}

function processThreatCollaboration() {
  if (getDay() < state.nextCollaborationDay) return;
  const first = pick(typologies);
  let second = pick(typologies);
  while (second.id === first.id) second = pick(typologies);
  state.threatCollaborations.push({ typologyIds: [first.id, second.id], expiresHour: state.elapsedHours + (hasControl('fiu') || hasControl('lawEnforcement') ? 72 : 120) });
  state.nextCollaborationDay = getDay() + randInt(12, 18);
  addLog(`${first.name} and ${second.name} networks are sharing infrastructure. Coverage is 20% less effective unless a control targets both.`);
}

function processRogueEmployee() {
  if (state.rogueEmployeeDone || getDay() < state.rogueEmployeeDay) return;
  const hired = Object.values(state.employees).filter(e => e.count > 0);
  if (!hired.length) return;
  if (hasControl('qaAudit') && !state.misconductWarning) {
    const employee = pick(hired);
    state.misconductWarning = { employeeId: employee.id, dueHour: state.elapsedHours + 24 };
    addLog(`QA advance warning: possible misconduct indicator involving ${employee.title}.`);
    return;
  }
  const employee = state.misconductWarning ? state.employees[state.misconductWarning.employeeId] : pick(hired.flatMap(e => Array(e.id === 'mlro' ? 1 : 3).fill(e)));
  showMisconductModal(employee);
  state.rogueEmployeeDone = true;
}

function showMisconductModal(employee) {
  if (!employee) return;
  state.running = false;
  showModal(`<div class="modal-card"><h2>Internal Misconduct Alert</h2><p><strong>${employee.title}</strong> flagged by QA review. Choose a response.</p><div class="modal-actions"><button id="misconduct-investigate">Investigate internally</button><button id="misconduct-terminate">Terminate immediately</button><button class="secondary" id="misconduct-ignore">Ignore</button></div></div>`);
  document.querySelector('#misconduct-investigate').addEventListener('click', () => { state.budget -= 3500; state.regulatorRelationship += 3; state.complianceCulture += 5; addLog(`Internal investigation opened for ${employee.title}; 72-hour remediation workstream started.`); closeMisconduct(); });
  document.querySelector('#misconduct-terminate').addEventListener('click', () => { state.employees[employee.id].count = Math.max(0, state.employees[employee.id].count - 1); state.complianceCulture += 2; addLog(`${employee.title} terminated after misconduct alert.`); closeMisconduct(); });
  document.querySelector('#misconduct-ignore').addEventListener('click', () => { state.trust -= 8; state.aiSophistication += 0.3; state.complianceCulture -= 8; addLog(`Ignored misconduct alert; compromised employee leaked intelligence to criminal networks.`); closeMisconduct(); });
}
function closeMisconduct() { hideModal(); state.running = true; ensureLoop(); render(); }

function processBudgetShock() {
  if (!state.budgetShockDays.includes(getDay()) || state.budgetShocksFired >= 3 || state.activeEvents.some(e => e.id === `shock-${getDay()}`)) return;
  state.budgetShocksFired += 1;
  const type = pick(['Technology Failure', 'Regulatory Fine', 'Cyber Incident', 'Staff Poaching']);
  const cost = type === 'Regulatory Fine' ? state.budget * randBetween(0.04, 0.09) : randInt(6000, 14000);
  const absorbed = hasControl('amlInsurance') && state.insuranceClaims < 2 && controlsCount() >= 3;
  const netCost = absorbed ? cost * 0.5 : cost;
  if (absorbed) { state.insuranceClaims += 1; state.insurancePremiumRate += 0.01; }
  if (type === 'Cyber Incident') state.typologyPressure.cyber *= 1.25;
  if (type === 'Technology Failure') state.suspendedControls.monitoring = state.elapsedHours + 48;
  if (type === 'Staff Poaching') poachEmployee(); else state.budget -= netCost;
  state.activeEvents.push({ id: `shock-${getDay()}`, name: type, detail: `${type} cost ${formatMoney(netCost)}${absorbed ? ' after AML insurance.' : '.'}`, expiresHour: state.elapsedHours + 48, responded: true, action: 'Recover' });
  addLog(`Budget shock: ${type}. ${absorbed ? 'Insurance absorbed half the cost.' : 'Budget absorbed the loss.'}`);
  markCalendar('red', type);
}

function poachEmployee() {
  const hired = Object.keys(state.employees).filter(id => state.employees[id].count > 0);
  if (!hired.length) return;
  const id = pick(hired);
  state.employees[id].count -= 1;
  addLog(`${state.employees[id].title} was poached by a rival firm.`);
}

function processMutationsAndTakedowns() {
  typologies.forEach(t => {
    const risk = getTypologyRisk(t);
    state.mutationTimers[t.id] = risk > 80 ? (state.mutationTimers[t.id] || 0) + HOURS_PER_TICK / 24 : 0;
    if (!state.mutations[t.id] && state.mutationTimers[t.id] > 5) {
      const names = { structuring: 'Digital Micro-Structuring', muleNetworks: 'Professional Money Mule Rings', cyber: 'AI-Generated Deepfake Fraud' };
      state.mutations[t.id] = names[t.id] || `Advanced ${t.name}`;
      addLog(`${t.name} mutated into ${state.mutations[t.id]}. Criminal methods evolved after sustained red-zone risk.`);
      maybeTeach('mutation', 'This mutation reflects typology evolution: criminals adapt to thresholds, staffing constraints, and identity controls when risk remains unchecked.');
    }
    state.neutraliseTimers[t.id] = risk < 10 ? (state.neutraliseTimers[t.id] || 0) + HOURS_PER_TICK / 24 : 0;
    if (!state.neutralised[t.id] && state.neutraliseTimers[t.id] > 5) {
      state.neutralised[t.id] = true;
      state.seizedFunds += 2500;
      state.regulatorRelationship = clamp(state.regulatorRelationship + 15, 0, 100);
      addLog(`NETWORK NEUTRALISED: ${t.name} stayed below risk 10 for five days.`);
      updateTrainingLeaderboard('firstNeutralise', getDay());
    }
    if (state.neutralised[t.id] && risk > 20) state.neutralised[t.id] = false;
  });
}

function processPressureAuction() {
  if (state.aiSophistication <= 2 || state.elapsedHours % 192 !== 0) return;
  const target = typologies.map(t => ({ t, ratio: getActiveControlsFor(t.id) / Math.max(1, getTypologyRisk(t)) })).sort((a, b) => a.ratio - b.ratio)[0].t;
  state.pressureAuctions.push({ typologyId: target.id, dueHour: state.elapsedHours + 24, initialCoverage: getActiveControlsFor(target.id), applied: false });
  addLog(`Target Acquired: criminal bidding system selected ${target.name}. Raise coverage within 24h to force AI cooldown.`);
}

function resolvePressureAuctions() {
  state.pressureAuctions.filter(a => !a.applied && a.dueHour <= state.elapsedHours).forEach(a => {
    const coverage = getActiveControlsFor(a.typologyId);
    if (coverage > a.initialCoverage + 8) { state.aiSophistication = Math.max(1, state.aiSophistication - 0.08); addLog(`AI bidding on ${typologies.find(t=>t.id===a.typologyId).name} was repelled; growth cooled.`); }
    else { state.typologyPressure[a.typologyId] += 0.9; addLog(`AI pressure auction landed on ${typologies.find(t=>t.id===a.typologyId).name}; pressure increased.`); }
    a.applied = true;
  });
}

function processCascadingFailure() {
  const red = typologies.filter(t => getTypologyRisk(t) > 70);
  state.cascadeDays = red.length >= 2 ? state.cascadeDays + HOURS_PER_TICK / 24 : 0;
  if (!state.cascadeEvent && state.cascadeDays > 3) {
    const active = Object.keys(state.controls).filter(id => state.controls[id] > 0);
    if (active.length) state.suspendedControls[pick(active)] = state.elapsedHours + 36;
    state.trust = clamp(state.trust - 6, 0, 100);
    state.cascadeEvent = { dueHour: state.elapsedHours + 72 };
    addLog('Dear CEO Letter: dual red-zone typologies created system stress. Reduce one threat to amber within 72h.');
    maybeTeach('cascade', 'Cascading failure shows how alert volume can overwhelm even deployed controls. Supervisors expect boards to recognise system stress before it becomes enforcement.');
  }
  if (state.cascadeEvent && state.cascadeEvent.dueHour <= state.elapsedHours && red.length >= 2) {
    state.regulatorRelationship = clamp(state.regulatorRelationship - 20, 0, 100);
    addLog('Formal enforcement action began after the Dear CEO Letter window expired.');
    state.cascadeEvent = null;
  }
}

function processHotlineAndDarkWeb() {
  if (hasControl('whistleblowerHotline') && getDay() >= state.nextHotlineDay) {
    state.nextHotlineDay = getDay() + randInt(8, 10);
    if (rng() < 0.3) showTipModal();
  }
  if (state.elapsedHours % 120 === 0) {
    const typology = pick(typologies);
    state.darkwebIntel.unshift({ typologyId: typology.id, expiresHour: state.elapsedHours + 240, text: pick([
      `████ forum post advertising bank account access for sale — suspected institution: ${currentCompany().name}.`,
      `Ransomware group ████ announcing new target sector linked to ${currentCompany().ventures[0]}.`,
      `Mule recruitment ad detected — offering up to $800/transfer; likely ${typology.short} exposure.`
    ]) });
    state.darkwebIntel = state.darkwebIntel.filter(i => i.expiresHour > state.elapsedHours).slice(0, 8);
  }
}

function showTipModal() {
  const type = pick(['employee', 'client', 'control']);
  const weakest = typologies.map(t => ({ t, c: getActiveControlsFor(t.id) })).sort((a,b)=>a.c-b.c)[0].t;
  showModal(`<div class="modal-card"><h2>Anonymous Whistleblower Tip</h2><p>${type === 'employee' ? 'A staff member reports unusual after-hours access by a colleague.' : type === 'client' ? `A client pattern suggests an imminent ${weakest.name} spike.` : `The weakest control gap appears to be ${weakest.controls.map(formatCounterName).join(', ')}.`}</p><div class="modal-actions"><button id="ack-tip">Acknowledge</button></div></div>`);
  state.running = false;
  document.querySelector('#ack-tip').addEventListener('click', () => { hideModal(); state.running = true; ensureLoop(); render(); });
}



function showOnboardingChallenge() {
  if (state.onboardingDone) return;
  state.onboardingDone = true;
  const risky = rng() < 0.5;
  const applicant = risky
    ? { name: 'Blue Orchid Trading', nationality: 'High-risk corridor', business: 'Import/export consulting', source: 'Consulting fees with limited detail', profile: 'Large first-month wires', pep: 'PEP-adjacent', answer: 'Enhanced Due Diligence' }
    : { name: 'Green Salary Services', nationality: currentJurisdiction().name, business: 'Payroll bureau', source: 'Audited operating revenue', profile: 'Recurring salary batches', pep: 'No', answer: 'Standard KYC' };
  state.running = false;
  showModal(`<div class="modal-card"><h2>Client Onboarding Simulator</h2><p>Name: ${applicant.name}<br>Nationality: ${applicant.nationality}<br>Business: ${applicant.business}<br>Source of funds: ${applicant.source}<br>Transaction profile: ${applicant.profile}<br>PEP status: ${applicant.pep}</p><div class="modal-actions">${['Standard KYC','Enhanced Due Diligence','Decline'].map(a=>`<button onclick="decideOnboarding('${a}','${applicant.answer}')">${a}</button>`).join('')}</div></div>`);
}
function decideOnboarding(decision, answer) {
  if (decision === answer) { state.trust += 1; state.regulatorRelationship += 1; state.ventureRiskAdjustments[currentCompany().ventures[0]] = -0.2; addLog(`Correct onboarding decision: ${decision}. Initial venture exposure reduced.`); }
  else { state.ventureRiskAdjustments[currentCompany().ventures[0]] = 0.1; state.fraudMl += 2; addLog(`Onboarding miss: selected ${decision}; expected ${answer}. Venture baseline risk increased.`); }
  hideModal(); state.running = true; ensureLoop(); render();
}

function processIntercept() {
  if (state.interceptRolled || getDay() < 8) return;
  state.interceptRolled = true;
  if (rng() >= 0.1) return;
  const typology = pick(typologies);
  state.interceptedIntel = { typologyId: typology.id, expiresHour: state.elapsedHours + 48 };
  state.running = false;
  showModal(`<div class="modal-card"><h2>Encrypted Communications Intercept</h2><p>████ message: "Shift funds through ${currentCompany().ventures[0]} before monitoring adapts. ${typology.short} window open."</p><p>Deploy ${typology.controls.map(formatCounterName).join(' or ')} within 48h to convert this intercept into a case capture.</p><div class="modal-actions"><button id="ack-intercept">Acknowledge</button></div></div>`);
  document.querySelector('#ack-intercept').addEventListener('click', () => { hideModal(); state.running = true; ensureLoop(); render(); });
}
function resolveIntercept() {
  if (!state.interceptedIntel) return;
  const typology = typologies.find(t => t.id === state.interceptedIntel.typologyId);
  if (state.interceptedIntel.expiresHour <= state.elapsedHours) { state.interceptedIntel = null; addLog('Intercept intelligence went stale.'); return; }
  if (typology.controls.some(hasControl)) { const seized = 5000; state.seizedFunds += seized; state.trust += 4; createCase(typology, seized, 80); addLog(`Intercept acted on correctly; ${typology.name} case capture opened with high seizure potential.`); state.interceptedIntel = null; }
}

function processTransactionChallenge() {
  if (state.elapsedHours % 168 !== 0 || !currentCompany().ventures.some(v => ['Crypto Gateway', 'Wallet Custody', 'Instant Payments'].includes(v)) || getDay() < 4) return;
  const scenario = pick(transactionScenarios);
  state.running = false;
  showModal(`<div class="modal-card"><h2>High-Risk Transaction Challenge</h2><p><strong>${formatMoney(scenario.amount)}</strong> from ${scenario.origin} to ${scenario.destination}.</p><ul>${scenario.data.map(d=>`<li>${d}</li>`).join('')}</ul><div class="modal-actions">${['Allow','Block','Escalate'].map(a=>`<button onclick="decideTransaction('${a}','${scenario.answer}',${scenario.amount})">${a}</button>`).join('')}</div></div>`);
}

function decideTransaction(decision, answer, amount) {
  if (decision === answer) { state.trust += 1.5; state.regulatorRelationship += 1; addLog(`Correct transaction decision: ${decision}. Coverage confidence improved.`); }
  else { state.illicitFunds += amount; state.fraudMl += 3; addLog(`Incorrect transaction decision: ${decision}; correct response was ${answer}.`); }
  hideModal(); state.running = true; ensureLoop(); render();
}

function recordHistory() {
  if (state.elapsedHours % 24 !== 0) return;
  typologies.forEach(t => {
    state.typologyHistory[t.id] = state.typologyHistory[t.id] || [];
    state.typologyHistory[t.id].push({ day: getDay(), risk: Math.round(getTypologyRisk(t)) });
    state.typologyHistory[t.id] = state.typologyHistory[t.id].slice(-20);
  });
}

function markCalendar(kind, label) { state.calendarMarks.push({ day: getDay(), kind, label }); }

function maybeTeach(id, text) {
  if (!state.trainingMode || state[`taught_${id}`]) return;
  state[`taught_${id}`] = true;
  state.running = false;
  showModal(`<div class="modal-card"><h2>Teaching Point</h2><p>${text}</p><p>Framework link: FATF Recommendations, Basel AML Index, Wolfsberg Principles, and ACAMS standards all emphasise risk-based, documented decision-making.</p><div class="modal-actions"><button id="teach-next">Continue</button></div></div>`);
  document.querySelector('#teach-next').addEventListener('click', () => { hideModal(); state.running = true; ensureLoop(); render(); });
}

function tick() {
  if (!state.running || state.ended) return;
  state.elapsedHours += HOURS_PER_TICK;
  Object.keys(state.controlAge).forEach(id => { state.controlAge[id] += HOURS_PER_TICK; });
  completeDeployments(); adaptAi(); processEconomics();
  const predictive = hasControl('predictiveRisk') ? 0.8 : 1;
  typologies.forEach(typology => {
    const sampledGrowth = randNormal(typology.growth, typology.growth * (typology.volatility || 0.25));
    state.typologyPressure[typology.id] = Math.max(0.05, state.typologyPressure[typology.id] + sampledGrowth * state.aiSophistication * predictive * getSeasonalModifier(typology.id));
    resolveTypology(typology);
  });
  state.fraudMl = clamp(state.fraudMl - controlsCount() * 0.025, 0, 190);
  state.regulatorRelationship = clamp(state.regulatorRelationship + (hasControl('governance') ? 0.03 : 0) + (hasControl('qaAudit') ? 0.04 : 0) - (state.fraudMl > 80 ? 0.08 : 0), 0, 100);
  updateAlertQueueAndBurnout(); expireCases(); processStrClock(); expireRegEvents(); maybePppBulletin(); maybeCorrespondentChallenge(); processCorridorRisk(); processCriminalInnovation(); processWindfall(); processInstitutionCollab(); processThreatCollaboration(); processRogueEmployee(); processBudgetShock(); processMutationsAndTakedowns(); processPressureAuction(); resolvePressureAuctions(); processCascadingFailure(); processHotlineAndDarkWeb(); processIntercept(); resolveIntercept(); processTransactionChallenge(); recordHistory();
  if (getDay() >= state.nextRegEventDay) triggerRegulatoryEvent();
  if (getDay() >= state.nextSanctionsDay) triggerSanctionsUpdate();
  if (state.elapsedHours % 24 === 0) dailyBriefing();
  generateIncident(); checkEndConditions(); render();
}

function checkEndConditions() {
  const pfRisk = getTypologyRisk(typologies.find(t => t.id === 'proliferationFinancing'));
  if (state.fraudMl >= LEGACY_LOSS_THRESHOLD) return endGame(false, 'Fraud/ML Crisis', 'Illicit flows overwhelmed the control framework.', 'A risk-based AML programme must detect and disrupt typologies before they compound across products.');
  if (state.trust < 10 && getRegulatorTier() === 'Enforcement') return endGame(false, 'Regulatory Shutdown', 'Trust fell below 10 while the regulator was in enforcement posture.', 'Sustained supervisory breakdown can result in licence restrictions or shutdown.');
  if (state.negativeBudgetDays > 3) return endGame(false, 'Insolvency', 'Budget remained negative for more than three consecutive in-game days.', 'Compliance programmes need sustainable resourcing and runway, not one-off panic spend.');
  if (getDay() > 20 && state.trust < 15) return endGame(false, 'Reputational Collapse', 'Public trust fell below 15 after Day 20.', 'Customer confidence and complaint volumes are financial crime risk indicators.');
  if (pfRisk > 120 && isCorrespondentActive()) return endGame(false, 'Proliferation Financing Catastrophe', 'PF risk exceeded 120 while correspondent banking was active.', 'CPF controls around dual-use goods, sanctions screening, and correspondent due diligence are critical.');
  if (getDay() > WIN_DAY && state.fraudMl < 55 && state.trust >= 35 && state.regulatorRelationship >= 25) return endGame(true, 'Supervisory Cycle Survived', 'Day 45 reached with a viable AML programme.', 'Strong MLROs continuously balance prevention, detection, disruption, and governance.');
}

function endGame(won, reason, parallel, lesson) {
  state.running = false; state.ended = true; state.endReason = reason; clearInterval(loopId); loopId = null;
  const pillars = calculatePillars(); const stars = calculateStars(pillars);
  state.endDetails = { won, reason, parallel, lesson, pillars, stars };
  addLog(won ? `Victory: ${reason}.` : `Loss: ${reason}.`);
  updateCareer(won, stars); updateTrainingLeaderboard('end', getDay());
  showScorecard();
}

function calculatePillars() {
  return {
    Prevent: grade(averageTargetCoverage(['kyc', 'monitoring', 'sanctionsStack', 'awareness'])),
    Detect: grade(averageTargetCoverage(['monitoring', 'tradeAnalytics', 'aiAnomaly', 'beneficialOwnership'])),
    Disrupt: grade((state.casesResolved * 10 + state.filedStrs * 12 + state.seizedFunds / 800) / 3),
    Govern: grade((state.regulatorRelationship + getActiveControlsFor('governanceFailure') + (state.regulatoryEventsSurvived * 8)) / 2)
  };
}
function averageTargetCoverage(ids) { return ids.reduce((sum, id) => sum + (state.controls[id] || 0) * 18, 0) / ids.length; }
function grade(score) { return score > 85 ? 'A' : score > 70 ? 'B' : score > 55 ? 'C' : score > 40 ? 'D' : 'F'; }
function calculateStars(pillars) { const points = Object.values(pillars).reduce((s, g) => s + ({ A: 5, B: 4, C: 3, D: 2, F: 1 }[g]), 0); return clamp(Math.round(points / 4), 1, 5); }
function mlroCommentary() { if (state.endDetails.won) return 'A real MLRO would highlight that sustainable outcomes came from timely reporting, visible governance, and progressive control tuning rather than revenue alone.'; if (state.regulatorRelationship < 25) return 'A real MLRO would say the board allowed supervisory trust to fail; remediation should have started before enforcement.'; if (state.fraudMl > 100) return 'A real MLRO would say the alert queue and typology heat map showed red flags long before losses became visible.'; return 'A real MLRO would focus the post-incident review on resourcing, governance escalation, and lessons learned.'; }

function showScorecard() {
  const d = state.endDetails; const share = getShareText();
  showModal(`<div class="modal-card scorecard"><h2>${d.won ? 'Win' : 'Loss'} · ${d.reason}</h2><p>${d.parallel}</p><p class="training-note"><strong>Key lesson:</strong> ${d.lesson}</p><p><strong>Seed:</strong> ${state.seed}</p><div class="score-grid"><span>Fraud/ML <strong>${formatNumber(state.fraudMl)}</strong></span><span>Trust <strong>${formatNumber(state.trust)}</strong></span><span>Regulator <strong>${formatNumber(state.regulatorRelationship)}</strong></span><span>Budget <strong>${formatMoney(state.budget)}</strong></span><span>Seized <strong>${formatMoney(state.seizedFunds)}</strong></span><span>Escaped <strong>${formatMoney(state.escapedFunds)}</strong></span><span>STR/SARs <strong>${state.filedStrs}</strong></span><span>Cases <strong>${state.casesResolved}</strong></span><span>Events survived <strong>${state.regulatoryEventsSurvived}</strong></span></div><h3>AML pillars</h3><p>${Object.entries(d.pillars).map(([k,v]) => `${k}: ${v}`).join(' · ')}</p><h3>${'★'.repeat(d.stars)}${'☆'.repeat(5 - d.stars)} Overall</h3><p><strong>What a real MLRO would say:</strong> ${mlroCommentary()}</p><p><strong>AI-powered debrief simulation:</strong> ${regulatorExitLetter()}</p><textarea id="share-text" readonly>${share}</textarea><div class="modal-actions"><button id="play-again">Play Again</button><button id="share-score">Share Score</button><button id="export-report">Export Report</button></div></div>`);
  document.querySelector('#play-again').addEventListener('click', resetSimulation);
  document.querySelector('#share-score').addEventListener('click', () => navigator.clipboard?.writeText(share));
  document.querySelector('#export-report').addEventListener('click', exportReport);
}

function regulatorExitLetter() { return `Exit letter: The institution demonstrated ${state.filedStrs ? 'evidence of suspicious reporting discipline' : 'limited suspicious reporting evidence'}, final Fraud/ML of ${Math.round(state.fraudMl)}, and regulator relationship of ${Math.round(state.regulatorRelationship)}. Required remediation would focus on the weakest AML pillar, control refresh cadence, and board-owned risk appetite tracking.`; }

function getShareText() { return `${currentCompany().name} (${currentJurisdiction().name}) ${state.endDetails.reason}: Fraud/ML ${Math.round(state.fraudMl)}, Trust ${Math.round(state.trust)}, Regulator ${Math.round(state.regulatorRelationship)}, STR/SARs ${state.filedStrs}, Cases ${state.casesResolved}, ${state.endDetails.stars}/5 stars.`; }
function exportReport() {
  const weak = Object.entries(state.endDetails.pillars).sort((a,b) => a[1].localeCompare(b[1])).slice(0,3).map(([k]) => k);
  const report = `MLRO Annual Report\nCompany: ${currentCompany().name}\nJurisdiction: ${currentJurisdiction().name}\nControls deployed: ${Object.keys(state.controls).map(formatCounterName).join(', ') || 'None'}\nSTR/SARs filed: ${state.filedStrs}\nCases investigated: ${state.casesResolved}\nFinal Fraud/ML: ${Math.round(state.fraudMl)}\nTrust: ${Math.round(state.trust)}\nRegulator Relationship: ${Math.round(state.regulatorRelationship)}\nBudget: ${formatMoney(state.budget)}\nLessons learned: strengthen ${weak.join(', ')}; maintain continuous improvement; resource alert handling before burnout.`;
  const blob = new Blob([report], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mlro-annual-report.txt'; a.click(); URL.revokeObjectURL(a.href);
}


function updateTrainingLeaderboard(metric, value) {
  const board = JSON.parse(localStorage.getItem('aml-training-leaderboard-v1') || '{}');
  board[metric] = Math.min(board[metric] || value, value);
  board.highestSeizure = Math.max(board.highestSeizure || 0, state.seizedFunds);
  board.mostStrs = Math.max(board.mostStrs || 0, state.filedStrs);
  board.bestRegulator = Math.max(board.bestRegulator || 0, state.regulatorRelationship);
  localStorage.setItem('aml-training-leaderboard-v1', JSON.stringify(board));
}
function renderLeaderboards() {
  const board = JSON.parse(localStorage.getItem('aml-training-leaderboard-v1') || '{}');
  if (elements.leaderboard) elements.leaderboard.innerHTML = `<p>Fastest neutralisation: ${board.firstNeutralise || '—'} days · Highest seizure: ${formatMoney(board.highestSeizure || 0)} · Most STRs: ${board.mostStrs || 0} · Best regulator: ${Math.round(board.bestRegulator || 0)}</p>`;
  const shared = JSON.parse(localStorage.getItem('aml-shared-competitive-v1') || '[]').slice(0, 10);
  if (elements.competitiveBoard) elements.competitiveBoard.innerHTML = `<p class="training-note">Competitive scores are shared locally in this browser/artifact storage.</p>${shared.map(s=>`<p>${s.player}: ${s.score} · ${s.company} · seed ${s.seed}</p>`).join('') || '<p>No submissions yet.</p>'}`;
}
function submitCompetitiveScore() {
  const player = prompt('Player name for shared leaderboard?');
  if (!player) return;
  const shared = JSON.parse(localStorage.getItem('aml-shared-competitive-v1') || '[]');
  shared.push({ player, company: currentCompany().name, jurisdiction: currentJurisdiction().name, seed: state.seed, score: Math.round(state.trust + state.regulatorRelationship + state.seizedFunds / 1000 - state.fraudMl), date: new Date().toISOString().slice(0,10) });
  shared.sort((a,b)=>b.score-a.score);
  localStorage.setItem('aml-shared-competitive-v1', JSON.stringify(shared.slice(0, 50)));
  renderGovernance();
}

function updateCareer(won, stars) {
  const career = loadCareer(); const company = currentCompany(); const record = career[company.id] || { badges: [], bestStars: 0, unlocked: ['standard'] };
  record.bestStars = Math.max(record.bestStars, stars); if (won) record.badges.push('Survivor'); if (won && !record.unlocked.includes('hard')) record.unlocked.push('hard'); if (won && stars >= 4 && !record.unlocked.includes('crisis')) record.unlocked.push('crisis'); career[company.id] = record; localStorage.setItem(CAREER_KEY, JSON.stringify(career));
}
function loadCareer() { return JSON.parse(localStorage.getItem(CAREER_KEY) || '{}'); }

function deployCountermeasure(countermeasure) {
  if (state.ended) return;
  if (countermeasure.requires && !hasControl(countermeasure.requires)) return addLog(`${countermeasure.title} is locked until ${formatCounterName(countermeasure.requires)} is deployed.`), render();
  if (countermeasure.requiresSeizedFunds) {
    if (state.seizedFunds < 1000) return addLog('Not enough seized funds are available to reinvest.'), render();
    const reinvested = Math.min(state.seizedFunds, 6000); state.seizedFunds -= reinvested; state.deployments.push({ id: countermeasure.id, remainingHours: countermeasure.deploymentHours, reinvested }); addLog(`Approved reinvestment of ${formatMoney(reinvested)} in legitimate revenue capacity.`); return render();
  }
  const currentLevel = state.controls[countermeasure.id] || 0; const costMultiplier = currentJurisdiction().cost || 1; const scaledCost = countermeasure.cost * costMultiplier * (1 + currentLevel * 0.45);
  if (state.budget < scaledCost) return addLog(`${countermeasure.title} requires ${formatMoney(scaledCost)}, but budget is ${formatMoney(state.budget)}.`), render();
  state.budget -= scaledCost; state.deployments.push({ id: countermeasure.id, remainingHours: countermeasure.deploymentHours }); addLog(`Deployment started: ${countermeasure.title} (${countermeasure.deploymentHours} in-game hours).`); render();
}

function startSimulation() {
  if (state.ended) state = createInitialState();
  if (state.elapsedHours === 0) configureRun();
  state.running = true; addLog('Simulation clock started. Revenue, threats, alerts, and controls now update continuously.'); ensureLoop(); showOnboardingChallenge(); render();
}
function ensureLoop() { clearInterval(loopId); loopId = setInterval(tick, TICK_MS / state.speed); }
function pauseSimulation() { state.analysisMode = true; state.running = false; addLog('Analysis Mode enabled: simulation paused for gap analysis.'); showAnalysisModal(); render(); }
function resetSimulation() { clearInterval(loopId); loopId = null; state = createInitialState(); localStorage.removeItem(SAVE_KEY); hideModal(); render(); }
function saveSimulation() { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); addLog('Game state saved locally.'); render(); }
function loadSimulation() { const raw = localStorage.getItem(SAVE_KEY); if (!raw) return addLog('No saved game found.'), render(); state = { ...createInitialState(), ...JSON.parse(raw), running: false }; clearInterval(loopId); loopId = null; addLog('Saved game loaded and paused.'); render(); }

function showModal(html) { elements.modalRoot.innerHTML = `<div class="modal-backdrop">${html}</div>`; }
function hideModal() { elements.modalRoot.innerHTML = ''; }
function showAnalysisModal() {
  const gaps = typologies.map(t => ({ t, risk: getTypologyRisk(t), coverage: getActiveControlsFor(t.id), b: state.lastRiskBreakdown[t.id] })).sort((a,b) => (b.risk-b.coverage) - (a.risk-a.coverage)).slice(0, 8);
  showModal(`<div class="modal-card analysis-card"><h2>Pause-and-Analyse Mode</h2><p><strong>Seed:</strong> ${state.seed} · RNG calls ${state.rngCallCount}</p><p>Exact typology calculation: base pressure + growth + venture exposure − control coverage.</p><div class="analysis-grid">${gaps.map(g => `<div><strong>${g.t.name}</strong><br>Base ${g.b.base.toFixed(1)} + Growth ${g.b.growth.toFixed(1)} + Exposure ${g.b.exposure.toFixed(2)} − Coverage ${g.b.coverage.toFixed(1)} = Risk ${Math.round(g.risk)}</div>`).join('')}</div><h3>Control contributions</h3><p>${countermeasures.filter(c => hasControl(c.id)).map(c => `${c.title}: ${c.targets.slice(0,4).map(t => `${typologies.find(x=>x.id===t)?.short} +${Math.round(c.effectiveness * getControlEfficiency(c))}`).join(', ')}`).join('<br>') || 'No controls deployed.'}</p><div class="modal-actions"><button id="resume-analysis">Resume</button></div></div>`);
  document.querySelector('#resume-analysis').addEventListener('click', () => { hideModal(); state.analysisMode = false; state.running = true; ensureLoop(); render(); });
}

function tooltip(text) { return `<span class="term" data-tip="${glossary[text] || text}">${text}</span>`; }

function renderMetrics() {
  elements.metricsGrid.innerHTML = '';
  metricDefinitions.forEach(([key, label, help]) => {
    const clone = elements.metricTemplate.content.cloneNode(true);
    clone.querySelector('.metric-label').textContent = label;
    clone.querySelector('.metric-value').textContent = key.includes('Revenue') || key.includes('Funds') || key === 'budget' ? formatMoney(state[key]) : formatNumber(state[key]);
    clone.querySelector('.metric-help').textContent = help;
    elements.metricsGrid.appendChild(clone);
  });
}

function renderTypologies() {
  elements.typologyList.innerHTML = '';
  typologies.forEach(typology => {
    const pressure = state.typologyPressure[typology.id]; const protection = getActiveControlsFor(typology.id); const risk = getTypologyRisk(typology);
    const card = document.createElement('button'); card.type = 'button'; card.className = `typology-card heat-cell ${risk > 90 ? 'breach' : risk > 65 ? 'danger' : risk > 35 ? 'warning' : 'good'}`;
    const badges = `${state.mutations[typology.id] ? '<em class="badge danger">MUTATED</em>' : ''}${state.neutralised[typology.id] ? '<em class="badge neutral">NEUTRALISED</em>' : ''}${state.threatCollaborations.some(c => c.expiresHour > state.elapsedHours && c.typologyIds.includes(typology.id)) ? '<em class="badge linked">LINKED</em>' : ''}${state.pressureAuctions.some(a => !a.applied && a.typologyId === typology.id) ? '<em class="badge warning">TARGET ACQUIRED</em>' : ''}`;
    card.innerHTML = `<span>${typology.short}</span><strong>${Math.round(risk)}</strong><small>Pressure ${pressure.toFixed(1)} · Coverage ${Math.round(protection)}</small>${badges}`;
    card.addEventListener('click', () => { state.selectedTypology = typology.id; renderTypologyDetail(); }); elements.typologyList.appendChild(card);
  }); renderTypologyDetail();
}

function getActorPsychology(id) {
  const profiles = ['Opportunistic', 'Organised', 'State-Sponsored', 'Hybrid'];
  return profiles[[...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % profiles.length];
}

function renderTypologyDetail() {
  const typology = typologies.find(t => t.id === state.selectedTypology) || typologies[0]; const risk = getTypologyRisk(typology); const logs = state.log.filter(l => l.includes(typology.name) || l.includes(typology.short)).slice(0,3);
  elements.typologyDetail.innerHTML = `<h3>${typology.name}</h3><p>${typology.description}</p><dl><div><dt>Risk</dt><dd>${Math.round(risk)}</dd></div><div><dt>Pressure</dt><dd>${state.typologyPressure[typology.id].toFixed(1)}</dd></div><div><dt>Coverage</dt><dd>${Math.round(getActiveControlsFor(typology.id))}</dd></div><div><dt>Business exposure</dt><dd>${getBusinessExposure(typology).toFixed(2)}x</dd></div></dl>${hasControl('rd') ? `<p><strong>Actor psychology:</strong> ${getActorPsychology(typology.id)} (revealed by R&D lab).</p>` : ''}<p><strong>Last mentions:</strong> ${logs.length ? logs.join(' · ') : 'No recent log entries mention this typology.'}</p>`;
}

function renderCountermeasures() {
  elements.countermeasureList.innerHTML = '';
  countermeasures.filter(c => !c.techTier).forEach((countermeasure, index) => renderCountermeasureButton(countermeasure, index));
}
function renderCountermeasureButton(countermeasure, index = 0, container = elements.countermeasureList) {
  const level = state.controls[countermeasure.id] || 0; const scaledCost = countermeasure.requiresSeizedFunds ? 0 : countermeasure.cost * (currentJurisdiction().cost || 1) * (1 + level * 0.45); const clone = elements.countermeasureTemplate.content.cloneNode(true); const button = clone.querySelector('button');
  const efficiency = countermeasure.requiresSeizedFunds ? 1 : getControlEfficiency(countermeasure); const refresh = level && efficiency <= 0.72 ? ' · refresh needed' : '';
  clone.querySelector('.countermeasure-title').textContent = `${index + 1}. ${countermeasure.title}`;
  clone.querySelector('.countermeasure-detail').textContent = `${countermeasure.type}: ${countermeasure.detail}`;
  clone.querySelector('.countermeasure-meta').textContent = countermeasure.requiresSeizedFunds ? `Uses seized funds · ${countermeasure.deploymentHours}h deployment` : `${formatMoney(scaledCost)} · ${countermeasure.deploymentHours}h deployment · Level ${level} · ${Math.round(efficiency * 100)}% effective${refresh}`;
  button.disabled = state.ended || Boolean(countermeasure.requires && !hasControl(countermeasure.requires)) || (!countermeasure.requiresSeizedFunds && state.budget < scaledCost);
  button.addEventListener('click', () => deployCountermeasure(countermeasure));
  if (level && efficiency <= 0.72) { const refreshButton = document.createElement('button'); refreshButton.type = 'button'; refreshButton.className = 'mini-button'; refreshButton.textContent = 'Refresh 30%'; refreshButton.addEventListener('click', e => { e.stopPropagation(); refreshControl(countermeasure.id); }); clone.querySelector('.countermeasure-meta').appendChild(refreshButton); }
  container.appendChild(clone);
}


function upgradeEmployee(id) {
  const record = state.employees[id];
  const employee = employees.find(e => e.id === id);
  if (!record || !employee) return;
  const cost = employee.cost * 0.5;
  if (state.budget < cost) return addLog(`Upgrade requires ${formatMoney(cost)}.`), render();
  state.budget -= cost;
  record.coverage *= 1.4;
  record.upgraded = true;
  state.complianceCulture = clamp(state.complianceCulture + 4, 0, 100);
  addLog(`${employee.title} upgraded through QA-backed staff development.`);
  render();
}

function renderTechnology() { elements.technologyTree.innerHTML = ''; countermeasures.filter(c => c.techTier).sort((a,b)=>a.techTier-b.techTier).forEach((c,i) => renderCountermeasureButton(c,i,elements.technologyTree)); }
function renderEmployees() { elements.employeeList.innerHTML = ''; employees.forEach(employee => { const clone = elements.countermeasureTemplate.content.cloneNode(true); const button = clone.querySelector('button'); const count = state.employees[employee.id]?.count || 0; clone.querySelector('.countermeasure-title').textContent = `${employee.title} · ${count} hired`; clone.querySelector('.countermeasure-detail').textContent = `Covers ${employee.targets.map(id => typologies.find(t => t.id === id)?.short).join(', ')}. Required on matching Case Room investigations.`; clone.querySelector('.countermeasure-meta').textContent = `${formatMoney(employee.cost)} hire · ${formatMoney(employee.payroll)}/tick payroll`; button.disabled = state.budget < employee.cost || state.ended; button.addEventListener('click', () => hireEmployee(employee)); if (count && hasControl('qaAudit') && !state.employees[employee.id]?.upgraded && state.elapsedHours - (state.employees[employee.id]?.hiredHour || 0) >= 240) { const up = document.createElement('button'); up.type='button'; up.className='mini-button'; up.textContent='Upgrade specialist'; up.addEventListener('click', e => { e.stopPropagation(); upgradeEmployee(employee.id); }); clone.querySelector('.countermeasure-meta').appendChild(up); } elements.employeeList.appendChild(clone); }); }

function renderBrief() {
  const priority = typologies.map(t => ({ t, protection: getActiveControlsFor(t.id), risk: getTypologyRisk(t) })).sort((a,b)=>b.risk-a.risk)[0];
  const deployments = state.deployments.length ? `<ul>${state.deployments.map(d => `<li>${formatCounterName(d.id)}: ${Math.max(0,d.remainingHours)}h remaining</li>`).join('')}</ul>` : '<p>No deployments are currently in progress.</p>';
  const chapter = campaignChapters[state.campaignChapter - 1];
  elements.intelligenceBrief.innerHTML = `<p><strong>Adversary:</strong> ${state.adversaryProfile?.name || 'Unidentified'} · focus ${(state.adversaryProfile?.focus || []).map(id => typologies.find(t=>t.id===id)?.short).join(', ')}</p><p><strong>${tooltip('FATF')} adaptation:</strong> Criminal networks exploit weakest coverage. Current AI sophistication is <strong>${state.aiSophistication.toFixed(2)}x</strong>.</p><p><strong>Priority risk:</strong> ${priority.t.name}. Increase ${priority.t.controls.map(formatCounterName).join(', ')} before pressure converts into escaped funds.</p>${state.mode === 'campaign' ? `<p><strong>Campaign:</strong> Chapter ${chapter.chapter} — ${chapter.title}. Pass condition: ${chapter.condition}</p>` : ''}<p><strong>Deployments in progress:</strong></p>${deployments}<p class="training-note">Education note: effective ${tooltip('AML')} programmes combine prevent, detect, disrupt, and govern pillars with timely ${tooltip('STR')}/${tooltip('SAR')} filing.</p>`;
}

function renderRiskProfile() {
  const company = currentCompany(); const top = typologies.map(t => ({ t, inherent: getBusinessExposure(t), residual: getTypologyRisk(t) })).sort((a,b)=>b.inherent-a.inherent).slice(0,3); const appetite = state.fraudMl < company.appetite * 0.7 ? 'within appetite' : state.fraudMl < company.appetite ? 'approaching appetite' : 'exceeding appetite';
  elements.riskProfile.innerHTML = `<h3>Risk Profile · ${company.name}</h3><p>${company.ventures.map(v => `<strong>${v}</strong>`).join(' · ')}</p><ul>${top.map(x => `<li>${x.t.name}: inherent ${x.inherent.toFixed(2)}x, residual gap <span class="gap ${x.residual>65?'danger':x.residual>35?'warning':'good'}">${Math.round(x.residual)}</span></li>`).join('')}</ul><p><strong>Risk Appetite Status:</strong> Fraud/ML is ${appetite} (${Math.round(state.fraudMl)} vs appetite ${company.appetite}).</p>`;
}
function renderPlan() { const payroll = getPayroll(), upkeep = getUpkeep(), available = Math.max(0,state.budget), burn = Math.max(1,payroll+upkeep-180); const months = (available / burn / 12).toFixed(1); elements.planPanel.innerHTML = `<h3>Budget allocation planner</h3><div class="pie" style="--payroll:${payroll};--upkeep:${upkeep};--available:${available}"></div><p>Payroll ${formatMoney(payroll)} · Control upkeep ${formatMoney(upkeep)} · Available capital ${formatMoney(available)}.</p><p><strong>Projection:</strong> Hiring one Fraud Investigator changes payroll by ${formatMoney(90)}/tick and runway to ~${(available/(burn+90)/12).toFixed(1)} months.</p><p><strong>Runway:</strong> ${months} months at current burn.</p>`; }
function renderCaseRoom() { elements.caseRoom.innerHTML = state.cases.length ? state.cases.map(c => `<article class="case-card ${c.status}"><h3>${c.name}</h3><p>${typologies.find(t=>t.id===c.typologyId)?.name} · ${formatMoney(c.value)} at stake</p><p>Required: ${c.required} · Timer: ${Math.max(0,c.dueHour-state.elapsedHours)}h · ${c.status}</p>${c.status==='open'?`<button onclick="assignCase('${c.id}')">Assign specialist</button>`:''}</article>`).join('') : '<p>No open cases. Threat spikes will create investigation cards here.</p>'; }
function renderActorProfiles() { const topIds = typologies.map(t=>({id:t.id,r:getTypologyRisk(t)})).sort((a,b)=>b.r-a.r).slice(0,3).map(x=>x.id); elements.actorProfiles.innerHTML = state.actorProfiles.length ? state.actorProfiles.map(a => `<article class="case-card"><h3>${a.code} ${topIds.includes(a.typologyId)?'<span class="pill warning">Priority Target</span>':''}</h3><p>${a.modus}</p><p>Estimated illicit value: ${formatMoney(a.value)}</p><button onclick="openControlsFor('${a.typologyId}')">Neutralise</button></article>`).join('') : '<p>No named networks yet. Profiles appear when a typology exceeds risk 60.</p>'; }
function openControlsFor(typologyId) { document.querySelector('[data-tab="arsenal"]').click(); addLog(`Neutralise request: deploy ${typologies.find(t=>t.id===typologyId).controls.map(formatCounterName).join(', ')}.`); render(); }
function renderRegulatoryBanner() { elements.regulatoryBanner.innerHTML = state.activeEvents.filter(e=>!e.responded).map(e => `<div class="event-banner ${e.good ? 'good' : ''}"><strong>${e.name}</strong><span>${e.detail}</span><span>${Math.max(0,e.expiresHour-state.elapsedHours)}h</span><button onclick="respondEvent('${e.id}')">${e.action}</button></div>`).join(''); }
function renderFeeds() { elements.incidentFeed.innerHTML = state.incidentFeed.map(i=>`<li>${i}</li>`).join(''); elements.operationsLog.innerHTML = state.log.map(i=>`<li>${i}</li>`).join(''); }
function renderCareer() { const career = loadCareer(); elements.careerScreen.innerHTML = companies.map(c => { const record = career[c.id] || { badges: [], bestStars: 0, unlocked: ['standard'] }; return `<article class="case-card"><h3>${c.name}</h3><p>Badges: ${[...new Set(record.badges)].join(', ') || 'None yet'} · Best score: ${record.bestStars}/5 stars</p><p>Unlocked tiers: ${record.unlocked.join(', ')}</p></article>`; }).join(''); }
function renderLearn() { elements.learnPanel.innerHTML = typologies.map(t => `<article class="learn-card"><h3>${t.name}</h3><p><strong>What it is:</strong> ${t.description}</p><p><strong>Pattern example:</strong> ${t.example}</p><p><strong>Best controls/employees:</strong> ${t.controls.map(formatCounterName).join(', ')} · ${t.required}</p><p><strong>Red flag:</strong> ${t.redFlag}</p><a href="${t.fatf}" target="_blank" rel="noreferrer">FATF guidance</a></article>`).join(''); }


function renderWorld() {
  if (!elements.worldMap) return;
  const svg = `<svg viewBox="0 0 640 360" role="img" aria-label="Simplified corridor risk map">
    <rect width="640" height="360" rx="24" fill="rgba(255,255,255,0.04)" />
    ${corridors.map(c => { const risk = state.corridorRisks[c.id] ?? c.risk; const colour = risk > 65 ? '#ff4d6d' : risk > 42 ? '#ffd166' : '#8fffc1'; return `<g class="corridor" onclick="selectCorridor('${c.id}')"><circle cx="${c.x}" cy="${c.y}" r="${10 + risk/10}" fill="${colour}" opacity="0.72"/><text x="${c.x + 14}" y="${c.y + 4}" fill="#edf7ff" font-size="12">${c.name}</text></g>`; }).join('')}
  </svg>`;
  const selected = corridors.find(c => c.id === state.selectedCorridor) || corridors[0];
  elements.worldMap.innerHTML = `${svg}<p>${selected.name}: risk ${state.corridorRisks[selected.id] ?? selected.risk}. Linked threats: ${selected.typologies.map(id => typologies.find(t=>t.id===id)?.short).join(', ')}. Intersects: ${selected.ventures.filter(v => currentCompany().ventures.includes(v)).join(', ') || 'limited direct exposure'}.</p>`;
  elements.corridorTracker.innerHTML = corridors.slice(0, 5).map(c => `<p><strong>${c.name}</strong> — ${state.corridorRisks[c.id] ?? c.risk} risk · <button onclick="pauseCorridor('${c.id}')">Pause 48h</button></p>`).join('');
}
function selectCorridor(id) { state.selectedCorridor = id; renderWorld(); }
function pauseCorridor(id) { state.corridorPauses[id] = state.elapsedHours + 48; addLog(`${corridors.find(c=>c.id===id).name} corridor paused for 48h; income reduced but sanctions/TBML exposure lowered.`); render(); }

function renderGovernance() {
  if (!elements.governActions) return;
  const red = typologies.find(t => getTypologyRisk(t) > 65);
  elements.governActions.innerHTML = `<button ${red ? '' : 'disabled'} onclick="voluntaryDisclosure()">Voluntary Self-Disclosure</button> <button onclick="advisorCall()" ${state.advisorUsed ? 'disabled' : ''}>External Advisor Call</button> <button onclick="submitCompetitiveScore()">Submit Competitive Score</button><p>AML Insurance premium: ${Math.round(state.insurancePremiumRate * 1000) / 10}% of upkeep · claims used ${state.insuranceClaims}/2.</p>`;
  elements.complianceCalendar.innerHTML = `<div class="calendar-grid">${Array.from({length: 30}, (_,i) => { const day=i+1; const marks=state.calendarMarks.filter(m=>m.day===day); return `<span class="calendar-day ${marks[0]?.kind || ''}">${day}<small>${marks.map(m=>m.label).join(', ')}</small></span>`; }).join('')}</div>`;
  const policies = [];
  if (controlsCount() >= 3) policies.push(['AML/CTF Policy', 'Risk-based controls, escalation, and suspicious reporting governance.']);
  if (hasControl('sanctionsStack')) policies.push(['Sanctions Compliance Policy', 'Screening, list updates, wallet clusters, and corridor restrictions.']);
  if (hasControl('kyc')) policies.push(['Customer Risk Appetite Policy', 'KYC/EDD tiers, PEP handling, and unacceptable risk categories.']);
  if (hasControl('whistleblowerHotline')) policies.push(['Whistleblower Protection Policy', 'Anonymous reporting, non-retaliation, and investigation triage.']);
  elements.policyLibrary.innerHTML = policies.length ? policies.map(([title, body]) => `<article class="case-card"><h3>${title}</h3><p>${body}</p><button onclick="downloadPolicy('${title}','${body}')">Download</button></article>`).join('') : '<p>Deploy controls to generate policy summaries.</p>';
  renderLeaderboards();
}
function voluntaryDisclosure() { const red = [...typologies].sort((a,b)=>getTypologyRisk(b)-getTypologyRisk(a))[0]; state.regulatorRelationship -= 5; state.trust += 3; state.typologyPressure[red.id] *= 0.85; state.disclosed = true; state.complianceCulture += 5; addLog(`Voluntary disclosure filed for ${red.name}; pressure reduced before enforcement action.`); render(); }
function advisorCall() { state.advisorUsed = true; const top = [...typologies].sort((a,b)=>getTypologyRisk(b)-getTypologyRisk(a))[0]; showModal(`<div class="modal-card"><h2>External Advisor Memo</h2><p>Based on Fraud/ML ${Math.round(state.fraudMl)}, budget ${formatMoney(state.budget)}, and priority risk ${top.name}, reinforce ${top.controls.map(formatCounterName).join(', ')} before buying broad controls. Document the decision, update the risk appetite statement, and file STR/SARs promptly when thresholds breach.</p><div class="modal-actions"><button onclick="hideModal()">Close</button></div></div>`); render(); }
function downloadPolicy(title, body) { const blob = new Blob([`${title}\n\n${body}\n\nGenerated from run seed ${state.seed}.`], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${title.toLowerCase().replaceAll(' ', '-')}.txt`; a.click(); URL.revokeObjectURL(a.href); }

function renderEducationPanels() {
  const appetite = state.fraudMl > currentCompany().appetite ? '<span class="pill danger">APPETITE BREACH</span>' : '<span class="pill good">Within appetite</span>';
  elements.riskAppetite.innerHTML = `<h3>Risk Appetite Statement</h3><p>This institution accepts <strong>${currentCompany().risk > 1.15 ? 'HIGH' : 'MODERATE'}</strong> inherent risk in ${[...typologies].sort((a,b)=>getBusinessExposure(b)-getBusinessExposure(a)).slice(0,4).map(t=>t.name).join(', ')} and relies on ${Object.keys(state.controls).map(formatCounterName).join(', ') || 'planned controls'} to reduce residual risk. ${appetite}</p>`;
  elements.customerBook.innerHTML = `<h3>Customer Book</h3><p>Low: retail salary earners, small businesses · Medium: SMEs, PEP-adjacent customers · High: cash-intensive businesses, non-residents, ${currentCompany().ventures.includes('Correspondent Banking') ? 'nested FI clients' : 'complex ownership'} · Unacceptable: sanctioned or unverifiable customers.</p>`;
  elements.peerBenchmark.innerHTML = `<h3>Sector Average</h3><div class="benchmark"><span style="width:${Math.min(100,state.fraudMl)}%">Fraud/ML ${Math.round(state.fraudMl)}</span><i style="left:${state.peerBenchmark?.fraudMl || 55}%"></i></div><div class="benchmark trust"><span style="width:${Math.min(100,state.trust)}%">Trust ${Math.round(state.trust)}</span><i style="left:${state.peerBenchmark?.trust || 65}%"></i></div><p>${state.fraudMl > (state.peerBenchmark?.fraudMl || 55) ? 'Your institution is an outlier — regulator scrutiny may follow.' : 'Performance is within sector benchmark.'}</p>`;
  elements.budgetForecast.innerHTML = renderForecastSvg();
}

function renderForecastSvg() {
  const payroll = getPayroll() + getUpkeep(); const income = Math.max(120, 820 * currentCompany().income * (state.trust / 100)) * 0.18; let budget = state.budget; const points = [];
  for (let d = 0; d <= 10; d++) { points.push(`${20 + d * 28},${120 - Math.max(-40, Math.min(100, budget / 500))}`); budget += (income - payroll) * 12; }
  return `<h3>10-Day Budget Forecast</h3><svg viewBox="0 0 320 140" class="mini-chart"><rect x="0" y="105" width="320" height="35" fill="rgba(255,77,109,.12)"/><polyline points="${points.join(' ')}" fill="none" stroke="#5de1ff" stroke-width="3"/><line x1="0" x2="320" y1="105" y2="105" stroke="#ff4d6d" stroke-dasharray="4"/></svg>`;
}

function renderIntelVisuals() {
  if (!elements.historyChart) return;
  const lines = typologies.slice(0, 8).map((t, idx) => { const pts = (state.typologyHistory[t.id] || []).map((p,i)=>`${20+i*14},${120-p.risk}`).join(' '); return pts ? `<polyline points="${pts}" fill="none" stroke="hsl(${idx*42},80%,65%)" stroke-width="2"><title>${t.name}</title></polyline>` : ''; }).join('');
  elements.historyChart.innerHTML = `<svg viewBox="0 0 320 140" class="mini-chart">${lines}<line x1="20" x2="305" y1="50" y2="50" stroke="#ff4d6d" stroke-dasharray="3"/></svg>`;
  elements.moneyFlow.innerHTML = `<svg viewBox="0 0 420 140" class="money-flow"><path d="M20 40 C140 10 260 20 400 35"/><path class="illicit" d="M20 100 C150 120 260 90 400 110"/><circle cx="210" cy="70" r="24"/><text x="180" y="75">Controls</text></svg>`;
  const top = [...typologies].sort((a,b)=>getTypologyRisk(b)-getTypologyRisk(a)).slice(0,2);
  elements.stageFlow.innerHTML = top.map(t => `<div class="stage-row"><span>Placement<br>${currentCompany().ventures[0]}</span><span>Layering<br>${t.short}</span><span>Integration<br>${t.ventures[0] || 'assets'}</span></div>`).join('');
  elements.darkwebFeed.innerHTML = state.darkwebIntel.filter(i => i.expiresHour > state.elapsedHours).map(i => `<article class="case-card"><p>${i.text}</p></article>`).join('') || '<p>No active dark web bulletins.</p>';
}

function renderPredicateMap() {
  if (!elements.predicateMap) return;
  const nodes = [['Drug Trafficking', 'Structuring / Cash / Mules'], ['Corruption', 'Real Estate / Shells / Wealth'], ['Cybercrime', 'Crypto / Mules / Instant Payments'], ['Sanctions Breach', 'PF / TBML / Hawala']];
  elements.predicateMap.innerHTML = `<svg viewBox="0 0 560 180" class="predicate-svg">${nodes.map((n,i)=>`<g onclick="highlightPredicate('${n[0]}')"><rect x="20" y="${20+i*40}" width="170" height="28" rx="8"/><text x="30" y="${39+i*40}">${n[0]}</text><line x1="190" y1="${34+i*40}" x2="330" y2="${34+i*40}"/><rect x="330" y="${20+i*40}" width="210" height="28" rx="8"/><text x="340" y="${39+i*40}">${n[1]}</text></g>`).join('')}</svg>`;
}
function highlightPredicate(name) { state.selectedPredicate = name; addLog(`Predicate map highlighted ${name} linkages.`); render(); }

function renderCorrespondents() {
  if (!elements.correspondentRegistry) return;
  const banks = ['Harbour Mutual', 'Noble Silk', 'Atlas Correspondent', 'Pearl Gulf', 'Danube Trade', 'Andes Clearing', 'Sahara Trust', 'Pacific Bridge'];
  elements.correspondentRegistry.innerHTML = banks.map((b,i) => `<article class="case-card"><h3>${b}</h3><p>Jurisdiction risk ${30+i*7} · ownership ${i%2?'layered':'transparent'} · incidents ${i%3}</p><button onclick="toggleCorrespondent('${b}')">${state.activeCorrespondents.includes(b) ? 'De-risk' : 'Activate'}</button></article>`).join('');
}
function toggleCorrespondent(name) { if (state.activeCorrespondents.includes(name)) state.activeCorrespondents = state.activeCorrespondents.filter(x=>x!==name); else state.activeCorrespondents.push(name); addLog(`${name} correspondent ${state.activeCorrespondents.includes(name) ? 'activated' : 'de-risked'}.`); render(); }

function renderSetupOptions() { elements.companySelect.innerHTML = companies.map(c=>`<option value="${c.id}">${c.name}</option>`).join(''); elements.jurisdictionSelect.innerHTML = jurisdictions.map(j=>`<option value="${j.id}">${j.name}</option>`).join(''); elements.difficultySelect.innerHTML = difficulties.map(d=>`<option value="${d.id}">${d.name}</option>`).join(''); }
function updateSetupFromInputs() { state.companyId = elements.companySelect.value; state.jurisdictionId = elements.jurisdictionSelect.value; state.difficultyId = elements.difficultySelect.value; state.mode = elements.modeSelect.value; state.dailyBriefings = elements.briefingSelect.value === 'on'; state.speed = Number(elements.speedSelect.value); state.scenarioId = elements.scenarioSelect.value; state.trainingMode = elements.trainingSelect.value === 'on'; state.realWorldNews = elements.newsSelect.value === 'on'; state.manualSeed = elements.seedInput.value; if (state.scenarioId !== 'custom' && scenarios[state.scenarioId] && state.elapsedHours === 0) { const scenario = scenarios[state.scenarioId]; state.companyId = scenario.companyId; state.jurisdictionId = scenario.jurisdictionId; state.difficultyId = scenario.difficultyId; state.seed = scenario.seed; elements.seedInput.value = scenario.seed; } elements.setupFlavour.textContent = `${currentJurisdiction().flavour} ${currentCompany().name} ventures: ${currentCompany().ventures.join(', ')}.`; if (loopId) ensureLoop(); render(); }

function render() {
  const day = getDay(), hour = getHour() % 24, threat = calculateThreat(), queueClass = state.alertQueue > 150 ? 'danger' : state.alertQueue > 50 ? 'warning' : '';
  elements.clockLabel.textContent = `Day ${day} · ${String(hour).padStart(2,'0')}:00`; elements.statusLabel.textContent = state.ended ? 'Ended' : state.running ? 'Live' : state.analysisMode ? 'Analysis' : 'Paused'; elements.speedLabel.textContent = `Speed ${state.speed}x`; elements.seedLabel.textContent = `Seed ${state.seed || elements.seedInput.value || 'random'}`; const market = marketConditions.find(m => m.id === state.marketCondition); elements.marketLabel.textContent = `Market: ${market?.name || 'pending'}`; elements.marketLabel.className = `pill ${market?.className || 'warning'}`; elements.cultureLabel.textContent = `Culture ${Math.round(state.complianceCulture)}`; elements.complaintsLabel.textContent = `Complaints ${state.complaints}`; elements.alertQueueLabel.textContent = `Alert Queue ${state.alertQueue}`; elements.alertQueueLabel.className = `pill ${queueClass}`; elements.threatLabel.textContent = `AI pressure: ${threat > 70 ? 'High' : threat > 35 ? 'Medium' : 'Low'}`; elements.budgetLabel.textContent = `Budget ${formatMoney(state.budget)}`; elements.campaignLabel.textContent = state.mode === 'campaign' ? `Campaign chapter ${state.campaignChapter}` : 'Free play'; elements.headlineTicker.textContent = state.lastHeadline || 'Regulators watch financial crime controls as digital finance expands.'; elements.startButton.disabled = state.running && !state.ended; elements.pauseButton.textContent = state.running ? 'Pause' : 'Resume';
  elements.companySelect.value = state.companyId; elements.jurisdictionSelect.value = state.jurisdictionId; elements.difficultySelect.value = state.difficultyId; elements.modeSelect.value = state.mode; elements.briefingSelect.value = state.dailyBriefings ? 'on' : 'off'; elements.speedSelect.value = String(state.speed); elements.seedInput.value = state.seed || state.manualSeed || ''; elements.scenarioSelect.value = state.scenarioId || 'custom'; elements.trainingSelect.value = state.trainingMode ? 'on' : 'off'; elements.newsSelect.value = state.realWorldNews ? 'on' : 'off'; elements.setupFlavour.textContent = `${currentJurisdiction().flavour} ${currentCompany().name} ventures: ${currentCompany().ventures.join(', ')}.`;
  renderMetrics(); renderTypologies(); renderCountermeasures(); renderTechnology(); renderEmployees(); renderBrief(); renderRiskProfile(); renderEducationPanels(); renderPlan(); renderCaseRoom(); renderActorProfiles(); renderIntelVisuals(); renderWorld(); renderGovernance(); renderCorrespondents(); renderRegulatoryBanner(); renderFeeds(); renderCareer(); renderLearn(); renderPredicateMap();
}

function handleKeyboard(event) { if (event.code === 'Space') { event.preventDefault(); pauseSimulation(); return; } if (event.key.toLowerCase() === 'a') { pauseSimulation(); return; } if (event.key.toLowerCase() === 's') saveSimulation(); if (event.key.toLowerCase() === 'l') loadSimulation(); const index = Number(event.key) - 1; if (Number.isInteger(index) && countermeasures[index]) deployCountermeasure(countermeasures[index]); }

elements.startButton.addEventListener('click', startSimulation); elements.pauseButton.addEventListener('click', pauseSimulation); elements.analysisButton.addEventListener('click', pauseSimulation); elements.saveButton.addEventListener('click', saveSimulation); elements.loadButton.addEventListener('click', loadSimulation); elements.restartButton.addEventListener('click', resetSimulation);
[elements.companySelect, elements.jurisdictionSelect, elements.difficultySelect, elements.modeSelect, elements.briefingSelect, elements.speedSelect, elements.seedInput, elements.scenarioSelect, elements.trainingSelect, elements.newsSelect].forEach(el => el.addEventListener('change', updateSetupFromInputs));
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('.tab,.tab-panel').forEach(el => el.classList.remove('active')); tab.classList.add('active'); document.querySelector(`#tab-${tab.dataset.tab}`).classList.add('active'); }));
document.querySelectorAll('.subtab').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('.subtab,.subtab-panel').forEach(el => el.classList.remove('active')); tab.classList.add('active'); document.querySelector(`#subtab-${tab.dataset.subtab}`).classList.add('active'); }));
document.addEventListener('keydown', handleKeyboard);

renderSetupOptions(); updateSetupFromInputs(); generateHeadline(); headlineId = setInterval(() => { generateHeadline(); render(); }, 30000); render();
