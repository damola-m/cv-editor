/* ===================================
   gemini.ts
   -----------------------------------
   - Conversational AI chat for CV editing.
   - Supports multi-turn history, image uploads,
     and structured patch responses.
   =================================== */
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CVData } from '../data/cv-data'
import type { FieldPatch } from '../hooks/useCVState'
import { buildCVContext } from './cv-schema'

// ==========================================
// TYPES
// ==========================================

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  imageUrl?: string   // base64 data URL shown in chat
  patches?: FieldPatch[]
  error?: boolean
}

// ==========================================
// SYSTEM PROMPT
// ==========================================

function buildSystem(cv: CVData): string {
  return `You are an expert CV editor and career advisor helping Adedamola Michael edit and optimise his CV.

${buildCVContext(cv)}

YOUR ROLE:
- Answer questions about the CV honestly
- Suggest and apply targeted edits when asked
- Tailor content for specific jobs without inventing fake experience
- Optimise job titles, summaries, and bullet points
- Advise on wording, keywords, and ATS optimisation
- Analyse images (screenshots, job postings) if provided

RULES:
- Never invent qualifications, experience, or companies
- Preserve the candidate's authentic voice and style
- Only change what is explicitly asked
- Keep edits realistic and achievable

RESPONSE FORMAT — always respond with a single JSON object:
{
  "message": "Your conversational reply here. Explain what you changed and why, or answer the question.",
  "patches": []
}

If you make CV changes, populate the patches array with:
{ "field": "fieldPath", "newValue": "new content" }

For array fields (bullets, certifications, awards, keyProject.bullets), newValue must be a valid JSON array string, e.g.: ["bullet one", "bullet two"]

If no changes are needed, set patches to an empty array [].
Always include a helpful message regardless.`
}

// ==========================================
// JOB URL FETCHER
// ==========================================

export async function fetchJobText(url: string): Promise<string | null> {
  try {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const res = await fetch(proxy, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const json = await res.json() as { contents?: string }
    if (!json.contents) return null
    return json.contents.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000)
  } catch {
    return null
  }
}

// ==========================================
// RESPONSE PARSER
// ==========================================

function parseResponse(raw: string): { message: string; patches: FieldPatch[] } {
  // Try full JSON parse
  try {
    const parsed = JSON.parse(raw) as { message?: string; patches?: unknown[] }
    if (typeof parsed.message === 'string') {
      return {
        message: parsed.message,
        patches: Array.isArray(parsed.patches)
          ? (parsed.patches as FieldPatch[]).filter(p => p.field && p.newValue != null)
          : [],
      }
    }
  } catch { /* continue */ }

  // Try to extract a JSON block from markdown code fence
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) {
    try {
      const parsed = JSON.parse(fence[1]) as { message?: string; patches?: unknown[] }
      if (typeof parsed.message === 'string') {
        return {
          message: parsed.message,
          patches: Array.isArray(parsed.patches)
            ? (parsed.patches as FieldPatch[]).filter(p => p.field && p.newValue != null)
            : [],
        }
      }
    } catch { /* continue */ }
  }

  // Fallback — treat whole response as plain message
  return { message: raw.trim(), patches: [] }
}

// ==========================================
// MAIN CHAT FUNCTION
// ==========================================

export async function sendChatMessage(
  apiKey: string,
  cv: CVData,
  history: ChatMessage[],
  userText: string,
  imageBase64?: string,   // bare base64 (no data: prefix)
  imageMime?: string,     // 'image/jpeg' | 'image/png'
): Promise<{ message: string; patches: FieldPatch[] }> {
  const genAI  = new GoogleGenerativeAI(apiKey)
  const model  = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildSystem(cv),
  })

  // =============================
  // Part 1 — Build Gemini history
  // =============================
  const geminiHistory = history.map(m => ({
    role: m.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: m.text }],
  }))

  // =============================
  // Part 2 — Build current message parts
  // =============================
  type Part = { text: string } | { inlineData: { mimeType: string; data: string } }
  const parts: Part[] = []
  if (imageBase64 && imageMime) {
    parts.push({ inlineData: { mimeType: imageMime, data: imageBase64 } })
  }
  parts.push({ text: userText })

  // =============================
  // Part 3 — Call Gemini
  // =============================
  const chat = model.startChat({ history: geminiHistory })
  const result = await chat.sendMessage(parts)
  const raw = result.response.text()

  return parseResponse(raw)
}

// Keep adjustCVForJob for backwards compat — routes through new chat function
export async function adjustCVForJob(
  apiKey: string,
  cv: CVData,
  jobText: string,
): Promise<FieldPatch[]> {
  const res = await sendChatMessage(
    apiKey, cv, [],
    `Please tailor my CV for this job description:\n\n${jobText.slice(0, 8000)}`,
  )
  return res.patches
}
