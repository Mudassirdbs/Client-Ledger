// Google Gemini AI Service for Client Ledger
// Handles financial risk analysis, payment summaries, invoice parsing, and ledger copilot

export const GEMINI_MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Recommended)", description: "High speed, accurate reasoning for ledger insights" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Next-Gen)", description: "Next-gen ultra fast performance" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Deep Reasoning)", description: "Advanced reasoning for complex financial documents" },
] as const;

export type GeminiModelId = typeof GEMINI_MODELS[number]["id"];

const STORAGE_KEY_API = "gemini_api_key";
const STORAGE_KEY_MODEL = "gemini_model_id";

export function getGeminiApiKey(): string {
  const stored = localStorage.getItem(STORAGE_KEY_API);
  if (stored && stored.trim()) return stored.trim();
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim()) return envKey.trim();
  return "";
}

export function saveGeminiApiKey(key: string): void {
  if (!key || !key.trim()) {
    localStorage.removeItem(STORAGE_KEY_API);
  } else {
    localStorage.setItem(STORAGE_KEY_API, key.trim());
  }
}

export function getGeminiModel(): GeminiModelId {
  const stored = localStorage.getItem(STORAGE_KEY_MODEL) as GeminiModelId;
  if (stored && GEMINI_MODELS.some((m) => m.id === stored)) return stored;
  return "gemini-1.5-flash";
}

export function saveGeminiModel(model: GeminiModelId): void {
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callGeminiApi(
  messages: ChatMessage[],
  options?: { response_format?: { type: "json_object" }; temperature?: number; model?: string }
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_KEY_MISSING: Gemini API key is not configured. Please check VITE_GEMINI_API_KEY in .env.local.");
  }

  // Model fallback chain to prevent 429 rate limit errors on Gemini free tier
  const primaryModel = options?.model || getGeminiModel() || "gemini-1.5-flash";
  const modelChain = Array.from(new Set([primaryModel, "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash"]));

  let lastErrorMsg = "";

  for (const model of modelChain) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options?.temperature ?? 0.3,
            ...(options?.response_format ? { response_format: options.response_format } : {}),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content;
        }

        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || response.statusText || `HTTP ${response.status}`;
        lastErrorMsg = message;

        if (response.status === 401) {
          throw new Error(`INVALID_API_KEY: Invalid Gemini API Key provided. (${message})`);
        }

        // If rate limit (429), wait 2 seconds before retrying or trying next model
        if (response.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          break; // Don't retry non-429 errors for this model
        }
      } catch (err: any) {
        lastErrorMsg = err.message || "Network error";
        if (err.message?.includes("INVALID_API_KEY")) throw err;
      }
    }
  }

  throw new Error(`RATE_LIMIT: Gemini API free tier limit reached (429 Too Many Requests). Please wait 30 seconds and try again. Details: ${lastErrorMsg}`);
}

export async function testGeminiKey(apiKey?: string, modelId?: string): Promise<{ success: boolean; message: string }> {
  const key = apiKey ?? getGeminiApiKey();
  if (!key) {
    return { success: false, message: "No Gemini API Key provided." };
  }
  const model = modelId || getGeminiModel();
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Ping test" }],
        max_tokens: 5,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err?.error?.message || `HTTP ${res.status}` };
    }
    return { success: true, message: "Google Gemini API key verified successfully!" };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to connect to Gemini API." };
  }
}

export interface ClientFinancialAnalysis {
  clientName: string;
  riskGrade: "A+" | "A" | "B" | "C" | "D" | "F";
  riskLevel: "Low Risk" | "Moderate Risk" | "High Risk" | "Severe Risk";
  totalValue: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  executiveSummary: string;
  keyInsights: string[];
  recommendedActions: string[];
  reminderEmails: {
    friendly: string;
    professional: string;
    firm: string;
    urgent: string;
  };
}

export async function analyzeClientFinancialHealth(
  clientName: string,
  projects: Array<{
    projectName: string;
    status: string;
    totalValue: number;
    amountPaid: number;
  }>
): Promise<ClientFinancialAnalysis> {
  const totalValue = projects.reduce((sum, p) => sum + p.totalValue, 0);
  const totalCollected = projects.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalOutstanding = totalValue - totalCollected;
  const collectionRate = totalValue > 0 ? Math.round((totalCollected / totalValue) * 100) : 100;

  const systemPrompt = `You are an expert freelance financial advisor and risk analyst powered by Gemini AI. Analyze client payment history and project metrics for freelance/agency ledgers. Return JSON adhering to the specified schema strictly.`;

  const userPrompt = `Analyze financial risk and generate payment summary & customizable reminder email drafts for client: "${clientName}".

Project Data:
${JSON.stringify(projects, null, 2)}

Metrics:
- Total Contracted Value: PKR ${totalValue}
- Total Collected: PKR ${totalCollected}
- Total Outstanding Balance: PKR ${totalOutstanding}
- Collection Rate: ${collectionRate}%

Output format (MUST be valid JSON):
{
  "riskGrade": "A+" | "A" | "B" | "C" | "D" | "F",
  "riskLevel": "Low Risk" | "Moderate Risk" | "High Risk" | "Severe Risk",
  "executiveSummary": "2-3 concise sentences summarizing financial relationship & payment behavior.",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendedActions": ["Action recommendation 1", "Action recommendation 2"],
  "reminderEmails": {
    "friendly": "Warm & courteous reminder email text with placeholder brackets like [Your Name]",
    "professional": "Standard professional & polite business reminder email",
    "firm": "Direct, clear & firm reminder emphasizing pending dues",
    "urgent": "Urgent reminder requesting immediate settlement before further work/deliverables"
  }
}`;

  const jsonText = await callGeminiApi(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { response_format: { type: "json_object" }, temperature: 0.2 }
  );

  const parsed = JSON.parse(jsonText);
  return {
    clientName,
    totalValue,
    totalCollected,
    totalOutstanding,
    collectionRate,
    riskGrade: parsed.riskGrade || (collectionRate >= 90 ? "A" : collectionRate >= 75 ? "B" : collectionRate >= 50 ? "C" : "D"),
    riskLevel: parsed.riskLevel || (collectionRate >= 90 ? "Low Risk" : collectionRate >= 70 ? "Moderate Risk" : "High Risk"),
    executiveSummary: parsed.executiveSummary || "Client performance analysis complete.",
    keyInsights: parsed.keyInsights || [],
    recommendedActions: parsed.recommendedActions || [],
    reminderEmails: {
      friendly: parsed.reminderEmails?.friendly || "",
      professional: parsed.reminderEmails?.professional || "",
      firm: parsed.reminderEmails?.firm || "",
      urgent: parsed.reminderEmails?.urgent || "",
    },
  };
}

export interface ParsedInvoiceData {
  clientName: string;
  clientAddress: string;
  projectName: string;
  category: string;
  items: Array<{
    title: string;
    description: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  deliverables: string[];
  suggestedDueDateDays: number;
  notes: string;
}

export async function parseInvoiceFromText(rawText: string): Promise<ParsedInvoiceData> {
  const systemPrompt = `You are Gemini AI, a smart accounting assistant that extracts structured invoice & billing information from unformatted client emails, contract notes, or scope descriptions into JSON.`;

  const userPrompt = `Extract invoice details from the following raw text input:

"${rawText}"

Output valid JSON matching this exact structure:
{
  "clientName": "Extracted client name or empty string",
  "clientAddress": "Extracted address/company info or empty string",
  "projectName": "Short clear project title",
  "category": "e.g., Web Development | Design & Branding | VPS & Infrastructure | Marketing | Maintenance | Consulting",
  "items": [
    {
      "title": "Item name/title",
      "description": "Short description of deliverable",
      "qty": 1,
      "rate": 1000,
      "amount": 1000
    }
  ],
  "subtotal": 1000,
  "discount": 0,
  "total": 1000,
  "deliverables": ["Deliverable 1", "Deliverable 2"],
  "suggestedDueDateDays": 7,
  "notes": "Brief summary of what was parsed"
}`;

  const jsonText = await callGeminiApi(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { response_format: { type: "json_object" }, temperature: 0.1 }
  );

  return JSON.parse(jsonText) as ParsedInvoiceData;
}

export async function askLedgerCopilot(
  query: string,
  context: {
    projects: Array<{ clientName: string; projectName: string; status: string; totalValue: number; amountPaid: number }>;
    invoices: Array<{ invoiceNumber: string; clientName: string; status: string; total: number; amountPaid?: number; invoiceDate: string }>;
  }
): Promise<string> {
  const systemPrompt = `You are Gemini AI Ledger Copilot, an intelligent financial & project assistant integrated into Client Ledger.
You analyze financial data, client payment histories, outstanding balances, and project status to provide actionable, concise, and helpful advice. Format your output with clear Markdown. Keep responses direct, professional, and readable.`;

  const summaryContext = {
    totalProjectsCount: context.projects.length,
    totalRevenueContracted: context.projects.reduce((s, p) => s + p.totalValue, 0),
    totalCollected: context.projects.reduce((s, p) => s + p.amountPaid, 0),
    totalOutstanding: context.projects.reduce((s, p) => s + (p.totalValue - p.amountPaid), 0),
    projectsList: context.projects,
    invoicesList: context.invoices,
  };

  const userPrompt = `Current Ledger Snapshot:
${JSON.stringify(summaryContext, null, 2)}

User Question:
"${query}"`;

  return await callGeminiApi(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.3 }
  );
}
