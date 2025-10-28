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
  if (_session) {
    console.log("Reusing existing session");
    return _session;
  }
  
  console.log("Creating new AI session...");
  
  // Check if LanguageModel API is available BEFORE trying to use it
  // @ts-ignore - LanguageModel is a browser API
  if (!('LanguageModel' in self)) {
    throw new Error("Browser AI (LanguageModel API) is not available. Please use Chrome Canary with AI features enabled.");
  }
  
  // @ts-ignore - LanguageModel is a browser API
  _session = await LanguageModel.create(params);
  console.log("AI session created successfully");
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
As a policy analyst, evaluate the consequences of canceling this grant.

**Grant Data:**
- Recipient: ${recipient}
- Amount: ${value} USD
- Purpose: ${description?.slice(0, 1000) ?? ""}
- Context: ${extraContext || "N/A"}

---

### 1. Core Impact Analysis
**Short-Term (0-12 mos):** Briefly state the immediate economic (e.g., jobs) and social (e.g., public service) effects.
**Long-Term (1-10 yrs):** Briefly state the potential strategic (e.g., supply chain, innovation) and public outcomes.

---

### 2. Key Risks & Mitigations
**Primary Risk:** [Describe the most significant risk]

**Secondary Risk:** [Describe the next most significant risk]

**Mitigation:** [Suggest a direct alternative or solution]

---

### 3. Bottom Line
A final summary of the overall impact of cancellation with pros and cons listed.`;
}

/**
 * Assess the impact of canceling ONE grant by sending a crafted prompt to the browser's AI.
 */
export async function assessGrantImpact(grant: Grant, options: {
  contextProvider?: (grant: Grant) => Promise<string>;
  temperature?: number;
  topK?: number;
} = {}): Promise<string> {
  console.log("=== assessGrantImpact called ===");
  console.log("Grant:", grant.recipient);
  
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

  console.log("Building assessment prompt...");
  const prompt = buildAssessmentPrompt(grant, extraContext);

  try {
    console.log("Getting AI session...");
    // Create/reuse model session with minimal, non-UI params
    const session = await getSession({
      initialPrompts: [
        { role: "system", content: "You are a policy, energy, and macroeconomics analyst. Be precise, cite reputable sources when asserting facts, and separate assumptions from verified data." }
      ],
      temperature,
      topK
    });

    console.log("Calling prompt...");
    const response = await session.prompt(prompt);
    console.log("Prompt completed successfully");
    return response;
  } catch (e) {
    console.error("Error in assessGrantImpact:", e);
    await resetModelSession();
    throw e;
  }
}
