/* ===================================
   gemini.ts
   -----------------------------------
   - Conversational AI chat for CV editing.
   - Uses @google/genai (new SDK) with gemini-2.5-flash.
   - Supports multi-turn history and image uploads.
   =================================== */
import { GoogleGenAI } from '@google/genai'
import type { CVData } from '../data/cv-data'
import type { FieldPatch } from '../hooks/useCVState'
import { buildCVContext } from './cv-schema'

// ==========================================
// TYPES
// ==========================================

export type ChatMessage = {
  id:        string
  role:      'user' | 'assistant'
  text:      string
  imageUrl?: string
  patches?:  FieldPatch[]
  error?:    boolean
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
  "message": "Your conversational reply here.",
  "patches": []
}

For CV changes, populate patches with: { "field": "fieldPath", "newValue": "new content" }
For array fields (bullets, certifications, awards), newValue must be a valid JSON array string.
If no changes needed, set patches to [].`
}

// ==========================================
// JOB URL FETCHER
// ==========================================

export async function fetchJobText(url: string): Promise<string | null> {
  try {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const res   = await fetch(proxy, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const json = await res.json() as { contents?: string }
    if (!json.contents) return null
    return json.contents.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000)
  } catch { return null }
}

// ==========================================
// RESPONSE PARSER
// ==========================================

function parse(raw: string): { message: string; patches: FieldPatch[] } {
  // Try direct JSON parse
  try {
    const p = JSON.parse(raw) as { message?: string; patches?: unknown[] }
    if (typeof p.message === 'string') {
      return {
        message: p.message,
        patches: Array.isArray(p.patches)
          ? (p.patches as FieldPatch[]).filter(x => x.field && x.newValue != null)
          : [],
      }
    }
  } catch { /* continue */ }

  // Try fenced JSON block
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) {
    try {
      const p = JSON.parse(fence[1]) as { message?: string; patches?: unknown[] }
      if (typeof p.message === 'string') {
        return {
          message: p.message,
          patches: Array.isArray(p.patches)
            ? (p.patches as FieldPatch[]).filter(x => x.field && x.newValue != null)
            : [],
        }
      }
    } catch { /* continue */ }
  }

  return { message: raw.trim(), patches: [] }
}

// ==========================================
// MAIN CHAT FUNCTION
// ==========================================

export async function sendChatMessage(
  apiKey:      string,
  cv:          CVData,
  history:     ChatMessage[],
  userText:    string,
  imageBase64?: string,
  imageMime?:   string,
): Promise<{ message: string; patches: FieldPatch[] }> {
  const ai = new GoogleGenAI({ apiKey })

  // =============================
  // Part 1 — Build message history
  // =============================
  type Part = { text: string } | { inlineData: { mimeType: string; data: string } }
  type Content = { role: 'user' | 'model'; parts: Part[] }

  const contents: Content[] = history.map(m => ({
    role:  m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }))

  // =============================
  // Part 2 — Current user message
  // =============================
  const currentParts: Part[] = []
  if (imageBase64 && imageMime) {
    currentParts.push({ inlineData: { mimeType: imageMime, data: imageBase64 } })
  }
  currentParts.push({ text: userText })
  contents.push({ role: 'user', parts: currentParts })

  // =============================
  // Part 3 — Call Gemini
  // =============================
  const result = await ai.models.generateContent({
    model:    'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction: buildSystem(cv),
      temperature:       0.7,
      maxOutputTokens:   8192,  // 2048 was cutting off long CV edits and explanations
    },
  })

  const raw = result.text ?? ''
  return parse(raw)
}

// Keep for backwards compat
export async function adjustCVForJob(
  apiKey: string, cv: CVData, jobText: string,
): Promise<FieldPatch[]> {
  const res = await sendChatMessage(
    apiKey, cv, [],
    `Please tailor my CV for this job description:\n\n${jobText.slice(0, 8000)}`,
  )
  return res.patches
}
