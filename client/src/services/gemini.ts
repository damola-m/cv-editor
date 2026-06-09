/* ===================================
   gemini.ts
   -----------------------------------
   - Gemini API client for AI CV adjustments.
   - Reads job description, returns field patches.
   =================================== */
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CVData } from '../data/cv-data'
import type { FieldPatch } from '../hooks/useCVState'

// ==========================================
// SYSTEM PROMPT
// ==========================================

function buildSystemPrompt(cv: CVData): string {
  return `You are a professional CV writer helping tailor a CV for a specific job application.

You will receive:
1. A job description (URL content or pasted text)
2. The current CV content

Your task is to return a JSON array of changes to make. Each change has:
- field: the CV field to modify (e.g. "summary")
- newValue: the revised text

Rules:
- ONLY modify these fields: summary
- Do NOT change: the person's name, contact details, registration numbers, employment dates, or company names
- DO NOT invent new experience, qualifications, or skills the candidate does not have
- Subtly tailor the language and emphasis to match the job description's keywords and tone
- Keep the same approximate length and paragraph structure
- Return ONLY a valid JSON array, no other text

Example response:
[{"field": "summary", "newValue": "I specialise in..."}]

Current CV summary:
${cv.summary}`
}

// ==========================================
// JOB URL FETCHER (best-effort via proxy)
// ==========================================

export async function fetchJobText(url: string): Promise<string | null> {
  try {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const res = await fetch(proxy, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const json = await res.json() as { contents?: string }
    if (!json.contents) return null
    // Strip HTML tags
    return json.contents.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000)
  } catch {
    return null
  }
}

// ==========================================
// MAIN AI CALL
// ==========================================

export async function adjustCVForJob(
  apiKey: string,
  cv: CVData,
  jobText: string,
): Promise<FieldPatch[]> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = buildSystemPrompt(cv) + '\n\nJob description:\n' + jobText.slice(0, 8000)

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  // Extract JSON array from response
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('Gemini returned an unexpected format')

  const patches = JSON.parse(match[0]) as FieldPatch[]
  return patches.filter(p => p.field && p.newValue)
}
