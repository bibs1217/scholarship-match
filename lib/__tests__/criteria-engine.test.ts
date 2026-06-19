import { describe, it, expect } from 'vitest'
import { evaluateCriteria } from '../criteria-engine'
import type { CriteriaSchema, ApplicationForEval } from '../../types/scholarship-criteria'

const BASE_APP: ApplicationForEval = {
  gpa_unweighted: 3.5,
  gpa_weighted: 4.0,
  sat_score: 1300,
  act_score: 28,
  residency_state: 'FL',
  degree_level: 'bachelor',
  intended_major: 'Computer Science',
  household_income_bracket: 'moderate',
  is_first_generation: true,
  is_first_time_in_college: true,
  is_national_merit_finalist: false,
  is_veteran_or_dependent: false,
  has_disability_documentation: false,
  fafsa_on_file: true,
  ffaa_on_file: false,
  community_service_hours: 100,
  free_text_essay: 'I am passionate about education.'
}

describe('evaluateCriteria', () => {
  it('passes all criteria when all are met', () => {
    const schema: CriteriaSchema = {
      match_logic: 'all',
      criteria: [
        { field: 'gpa_unweighted', operator: 'gte', value: 3.0 },
        { field: 'residency_state', operator: 'in', value: ['FL', 'GA'] },
        { field: 'fafsa_on_file', operator: 'eq', value: true },
      ],
      required_documents: []
    }
    const result = evaluateCriteria(schema, BASE_APP)
    expect(result.passed).toBe(true)
    expect(result.perCriterionResults.every(r => r.passed)).toBe(true)
  })

  it('fails when one criterion is not met with match_logic=all', () => {
    const schema: CriteriaSchema = {
      match_logic: 'all',
      criteria: [
        { field: 'gpa_unweighted', operator: 'gte', value: 3.9 }, // fails: 3.5 < 3.9
        { field: 'fafsa_on_file', operator: 'eq', value: true },
      ],
      required_documents: []
    }
    const result = evaluateCriteria(schema, BASE_APP)
    expect(result.passed).toBe(false)
    expect(result.perCriterionResults[0].passed).toBe(false)
    expect(result.perCriterionResults[1].passed).toBe(true)
  })

  it('passes with match_logic=any when at least one criterion met', () => {
    const schema: CriteriaSchema = {
      match_logic: 'any',
      criteria: [
        { field: 'gpa_unweighted', operator: 'gte', value: 4.0 }, // fails
        { field: 'is_first_generation', operator: 'eq', value: true }, // passes
      ],
      required_documents: []
    }
    const result = evaluateCriteria(schema, BASE_APP)
    expect(result.passed).toBe(true)
  })

  it('fails with match_logic=any when no criteria met', () => {
    const schema: CriteriaSchema = {
      match_logic: 'any',
      criteria: [
        { field: 'gpa_unweighted', operator: 'gte', value: 4.0 }, // fails
        { field: 'is_national_merit_finalist', operator: 'eq', value: true }, // fails
      ],
      required_documents: []
    }
    const result = evaluateCriteria(schema, BASE_APP)
    expect(result.passed).toBe(false)
  })

  it('evaluates SAT score gte correctly', () => {
    const schema: CriteriaSchema = {
      match_logic: 'all',
      criteria: [{ field: 'sat_score', operator: 'gte', value: 1290 }],
      required_documents: []
    }
    expect(evaluateCriteria(schema, BASE_APP).passed).toBe(true)
    expect(evaluateCriteria(schema, { ...BASE_APP, sat_score: 1200 }).passed).toBe(false)
  })

  it('evaluates residency_state in array', () => {
    const schema: CriteriaSchema = {
      match_logic: 'all',
      criteria: [{ field: 'residency_state', operator: 'in', value: ['FL', 'TX'] }],
      required_documents: []
    }
    expect(evaluateCriteria(schema, BASE_APP).passed).toBe(true)
    expect(evaluateCriteria(schema, { ...BASE_APP, residency_state: 'CA' }).passed).toBe(false)
  })

  it('evaluates degree_level in array', () => {
    const schema: CriteriaSchema = {
      match_logic: 'all',
      criteria: [{ field: 'degree_level', operator: 'in', value: ['bachelor', 'master'] }],
      required_documents: []
    }
    expect(evaluateCriteria(schema, BASE_APP).passed).toBe(true)
    expect(evaluateCriteria(schema, { ...BASE_APP, degree_level: 'doctoral' }).passed).toBe(false)
  })

  it('evaluates household_income_bracket ordinal lte', () => {
    const schema: CriteriaSchema = {
      match_logic: 'all',
      criteria: [{ field: 'household_income_bracket', operator: 'lte', value: 'moderate' }],
      required_documents: []
    }
    expect(evaluateCriteria(schema, { ...BASE_APP, household_income_bracket: 'low' }).passed).toBe(true)
    expect(evaluateCriteria(schema, { ...BASE_APP, household_income_bracket: 'moderate' }).passed).toBe(true)
    expect(evaluateCriteria(schema, { ...BASE_APP, household_income_bracket: 'middle' }).passed).toBe(false)
  })

  it('evaluates community_service_hours gte', () => {
    const schema: CriteriaSchema = {
      match_logic: 'all',
      criteria: [{ field: 'community_service_hours', operator: 'gte', value: 75 }],
      required_documents: []
    }
    expect(evaluateCriteria(schema, BASE_APP).passed).toBe(true)
    expect(evaluateCriteria(schema, { ...BASE_APP, community_service_hours: 50 }).passed).toBe(false)
  })

  it('evaluates intended_major contains (case-insensitive)', () => {
    const schema: CriteriaSchema = {
      match_logic: 'all',
      criteria: [{ field: 'intended_major', operator: 'contains', value: 'engineering' }],
      required_documents: []
    }
    expect(evaluateCriteria(schema, { ...BASE_APP, intended_major: 'Mechanical Engineering' }).passed).toBe(true)
    expect(evaluateCriteria(schema, BASE_APP).passed).toBe(false)
  })

  it('handles null field gracefully (fails)', () => {
    const schema: CriteriaSchema = {
      match_logic: 'all',
      criteria: [{ field: 'sat_score', operator: 'gte', value: 1200 }],
      required_documents: []
    }
    expect(evaluateCriteria(schema, { ...BASE_APP, sat_score: null }).passed).toBe(false)
  })

  it('evaluates boolean eq for false value', () => {
    const schema: CriteriaSchema = {
      match_logic: 'all',
      criteria: [{ field: 'is_national_merit_finalist', operator: 'eq', value: true }],
      required_documents: []
    }
    expect(evaluateCriteria(schema, BASE_APP).passed).toBe(false)
    expect(evaluateCriteria(schema, { ...BASE_APP, is_national_merit_finalist: true }).passed).toBe(true)
  })
})
