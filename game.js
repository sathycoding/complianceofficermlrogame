const careerLevels = [
  {
    title: 'Junior Compliance Analyst',
    xp: 0,
    duties: 'Sanctions screening, PEP screening, adverse media review, customer onboarding',
    unlock: 'Basic investigations and onboarding reports'
  },
  {
    title: 'Compliance Officer',
    xp: 120,
    duties: 'KYC reviews, Enhanced Due Diligence, transaction monitoring',
    unlock: 'Risk scoring, customer risk models, first employee hire'
  },
  {
    title: 'Deputy MLRO',
    xp: 280,
    duties: 'SAR reviews, escalation decisions, team supervision',
    unlock: 'Investigation team and training programs'
  },
  {
    title: 'MLRO',
    xp: 520,
    duties: 'Submit SARs, regulatory communication, board reporting',
    unlock: 'Regulatory inspections and budget management'
  },
  {
    title: 'Head of Compliance',
    xp: 840,
    duties: 'Department strategy, risk appetite framework, multi-team oversight',
    unlock: 'Multiple departments'
  },
  {
    title: 'Chief Compliance Officer',
    xp: 1200,
    duties: 'Enterprise risk management and global compliance framework',
    unlock: 'International offices'
  },
  {
    title: 'Group MLRO',
    xp: 1650,
    duties: 'Group-wide suspicious activity oversight and cross-border governance',
    unlock: 'Global SAR governance and regulator colleges'
  },
  {
    title: 'Regulator',
    xp: 2150,
    duties: 'Inspect institutions, approve licenses, issue findings, and protect the system',
    unlock: 'Regulatory campaign mode'
  },
  {
    title: 'Compliance Consultancy Owner',
    xp: 2800,
    duties: 'Build a consultancy delivering AML audits, remediation, and risk assessments',
    unlock: 'Endgame business ownership'
  }
];

const companies = {
  retailBank: {
    name: 'Retail Bank',
    challenge: 'Large volumes, fraud, consumer AML, vulnerable customers',
    startingRevenue: 58,
    startingRisk: 48,
    startingBudget: 62,
    riskBias: { fraud: 14, consumerAml: 12, sanctions: 4 }
  },
  cryptoExchange: {
    name: 'Crypto Exchange',
    challenge: 'Blockchain tracing, mixers, sanctions evasion, rapid product change',
    startingRevenue: 72,
    startingRisk: 68,
    startingBudget: 56,
    riskBias: { crypto: 22, sanctions: 10, fraud: 6 }
  },
  investmentFirm: {
    name: 'Investment Firm',
    challenge: 'Insider trading, market abuse, complex wealth, high-value clients',
    startingRevenue: 66,
    startingRisk: 55,
    startingBudget: 58,
    riskBias: { marketAbuse: 22, pep: 8, beneficialOwnership: 6 }
  },
  moneyServiceBusiness: {
    name: 'Money Service Business',
    challenge: 'Cash transactions, cross-border flows, remittance corridors',
    startingRevenue: 52,
    startingRisk: 64,
    startingBudget: 48,
    riskBias: { cash: 16, crossBorder: 18, tf: 5 }
  },
  fintech: {
    name: 'FinTech',
    challenge: 'Rapid growth, regulatory uncertainty, embedded finance, scaling controls',
    startingRevenue: 70,
    startingRisk: 58,
    startingBudget: 52,
    riskBias: { growthPressure: 18, outsourcing: 8, fraud: 9 }
  },
  casino: {
    name: 'Casino',
    challenge: 'High-risk customers, cash laundering, junkets, affordability concerns',
    startingRevenue: 62,
    startingRisk: 70,
    startingBudget: 50,
    riskBias: { cash: 22, pep: 10, consumerAml: 8 }
  }
};

const customerProfiles = [
  {
    name: 'Marina Volkov',
    nationality: 'Estoria',
    occupation: 'Commodity trader',
    wealth: 'Offshore dividends and metals trading proceeds',
    funds: 'Three BVI entities and a private bank transfer',
    structure: 'Trust → HoldCo → two trading subsidiaries',
    links: ['Former minister cousin', 'Procurement inquiry', 'Luxury property SPV'],
    adverse: 'Inconclusive reporting about state-contract awards',
    hidden: 'Potential corrupt PEP network',
    typology: 'Beneficial ownership and PEP risk'
  },
  {
    name: 'Northstar Gaming Holdings',
    nationality: 'Multi-jurisdictional',
    occupation: 'Casino operator',
    wealth: 'Gaming revenue',
    funds: 'Cash-heavy settlement account',
    structure: 'Parent → regional casinos → VIP junket introducers',
    links: ['High cash velocity', 'VIP hosts', 'Unexplained third-party deposits'],
    adverse: 'Historic AML fine at an overseas affiliate',
    hidden: 'Cash layering through junket channels',
    typology: 'Placement and cash laundering'
  },
  {
    name: 'CipherBridge Labs',
    nationality: 'Digital nomad group',
    occupation: 'Crypto liquidity provider',
    wealth: 'Token market-making profits',
    funds: 'Wallets exposed to mixers and chain hops',
    structure: 'DAO wallet → treasury wallet → exchange accounts',
    links: ['Mixer exposure', 'Ransomware-tagged cluster two hops away', 'Privacy coin usage'],
    adverse: 'Online allegations denied by founders',
    hidden: 'Could be privacy-focused or ransomware-adjacent',
    typology: 'Crypto laundering and sanctions evasion'
  },
  {
    name: 'Thomas Elwood',
    nationality: 'United Kingdom',
    occupation: 'Retired engineer',
    wealth: 'Pension and house sale',
    funds: 'Life savings moved to new investment platform',
    structure: 'Individual customer with new beneficiary instructions',
    links: ['Romance contact overseas', 'Urgent payment requests', 'Family dispute'],
    adverse: 'No adverse media',
    hidden: 'Likely vulnerable fraud victim',
    typology: 'APP fraud and customer protection'
  }
];

const caseDeck = [
  {
    id: 'vipClient',
    title: "The CEO's VIP Client",
    type: 'Customer onboarding',
    severity: 'High',
    body: [
      'The CEO personally calls. A new ultra-high-net-worth customer wants to deposit $50 million and could increase annual profits by 25%.',
      'The source of wealth is unclear, funds originate from multiple offshore entities, negative media is inconclusive, and relationship managers are pressuring approval.'
    ],
    evidence: ['Offshore entity chart', 'Negative media clipping', 'Private bank reference', 'Unverified source-of-wealth memo'],
    lessons: ['Senior stakeholder pressure', 'Enhanced Due Diligence', 'Source of wealth/source of funds', 'Board escalation'],
    choices: [
      {
        title: 'Approve onboarding',
        detail: 'Revenue rises quickly, but the control file is weak and future sanctions exposure may emerge.',
        effects: { revenue: 16, riskExposure: 16, regulatoryScore: -10, reputation: -5, customerSatisfaction: 8, backlog: -1, xp: 35 },
        log: 'You approved the VIP client despite unresolved wealth questions. The business is thrilled; your file is vulnerable.'
      },
      {
        title: 'Request Enhanced Due Diligence',
        detail: 'Require independent wealth evidence, ownership verification, adverse-media analysis, and senior approval.',
        effects: { revenue: -3, riskExposure: -12, regulatoryScore: 12, reputation: 8, customerSatisfaction: -4, backlog: 2, xp: 70 },
        log: 'You used a risk-based EDD plan and converted commercial pressure into documented governance.'
      },
      {
        title: 'Reject customer',
        detail: 'Avoid risk, but lose the relationship and trigger board scrutiny over risk appetite.',
        effects: { revenue: -14, riskExposure: -16, regulatoryScore: 5, reputation: 2, boardConfidence: -8, customerSatisfaction: -8, xp: 50 },
        log: 'You rejected the VIP client. Risk reduced, but the board wants clearer appetite thresholds.'
      },
      {
        title: 'Escalate to Board',
        detail: 'Present risk/reward options, conditions, and appetite consequences for accountable decision-making.',
        effects: { revenue: 2, riskExposure: -8, regulatoryScore: 10, reputation: 7, boardConfidence: 10, backlog: 1, xp: 80 },
        log: 'You escalated the VIP case with evidence and options. The board respected the transparency.'
      }
    ]
  },
  {
    id: 'missedSar',
    title: 'The Missed SAR',
    type: 'Regulatory request',
    severity: 'Critical',
    body: [
      'A regulator discovers suspicious activity that occurred eight months ago. Your monitoring team reviewed the alerts and closed them; the employee responsible has resigned.',
      'The regulator asks: “Why was no SAR submitted?” Your answer will shape trust, findings, and MLRO accountability.'
    ],
    evidence: ['Closed alert notes', 'Old transaction timeline', 'Former employee QA failure', 'Regulator information request'],
    lessons: ['Root cause analysis', 'MLRO accountability', 'Regulatory candour', 'Control remediation'],
    choices: [
      {
        title: 'Self-report control failure',
        detail: 'Admit the failure, file late where appropriate, and submit a remediation plan.',
        effects: { regulatoryScore: 14, reputation: 3, riskExposure: -9, findings: 1, budget: -6, xp: 95, sars: 1 },
        log: 'You self-reported the missed SAR and proposed remediation. Painful, but trust improved.'
      },
      {
        title: 'Defend previous decisions',
        detail: 'Argue the closure was reasonable without reviewing the full fact pattern.',
        effects: { regulatoryScore: -16, reputation: -8, riskExposure: 8, findings: 2, xp: 35 },
        log: 'Your defensive response irritated the regulator and exposed weak governance evidence.'
      },
      {
        title: 'Conduct internal investigation',
        detail: 'Pause conclusions, reconstruct evidence, QA related alerts, and report facts to the regulator.',
        effects: { regulatoryScore: 10, reputation: 6, riskExposure: -10, backlog: 2, budget: -4, xp: 85 },
        log: 'You launched a focused internal investigation and gave the regulator a credible timetable.'
      },
      {
        title: 'Blame staff member',
        detail: 'Point to the resigned employee as the cause and avoid wider governance review.',
        effects: { regulatoryScore: -20, reputation: -12, employeeMorale: -12, findings: 3, riskExposure: 8, xp: 20 },
        log: 'Blaming one employee backfired. The regulator focused on supervision, QA, and culture.'
      }
    ]
  },
  {
    id: 'pepChange',
    title: 'The Politically Exposed Customer',
    type: 'Ongoing monitoring',
    severity: 'High',
    body: [
      'A long-standing customer becomes a minister in a high-risk jurisdiction after seven quiet years. Transactions increase dramatically, but there are no criminal allegations.',
      'The relationship manager says: “We have known them for years.” Your controls must adapt to changed risk, not past comfort.'
    ],
    evidence: ['Appointment news article', 'Seven-year account history', 'New transaction spike', 'Relationship manager note'],
    lessons: ['PEP reclassification', 'Ongoing monitoring', 'Risk reassessment', 'Relationship management'],
    choices: [
      {
        title: 'Continue relationship unchanged',
        detail: 'Avoid friction but ignore a material risk-trigger event.',
        effects: { revenue: 5, riskExposure: 12, regulatoryScore: -10, customerSatisfaction: 5, xp: 25 },
        log: 'You left the customer unchanged. The file now conflicts with the updated risk profile.'
      },
      {
        title: 'Re-classify as PEP',
        detail: 'Apply EDD, senior approval, monitoring limits, and review frequency changes.',
        effects: { riskExposure: -12, regulatoryScore: 12, reputation: 6, customerSatisfaction: -3, backlog: 1, xp: 75 },
        log: 'You reclassified the customer as PEP and updated controls without automatic exit.'
      },
      {
        title: 'Restrict account activity',
        detail: 'Limit high-risk payments while collecting updated source-of-funds evidence.',
        effects: { riskExposure: -15, regulatoryScore: 8, revenue: -4, customerSatisfaction: -8, xp: 65 },
        log: 'You applied temporary restrictions while seeking evidence. Risk fell, but customer friction rose.'
      },
      {
        title: 'Exit relationship',
        detail: 'Terminate the relationship due to changed political exposure and high-risk geography.',
        effects: { riskExposure: -18, revenue: -10, regulatoryScore: 3, customerSatisfaction: -10, boardConfidence: -3, xp: 55 },
        log: 'You exited the PEP. Safe, but the proportionality of the decision will be questioned.'
      }
    ]
  },
  {
    id: 'sanctionsUpdate',
    title: 'The Sanctions List Update',
    type: 'Sanctions crisis',
    severity: 'Critical',
    body: [
      'A sanctions update drops overnight. Screening identifies one direct match, thirty-five possible matches, and five hundred pending reviews.',
      'Media reports enforcement activity within hours, and the regulator requests a status update before noon.'
    ],
    evidence: ['Direct match report', 'Potential-match queue', 'Payment hold log', 'Regulator status request'],
    lessons: ['Sanctions prioritization', 'Legal escalation', 'False positives', 'Immediate controls'],
    choices: [
      {
        title: 'Freeze accounts immediately',
        detail: 'Stop all possible matches now, even before manual review.',
        effects: { riskExposure: -18, regulatoryScore: 5, customerSatisfaction: -18, reputation: -4, backlog: 5, xp: 65 },
        log: 'You froze broadly. Sanctions leakage risk fell, but innocent customers and operations suffered.'
      },
      {
        title: 'Review manually first',
        detail: 'Prioritize direct match, then high-confidence possible matches, then remainder.',
        effects: { riskExposure: -10, regulatoryScore: 8, backlog: 8, employeeMorale: -4, xp: 60 },
        log: 'Manual review was careful but slow. Backlog pressure rose.'
      },
      {
        title: 'Use automated confidence scoring',
        detail: 'Deploy rules to rank alerts and reserve human review for high-risk matches.',
        requires: 'AI Alert Triage',
        fallback: { regulatoryScore: -4, riskExposure: 5, log: 'Without AI triage, the confidence model was too crude and created control risk.' },
        effects: { riskExposure: -13, regulatoryScore: 10, backlog: -4, budget: -2, xp: 85 },
        log: 'AI triage helped prioritize sanctions reviews while preserving human judgement.'
      },
      {
        title: 'Escalate to legal counsel',
        detail: 'Freeze direct match, seek legal view on possible matches, update regulator with governance plan.',
        effects: { riskExposure: -12, regulatoryScore: 14, reputation: 6, budget: -5, backlog: 2, xp: 90 },
        log: 'Legal escalation and a regulator update produced a defensible sanctions response.'
      }
    ]
  },
  {
    id: 'rogueEmployee',
    title: 'The Rogue Employee',
    type: 'Employee conduct',
    severity: 'High',
    body: [
      'Internal audit finds a senior analyst approving EDD files without genuine review. They are the highest-performing employee and say backlog pressure made shortcuts inevitable.',
      'Hundreds of files may be affected. No malicious intent is evident, but the control breach is serious.'
    ],
    evidence: ['Audit sample failures', 'Employee productivity dashboard', 'Backlog pressure trend', 'EDD approval logs'],
    lessons: ['Conduct risk', 'Culture and incentives', 'Historical lookback', 'Supervision'],
    choices: [
      {
        title: 'Terminate employee only',
        detail: 'Remove the individual but avoid a wider lookback.',
        effects: { employeeMorale: -14, regulatoryScore: -6, riskExposure: 5, backlog: 2, xp: 35 },
        log: 'Termination alone did not address root causes or impacted files.'
      },
      {
        title: 'Retrain and supervise',
        detail: 'Keep the employee under enhanced QA and fix incentives.',
        effects: { employeeMorale: 7, regulatoryScore: 4, riskExposure: -5, budget: -3, xp: 55 },
        log: 'You retrained and supervised the employee, but still need to assess historical files.'
      },
      {
        title: 'Report breach and review historical files',
        detail: 'Notify governance, sample the affected population, remediate files, and adjust workload controls.',
        effects: { regulatoryScore: 12, reputation: 5, riskExposure: -14, backlog: 6, budget: -8, employeeMorale: -3, xp: 95 },
        log: 'You treated the issue as a systemic control failure and launched a lookback.'
      },
      {
        title: 'Quietly review a small sample',
        detail: 'Minimize disruption by checking a few files without formal escalation.',
        effects: { regulatoryScore: -12, riskExposure: 10, employeeMorale: 3, findings: 1, xp: 25 },
        log: 'A quiet sample created weak accountability and left the systemic issue unresolved.'
      }
    ]
  },
  {
    id: 'cryptoMixer',
    title: 'The Crypto Mixer Investigation',
    type: 'Blockchain investigation',
    severity: 'High',
    body: [
      'A customer receives funds from wallets linked to a mixer. Blockchain tracing shows no direct sanctions exposure, but multiple hops through anonymization services.',
      'The customer says: “I value privacy.” They may be legitimate, ransomware-adjacent, or linked to sanctioned entities.'
    ],
    evidence: ['Wallet graph', 'Mixer exposure report', 'Customer explanation', 'No direct sanctions hit'],
    lessons: ['Blockchain analytics', 'Crypto typologies', 'Risk-based judgement', 'SAR decisioning'],
    choices: [
      {
        title: 'File SAR',
        detail: 'Report suspicion based on mixer exposure, pattern, and weak explanation.',
        effects: { sars: 1, regulatoryScore: 8, riskExposure: -8, customerSatisfaction: -4, xp: 75 },
        log: 'You filed a SAR with wallet-path evidence and risk rationale.'
      },
      {
        title: 'Request explanation',
        detail: 'Ask for source of funds, purpose, counterparties, and wallet ownership evidence.',
        effects: { regulatoryScore: 5, riskExposure: -4, backlog: 1, customerSatisfaction: -2, xp: 55 },
        log: 'You requested more information without tipping off the specific suspicion.'
      },
      {
        title: 'Exit relationship',
        detail: 'End exposure because the risk exceeds appetite.',
        effects: { riskExposure: -12, revenue: -4, regulatoryScore: 4, customerSatisfaction: -7, xp: 50 },
        log: 'You exited the crypto customer. Exposure fell, but intelligence value may have been lost.'
      },
      {
        title: 'Continue monitoring',
        detail: 'Accept privacy explanation and place the wallet cluster under enhanced monitoring.',
        effects: { revenue: 3, riskExposure: 7, regulatoryScore: -5, customerSatisfaction: 4, xp: 30 },
        log: 'You continued monitoring. If the hidden risk is real, the exposure may spread.'
      }
    ]
  },
  {
    id: 'inspectionWeek',
    title: 'The Regulatory Inspection Week',
    type: 'Inspection',
    severity: 'Critical',
    body: [
      'The regulator arrives for five days and requests SAR samples, KYC files, board minutes, risk assessments, and training records.',
      'At the same time, alert volumes spike, employees make mistakes, and a key manager calls in sick. You have limited hours each day.'
    ],
    evidence: ['Inspection request list', 'SAR sample pack', 'Training completion report', 'Sick leave notice'],
    lessons: ['Resource management', 'Regulatory preparedness', 'Team leadership', 'Evidence packs'],
    choices: [
      {
        title: 'Create a regulator war room',
        detail: 'Assign one lead, one evidence owner, one case owner, and daily regulator updates.',
        effects: { regulatoryScore: 15, employeeMorale: -3, backlog: 2, budget: -4, boardConfidence: 7, xp: 100 },
        log: 'Your inspection war room gave structure to limited time and kept the regulator informed.'
      },
      {
        title: 'Divert everyone to the regulator',
        detail: 'Make all staff gather documents and let daily operations wait.',
        effects: { regulatoryScore: 6, backlog: 8, riskExposure: 8, employeeMorale: -10, xp: 50 },
        log: 'The regulator pack improved, but operations deteriorated and alert risk rose.'
      },
      {
        title: 'Keep BAU running first',
        detail: 'Protect alert queues and provide regulator materials slowly.',
        effects: { regulatoryScore: -12, backlog: -3, riskExposure: -4, reputation: -6, xp: 40 },
        log: 'BAU looked stable, but the regulator viewed delays as poor preparedness.'
      },
      {
        title: 'Hire consultants for surge support',
        detail: 'Buy experienced help for evidence mapping and QA.',
        effects: { regulatoryScore: 12, budget: -14, backlog: -2, reputation: 5, xp: 85 },
        log: 'Consultants helped the inspection, but your budget took a major hit.'
      }
    ]
  },
  {
    id: 'whaleFraud',
    title: 'The Whale Fraud Victim',
    type: 'Fraud and customer protection',
    severity: 'High',
    body: [
      'An elderly customer loses $2 million to an investment scam but insists the investment was genuine. Family members demand reimbursement and media attention grows.',
      'You must balance fraud investigation, customer autonomy, litigation, vulnerability, and reputational risk.'
    ],
    evidence: ['Large outbound transfer', 'Investment brochure', 'Family complaint', 'Customer vulnerability flags'],
    lessons: ['Fraud investigations', 'Customer protection', 'Reputational risk', 'Vulnerable customers'],
    choices: [
      {
        title: 'Reimburse customer',
        detail: 'Protect reputation and the vulnerable customer, but set a precedent and cost the business.',
        effects: { reputation: 12, customerSatisfaction: 10, revenue: -8, budget: -10, xp: 60 },
        log: 'You reimbursed the customer and earned public trust, but Finance wants clearer fraud liability rules.'
      },
      {
        title: 'Refuse reimbursement',
        detail: 'Stand by terms and customer authorization.',
        effects: { revenue: 4, reputation: -14, customerSatisfaction: -14, regulatoryScore: -4, xp: 25 },
        log: 'Refusal saved money but damaged reputation and invited regulator questions about customer protection.'
      },
      {
        title: 'Investigate further',
        detail: 'Preserve evidence, contact receiving bank, assess vulnerability, and prepare a fair outcome review.',
        effects: { regulatoryScore: 9, reputation: 6, riskExposure: -5, backlog: 1, budget: -3, xp: 75 },
        log: 'You investigated quickly and created a fair basis for reimbursement and law-enforcement contact.'
      },
      {
        title: 'Freeze outgoing transactions',
        detail: 'Temporarily stop payments due to scam concern and possible vulnerability.',
        effects: { riskExposure: -8, customerSatisfaction: -10, regulatoryScore: 3, reputation: 2, xp: 50 },
        log: 'The freeze prevented further loss but created autonomy and fairness concerns.'
      }
    ]
  },
  {
    id: 'correspondentCrisis',
    title: 'The Correspondent Banking Crisis',
    type: 'Strategic remediation',
    severity: 'Critical',
    body: [
      'Your largest correspondent bank says it may terminate the relationship due to AML concerns. If lost, international payments stop and revenue drops significantly.',
      'The board wants a survival plan: remediation, consultants, replacement banking, or negotiation.'
    ],
    evidence: ['Correspondent notice', 'AML concern appendix', 'Revenue dependency analysis', 'Remediation gap tracker'],
    lessons: ['Strategic compliance', 'Stakeholder management', 'Remediation planning', 'Board reporting'],
    choices: [
      {
        title: 'Launch remediation project',
        detail: 'Create workstreams for KYC lookback, monitoring tuning, SAR QA, training, and board MI.',
        effects: { regulatoryScore: 12, reputation: 8, riskExposure: -14, budget: -12, revenue: -2, xp: 100 },
        log: 'Your remediation project gave the correspondent bank concrete comfort.'
      },
      {
        title: 'Hire consultants',
        detail: 'Use external credibility and surge capacity to validate the plan.',
        effects: { reputation: 7, regulatoryScore: 9, budget: -18, riskExposure: -8, xp: 80 },
        log: 'Consultants bought credibility and speed at a steep price.'
      },
      {
        title: 'Replace bank',
        detail: 'Search for a new correspondent instead of fixing root causes.',
        effects: { revenue: -12, reputation: -8, regulatoryScore: -6, riskExposure: 5, xp: 35 },
        log: 'Replacement was hard because unresolved AML concerns followed you.'
      },
      {
        title: 'Negotiate extension',
        detail: 'Seek more time using transparent milestones and independent assurance.',
        effects: { revenue: 4, reputation: 5, regulatoryScore: 5, boardConfidence: 7, budget: -4, xp: 70 },
        log: 'You negotiated breathing room, but deadlines are now public and unforgiving.'
      }
    ]
  },
  {
    id: 'launderingNetwork',
    title: 'The Massive Laundering Network',
    type: 'Complex investigation',
    severity: 'Legendary',
    body: [
      'An investigator discovers 75 customer accounts, 30 shell companies, 12 jurisdictions, and millions in suspicious transfers. The scheme may have existed for years.',
      'Immediate action may alert criminals or disrupt law enforcement. Delayed action may allow laundering to continue.'
    ],
    evidence: ['75-account network graph', '30 shell-company registry extracts', '12-jurisdiction flow map', 'Law-enforcement contact note'],
    lessons: ['Complex investigations', 'Law enforcement coordination', 'Covert monitoring', 'MLRO judgement'],
    choices: [
      {
        title: 'Freeze accounts',
        detail: 'Stop the network now, accepting tipping-off and operational risks.',
        effects: { riskExposure: -22, regulatoryScore: 4, customerSatisfaction: -12, reputation: 1, sars: 3, xp: 100 },
        log: 'You froze the network. Exposure stopped, but criminals may know they were detected.'
      },
      {
        title: 'Submit SAR only',
        detail: 'Report intelligence and wait for authority guidance.',
        effects: { sars: 2, regulatoryScore: 8, riskExposure: -5, reputation: 4, xp: 85 },
        log: 'You filed SARs and preserved intelligence, but live laundering risk remains.'
      },
      {
        title: 'Coordinate with authorities',
        detail: 'Submit SARs, set covert restrictions, coordinate law-enforcement timing, and document rationale.',
        effects: { sars: 3, regulatoryScore: 16, riskExposure: -16, reputation: 10, backlog: 4, budget: -6, xp: 130 },
        log: 'You coordinated with authorities and balanced disruption with intelligence value.'
      },
      {
        title: 'Conduct covert monitoring',
        detail: 'Keep watching to map more nodes before escalation.',
        effects: { riskExposure: 12, regulatoryScore: -8, reputation: -5, xp: 45 },
        log: 'Covert monitoring expanded the map but allowed more suspicious flows.'
      }
    ]
  },
  {
    id: 'boardRevolt',
    title: 'Legendary Scenario: The Board Revolt',
    type: 'Board challenge',
    severity: 'Legendary',
    body: [
      'The company is growing rapidly, but you repeatedly reject high-risk clients and revenue drops. Board members question your suitability as MLRO.',
      'The ultimatum is blunt: “Reduce compliance friction or we will replace you.” There is no perfect answer, only consequences.'
    ],
    evidence: ['Rejected-client revenue analysis', 'Risk appetite statement', 'Regulator Dear CEO letter', 'Board ultimatum minutes'],
    lessons: ['Independence', 'Board influence', 'Risk appetite', 'Commercial pressure'],
    choices: [
      {
        title: 'Maintain standards',
        detail: 'Accept dismissal risk and defend regulatory obligations.',
        effects: { integrity: 18, regulatoryScore: 10, boardConfidence: -15, revenue: -8, reputation: 4, xp: 90 },
        log: 'You maintained standards under pressure. The board cannot claim they were not warned.'
      },
      {
        title: 'Compromise standards',
        detail: 'Reduce friction to keep the board happy and accelerate growth.',
        effects: { integrity: -20, regulatoryScore: -18, revenue: 16, boardConfidence: 8, riskExposure: 18, xp: 35 },
        log: 'You compromised controls for growth. The short-term relief may become an enforcement case.'
      },
      {
        title: 'Convince board through data',
        detail: 'Use typologies, loss models, enforcement examples, and KPI trends to justify controls.',
        effects: { integrity: 10, regulatoryScore: 12, boardConfidence: 15, riskExposure: -8, budget: 4, xp: 120 },
        log: 'You turned the board revolt into a data-led risk appetite reset.'
      },
      {
        title: 'Restructure risk appetite',
        detail: 'Permit defined high-risk business only with priced controls, senior approval, and exit triggers.',
        effects: { revenue: 8, regulatoryScore: 8, riskExposure: -4, boardConfidence: 12, budget: -3, xp: 110 },
        log: 'You created a more nuanced appetite framework that preserved growth without blind acceptance.'
      }
    ]
  }
];

const controls = [
  { id: 'screening', name: 'Advanced Screening Tool', cost: 16, benefit: { riskExposure: -12, regulatoryScore: 6, backlog: -2 }, note: 'Improves sanctions and PEP matching.' },
  { id: 'aiTriage', name: 'AI Alert Triage', cost: 20, benefit: { riskExposure: -8, regulatoryScore: 4, backlog: -6 }, note: 'Reduces false positives while preserving human review.' },
  { id: 'blockchain', name: 'Blockchain Analytics', cost: 18, benefit: { riskExposure: -10, regulatoryScore: 5 }, note: 'Required for mature crypto investigations.' },
  { id: 'caseManagement', name: 'Case Management System', cost: 14, benefit: { backlog: -7, employeeMorale: 5, regulatoryScore: 3 }, note: 'Improves evidence, QA, and audit trail.' },
  { id: 'automatedKyc', name: 'Automated KYC', cost: 15, benefit: { customerSatisfaction: 8, backlog: -5, riskExposure: -3 }, note: 'Speeds onboarding and standardizes checks.' }
];

const hirePool = [
  { role: 'KYC Officer', salary: 8, aml: 6, investigation: 4, productivity: 7, accuracy: 6, regulatory: 5, trait: 'Fast worker' },
  { role: 'Investigator', salary: 10, aml: 7, investigation: 9, productivity: 5, accuracy: 8, regulatory: 6, trait: 'Detail oriented' },
  { role: 'Fraud Analyst', salary: 9, aml: 5, investigation: 8, productivity: 7, accuracy: 7, regulatory: 5, trait: 'Highly intelligent' },
  { role: 'Screening Specialist', salary: 7, aml: 8, investigation: 4, productivity: 8, accuracy: 7, regulatory: 6, trait: 'Calm under pressure' },
  { role: 'Data Scientist', salary: 12, aml: 4, investigation: 5, productivity: 8, accuracy: 7, regulatory: 4, trait: 'Model builder' }
];

const courseCatalog = [
  { name: 'AML Foundations', cost: 5, benefit: { riskExposure: -4, regulatoryScore: 3, employeeMorale: 2 }, xp: 25 },
  { name: 'Sanctions & CGSS Prep', cost: 7, benefit: { riskExposure: -6, regulatoryScore: 4 }, xp: 35 },
  { name: 'Blockchain Analytics', cost: 8, benefit: { riskExposure: -7, regulatoryScore: 3 }, xp: 40 },
  { name: 'CAMS / ICA Certification Pathway', cost: 10, benefit: { regulatoryScore: 6, employeeMorale: 5, reputation: 2 }, xp: 55 },
  { name: 'Fraud & Vulnerable Customer Workshop', cost: 6, benefit: { customerSatisfaction: 5, riskExposure: -5, reputation: 3 }, xp: 35 }
];

const initialState = {
  scene: 'companySelect',
  companyKey: null,
  day: 1,
  month: 1,
  xp: 0,
  levelIndex: 0,
  currentCaseIndex: 0,
  dailyPhase: 0,
  selectedCustomerIndex: 0,
  achievements: [],
  controls: [],
  team: [
    { name: 'Aisha Khan', role: 'Junior Analyst', aml: 5, investigation: 4, productivity: 6, accuracy: 6, regulatory: 4, morale: 70, stress: 20, trait: 'Eager learner' }
  ],
  queues: {
    alerts: 12,
    onboarding: 8,
    investigations: 2,
    regulatorRequests: 0,
    trainingDue: 6
  },
  stats: {
    integrity: 70,
    reputation: 55,
    regulatoryScore: 55,
    revenue: 55,
    riskExposure: 50,
    employeeMorale: 65,
    customerSatisfaction: 58,
    budget: 55,
    boardConfidence: 55,
    sars: 0,
    findings: 0
  },
  log: []
};

let state = structuredClone(initialState);

const elements = {
  startButton: document.querySelector('#start-button'),
  restartButton: document.querySelector('#restart-button'),
  profileGrid: document.querySelector('#profile-grid'),
  hierarchyList: document.querySelector('#hierarchy-list'),
  statsGrid: document.querySelector('#stats-grid'),
  riskMap: document.querySelector('#risk-map'),
  chapterLabel: document.querySelector('#chapter-label'),
  sceneTitle: document.querySelector('#scene-title'),
  sceneBody: document.querySelector('#scene-body'),
  lessonBox: document.querySelector('#lesson-box'),
  lessonList: document.querySelector('#lesson-list'),
  evidenceBox: document.querySelector('#evidence-box'),
  evidenceList: document.querySelector('#evidence-list'),
  choices: document.querySelector('#choices'),
  teamList: document.querySelector('#team-list'),
  systemsList: document.querySelector('#systems-list'),
  queueList: document.querySelector('#queue-list'),
  careerLog: document.querySelector('#career-log'),
  choiceTemplate: document.querySelector('#choice-template')
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getCompany() {
  return state.companyKey ? companies[state.companyKey] : null;
}

function getLevel() {
  return careerLevels[state.levelIndex];
}

function getCurrentCase() {
  return caseDeck[state.currentCaseIndex % caseDeck.length];
}

function formatName(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase());
}

function hasControl(nameOrId) {
  return state.controls.some(controlId => {
    const control = controls.find(item => item.id === controlId);
    return control && (control.id === nameOrId || control.name === nameOrId);
  });
}

function addLog(message) {
  state.log.unshift(`Day ${state.day}: ${message}`);
  state.log = state.log.slice(0, 16);
}

function applyEffects(effects = {}) {
  Object.entries(effects).forEach(([key, value]) => {
    if (key === 'xp') {
      state.xp += value;
    } else if (key === 'backlog') {
      state.queues.alerts = Math.max(0, state.queues.alerts + value);
      state.queues.investigations = Math.max(0, state.queues.investigations + Math.ceil(value / 3));
    } else if (key === 'sars' || key === 'findings') {
      state.stats[key] = Math.max(0, state.stats[key] + value);
    } else if (Object.hasOwn(state.stats, key)) {
      const max = ['sars', 'findings'].includes(key) ? 999 : 100;
      state.stats[key] = clamp(state.stats[key] + value, 0, max);
    } else if (Object.hasOwn(state.queues, key)) {
      state.queues[key] = Math.max(0, state.queues[key] + value);
    }
  });
  updateCareerLevel();
  evaluateAchievements();
}

function updateCareerLevel() {
  let newIndex = state.levelIndex;
  careerLevels.forEach((level, index) => {
    if (state.xp >= level.xp) newIndex = index;
  });
  if (newIndex > state.levelIndex) {
    state.levelIndex = newIndex;
    addLog(`Promotion unlocked: ${careerLevels[newIndex].title}. ${careerLevels[newIndex].unlock}.`);
  }
}

function evaluateAchievements() {
  const achievementChecks = [
    { id: 'firstSar', label: 'First SAR filed', test: () => state.stats.sars >= 1 },
    { id: 'sarTen', label: 'Filed 10 SARs', test: () => state.stats.sars >= 10 },
    { id: 'inspectionReady', label: 'Inspection-ready function', test: () => state.stats.regulatoryScore >= 80 },
    { id: 'zeroBacklog', label: 'Reduced alert backlog to zero', test: () => state.queues.alerts === 0 },
    { id: 'trustedBoard', label: 'Won board confidence', test: () => state.stats.boardConfidence >= 80 },
    { id: 'globalLeader', label: 'Reached Group MLRO level', test: () => state.levelIndex >= 6 },
    { id: 'consultant', label: 'Unlocked compliance consultancy endgame', test: () => state.levelIndex >= 8 }
  ];

  achievementChecks.forEach(achievement => {
    if (!state.achievements.includes(achievement.id) && achievement.test()) {
      state.achievements.push(achievement.id);
      addLog(`Achievement unlocked: ${achievement.label}.`);
    }
  });
}

function selectCompany(companyKey) {
  const company = companies[companyKey];
  state = structuredClone(initialState);
  state.companyKey = companyKey;
  state.stats.revenue = company.startingRevenue;
  state.stats.riskExposure = company.startingRisk;
  state.stats.budget = company.startingBudget;
  state.scene = 'interview';
  addLog(`You joined a ${company.name}. Challenge profile: ${company.challenge}.`);
  render();
}

function applyChoice(choice) {
  if (choice.requires && !hasControl(choice.requires)) {
    applyEffects(choice.fallback || {});
    addLog(choice.fallback?.log || `You lacked ${choice.requires}, so the plan underperformed.`);
  } else {
    applyEffects(choice.effects || {});
    addLog(choice.log);
  }

  if (choice.next) {
    state.scene = choice.next;
  } else if (state.scene === 'casework') {
    state.currentCaseIndex += 1;
    state.scene = 'dailyReview';
  }

  render();
}

function startCareerAfterInterview(choice) {
  applyEffects(choice.effects);
  addLog(choice.log);
  state.scene = 'dailyReview';
  render();
}

function nextDay() {
  state.day += 1;
  state.dailyPhase = 0;
  if (state.day % 5 === 1) state.month += 1;

  const company = getCompany();
  const bias = company?.riskBias || {};
  const riskPressure = Math.ceil((state.stats.riskExposure + Object.values(bias).reduce((sum, value) => sum + value, 0) / 6) / 18);
  const productivity = state.team.reduce((sum, employee) => sum + employee.productivity, 0);
  const controlBonus = state.controls.length * 2;
  const queueGrowth = Math.max(1, riskPressure - Math.floor((productivity + controlBonus) / 18));

  state.queues.alerts += queueGrowth + Math.floor(state.stats.revenue / 35);
  state.queues.onboarding += Math.max(0, Math.ceil(state.stats.revenue / 28) - Math.floor(productivity / 24));
  state.queues.trainingDue += state.team.length > 2 ? 1 : 0;
  state.stats.riskExposure = clamp(state.stats.riskExposure + queueGrowth - state.controls.length, 0, 100);
  state.team = state.team.map(employee => ({
    ...employee,
    stress: clamp(employee.stress + queueGrowth + Math.max(0, state.queues.alerts - 20), 0, 100),
    morale: clamp(employee.morale - Math.floor(employee.stress / 30) + (state.stats.employeeMorale > 70 ? 2 : 0), 0, 100)
  }));

  state.scene = 'dailyReview';
  addLog('A new day begins. Criminal networks adapt to your controls and queues refresh.');
  render();
}

function endMonth() {
  const boardPenalty = state.queues.alerts > 30 ? -8 : 4;
  const regulatorPenalty = state.stats.riskExposure > 75 ? -8 : 3;
  applyEffects({ boardConfidence: boardPenalty, regulatoryScore: regulatorPenalty, xp: 30 });
  addLog('Monthly board reporting complete: KPIs, risk heat map, SAR statistics, findings, budget, and remediation commitments reviewed.');
  nextDay();
}

function buyControl(controlId) {
  const control = controls.find(item => item.id === controlId);
  if (!control || state.controls.includes(controlId)) return;

  if (state.stats.budget < control.cost) {
    applyEffects({ boardConfidence: -3, xp: 10 });
    addLog(`Budget request failed: not enough budget for ${control.name}. Convince the board or improve revenue first.`);
  } else {
    state.controls.push(controlId);
    applyEffects({ budget: -control.cost, ...control.benefit, xp: 45 });
    addLog(`Technology purchased: ${control.name}. ${control.note}`);
  }
  render();
}

function hireEmployee(index) {
  const hire = hirePool[index % hirePool.length];
  if (state.stats.budget < hire.salary) {
    applyEffects({ employeeMorale: -2, boardConfidence: -2 });
    addLog(`Hiring failed: insufficient budget for ${hire.role}.`);
  } else {
    state.team.push({
      name: generateEmployeeName(),
      role: hire.role,
      aml: hire.aml,
      investigation: hire.investigation,
      productivity: hire.productivity,
      accuracy: hire.accuracy,
      regulatory: hire.regulatory,
      morale: 68,
      stress: 16,
      trait: hire.trait
    });
    applyEffects({ budget: -hire.salary, employeeMorale: 4, backlog: -2, xp: 45 });
    addLog(`Hired ${hire.role} with trait “${hire.trait}”.`);
  }
  render();
}

function trainTeam(courseIndex) {
  const course = courseCatalog[courseIndex % courseCatalog.length];
  if (state.stats.budget < course.cost) {
    addLog(`Training cancelled: not enough budget for ${course.name}.`);
    applyEffects({ employeeMorale: -2 });
  } else {
    state.team = state.team.map(employee => ({
      ...employee,
      aml: clamp(employee.aml + 1, 0, 10),
      regulatory: clamp(employee.regulatory + 1, 0, 10),
      morale: clamp(employee.morale + 5, 0, 100),
      stress: clamp(employee.stress - 6, 0, 100)
    }));
    state.queues.trainingDue = Math.max(0, state.queues.trainingDue - 4);
    applyEffects({ budget: -course.cost, ...course.benefit, xp: course.xp });
    addLog(`Training delivered: ${course.name}. Staff skills and confidence improved.`);
  }
  render();
}

function generateEmployeeName() {
  const names = ['Sam Rivera', 'Noor Patel', 'Lena Okafor', 'Mateo Silva', 'Grace Chen', 'Owen Hughes', 'Maya Stein', 'Ibrahim Diallo'];
  return names[(state.team.length + state.day + state.month) % names.length];
}

function renderCompanySelect() {
  return {
    chapter: 'Career setup',
    title: 'Choose your institution type',
    body: [
      'Every institution creates a different compliance game. Retail banks drown in volume, crypto firms need tracing, investment firms face market abuse, money service businesses live with cross-border cash risk, fintechs scale faster than controls, and casinos carry intense cash-laundering exposure.',
      'Choose where you want to start your career. This sets initial revenue, budget, risk exposure, and the hidden financial-crime ecosystem that evolves each day.'
    ],
    lessons: ['Institution-wide risk assessment', 'Business model risk', 'Product/geography/customer risk', 'Controls matched to typology'],
    evidence: [],
    choices: Object.entries(companies).map(([key, company]) => ({
      title: company.name,
      detail: company.challenge,
      meta: `Revenue ${company.startingRevenue} · Risk ${company.startingRisk} · Budget ${company.startingBudget}`,
      action: () => selectCompany(key)
    }))
  };
}

function renderInterview() {
  return {
    chapter: 'Stage 1 · Role interview',
    title: 'Interview before appointment: show independence under pressure',
    body: [
      'The MLRO, CEO, Head of Product, and a board member ask how you will support growth without becoming a rubber stamp. They test your understanding of the three lines of defence, proportionality, KYC, sanctions, transaction monitoring, escalation, and board reporting.',
      'Question: A fast-growth sales team says Enhanced Due Diligence is killing conversion. What is your answer?'
    ],
    lessons: ['Three lines of defence', 'Risk-based approach', 'Independence', 'Commercial stakeholder management'],
    evidence: ['Job description', 'Board risk appetite extract', 'Sales complaint', 'AML policy summary'],
    choices: [
      {
        title: 'Risk-tiered onboarding answer',
        detail: 'Fast-track low-risk customers, require EDD for high-risk triggers, and use MI to prove conversion/control balance.',
        meta: 'Best for balanced growth',
        effects: { integrity: 8, regulatoryScore: 8, reputation: 4, boardConfidence: 5, xp: 80 },
        log: 'You passed the interview with a practical risk-based answer.',
        action: null
      },
      {
        title: 'Promise faster approvals',
        detail: 'Tell the CEO that compliance can approve most customers first and clean files later.',
        meta: 'Short-term revenue, long-term danger',
        effects: { integrity: -12, regulatoryScore: -10, revenue: 5, riskExposure: 8, xp: 35 },
        log: 'You got the job, but the MLRO noted your willingness to compromise evidence.',
        action: null
      },
      {
        title: 'Reject all complex customers',
        detail: 'Say the safest institution is one that refuses complexity by default.',
        meta: 'Very safe, commercially weak',
        effects: { integrity: 4, riskExposure: -5, revenue: -6, boardConfidence: -5, xp: 45 },
        log: 'You sounded ethical but too rigid for a risk-based control environment.',
        action: null
      }
    ].map(choice => ({ ...choice, action: () => startCareerAfterInterview(choice) }))
  };
}

function renderDailyReview() {
  const company = getCompany();
  const caseItem = getCurrentCase();
  const ecosystem = getEcosystemNarrative();
  return {
    chapter: `Day ${state.day} · Daily cycle`,
    title: `${company.name} command briefing`,
    body: [
      'Your daily loop is live: receive alerts, review customers, investigate cases, manage employees, answer regulatory requests, implement controls, handle incidents, prepare board reporting, end day, and review KPIs.',
      ecosystem,
      `Priority case waiting: <strong>${caseItem.title}</strong> (${caseItem.type}, ${caseItem.severity}).`
    ],
    lessons: ['Daily prioritisation', 'Workload management', 'KPI review', 'Financial-crime ecosystem adaptation'],
    evidence: ['Alert queue', 'Onboarding queue', 'Open investigations', 'Board KPI pack'],
    choices: [
      {
        title: 'Open priority case',
        detail: 'Review the highest-impact scenario and choose a response.',
        meta: `${caseItem.type} · ${caseItem.severity}`,
        action: () => { state.scene = 'casework'; render(); }
      },
      {
        title: 'Manage employees',
        detail: 'Hire, train, or relieve workload before mistakes become breaches.',
        meta: `${state.team.length} staff · morale ${state.stats.employeeMorale}`,
        action: () => { state.scene = 'people'; render(); }
      },
      {
        title: 'Buy controls / technology',
        detail: 'Invest budget into screening, case management, AI triage, blockchain analytics, or automated KYC.',
        meta: `Budget ${state.stats.budget}`,
        action: () => { state.scene = 'technology'; render(); }
      },
      {
        title: 'Review a customer file',
        detail: 'Practise document review and hidden-risk detection with a customer profile.',
        meta: 'Papers Please-style review',
        action: () => { state.scene = 'customerReview'; render(); }
      },
      {
        title: state.day % 5 === 0 ? 'Complete monthly board report' : 'End day',
        detail: state.day % 5 === 0 ? 'Report KPIs, heat map, SARs, findings, budget, and remediation.' : 'Move to tomorrow and let the ecosystem adapt.',
        meta: 'Advance time',
        action: state.day % 5 === 0 ? endMonth : nextDay
      }
    ]
  };
}

function getEcosystemNarrative() {
  const risk = state.stats.riskExposure;
  const controlsText = state.controls.length ? `${state.controls.length} major controls are active` : 'controls are still basic';
  if (risk >= 75) return `Financial-crime ecosystem status: <span class="bad">critical</span>. Criminal networks are exploiting weak controls; ${controlsText}.`;
  if (risk >= 50) return `Financial-crime ecosystem status: <span class="warn">evolving</span>. Fraudsters and launderers are testing typologies faster than the team can clear queues; ${controlsText}.`;
  return `Financial-crime ecosystem status: <span class="good">contained</span>. Your controls are forcing criminals to adapt, but new methods will still appear; ${controlsText}.`;
}

function renderCasework() {
  const caseItem = getCurrentCase();
  return {
    chapter: `Case ${state.currentCaseIndex + 1} · ${caseItem.type}`,
    title: caseItem.title,
    body: caseItem.body,
    lessons: caseItem.lessons,
    evidence: caseItem.evidence,
    choices: caseItem.choices.map(choice => ({ ...choice, meta: summarizeEffects(choice.effects) }))
  };
}

function renderPeople() {
  return {
    chapter: `Day ${state.day} · Employee management`,
    title: 'Build and protect your compliance department',
    body: [
      'Your team has skills, personalities, morale, and stress. Too much backlog creates mistakes, missed SARs, poor QA, burnout, and regulatory findings. Hiring increases capacity; training improves quality; both cost budget.',
      'As you progress, you create KYC, Screening, Monitoring, Investigations, and Regulatory teams.'
    ],
    lessons: ['Workload allocation', 'Employee skills', 'Training and certifications', 'Culture and supervision'],
    evidence: state.team.map(employee => `${employee.name} · ${employee.role} · ${employee.trait}`),
    choices: [
      ...hirePool.map((hire, index) => ({
        title: `Hire ${hire.role}`,
        detail: `${hire.trait}. AML ${hire.aml}, investigation ${hire.investigation}, productivity ${hire.productivity}, accuracy ${hire.accuracy}.`,
        meta: `Salary/budget cost ${hire.salary}`,
        action: () => hireEmployee(index)
      })),
      ...courseCatalog.slice(0, 3).map((course, index) => ({
        title: `Train: ${course.name}`,
        detail: 'Improve team capability and reduce control mistakes.',
        meta: `Cost ${course.cost} · XP ${course.xp}`,
        action: () => trainTeam(index)
      })),
      { title: 'Return to command briefing', detail: 'Go back to the daily cycle.', meta: 'No time cost', action: () => { state.scene = 'dailyReview'; render(); } }
    ]
  };
}

function renderTechnology() {
  return {
    chapter: `Day ${state.day} · Controls and budget`,
    title: 'Choose technology upgrades and control investments',
    body: [
      'Budget is limited. Buying controls improves the risk heat map and future case options, but overspending hurts board confidence. Some scenarios unlock stronger decisions only if the right system exists.',
      'The best compliance leaders combine people, process, technology, evidence, and governance rather than relying on a single tool.'
    ],
    lessons: ['Budget trade-offs', 'Control design', 'Technology limitations', 'Audit trail and assurance'],
    evidence: controls.map(control => `${control.name}: ${control.note}`),
    choices: [
      ...controls.map(control => ({
        title: state.controls.includes(control.id) ? `${control.name} already active` : `Buy ${control.name}`,
        detail: control.note,
        meta: state.controls.includes(control.id) ? 'Installed' : `Cost ${control.cost}`,
        action: () => buyControl(control.id)
      })),
      { title: 'Return to command briefing', detail: 'Go back to the daily cycle.', meta: 'No purchase', action: () => { state.scene = 'dailyReview'; render(); } }
    ]
  };
}

function renderCustomerReview() {
  const customer = customerProfiles[state.selectedCustomerIndex % customerProfiles.length];
  return {
    chapter: `Day ${state.day} · Customer database review`,
    title: `Review customer: ${customer.name}`,
    body: [
      `Nationality: <strong>${customer.nationality}</strong>. Occupation: <strong>${customer.occupation}</strong>.`,
      `Source of wealth: ${customer.wealth}. Source of funds: ${customer.funds}. Corporate structure: ${customer.structure}.`,
      `Linked entities: ${customer.links.join(', ')}. Adverse media: ${customer.adverse}. Hidden risk is not shown to players during real play; your job is to infer the typology from evidence.`
    ],
    lessons: ['Customer due diligence', customer.typology, 'Linked entities', 'Adverse media review'],
    evidence: ['Passport / registration extract', 'Bank statement', 'Utility bill or operating address', 'Corporate registry', ...customer.links],
    choices: [
      {
        title: 'Approve as low risk',
        detail: 'Accept the profile and reduce onboarding queue quickly.',
        meta: 'Fast but risky',
        effects: { customerSatisfaction: 6, revenue: 3, riskExposure: 8, regulatoryScore: -5, onboarding: -2, xp: 25 },
        log: `You approved ${customer.name} as low risk. Hidden issue: ${customer.hidden}.`,
        next: 'dailyReview'
      },
      {
        title: 'Request EDD / more evidence',
        detail: 'Ask for better source evidence, ownership proof, and risk rationale before approval.',
        meta: 'Slower but defensible',
        effects: { riskExposure: -6, regulatoryScore: 7, customerSatisfaction: -3, onboarding: 1, xp: 55 },
        log: `You requested EDD for ${customer.name}. You correctly focused on ${customer.typology}.`,
        next: 'dailyReview'
      },
      {
        title: 'Escalate to MLRO / senior committee',
        detail: 'Use formal governance where risk exceeds your authority.',
        meta: 'Good for high-risk ambiguity',
        effects: { regulatoryScore: 8, boardConfidence: 4, riskExposure: -5, backlog: 1, xp: 60 },
        log: `You escalated ${customer.name}. Hidden issue considered: ${customer.hidden}.`,
        next: 'dailyReview'
      },
      {
        title: 'Next customer profile',
        detail: 'Cycle to another customer in the database.',
        meta: 'No score effect',
        action: () => { state.selectedCustomerIndex += 1; render(); }
      }
    ]
  };
}

function renderFinale() {
  const score = Math.round((state.stats.integrity + state.stats.reputation + state.stats.regulatoryScore + (100 - state.stats.riskExposure) + state.stats.boardConfidence) / 5);
  let outcome = 'Developing compliance leader';
  let className = 'warn';
  if (state.stats.regulatoryScore < 30 || state.stats.integrity < 35) {
    outcome = 'Enforcement action and MLRO dismissal';
    className = 'bad';
  } else if (score >= 80 && state.levelIndex >= 6) {
    outcome = 'Legendary Group MLRO and consultancy founder';
    className = 'good';
  } else if (score >= 72) {
    outcome = 'Trusted MLRO / CCO';
    className = 'good';
  }

  return {
    chapter: 'Career outcome',
    title: outcome,
    body: [
      `<span class="${className}">Final career score: ${score}</span>. You reached ${getLevel().title} with ${state.xp} XP, ${state.stats.sars} SARs, ${state.stats.findings} findings, and ${state.achievements.length} achievements.`,
      'The simulator rewards evidence-led decisions, proportionality, independence, employee management, regulator candour, board influence, and control investment. Replay with a different institution to experience a different financial-crime ecosystem.'
    ],
    lessons: ['Continuous improvement', 'Regulatory accountability', 'Strategic compliance leadership', 'Replayable risk ecosystems'],
    evidence: state.achievements.length ? state.achievements.map(id => id.replace(/([A-Z])/g, ' $1')) : ['No achievements unlocked yet'],
    choices: [
      { title: 'Replay from the beginning', detail: 'Try a new institution or risk appetite.', meta: 'Reset game', action: resetGame }
    ]
  };
}

function getSceneModel() {
  if (state.scene === 'companySelect') return renderCompanySelect();
  if (state.scene === 'interview') return renderInterview();
  if (state.scene === 'dailyReview') return renderDailyReview();
  if (state.scene === 'casework') return renderCasework();
  if (state.scene === 'people') return renderPeople();
  if (state.scene === 'technology') return renderTechnology();
  if (state.scene === 'customerReview') return renderCustomerReview();
  return renderFinale();
}

function summarizeEffects(effects = {}) {
  return Object.entries(effects)
    .filter(([key]) => ['xp', 'regulatoryScore', 'riskExposure', 'revenue', 'budget', 'sars', 'findings'].includes(key))
    .map(([key, value]) => `${formatName(key)} ${value > 0 ? '+' : ''}${value}`)
    .join(' · ');
}

function renderProfile() {
  const company = getCompany();
  const profile = {
    Institution: company?.name || 'Not selected',
    Day: state.day,
    Month: state.month,
    Role: getLevel().title,
    XP: `${state.xp} / ${careerLevels[Math.min(state.levelIndex + 1, careerLevels.length - 1)].xp}`,
    Challenge: company?.challenge || 'Choose a company type to begin'
  };

  elements.profileGrid.innerHTML = Object.entries(profile)
    .map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`)
    .join('');

  elements.hierarchyList.innerHTML = '';
  careerLevels.forEach((level, index) => {
    const item = document.createElement('li');
    item.className = index === state.levelIndex ? 'current' : index < state.levelIndex ? 'complete' : '';
    item.innerHTML = `<strong>${level.title}</strong><span>${level.duties}</span>`;
    elements.hierarchyList.appendChild(item);
  });
}

function renderStats() {
  const statCards = [
    ['Integrity', state.stats.integrity, 'Independence under pressure'],
    ['Reputation', state.stats.reputation, 'Market and public confidence'],
    ['Regulatory score', state.stats.regulatoryScore, 'Supervisor trust and evidence quality'],
    ['Revenue', state.stats.revenue, 'Business growth and commercial impact'],
    ['Risk exposure', state.stats.riskExposure, 'Institution financial-crime risk'],
    ['Employee morale', state.stats.employeeMorale, 'Culture and burnout pressure'],
    ['Customer satisfaction', state.stats.customerSatisfaction, 'Friction, fairness, and service'],
    ['Budget', state.stats.budget, 'Available spend for people and controls'],
    ['Board confidence', state.stats.boardConfidence, 'Senior management support'],
    ['SARs', state.stats.sars, 'Suspicious reports submitted'],
    ['Findings', state.stats.findings, 'Regulatory/audit findings']
  ];

  elements.statsGrid.innerHTML = statCards.map(([label, value, help]) => {
    const status = label === 'Risk exposure' || label === 'Findings' ? 100 - value : value;
    const className = status >= 70 ? 'good-border' : status >= 40 ? 'warn-border' : 'bad-border';
    return `<div class="stat ${className}"><span>${label}</span><strong>${value}</strong><small>${help}</small></div>`;
  }).join('');
}

function renderRiskMap() {
  const company = getCompany();
  const baseRisks = {
    AML: state.stats.riskExposure,
    Sanctions: state.stats.riskExposure - (hasControl('screening') ? 15 : 0) + (company?.riskBias.sanctions || 0),
    Fraud: state.stats.riskExposure - 5 + (company?.riskBias.fraud || 0),
    Crypto: state.stats.riskExposure - (hasControl('blockchain') ? 18 : 0) + (company?.riskBias.crypto || 0),
    'Market abuse': state.stats.riskExposure - 10 + (company?.riskBias.marketAbuse || 0),
    'Customer harm': state.stats.riskExposure - 8 + (company?.riskBias.consumerAml || 0),
    'Control backlog': Math.min(100, state.queues.alerts * 3 + state.queues.investigations * 4)
  };

  elements.riskMap.innerHTML = Object.entries(baseRisks).map(([label, value]) => {
    const score = clamp(Math.round(value));
    const className = score >= 70 ? 'risk-critical' : score >= 45 ? 'risk-high' : 'risk-low';
    return `<div class="risk-cell ${className}"><span>${label}</span><strong>${score}</strong></div>`;
  }).join('');
}

function renderLessons(lessons) {
  elements.lessonList.innerHTML = '';
  if (!lessons?.length) {
    elements.lessonBox.hidden = true;
    return;
  }
  lessons.forEach(lesson => {
    const item = document.createElement('li');
    item.textContent = lesson;
    elements.lessonList.appendChild(item);
  });
  elements.lessonBox.hidden = false;
}

function renderEvidence(evidence) {
  elements.evidenceList.innerHTML = '';
  if (!evidence?.length) {
    elements.evidenceBox.hidden = true;
    return;
  }
  evidence.forEach((item, index) => {
    const chip = document.createElement('div');
    chip.className = 'evidence-chip';
    chip.textContent = `${index + 1}. ${item}`;
    elements.evidenceList.appendChild(chip);
  });
  elements.evidenceBox.hidden = false;
}

function renderChoices(choices) {
  elements.choices.innerHTML = '';
  choices.forEach(choice => {
    const clone = elements.choiceTemplate.content.cloneNode(true);
    const button = clone.querySelector('button');
    clone.querySelector('.choice-title').textContent = choice.title;
    clone.querySelector('.choice-detail').textContent = choice.detail;
    clone.querySelector('.choice-meta').textContent = choice.meta || summarizeEffects(choice.effects);
    button.addEventListener('click', choice.action || (() => applyChoice(choice)));
    elements.choices.appendChild(clone);
  });
}

function renderTeam() {
  elements.teamList.innerHTML = state.team.map(employee => `
    <div class="team-card">
      <strong>${employee.name}</strong>
      <span>${employee.role} · ${employee.trait}</span>
      <small>AML ${employee.aml} · Inv ${employee.investigation} · Prod ${employee.productivity} · Acc ${employee.accuracy} · Reg ${employee.regulatory}</small>
      <div class="meter"><span style="width:${employee.morale}%"></span></div>
      <small>Morale ${employee.morale} · Stress ${employee.stress}</small>
    </div>
  `).join('');
}

function renderSystems() {
  const active = controls.filter(control => state.controls.includes(control.id));
  elements.systemsList.innerHTML = active.length
    ? active.map(control => `<div class="system-card"><strong>${control.name}</strong><span>${control.note}</span></div>`).join('')
    : '<p class="muted">No major technology upgrades installed yet.</p>';
}

function renderQueues() {
  const queueItems = [
    ['Alerts', state.queues.alerts],
    ['Onboarding', state.queues.onboarding],
    ['Investigations', state.queues.investigations],
    ['Regulator requests', state.queues.regulatorRequests],
    ['Training due', state.queues.trainingDue]
  ];

  elements.queueList.innerHTML = queueItems.map(([label, value]) => `
    <div class="queue-item">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join('');
}

function renderLog() {
  const achievementNames = state.achievements.map(id => id.replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase()));
  const entries = [
    ...achievementNames.map(name => `🏆 ${name}`),
    ...(state.log.length ? state.log : ['No career decisions recorded yet.'])
  ];
  elements.careerLog.innerHTML = entries.map(entry => `<li>${entry}</li>`).join('');
}

function render() {
  if (state.day > 30 || state.xp >= 3000) state.scene = 'finale';
  const scene = getSceneModel();
  elements.chapterLabel.textContent = scene.chapter;
  elements.sceneTitle.textContent = scene.title;
  elements.sceneBody.innerHTML = scene.body.map(paragraph => `<p>${paragraph}</p>`).join('');
  renderLessons(scene.lessons);
  renderEvidence(scene.evidence);
  renderChoices(scene.choices);
  renderProfile();
  renderStats();
  renderRiskMap();
  renderTeam();
  renderSystems();
  renderQueues();
  renderLog();
}

function resetGame() {
  state = structuredClone(initialState);
  render();
}

elements.startButton.addEventListener('click', resetGame);
elements.restartButton.addEventListener('click', resetGame);
render();
