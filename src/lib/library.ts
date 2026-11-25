// The process library: common office processes in small businesses and what AI can realistically do for them.
// All numbers are planning assumptions, not measurements. They are shown in the report and can be
// changed per process. "potential" is the share of the time spent on a process that AI tools can
// typically take over or speed up, as a low and a high case.

export type AiActClass = "minimal" | "limited" | "high";

export type Process = {
  id: string;
  name: string;
  area: "Customers" | "Sales & marketing" | "Finance" | "Admin" | "People" | "Operations" | "IT";
  industries: string[] | "all";
  potential: [number, number];
  tool: string;
  toolCost: number;        // € per user and month, 0 if usually covered by an office AI licence
  setupDays: number;       // internal days to set up and pilot
  aiAct: AiActClass;
  personalData: boolean;   // typically involves personal data of customers or staff
  firstStep: string;       // a concrete pilot
  watchOut: string;        // the main risk
};

export const INDUSTRIES = [
  "Tax & accounting", "Law firm", "IT services", "Marketing agency", "Online shop", "Retail",
  "Healthcare practice", "Trades & construction", "Real estate", "Hotel & hospitality", "Manufacturing", "Other services",
] as const;

const OFFICE = "Microsoft 365 Copilot, ChatGPT Team or Gemini";

export const PROCESSES: Process[] = [
  { id: "email", name: "Answering routine customer e-mails", area: "Customers", industries: "all", potential: [.25, .45],
    tool: OFFICE, toolCost: 25, setupDays: 2, aiAct: "limited", personalData: true,
    firstStep: "Give one team AI drafting in Outlook or Gmail for two weeks; replies are always checked before sending.",
    watchOut: "Customer data goes to the AI provider – use a business plan with a data processing agreement." },
  { id: "support", name: "First-level support and FAQ", area: "Customers", industries: ["IT services", "Online shop", "Retail", "Hotel & hospitality", "Other services"], potential: [.2, .4],
    tool: "Help-desk AI (Zendesk, Freshdesk, Odoo Helpdesk) or a chatbot", toolCost: 40, setupDays: 6, aiAct: "limited", personalData: true,
    firstStep: "Let AI suggest answers from your existing help articles; an agent approves each one.",
    watchOut: "Customers must be told when they talk to a chatbot (EU AI Act transparency duty)." },
  { id: "meetings", name: "Meeting notes and follow-ups", area: "Admin", industries: "all", potential: [.4, .7],
    tool: "Teams Premium / Copilot, Zoom AI or Google Meet notes", toolCost: 10, setupDays: 1, aiAct: "minimal", personalData: true,
    firstStep: "Turn on AI notes for internal meetings only, with everyone's consent.",
    watchOut: "Recording colleagues needs their consent; with a works council, agree on it first." },
  { id: "documents", name: "Writing reports, letters and documents", area: "Admin", industries: "all", potential: [.2, .4],
    tool: OFFICE, toolCost: 25, setupDays: 2, aiAct: "minimal", personalData: false,
    firstStep: "Build three templates (offer letter, status report, summary) as saved prompts.",
    watchOut: "AI text can contain wrong facts – keep a human check for anything sent out." },
  { id: "translation", name: "Translating texts", area: "Admin", industries: "all", potential: [.5, .8],
    tool: "DeepL Pro", toolCost: 9, setupDays: 1, aiAct: "minimal", personalData: false,
    firstStep: "Replace free translators with DeepL Pro (no data kept by the provider).",
    watchOut: "Free translation tools may keep and reuse your texts." },
  { id: "quotes", name: "Preparing quotes and proposals", area: "Sales & marketing", industries: "all", potential: [.25, .45],
    tool: `${OFFICE}, or AI in your CRM/ERP`, toolCost: 25, setupDays: 3, aiAct: "minimal", personalData: false,
    firstStep: "Draft proposals from your last 20 winning quotes as examples; sales checks prices.",
    watchOut: "Never let AI set prices or legal terms on its own." },
  { id: "social", name: "Social media and newsletter content", area: "Sales & marketing", industries: "all", potential: [.35, .6],
    tool: "ChatGPT Team, Canva AI", toolCost: 25, setupDays: 2, aiAct: "limited", personalData: false,
    firstStep: "Plan one month of posts with AI from your brand rules; a person approves each post.",
    watchOut: "AI-generated images and deepfakes must be labelled (EU AI Act)." },
  { id: "product", name: "Product descriptions and listings", area: "Sales & marketing", industries: ["Online shop", "Retail", "Manufacturing", "Real estate"], potential: [.5, .75],
    tool: "ChatGPT Team or shop-system AI (Shopify Magic, Shopware AI Copilot)", toolCost: 25, setupDays: 3, aiAct: "minimal", personalData: false,
    firstStep: "Generate descriptions for 50 products from the data sheet; check facts and claims.",
    watchOut: "Wrong product claims are a liability – keep a fact check." },
  { id: "leads", name: "Researching leads and preparing sales calls", area: "Sales & marketing", industries: "all", potential: [.3, .5],
    tool: "ChatGPT Team / Perplexity, CRM AI", toolCost: 25, setupDays: 2, aiAct: "minimal", personalData: true,
    firstStep: "One-page call prep per lead from public sources, in a fixed format.",
    watchOut: "Scraping and storing personal data of contacts needs a GDPR legal basis." },
  { id: "invoices", name: "Processing incoming invoices", area: "Finance", industries: "all", potential: [.5, .8],
    tool: "Invoice capture in your accounting software (DATEV, Odoo, lexoffice, sevDesk)", toolCost: 15, setupDays: 4, aiAct: "minimal", personalData: false,
    firstStep: "Switch on automatic invoice capture for one supplier group; compare with manual entry for a month.",
    watchOut: "Posting must stay reviewable (GoBD) – keep approval before payment." },
  { id: "bookkeeping", name: "Bookkeeping and account matching", area: "Finance", industries: ["Tax & accounting", "Online shop", "Retail", "Manufacturing", "Other services"], potential: [.3, .6],
    tool: "AI matching in DATEV, Odoo or similar", toolCost: 20, setupDays: 5, aiAct: "minimal", personalData: false,
    firstStep: "Let AI suggest bank-statement matches; a person confirms each batch.",
    watchOut: "Mistakes go straight into the books – keep the four-eyes principle." },
  { id: "reporting", name: "Monthly reporting and analysis", area: "Finance", industries: "all", potential: [.3, .5],
    tool: "Copilot in Excel, ChatGPT data analysis", toolCost: 25, setupDays: 3, aiAct: "minimal", personalData: false,
    firstStep: "Have AI write the commentary for last month's report from the numbers; compare with yours.",
    watchOut: "AI can miscalculate – numbers must come from the source system, not the chat." },
  { id: "contracts", name: "Reviewing contracts and documents", area: "Admin", industries: ["Law firm", "Real estate", "Tax & accounting", "IT services", "Manufacturing"], potential: [.2, .4],
    tool: "Legal AI (e.g. Harvey, Legartis, Bryter) or ChatGPT Team", toolCost: 60, setupDays: 5, aiAct: "minimal", personalData: true,
    firstStep: "Use AI to find missing clauses against your own checklist; a lawyer decides.",
    watchOut: "Professional secrecy (§ 203 StGB) – only providers that are cleared for it." },
  { id: "research", name: "Research and looking things up", area: "Admin", industries: ["Tax & accounting", "Law firm", "Healthcare practice", "IT services"], potential: [.3, .5],
    tool: "Perplexity, ChatGPT Team, specialist databases with AI", toolCost: 25, setupDays: 1, aiAct: "minimal", personalData: false,
    firstStep: "Answer the five most common internal questions with AI plus sources; check the sources.",
    watchOut: "AI invents sources – every source must be opened and checked." },
  { id: "scheduling", name: "Scheduling and appointment booking", area: "Customers", industries: ["Healthcare practice", "Trades & construction", "Hotel & hospitality", "Real estate", "Other services"], potential: [.4, .7],
    tool: "Online booking with AI assistant (e.g. Doctolib, Calendly, phone AI)", toolCost: 30, setupDays: 4, aiAct: "limited", personalData: true,
    firstStep: "Offer online booking for one appointment type; keep the phone as a backup.",
    watchOut: "Health data is specially protected (Art. 9 GDPR) – check the provider carefully." },
  { id: "phone", name: "Taking phone calls and messages", area: "Customers", industries: ["Healthcare practice", "Trades & construction", "Hotel & hospitality", "Real estate", "Other services"], potential: [.3, .6],
    tool: "AI phone assistant", toolCost: 80, setupDays: 5, aiAct: "limited", personalData: true,
    firstStep: "Let the AI take messages outside opening hours only.",
    watchOut: "Callers must know they talk to an AI; recordings need consent." },
  { id: "documentation", name: "Site reports and job documentation", area: "Operations", industries: ["Trades & construction", "Manufacturing", "Real estate"], potential: [.4, .65],
    tool: "Speech-to-report apps, Copilot", toolCost: 20, setupDays: 3, aiAct: "minimal", personalData: false,
    firstStep: "Dictate the site report on the phone; AI fills in the template.",
    watchOut: "Reports used as evidence must be checked and signed by a person." },
  { id: "patient", name: "Clinical documentation", area: "Operations", industries: ["Healthcare practice"], potential: [.3, .5],
    tool: "Medical speech recognition / AI documentation (certified)", toolCost: 90, setupDays: 6, aiAct: "high", personalData: true,
    firstStep: "Pilot a certified dictation tool with one practitioner; patients are informed.",
    watchOut: "Medical AI can be a medical device and high-risk – only certified products." },
  { id: "code", name: "Writing and reviewing code", area: "IT", industries: ["IT services", "Online shop", "Marketing agency", "Manufacturing"], potential: [.2, .4],
    tool: "GitHub Copilot, Claude Code, Cursor", toolCost: 19, setupDays: 2, aiAct: "minimal", personalData: false,
    firstStep: "Give two developers an AI coding assistant for a month; keep code reviews as they are.",
    watchOut: "Secrets and customer code must not leak – use business plans, no training on your code." },
  { id: "itsupport", name: "Internal IT support", area: "IT", industries: "all", potential: [.2, .4],
    tool: "Copilot / help-desk AI with your own documentation", toolCost: 25, setupDays: 4, aiAct: "minimal", personalData: false,
    firstStep: "Put your IT how-tos into one place and let AI answer from them.",
    watchOut: "Admin rights must never be handed to an AI agent without control." },
  { id: "inventory", name: "Stock and demand planning", area: "Operations", industries: ["Online shop", "Retail", "Manufacturing", "Hotel & hospitality"], potential: [.2, .4],
    tool: "Forecasting in your ERP (Odoo, SAP Business One, Xentral)", toolCost: 30, setupDays: 8, aiAct: "minimal", personalData: false,
    firstStep: "Compare AI demand forecasts with your own orders for one product group over two months.",
    watchOut: "Forecasts are only as good as your sales history – check the data first." },
  { id: "recruiting", name: "Screening job applications", area: "People", industries: "all", potential: [.3, .5],
    tool: "AI in recruiting software (Personio, Join, softgarden)", toolCost: 50, setupDays: 5, aiAct: "high", personalData: true,
    firstStep: "Use AI only to write job ads and summarise CVs – people decide who is invited.",
    watchOut: "Ranking or filtering applicants with AI is high-risk under the EU AI Act and needs works-council agreement." },
  { id: "hradmin", name: "HR questions and admin", area: "People", industries: "all", potential: [.25, .45],
    tool: "Copilot / HR software AI with your own policies", toolCost: 25, setupDays: 3, aiAct: "minimal", personalData: true,
    firstStep: "Answer standard HR questions (holidays, travel expenses) from your policies with AI.",
    watchOut: "Never use AI to evaluate or monitor employees – high-risk and subject to co-determination." },
  { id: "onboarding", name: "Training and onboarding material", area: "People", industries: "all", potential: [.35, .6],
    tool: OFFICE, toolCost: 25, setupDays: 3, aiAct: "minimal", personalData: false,
    firstStep: "Turn your existing documents into a short onboarding guide and quiz with AI.",
    watchOut: "Outdated documents give outdated answers – review the sources first." },
];

export const READINESS = [
  { id: "data1", dim: "Data", q: "Where is your business information kept?", a: ["Mostly paper and people's heads", "Spread over e-mails and files", "In a few systems (accounting, CRM, shared drive)", "Mostly in one ERP/CRM, well kept"] },
  { id: "data2", dim: "Data", q: "Could you find last year's 20 biggest customer orders in 10 minutes?", a: ["No", "With a lot of searching", "Yes, with some effort", "Yes, straight away"] },
  { id: "data3", dim: "Data", q: "Are your main workflows written down (checklists, how-tos)?", a: ["No, it's all in people's heads", "A few notes here and there", "The important ones", "Yes, and they are kept up to date"] },
  { id: "people1", dim: "People", q: "How many of your staff already use AI tools at work?", a: ["None that I know of", "A few, privately and unofficially", "About a third", "Most of them, regularly"] },
  { id: "people2", dim: "People", q: "How do your staff feel about AI?", a: ["Worried or against it", "Unsure", "Curious", "Asking for it"] },
  { id: "people3", dim: "People", q: "Who would drive an AI project?", a: ["Nobody has time", "The owner, on the side", "A named person with some time", "A person or team with time and budget"] },
  { id: "tools1", dim: "Tools", q: "Which office software do you use?", a: ["Mixed / old versions", "Some cloud tools", "Microsoft 365 or Google Workspace", "Microsoft 365 or Google Workspace with business AI already"] },
  { id: "tools2", dim: "Tools", q: "Who looks after IT?", a: ["Nobody really", "An employee on the side", "An external IT partner", "Our own IT person or team"] },
  { id: "gov1", dim: "Rules", q: "Do you have written rules for using AI at work?", a: ["No", "We talked about it", "Short rules exist", "Rules plus training for staff"] },
  { id: "gov2", dim: "Rules", q: "Data protection: how are you set up?", a: ["Not really", "Basic GDPR documents", "Data protection officer, processing records", "Officer, records and checked vendor contracts"] },
] as const;

export const DIMS = ["Data", "People", "Tools", "Rules"] as const;
