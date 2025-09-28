import { Plot } from "./plot"

interface Session {
  id: string
  name: string
  className: string
  date: string
  selectedCompetenceIds: number[] // IDs des compétences évaluées
  plotGroups: Plot[] // Groupes d’élèves (plots) pour cette séance
}