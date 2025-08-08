import type { CompetenceStatus } from './competence'
import type { Student } from './student'

export interface Plot {
  id: number
  name: string
  x: number
  y: number

  // Liste des élèves affectés à ce plot
  students: Student[]

  // Statut de chaque compétence pour ce plot (≃ ancien EvaluationForm)
  competences: CompetenceStatus[]
}



