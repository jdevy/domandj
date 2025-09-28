import type { Plot } from '@/models'
import { useEvaluationStore } from '@/stores/evaluationStore'

export function hasStudents(plot: Plot): boolean {
  // Un plot a des étudiants si son tableau students n'est pas vide
  // (plot.students est un tableau d'IDs d'étudiants)
  return plot.students.length > 0
}