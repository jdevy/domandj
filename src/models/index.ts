export * from './konva'

export interface Student {
  id: number
  name: string
  x: number
  y: number
//  plotId: number | null
}

export interface Competence {
  id: number
  libelle_long: string
  libelle_court: string
  coeff: number
}

export interface Plot {
  id: number
  name: string
  x: number
  y: number
  students: number[]  // IDs des étudiants
  evaluations: Record<number, boolean | null>
}

export interface Session {
  id: string
  name: string
  className: string
  date: string
  plotGroups: Plot[]
  selectedCompetenceIds: number[]
}

export interface AppState {
  classes: Record<string, Student[]>
  competences: Competence[]
  sessions: Session[]
  currentSessionId: string | null
}
