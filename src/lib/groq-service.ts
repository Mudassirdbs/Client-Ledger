// AI Service for Client Ledger (Supports Google Gemini, Groq, and xAI Grok)

export const GROQ_MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Google Default)", description: "High speed, high accuracy reasoning model" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Google Next-Gen)", description: "Ultra-fast next-gen Gemini model" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Google Deep Reasoning)", description: "Advanced reasoning for complex financial documents" },
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Groq Recommended)", description: "High accuracy open-weights model on Groq" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Groq Ultra Fast)", description: "Lightning fast speed for quick text parsing" },
  { id: "grok-2-latest", name: "Grok 2 Latest (xAI)", description: "xAI Grok-2 high capability intelligence" },
] as const;

export type GroqModelId = typeof GROQ_MODELS[number]["id"];

const STORAGE_KEY_API = "groq_api_key";
const STORAGE_KEY_MODEL = "groq_model_id";

export function getGroqApiKey(): string {
  const stored = localStorage.getItem(STORAGE_KEY_API);
  if (stored && stored.trim()) return stored.trim();
  const envGemini = import.meta.env.VITE_GEMINI_API_KEY;
  if (envGemini && typeof envGemini === "string" && envGemini.trim()) return envGemini.trim();
  const envGroq = import.meta.env.VITE_GROQ_API_KEY;
  if (envGroq && typeof envGroq === "string" && envGroq.trim()) return envGroq.trim();
  const envXai = import.meta.env.VITE_XAI_API_KEY;
  if (envXai && typeof envXai === "string" && envXai.trim()) return envXai.trim();
  return "";
}

export function saveGroqApiKey(key: string): void {
  if (!key || !key.trim()) {
    localStorage.removeItem(STORAGE_KEY_API);
  } else {
    localStorage.setItem(STORAGE_KEY_API, key.trim());
  }
}

export function getGroqModel(): GroqModelId {
  const apiKey = getGroqApiKey();
  const stored = localStorage.getItem(STORAGE_KEY_MODEL) as GroqModelId;
  if (stored && GROQ_MODELS.some(m => m.id === stored)) return stored;
  if (apiKey.startsWith("AQ.") || apiKey.startsWith("AIza")) return "gemini-1.5-flash";
  if (apiKey.startsWith("xai-")) return "grok-2-latest";
  if (apiKey.startsWith("gsk_")) return "llama-3.3-70b-versatile";
  return "gemini-1.5-flash";
}

export function saveGroqModel(model: GroqModelId): void {
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function getApiConfig(apiKey: string, selectedModel?: string): { endpoint: string; defaultModel: string; providerName: string } {
  if (apiKey.startsWith("xai-")) {
    return {
      endpoint: "https://api.x.ai/v1/chat/completions",
      defaultModel: "grok-2-latest",
      providerName: "xAI (Grok)",
    };
  }
  if (apiKey.startsWith("gsk_")) {
    return {
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      defaultModel: "llama-3.3-70b-versatile",
      providerName: "Groq",
    };
  }
  // Default to Google Gemini (OpenAI compatibility endpoint)
  return {
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    defaultModel: "gemini-1.5-flash",
    providerName: "Google Gemini",
  };
}

async function callGroqApi(
  messages: GroqChatMessage[],
  options?: { response_format?: { type: "json_object" }; temperature?: number; model?: string }
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: AI API key is not configured. Please set your Gemini, Groq, or xAI key in Settings.");
  }

  const { endpoint, defaultModel } = getApiConfig(apiKey, options?.model);
  let model = options?.model || getGroqModel() || defaultModel;
  
  // Guard against incompatible model/key combinations
  if (apiKey.startsWith("AQ.") || apiKey.startsWith("AIza")) {
    if (!model.startsWith("gemini")) model = "gemini-1.5-flash";
  }

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || response.statusText || `HTTP ${response.status}`;
    if (response.status === 401) {
      throw new Error(`INVALID_API_KEY: Invalid API Key provided. (${message})`);
    }
    if (response.status === 429) {
      throw new Error(`RATE_LIMIT: Rate limit reached. Please wait a moment and try again.`);
    }
    throw new Error(`AI API Error: ${message}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No response text received from AI provider.");
  }
  return content;
}

export async function testGroqKey(apiKey?: string, modelId?: string): Promise<{ success: boolean; message: string }> {
  const key = apiKey ?? getGroqApiKey();
  if (!key) {
    return { success: false, message: "No API Key provided." };
  }
  const { endpoint, defaultModel, providerName } = getApiConfig(key, modelId);
  let model = modelId || defaultModel;
  if ((key.startsWith("AQ.") || key.startsWith("AIza")) && !model.startsWith("gemini")) {
    model = "gemini-1.5-flash";
  }

  try {
    const res = await fetch(endpoint, {
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
    return { success: true, message: `${providerName} API key verified successfully!` };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to connect to AI provider API." };
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

  const systemPrompt = `You are an expert freelance financial advisor and risk analyst. Analyze client payment history and project metrics for freelance/agency ledgers. Return JSON adhering to the specified schema strictly.`;

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

  const jsonText = await callGroqApi(
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
  const systemPrompt = `You are a smart accounting AI that extracts structured invoice & billing information from unformatted client emails, contract notes, or scope descriptions into JSON.`;

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

  const jsonText = await callGroqApi(
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
  const systemPrompt = `You are Groq AI Ledger Copilot, an intelligent financial & project assistant integrated into Client Ledger app.
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

  return await callGroqApi(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.3 }
  );
}
