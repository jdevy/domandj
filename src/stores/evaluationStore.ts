// src/stores/evaluationStore.ts
import { reactive, watch } from 'vue'
import debounce from 'lodash.debounce'
import type { AppState, Student, Competence, Session, Plot } from '@/models'
import classesData from '@/models/classData'
import competencesData from '@/models/competenceData'


// État réactif
let state = reactive<AppState>({
  classes: {},
  competences: [],
  sessions: [],
  currentSessionId: null,
})

// Charger les données initiales depuis les fichiers JSON
function loadInitialData() {
  // Compétences
  state.competences = competencesData

  // Classes
  Object.entries(classesData).forEach(([className, students]) => {
    state.classes[className] = students.map((student: any, index: number) => ({
      ...student,
      id: student.id || Date.now() + index,
      x: 0,
      y: 0,
      plotId: null
    }))
  })
}

// Charger l'état sauvegardé ou les données initiales
function loadState() {
  const saved = localStorage.getItem('evaluationAppState')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // Fusionner avec les données initiales
      const newState = {
        ...state,
        ...parsed,
        classes: { ...state.classes, ...parsed.classes },
        competences: parsed.competences || state.competences
      };
      state = newState;
    } catch (e) {
      console.error("Erreur de chargement de l'état", e)
    }
  } else {
    loadInitialData()
  }
}

function saveState() {
  localStorage.setItem('evaluationAppState', JSON.stringify({
    classes: state.classes,
    competences: state.competences,
    sessions: state.sessions,
    currentSessionId: state.currentSessionId
  }))
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
// function createSession(session: Omit<Session, 'id' | 'plotGroups'>) {
//   const newSession: Session = {
//     id: Date.now().toString(),
//     ...session,
//     date: new Date().toISOString().split('T')[0],
//     plotGroups: [],
//   }
//   state.sessions.push(newSession)
//   state.currentSessionId = newSession.id
//   return newSession
// }

function createSession(sessionData: {
  name: string
  className: string
  selectedCompetenceIds: number[]
  date?: string
}) {
  const newSession: Session = {
    id: Date.now().toString(),
    name: sessionData.name,
    className: sessionData.className,
    date: sessionData.date || new Date().toISOString().split('T')[0],
    plotGroups: [],
    selectedCompetenceIds: sessionData.selectedCompetenceIds
  }

  state.sessions.push(newSession)
  state.currentSessionId = newSession.id
  return newSession
}
function isValidSession(session: Session): boolean {
  return !!session.name &&
    !!session.className &&
    state.classes[session.className] !== undefined
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
    loadInitialData,
    getCurrentSession,
    setCurrentSession,
    addPlotToSession,
    updatePlot,
    createSession,
    isValidSession
  }
}
