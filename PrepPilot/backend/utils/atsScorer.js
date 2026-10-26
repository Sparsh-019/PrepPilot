/**
 * Lightweight, dependency-free ATS scoring heuristic.
 * Used as a deterministic fallback when no AI provider (OpenAI/Gemini) is
 * configured, and as a sanity baseline even when AI is enabled.
 */

// A small curated keyword bank per common target role.
// Extend freely as PrepPilot grows its role catalogue.
const ROLE_KEYWORDS = {
  'SDE': [
    'data structures', 'algorithms', 'java', 'python', 'c++', 'javascript',
    'git', 'rest api', 'system design', 'oop', 'sql', 'testing', 'agile',
    'debugging', 'problem solving',
  ],
  'Frontend Developer': [
    'react', 'javascript', 'html', 'css', 'typescript', 'redux', 'webpack',
    'responsive design', 'accessibility', 'rest api', 'git', 'tailwind',
  ],
  'Backend Developer': [
    'node.js', 'express', 'rest api', 'sql', 'mongodb', 'microservices',
    'docker', 'authentication', 'caching', 'system design', 'git',
  ],
  'Data Analyst': [
    'sql', 'excel', 'python', 'tableau', 'power bi', 'statistics',
    'data visualization', 'pandas', 'a/b testing', 'reporting',
  ],
  'Default': [
    'communication', 'teamwork', 'leadership', 'project', 'problem solving',
    'git', 'sql', 'python', 'java', 'javascript',
  ],
};

const ACHIEVEMENT_VERBS = [
  'led', 'built', 'designed', 'improved', 'increased', 'reduced', 'optimized',
  'launched', 'automated', 'implemented', 'architected', 'mentored', 'delivered',
];

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Scores a resume's raw text against a target role's keyword bank.
 * Returns a structured analysis object matching the Resume model's `analysis` shape.
 */
function scoreResume(rawText, targetRole = 'Default') {
  const text = normalize(rawText);
  const keywordBank = ROLE_KEYWORDS[targetRole] || ROLE_KEYWORDS.Default;

  const matchedKeywords = keywordBank.filter((kw) => text.includes(kw.toLowerCase()));
  const missingKeywords = keywordBank.filter((kw) => !matchedKeywords.includes(kw));

  const keywordCoverage = matchedKeywords.length / keywordBank.length; // 0-1

  const achievementHits = ACHIEVEMENT_VERBS.filter((v) => text.includes(v)).length;
  const achievementScore = Math.min(achievementHits / 5, 1); // cap contribution

  const hasQuantifiedResults = /\d+%|\d+x|\$\d+|\d+\s?(users|customers|requests|ms|percent)/.test(text);
  const wordCount = text.split(' ').filter(Boolean).length;
  const lengthScore = wordCount >= 250 && wordCount <= 900 ? 1 : 0.6; // penalize too short/long

  const rawScore =
    keywordCoverage * 55 +
    achievementScore * 20 +
    (hasQuantifiedResults ? 15 : 0) +
    lengthScore * 10;

  const atsScore = Math.round(Math.min(rawScore, 100));

  let passLikelihood = 'Low';
  if (atsScore >= 75) passLikelihood = 'High';
  else if (atsScore >= 50) passLikelihood = 'Medium';

  const strengths = [];
  if (matchedKeywords.length > 0) strengths.push(`Strong match on ${matchedKeywords.length} role-relevant keywords`);
  if (hasQuantifiedResults) strengths.push('Includes quantified, measurable achievements');
  if (achievementHits >= 3) strengths.push('Uses strong action verbs consistently');

  const improvements = [];
  if (missingKeywords.length > 0) {
    improvements.push(`Add relevant keywords: ${missingKeywords.slice(0, 6).join(', ')}`);
  }
  if (!hasQuantifiedResults) improvements.push('Quantify achievements with numbers (%, time saved, scale)');
  if (achievementHits < 3) improvements.push('Start bullet points with strong action verbs (led, built, optimized)');
  if (wordCount < 250) improvements.push('Resume looks too short — add more relevant project/experience detail');
  if (wordCount > 900) improvements.push('Resume looks too long — trim to the most relevant 1-2 pages');

  return {
    atsScore,
    passLikelihood,
    matchedKeywords,
    missingKeywords,
    strengths,
    improvements,
    summary: `Resume scored ${atsScore}/100 for the ${targetRole} role. ${matchedKeywords.length}/${keywordBank.length} target keywords matched.`,
  };
}

module.exports = { scoreResume, ROLE_KEYWORDS };
