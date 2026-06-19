// ─── Criterion types ───────────────────────────────────────────────────────────
export interface GpaCriterion {
  field: 'gpa_unweighted' | 'gpa_weighted'
  operator: 'gte' | 'lte'
  value: number
}

export interface ScoreCriterion {
  field: 'sat_score' | 'act_score'
  operator: 'gte'
  value: number
}

export interface ResidencyStateCriterion {
  field: 'residency_state'
  operator: 'in'
  value: string[]
}

export interface DegreeLevelCriterion {
  field: 'degree_level'
  operator: 'in'
  value: ('associate' | 'bachelor' | 'transfer' | 'graduate')[]
}

export interface MajorCriterion {
  field: 'intended_major'
  operator: 'in' | 'not_in'
  value: string[]
}

export interface IncomeBracketCriterion {
  field: 'household_income_bracket'
  operator: 'lte'
  value: 'very_low' | 'low' | 'moderate' | 'middle' | 'upper_middle' | 'high'
}

export interface BooleanCriterion {
  field:
    | 'is_first_generation'
    | 'is_first_time_in_college'
    | 'is_national_merit_finalist'
    | 'is_veteran_or_dependent'
    | 'has_disability_documentation'
    | 'fafsa_on_file'
    | 'ffaa_on_file'
  operator: 'eq'
  value: boolean
}

export interface CommunityServiceCriterion {
  field: 'community_service_hours'
  operator: 'gte'
  value: number
}

export interface CustomTextCriterion {
  field: 'custom_text_match'
  operator: 'contains'
  value: string
  source_field: string // e.g. 'free_text_essay'
}

export type Criterion =
  | GpaCriterion
  | ScoreCriterion
  | ResidencyStateCriterion
  | DegreeLevelCriterion
  | MajorCriterion
  | IncomeBracketCriterion
  | BooleanCriterion
  | CommunityServiceCriterion
  | CustomTextCriterion

// ─── Full criteria schema ──────────────────────────────────────────────────────
export interface CriteriaSchema {
  match_logic: 'all' | 'any'
  criteria: Criterion[]
  required_documents: string[]
  notes_for_agent?: string
}

// ─── Application shape (subset used for evaluation) ───────────────────────────
export interface ApplicationForEval {
  gpa_unweighted?: number | null
  gpa_weighted?: number | null
  sat_score?: number | null
  act_score?: number | null
  residency_state?: string | null
  degree_level?: string | null
  intended_major?: string | null
  household_income_bracket?: string | null
  is_first_generation?: boolean | null
  is_first_time_in_college?: boolean | null
  is_national_merit_finalist?: boolean | null
  is_veteran_or_dependent?: boolean | null
  has_disability_documentation?: boolean | null
  fafsa_on_file?: boolean | null
  ffaa_on_file?: boolean | null
  community_service_hours?: number | null
  free_text_essay?: string | null
}

// ─── Evaluation result ─────────────────────────────────────────────────────────
export interface CriterionResult {
  field: string
  passed: boolean
  reason: string
  missing_data: boolean
}

export interface EvaluationResult {
  passed: boolean
  perCriterionResults: CriterionResult[]
}
