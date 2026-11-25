import { DIMS, PROCESSES, READINESS, type Process } from "./library";
import GUIDE from "../../AI-GUIDE.md?raw";

export const WEEKS = 4.33;

export type ProcessAnswer = {
  id: string;
  name?: string;         // only for processes the user adds themselves
  hoursWeek: number;     // total hours per week across everyone doing it
  people: number;        // people who would use the tool
  volume: number;        // cases per month (invoices, e-mails, quotes …), 0 = not known
  repetitive: 1 | 2 | 3; // 1 every case is different, 3 mostly the same steps
  digital: 0 | 1 | 2;    // 0 paper, 1 partly digital, 2 fully digital
  errorImpact: 1 | 2 | 3;
  aboutPeople: boolean;  // decisions about applicants, employees or customers' access to services
  haveTool: boolean;     // already licensed
  today: string;         // how it is done today, which tools
};

export type Answers = {
  company: {
    name: string; industry: string; employees: number; hourlyCost: number; worksCouncil: boolean;
    country: string; systems: string[]; aiTools: string[]; builder: number; budget: number;
    appetite: "careful" | "balanced" | "ambitious"; goals: string[]; pain: string;
  };
  readiness: Record<string, number>; // 0..3
  processes: ProcessAnswer[];
};

export const COUNTRIES = ["Germany", "Austria", "Switzerland", "Other EU country", "Outside the EU"] as const;
export const SYSTEMS = ["Microsoft 365", "Google Workspace", "DATEV", "Odoo", "SAP Business One", "lexoffice / sevDesk", "Shopify / Shopware", "HubSpot / Salesforce / other CRM", "Personio", "Industry software"] as const;
export const AI_TOOLS = ["ChatGPT (free/private)", "ChatGPT Team/Enterprise", "Microsoft Copilot", "Google Gemini", "Claude", "DeepL", "Automation tool (Zapier, Make, n8n)"] as const;
export const BUILDERS = ["Nobody, we buy ready tools", "Someone who can set up no-code tools", "An external IT partner", "Our own developer"] as const;
export const GOALS = ["Save time", "Answer customers faster", "Fewer mistakes", "Grow without hiring", "Cut costs", "Keep staff happy", "Stay competitive"] as const;
export const APPETITE: { v: Answers["company"]["appetite"]; l: string }[] = [
  { v: "careful", l: "Careful: small, safe steps" }, { v: "balanced", l: "Balanced" }, { v: "ambitious", l: "Ambitious: we want to move fast" }];

export const EMPTY: Answers = {
  company: { name: "", industry: "", employees: 15, hourlyCost: 45, worksCouncil: false, country: "Germany", systems: [], aiTools: [], builder: 0, budget: 300, appetite: "balanced", goals: [], pain: "" },
  readiness: {},
  processes: [],
};

/** Old saved files and examples may miss newer fields. */
export const normalize = (s: Partial<Answers>): Answers => ({
  company: { ...EMPTY.company, ...(s.company || {}) },
  readiness: s.readiness || {},
  processes: (s.processes || []).map(p => ({ ...p, volume: p.volume ?? 0, today: p.today ?? "" })),
});

export const defaultsFor = (p: Process, employees: number): ProcessAnswer => ({
  id: p.id, hoursWeek: Math.max(2, Math.round(employees * .6)), people: Math.max(1, Math.round(employees / 3)), volume: 0,
  repetitive: 2, digital: 1, errorImpact: 2, aboutPeople: p.aiAct === "high", haveTool: false, today: "",
});

export const customProcess = (name: string, employees: number): ProcessAnswer => ({
  id: "custom-" + Date.now().toString(36), name, hoursWeek: Math.max(2, Math.round(employees * .4)), people: 1, volume: 0,
  repetitive: 2, digital: 1, errorImpact: 2, aboutPeople: false, haveTool: false, today: "",
});

export const libFor = (pa: ProcessAnswer) => PROCESSES.find(x => x.id === pa.id);
export const nameOf = (pa: ProcessAnswer) => pa.name || libFor(pa)?.name || pa.id;

export function readiness(a: Answers) {
  const dims = DIMS.map(d => {
    const qs = READINESS.filter(q => q.dim === d);
    const done = qs.filter(q => a.readiness[q.id] !== undefined);
    const score = done.length ? done.reduce((s, q) => s + a.readiness[q.id], 0) / (qs.length * 3) * 100 : 0;
    return { dim: d, score: Math.round(score) };
  });
  const overall = Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length);
  return { dims, overall };
}

const REP = ["", "every case is different", "cases are similar", "the steps are the same every time"];
const DIG = ["mostly on paper", "partly digital", "fully digital"];
const ERR = ["", "a mistake costs little", "a mistake costs something", "a mistake costs a lot"];

/** The survey answers as plain facts for the user's AI. No conclusions: the AI does the reasoning with the guide. */
export function answersMarkdown(a: Answers): string {
  const c = a.company, r = readiness(a);
  const L: string[] = [
    `# Survey answers: ${c.name || "our company"}`, "",
    `Collected with AutomateWhatFirst on ${new Date().toISOString().slice(0, 10)}. Numbers are the owner's rough estimates.`, "",
    "## Company",
    `- Industry: ${c.industry}`, `- Employees: ${c.employees}`, `- Country: ${c.country}`,
    `- Average hourly cost of staff incl. employer costs: €${c.hourlyCost}`,
    `- Works council (Betriebsrat): ${c.worksCouncil ? "yes" : "no"}`,
    `- Software in use: ${c.systems.join(", ") || "not stated"}`,
    `- AI tools already in use: ${c.aiTools.join(", ") || "none"}`,
    `- Who can build or set up tools: ${BUILDERS[c.builder]}`,
    `- Budget for AI tools: about €${c.budget} per month`,
    `- Appetite: ${APPETITE.find(x => x.v === c.appetite)?.l}`,
    `- Goals: ${c.goals.join(", ") || "not stated"}`,
    `- Biggest pain, in their words: ${c.pain.trim() || "not stated"}`, "",
    `## Readiness (0 = weakest answer, 3 = strongest)`,
    `Simple average per area: ${r.dims.map(d => `${d.dim} ${d.score}/100`).join(", ")}; overall ${r.overall}/100.`, "",
    ...READINESS.map(q => `- ${q.dim}: ${q.q} → **${a.readiness[q.id] === undefined ? "not answered" : q.a[a.readiness[q.id]]}** (${a.readiness[q.id] ?? "–"}/3)`), "",
    "## Processes the owner picked",
  ];
  a.processes.forEach((pa, i) => {
    const p = libFor(pa);
    L.push("", `### ${i + 1}. ${nameOf(pa)}${p ? ` (${p.area})` : " (added by the owner)"}`,
      `- Time today: ${pa.hoursWeek} h per week for the whole team (≈ ${Math.round(pa.hoursWeek * WEEKS)} h per month)`,
      `- Volume: ${pa.volume ? `${pa.volume} cases per month` : "not stated"}`,
      `- People who would use a tool: ${pa.people}`,
      `- How it works: ${REP[pa.repetitive]}; ${DIG[pa.digital]}; ${ERR[pa.errorImpact]}`,
      `- Decisions about people (applicants, staff, customers' access): ${pa.aboutPeople ? "yes" : "no"}`,
      `- Already paying for a suitable tool: ${pa.haveTool ? "yes" : "no"}`,
      `- Today, in their words: ${pa.today.trim() || "not stated"}`);
    if (p) L.push(`- Reference values (AutomateWhatFirst library, planning assumptions, not measurements): AI can typically take over or speed up ${Math.round(p.potential[0] * 100)}–${Math.round(p.potential[1] * 100)} % of the time; typical tools: ${p.tool}; about €${p.toolCost} per user and month; about ${p.setupDays} internal days to set up a pilot; EU AI Act: ${p.aiAct} risk; personal data usually involved: ${p.personalData ? "yes" : "no"}; a typical safe pilot: ${p.firstStep} Main risk: ${p.watchOut}`);
  });
  return L.join("\n");
}

export const START_PROMPT = "I run a small business. This file contains a guide for you (part 1) and my survey answers (part 2). Follow the guide exactly and write my AI automation report from my answers. Ask me up to five short questions first if something important is missing.";

/** One file to upload: the guide first, then the answers. */
export function bundle(a: Answers): string {
  return [
    `> ${START_PROMPT}`, "",
    "---", "", "# PART 1: GUIDE FOR THE AI", "", GUIDE.trim(), "",
    "---", "", "# PART 2: SURVEY ANSWERS", "", answersMarkdown(a), "",
  ].join("\n");
}
