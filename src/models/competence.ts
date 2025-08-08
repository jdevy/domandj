export interface CompetenceStatus {
  id: string
  libelle_long: string
  libelle_court: string
  coeff: number
  statut: boolean | null  // évaluation: vrai, faux, ou non évalué
}