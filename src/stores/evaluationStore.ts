// src/stores/evaluationStore.ts
import { reactive, watch } from 'vue'
import debounce from 'lodash.debounce'
import type { Student, Plot, Competence } from '@/models'
import classesData from '@/models/classData'
import competencesData from '@/models/competenceData'


// 1. Définition des interfaces (compatible avec ton code)
interface Session {
  id: string
  name: string
  className: string
  date: string
  plotGroups: Plot[]
  selectedCompetenceIds: number[]
}

interface AppState {
  classes: Record<string, Student[]>
  competences: Competence[]
  sessions: Session[]
  currentSessionId: string | null
}

// 2. État réactif
const state = reactive<AppState>({
  classes: {},
  competences: [],
  sessions: [],
  currentSessionId: null,
})

// Charger les données initiales depuis les fichiers JSON
function loadInitialData() {
  // Charger les compétences
  state.competences = competencesData

  // Charger les classes initiales
  Object.entries(classesData).forEach(([className, students]) => {
    state.classes[className] = students.map((student: any, index: number) => ({
      ...student,
      id: student.id || Date.now() + index, // S'assurer que chaque élève a un ID
      plotId: null,
      x: 0,
      y: 0
    }))
  })

  // Charger une séance par défaut si des classes existent
  const firstClassName = Object.keys(state.classes)[0]
  if (firstClassName) {
    createSession({
      name: `Séance initiale - ${firstClassName}`,
      className: firstClassName,
      selectedCompetenceIds: state.competences.map(c => c.id),
      date: new Date().toISOString().split('T')[0] // Add the date property
    })
  }
}

// Charger l'état sauvegardé ou les données initiales
function loadState() {
  const saved = localStorage.getItem('evaluationAppState')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // Fusionner les données sauvegardées avec les données initiales
      Object.assign(state, {
        ...parsed,
        // Garder les compétences initiales si aucune n'est sauvegardée
        competences: parsed.competences?.length ? parsed.competences : state.competences,
        // Fusionner les classes: garder les classes initiales + ajouter les nouvelles
        classes: { ...state.classes, ...parsed.classes }
      })
    } catch (e) {
      console.error("Erreur de chargement de l'état sauvegardé", e)
      loadInitialData() // Charger les données initiales en cas d'erreur
    }
  } else {
    loadInitialData() // Charger les données initiales si rien n'est sauvegardé
  }
}

// 4. Sauvegarde automatique
watch(
  state,
  debounce(() => {
    localStorage.setItem('evaluationAppState', JSON.stringify(state))
  }, 1000),
  { deep: true }
)

// 5. Méthodes pour les séances
function createSession(session: Omit<Session, 'id' | 'plotGroups'>) {
  const newSession: Session = {
    id: Date.now().toString(),
    ...session,
    date: new Date().toISOString().split('T')[0],
    plotGroups: [],
  }
  state.sessions.push(newSession)
  state.currentSessionId = newSession.id
  return newSession
}

function getCurrentSession() {
  return state.sessions.find(s => s.id === state.currentSessionId)
}

function setCurrentSession(sessionId: string) {
  state.currentSessionId = sessionId
}

// 6. Méthodes pour les plots (compatible avec KonvaBoard)
function addPlotToSession(plot: Omit<Plot, 'id'>) {
  const session = getCurrentSession()
  if (!session) throw new Error("Aucune séance active")

  const newPlot: Plot = {
    id: session.plotGroups.length > 0
      ? Math.max(...session.plotGroups.map(p => p.id)) + 1
      : 1,
    ...plot,
    evaluations: {},
  }
  session.plotGroups.push(newPlot)
  return newPlot
}

function updatePlot(plotId: number, updates: Partial<Plot>) {
  const session = getCurrentSession()
  if (!session) throw new Error("Aucune séance active")

  const plot = session.plotGroups.find(p => p.id === plotId)
  if (plot) Object.assign(plot, updates)
}

function resetStudentPositions(className: string) {
  if (!state.classes[className]) return

  state.classes[className] = state.classes[className].map((student, index) => ({
    ...student,
    x: 800, // Position X par défaut (à adapter)
    y: 50 + index * 40, // Position Y par défaut
    plotId: null
  }))
}

// 7. Initialisation
loadState()

// 8. Export pour les composants
export function useEvaluationStore() {
  return {
    state,
    getCurrentSession,
    setCurrentSession,
    addPlotToSession,
    updatePlot,
    createSession,
  }
}
