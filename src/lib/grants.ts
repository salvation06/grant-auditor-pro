/* global LanguageModel */

/**
 * Grant data structure
 */
export interface Grant {
  date: string;
  agency: string;
  recipient: string;
  value: number;
  savings: number;
  link: string;
  description: string;
}

const PER_PAGE = 500;

/** Normalize a single grant to a stable schema */
export function serializeGrant(grant: any): Grant {
  return {
    date: grant?.date ?? "",
    agency: grant?.agency ?? "",
    recipient: grant?.recipient ?? "",
    value: Number.isFinite(grant?.value) ? grant.value : 0,
    savings: Number.isFinite(grant?.savings) ? grant.savings : 0,
    link: grant?.link ?? "",
    description: grant?.description ?? ""
  };
}

/** Low-level page fetcher that safely appends/overrides query params */
async function fetchGrantsPage(baseUri: string, { page = 1, perPage = 1 } = {}) {
  const url = new URL(baseUri);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/**
 * Fetch grants; if paginate=true, it pulls all results in 500-record chunks.
 */
export async function fetchGrants(baseUri: string, paginate = false): Promise<Grant[]> {
  if (!paginate) {
    const first = await fetchGrantsPage(baseUri, { page: 1, perPage: 1 });
    return (first?.result?.grants ?? []).map(serializeGrant);
  }

  // First page to learn total_results
  const first = await fetchGrantsPage(baseUri, { page: 1, perPage: PER_PAGE });
  const total = Number(first?.meta?.total_results ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const all = (first?.result?.grants ?? []).map(serializeGrant);
  if (totalPages === 1) return all;

  const tasks = [];
  for (let p = 2; p <= totalPages; p++) {
    tasks.push(fetchGrantsPage(baseUri, { page: p, perPage: PER_PAGE }));
  }
  const rest = await Promise.all(tasks);
  for (const r of rest) {
    if (r?.result?.grants) {
      all.push(...r.result.grants.map(serializeGrant));
    }
  }
  return all;
}

/**
 * Model session management
 */
let _session: any = null;

/** Create or reuse a LanguageModel session */
async function getSession(params: any) {
  if (_session) return _session;
  // @ts-ignore - LanguageModel is a browser API
  _session = await window.LanguageModel.create(params);
  return _session;
}

/** Reset session if needed (e.g., on recoverable errors) */
export async function resetModelSession() {
  if (_session) await _session.destroy();
  _session = null;
}

/**
 * Build a detailed GAP-analysis prompt for a single grant.
 */
export function buildAssessmentPrompt(grant: Grant, extraContext = "") {
  const { date, agency, recipient, value, savings, link, description } = grant;

  return `
You are a policy & economics analyst. Analyze the **impact if this grant were canceled**.

Grant (normalized schema):
- Date: ${date}
- Agency: ${agency}
- Recipient: ${recipient}
- Amount_Value_USD: ${value}
- Stated_Savings_USD: ${savings}
- Link: ${link || "N/A"}
- Description: ${description?.slice(0, 5000) ?? ""}

Additional context (external facts, if any):
${extraContext || "N/A"}

TASK:
1) Identify direct & indirect stakeholders (businesses, US citizens, local/state/federal entities, and global actors).
2) Quantify/qualify **short-term** impacts (0–12 months) and **long-term** impacts (1–10 years) across:
   - Jobs/employment (creation, retention, displacement)
   - Inflation/price effects, energy costs, and consumer surplus
   - Supply chains, technology readiness, emissions/ESG targets
   - Regional impacts (county/state/tribal lands if relevant)
   - National security/strategic competitiveness (if relevant)
   - Public health/safety and environmental externalities
3) Dependencies and spillovers (other programs, matched funding, private co-investment, tax incentives, CCUS/CO2 transport & storage, permitting timelines).
4) **Risk register** (what could go wrong if canceled vs. kept) and expected likelihood/severity.
5) **Mitigations/alternatives** if canceled (funding substitutes, phasedown, private financing, policy instruments).
6) **KPIs** to monitor (leading/lagging indicators) and suggested data sources.
7) **Pork check**: If evidence suggests the grant is wasteful/non-strategic pork, explain why and propose a better allocation.
8) Provide a concise **GAP Analysis Summary** table with: Current State → Gap if Canceled → Impact Level (Low/Med/High) → Mitigation.

CITATIONS:
- Where you assert factual claims (market sizes, jobs multipliers, emissions, grid capacity, etc.), cite credible public sources by name (e.g., EIA, EPA, BEA, BLS, DOE NETL/FEED docs, CRS, IMF, BIS, peer-reviewed studies). If you cannot access the web, be explicit about assumptions.

OUTPUT FORMAT:
Return clean markdown with clear section headings and a final one-paragraph **Bottom Line**. Avoid UI elements; no HTML widgets. Do not include code blocks unless necessary for a table.
`;
}

/**
 * Assess the impact of canceling ONE grant by sending a crafted prompt to the browser's AI.
 */
export async function assessGrantImpact(grant: Grant, options: {
  contextProvider?: (grant: Grant) => Promise<string>;
  temperature?: number;
  topK?: number;
} = {}): Promise<string> {
  const {
    contextProvider = null,
    temperature = 0.2,
    topK = 3
  } = options;

  let extraContext = "";
  if (typeof contextProvider === "function") {
    try {
      extraContext = await contextProvider(grant);
    } catch (e) {
      extraContext = "";
      console.warn("contextProvider failed:", e);
    }
  }

  const prompt = buildAssessmentPrompt(grant, extraContext);

  // Create/reuse model session with minimal, non-UI params
  const session = await getSession({
    initialPrompts: [
      { role: "system", content: "You are a policy, energy, and macroeconomics analyst. Be precise, cite reputable sources when asserting facts, and separate assumptions from verified data." }
    ],
    temperature,
    topK
  });

  try {
    const response = await session.prompt(prompt);
    return response;
  } catch (e) {
    await resetModelSession();
    throw e;
  }
}
