import type { CompetenceStatus } from "./competence"
import type { Plot } from "./plot"
import type { Student } from "./student"

export interface EvaluationSnapshot {
  classeId: string
  classeName: string
  students: Student[]
  competences: CompetenceStatus[]  // structure source (optionnel ici)
  plots: Plot[]  // contient tout : position, élèves, évaluations
}