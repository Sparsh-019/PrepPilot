const { scoreResume } = require('../utils/atsScorer');

/**
 * AI Service Abstraction Layer
 * ------------------------------------------------------------------
 * PrepPilot's slides call for "OpenAI API or Google Gemini API for NLP,
 * scoring, and feedback", isolated behind the backend so API keys never
 * reach the client and rate limits are managed in one place.
 *
 * This module exposes a stable interface (analyzeResume, gradeInterviewAnswer,
 * generateRoadmap) regardless of which provider is configured via AI_PROVIDER.
 * When AI_PROVIDER=mock or no API key is present, it falls back to deterministic
 * heuristics so the whole platform remains fully demoable without a paid key.
 */

const PROVIDER = (process.env.AI_PROVIDER || 'mock').toLowerCase();

// ---------------------------------------------------------------------------
// Provider-specific low-level callers
// ---------------------------------------------------------------------------

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are PrepPilot, an assistant that returns ONLY valid JSON, no markdown fences, no commentary.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Return ONLY valid JSON, no markdown fences.\n\n${prompt}` }] }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

async function callProvider(prompt) {
  if (PROVIDER === 'openai') return callOpenAI(prompt);
  if (PROVIDER === 'gemini') return callGemini(prompt);
  throw new Error('mock provider — no external call made');
}

// ---------------------------------------------------------------------------
// Public, feature-level functions used by controllers
// ---------------------------------------------------------------------------

/**
 * Analyzes a resume's raw text against a target role.
 * Falls back to the deterministic ATS heuristic scorer on any AI failure
 * or when running in mock mode, so the feature never hard-fails a demo.
 */
async function analyzeResume(rawText, targetRole) {
  if (PROVIDER === 'mock') {
    return scoreResume(rawText, targetRole);
  }

  const prompt = `
Analyze this resume for the target role "${targetRole}".
Resume text:
"""
${rawText.slice(0, 6000)}
"""
Return JSON with exactly these keys:
{
  "atsScore": number (0-100),
  "passLikelihood": "Low" | "Medium" | "High",
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "strengths": string[],
  "improvements": string[],
  "summary": string (2-3 sentences)
}`;

  try {
    return await callProvider(prompt);
  } catch (err) {
    console.warn(`[aiService] Falling back to heuristic ATS scorer: ${err.message}`);
    return scoreResume(rawText, targetRole);
  }
}

/**
 * Grades a single interview answer for clarity, relevance, and confidence.
 */
async function gradeInterviewAnswer(question, answer) {
  if (PROVIDER === 'mock') {
    return mockGradeAnswer(question, answer);
  }

  const prompt = `
Question asked: "${question}"
Candidate's answer: "${answer}"
Grade this interview answer. Return JSON with exactly these keys:
{
  "clarityScore": number (0-10),
  "relevanceScore": number (0-10),
  "confidenceScore": number (0-10),
  "comments": string (2-3 sentences of constructive feedback)
}`;

  try {
    return await callProvider(prompt);
  } catch (err) {
    console.warn(`[aiService] Falling back to heuristic interview grading: ${err.message}`);
    return mockGradeAnswer(question, answer);
  }
}

function mockGradeAnswer(question, answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const hasStructure = /first|second|for example|because|therefore|in conclusion/i.test(answer);

  const clarityScore = Math.min(10, Math.round((Math.min(wordCount, 120) / 120) * 6 + (hasStructure ? 4 : 2)));
  const relevanceScore = Math.min(
    10,
    Math.round(
      question
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4 && answer.toLowerCase().includes(w)).length * 2 + 4
    )
  );
  const confidenceScore = Math.min(10, Math.round((wordCount / 100) * 5 + 3));

  return {
    clarityScore: Math.max(clarityScore, 1),
    relevanceScore: Math.max(Math.min(relevanceScore, 10), 1),
    confidenceScore: Math.max(confidenceScore, 1),
    comments:
      wordCount < 20
        ? 'Your answer is quite short — expand with a concrete example using the STAR method (Situation, Task, Action, Result).'
        : 'Solid attempt — consider structuring your answer more explicitly and tying it back to the question at the end.',
  };
}

/**
 * Generates a personalized learning roadmap based on the student's current
 * DSA progress, quiz performance, and target role.
 */
async function generateRoadmap({ targetRole, dsaBreakdown, avgQuizScore, weakTopics }) {
  if (PROVIDER === 'mock') {
    return mockRoadmap({ targetRole, dsaBreakdown, avgQuizScore, weakTopics });
  }

  const prompt = `
Student target role: "${targetRole}"
DSA topic breakdown (solved counts): ${JSON.stringify(dsaBreakdown)}
Average quiz score: ${avgQuizScore}
Weak topics: ${JSON.stringify(weakTopics)}

Generate a 4-week personalized preparation roadmap. Return JSON:
{
  "weeks": [
    { "week": 1, "focus": string, "tasks": string[] }
  ],
  "priorityAdvice": string
}`;

  try {
    return await callProvider(prompt);
  } catch (err) {
    console.warn(`[aiService] Falling back to heuristic roadmap: ${err.message}`);
    return mockRoadmap({ targetRole, dsaBreakdown, avgQuizScore, weakTopics });
  }
}

function mockRoadmap({ targetRole, weakTopics = [], avgQuizScore = 0 }) {
  const topics = weakTopics.length > 0 ? weakTopics : ['Arrays', 'Strings', 'DynamicProgramming'];
  const weeks = [
    { week: 1, focus: `Foundations — ${topics[0] || 'Arrays'}`, tasks: [
      `Solve 10 Easy + 5 Medium problems on ${topics[0] || 'Arrays'}`,
      'Complete 1 Aptitude quiz set',
      'Draft/update resume summary section',
    ]},
    { week: 2, focus: `Core Practice — ${topics[1] || 'Strings'}`, tasks: [
      `Solve 8 Medium problems on ${topics[1] || 'Strings'}`,
      'Take 1 Technical MCQ quiz',
      'Run resume through ATS analyzer and fix top 3 gaps',
    ]},
    { week: 3, focus: `Advanced Topics — ${topics[2] || 'DynamicProgramming'}`, tasks: [
      `Solve 6 Medium/Hard problems on ${topics[2] || 'DynamicProgramming'}`,
      'Complete 1 mock technical interview',
      'Review interview feedback and address lowest-scoring dimension',
    ]},
    { week: 4, focus: `Interview Readiness for ${targetRole || 'target role'}`, tasks: [
      'Take 2 mock interviews (Technical + HR)',
      'Full resume + ATS re-check',
      'Revisit weakest DSA topic with timed practice',
    ]},
  ];

  const priorityAdvice =
    avgQuizScore < 50
      ? 'Prioritize core concept review before increasing problem volume — accuracy first, speed second.'
      : 'Your fundamentals look solid — shift focus toward timed mock interviews and resume polish.';

  return { weeks, priorityAdvice };
}

module.exports = { analyzeResume, gradeInterviewAnswer, generateRoadmap, PROVIDER };
