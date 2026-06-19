import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── DEMO INSTITUTION ────────────────────────────────────────────────────────
const UF_INSTITUTION = {
  name: 'University of Florida',
  slug: 'uf',
  type: 'university' as const,
  primary_color: '#003087',
}

// ─── FEDERAL SCHOLARSHIPS ────────────────────────────────────────────────────
const FEDERAL_SCHOLARSHIPS = [
  {
    scope: 'federal' as const,
    name: 'Federal Pell Grant',
    description: 'Need-based grant for undergraduate students who have not earned a bachelor\'s or professional degree.',
    award_amount_min: 740,
    award_amount_max: 7395,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'degree_level', operator: 'in', value: ['associate', 'bachelor', 'certificate'] },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
        { field: 'household_income_bracket', operator: 'lte', value: 'moderate' },
      ],
      required_documents: ['FAFSA', 'Enrollment verification'],
      notes_for_agent: 'Award amount determined by EFC from FAFSA. Confirm FAFSA is on file.'
    },
    source_url: 'https://studentaid.gov/understand-aid/types/grants/pell'
  },
  {
    scope: 'federal' as const,
    name: 'Federal Supplemental Educational Opportunity Grant (FSEOG)',
    description: 'Priority for Pell-eligible undergrads with exceptional need. Campus-based; funds limited.',
    award_amount_min: 100,
    award_amount_max: 4000,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'degree_level', operator: 'in', value: ['associate', 'bachelor', 'certificate'] },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
        { field: 'household_income_bracket', operator: 'lte', value: 'low' },
      ],
      required_documents: ['FAFSA', 'Enrollment verification'],
      notes_for_agent: 'Campus-based; contact financial aid office to confirm availability.'
    },
    source_url: 'https://studentaid.gov/understand-aid/types/grants/fseog'
  },
  {
    scope: 'federal' as const,
    name: 'TEACH Grant',
    description: 'For students planning to teach high-need subjects in low-income schools. Service obligation required.',
    award_amount_min: 4000,
    award_amount_max: 4000,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'degree_level', operator: 'in', value: ['associate', 'bachelor', 'master'] },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
        { field: 'intended_major', operator: 'contains', value: 'education' },
      ],
      required_documents: ['FAFSA', 'Agreement to Serve', 'TEACH counseling completion'],
      notes_for_agent: 'Converts to unsubsidized loan if service obligation not met. Flag for review.'
    },
    source_url: 'https://studentaid.gov/understand-aid/types/grants/teach'
  },
  {
    scope: 'federal' as const,
    name: 'Iraq and Afghanistan Service Grant',
    description: 'For students whose parent/guardian died as a result of military service in Iraq or Afghanistan after 9/11.',
    award_amount_min: 5931,
    award_amount_max: 5931,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'is_veteran_or_dependent', operator: 'eq', value: true },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
        { field: 'degree_level', operator: 'in', value: ['associate', 'bachelor', 'certificate'] },
      ],
      required_documents: ['FAFSA', 'Proof of parent/guardian military service death'],
      notes_for_agent: 'Ineligible for Pell but eligible if parent died in Iraq/Afghanistan military service post-9/11.'
    },
    source_url: 'https://studentaid.gov/understand-aid/types/grants/iraq-afghanistan-service'
  },
]

// ─── FLORIDA STATE SCHOLARSHIPS ───────────────────────────────────────────────
const FLORIDA_SCHOLARSHIPS = [
  {
    scope: 'state' as const,
    name: 'Florida Bright Futures — Florida Academic Scholars (FAS)',
    description: 'Top-tier Bright Futures award. Covers 100% of tuition and fees at eligible Florida public colleges.',
    award_amount_min: 3000,
    award_amount_max: 10000,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'gpa_unweighted', operator: 'gte', value: 3.5 },
        { field: 'sat_score', operator: 'gte', value: 1290 },
        { field: 'community_service_hours', operator: 'gte', value: 100 },
        { field: 'degree_level', operator: 'in', value: ['associate', 'bachelor'] },
      ],
      required_documents: ['Florida residency proof', 'Official high school transcript', 'SAT/ACT scores', 'Community service verification'],
      notes_for_agent: 'ACT equivalent is 29. GPA must be from Florida-eligible high school. Community service logged through Florida Shines.'
    },
    source_url: 'https://www.floridastudentfinancialaidsg.org/SAPHome/SAPHome?url=home'
  },
  {
    scope: 'state' as const,
    name: 'Florida Bright Futures — Florida Medallion Scholars (FMS)',
    description: 'Mid-tier Bright Futures award. Covers 75% of tuition and fees at eligible Florida public colleges.',
    award_amount_min: 2000,
    award_amount_max: 7500,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'gpa_unweighted', operator: 'gte', value: 3.0 },
        { field: 'sat_score', operator: 'gte', value: 1170 },
        { field: 'community_service_hours', operator: 'gte', value: 75 },
        { field: 'degree_level', operator: 'in', value: ['associate', 'bachelor'] },
      ],
      required_documents: ['Florida residency proof', 'Official high school transcript', 'SAT/ACT scores', 'Community service verification'],
      notes_for_agent: 'ACT equivalent is 26. Student must not already qualify for FAS tier.'
    },
    source_url: 'https://www.floridastudentfinancialaidsg.org/SAPHome/SAPHome?url=home'
  },
  {
    scope: 'state' as const,
    name: 'Florida Bright Futures — Florida Gold Seal Vocational Scholars (GSV)',
    description: 'Bright Futures award for vocational/technical programs. Covers 75% of tuition and fees.',
    award_amount_min: 1500,
    award_amount_max: 5000,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'gpa_unweighted', operator: 'gte', value: 3.0 },
        { field: 'degree_level', operator: 'in', value: ['certificate'] },
        { field: 'community_service_hours', operator: 'gte', value: 30 },
      ],
      required_documents: ['Florida residency proof', 'Vocational program enrollment', 'Community service verification'],
      notes_for_agent: 'For career and technical education programs only. No SAT/ACT required.'
    },
    source_url: 'https://www.floridastudentfinancialaidsg.org/SAPHome/SAPHome?url=home'
  },
  {
    scope: 'state' as const,
    name: 'Florida Student Assistance Grant (FSAG) — Public',
    description: 'Need-based grant for Florida residents enrolled at eligible Florida public institutions.',
    award_amount_min: 200,
    award_amount_max: 2490,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
        { field: 'household_income_bracket', operator: 'lte', value: 'low' },
        { field: 'degree_level', operator: 'in', value: ['associate', 'bachelor'] },
      ],
      required_documents: ['FAFSA', 'Florida residency proof'],
      notes_for_agent: 'Campus-based; awards depend on available funds. Apply early via FAFSA.'
    },
    source_url: 'https://www.floridastudentfinancialaidsg.org/SAPHome/SAPHome?url=home'
  },
  {
    scope: 'state' as const,
    name: 'Florida Student Assistance Grant (FSAG) — Private',
    description: 'Need-based grant for Florida residents enrolled at eligible Florida private institutions.',
    award_amount_min: 200,
    award_amount_max: 2490,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
        { field: 'household_income_bracket', operator: 'lte', value: 'low' },
        { field: 'degree_level', operator: 'in', value: ['associate', 'bachelor'] },
      ],
      required_documents: ['FAFSA', 'Florida residency proof'],
      notes_for_agent: 'Only for eligible Florida private institutions. Verify institution eligibility.'
    },
    source_url: 'https://www.floridastudentfinancialaidsg.org/SAPHome/SAPHome?url=home'
  },
  {
    scope: 'state' as const,
    name: 'Florida Postsecondary Comprehensive Transition Program (FPTP)',
    description: 'For Florida residents with intellectual disabilities enrolled in FPTP-approved programs.',
    award_amount_min: 2000,
    award_amount_max: 8000,
    renewable: false,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'has_disability_documentation', operator: 'eq', value: true },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
      ],
      required_documents: ['FAFSA', 'Disability documentation', 'FPTP program enrollment verification'],
      notes_for_agent: 'Student must be enrolled in an FPTP-approved program at a Florida institution.'
    },
    source_url: 'https://www.floridastudentfinancialaidsg.org/SAPHome/SAPHome?url=home'
  },
  {
    scope: 'state' as const,
    name: 'Florida First Generation Matching Grant (FGMG)',
    description: 'For Florida residents who are first in their family to attend college. Matched by institution.',
    award_amount_min: 500,
    award_amount_max: 2800,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'is_first_generation', operator: 'eq', value: true },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
        { field: 'household_income_bracket', operator: 'lte', value: 'moderate' },
      ],
      required_documents: ['FAFSA', 'Florida residency proof', 'First-generation documentation'],
      notes_for_agent: 'Neither parent can have earned a bachelor\'s degree. Institution must have matching funds.'
    },
    source_url: 'https://www.floridastudentfinancialaidsg.org/SAPHome/SAPHome?url=home'
  },
  {
    scope: 'state' as const,
    name: 'Mary McLeod Bethune Scholarship (MMB)',
    description: 'Merit-based scholarship for minority Florida residents demonstrating financial need.',
    award_amount_min: 3000,
    award_amount_max: 3000,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'gpa_unweighted', operator: 'gte', value: 3.0 },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
        { field: 'household_income_bracket', operator: 'lte', value: 'moderate' },
        { field: 'degree_level', operator: 'in', value: ['associate', 'bachelor'] },
      ],
      required_documents: ['FAFSA', 'Florida residency proof', 'Official transcript', 'Minority status documentation'],
      notes_for_agent: 'Available at Bethune-Cookman, Edward Waters, Florida Memorial, St. Thomas University only.'
    },
    source_url: 'https://www.floridastudentfinancialaidsg.org/SAPHome/SAPHome?url=home'
  },
  {
    scope: 'state' as const,
    name: 'Rosewood Family Scholarship',
    description: 'For direct descendants of Rosewood, Florida families affected by the 1923 massacre.',
    award_amount_min: 4000,
    award_amount_max: 4000,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
      ],
      required_documents: ['FAFSA', 'Proof of Rosewood family descendancy', 'Florida residency'],
      notes_for_agent: 'Very niche program. Student must document Rosewood family lineage. Flag for manual review.'
    },
    source_url: 'https://www.floridastudentfinancialaidsg.org/SAPHome/SAPHome?url=home'
  },
  {
    scope: 'state' as const,
    name: 'Florida Farmworker Student Scholarship',
    description: 'For Florida students from migrant/seasonal farmworker families demonstrating need.',
    award_amount_min: 1500,
    award_amount_max: 1500,
    renewable: false,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
        { field: 'household_income_bracket', operator: 'lte', value: 'low' },
      ],
      required_documents: ['FAFSA', 'Farmworker family employment verification', 'Florida residency'],
      notes_for_agent: 'Student or parent must have worked as migrant/seasonal farmworker in past 12 months.'
    },
    source_url: 'https://www.floridastudentfinancialaidsg.org/SAPHome/SAPHome?url=home'
  },
]

// ─── UF INSTITUTIONAL SCHOLARSHIPS ───────────────────────────────────────────
const UF_SCHOLARSHIPS = [
  {
    scope: 'institutional' as const,
    name: 'UF Presidential Scholarship',
    description: 'UF\'s most prestigious merit scholarship for incoming freshmen with exceptional academic records.',
    award_amount_min: 12500,
    award_amount_max: 12500,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'gpa_unweighted', operator: 'gte', value: 3.9 },
        { field: 'sat_score', operator: 'gte', value: 1480 },
        { field: 'is_first_time_in_college', operator: 'eq', value: true },
        { field: 'degree_level', operator: 'in', value: ['bachelor'] },
        { field: 'community_service_hours', operator: 'gte', value: 50 },
      ],
      required_documents: ['Official transcript', 'SAT/ACT scores', 'Two recommendation letters', 'Personal essay'],
      notes_for_agent: 'ACT equivalent 34+. Highly competitive — flag if confidence < 0.9 for review.'
    }
  },
  {
    scope: 'institutional' as const,
    name: 'UF Machen Florida Opportunity Scholarship',
    description: 'For first-generation Florida residents with significant financial need enrolling at UF.',
    award_amount_min: 6200,
    award_amount_max: 6200,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'is_first_generation', operator: 'eq', value: true },
        { field: 'residency_state', operator: 'in', value: ['FL'] },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
        { field: 'household_income_bracket', operator: 'lte', value: 'low' },
        { field: 'degree_level', operator: 'in', value: ['bachelor'] },
      ],
      required_documents: ['FAFSA', 'Florida residency proof', 'First-generation documentation', 'Personal statement'],
      notes_for_agent: 'Specifically requires UF enrollment. Includes mentoring and living-learning community.'
    }
  },
  {
    scope: 'institutional' as const,
    name: 'UF Anderson Scholar Award',
    description: 'Merit-based scholarship for high-achieving undergraduates across all colleges at UF.',
    award_amount_min: 5000,
    award_amount_max: 10000,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'gpa_unweighted', operator: 'gte', value: 3.7 },
        { field: 'sat_score', operator: 'gte', value: 1350 },
        { field: 'degree_level', operator: 'in', value: ['bachelor'] },
      ],
      required_documents: ['Official transcript', 'SAT/ACT scores', 'One recommendation letter'],
      notes_for_agent: 'Renewable based on maintaining 3.5 GPA each semester.'
    }
  },
  {
    scope: 'institutional' as const,
    name: 'UF National Merit Scholarship',
    description: 'For National Merit Finalists who list UF as their first-choice institution.',
    award_amount_min: 2000,
    award_amount_max: 2000,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'is_national_merit_finalist', operator: 'eq', value: true },
        { field: 'degree_level', operator: 'in', value: ['bachelor'] },
        { field: 'is_first_time_in_college', operator: 'eq', value: true },
      ],
      required_documents: ['National Merit Finalist letter', 'NMSC application', 'Official transcript'],
      notes_for_agent: 'Student must designate UF as first-choice college to NMSC by required deadline.'
    }
  },
  {
    scope: 'institutional' as const,
    name: 'UF College of Engineering Dean\'s Scholarship',
    description: 'Merit scholarship for students admitted to UF College of Engineering.',
    award_amount_min: 3000,
    award_amount_max: 8000,
    renewable: true,
    criteria_schema: {
      match_logic: 'all',
      criteria: [
        { field: 'gpa_unweighted', operator: 'gte', value: 3.6 },
        { field: 'intended_major', operator: 'contains', value: 'engineering' },
        { field: 'degree_level', operator: 'in', value: ['bachelor'] },
      ],
      required_documents: ['Official transcript', 'CoE admission letter', 'Engineering essay'],
      notes_for_agent: 'Student must be admitted to the College of Engineering. Check intended_major for engineering keywords.'
    }
  },
]

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting scholarship seed...')

  // Upsert demo institution
  const { data: inst, error: instErr } = await supabase
    .from('institutions')
    .upsert({ ...UF_INSTITUTION }, { onConflict: 'slug' })
    .select('id')
    .single()

  if (instErr) throw instErr
  console.log(`✅ Institution: ${UF_INSTITUTION.name} (${inst.id})`)

  // Seed federal (no institution_id)
  for (const s of FEDERAL_SCHOLARSHIPS) {
    const { error } = await supabase
      .from('scholarships')
      .upsert({ ...s, institution_id: null, status: 'active' }, { onConflict: 'name' })
    if (error) console.error(`❌ ${s.name}:`, error.message)
    else console.log(`  ✅ Federal: ${s.name}`)
  }

  // Seed Florida state (no institution_id)
  for (const s of FLORIDA_SCHOLARSHIPS) {
    const { error } = await supabase
      .from('scholarships')
      .upsert({ ...s, institution_id: null, status: 'active' }, { onConflict: 'name' })
    if (error) console.error(`❌ ${s.name}:`, error.message)
    else console.log(`  ✅ Florida: ${s.name}`)
  }

  // Seed UF institutional
  for (const s of UF_SCHOLARSHIPS) {
    const { error } = await supabase
      .from('scholarships')
      .upsert({ ...s, institution_id: inst.id, status: 'active' }, { onConflict: 'name' })
    if (error) console.error(`❌ ${s.name}:`, error.message)
    else console.log(`  ✅ UF: ${s.name}`)
  }

  const total = FEDERAL_SCHOLARSHIPS.length + FLORIDA_SCHOLARSHIPS.length + UF_SCHOLARSHIPS.length
  console.log(`\n🎉 Seeded ${total} scholarships successfully.`)
}

seed().catch(console.error)
