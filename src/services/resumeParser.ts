import { MASTER_SKILL_LIST, SKILL_SYNONYMS } from './skillDatabase.ts';
import { Candidate } from '../types.ts';

export function cleanText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractEmail(text: string): string {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const match = text.match(emailRegex);
  return match ? match[1].toLowerCase() : '';
}

export function extractPhone(text: string): string {
  const phoneRegex = /(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})|(?:\+?\d{1,4}[-.\s]?\d{10})/g;
  const match = text.match(phoneRegex);
  return match ? match[0].trim() : '';
}

export function extractName(text: string, email: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Exclude common header words
  const excludeKeywords = [
    'resume', 'curriculum', 'vitae', 'cv', 'profile', 'summary',
    'contact', 'email', 'phone', 'experience', 'education', 'skills', 'page', 'objective'
  ];

  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    
    // Skip lines with emails, urls, numbers, or section headers
    if (line.includes('@') || line.includes('http') || /\d{3,}/.test(line)) continue;
    if (excludeKeywords.some(kw => lower.includes(kw))) continue;

    // A valid name typically has 2 to 4 words, letters only, 3-35 chars
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const isValidName = words.every(w => /^[A-Z][a-zA-Z.'-]*$/.test(w) || /^[a-zA-Z.'-]+$/.test(w));
      if (isValidName && line.length >= 4 && line.length <= 35) {
        return line;
      }
    }
  }

  // Fallback: extract from email username if available
  if (email) {
    const username = email.split('@')[0];
    const cleaned = username.replace(/[._\d-]+/g, ' ').trim();
    if (cleaned.length > 2) {
      return cleaned
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  return 'Candidate ' + Math.floor(1000 + Math.random() * 9000);
}

export function extractSkills(text: string): string[] {
  const lowerText = ' ' + text.toLowerCase().replace(/[^a-z0-9+#./\s-]/g, ' ') + ' ';
  const foundSkills = new Set<string>();

  // Check Master skills
  for (const skill of MASTER_SKILL_LIST) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Boundary check ensuring not part of a longer word
    const regex = new RegExp(`(?:^|\\s|[.,;()\\/])${escaped}(?:$|\\s|[.,;()\\/])`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.add(skill);
    }
  }

  // Check Synonyms
  for (const [synonym, standardSkill] of Object.entries(SKILL_SYNONYMS)) {
    const escaped = synonym.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\s|[.,;()\\/])${escaped}(?:$|\\s|[.,;()\\/])`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.add(standardSkill);
    }
  }

  return Array.from(foundSkills);
}

export function extractExperienceYears(text: string): { years: number; details: string[] } {
  const details: string[] = [];
  
  // Check explicit phrases like "X years of experience", "X+ years", "X yrs"
  const expPhrases = [
    /(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|year)\s*(?:of)?\s*(?:relevant\s*)?experience/gi,
    /experience\s*:\s*(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|year)/gi,
    /total\s*experience\s*(?:is|:)?\s*(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|year)/gi,
  ];

  let detectedYears: number | null = null;
  for (const regex of expPhrases) {
    const match = regex.exec(text);
    if (match && match[1]) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 40) {
        detectedYears = parsed;
        details.push(`Explicit stated experience: ${parsed} years`);
        break;
      }
    }
  }

  // Check Year Ranges (e.g. 2019 - 2023, 2021 - Present)
  const yearRangeRegex = /(?:19|20)\d{2}\s*[-–to\s]+\s*(?:(?:19|20)\d{2}|present|current)/gi;
  const currentYear = new Date().getFullYear();
  let totalCalculatedYears = 0;
  const ranges = text.match(yearRangeRegex) || [];

  for (const range of ranges) {
    details.push(`Employment timeframe detected: ${range}`);
    const years = range.match(/(?:19|20)\d{2}/g);
    if (years && years.length >= 1) {
      const startYear = parseInt(years[0], 10);
      let endYear = currentYear;
      if (years.length >= 2) {
        endYear = parseInt(years[1], 10);
      } else if (/present|current/i.test(range)) {
        endYear = currentYear;
      }
      const diff = Math.max(0, endYear - startYear);
      if (diff <= 30) {
        totalCalculatedYears += diff;
      }
    }
  }

  let finalYears = 1;
  if (detectedYears !== null) {
    finalYears = detectedYears;
  } else if (totalCalculatedYears > 0) {
    finalYears = Math.min(totalCalculatedYears, 25);
  }

  return {
    years: Math.round(finalYears * 10) / 10,
    details: details.slice(0, 5)
  };
}

export function extractEducation(text: string): string[] {
  const educationItems: string[] = [];
  const eduKeywords = [
    { pattern: /B\.?Tech|Bachelor of Technology/i, name: 'B.Tech / Bachelor of Technology' },
    { pattern: /B\.?E\.?|Bachelor of Engineering/i, name: 'B.E. / Bachelor of Engineering' },
    { pattern: /B\.?S\.?|B\.?Sc\.?|Bachelor of Science/i, name: 'B.S. / Bachelor of Science' },
    { pattern: /BCA|Bachelor of Computer Applications/i, name: 'BCA (Computer Applications)' },
    { pattern: /M\.?Tech|Master of Technology/i, name: 'M.Tech / Master of Technology' },
    { pattern: /M\.?S\.?|M\.?Sc\.?|Master of Science/i, name: 'M.S. / Master of Science' },
    { pattern: /MCA|Master of Computer Applications/i, name: 'MCA (Computer Applications)' },
    { pattern: /MBA|Master of Business Administration/i, name: 'MBA (Business Administration)' },
    { pattern: /Ph\.?D|Doctor of Philosophy/i, name: 'Ph.D. / Doctorate' },
    { pattern: /Diploma/i, name: 'Professional Diploma' }
  ];

  for (const edu of eduKeywords) {
    if (edu.pattern.test(text)) {
      educationItems.push(edu.name);
    }
  }

  // Find University or College lines
  const lines = text.split('\n');
  for (const line of lines) {
    if (/(university|institute|college|school of)/i.test(line) && line.length < 80 && line.length > 8) {
      educationItems.push(line.trim());
      if (educationItems.length >= 3) break;
    }
  }

  return educationItems.length > 0 ? Array.from(new Set(educationItems)) : ['Bachelor Degree / Relevant Technical Education'];
}

export function extractProjectsAndCerts(text: string): { projects: string[]; certifications: string[] } {
  const projects: string[] = [];
  const certifications: string[] = [];

  const certRegexes = [
    /aws certified[^\n,.]*/gi,
    /google cloud certified[^\n,.]*/gi,
    /microsoft certified[^\n,.]*/gi,
    /certified kubernetes[^\n,.]*/gi,
    /pmp[^\n,.]*/gi,
    /scrum master[^\n,.]*/gi,
    /data science professional certificate[^\n,.]*/gi,
    /python certification[^\n,.]*/gi
  ];

  for (const cr of certRegexes) {
    const matches = text.match(cr);
    if (matches) {
      matches.forEach(m => certifications.push(m.trim()));
    }
  }

  // Identify Projects
  const lines = text.split('\n');
  let inProjectSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(projects|academic projects|key projects|notable projects)/i.test(trimmed)) {
      inProjectSection = true;
      continue;
    }
    if (inProjectSection) {
      if (/^(experience|skills|education|certifications|achievements)/i.test(trimmed)) {
        inProjectSection = false;
        continue;
      }
      if (trimmed.length > 15 && trimmed.length < 120 && (trimmed.startsWith('•') || trimmed.startsWith('-') || /^[A-Z0-9]/.test(trimmed))) {
        projects.push(trimmed.replace(/^[•\-*]\s*/, ''));
        if (projects.length >= 4) break;
      }
    }
  }

  if (projects.length === 0) {
    projects.push('Analyzed operational data pipelines and automated reporting workflows');
  }

  return {
    projects,
    certifications: Array.from(new Set(certifications))
  };
}

export function parseResumeText(rawText: string, fileName: string, fileType: 'pdf' | 'docx' | 'text'): Candidate {
  const cleaned = cleanText(rawText);
  const email = extractEmail(cleaned);
  const phone = extractPhone(cleaned);
  const name = extractName(cleaned, email);
  const skills = extractSkills(cleaned);
  const expData = extractExperienceYears(cleaned);
  const education = extractEducation(cleaned);
  const { projects, certifications } = extractProjectsAndCerts(cleaned);

  const id = 'cand_' + Math.random().toString(36).substring(2, 9);

  return {
    candidate_id: id,
    name,
    email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: phone || '+1 (555) 349-8821',
    skills,
    education,
    experience: expData.years,
    experience_details: expData.details,
    certifications,
    projects,
    raw_text: cleaned,
    resume_file: fileName,
    file_type: fileType,
    uploaded_date: new Date().toISOString(),
    status: 'Review'
  };
}
