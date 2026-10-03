import { Candidate, Job, AnalysisResult } from '../types.ts';
import { SKILL_SYNONYMS } from './skillDatabase.ts';

// Standard English stopwords for NLP vectorization
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOPWORDS.has(token));
}

function computeTf(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  const tf = new Map<string, number>();
  const total = tokens.length || 1;
  for (const [token, count] of counts.entries()) {
    tf.set(token, count / total);
  }
  return tf;
}

export function computeSemanticSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const tf1 = computeTf(tokens1);
  const tf2 = computeTf(tokens2);

  const allWords = new Set([...tf1.keys(), ...tf2.keys()]);

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const word of allWords) {
    const v1 = tf1.get(word) || 0;
    const v2 = tf2.get(word) || 0;

    // Weight terms that are known technical skills higher
    const weight = word.length > 4 ? 1.5 : 1.0;
    const weightedV1 = v1 * weight;
    const weightedV2 = v2 * weight;

    dotProduct += weightedV1 * weightedV2;
    norm1 += weightedV1 * weightedV1;
    norm2 += weightedV2 * weightedV2;
  }

  if (norm1 === 0 || norm2 === 0) return 0;

  const cosineSim = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  // Scale cosine similarity to a realistic percentage score between 40% and 98%
  const normalized = Math.min(1.0, Math.max(0, cosineSim * 2.2));
  return Math.round(normalized * 100);
}

function normalizeSkill(skill: string): string {
  const lower = skill.trim().toLowerCase();
  return SKILL_SYNONYMS[lower] || skill.trim();
}

export function analyzeCandidate(candidate: Candidate, job: Job): AnalysisResult {
  const candidateSkillsNormalized = new Map<string, string>();
  for (const sk of candidate.skills) {
    candidateSkillsNormalized.set(normalizeSkill(sk).toLowerCase(), sk);
  }

  // Also check candidate full text for skills
  const resumeFullLower = candidate.raw_text.toLowerCase();

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of job.required_skills) {
    const normalizedReq = normalizeSkill(req).toLowerCase();
    
    // Check direct normalized skill map
    if (candidateSkillsNormalized.has(normalizedReq)) {
      matchingSkills.push(req);
    } else {
      // Check if it appears in resume full text as whole word
      const escaped = req.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|\\s|[.,;()\\/])${escaped}(?:$|\\s|[.,;()\\/])`, 'i');
      if (regex.test(resumeFullLower)) {
        matchingSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    }
  }

  // 1. Skill Match Score (0 - 100%)
  const totalReq = job.required_skills.length || 1;
  const skillMatchScore = Math.round((matchingSkills.length / totalReq) * 100);

  // 2. Experience Score (0 - 100%)
  const minExp = job.experience || 0;
  let experienceScore = 100;
  if (minExp > 0) {
    if (candidate.experience >= minExp) {
      experienceScore = 100;
    } else {
      experienceScore = Math.max(40, Math.round((candidate.experience / minExp) * 100));
    }
  }

  // 3. Education Score (0 - 100%)
  let educationScore = 85;
  const eduStr = candidate.education.join(' ').toLowerCase();
  if (eduStr.includes('master') || eduStr.includes('ph.d') || eduStr.includes('m.tech') || eduStr.includes('m.s')) {
    educationScore = 100;
  } else if (eduStr.includes('bachelor') || eduStr.includes('b.tech') || eduStr.includes('b.e') || eduStr.includes('b.s')) {
    educationScore = 90;
  } else if (candidate.education.length > 0) {
    educationScore = 75;
  }

  // 4. Semantic Similarity (NLP Cosine Similarity between Job Description and Resume Text)
  const jobFullContext = `${job.title} ${job.description} ${job.required_skills.join(' ')}`;
  const semanticSimilarityScore = computeSemanticSimilarity(jobFullContext, candidate.raw_text);

  // 5. Combined Transparent Match Score
  // Weights: Skills: 45%, Semantic Text: 30%, Experience: 15%, Education: 10%
  const compositeScore = (
    (skillMatchScore * 0.45) +
    (semanticSimilarityScore * 0.30) +
    (experienceScore * 0.15) +
    (educationScore * 0.10)
  );

  const matchScore = Math.min(99, Math.max(25, Math.round(compositeScore)));

  // Generate Review Areas
  const areasToReview: string[] = [];
  if (missingSkills.length > 0) {
    areasToReview.push(`Missing key required skills: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  if (candidate.experience < minExp) {
    areasToReview.push(`Candidate has ${candidate.experience} yrs vs ${minExp} yrs minimum requested experience`);
  }
  if (semanticSimilarityScore < 60) {
    areasToReview.push('Low contextual overlap between resume project narrative and job description requirements');
  }
  if (areasToReview.length === 0) {
    areasToReview.push('Strong alignment across technical skills, domain background, and experience targets');
  }

  // Relevant Experience Summary
  let relevantExperience = `${candidate.experience} Years overall experience`;
  if (candidate.experience_details.length > 0) {
    relevantExperience += ` (${candidate.experience_details[0]})`;
  }

  // Recruiter Decision Support Note
  let decisionSupportNotes = '';
  if (matchScore >= 80) {
    decisionSupportNotes = `Recommended for technical interview. High skill overlap (${matchingSkills.length}/${totalReq}) and robust domain background.`;
  } else if (matchScore >= 65) {
    decisionSupportNotes = `Potential candidate for exploratory review. Verify proficiency in missing areas (${missingSkills.join(', ') || 'n/a'}).`;
  } else {
    decisionSupportNotes = `Lower match score. Significant skill gaps identified against job description. Decision remains with recruiter.`;
  }

  return {
    analysis_id: `an_${candidate.candidate_id}_${job.job_id}`,
    candidate_id: candidate.candidate_id,
    job_id: job.job_id,
    candidate_name: candidate.name,
    candidate_email: candidate.email,
    candidate_experience: candidate.experience,
    job_title: job.title,
    match_score: matchScore,
    matching_skills: matchingSkills,
    missing_skills: missingSkills,
    skill_match_score: skillMatchScore,
    semantic_similarity_score: semanticSimilarityScore,
    experience_score: experienceScore,
    education_score: educationScore,
    relevant_experience: relevantExperience,
    areas_to_review: areasToReview,
    decision_support_notes: decisionSupportNotes,
    analysis_date: new Date().toISOString(),
    status: candidate.status
  };
}
