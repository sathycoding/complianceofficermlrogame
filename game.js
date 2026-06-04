const roleHierarchy = [
  'Candidate: Compliance Analyst interview',
  'Compliance Analyst: onboarding, KYC, policy learning',
  'Compliance Officer: monitoring, advice, training, escalation',
  'Deputy MLRO: investigations, SAR/STR drafting, quality assurance',
  'MLRO / Head of Financial Crime: final reporting, regulator liaison, board accountability',
  'Chief Compliance Officer: enterprise governance and remediation'
];

const initialState = {
  scene: 'interview',
  roleIndex: 0,
  stats: {
    integrity: 50,
    riskControl: 50,
    regulatorTrust: 50,
    morale: 50,
    budget: 50
  },
  log: []
};

const scenes = {
  interview: {
    chapter: 'Stage 1 · Interview before appointment',
    title: 'Panel interview: Can you become a compliance officer?',
    body: [
      'FinShield is a payments fintech applying for a bank partnership. The CEO, MLRO, Head of Product, and an external adviser interview you for a compliance role. They ask practical questions, not textbook trivia.',
      '<strong>Question:</strong> A high-growth sales team says enhanced due diligence slows onboarding. What do you say in the interview?'
    ],
    duties: [
      'Explain the three lines of defence and where compliance sits.',
      'Show independent judgment while supporting commercial objectives.',
      'Demonstrate knowledge of KYC, customer risk assessment, sanctions, transaction monitoring, SAR/STR escalation, and regulatory reporting.'
    ],
    choices: [
      {
        title: 'Give a balanced risk answer',
        detail: 'Offer risk-tiered onboarding, fast-track low-risk customers, and mandatory EDD for high-risk triggers.',
        next: 'firstDay',
        roleIndex: 1,
        effects: { integrity: 12, riskControl: 10, regulatorTrust: 8, morale: 4, budget: -2 },
        log: 'You passed the interview by showing independence and proportionality.'
      },
      {
        title: 'Promise to approve everything faster',
        detail: 'Tell the CEO compliance can be a rubber stamp if targets require it.',
        next: 'firstDay',
        roleIndex: 1,
        effects: { integrity: -15, riskControl: -14, regulatorTrust: -10, morale: 6, budget: 4 },
        log: 'You got hired, but the MLRO noted a worrying willingness to compromise controls.'
      },
      {
        title: 'Reject all high-risk business',
        detail: 'Say the safest option is to refuse every complex customer, including legitimate ones.',
        next: 'firstDay',
        roleIndex: 1,
        effects: { integrity: 5, riskControl: 3, regulatorTrust: 2, morale: -9, budget: -10 },
        log: 'You sounded ethical but too rigid for a risk-based compliance function.'
      }
    ]
  },

  firstDay: {
    chapter: 'Stage 2 · First 30 days',
    title: 'Your induction: policies, governance, and the control map',
    body: [
      'You join as Compliance Analyst. Your inbox contains policy attestations, a customer risk assessment backlog, sanctions screening alerts, and an invitation to the monthly Risk & Compliance Committee.',
      'Your manager asks you to build a 30-day plan. This determines whether you understand the full compliance life-cycle or just isolated tasks.'
    ],
    duties: [
      'Read AML/CTF, sanctions, anti-bribery, complaints, data protection, market conduct, outsourcing, and whistleblowing policies.',
      'Map legal obligations to controls, owners, evidence, management information, and escalation routes.',
      'Understand governance: board risk appetite, MLRO reporting line, committees, audit, and regulator communication protocols.'
    ],
    choices: [
      {
        title: 'Create a control-and-obligation map',
        detail: 'Prioritize legal obligations, control owners, evidence, and gaps; then brief your manager.',
        next: 'kycBacklog',
        roleIndex: 1,
        effects: { integrity: 5, riskControl: 12, regulatorTrust: 8, morale: 2, budget: -3 },
        log: 'Your control map reveals missing evidence for sanctions alert reviews and overdue training attestations.'
      },
      {
        title: 'Only clear the easiest alerts',
        detail: 'Focus on quick wins and leave complex onboarding files untouched.',
        next: 'kycBacklog',
        roleIndex: 1,
        effects: { integrity: -4, riskControl: -7, regulatorTrust: -5, morale: 4, budget: 2 },
        log: 'You reduced superficial volumes, but high-risk files continued aging.'
      },
      {
        title: 'Escalate every uncertainty to the MLRO',
        detail: 'Avoid making any judgment call until the MLRO personally reviews each item.',
        next: 'kycBacklog',
        roleIndex: 1,
        effects: { integrity: 2, riskControl: 1, regulatorTrust: 1, morale: -6, budget: -4 },
        log: 'The MLRO appreciates caution but warns you to develop proportionate decision-making.'
      }
    ]
  },

  kycBacklog: {
    chapter: 'Stage 3 · Customer due diligence',
    title: 'The politically exposed founder and the urgent launch',
    body: [
      'A crypto-remittance start-up wants an account before a public launch. One beneficial owner is a foreign politically exposed person (PEP). Source of wealth is plausible but not evidenced; adverse media mentions procurement controversies. Sales says losing the deal will damage revenue.',
      'The Head of Product asks you to “just approve pending documents” because monitoring can catch problems later.'
    ],
    duties: [
      'Perform customer due diligence and enhanced due diligence for PEPs, high-risk industries, and complex ownership.',
      'Verify beneficial ownership, purpose of account, source of funds/source of wealth, expected activity, sanctions and adverse media results.',
      'Document rationale, conditions, approvals, and periodic review frequency.'
    ],
    choices: [
      {
        title: 'Apply EDD and conditional escalation',
        detail: 'Request source-of-wealth evidence, senior management approval, risk committee note, and launch limits.',
        next: 'monitoringSpike',
        roleIndex: 2,
        effects: { integrity: 10, riskControl: 13, regulatorTrust: 10, morale: -2, budget: -5 },
        log: 'You are promoted to Compliance Officer after a strong EDD memo withstands challenge.'
      },
      {
        title: 'Approve now, monitor later',
        detail: 'Let the customer launch while waiting for documents.',
        next: 'monitoringSpike',
        roleIndex: 2,
        effects: { integrity: -14, riskControl: -16, regulatorTrust: -12, morale: 8, budget: 8 },
        log: 'Revenue celebrates, but your file contains weak evidence and no senior approval.'
      },
      {
        title: 'Reject without explaining why',
        detail: 'Decline the customer immediately and send a vague note to sales.',
        next: 'monitoringSpike',
        roleIndex: 2,
        effects: { integrity: 4, riskControl: 6, regulatorTrust: 3, morale: -10, budget: -12 },
        log: 'The risk is avoided, but poor rationale creates friction and no learning for the business.'
      }
    ]
  },

  monitoringSpike: {
    chapter: 'Stage 4 · Transaction monitoring and investigations',
    title: 'Midnight alert: mule network or messy growth?',
    body: [
      'Transaction monitoring flags a cluster of newly onboarded accounts receiving many small inbound payments followed by rapid outbound transfers to different wallets. IP addresses overlap, device fingerprints repeat, and customer profiles list unrelated occupations.',
      'Operations wants to close the alerts as “expected fintech usage” because the queue is already behind service-level targets.'
    ],
    duties: [
      'Triage alerts using customer profile, typology, transaction pattern, sanctions exposure, and previous case history.',
      'Document investigation steps, request information where appropriate, recommend restrictions, and escalate suspicious activity.',
      'Tune monitoring rules with data teams without weakening typology coverage merely to reduce volumes.'
    ],
    choices: [
      {
        title: 'Open a linked-case investigation',
        detail: 'Join alerts, preserve evidence, ask Ops to pause exits, and draft an MLRO escalation with typology analysis.',
        next: 'sarDecision',
        roleIndex: 3,
        effects: { integrity: 12, riskControl: 15, regulatorTrust: 10, morale: -4, budget: -4 },
        log: 'Your linked-case method exposes a probable mule network and earns Deputy MLRO responsibility.'
      },
      {
        title: 'Bulk close below threshold',
        detail: 'Close cases under a value threshold without reviewing linked behaviour.',
        next: 'sarDecision',
        roleIndex: 3,
        effects: { integrity: -16, riskControl: -18, regulatorTrust: -15, morale: 7, budget: 5 },
        log: 'The queue improves, but suspicious linked behaviour remains unreported.'
      },
      {
        title: 'Freeze every account instantly',
        detail: 'Block all accounts in the segment before checking proportionality or customer impact.',
        next: 'sarDecision',
        roleIndex: 3,
        effects: { integrity: 2, riskControl: 5, regulatorTrust: 1, morale: -12, budget: -8 },
        log: 'You stopped some risk but created complaints and potential unfair treatment issues.'
      }
    ]
  },

  sarDecision: {
    chapter: 'Stage 5 · MLRO suspicion and reporting',
    title: 'The SAR/STR decision: suspicion, consent, and confidentiality',
    body: [
      'As Deputy MLRO, you prepare a suspicious activity report package. The evidence shows linked accounts, rapid movement of funds, false occupation data, and common devices. The CEO asks whether you can warn the customer group to provide better explanations before filing.',
      'You must protect confidentiality, avoid tipping off, decide whether suspicion exists, and consider freezing, exiting, or seeking law-enforcement consent depending on jurisdiction.'
    ],
    duties: [
      'Assess whether knowledge or suspicion is met and record the reasoning independently.',
      'Draft SAR/STR narratives with who, what, when, where, why suspicious, values, counterparties, and supporting evidence.',
      'Prevent tipping off, manage internal disclosure, maintain SAR registers, and oversee post-report customer handling.'
    ],
    choices: [
      {
        title: 'File a high-quality SAR/STR',
        detail: 'Submit promptly, restrict need-to-know access, brief the CEO on tipping-off risk, and maintain a case register.',
        next: 'trainingCulture',
        roleIndex: 4,
        effects: { integrity: 15, riskControl: 14, regulatorTrust: 14, morale: -3, budget: -3 },
        log: 'You become MLRO after making an independent, well-documented suspicion decision.'
      },
      {
        title: 'Ask customers for their side first',
        detail: 'Contact linked customers with details of the monitoring concern before deciding.',
        next: 'trainingCulture',
        roleIndex: 4,
        effects: { integrity: -18, riskControl: -16, regulatorTrust: -18, morale: 4, budget: 2 },
        log: 'Potential tipping off compromises the investigation and alarms the MLRO.'
      },
      {
        title: 'File a vague defensive report',
        detail: 'Submit a SAR/STR with minimal facts just to prove something was filed.',
        next: 'trainingCulture',
        roleIndex: 4,
        effects: { integrity: -3, riskControl: -7, regulatorTrust: -9, morale: -2, budget: -1 },
        log: 'The report is timely but too vague to help authorities or demonstrate robust governance.'
      }
    ]
  },

  trainingCulture: {
    chapter: 'Stage 6 · Culture, training, and advisory work',
    title: 'The product sprint: embedded finance under pressure',
    body: [
      'Product is launching instant business payouts, Marketing wants a “no paperwork” campaign, and Customer Support keeps mishandling complaints with possible vulnerability indicators. Staff training completion is 61%.',
      'As MLRO, you must influence culture without becoming the department of “no.”'
    ],
    duties: [
      'Deliver role-based AML, sanctions, fraud, conduct, complaints, and data-handling training.',
      'Advise product teams on risk assessments, customer disclosures, financial promotions, outsourcing, and control-by-design.',
      'Use management information to escalate themes: overdue training, complaints root causes, policy breaches, and control gaps.'
    ],
    choices: [
      {
        title: 'Run a risk-by-design sprint',
        detail: 'Embed compliance checkpoints, scenario-based training, approval gates, and MI dashboards for leadership.',
        next: 'regulatorVisit',
        roleIndex: 4,
        effects: { integrity: 8, riskControl: 12, regulatorTrust: 8, morale: 8, budget: -7 },
        log: 'The launch is slower but safer, and staff begin treating compliance as a design partner.'
      },
      {
        title: 'Send a generic policy reminder',
        detail: 'Email everyone the AML policy and hope managers enforce it.',
        next: 'regulatorVisit',
        roleIndex: 4,
        effects: { integrity: -2, riskControl: -8, regulatorTrust: -5, morale: -3, budget: 3 },
        log: 'Training remains a tick-box exercise, and product risk decisions stay undocumented.'
      },
      {
        title: 'Block the launch indefinitely',
        detail: 'Refuse all product changes until every theoretical risk is eliminated.',
        next: 'regulatorVisit',
        roleIndex: 4,
        effects: { integrity: 3, riskControl: 4, regulatorTrust: 1, morale: -15, budget: -14 },
        log: 'Risk is reduced, but the business loses trust and starts avoiding compliance early engagement.'
      }
    ]
  },

  regulatorVisit: {
    chapter: 'Stage 7 · Regulator inspection',
    title: 'The regulator arrives: evidence, candour, and remediation',
    body: [
      'The financial regulator sends an information request covering AML governance, customer risk assessments, SAR/STR logs, sanctions testing, complaints MI, outsourcing oversight, board minutes, and independent audit findings. A supervisory meeting is scheduled in ten business days.',
      'Your board chair asks whether any weaknesses should be softened so the institution looks more mature.'
    ],
    duties: [
      'Coordinate regulatory responses, maintain privilege and accuracy, and ensure accountable executives approve submissions.',
      'Demonstrate governance: risk appetite, policies, controls, assurance, audit, board reporting, breaches, and remediation plans.',
      'Engage with candour, preserve evidence, track commitments, and avoid misleading the regulator.'
    ],
    choices: [
      {
        title: 'Be candid and evidence-led',
        detail: 'Submit accurate packs, disclose known gaps, present owners, deadlines, risk acceptance, and board oversight.',
        next: 'boardCrisis',
        roleIndex: 5,
        effects: { integrity: 14, riskControl: 12, regulatorTrust: 18, morale: 3, budget: -8 },
        log: 'The regulator criticizes gaps but praises candour, evidence, and accountable remediation.'
      },
      {
        title: 'Hide weak files',
        detail: 'Exclude messy customer files and describe incomplete controls as fully embedded.',
        next: 'boardCrisis',
        roleIndex: 5,
        effects: { integrity: -25, riskControl: -12, regulatorTrust: -25, morale: -6, budget: 5 },
        log: 'The regulator spots inconsistencies between MI and files; trust collapses.'
      },
      {
        title: 'Overwhelm them with volume',
        detail: 'Send every policy, spreadsheet, and committee pack without clear mapping or explanations.',
        next: 'boardCrisis',
        roleIndex: 5,
        effects: { integrity: 1, riskControl: -2, regulatorTrust: -7, morale: -7, budget: -4 },
        log: 'The submission is not misleading, but poor structure suggests weak governance grip.'
      }
    ]
  },

  boardCrisis: {
    chapter: 'Stage 8 · Board accountability and crisis response',
    title: 'A correspondent bank threatens termination',
    body: [
      'A correspondent bank threatens to end the relationship after media reports allege FinShield processed scam proceeds. The board wants a 48-hour plan. Customers need service continuity, law enforcement may request data, and the regulator expects updates.',
      'As Chief Compliance Officer and MLRO, you must protect the institution, customers, and the financial system.'
    ],
    duties: [
      'Lead incident governance with Legal, Risk, Operations, Product, Communications, and senior management.',
      'Assess notifications to regulator, law enforcement, correspondent bank, data-protection authority, and affected customers.',
      'Drive remediation: customer lookback, control testing, policy change, training, resourcing, disciplinary action, and board MI.'
    ],
    choices: [
      {
        title: 'Launch a disciplined crisis plan',
        detail: 'Stand up a war room, preserve evidence, update regulator, perform lookback, and give the board daily MI.',
        next: 'finale',
        roleIndex: 5,
        effects: { integrity: 16, riskControl: 15, regulatorTrust: 14, morale: 2, budget: -10 },
        log: 'Your crisis governance keeps the bank partner engaged while remediation accelerates.'
      },
      {
        title: 'Let PR handle it alone',
        detail: 'Focus on reassuring statements and delay lookback until the news cycle moves on.',
        next: 'finale',
        roleIndex: 5,
        effects: { integrity: -18, riskControl: -20, regulatorTrust: -18, morale: -4, budget: 4 },
        log: 'Public statements outpace evidence; the regulator and correspondent bank demand urgent explanations.'
      },
      {
        title: 'Shut down all customer activity',
        detail: 'Freeze the whole platform immediately without segmentation or legal analysis.',
        next: 'finale',
        roleIndex: 5,
        effects: { integrity: 2, riskControl: 6, regulatorTrust: -2, morale: -18, budget: -18 },
        log: 'You reduce immediate exposure but create avoidable harm, complaints, and operational chaos.'
      }
    ]
  },

  finale: {
    chapter: 'Career outcome',
    title: 'Your compliance career review',
    body: [],
    duties: [
      'Compliance is a life-cycle: appointment, onboarding, advisory, monitoring, investigation, reporting, governance, regulator engagement, remediation, and continuous improvement.',
      'Strong officers balance independence, proportionality, evidence, candour, and commercial understanding.',
      'The MLRO must be empowered, resourced, independent, and able to report directly to senior management and the board.'
    ],
    choices: []
  }
};

let state = structuredClone(initialState);

const elements = {
  startButton: document.querySelector('#start-button'),
  restartButton: document.querySelector('#restart-button'),
  hierarchyList: document.querySelector('#hierarchy-list'),
  statsGrid: document.querySelector('#stats-grid'),
  chapterLabel: document.querySelector('#chapter-label'),
  sceneTitle: document.querySelector('#scene-title'),
  sceneBody: document.querySelector('#scene-body'),
  dutiesBox: document.querySelector('#duties-box'),
  dutiesList: document.querySelector('#duties-list'),
  choices: document.querySelector('#choices'),
  careerLog: document.querySelector('#career-log'),
  choiceTemplate: document.querySelector('#choice-template')
};

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

function applyChoice(choice) {
  Object.entries(choice.effects).forEach(([stat, delta]) => {
    state.stats[stat] = clampScore(state.stats[stat] + delta);
  });

  state.roleIndex = choice.roleIndex ?? state.roleIndex;
  state.scene = choice.next;
  state.log.unshift(choice.log);
  render();
}

function formatStatName(stat) {
  return stat.replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase());
}

function getOutcome() {
  const average = Object.values(state.stats).reduce((sum, value) => sum + value, 0) / 5;
  if (state.stats.integrity < 35 || state.stats.regulatorTrust < 35) {
    return {
      className: 'bad',
      label: 'Enforcement storm',
      text: 'Your institution faces severe supervisory attention. The lesson: weak candour, poor SAR handling, or compromised independence can destroy trust faster than any product launch can rebuild it.'
    };
  }

  if (average >= 75 && state.stats.riskControl >= 70) {
    return {
      className: 'good',
      label: 'Trusted MLRO leader',
      text: 'You finish as a respected MLRO/CCO. The regulator sees an honest, evidence-led function; the board funds remediation; and teams understand that compliance protects growth.'
    };
  }

  return {
    className: 'warn',
    label: 'Developing compliance leader',
    text: 'You kept the institution moving, but your scorecard shows gaps. Review where morale, budget, control quality, or regulator confidence suffered and replay to test a different risk appetite.'
  };
}

function renderHierarchy() {
  elements.hierarchyList.innerHTML = '';
  roleHierarchy.forEach((role, index) => {
    const item = document.createElement('li');
    item.textContent = role;
    if (index === state.roleIndex) item.classList.add('current');
    elements.hierarchyList.appendChild(item);
  });
}

function renderStats() {
  elements.statsGrid.innerHTML = '';
  Object.entries(state.stats).forEach(([stat, value]) => {
    const card = document.createElement('div');
    card.className = 'stat';
    card.innerHTML = `<span>${formatStatName(stat)}</span><strong>${value}</strong>`;
    elements.statsGrid.appendChild(card);
  });
}

function renderDuties(scene) {
  elements.dutiesList.innerHTML = '';
  if (!scene.duties?.length) {
    elements.dutiesBox.hidden = true;
    return;
  }

  scene.duties.forEach(duty => {
    const item = document.createElement('li');
    item.textContent = duty;
    elements.dutiesList.appendChild(item);
  });
  elements.dutiesBox.hidden = false;
}

function renderChoices(scene) {
  elements.choices.innerHTML = '';
  if (state.scene === 'finale') {
    const restart = elements.choiceTemplate.content.cloneNode(true);
    const button = restart.querySelector('button');
    restart.querySelector('.choice-title').textContent = 'Replay with a different risk appetite';
    restart.querySelector('.choice-detail').textContent = 'Try another path through the compliance officer and MLRO life-cycle.';
    button.addEventListener('click', resetGame);
    elements.choices.appendChild(restart);
    return;
  }

  scene.choices.forEach(choice => {
    const clone = elements.choiceTemplate.content.cloneNode(true);
    const button = clone.querySelector('button');
    clone.querySelector('.choice-title').textContent = choice.title;
    clone.querySelector('.choice-detail').textContent = choice.detail;
    button.addEventListener('click', () => applyChoice(choice));
    elements.choices.appendChild(clone);
  });
}

function renderLog() {
  elements.careerLog.innerHTML = '';
  const entries = state.log.length ? state.log : ['No career decisions recorded yet.'];
  entries.forEach(entry => {
    const item = document.createElement('li');
    item.textContent = entry;
    elements.careerLog.appendChild(item);
  });
}

function renderSceneBody(scene) {
  if (state.scene === 'finale') {
    const outcome = getOutcome();
    elements.sceneBody.innerHTML = `
      <p><span class="${outcome.className}">${outcome.label}:</span> ${outcome.text}</p>
      <p>Your final scorecard reflects the trade-offs you made across the career life-cycle. In a real institution, these decisions would be supported by legal advice, documented governance, policies, training, assurance testing, audit, and clear board accountability.</p>
      <ul>
        <li><strong>Integrity</strong> measures independence, honesty, and resistance to inappropriate pressure.</li>
        <li><strong>Risk control</strong> measures the quality of KYC, monitoring, investigations, reporting, and remediation.</li>
        <li><strong>Regulator trust</strong> measures candour, evidence, reporting quality, and supervisory confidence.</li>
        <li><strong>Morale</strong> measures whether colleagues see compliance as practical and collaborative.</li>
        <li><strong>Budget</strong> measures resource discipline and the cost of controls, crises, and remediation.</li>
      </ul>`;
    return;
  }

  elements.sceneBody.innerHTML = scene.body.map(paragraph => `<p>${paragraph}</p>`).join('');
}

function render() {
  const scene = scenes[state.scene];
  elements.chapterLabel.textContent = scene.chapter;
  elements.sceneTitle.textContent = scene.title;
  renderSceneBody(scene);
  renderDuties(scene);
  renderChoices(scene);
  renderHierarchy();
  renderStats();
  renderLog();
}

function startGame() {
  state = structuredClone(initialState);
  render();
}

function resetGame() {
  startGame();
}

elements.startButton.addEventListener('click', startGame);
elements.restartButton.addEventListener('click', resetGame);
render();
