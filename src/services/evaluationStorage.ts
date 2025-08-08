// composables/evaluationStorage.ts
import type { EvaluationSnapshot, Plot, CompetenceStatus, Student } from '@/models'

export function saveEvaluationToLocalStorage(key: string, snapshot: EvaluationSnapshot): void {
  localStorage.setItem(key, JSON.stringify(snapshot))
}

export function loadEvaluationSnapshotFromLocalStorage(key: string): EvaluationSnapshot | null {
  const raw = localStorage.getItem(key)

  if (!raw) return null
  try {
    return JSON.parse(raw) as EvaluationSnapshot
  } catch (err) {
    console.warn('Erreur de parsing du snapshot localStorage', err)
    return null
  }
}

// export function initializeSnapshotIfMissing(key: string, students: Student[], competences: Competence[]): void {
//   if (!localStorage.getItem(key)) {
//     const snapshot: EvaluationSnapshot = {
//       classeId: classId,
//       classeName: 'Classe inconnue',
//       students,
//       competences,
//       plots: []
//     }
//     localStorage.setItem(key, JSON.stringify(snapshot))
//   }
// }

export function deleteEvaluationFromLocalStorage(key: string): void {
  localStorage.removeItem(key)
}
