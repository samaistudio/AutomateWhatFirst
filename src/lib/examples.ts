import type { Answers, ProcessAnswer } from "./model";

// Fictional example companies. Any resemblance to real businesses is coincidental.
type P = Omit<ProcessAnswer, "aboutPeople" | "haveTool" | "volume" | "today"> & Partial<ProcessAnswer>;
const p = (x: P): ProcessAnswer => ({ aboutPeople: false, haveTool: false, volume: 0, today: "", ...x });

export const EXAMPLES: { label: string; answers: Answers }[] = [
  {
    label: "Tax office, 12 people",
    answers: {
      company: { name: "Becker & Partner Tax Advisors", industry: "Tax & accounting", employees: 12, hourlyCost: 52, worksCouncil: false, country: "Germany",
        systems: ["Microsoft 365", "DATEV"], aiTools: ["ChatGPT (free/private)", "DeepL"], builder: 2, budget: 400, appetite: "careful",
        goals: ["Save time", "Fewer mistakes", "Grow without hiring"],
        pain: "Clients send receipts as photos and paper. We spend the end of every month typing and chasing missing documents." },
      readiness: { data1: 3, data2: 2, data3: 1, people1: 1, people2: 1, people3: 1, tools1: 2, tools2: 2, gov1: 0, gov2: 2 },
      processes: [
        p({ id: "invoices", hoursWeek: 22, people: 5, volume: 1800, repetitive: 3, digital: 2, errorImpact: 2, today: "Receipts arrive by e-mail and in the DATEV app, some on paper. Staff check and assign them by hand." }),
        p({ id: "bookkeeping", hoursWeek: 30, people: 6, repetitive: 3, digital: 2, errorImpact: 3, today: "Bank transactions matched in DATEV; about a third need a manual decision." }),
        p({ id: "email", hoursWeek: 15, people: 10, volume: 900, repetitive: 2, digital: 2, errorImpact: 2, today: "Mostly reminders for missing documents and standard client questions, written from scratch in Outlook." }),
        p({ id: "research", hoursWeek: 8, people: 6, repetitive: 1, digital: 2, errorImpact: 3, today: "Tax law questions researched in databases and on the web." }),
        p({ id: "recruiting", hoursWeek: 3, people: 2, volume: 40, repetitive: 2, digital: 2, errorImpact: 2, aboutPeople: true, today: "Applications by e-mail, partners read all CVs." }),
      ],
    },
  },
  {
    label: "Online shop, 25 people",
    answers: {
      company: { name: "Rheinkiste GmbH", industry: "Online shop", employees: 25, hourlyCost: 42, worksCouncil: true, country: "Germany",
        systems: ["Google Workspace", "Shopify / Shopware", "lexoffice / sevDesk"], aiTools: ["ChatGPT Team/Enterprise", "Automation tool (Zapier, Make, n8n)"], builder: 1, budget: 1200, appetite: "ambitious",
        goals: ["Answer customers faster", "Grow without hiring", "Stay competitive"],
        pain: "Support tickets double before Christmas and we hire temps who need weeks to learn our products." },
      readiness: { data1: 3, data2: 3, data3: 2, people1: 2, people2: 2, people3: 2, tools1: 2, tools2: 3, gov1: 1, gov2: 2 },
      processes: [
        p({ id: "support", hoursWeek: 60, people: 6, volume: 3200, repetitive: 3, digital: 2, errorImpact: 1, today: "Zendesk; about 60 % are 'where is my order' and returns." }),
        p({ id: "product", hoursWeek: 18, people: 3, volume: 150, repetitive: 3, digital: 2, errorImpact: 2, today: "New products every week, texts written from supplier data sheets." }),
        p({ id: "social", hoursWeek: 12, people: 2, repetitive: 2, digital: 2, errorImpact: 1, haveTool: true }),
        p({ id: "inventory", hoursWeek: 10, people: 2, repetitive: 2, digital: 2, errorImpact: 3, today: "Excel export from Shopify, reorder points by gut feeling." }),
        p({ id: "custom-returns", name: "Checking returned goods", hoursWeek: 14, people: 3, volume: 600, repetitive: 3, digital: 1, errorImpact: 2, today: "Warehouse staff note the condition on paper, the office enters refunds." }),
      ],
    },
  },
  {
    label: "Electrician, 9 people",
    answers: {
      company: { name: "Krämer Elektrotechnik", industry: "Trades & construction", employees: 9, hourlyCost: 48, worksCouncil: false, country: "Germany",
        systems: ["Microsoft 365", "Industry software"], aiTools: [], builder: 0, budget: 150, appetite: "careful",
        goals: ["Save time", "Keep staff happy"],
        pain: "The evenings go into writing quotes and site reports. Customers wait a week for a quote." },
      readiness: { data1: 1, data2: 1, data3: 0, people1: 0, people2: 1, people3: 1, tools1: 1, tools2: 2, gov1: 0, gov2: 1 },
      processes: [
        p({ id: "quotes", hoursWeek: 10, people: 2, volume: 35, repetitive: 2, digital: 1, errorImpact: 3, today: "Owner writes quotes in the trade software in the evening, from notes taken on site." }),
        p({ id: "documentation", hoursWeek: 12, people: 6, volume: 120, repetitive: 3, digital: 0, errorImpact: 2, today: "Paper forms filled in on site, typed up in the office." }),
        p({ id: "phone", hoursWeek: 8, people: 1, volume: 400, repetitive: 2, digital: 1, errorImpact: 2, today: "Calls go to the owner's mobile while he is on site." }),
        p({ id: "invoices", hoursWeek: 5, people: 1, volume: 90, repetitive: 3, digital: 1, errorImpact: 2 }),
      ],
    },
  },
];
