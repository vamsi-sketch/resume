export interface Job {
  job_id: string;
  title: string;
  department?: string;
  description: string;
  required_skills: string[];
  preferred_skills?: string[];
  experience: number; // Minimum years of experience
  education?: string;
  created_at: string;
}

export interface Candidate {
  candidate_id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: string[];
  experience: number; // in years
  experience_details: string[];
  certifications: string[];
  projects: string[];
  raw_text: string;
  resume_file: string;
  file_type: 'pdf' | 'docx' | 'text';
  uploaded_date: string;
  status: 'Review' | 'Shortlisted by Recruiter' | 'Under Review' | 'Hold';
}

export interface AnalysisResult {
  analysis_id: string;
  candidate_id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_experience: number;
  job_title: string;
  match_score: number; // 0 to 100%
  matching_skills: string[];
  missing_skills: string[];
  skill_match_score: number;
  semantic_similarity_score: number;
  experience_score: number;
  education_score: number;
  relevant_experience: string;
  areas_to_review: string[];
  decision_support_notes: string;
  analysis_date: string;
  status: 'Review' | 'Shortlisted by Recruiter' | 'Under Review' | 'Hold';
}

export interface DashboardStats {
  total_resumes: number;
  candidates_screened: number;
  average_match_score: number;
  shortlisted_candidates: number;
  recent_applications: Candidate[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  candidate?: Candidate;
  candidates?: Candidate[];
  errors?: string[];
}
