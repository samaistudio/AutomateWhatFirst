import * as React from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Download, FileText, FileUp, Plus, RotateCcw, X } from "lucide-react";
import { INDUSTRIES, PROCESSES, READINESS } from "@/lib/library";
import {
  AI_TOOLS, APPETITE, BUILDERS, COUNTRIES, EMPTY, GOALS, START_PROMPT, SYSTEMS,
  answersMarkdown, bundle, customProcess, defaultsFor, libFor, nameOf, normalize, readiness, type Answers, type ProcessAnswer,
} from "@/lib/model";
import { EXAMPLES } from "@/lib/examples";
import GUIDE from "../AI-GUIDE.md?raw";
import { Md } from "./Md";

const KEY = "automate-what-first:v2";
const DEMO_KEY = "automate-what-first:demo";
const load = (): Answers => { try { return normalize(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { return EMPTY; } };
type Demo = { name: string; edited: boolean } | null;
const loadDemo = (): Demo => { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || "null"); } catch { return null; } };

/** Company fields in the order answersMarkdown writes them. Display only: a pre-filled default
 *  (15 employees, €45, Germany ...) counts as an answer once the owner touches it or an example sets it. */
type CKey = keyof Answers["company"];
const COMPANY_LINES: CKey[] = ["industry", "employees", "country", "hourlyCost", "worksCouncil", "systems", "aiTools", "builder", "budget", "appetite", "goals", "pain"];
const TOUCH_KEY = "automate-what-first:touched";
const ALL_TOUCHED = COMPANY_LINES as string[];
const loadTouched = (a: Answers): string[] => {
  try { const t = JSON.parse(localStorage.getItem(TOUCH_KEY) || "null"); if (Array.isArray(t)) return t; } catch { /* ignore */ }
  return a.company.industry ? ALL_TOUCHED : []; // answers saved before this existed
};

const STEPS = [
  { tab: "Company", title: "About your company", time: "3 min" },
  { tab: "Readiness", title: "How ready you are for AI", time: "3 min" },
  { tab: "Processes", title: "Where the time goes", time: "8 min" },
  { tab: "Your AI file", title: "Your AI file is ready", time: "" },
] as const;
type Set = (f: (a: Answers) => Answers) => void;

/** Real answers an AI gave to an example file, saved unedited: examples/ai-output/*.output.md (none = section hidden). */
const AI_OUTPUTS = Object.values(import.meta.glob("../examples/ai-output/*.output.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>);

/** Display only: keep "e-mail" or "follow-up" on one line. The text in the file is unchanged. */
const nb = (s: string) => s.replace(/(\w)-(\w)/g, "$1\u2011$2");
const fmt = (n: number) => n.toLocaleString("en-GB");
const REP_L = ["", "always different", "similar", "the same"];
const DIG_L = ["on paper", "partly digital", "digital"];
const ERR_L = ["", "little", "some", "a lot"];
const isOpen = (l: string) => /not stated|not answered|: $/.test(l);

/** One choice control: plain radio button or checkbox with its label. */
function Opt({ type, name, on, onChange, children, quiet }: { type: "radio" | "checkbox"; name: string; on: boolean; onChange: () => void; children: React.ReactNode; quiet?: boolean }) {
  return (
    <label className={"choice" + (quiet ? " choice--quiet" : "")}>
      <input type={type} name={name} checked={on} onChange={onChange} />
      <span>{typeof children === "string" ? nb(children) : children}</span>
    </label>
  );
}

function Radios<T extends string | number>({ value, options, onChange, label, list }: { value: T | undefined; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string; list?: boolean }) {
  const name = React.useId();
  return (
    <div className={"choices " + (list ? "choices--list" : "choices--inline")} role="radiogroup" aria-label={label}>
      {options.map(o => <Opt key={String(o.v)} type="radio" name={name} on={value === o.v} onChange={() => onChange(o.v)}>{o.l}</Opt>)}
    </div>
  );
}

/** Short single choice as one row of adjoining buttons. */
function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T | undefined; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(o => (
        <button key={String(o.v)} type="button" role="radio" aria-checked={value === o.v} className="seg__b" onClick={() => onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  );
}

function Chips({ options, value, onChange, multi = true, label }: { options: readonly string[]; value: string[]; onChange: (v: string[]) => void; multi?: boolean; label: string }) {
  const name = React.useId();
  return (
    <div className="choices choices--grid" role={multi ? "group" : "radiogroup"} aria-label={label}>
      {options.map(o => {
        const on = value.includes(o);
        return <Opt key={o} type={multi ? "checkbox" : "radio"} name={name} on={on}
          onChange={() => onChange(multi ? (on ? value.filter(x => x !== o) : [...value, o]) : [o])}>{o}</Opt>;
      })}
    </div>
  );
}

/** Number field. With `unknownZero`, 0 means "not known": the field shows empty with a placeholder (display only). */
function Num({ id, label, value, onChange, suffix, min = 0, unknownZero }: { id: string; label: string; value: number; onChange: (v: number) => void; suffix?: string; min?: number; unknownZero?: boolean }) {
  const shown = unknownZero && value === 0 ? "" : Number.isFinite(value) ? value : "";
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="num-row">
        <input id={id} type="number" inputMode="numeric" min={min} className="input input--num" value={shown}
          placeholder={unknownZero ? "not known" : undefined} onChange={e => onChange(Math.max(min, Number(e.target.value)))} />
        {suffix && <span className="small muted">{suffix}</span>}
      </div>
    </div>
  );
}

const Area = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} className="area" />;

function Group({ title, children, wide = true, id, note }: { title: React.ReactNode; children: React.ReactNode; wide?: boolean; id?: string; note?: React.ReactNode }) {
  return <div id={id} className={"field" + (wide ? " span-2" : "")}><span className="flabel">{title}</span>{children}{note}</div>;
}

const Nudge = ({ children }: { children: React.ReactNode }) => <p className="nudge" role="alert">{children}</p>;

function CompanyStep({ a, set, nudge, touch }: { a: Answers; set: Set; nudge: boolean; touch: (keys: string[]) => void }) {
  const c = a.company, up = (p: Partial<Answers["company"]>) => { touch(Object.keys(p)); set(x => ({ ...x, company: { ...x.company, ...p } })); };
  return (
    <div className="form-grid">
      <div className="field span-2">
        <label htmlFor="name">Company name</label>
        <input id="name" className="input" style={{ maxWidth: 520 }} value={c.name} placeholder="Optional. Leave it empty to keep it private." onChange={e => up({ name: e.target.value })} />
      </div>
      <Group id="industry" title={<>Industry <span className="muted req">(required)</span></>}
        note={nudge && !c.industry && <Nudge>Pick an industry to continue. It decides which processes are shown first.</Nudge>}>
        <Chips label="Industry" multi={false} options={INDUSTRIES} value={[c.industry]} onChange={v => up({ industry: v[0] })} />
      </Group>
      <Num id="emp" label="Employees" value={c.employees} onChange={v => up({ employees: v })} min={1} />
      <Num id="rate" label="Average hourly cost of staff" value={c.hourlyCost} onChange={v => up({ hourlyCost: v })} suffix="€ incl. employer costs" min={1} />
      <Group title="Country"><Radios label="Country" value={c.country} options={COUNTRIES.map(v => ({ v, l: v }))} onChange={v => up({ country: v })} /></Group>
      <Group title="Works council (Betriebsrat)"><Segmented label="Works council" value={c.worksCouncil ? 1 : 0} options={[{ v: 0, l: "No" }, { v: 1, l: "Yes" }]} onChange={v => up({ worksCouncil: v === 1 })} /></Group>
      <Group title="Software you use"><Chips label="Software you use" options={SYSTEMS} value={c.systems} onChange={v => up({ systems: v })} /></Group>
      <Group title="AI tools already in use"><Chips label="AI tools already in use" options={AI_TOOLS} value={c.aiTools} onChange={v => up({ aiTools: v })} /></Group>
      <Group title="Who can set up or build tools?" wide={false}><Radios list label="Who can set up or build tools" value={c.builder} options={BUILDERS.map((l, v) => ({ v, l }))} onChange={v => up({ builder: v })} /></Group>
      <Group title="How fast do you want to go?" wide={false}><Radios list label="How fast do you want to go" value={c.appetite} options={APPETITE} onChange={v => up({ appetite: v })} /></Group>
      <Num id="budget" label="Budget for AI tools" value={c.budget} onChange={v => up({ budget: v })} suffix="€ per month, roughly" />
      <Group title="What do you want from AI?"><Chips label="What do you want from AI" options={GOALS} value={c.goals} onChange={v => up({ goals: v })} /></Group>
      <div className="field span-2">
        <label htmlFor="pain">What annoys you most in your daily work?</label>
        <Area id="pain" value={c.pain} placeholder="In your own words, e.g. “We type every supplier invoice by hand and still miss due dates.”" onChange={e => up({ pain: e.target.value })} />
      </div>
    </div>
  );
}

function ReadinessStep({ a, set, nudge }: { a: Answers; set: Set; nudge: boolean }) {
  const firstOpen = READINESS.find(q => a.readiness[q.id] === undefined)?.id;
  const r = readiness(a);
  const done = Object.keys(a.readiness).length === READINESS.length;
  const answer = (i: number, v: number) => {
    const fresh = a.readiness[READINESS[i].id] === undefined;
    set(x => ({ ...x, readiness: { ...x.readiness, [READINESS[i].id]: v } }));
    // Bring the next open question into view, gently, only when it is far down.
    const next = READINESS.slice(i + 1).find(q => a.readiness[q.id] === undefined);
    if (fresh && next) requestAnimationFrame(() => {
      const el = document.getElementById(`rq-${next.id}`)?.closest(".q") as HTMLElement | null;
      if (el && el.getBoundingClientRect().top > innerHeight * .72) {
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        scrollTo({ top: scrollY + el.getBoundingClientRect().top - innerHeight * .3, behavior: reduce ? "auto" : "smooth" });
      }
    });
  };
  return (
    <>
      <div className="rows">
        {READINESS.map((q, i) => (
          <div key={q.id} className={"q" + (nudge && q.id === firstOpen ? " q--nudge" : "")}>
            <div>
              <div className="label">{q.dim} · {i + 1} of {READINESS.length}</div>
              <div className="h3" id={`rq-${q.id}`} style={{ marginTop: 4 }}>{q.q}</div>
              {nudge && q.id === firstOpen && <Nudge>Answer this one to continue.</Nudge>}
            </div>
            <div className="choices choices--list" role="radiogroup" aria-labelledby={`rq-${q.id}`}>
              {q.a.map((t, v) => <Opt key={v} type="radio" name={`r-${q.id}`} on={a.readiness[q.id] === v} onChange={() => answer(i, v)}>{t}</Opt>)}
            </div>
          </div>
        ))}
      </div>
      <div className={"dims" + (done ? "" : " dims--wait")} aria-live="polite">
        <div className="dims__head">
          <span className="flabel">Your readiness per area</span>
          <span className="small muted">{done ? "Simple average of your answers. It is also in your file." : `Shows when all ${READINESS.length} questions are answered.`}</span>
        </div>
        <div className="dims__grid">
          {r.dims.map(d => (
            <div key={d.dim} className="dim">
              <div className="dim__top"><span>{d.dim}</span><span className="dim__n">{done ? d.score : "–"}</span></div>
              <div className="bar"><span style={{ width: done ? `${d.score}%` : 0 }} /></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ProcessDetail({ pa, onChange, onRemove, onDone }: { pa: ProcessAnswer; onChange: (p: Partial<ProcessAnswer>) => void; onRemove: () => void; onDone: () => void }) {
  const p = libFor(pa);
  return (
    <div className="pcard pcard--open">
      <div className="pcard__head">
        <div>
          <div className="h3">{nb(nameOf(pa))}</div>
          <div className="small muted" style={{ marginTop: 2 }}>{p ? `${p.area} · often done with: ${p.tool}` : "Your own process"}</div>
        </div>
        <button type="button" className="link small" onClick={onRemove} aria-label={`Remove ${nameOf(pa)}`}>Remove</button>
      </div>
      <div className="pnums">
        <Num id={`h-${pa.id}`} label="Hours per week, whole team" value={pa.hoursWeek} onChange={v => onChange({ hoursWeek: v })} suffix="h" />
        <Num id={`v-${pa.id}`} label="Cases per month" value={pa.volume} onChange={v => onChange({ volume: v })} unknownZero />
        <Num id={`p-${pa.id}`} label="People who would use a tool" value={pa.people} onChange={v => onChange({ people: v })} min={1} />
      </div>
      <div className="psegs">
        <Group title="Steps are" wide={false}><Segmented label="Steps are" value={pa.repetitive} onChange={v => onChange({ repetitive: v })} options={[{ v: 1, l: "always different" }, { v: 2, l: "similar" }, { v: 3, l: "the same" }]} /></Group>
        <Group title="The work is" wide={false}><Segmented label="The work is" value={pa.digital} onChange={v => onChange({ digital: v })} options={[{ v: 0, l: "on paper" }, { v: 1, l: "partly digital" }, { v: 2, l: "digital" }]} /></Group>
        <Group title="A mistake costs" wide={false}><Segmented label="A mistake costs" value={pa.errorImpact} onChange={v => onChange({ errorImpact: v })} options={[{ v: 1, l: "little" }, { v: 2, l: "some" }, { v: 3, l: "a lot" }]} /></Group>
      </div>
      <div className="field">
        <label htmlFor={`t-${pa.id}`}>How is it done today?</label>
        <Area id={`t-${pa.id}`} value={pa.today} rows={3} placeholder="Who does it, which tools, what goes wrong. E.g. “Two people type PDFs into DATEV, approval by e‑mail, about 5 errors a month.”" onChange={e => onChange({ today: e.target.value })} />
      </div>
      <div className="pcard__foot">
        <div className="choices choices--list">
          <Opt type="checkbox" name={`ap-${pa.id}`} on={pa.aboutPeople} onChange={() => onChange({ aboutPeople: !pa.aboutPeople })}>AI would help decide about people (applicants, staff, customers)</Opt>
          <Opt type="checkbox" name={`ht-${pa.id}`} on={pa.haveTool} onChange={() => onChange({ haveTool: !pa.haveTool })}>We already pay for a suitable tool</Opt>
        </div>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onDone}><Check aria-hidden />Done</button>
      </div>
    </div>
  );
}

function ProcessRow({ pa, onOpen }: { pa: ProcessAnswer; onOpen: () => void }) {
  const bits = [
    `${pa.hoursWeek} h/week`,
    pa.volume ? `${fmt(pa.volume)} cases/month` : "cases not known",
    `steps ${REP_L[pa.repetitive]}`, DIG_L[pa.digital], `mistakes cost ${ERR_L[pa.errorImpact]}`,
    ...(pa.aboutPeople ? ["decides about people"] : []),
  ];
  return (
    <button type="button" className="pcard pcard--row" onClick={onOpen} aria-label={`Edit ${nameOf(pa)}`}>
      <span className="pcard__name">{nb(nameOf(pa))}</span>
      <span className="pcard__facts">{bits.join(" · ")}</span>
      <span className="pcard__edit">Edit</span>
    </button>
  );
}

function ProcessesStep({ a, set, nudge }: { a: Answers; set: Set; nudge: boolean }) {
  const [own, setOwn] = React.useState("");
  const [more, setMore] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);
  // Arriving with processes already picked (an example, saved answers): show them first, the picker below.
  const listFirst = React.useRef(a.processes.length > 0).current;
  const chosen = new Set(a.processes.map(p => p.id));
  const fits = (p: typeof PROCESSES[number]) => p.industries === "all" || p.industries.includes(a.company.industry);
  const typical = PROCESSES.filter(fits), other = PROCESSES.filter(p => !fits(p));
  const otherShown = more ? other : other.filter(p => chosen.has(p.id));
  const toggle = (id: string) => {
    if (chosen.has(id)) set(x => ({ ...x, processes: x.processes.filter(p => p.id !== id) }));
    else { set(x => ({ ...x, processes: [...x.processes, defaultsFor(PROCESSES.find(p => p.id === id)!, x.company.employees)] })); setOpenId(id); }
  };
  const update = (id: string, patch: Partial<ProcessAnswer>) => set(x => ({ ...x, processes: x.processes.map(p => p.id === id ? { ...p, ...patch } : p) }));
  const addOwn = () => {
    const n = own.trim(); if (!n) return;
    const cp = customProcess(n, a.company.employees);
    set(x => ({ ...x, processes: [...x.processes, cp] })); setOpenId(cp.id); setOwn("");
  };
  const hours = a.processes.reduce((s, p) => s + p.hoursWeek, 0);
  const pick = (p: typeof PROCESSES[number], quiet?: boolean) => <Opt key={p.id} type="checkbox" name={`proc-${p.id}`} on={chosen.has(p.id)} onChange={() => toggle(p.id)} quiet={quiet}>{p.name}</Opt>;
  return (
    <div className={"stack-32 procs" + (listFirst ? " procs--list-first" : "")}>
      <div id="picker" className="stack-16">
        <p className="muted measure" style={{ margin: 0 }}>{listFirst ? "Add or remove processes." : "Pick the processes that take your team the most time."}</p>
        {nudge && !a.processes.length && <Nudge>Pick or add at least one process to continue.</Nudge>}
        <div>
          <div className="flabel">Typical for {a.company.industry ? a.company.industry.toLowerCase() : "most businesses"}</div>
          <div className="choices choices--grid" role="group" aria-label="Typical processes">{typical.map(p => pick(p))}</div>
        </div>
        <div>
          <div className="flabel muted">Other processes</div>
          {otherShown.length > 0 && <div className="choices choices--grid" role="group" aria-label="Other processes">{otherShown.map(p => pick(p, true))}</div>}
          {!more && other.length > otherShown.length && <button type="button" className="link small" onClick={() => setMore(true)}><Plus aria-hidden />Show {other.length - otherShown.length} more</button>}
        </div>
        <form className="own" onSubmit={e => { e.preventDefault(); addOwn(); }}>
          <input id="own" className="input" value={own} onChange={e => setOwn(e.target.value)} placeholder="Something else? e.g. “Checking delivery notes against orders”" aria-label="Add your own process" />
          <button type="submit" className="btn btn--secondary" disabled={!own.trim()}><Plus aria-hidden />Add</button>
        </form>
      </div>
      {a.processes.length > 0 && <div className="stack-12">
        <div className="sum-line">
          <span><b>{a.processes.length}</b> selected · <b>{fmt(hours)} h</b> per week, about <b>€{fmt(hours * a.company.hourlyCost)}</b> per week at your €{a.company.hourlyCost}/h.</span>
          <span className="muted">Your own input, not a saving estimate. Rough numbers are fine.</span>
        </div>
        {a.processes.map(pa => openId === pa.id
          ? <ProcessDetail key={pa.id} pa={pa} onChange={p => update(pa.id, p)} onDone={() => setOpenId(null)}
              onRemove={() => { set(x => ({ ...x, processes: x.processes.filter(q => q.id !== pa.id) })); setOpenId(null); }} />
          : <ProcessRow key={pa.id} pa={pa} onOpen={() => setOpenId(pa.id)} />)}
      </div>}
    </div>
  );
}

/** The answers part of the file, shown live while the owner answers. */
function FileRail({ a, touched, step, fileName, onJump, onClose }: { a: Answers; touched: string[]; step: number; fileName: string; onJump: (s: number) => void; onClose?: () => void }) {
  const md = React.useMemo(() => answersMarkdown(a), [a]);
  const words = React.useMemo(() => bundle(a).split(/\s+/).filter(Boolean).length, [a]);
  const parts = React.useMemo(() => {
    const L = md.split("\n");
    const at = (h: string) => L.findIndex(l => l.startsWith(h));
    const c = at("## Company"), r = at("## Readiness"), p = at("## Processes");
    return [L.slice(c + 1, r), L.slice(r + 1, p), L.slice(p + 1)].map(s => s.filter(l => l.trim()));
  }, [md]);
  // A company line is "default" while its field still holds the pre-filled value nobody chose.
  const isDefault = (i: number, l: string) => {
    if (i !== 0) return false;
    const k = COMPANY_LINES[parts[0].filter(x => x.startsWith("- ")).indexOf(l)];
    return !!k && !isOpen(l) && !touched.includes(k);
  };
  const answeredIn = (i: number) => parts[i].filter(l => l.startsWith("- ") && !isOpen(l) && !isDefault(i, l)).length;
  const factsIn = (i: number) => parts[i].filter(l => l.startsWith("- ")).length;
  const total = [0, 1, 2].reduce((s, i) => s + factsIn(i), 0);
  const answered = [0, 1, 2].reduce((s, i) => s + answeredIn(i), 0);
  const open = total - answered;
  const names = ["Company", "Readiness", "Processes"];
  const cur = Math.min(step, 2);
  return (
    <div className="rail__in">
      <div className="rail__head">
        <div className="rail__title"><FileText aria-hidden />Your file</div>
        {onClose && <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X aria-hidden /></button>}
      </div>
      <div className="rail__file">{fileName}</div>
      <div className="rail__count"><b>{answered}</b> answer{answered === 1 ? "" : "s"}{open > 0 && <> · <b>{open}</b> open</>} · {fmt(words)} words with the guide</div>
      <p className="rail__note">This is the text your AI will read. It updates as you answer and stays in your browser.</p>
      {parts.map((lines, i) => (
        <section key={i} className={"rsec" + (i === cur ? " rsec--on" : "")}>
          <button type="button" className="rsec__h" onClick={() => onJump(i)} disabled={i > 0 && !a.company.industry}>
            <span>{names[i]}</span><span className="rsec__n">{i === 2 ? `${a.processes.length} picked` : `${answeredIn(i)} of ${factsIn(i)}`}</span>
          </button>
          {i === cur && <div className="rsec__body">
            {i === 2 && !a.processes.length ? <div className="rl rl--empty">Nothing picked yet.</div> : lines.map((l, j) => <RailLine key={j + l} l={l} preset={isDefault(i, l)} />)}
          </div>}
        </section>
      ))}
    </div>
  );
}

function RailLine({ l, preset }: { l: string; preset?: boolean }) {
  const clean = l.replace(/\*\*/g, "");
  if (clean.startsWith("### ")) return <div className="rl rl--h">{nb(clean.slice(4))}</div>;
  if (!clean.startsWith("- ")) return <div className="rl rl--p">{clean}</div>;
  const s = clean.slice(2), arrow = s.indexOf(" → "), colon = s.indexOf(": ");
  const [k, v] = arrow > 0 ? [s.slice(colon + 2, arrow), s.slice(arrow + 3)] : colon > 0 ? [s.slice(0, colon), s.slice(colon + 2)] : ["", s];
  const empty = !v.trim() || /^not (stated|answered)/.test(v);
  return <div className={"rl" + (empty || preset ? " rl--open" : "") + (k.startsWith("Reference values") ? " rl--ref" : "")}><span className="rl__k">{k}</span><span className="rl__v">{preset ? `default: ${v.trim()}` : v.trim() || "–"}</span></div>;
}

const AIS = [["ChatGPT", "https://chatgpt.com/"], ["Claude", "https://claude.ai/"], ["Microsoft Copilot", "https://copilot.microsoft.com/"], ["Gemini", "https://gemini.google.com/"]] as const;

function ExportStep({ a, fileName, onDownload, onCopyFile, onEdit }: { a: Answers; fileName: string; onDownload: () => void; onCopyFile: () => void; onEdit: (s: number) => void }) {
  const text = React.useMemo(() => bundle(a), [a]);
  const answers = React.useMemo(() => answersMarkdown(a), [a]);
  const kb = Math.max(1, Math.round(new Blob([text]).size / 1024));
  const words = text.split(/\s+/).filter(Boolean).length;
  const [tab, setTab] = React.useState<"answers" | "guide">("answers");
  const [plain, setPlain] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const hours = a.processes.reduce((s, p) => s + p.hoursWeek, 0);
  const copyPrompt = async () => { try { await navigator.clipboard.writeText(START_PROMPT); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* blocked */ } };
  const sum: [string, string, number][] = [
    ["Company", [a.company.name || "No name given", a.company.industry, `${a.company.employees} people`, `works council: ${a.company.worksCouncil ? "yes" : "no"}`].filter(Boolean).join(" · "), 0],
    ["Readiness", `${Object.keys(a.readiness).length} of ${READINESS.length} answered · overall ${readiness(a).overall}/100`, 1],
    ["Processes", `${a.processes.length} picked · ${fmt(hours)} h per week`, 2],
  ];
  return (
    <div className="export">
      <div className="export__intro">
        <h1 className="h1">Your AI file is ready</h1>
        <p className="lead">One file with your answers and a consultant's guide. Upload it to your own AI and it writes your report: what to automate first, which kind of tool, hours and euros as ranges, risks, and a 90-day plan.</p>
      </div>

      <dl className="summary">
        {sum.map(([k, v, s]) => (
          <div key={k} className="summary__row"><dt>{k}</dt><dd>{v}</dd><dd className="summary__edit"><button type="button" className="link small" onClick={() => onEdit(s)}>Edit</button></dd></div>
        ))}
      </dl>

      <div className="export__grid">
        <ol className="vsteps">
          <li>
            <span className="vsteps__n">1</span>
            <div className="vsteps__body">
              <h2 className="h3">Download the file</h2>
              <button className="btn btn--primary btn--lg" onClick={onDownload}><Download aria-hidden /><span className="btn__file">{fileName}</span></button>
              <p className="small muted">{kb} KB, plain text. Nothing has been sent anywhere.</p>
            </div>
          </li>
          <li>
            <span className="vsteps__n">2</span>
            <div className="vsteps__body">
              <h2 className="h3">Open your AI</h2>
              <p className="ai-links">{AIS.map(([n, u], i) => <React.Fragment key={n}>{i > 0 && <span className="muted" aria-hidden> · </span>}<a className="link link--inline" href={u} target="_blank" rel="noopener noreferrer">{n}</a></React.Fragment>)}</p>
              <p className="small muted">Use a business account if you have one. Open the file first if you want to remove names.</p>
            </div>
          </li>
          <li>
            <span className="vsteps__n">3</span>
            <div className="vsteps__body">
              <h2 className="h3">Upload the file and send this message</h2>
              <div className="msg">
                <button type="button" className="msg__copy" onClick={copyPrompt} aria-live="polite">{copied ? <><Check aria-hidden />Copied</> : <><Copy aria-hidden />Copy</>}</button>
                <p>{START_PROMPT}</p>
              </div>
              <p className="small muted">No upload possible? <button type="button" onClick={onCopyFile} className="link link--inline">Copy the whole file</button> and paste it into the chat instead. Write your message in German and the report comes back in German.</p>
            </div>
          </li>
        </ol>

        <aside className="guide-box">
          <div className="flabel">What the guide asks of your AI</div>
          <ul>
            <li><b>Simplest tool first.</b> A rule, a template or a feature you already pay for comes before any AI agent.</li>
            <li><b>A person signs off</b> anything that moves money, books into the accounts, sends a binding offer or affects a person.</li>
            <li><b>Check the rules:</b> GDPR, EU AI Act, GoBD and the works council.</li>
            <li><b>Ranges, not promises:</b> hours and euros as low to high estimates, and a measured baseline before the pilot.</li>
          </ul>
        </aside>
      </div>

      <section className="preview" aria-label="What is in the file">
        <div className="preview__head">
          <div>
            <h2 className="h2">Check the file before you upload it</h2>
            <p className="small muted" style={{ margin: "6px 0 0" }}>{fmt(words)} words, about {Math.max(1, Math.round(words / 450))} pages. In the file, the guide comes first and your answers follow.</p>
          </div>
          <div className="tabs" role="tablist" aria-label="Parts of the file">
            <button type="button" role="tab" aria-selected={tab === "answers"} onClick={() => setTab("answers")}>Your answers</button>
            <button type="button" role="tab" aria-selected={tab === "guide"} onClick={() => setTab("guide")}>Guide for the AI</button>
          </div>
        </div>
        <div className="preview__body" role="tabpanel">
          {plain ? <pre className="pre">{tab === "answers" ? answers : GUIDE.trim()}</pre> : <Md text={tab === "answers" ? answers : GUIDE} rows={tab === "answers"} />}
        </div>
        <div className="preview__foot"><label className="choice choice--sm"><input type="checkbox" checked={plain} onChange={() => setPlain(!plain)} /><span>Show as plain text</span></label></div>
      </section>

      {AI_OUTPUTS.map((raw, i) => <AiOutput key={i} raw={raw} />)}
    </div>
  );
}

/** A real, unedited AI answer to an example file. Front matter: model, date, example. */
function AiOutput({ raw }: { raw: string }) {
  const [full, setFull] = React.useState(false);
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta: Record<string, string> = Object.fromEntries((m?.[1] || "").split("\n").filter(l => l.includes(":")).map(l => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()]));
  const body = (m?.[2] || raw).trim();
  return (
    <section className="preview">
      <div className="preview__head">
        <div>
          <h2 className="h2">What an AI wrote back</h2>
          <p className="small muted" style={{ margin: "6px 0 0" }}>Real answer from {meta.model || "an AI chat"}{meta.date ? `, ${meta.date}` : ""}, for the example file “{meta.example || "example company"}”. Fictional company. Not edited.</p>
        </div>
      </div>
      <div className={"preview__body" + (full ? "" : " preview__body--cut")}><Md text={body} /></div>
      <div className="preview__foot"><button type="button" className="link small" onClick={() => setFull(!full)}>{full ? "Show less" : "Read the full answer"}</button></div>
    </section>
  );
}

const inPortfolio = typeof location !== "undefined" && /automatewhatfirst\.html$/.test(location.pathname);

function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot__in">
        <span>Built by Sam Zeidi, Information Systems student at the University of Cologne.</span>
        <span className="foot__links">
          <a className="link link--inline" href="mailto:contact.samzeidi@gmail.com">contact.samzeidi@gmail.com</a>
          {inPortfolio
            ? <a className="link link--inline" href="index.html#awf">Portfolio</a>
            : <a className="link link--inline" href="https://linkedin.com/in/sam-zeidi" target="_blank" rel="noopener noreferrer">LinkedIn</a>}
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  const [a, setA] = React.useState<Answers>(load);
  const [demo, setDemo] = React.useState<Demo>(loadDemo);
  const [touched, setTouched] = React.useState<string[]>(() => loadTouched(a));
  const touch = (keys: string[]) => setTouched(t => keys.every(k => t.includes(k)) ? t : [...t, ...keys.filter(k => !t.includes(k))]);
  React.useEffect(() => { try { localStorage.setItem(TOUCH_KEY, JSON.stringify(touched)); } catch { /* private mode */ } }, [touched]);
  const [undo, setUndo] = React.useState<{ a: Answers; demo: Demo; touched: string[]; step: number } | null>(null);
  const [step, setStep] = React.useState(0);
  const [toast, setToast] = React.useState("");
  const [nudge, setNudge] = React.useState(false);
  const [sheet, setSheet] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* private mode */ } }, [a]);
  React.useEffect(() => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(demo)); } catch { /* private mode */ } }, [demo]);
  React.useEffect(() => { window.scrollTo({ top: 0 }); setNudge(false); setSheet(false); }, [step]);
  React.useEffect(() => { document.body.style.overflow = sheet ? "hidden" : ""; }, [sheet]);
  const toastTimer = React.useRef<number>();
  const flash = (t: string, ms = 2400) => { setToast(t); clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => { setToast(""); setUndo(null); }, ms); };

  /** Every edit made by the visitor; a loaded example then reads "started from an example". */
  const edit: Set = f => { setA(f); if (demo && !demo.edited) setDemo({ ...demo, edited: true }); };

  const answered = Object.keys(a.readiness).length;
  const done = [!!a.company.industry, answered === READINESS.length, a.processes.length > 0];
  const hint = [
    a.company.industry ? "Everything else is optional." : "Pick an industry to continue.",
    answered === READINESS.length ? `All ${READINESS.length} answered.` : `${READINESS.length - answered} of ${READINESS.length} questions left.`,
    a.processes.length ? `${a.processes.length} process${a.processes.length > 1 ? "es" : ""} picked.` : "Pick at least one process.",
  ][Math.min(step, 2)];

  const next = () => {
    if (done[step]) { setStep(step + 1); return; }
    setNudge(true);
    requestAnimationFrame(() => {
      const target = step === 0 ? document.getElementById("industry") : step === 1 ? document.querySelector(".q--nudge") : document.getElementById("picker");
      target?.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  };

  const download = (name: string, text: string, type: string) => {
    const u = URL.createObjectURL(new Blob([text], { type })); const l = document.createElement("a");
    l.href = u; l.download = name; l.click(); URL.revokeObjectURL(u);
  };
  const slug = (a.company.name || a.company.industry || "company").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const fileName = `automatewhatfirst-${slug}.md`;
  const copy = async (text: string, ok: string) => {
    try { await navigator.clipboard.writeText(text); flash(ok); } catch { flash("Copying is blocked here. Use Download instead."); }
  };
  const loadFile = async (f: File) => {
    try { const s = JSON.parse(await f.text()); if (!s.company || !s.processes) throw 0; setA(normalize(s)); setTouched(ALL_TOUCHED); setDemo(null); setStep(3); flash("Answers loaded"); }
    catch { flash("That file is not a saved AutomateWhatFirst survey"); }
  };
  const tryExample = (e: typeof EXAMPLES[number]) => { setA(normalize(e.answers)); setTouched(ALL_TOUCHED); setDemo({ name: e.answers.company.name, edited: false }); setStep(2); window.scrollTo({ top: 0 }); };
  /** Empties the form. Nothing is lost for good: the toast offers Undo for 8 seconds. */
  const clear = () => {
    const keep = { a, demo, touched, step };
    setA(EMPTY); setTouched([]); setDemo(null); setStep(0);
    setUndo(keep); flash("All answers cleared.", 8000);
  };
  const restore = () => {
    if (!undo) return;
    setA(undo.a); setTouched(undo.touched); setDemo(undo.demo); setStep(undo.step); setUndo(null);
    flash("Answers restored.");
  };

  return (
    <div className="app" data-demo={demo ? "" : undefined}>
      <header className="top">
        <div className="wrap top__in">
          <div className="brand"><span className="brand__mark" aria-hidden /><span className="brand__name">AutomateWhatFirst</span></div>
          <nav className="steps" aria-label="Survey steps">
            {STEPS.map((s, i) => (
              <button key={s.tab} type="button" onClick={() => setStep(i)} disabled={i > 0 && !a.company.industry} aria-current={step === i ? "step" : undefined}>
                <span className="steps__n">{i < 3 && done[i] && step !== i ? <Check aria-label="done" /> : i + 1}</span>
                <span className="steps__label">{s.tab}</span>
                {s.time && <span className="steps__time">{s.time}</span>}
              </button>
            ))}
          </nav>
          <div className="steps-m">Step {step + 1} of 4</div>
        </div>
        {demo && <div className="demo">
          <div className="wrap demo__in">
            <span className="demo__long">{demo.edited ? "Started from an example: " : "Example: "}<b>{demo.name}</b> (fictional company)</span>
            <span className="demo__short" title={`${demo.name} (fictional company)`}>{demo.edited ? "Edited example (fictional)" : "Example (fictional)"}</span>
            <span className="muted demo__dot" aria-hidden>·</span>
            <button type="button" className="link link--inline" onClick={clear}>{demo.edited ? "Start empty" : <><span className="demo__long">Clear example</span><span className="demo__short">Clear</span></>}</button>
          </div>
        </div>}
      </header>

      {step < 3 ? (
        <main className="wrap layout">
          <div className="col">
            {step === 0 && <div className="hero">
              <h1 className="h1">Find out which office work to automate first</h1>
              <p className="lead">A 15-minute survey for small businesses, in four steps. You get one file. Upload it to your own AI (ChatGPT, Claude, Copilot or Gemini) and it writes your automation plan.</p>
              <p className="small muted hero__privacy">Runs in your browser. Nothing is sent anywhere until you upload the file yourself.</p>
              <div className="examples">
                <span className="small muted examples__label">See it with an example company:</span>
                {EXAMPLES.map(e => <button key={e.label} type="button" className="btn btn--secondary examples__btn" onClick={() => tryExample(e)}>{e.label}</button>)}
                <span className="examples__m small"><span className="muted">Try an example: </span>{EXAMPLES.map((e, i) => <React.Fragment key={e.label}>{i > 0 && <span className="muted"> · </span>}<button type="button" className="link link--inline" onClick={() => tryExample(e)}>{e.label.split(",")[0]}</button></React.Fragment>)}</span>
                <button type="button" className="link small" onClick={() => fileRef.current?.click()}><FileUp aria-hidden />Load saved answers</button>
              </div>
            </div>}
            <div className="stephead">
              <h2 className="h2">{STEPS[step].title}</h2>
            </div>
            {step === 0 && <CompanyStep a={a} set={edit} nudge={nudge} touch={touch} />}
            {step === 1 && <ReadinessStep a={a} set={edit} nudge={nudge} />}
            {step === 2 && <ProcessesStep a={a} set={edit} nudge={nudge} />}
            <div className="actionbar">
              {step > 0 && <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)} aria-label="Back"><ArrowLeft aria-hidden /><span className="hide-s">Back</span></button>}
              <button type="button" className="btn btn--ghost show-s" onClick={() => setSheet(true)}><FileText aria-hidden />File</button>
              <span className="actionbar__hint small muted" role="status">{hint}</span>
              <button type="button" className={"btn btn--primary" + (done[step] ? "" : " btn--wait")} onClick={next}>
                {step === 2 ? "Create my AI file" : <span><span className="hide-s">Continue to </span>{STEPS[step + 1].tab}</span>}<ArrowRight className="m-arrow" aria-hidden />
              </button>
            </div>
          </div>
          <aside className="rail" aria-label="Your file, live"><FileRail a={a} touched={touched} step={step} fileName={fileName} onJump={setStep} /></aside>
        </main>
      ) : (
        <main className="wrap">
          <ExportStep a={a} fileName={fileName} onEdit={setStep}
            onDownload={() => { download(fileName, bundle(a), "text/markdown"); flash("Downloaded. Now upload it to your AI."); }}
            onCopyFile={() => copy(bundle(a), "Copied. Paste it into your AI.")} />
          <div className="foot-actions">
            <button type="button" className="link" onClick={() => setStep(2)}><ArrowLeft aria-hidden />Edit answers</button>
            <button type="button" className="link" onClick={() => download(`automatewhatfirst-${slug}.json`, JSON.stringify(a, null, 1), "application/json")}><Download aria-hidden />Save answers to edit later</button>
            <button type="button" className="link" onClick={clear}><RotateCcw aria-hidden />Start over</button>
          </div>
        </main>
      )}
      <Footer />
      {sheet && <div className="sheet" role="dialog" aria-modal="true" aria-label="Your file">
        <div className="sheet__in"><FileRail a={a} touched={touched} step={step} fileName={fileName} onJump={s => { setStep(s); setSheet(false); }} onClose={() => setSheet(false)} /></div>
      </div>}
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={e => e.target.files?.[0] && loadFile(e.target.files[0])} />
      {toast && <div className="toast" role="status">{toast}{undo && <button type="button" className="toast__undo" onClick={restore}>Undo</button>}</div>}
    </div>
  );
}
