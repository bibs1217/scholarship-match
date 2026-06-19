export * from './scholarship-criteria'

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled'
export type PlanTier = 'starter' | 'standard' | 'enterprise'
export type InstitutionUserRole = 'admin' | 'financial_aid_staff' | 'viewer'
export type SourceType = 'institutional' | 'state' | 'federal' | 'foundation' | 'departmental'
export type AwardType = 'fixed_amount' | 'percentage_tuition' | 'full_tuition' | 'per_credit_hour' | 'variable'
export type DegreeLevel = 'associate' | 'bachelor' | 'transfer' | 'graduate'
export type ApplicationStatus = 'submitted' | 'processing' | 'matched' | 'reviewed' | 'archived'
export type MatchStatus = 'ai_suggested' | 'staff_approved' | 'staff_rejected' | 'letter_sent'
export type LetterStatus = 'draft' | 'approved' | 'sent'
export type SentVia = 'email' | 'portal' | 'both'

export interface Institution {
  id: string
  name: string
  slug: string
  state: string
  domain: string | null
  logo_url: string | null
  primary_color: string | null
  stripe_customer_id: string | null
  subscription_status: SubscriptionStatus
  plan_tier: PlanTier
  created_at: string
}

export interface Scholarship {
  id: string
  institution_id: string | null
  name: string
  description: string | null
  source_type: SourceType
  award_type: AwardType
  award_amount_min: number | null
  award_amount_max: number | null
  renewable: boolean
  max_renewal_years: number | null
  application_deadline: string | null
  academic_year: string | null
  is_active: boolean
  criteria_schema: import('./scholarship-criteria').CriteriaSchema
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  institution_id: string
  supabase_auth_user_id: string | null
  email: string
  full_name: string
  date_of_birth: string | null
  residency_state: string | null
  is_first_generation: boolean
  is_first_time_in_college: boolean
  high_school_name: string | null
  high_school_graduation_year: number | null
  created_at: string
}

export interface Application {
  id: string
  student_id: string
  institution_id: string
  academic_year: string
  intended_major: string | null
  degree_level: DegreeLevel
  gpa_unweighted: number | null
  gpa_weighted: number | null
  sat_score: number | null
  act_score: number | null
  household_income_bracket: string | null
  fafsa_on_file: boolean
  ffaa_on_file: boolean
  community_service_hours: number | null
  is_national_merit_finalist: boolean
  is_veteran_or_dependent: boolean
  has_disability_documentation: boolean
  free_text_essay: string | null
  raw_uploaded_documents: string[]
  status: ApplicationStatus
  submitted_at: string
  created_at: string
}

export interface ScholarshipMatch {
  id: string
  application_id: string
  scholarship_id: string
  confidence_score: number
  match_reasoning: string
  criteria_evaluation: import('./scholarship-criteria').CriterionResult[]
  status: MatchStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  // joined
  scholarship?: Scholarship
  application?: Application
}

export interface EligibilityLetter {
  id: string
  match_id: string
  application_id: string
  letter_body: string
  pdf_storage_path: string | null
  sent_at: string | null
  sent_via: SentVia | null
  status: LetterStatus
  created_at: string
}
