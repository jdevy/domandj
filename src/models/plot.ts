import type { Competence } from './competence'
import type { Student } from './student'

export interface Plot {
  id: number
  name: string
  x: number
  y: number

  // Liste des élèves affectés à ce plot
  students: number[]

  // Liste des compétences affectées à ce plot
  evaluations: Record<number, boolean | null> // { competenceId: statut }
}



